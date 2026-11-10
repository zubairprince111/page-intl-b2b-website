import crypto from "node:crypto";
import { getClientIp } from "./auth.server";
import { checkRateLimit } from "./rate-limiter";
import { ensureServerEnvLoaded } from "./env.server";
import {
  sendTransactionalEmail,
  renderQuoteOtpEmail,
  getEmailProvider,
  isResendSandboxFrom,
} from "./email.server";
import { createQuoteCore, type CreateQuoteInput } from "./data.server";

interface StoredOtp {
  otp: string;
  expiresAt: number;
  attempts: number;
  email: string;
  companyName?: string | undefined;
}

const globalForOtp = globalThis as unknown as {
  __pageQuoteOtpStore?: Map<string, StoredOtp>;
  __pageQuoteOtpCleanupStarted?: boolean;
};

// Shared-across-SSR-reloads sliding-window store for active quotation OTP codes
const quoteOtpStore =
  globalForOtp.__pageQuoteOtpStore ??
  (globalForOtp.__pageQuoteOtpStore = new Map<string, StoredOtp>());

// Periodic cleanup of expired OTPs every 5 minutes
if (!globalForOtp.__pageQuoteOtpCleanupStarted && typeof setInterval !== "undefined") {
  globalForOtp.__pageQuoteOtpCleanupStarted = true;
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, value] of quoteOtpStore.entries()) {
        if (value.expiresAt < now) {
          quoteOtpStore.delete(key);
        }
      }
    },
    5 * 60 * 1000,
  ).unref?.();
}

/**
 * Determines whether public quotation submissions require Email OTP verification.
 * Controlled via `REQUIRE_QUOTE_EMAIL_OTP`:
 * - "true"  => always require Email OTP
 * - "false" => direct RFQ submission without Email OTP
 * - "auto" (default) => require Email OTP only when real external email delivery
 *   is configured (SMTP or Resend with a verified custom sender domain, not @resend.dev).
 */
export function isQuoteEmailOtpRequired(): boolean {
  ensureServerEnvLoaded();
  const mode = (process.env["REQUIRE_QUOTE_EMAIL_OTP"] || "auto").trim().toLowerCase();

  if (["true", "1", "yes", "on"].includes(mode)) {
    return true;
  }
  if (["false", "0", "no", "off"].includes(mode)) {
    return false;
  }

  const provider = getEmailProvider();
  if (provider.name === "smtp") {
    return true;
  }
  if (provider.name === "resend") {
    return !isResendSandboxFrom();
  }
  return false;
}

/**
 * Sends a 6-digit One-Time Password (OTP) to the client's email for quotation verification.
 * No account creation or password required.
 */
export async function sendQuoteOtpCore(input: {
  email: string;
  companyName?: string | undefined;
  productName?: string | undefined;
}): Promise<{ success: boolean; message: string; debugCode?: string | undefined }> {
  const ip = getClientIp();
  const normalizedEmail = input.email.trim().toLowerCase();

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    throw new Error("Please provide a valid business email address.");
  }

  // Rate limiting: 8 requests per minute per IP, 4 requests per 5 minutes per email
  const ipCheck = checkRateLimit(`quote-otp-ip:${ip}`, 8, 60);
  if (!ipCheck.allowed) {
    throw new Error(
      `Too many verification requests from your network. Please wait ${ipCheck.resetInSeconds} seconds.`,
    );
  }

  const emailCheck = checkRateLimit(`quote-otp-email:${normalizedEmail}`, 4, 300);
  if (!emailCheck.allowed) {
    throw new Error(
      `A verification code was recently sent to this email. Please check your inbox or wait ${emailCheck.resetInSeconds} seconds before requesting another code.`,
    );
  }

  // Generate cryptographic 6-digit OTP (100000 - 999999 inclusive)
  const otp = crypto.randomInt(100000, 1000000).toString();
  const expiresInMinutes = 10;
  const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;

  quoteOtpStore.set(normalizedEmail, {
    otp,
    expiresAt,
    attempts: 0,
    email: normalizedEmail,
    companyName: input.companyName,
  });

  // Log in non-production for local developer & test visibility
  if (process.env["NODE_ENV"] !== "production") {
    console.log(`\n[QUOTATION EMAIL OTP] ---------------------------------`);
    console.log(`To: ${normalizedEmail}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Expires in: ${expiresInMinutes} minutes`);
    console.log(`--------------------------------------------------------\n`);
  }

  // Dispatch branded transactional email
  const emailContent = renderQuoteOtpEmail({
    otp,
    email: normalizedEmail,
    companyName: input.companyName,
    productName: input.productName,
    expiresInMinutes,
  });

  const emailResult = await sendTransactionalEmail({
    to: normalizedEmail,
    subject: `Your Verification Code: ${otp} — PAGE International`,
    template: "quote_otp",
    html: emailContent.html,
    text: emailContent.text,
  });

  if (!emailResult.success) {
    quoteOtpStore.delete(normalizedEmail);
    const errorDetail = emailResult.error || "Unknown mail delivery error";
    console.error(`[QUOTATION EMAIL OTP] Dispatch failed for ${normalizedEmail}: ${errorDetail}`);
    const devHint = process.env["NODE_ENV"] !== "production" ? ` (${errorDetail})` : "";
    throw new Error(
      `Unable to deliver verification email. Please verify your email address or mail configuration and try again.${devHint}`,
    );
  }

  return {
    success: true,
    message: `A 6-digit verification code has been sent to ${normalizedEmail}.`,
    debugCode: process.env["NODE_ENV"] !== "production" ? otp : undefined,
  };
}

/**
 * Verifies the 6-digit OTP code for a given email address.
 */
export function verifyQuoteOtpCore(email: string, otp: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  const stored = quoteOtpStore.get(normalizedEmail);

  if (!stored) {
    throw new Error("No active verification code found for this email. Please request a new code.");
  }

  if (Date.now() > stored.expiresAt) {
    quoteOtpStore.delete(normalizedEmail);
    throw new Error("Verification code has expired. Please request a new code.");
  }

  if (stored.attempts >= 5) {
    quoteOtpStore.delete(normalizedEmail);
    throw new Error("Too many incorrect verification attempts. Please request a new code.");
  }

  if (stored.otp !== otp.trim()) {
    stored.attempts += 1;
    const remaining = 5 - stored.attempts;
    throw new Error(
      `Incorrect verification code. Please check your email and try again (${remaining} attempt${remaining === 1 ? "" : "s"} left).`,
    );
  }

  // OTP is valid - consume it immediately
  quoteOtpStore.delete(normalizedEmail);
  return true;
}

/**
 * Combined verification and quotation creation:
 * Verifies email OTP and immediately logs the quotation in PostgreSQL.
 */
export async function verifyQuoteOtpAndCreateCore(
  data: CreateQuoteInput & { otp: string },
): Promise<{ success: boolean; quoteNumber: string; id?: string | undefined }> {
  // 1. Verify OTP first
  verifyQuoteOtpCore(data.email, data.otp);

  // 2. Submit quotation to PostgreSQL (userId is null, email is verified!)
  const result = await createQuoteCore({ ...data, verifiedViaOtp: true });

  return {
    success: true,
    quoteNumber: result.quoteNumber,
    id: result.quote?.id || undefined,
  };
}
