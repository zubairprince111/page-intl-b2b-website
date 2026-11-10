import dotenv from "dotenv";
import nodemailer from "nodemailer";
import fs from "node:fs";
import path from "node:path";

const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath, override: true, quiet: true });
}

const args = process.argv.slice(2);
let recipient = "";
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === "--to" && args[i + 1]) {
    recipient = args[i + 1].trim();
    i += 1;
  } else if (!args[i].startsWith("-")) {
    recipient = args[i].trim();
  }
}

const mailProvider = (process.env["MAIL_PROVIDER"] || "auto").trim().toLowerCase();
const host = (process.env["SMTP_HOST"] || "").trim();
const port = Number(process.env["SMTP_PORT"]) || 587;
const secureEnv = (process.env["SMTP_SECURE"] || "").trim().toLowerCase();
const secure = secureEnv ? secureEnv === "true" : port === 465;
const user = (process.env["SMTP_USER"] || "").trim();
const rawPass = (process.env["SMTP_PASS"] || process.env["SMTP_PASSWORD"] || "").trim();
const isGmail = /(^|\.)(gmail|googlemail)\.com$/i.test(host);
const pass = isGmail ? rawPass.replace(/\s+/g, "") : rawPass;

const configuredFrom = (process.env["EMAIL_FROM"] || process.env["MAIL_FROM"] || "").trim();
const from =
  configuredFrom && !configuredFrom.toLowerCase().includes("@resend.dev")
    ? configuredFrom
    : user.includes("@")
      ? `PAGE International <${user}>`
      : "PAGE International <no-reply@pageinternational.com>";

console.log("[SMTP Check] MAIL_PROVIDER:", mailProvider);
console.log("[SMTP Check] SMTP_HOST:", host || "(unset)");
console.log("[SMTP Check] SMTP_PORT:", port, "| secure:", secure);
console.log("[SMTP Check] SMTP_USER:", user || "(unset)");
console.log("[SMTP Check] SMTP_PASS:", pass ? `(set, ${pass.length} chars)` : "(unset)");
console.log("[SMTP Check] Resolved From:", from);

if (!host || !user || !pass) {
  console.error(
    "\n[SMTP Check] Missing SMTP credentials in .env. Please fill in SMTP_USER and SMTP_PASS (16-char Google App Password) and re-run: node scripts/test-smtp.mjs",
  );
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 15_000,
  auth: { user, pass },
});

try {
  await transporter.verify();
  console.log("\n[SMTP Check] Connection and authentication succeeded.");
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  const redacted = pass.length >= 6 ? msg.replaceAll(pass, "[REDACTED]") : msg;
  console.error(`\n[SMTP Check] Connection/authentication failed: ${redacted}`);
  process.exit(1);
}

if (recipient) {
  try {
    const info = await transporter.sendMail({
      from,
      to: recipient,
      subject: "PAGE International SMTP Test — Delivery Verified",
      text: "Your SMTP email configuration is working and ready to send Quotation Email OTPs.",
      html: "<p>Your <strong>PAGE International</strong> SMTP email configuration is working and ready to send Quotation Email OTPs.</p>",
    });
    console.log(`[SMTP Check] Test email sent to ${recipient} (messageId: ${info.messageId})`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const redacted = pass.length >= 6 ? msg.replaceAll(pass, "[REDACTED]") : msg;
    console.error(`[SMTP Check] Test email send failed: ${redacted}`);
    process.exit(1);
  }
} else {
  console.log(
    "Tip: pass a recipient email to send a real test message: node scripts/test-smtp.mjs your@email.com",
  );
}
