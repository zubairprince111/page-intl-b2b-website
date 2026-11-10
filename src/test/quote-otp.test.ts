import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetEmailProviderCache } from "@/lib/email.server";
import { isQuoteEmailOtpRequired, sendQuoteOtpCore, verifyQuoteOtpCore } from "@/lib/otp.server";

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

describe("Quotation Email OTP Verification System", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    insertValuesMock.mockReset();
    insertValuesMock.mockResolvedValue(undefined);
    delete process.env["RESEND_API_KEY"];
    delete process.env["MAIL_PROVIDER"];
    delete process.env["EMAIL_FROM"];
    delete process.env["MAIL_FROM"];
    delete process.env["SMTP_HOST"];
    delete process.env["REQUIRE_QUOTE_EMAIL_OTP"];
    resetEmailProviderCache();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
    resetEmailProviderCache();
  });

  it("rejects invalid email formats", async () => {
    await expect(
      sendQuoteOtpCore({
        email: "not-an-email",
        companyName: "Test Workshop",
      }),
    ).rejects.toThrow("valid business email");
  });

  it("generates a 6-digit OTP and verifies it successfully without account creation", async () => {
    const testEmail = "test-workshop@page-demo.bd";

    // 1. Send OTP
    const res = await sendQuoteOtpCore({
      email: testEmail,
      companyName: "Apex Motors Ltd.",
      productName: "Heavy-Duty 2-Post Lift 4.0T",
    });

    expect(res.success).toBe(true);
    expect(res.debugCode).toBeDefined();
    expect(res.debugCode).toMatch(/^\d{6}$/);
    expect(insertValuesMock).toHaveBeenCalledTimes(1);

    const otpCode = res.debugCode!;

    // 2. Reject incorrect OTP
    expect(() => {
      verifyQuoteOtpCore(testEmail, "000000");
    }).toThrow("Incorrect verification code");

    // 3. Accept genuine OTP
    const isVerified = verifyQuoteOtpCore(testEmail, otpCode);
    expect(isVerified).toBe(true);

    // 4. Single-use: OTP cannot be re-used once consumed
    expect(() => {
      verifyQuoteOtpCore(testEmail, otpCode);
    }).toThrow("No active verification code found");
  });

  it("rejects verification for an email that never requested an OTP", () => {
    expect(() => {
      verifyQuoteOtpCore("unregistered@unknown.com", "123456");
    }).toThrow("No active verification code found");
  });

  it("throws and rolls back stored OTP if Resend delivery fails", async () => {
    process.env["MAIL_PROVIDER"] = "resend";
    process.env["RESEND_API_KEY"] = "re_test_invalid_key";
    process.env["EMAIL_FROM"] = "PAGE International <onboarding@resend.dev>";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            statusCode: 403,
            name: "validation_error",
            message: "You can only send testing emails to your own email address.",
          }),
          { status: 403, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    const failingEmail = "resend-fail@example.com";
    await expect(
      sendQuoteOtpCore({
        email: failingEmail,
        companyName: "Resend Failure Test",
      }),
    ).rejects.toThrow("Unable to deliver verification email");

    expect(() => {
      verifyQuoteOtpCore(failingEmail, "123456");
    }).toThrow("No active verification code found");

    expect(insertValuesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        recipient: failingEmail,
        status: "FAILED",
      }),
    );
  });

  describe("isQuoteEmailOtpRequired configuration matrix", () => {
    it("defaults to false in auto mode for console provider and Resend sandbox sender", () => {
      expect(isQuoteEmailOtpRequired()).toBe(false);

      process.env["MAIL_PROVIDER"] = "auto";
      process.env["RESEND_API_KEY"] = "re_test_key";
      process.env["EMAIL_FROM"] = "PAGE International <onboarding@resend.dev>";
      resetEmailProviderCache();
      expect(isQuoteEmailOtpRequired()).toBe(false);
    });

    it("defaults to true in auto mode for SMTP or Resend with verified custom domain", () => {
      process.env["MAIL_PROVIDER"] = "auto";
      process.env["RESEND_API_KEY"] = "re_test_key";
      process.env["EMAIL_FROM"] = "PAGE International <quotes@pageinternational.com>";
      resetEmailProviderCache();
      expect(isQuoteEmailOtpRequired()).toBe(true);

      delete process.env["RESEND_API_KEY"];
      delete process.env["EMAIL_FROM"];
      process.env["SMTP_HOST"] = "smtp.example.com";
      resetEmailProviderCache();
      expect(isQuoteEmailOtpRequired()).toBe(true);
    });

    it("respects explicit REQUIRE_QUOTE_EMAIL_OTP overrides", () => {
      process.env["MAIL_PROVIDER"] = "console";
      process.env["REQUIRE_QUOTE_EMAIL_OTP"] = "true";
      resetEmailProviderCache();
      expect(isQuoteEmailOtpRequired()).toBe(true);

      process.env["RESEND_API_KEY"] = "re_test_key";
      process.env["EMAIL_FROM"] = "PAGE International <quotes@pageinternational.com>";
      process.env["REQUIRE_QUOTE_EMAIL_OTP"] = "false";
      resetEmailProviderCache();
      expect(isQuoteEmailOtpRequired()).toBe(false);
    });
  });
});
