import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetEmailProviderCache } from "@/lib/email.server";
import { resetRateLimits } from "@/lib/rate-limiter";
import { createQuoteCore } from "@/lib/data.server";

const { insertedQuotes, insertedAudits, insertedEmails, returningMock, insertMock } = vi.hoisted(
  () => {
    const quotesList: Record<string, unknown>[] = [];
    const auditsList: Record<string, unknown>[] = [];
    const emailsList: Record<string, unknown>[] = [];

    const retMock = vi.fn(async () => []);
    const insMock = vi.fn((table: unknown) => ({
      values: (row: Record<string, unknown>) => {
        const tblName = String(
          (table as Record<symbol, unknown> | undefined)?.[Symbol.for("drizzle:Name")] || "",
        );
        if (tblName === "quotes") {
          quotesList.push(row);
          return {
            returning: async () => [row],
          };
        }
        if (tblName === "audit_log") {
          auditsList.push(row);
        } else if (tblName === "email_log") {
          emailsList.push(row);
        }
        const promise = Promise.resolve([row]) as Promise<Record<string, unknown>[]> & {
          returning: () => Promise<Record<string, unknown>[]>;
        };
        promise.returning = async () => [row];
        return promise;
      },
    }));

    return {
      insertedQuotes: quotesList,
      insertedAudits: auditsList,
      insertedEmails: emailsList,
      returningMock: retMock,
      insertMock: insMock,
    };
  },
);

vi.mock("@/lib/auth.server", () => ({
  getClientIp: () => "127.0.0.1",
  getSessionUserCore: async () => null,
}));

vi.mock("@/db", async () => {
  const schema = await import("../db/schema");
  return {
    ...schema,
    isPostgres: false,
    rawClient: null,
    db: {
      insert: insertMock,
      select: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
});

describe("Direct & Admin-Notified Quotation Persistence", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    insertedQuotes.length = 0;
    insertedAudits.length = 0;
    insertedEmails.length = 0;
    returningMock.mockClear();
    insertMock.mockClear();
    resetRateLimits();
    delete process.env["RESEND_API_KEY"];
    delete process.env["MAIL_PROVIDER"];
    delete process.env["EMAIL_FROM"];
    delete process.env["MAIL_FROM"];
    delete process.env["MAIL_ADMIN_NOTIFICATION"];
    resetEmailProviderCache();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
    resetEmailProviderCache();
    resetRateLimits();
  });

  it("persists a PENDING quotation without sending failed customer mail when using Resend sandbox", async () => {
    process.env["MAIL_PROVIDER"] = "resend";
    process.env["RESEND_API_KEY"] = "re_test_sandbox_key";
    process.env["EMAIL_FROM"] = "PAGE International <onboarding@resend.dev>";
    process.env["MAIL_ADMIN_NOTIFICATION"] = "owner-alerts@gmail.com";
    resetEmailProviderCache();

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "email_admin_alert_1" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const res = await createQuoteCore({
      companyName: "Dhaka Motors Garage",
      contactName: "Engr. Karim",
      phone: "+880 1711-000111",
      email: "buyer@dhakamotors.bd",
      productSlug: "",
      productName: "Heavy-Duty 2-Post Lift 4.0T",
      qty: 0,
      city: "Dhaka",
      notes: "Need installation included",
    });

    expect(res.success).toBe(true);
    expect(res.quoteNumber).toMatch(/^RFQ-\d{4}-\d{4}$/);

    expect(insertedQuotes).toHaveLength(1);
    expect(insertedQuotes[0]).toMatchObject({
      companyName: "Dhaka Motors Garage",
      contactName: "Engr. Karim",
      email: "buyer@dhakamotors.bd",
      productSlug: "custom-rfq",
      qty: 1,
      status: "PENDING",
    });

    expect(insertedAudits).toHaveLength(1);
    expect(insertedAudits[0]).toMatchObject({
      action: "quote.create",
      entityType: "quote",
      metadata: expect.objectContaining({
        quoteNumber: res.quoteNumber,
        verifiedViaOtp: false,
      }),
    });

    // Give background non-blocking email dispatch microtask a turn
    await new Promise((r) => setTimeout(r, 20));

    // Only admin notification should be dispatched in sandbox mode, NOT customer confirmation
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body));
    expect(body.to).toEqual(["owner-alerts@gmail.com"]);
    expect(body.reply_to).toBe("buyer@dhakamotors.bd");
  });

  it("silently ignores honeypot submissions without inserting DB records", async () => {
    const res = await createQuoteCore({
      companyName: "Spam Bot Corp",
      contactName: "Bot",
      phone: "000",
      email: "bot@spam.example",
      productSlug: "lift",
      productName: "Lift",
      qty: 1,
      honeypot: "i-am-a-bot",
    });

    expect(res.success).toBe(true);
    expect(res.quoteNumber).toMatch(/^RFQ-\d+$/);
    expect(insertedQuotes).toHaveLength(0);
  });

  it("rejects invalid business email addresses and missing required fields", async () => {
    await expect(
      createQuoteCore({
        companyName: "Test Motors",
        contactName: "Test",
        phone: "+8801700000000",
        email: "invalid-email",
        productSlug: "lift",
        productName: "Lift",
        qty: 1,
      }),
    ).rejects.toThrow("valid business email");

    await expect(
      createQuoteCore({
        companyName: "   ",
        contactName: "Test",
        phone: "+8801700000000",
        email: "valid@test.com",
        productSlug: "lift",
        productName: "Lift",
        qty: 1,
      }),
    ).rejects.toThrow("company name, phone number");
  });
});
