import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import nodemailer from "nodemailer";
import {
  ConsoleEmailProvider,
  ResendEmailProvider,
  SmtpEmailProvider,
  getEmailProvider,
  isEmailProviderReady,
  isResendSandboxFrom,
  renderAdminQuoteNotificationEmail,
  renderQuoteOtpEmail,
  resetEmailProviderCache,
  resolveSmtpFromAddress,
  sendTransactionalEmail,
  verifyEmailTransport,
} from "@/lib/email.server";

const { insertValuesMock } = vi.hoisted(() => ({
  insertValuesMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/db", async () => {
  const schema = await import("../db/schema");
  return {
    ...schema,
    isPostgres: false,
    rawClient: null,
    db: {
      insert: vi.fn(() => ({
        values: insertValuesMock,
      })),
    },
  };
});

describe("Resend Email Provider & Transactional Dispatch", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    insertValuesMock.mockReset();
    insertValuesMock.mockResolvedValue(undefined);
    delete process.env["MAIL_PROVIDER"];
    delete process.env["RESEND_API_KEY"];
    delete process.env["EMAIL_FROM"];
    delete process.env["MAIL_FROM"];
    delete process.env["SMTP_HOST"];
    delete process.env["SMTP_PORT"];
    delete process.env["SMTP_SECURE"];
    delete process.env["SMTP_USER"];
    delete process.env["SMTP_PASS"];
    delete process.env["SMTP_PASSWORD"];
    resetEmailProviderCache();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    resetEmailProviderCache();
  });

  it("falls back to ConsoleEmailProvider when no mail credentials are configured", () => {
    const provider = getEmailProvider();
    expect(provider).toBeInstanceOf(ConsoleEmailProvider);
    expect(provider.name).toBe("console");
  });

  it("auto-selects ResendEmailProvider when RESEND_API_KEY is present", () => {
    process.env["RESEND_API_KEY"] = "re_test_1234567890";
    const provider = getEmailProvider();
    expect(provider).toBeInstanceOf(ResendEmailProvider);
    expect(provider.name).toBe("resend");
  });

  it("respects explicit MAIL_PROVIDER=console override even when RESEND_API_KEY is set", () => {
    process.env["RESEND_API_KEY"] = "re_test_1234567890";
    process.env["MAIL_PROVIDER"] = "console";
    const provider = getEmailProvider();
    expect(provider).toBeInstanceOf(ConsoleEmailProvider);
  });

  it("returns clear configuration error when MAIL_PROVIDER=resend without RESEND_API_KEY", async () => {
    process.env["MAIL_PROVIDER"] = "resend";
    const result = await sendTransactionalEmail({
      to: "buyer@workshop.com",
      subject: "Test",
      html: "<p>Hello</p>",
      template: "test",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("RESEND_API_KEY");
    expect(insertValuesMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: "FAILED", recipient: "buyer@workshop.com" }),
    );
  });

  it("posts formatted payload to Resend REST API with MAIL_FROM fallback and logs SENT", async () => {
    process.env["MAIL_PROVIDER"] = "auto";
    process.env["RESEND_API_KEY"] = "re_live_example_secret";
    process.env["MAIL_FROM"] = "PAGE International <no-reply@page-asia.com>";

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "email_resend_abc123" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendTransactionalEmail({
      to: "procurement@client.com",
      subject: "Your Verification Code: 482910 — PAGE International",
      html: "<p>Code: 482910</p>",
      text: "Code: 482910",
      replyTo: "pageon18@gmail.com",
      template: "quote_otp",
    });

    expect(result).toEqual({ success: true, messageId: "email_resend_abc123" });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({
      Authorization: "Bearer re_live_example_secret",
      "Content-Type": "application/json",
    });

    const parsedBody = JSON.parse(String(init.body));
    expect(parsedBody).toEqual({
      from: "PAGE International <no-reply@page-asia.com>",
      to: ["procurement@client.com"],
      subject: "Your Verification Code: 482910 — PAGE International",
      html: "<p>Code: 482910</p>",
      text: "Code: 482910",
      reply_to: "pageon18@gmail.com",
    });

    expect(insertValuesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        recipient: "procurement@client.com",
        template: "quote_otp",
        status: "SENT",
        error: null,
      }),
    );
  });

  it("extracts Resend error details, redacts API keys, and handles network failures cleanly", async () => {
    process.env["RESEND_API_KEY"] = "re_secret_should_never_leak";
    process.env["EMAIL_FROM"] = "PAGE International <onboarding@resend.dev>";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ message: "API key is invalid: re_secret_should_never_leak" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          },
        ),
      ),
    );

    const authFailure = await sendTransactionalEmail({
      to: "client@example.com",
      subject: "OTP",
      html: "<p>OTP</p>",
      template: "quote_otp",
    });

    expect(authFailure.success).toBe(false);
    expect(authFailure.error).toContain("Resend HTTP 401");
    expect(authFailure.error).not.toContain("re_secret_should_never_leak");
    expect(authFailure.error).toContain("[REDACTED_API_KEY]");

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("connect ETIMEDOUT")));
    const networkFailure = await sendTransactionalEmail({
      to: "client@example.com",
      subject: "OTP",
      html: "<p>OTP</p>",
      template: "quote_otp",
    });

    expect(networkFailure.success).toBe(false);
    expect(networkFailure.error).toContain("ETIMEDOUT");
  });

  it("still returns success when Resend succeeds even if emailLog persistence throws", async () => {
    process.env["RESEND_API_KEY"] = "re_test_valid_key";
    insertValuesMock.mockRejectedValueOnce(new Error("DB connection busy"));

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: "email_ok_999" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const result = await sendTransactionalEmail({
      to: "buyer@example.com",
      subject: "OTP",
      html: "<p>Code</p>",
      template: "quote_otp",
    });

    expect(result).toEqual({ success: true, messageId: "email_ok_999" });
  });

  it("escapes user-supplied HTML in rendered OTP emails", () => {
    const { html, text } = renderQuoteOtpEmail({
      otp: "654321",
      email: "user@example.com",
      companyName: '<script>alert("xss")</script> Motors',
      productName: '2-Post Lift & "Pro" Kit',
    });

    expect(html).toContain("654321");
    expect(html).toContain("&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; Motors");
    expect(html).toContain("2-Post Lift &amp; &quot;Pro&quot; Kit");
    expect(html).not.toContain("<script>");
    expect(text).toContain("654321");
  });

  it("detects Resend @resend.dev sandbox sender vs verified custom domain", () => {
    expect(isResendSandboxFrom()).toBe(false);

    process.env["RESEND_API_KEY"] = "re_test_123";
    process.env["EMAIL_FROM"] = "PAGE International <onboarding@resend.dev>";
    resetEmailProviderCache();
    expect(isResendSandboxFrom()).toBe(true);

    process.env["EMAIL_FROM"] = "PAGE International <sales@pageinternational.com>";
    resetEmailProviderCache();
    expect(isResendSandboxFrom()).toBe(false);
  });

  it("renders admin quote notification email with XSS escaping", () => {
    const directMail = renderAdminQuoteNotificationEmail({
      quoteNumber: "RFQ-2026-8841",
      companyName: '<img src=x onerror="alert(1)"> Workshop',
      contactName: "Kamrul Hasan",
      phone: "+8801711000000",
      email: "kamrul@example.com",
      productName: "2-Post Lift & Alignment Kit",
      qty: 3,
      city: "Dhaka",
      notes: "Deliver <script>alert(1)</script> ASAP",
      verifiedViaOtp: false,
    });

    expect(directMail.html).toContain("NEW B2B QUOTATION REQUEST");
    expect(directMail.html).toContain("RFQ-2026-8841");
    expect(directMail.html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt; Workshop");
    expect(directMail.html).not.toContain("<script>");
    expect(directMail.text).toContain("RFQ-2026-8841");

    const otpMail = renderAdminQuoteNotificationEmail({
      quoteNumber: "RFQ-2026-8842",
      companyName: "Apex Motors",
      contactName: "Rafiq",
      phone: "+8801811000000",
      email: "rafiq@apex.bd",
      productName: "Wheel Balancer",
      qty: 1,
      verifiedViaOtp: true,
    });
    expect(otpMail.html).toContain("EMAIL OTP VERIFIED RFQ");
  });
});

describe("SMTP & Gmail App Password Provider", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    insertValuesMock.mockReset();
    insertValuesMock.mockResolvedValue(undefined);
    delete process.env["MAIL_PROVIDER"];
    delete process.env["RESEND_API_KEY"];
    delete process.env["EMAIL_FROM"];
    delete process.env["MAIL_FROM"];
    delete process.env["SMTP_HOST"];
    delete process.env["SMTP_PORT"];
    delete process.env["SMTP_SECURE"];
    delete process.env["SMTP_USER"];
    delete process.env["SMTP_PASS"];
    delete process.env["SMTP_PASSWORD"];
    resetEmailProviderCache();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
    resetEmailProviderCache();
  });

  it("treats Gmail SMTP without credentials or with placeholders as misconfigured/not-ready", async () => {
    process.env["MAIL_PROVIDER"] = "smtp";
    process.env["SMTP_HOST"] = "smtp.gmail.com";
    process.env["SMTP_PORT"] = "587";

    expect(isEmailProviderReady()).toBe(false);
    const missingResult = await sendTransactionalEmail({
      to: "buyer@workshop.bd",
      subject: "OTP",
      html: "<p>Code</p>",
      template: "quote_otp",
    });
    expect(missingResult.success).toBe(false);
    expect(missingResult.error).toContain("requires valid SMTP_USER and SMTP_PASS");

    process.env["SMTP_USER"] = "your-gmail@gmail.com";
    process.env["SMTP_PASS"] = "your-app-password";
    resetEmailProviderCache();
    expect(isEmailProviderReady()).toBe(false);

    const verifyRes = await verifyEmailTransport();
    expect(verifyRes.ok).toBe(false);
    expect(verifyRes.provider).toBe("smtp");
  });

  it("strips spaces from Gmail App Passwords and replaces leftover @resend.dev sender", async () => {
    const sendMailMock = vi.fn().mockResolvedValue({ messageId: "<gmail-msg-1@smtp.gmail.com>" });
    const verifyMock = vi.fn().mockResolvedValue(true);
    const createTransportSpy = vi.spyOn(nodemailer, "createTransport").mockReturnValue({
      sendMail: sendMailMock,
      verify: verifyMock,
    } as unknown as ReturnType<typeof nodemailer.createTransport>);

    process.env["MAIL_PROVIDER"] = "smtp";
    process.env["SMTP_HOST"] = "smtp.gmail.com";
    process.env["SMTP_PORT"] = "587";
    process.env["SMTP_USER"] = "pageon18@gmail.com";
    process.env["SMTP_PASS"] = "abcd efgh ijkl mnop";
    process.env["EMAIL_FROM"] = "PAGE International <onboarding@resend.dev>";
    resetEmailProviderCache();

    const provider = getEmailProvider();
    expect(provider).toBeInstanceOf(SmtpEmailProvider);
    expect(isEmailProviderReady(provider)).toBe(true);
    expect(createTransportSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        auth: {
          user: "pageon18@gmail.com",
          pass: "abcdefghijklmnop",
        },
      }),
    );

    const transportCheck = await verifyEmailTransport();
    expect(transportCheck).toEqual({
      ok: true,
      provider: "smtp",
      from: "PAGE International <pageon18@gmail.com>",
      error: undefined,
    });

    const result = await sendTransactionalEmail({
      to: "external-buyer@company.com",
      subject: "Your Verification Code: 739102 — PAGE International",
      html: "<p>739102</p>",
      text: "739102",
      template: "quote_otp",
    });

    expect(result).toEqual({ success: true, messageId: "<gmail-msg-1@smtp.gmail.com>" });
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "PAGE International <pageon18@gmail.com>",
        to: "external-buyer@company.com",
      }),
    );
  });

  it("redacts leaked SMTP_PASS strings in Nodemailer failure messages", async () => {
    vi.spyOn(nodemailer, "createTransport").mockReturnValue({
      sendMail: vi.fn().mockRejectedValue(new Error("Auth failed using wxyz1234abcd5678")),
      verify: vi.fn(),
    } as unknown as ReturnType<typeof nodemailer.createTransport>);

    process.env["MAIL_PROVIDER"] = "smtp";
    process.env["SMTP_HOST"] = "smtp.gmail.com";
    process.env["SMTP_USER"] = "pageon18@gmail.com";
    process.env["SMTP_PASS"] = "wxyz 1234 abcd 5678";
    resetEmailProviderCache();

    const result = await sendTransactionalEmail({
      to: "buyer@example.com",
      subject: "OTP",
      html: "<p>123456</p>",
      template: "quote_otp",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("[REDACTED_SMTP_PASS]");
    expect(result.error).not.toContain("wxyz1234abcd5678");
  });

  it("prefers working SMTP over @resend.dev sandbox in auto mode while keeping verified Resend first", () => {
    vi.spyOn(nodemailer, "createTransport").mockReturnValue({
      sendMail: vi.fn(),
      verify: vi.fn(),
    } as unknown as ReturnType<typeof nodemailer.createTransport>);

    process.env["MAIL_PROVIDER"] = "auto";
    process.env["RESEND_API_KEY"] = "re_test_sandbox_123";
    process.env["EMAIL_FROM"] = "PAGE International <onboarding@resend.dev>";
    process.env["SMTP_HOST"] = "smtp.gmail.com";
    process.env["SMTP_USER"] = "pageon18@gmail.com";
    process.env["SMTP_PASS"] = "abcd efgh ijkl mnop";
    resetEmailProviderCache();

    expect(getEmailProvider()).toBeInstanceOf(SmtpEmailProvider);

    process.env["EMAIL_FROM"] = "PAGE International <sales@pageinternational.com>";
    resetEmailProviderCache();

    expect(getEmailProvider()).toBeInstanceOf(ResendEmailProvider);
  });

  it("resolves SMTP sender safely when EMAIL_FROM is empty or @resend.dev", () => {
    expect(resolveSmtpFromAddress("", "pageon18@gmail.com")).toBe(
      "PAGE International <pageon18@gmail.com>",
    );
    expect(
      resolveSmtpFromAddress("PAGE International <onboarding@resend.dev>", "pageon18@gmail.com"),
    ).toBe("PAGE International <pageon18@gmail.com>");
    expect(
      resolveSmtpFromAddress("PAGE International <quotes@page-asia.com>", "pageon18@gmail.com"),
    ).toBe("PAGE International <quotes@page-asia.com>");
  });
});
