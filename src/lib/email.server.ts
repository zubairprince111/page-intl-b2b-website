import { db, emailLog } from "@/db";
import crypto from "node:crypto";
import nodemailer, { type Transporter } from "nodemailer";
import { ensureServerEnvLoaded } from "./env.server";

ensureServerEnvLoaded();

const DEFAULT_RESEND_FROM = "PAGE International <onboarding@resend.dev>";
const DEFAULT_SMTP_FROM = "PAGE International <no-reply@pageinternational.com>";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeEmailError(message: string): string {
  return message.replace(/re_[A-Za-z0-9_]{8,}/g, "[REDACTED_API_KEY]");
}

export function getConfiguredFromAddress(fallback = DEFAULT_RESEND_FROM): string {
  const configured = process.env["EMAIL_FROM"] || process.env["MAIL_FROM"];
  return configured && configured.trim().length > 0 ? configured.trim() : fallback;
}

export function isResendSandboxFrom(): boolean {
  const provider = getEmailProvider();
  if (provider.name !== "resend") {
    return false;
  }
  return getConfiguredFromAddress(DEFAULT_RESEND_FROM).toLowerCase().includes("@resend.dev");
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string | undefined;
  replyTo?: string | undefined;
  template: string;
}

export interface EmailProvider {
  name: string;
  send(
    payload: EmailPayload,
  ): Promise<{ success: boolean; messageId?: string | undefined; error?: string | undefined }>;
}

// =============================================================================
// 1. CONSOLE PROVIDER (Local Dev, Testing, Fallback)
// =============================================================================
export class ConsoleEmailProvider implements EmailProvider {
  name = "console";

  async send(
    payload: EmailPayload,
  ): Promise<{ success: boolean; messageId?: string | undefined; error?: string | undefined }> {
    const id = `console-${Date.now()}`;
    console.log(`\n================================================================`);
    console.log(`[TRANSACTIONAL EMAIL DISPATCH: ${payload.template}]`);
    console.log(`To: ${payload.to}`);
    console.log(`Subject: ${payload.subject}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`----------------------------------------------------------------`);
    console.log(payload.text || payload.html.replace(/<[^>]+>/g, " ").slice(0, 300) + "...");
    console.log(`================================================================\n`);
    return { success: true, messageId: id };
  }
}

// =============================================================================
// 2. RESEND PROVIDER (HTTP REST API)
// =============================================================================
export class ResendEmailProvider implements EmailProvider {
  name = "resend";
  private apiKey: string;
  private from: string;

  constructor(apiKey: string, from?: string | undefined) {
    this.apiKey = apiKey;
    this.from = from?.trim() || getConfiguredFromAddress(DEFAULT_RESEND_FROM);
  }

  async send(
    payload: EmailPayload,
  ): Promise<{ success: boolean; messageId?: string | undefined; error?: string | undefined }> {
    try {
      const requestBody: Record<string, unknown> = {
        from: this.from,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
      };
      if (payload.text) {
        requestBody["text"] = payload.text;
      }
      if (payload.replyTo) {
        requestBody["reply_to"] = payload.replyTo;
      }

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        const errorText = await res.text();
        let detail = errorText;
        try {
          const parsed = JSON.parse(errorText) as { message?: string; name?: string };
          detail = parsed.message || parsed.name || errorText;
        } catch {
          // Keep plain response body if not JSON
        }
        return {
          success: false,
          error: sanitizeEmailError(`Resend HTTP ${res.status}: ${detail || res.statusText}`),
        };
      }

      const data = (await res.json()) as { id?: string };
      return { success: true, messageId: data?.id || undefined };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Resend network error";
      return {
        success: false,
        error: sanitizeEmailError(msg),
      };
    }
  }
}

// =============================================================================
// 3. SMTP PROVIDER (Nodemailer)
// =============================================================================
export class SmtpEmailProvider implements EmailProvider {
  name = "smtp";
  private transporter: Transporter;
  private from: string;

  constructor(config: {
    host: string;
    port: number;
    user?: string | undefined;
    pass?: string | undefined;
    secure?: boolean | undefined;
    from?: string | undefined;
  }) {
    this.from = config.from?.trim() || getConfiguredFromAddress(DEFAULT_SMTP_FROM);
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure ?? config.port === 465,
      auth:
        config.user && config.pass
          ? {
              user: config.user,
              pass: config.pass,
            }
          : undefined,
    });
  }

  async send(
    payload: EmailPayload,
  ): Promise<{ success: boolean; messageId?: string | undefined; error?: string | undefined }> {
    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        replyTo: payload.replyTo,
      });
      return { success: true, messageId: info.messageId || undefined };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "SMTP dispatch error";
      return {
        success: false,
        error: sanitizeEmailError(msg),
      };
    }
  }
}

// =============================================================================
// 4. PROVIDER FACTORY
// =============================================================================
let activeProvider: EmailProvider | null = null;
let activeConfigSignature: string | null = null;

export function resetEmailProviderCache(): void {
  activeProvider = null;
  activeConfigSignature = null;
}

class MisconfiguredEmailProvider implements EmailProvider {
  name: string;
  private message: string;

  constructor(name: string, message: string) {
    this.name = name;
    this.message = message;
  }

  async send(): Promise<{
    success: boolean;
    messageId?: string | undefined;
    error?: string | undefined;
  }> {
    return { success: false, error: this.message };
  }
}

export function getEmailProvider(): EmailProvider {
  ensureServerEnvLoaded();

  const mailProvider = (process.env["MAIL_PROVIDER"] || "").trim().toLowerCase();
  const resendApiKey = (process.env["RESEND_API_KEY"] || "").trim();
  const emailFrom = (process.env["EMAIL_FROM"] || process.env["MAIL_FROM"] || "").trim();
  const smtpHost = (process.env["SMTP_HOST"] || "").trim();
  const smtpPort = Number(process.env["SMTP_PORT"]) || 587;
  const smtpSecureEnv = (process.env["SMTP_SECURE"] || "").trim().toLowerCase();
  const smtpSecure = smtpSecureEnv ? smtpSecureEnv === "true" : smtpPort === 465;
  const smtpUser = (process.env["SMTP_USER"] || "").trim();
  const smtpPass = (process.env["SMTP_PASS"] || process.env["SMTP_PASSWORD"] || "").trim();

  const signature = crypto
    .createHash("sha256")
    .update(
      JSON.stringify([
        mailProvider,
        resendApiKey,
        emailFrom,
        smtpHost,
        smtpPort,
        smtpSecure,
        smtpUser,
        smtpPass,
      ]),
    )
    .digest("hex");

  if (activeProvider && activeConfigSignature === signature) {
    return activeProvider;
  }

  const cache = (provider: EmailProvider): EmailProvider => {
    activeProvider = provider;
    activeConfigSignature = signature;
    return provider;
  };

  // Explicit console override
  if (mailProvider === "console") {
    return cache(new ConsoleEmailProvider());
  }

  // Explicit Resend selection
  if (mailProvider === "resend") {
    if (!resendApiKey) {
      return cache(
        new MisconfiguredEmailProvider(
          "resend",
          "MAIL_PROVIDER is set to 'resend', but RESEND_API_KEY is not configured.",
        ),
      );
    }
    return cache(new ResendEmailProvider(resendApiKey, emailFrom || undefined));
  }

  // Explicit SMTP selection
  if (mailProvider === "smtp") {
    if (!smtpHost) {
      return cache(
        new MisconfiguredEmailProvider(
          "smtp",
          "MAIL_PROVIDER is set to 'smtp', but SMTP_HOST is not configured.",
        ),
      );
    }
    return cache(
      new SmtpEmailProvider({
        host: smtpHost,
        port: smtpPort,
        user: smtpUser || undefined,
        pass: smtpPass || undefined,
        secure: smtpSecure,
        from: emailFrom || undefined,
      }),
    );
  }

  // Auto-detection (when MAIL_PROVIDER is unset or "auto"): Resend -> SMTP -> Console
  if (resendApiKey) {
    return cache(new ResendEmailProvider(resendApiKey, emailFrom || undefined));
  }

  if (smtpHost) {
    return cache(
      new SmtpEmailProvider({
        host: smtpHost,
        port: smtpPort,
        user: smtpUser || undefined,
        pass: smtpPass || undefined,
        secure: smtpSecure,
        from: emailFrom || undefined,
      }),
    );
  }

  return cache(new ConsoleEmailProvider());
}

// =============================================================================
// 5. ASYNC TRANSACTIONAL DISPATCH & DATABASE LOGGING
// =============================================================================
async function persistEmailLog(entry: {
  id: string;
  recipient: string;
  subject: string;
  template: string;
  status: "SENT" | "FAILED";
  error: string | null;
  sentAt: Date | null;
}): Promise<void> {
  try {
    await db.insert(emailLog).values(entry);
  } catch {
    // Non-blocking audit persistence failure must not invalidate a sent email
  }
}

export async function sendTransactionalEmail(payload: EmailPayload): Promise<{
  success: boolean;
  messageId?: string | undefined;
  error?: string | undefined;
}> {
  const logId = `email-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const provider = getEmailProvider();

  try {
    const result = await provider.send(payload);

    if (!result.success) {
      console.error(
        `[Email Error] Provider "${provider.name}" failed for ${payload.to} (${payload.template}):`,
        result.error || "Unknown error",
      );
    }

    await persistEmailLog({
      id: logId,
      recipient: payload.to,
      subject: payload.subject,
      template: payload.template,
      status: result.success ? "SENT" : "FAILED",
      error: result.error || null,
      sentAt: result.success ? new Date() : null,
    });

    return result;
  } catch (err: unknown) {
    const rawMsg = err instanceof Error ? err.message : "Unexpected email dispatch failure";
    const errorMsg = sanitizeEmailError(rawMsg);
    console.error(`[Email Error] Failed to send email to ${payload.to}:`, errorMsg);

    await persistEmailLog({
      id: logId,
      recipient: payload.to,
      subject: payload.subject,
      template: payload.template,
      status: "FAILED",
      error: errorMsg,
      sentAt: null,
    });

    return { success: false, error: errorMsg };
  }
}

// =============================================================================
// 6. BRANDED HTML EMAIL TEMPLATES
// =============================================================================

function baseEmailWrapper(title: string, contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f1012; margin: 0; padding: 0; color: #f4f4f5; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #18191c; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; margin-top: 32px; margin-bottom: 32px; }
    .header { background: #090a0b; padding: 28px 32px; border-bottom: 2px solid #e11d48; }
    .brand-title { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; margin: 0; }
    .brand-subtitle { font-size: 11px; font-family: monospace; color: #e11d48; text-transform: uppercase; letter-spacing: 0.12em; margin-top: 4px; }
    .body { padding: 32px; font-size: 14px; line-height: 1.6; color: #d4d4d8; }
    .body h2 { color: #ffffff; font-size: 18px; margin-top: 0; margin-bottom: 12px; }
    .pill { display: inline-block; padding: 4px 10px; background: rgba(225, 29, 72, 0.15); border: 1px solid rgba(225, 29, 72, 0.3); color: #fb7185; border-radius: 9999px; font-size: 11px; font-weight: 600; font-family: monospace; margin-bottom: 16px; }
    .card { background: #202226; border: 1px solid #2e3036; border-radius: 8px; padding: 18px; margin: 20px 0; }
    .card-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #a1a1aa; margin-bottom: 8px; font-weight: 700; }
    .detail-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #2e3036; font-size: 13px; }
    .detail-row:last-child { border-bottom: none; }
    .label { color: #71717a; }
    .value { color: #f4f4f5; font-weight: 600; text-align: right; }
    .btn { display: inline-block; background: #e11d48; color: #ffffff !important; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 13px; margin: 20px 0; }
    .footer { background: #090a0b; padding: 24px 32px; border-top: 1px solid #27272a; font-size: 11px; color: #71717a; line-height: 1.5; }
    .footer a { color: #a1a1aa; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="brand-title">PAGE International Ltd.</div>
      <div class="brand-subtitle">Commercial Workshop Engineering & Equipment</div>
    </div>
    <div class="body">
      ${contentHtml}
    </div>
    <div class="footer">
      <p style="margin: 0 0 8px 0;"><strong>PAGE International Ltd.</strong> — Corporate Office & Commercial Desk</p>
      <p style="margin: 0 0 8px 0;">Road #18, House # 100, Sector # 14, Uttara Model Town, Dhaka | Tel: +880 1755-502421 | Email: pageon18@gmail.com</p>
      <p style="margin: 0;">This is an automated operational notification. Please do not reply directly to this email unless directed.</p>
    </div>
  </div>
</body>
</html>`;
}

export function renderQuoteOtpEmail(params: {
  otp: string;
  email: string;
  companyName?: string | undefined;
  productName?: string | undefined;
  expiresInMinutes?: number | undefined;
}): { html: string; text: string } {
  const expiresIn = params.expiresInMinutes || 10;
  const content = `
    <div class="pill">QUOTATION VERIFICATION CODE</div>
    <h2>Email Verification Code</h2>
    <p>Please enter the following 6-digit one-time verification code to verify your email and confirm your commercial price quotation request:</p>
    <div style="text-align: center; margin: 28px 0;">
      <span style="display: inline-block; font-family: monospace; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #ffffff; background: #e11d48; padding: 14px 28px; border-radius: 8px; border: 1px solid #f43f5e; box-shadow: 0 4px 12px rgba(225, 29, 72, 0.35);">
        ${escapeHtml(params.otp)}
      </span>
    </div>
    <div class="card">
      <div class="card-title">Quotation Details</div>
      ${params.companyName ? `<div class="detail-row"><span class="label">Workshop / Company:</span><span class="value">${escapeHtml(params.companyName)}</span></div>` : ""}
      ${params.productName ? `<div class="detail-row"><span class="label">Equipment:</span><span class="value">${escapeHtml(params.productName)}</span></div>` : ""}
      <div class="detail-row"><span class="label">Code Expiry:</span><span class="value">${expiresIn} minutes</span></div>
    </div>
    <p style="font-size: 12px; color: #71717a;">No account registration or password is required. If you did not request a price quotation from PAGE International, you can safely disregard this email.</p>
  `;
  const text = `Your PAGE International quotation verification code is: ${params.otp}\n\nValid for ${expiresIn} minutes. No account creation or password required.\n\nPAGE International Ltd.`;
  return { html: baseEmailWrapper("Verification Code for Quotation", content), text };
}

export function renderQuoteConfirmationEmail(params: {
  quoteNumber: string;
  contactName: string;
  companyName?: string | undefined;
  productName: string;
  qty: number;
}): { html: string; text: string } {
  const content = `
    <div class="pill">QUOTATION INQUIRY RECEIVED</div>
    <h2>Dear ${escapeHtml(params.contactName)},</h2>
    <p>Thank you for submitting a commercial quotation request to <strong>PAGE International Ltd.</strong> Our engineering and procurement team has logged your specification under reference <strong>${escapeHtml(params.quoteNumber)}</strong>.</p>
    <div class="card">
      <div class="card-title">Inquiry Specifications</div>
      <div class="detail-row"><span class="label">Reference ID:</span><span class="value" style="font-family: monospace; color: #fb7185;">${escapeHtml(params.quoteNumber)}</span></div>
      ${params.companyName ? `<div class="detail-row"><span class="label">Company:</span><span class="value">${escapeHtml(params.companyName)}</span></div>` : ""}
      <div class="detail-row"><span class="label">Equipment Requested:</span><span class="value">${escapeHtml(params.productName)}</span></div>
      <div class="detail-row"><span class="label">Quantity:</span><span class="value">${params.qty} Unit(s)</span></div>
    </div>
    <p>An authorized equipment specialist will review power availability, installation specifications, and issue an official quotation with commercial pricing within 24 business hours.</p>
  `;
  const text = `Dear ${params.contactName},\n\nThank you for submitting a commercial quotation request [${params.quoteNumber}] to PAGE International Ltd.\n\nCompany: ${params.companyName || "Commercial Client"}\nProduct: ${params.productName} (${params.qty} Units)\n\nOur team will contact you within 24 hours.`;
  return { html: baseEmailWrapper(`Quotation Received [${params.quoteNumber}]`, content), text };
}

export function renderAdminQuoteNotificationEmail(params: {
  quoteNumber: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  productName: string;
  qty: number;
  city?: string | undefined;
  notes?: string | undefined;
  verifiedViaOtp?: boolean | undefined;
}): { html: string; text: string } {
  const verificationBadge = params.verifiedViaOtp
    ? "EMAIL OTP VERIFIED RFQ"
    : "NEW B2B QUOTATION REQUEST";
  const content = `
    <div class="pill">${verificationBadge}</div>
    <h2>New Quotation Request [${escapeHtml(params.quoteNumber)}]</h2>
    <p>A customer submitted a commercial quotation request through the PAGE International storefront.</p>
    <div class="card">
      <div class="card-title">Client & Request Details</div>
      <div class="detail-row"><span class="label">Reference ID:</span><span class="value" style="font-family: monospace; color: #fb7185;">${escapeHtml(params.quoteNumber)}</span></div>
      <div class="detail-row"><span class="label">Company / Workshop:</span><span class="value">${escapeHtml(params.companyName)}</span></div>
      <div class="detail-row"><span class="label">Contact Person:</span><span class="value">${escapeHtml(params.contactName)}</span></div>
      <div class="detail-row"><span class="label">Phone:</span><span class="value" style="font-family: monospace;">${escapeHtml(params.phone)}</span></div>
      <div class="detail-row"><span class="label">Email:</span><span class="value">${escapeHtml(params.email)}</span></div>
      ${params.city ? `<div class="detail-row"><span class="label">City:</span><span class="value">${escapeHtml(params.city)}</span></div>` : ""}
      <div class="detail-row"><span class="label">Equipment / Items:</span><span class="value">${escapeHtml(params.productName)}</span></div>
      <div class="detail-row"><span class="label">Total Units:</span><span class="value">${params.qty} Unit(s)</span></div>
      ${params.notes ? `<div class="detail-row"><span class="label">Notes:</span><span class="value">${escapeHtml(params.notes)}</span></div>` : ""}
    </div>
    <p>Open the Admin Quotations dashboard to configure pricing and respond to this inquiry.</p>
  `;
  const text = `New quotation request [${params.quoteNumber}] from ${params.companyName}\nContact: ${params.contactName}\nPhone: ${params.phone}\nEmail: ${params.email}\nEquipment: ${params.productName} (${params.qty} units)${params.notes ? `\nNotes: ${params.notes}` : ""}`;
  return {
    html: baseEmailWrapper(`New RFQ ${params.quoteNumber} — ${params.companyName}`, content),
    text,
  };
}

export function renderBookingConfirmationEmail(params: {
  bookingNumber: string;
  contactName: string;
  companyName?: string | undefined;
  serviceType: string;
  centerName: string;
  bookingDate: string;
  timeSlot: string;
}): { html: string; text: string } {
  const content = `
    <div class="pill">DEMONSTRATION BOOKING CONFIRMED</div>
    <h2>Dear ${escapeHtml(params.contactName)},</h2>
    <p>Your technical demonstration appointment has been reserved under booking reference <strong>${escapeHtml(params.bookingNumber)}</strong>.</p>
    <div class="card">
      <div class="card-title">Appointment Details</div>
      <div class="detail-row"><span class="label">Booking ID:</span><span class="value" style="font-family: monospace; color: #fb7185;">${escapeHtml(params.bookingNumber)}</span></div>
      ${params.companyName ? `<div class="detail-row"><span class="label">Workshop:</span><span class="value">${escapeHtml(params.companyName)}</span></div>` : ""}
      <div class="detail-row"><span class="label">Equipment / Service:</span><span class="value">${escapeHtml(params.serviceType)}</span></div>
      <div class="detail-row"><span class="label">Demonstration Center:</span><span class="value">${escapeHtml(params.centerName)}</span></div>
      <div class="detail-row"><span class="label">Date & Time:</span><span class="value">${escapeHtml(params.bookingDate)} (${escapeHtml(params.timeSlot)})</span></div>
    </div>
    <p>Our lead workshop engineer will welcome your technical team and conduct an operational live-load trial at the scheduled time.</p>
  `;
  const text = `Dear ${params.contactName},\n\nYour consultation booking [${params.bookingNumber}] has been reserved.\n\nCenter: ${params.centerName}\nService: ${params.serviceType}\nDate: ${params.bookingDate} (${params.timeSlot})\n\nPAGE International Ltd.`;
  return {
    html: baseEmailWrapper(`Booking Confirmation [${params.bookingNumber}]`, content),
    text,
  };
}

export function renderOrderConfirmationEmail(params: {
  orderNumber: string;
  customerName: string;
  companyName?: string | undefined;
  total: number;
  itemsCount: number;
  paymentMethod: string;
}): { html: string; text: string } {
  const content = `
    <div class="pill">COMMERCIAL ORDER CONFIRMATION</div>
    <h2>Dear ${escapeHtml(params.customerName)},</h2>
    <p>Your commercial procurement order <strong>${escapeHtml(params.orderNumber)}</strong> has been logged into our central distribution queue.</p>
    <div class="card">
      <div class="card-title">Order Summary</div>
      <div class="detail-row"><span class="label">Order Number:</span><span class="value" style="font-family: monospace; color: #fb7185;">${escapeHtml(params.orderNumber)}</span></div>
      ${params.companyName ? `<div class="detail-row"><span class="label">Enterprise:</span><span class="value">${escapeHtml(params.companyName)}</span></div>` : ""}
      <div class="detail-row"><span class="label">Line Items:</span><span class="value">${params.itemsCount} Product(s)</span></div>
      <div class="detail-row"><span class="label">Payment Terms:</span><span class="value">${escapeHtml(params.paymentMethod)}</span></div>
      <div class="detail-row"><span class="label">Total Amount:</span><span class="value" style="color: #10b981; font-size: 15px;">৳ ${params.total.toLocaleString("en-BD")}</span></div>
    </div>
    <p>Our dispatch division is preparing the shipment invoice. You can track this order status directly inside your customer portal.</p>
  `;
  const text = `Dear ${params.customerName},\n\nYour order ${params.orderNumber} has been received for a total of ৳ ${params.total.toLocaleString("en-BD")}.\n\nPayment: ${params.paymentMethod}\nItems: ${params.itemsCount}\n\nPAGE International Ltd.`;
  return { html: baseEmailWrapper(`Order Confirmation [${params.orderNumber}]`, content), text };
}

export function renderPasswordResetEmail(params: {
  name: string;
  resetLink: string;
  expiresInMinutes: number;
}): { html: string; text: string } {
  const content = `
    <div class="pill">ACCOUNT SECURITY NOTIFICATION</div>
    <h2>Password Reset Request</h2>
    <p>Hello ${escapeHtml(params.name)},</p>
    <p>We received a request to reset your password for your PAGE International customer portal account. Click the secure link below to proceed:</p>
    <p style="text-align: center;">
      <a href="${escapeHtml(params.resetLink)}" class="btn">Reset Portal Password</a>
    </p>
    <p style="font-size: 12px; color: #a1a1aa;">This single-use link is valid for <strong>${params.expiresInMinutes} minutes</strong>. If you did not request a password reset, you can safely ignore this email.</p>
  `;
  const text = `Hello ${params.name},\n\nPlease use the following link to reset your password:\n${params.resetLink}\n\nThis link expires in ${params.expiresInMinutes} minutes.\n\nPAGE International Ltd.`;
  return { html: baseEmailWrapper("Password Reset Request", content), text };
}
