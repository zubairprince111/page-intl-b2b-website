import { describe, it, expect } from "vitest";
import { sendQuoteOtpCore, verifyQuoteOtpCore } from "@/lib/otp.server";

describe("Quotation Email OTP Verification System", () => {
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
});
