import { db, emailLog } from "@/db";
import crypto from "node:crypto";
import nodemailer, { type Transporter } from "nodemailer";

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
    this.from = from || process.env["EMAIL_FROM"] || "PAGE International <orders@page-bd.com>";
  }

  async send(
    payload: EmailPayload,
  ): Promise<{ success: boolean; messageId?: string | undefined; error?: string | undefined }> {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: this.from,
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
          reply_to: payload.replyTo,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        return { success: false, error: `Resend HTTP ${res.status}: ${errorText}` };
      }

      const data = (await res.json()) as { id?: string };
      return { success: true, messageId: data?.id || undefined };
    } catch (err: any) {
      return { success: false, error: err?.message || "Resend network error" };
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
    this.from =
      config.from || process.env["EMAIL_FROM"] || "PAGE International <no-reply@page-bd.com>";
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
    } catch (err: any) {
      return { success: false, error: err?.message || "SMTP dispatch error" };
    }
  }
}

// =============================================================================
// 4. PROVIDER FACTORY
// =============================================================================
let activeProvider: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (activeProvider) return activeProvider;

  // 1. Resend API
  const resendApiKey = process.env["RESEND_API_KEY"];
  if (resendApiKey && resendApiKey.trim().length > 0) {
    const provider: EmailProvider = new ResendEmailProvider(resendApiKey.trim());
    activeProvider = provider;
    return provider;
  }

  // 2. SMTP Transport
  const smtpHost = process.env["SMTP_HOST"];
  if (smtpHost && smtpHost.trim().length > 0) {
    const smtpPort = Number(process.env["SMTP_PORT"]) || 587;
    const smtpUser = process.env["SMTP_USER"];
    const smtpPass = process.env["SMTP_PASS"];
    const provider: EmailProvider = new SmtpEmailProvider({
      host: smtpHost.trim(),
      port: smtpPort,
      user: smtpUser?.trim() || undefined,
      pass: smtpPass?.trim() || undefined,
      secure: smtpPort === 465,
    });
    activeProvider = provider;
    return provider;
  }

  // 3. Fallback to Console
  const fallback: EmailProvider = new ConsoleEmailProvider();
  activeProvider = fallback;
  return fallback;
}

// =============================================================================
// 5. ASYNC TRANSACTIONAL DISPATCH & DATABASE LOGGING
// =============================================================================
export async function sendTransactionalEmail(payload: EmailPayload): Promise<{
  success: boolean;
  messageId?: string | undefined;
  error?: string | undefined;
}> {
  const logId = `email-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const provider = getEmailProvider();

  try {
    const result = await provider.send(payload);

    // Record in email_log table
    await db.insert(emailLog).values({
      id: logId,
      recipient: payload.to,
      subject: payload.subject,
      template: payload.template,
      status: result.success ? "SENT" : "FAILED",
      error: result.error || null,
      sentAt: result.success ? new Date() : null,
    });

    return result;
  } catch (err: any) {
    const errorMsg = err?.message || "Unexpected email dispatch failure";
    console.error(`[Email Error] Failed to send email to ${payload.to}:`, errorMsg);

    try {
      await db.insert(emailLog).values({
        id: logId,
        recipient: payload.to,
        subject: payload.subject,
        template: payload.template,
        status: "FAILED",
        error: errorMsg,
        sentAt: null,
      });
    } catch {
      // Non-blocking log persistence failure
    }

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
  <title>${title}</title>
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
      <p style="margin: 0 0 8px 0;"><strong>PAGE International Ltd.</strong> — Corporate Hub & Central Service Bay</p>
      <p style="margin: 0 0 8px 0;">Tejgaon I/A, Dhaka 1208, Bangladesh | Tel: +880 1713-000000 | Email: support@page-bd.com</p>
      <p style="margin: 0;">This is an automated operational notification. Please do not reply directly to this email unless directed.</p>
    </div>
  </div>
</body>
</html>`;
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
    <h2>Dear ${params.contactName},</h2>
    <p>Thank you for submitting a commercial quotation request to <strong>PAGE International Ltd.</strong> Our engineering and procurement team has logged your specification under reference <strong>${params.quoteNumber}</strong>.</p>
    <div class="card">
      <div class="card-title">Inquiry Specifications</div>
      <div class="detail-row"><span class="label">Reference ID:</span><span class="value" style="font-family: monospace; color: #fb7185;">${params.quoteNumber}</span></div>
      ${params.companyName ? `<div class="detail-row"><span class="label">Company:</span><span class="value">${params.companyName}</span></div>` : ""}
      <div class="detail-row"><span class="label">Equipment Requested:</span><span class="value">${params.productName}</span></div>
      <div class="detail-row"><span class="label">Quantity:</span><span class="value">${params.qty} Unit(s)</span></div>
    </div>
    <p>An authorized equipment specialist will review power availability, installation specifications, and issue an official quotation with commercial pricing within 24 business hours.</p>
  `;
  const text = `Dear ${params.contactName},\n\nThank you for submitting a commercial quotation request [${params.quoteNumber}] to PAGE International Ltd.\n\nCompany: ${params.companyName || "Commercial Client"}\nProduct: ${params.productName} (${params.qty} Units)\n\nOur team will contact you within 24 hours.`;
  return { html: baseEmailWrapper(`Quotation Received [${params.quoteNumber}]`, content), text };
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
    <h2>Dear ${params.contactName},</h2>
    <p>Your technical demonstration appointment has been reserved under booking reference <strong>${params.bookingNumber}</strong>.</p>
    <div class="card">
      <div class="card-title">Appointment Details</div>
      <div class="detail-row"><span class="label">Booking ID:</span><span class="value" style="font-family: monospace; color: #fb7185;">${params.bookingNumber}</span></div>
      ${params.companyName ? `<div class="detail-row"><span class="label">Workshop:</span><span class="value">${params.companyName}</span></div>` : ""}
      <div class="detail-row"><span class="label">Equipment / Service:</span><span class="value">${params.serviceType}</span></div>
      <div class="detail-row"><span class="label">Demonstration Center:</span><span class="value">${params.centerName}</span></div>
      <div class="detail-row"><span class="label">Date & Time:</span><span class="value">${params.bookingDate} (${params.timeSlot})</span></div>
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
    <h2>Dear ${params.customerName},</h2>
    <p>Your commercial procurement order <strong>${params.orderNumber}</strong> has been logged into our central distribution queue.</p>
    <div class="card">
      <div class="card-title">Order Summary</div>
      <div class="detail-row"><span class="label">Order Number:</span><span class="value" style="font-family: monospace; color: #fb7185;">${params.orderNumber}</span></div>
      ${params.companyName ? `<div class="detail-row"><span class="label">Enterprise:</span><span class="value">${params.companyName}</span></div>` : ""}
      <div class="detail-row"><span class="label">Line Items:</span><span class="value">${params.itemsCount} Product(s)</span></div>
      <div class="detail-row"><span class="label">Payment Terms:</span><span class="value">${params.paymentMethod}</span></div>
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
    <p>Hello ${params.name},</p>
    <p>We received a request to reset your password for your PAGE International customer portal account. Click the secure link below to proceed:</p>
    <p style="text-align: center;">
      <a href="${params.resetLink}" class="btn">Reset Portal Password</a>
    </p>
    <p style="font-size: 12px; color: #a1a1aa;">This single-use link is valid for <strong>${params.expiresInMinutes} minutes</strong>. If you did not request a password reset, you can safely ignore this email.</p>
  `;
  const text = `Hello ${params.name},\n\nPlease use the following link to reset your password:\n${params.resetLink}\n\nThis link expires in ${params.expiresInMinutes} minutes.\n\nPAGE International Ltd.`;
  return { html: baseEmailWrapper("Password Reset Request", content), text };
}
