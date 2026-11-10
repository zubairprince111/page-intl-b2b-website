import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ConsoleEmailProvider,
  ResendEmailProvider,
  getEmailProvider,
  renderQuoteOtpEmail,
  resetEmailProviderCache,
  sendTransactionalEmail,
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
    delete process.env["SMTP_USER"];
    delete process.env["SMTP_PASS"];
    delete process.env["SMTP_PASSWORD"];
    resetEmailProviderCache();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
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
});
