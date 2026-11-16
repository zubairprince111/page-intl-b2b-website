import { describe, it, expect, beforeEach } from "vitest";
import {
  listReviewsCore,
  listAdminReviewsCore,
  submitPublicReviewCore,
  saveReviewAdminCore,
  toggleReviewPublishAdminCore,
  deleteReviewAdminCore,
  seedDefaultReviewsCore,
} from "../lib/data.server";
import { db, reviews as reviewsTable, users } from "@/db";
import { eq } from "drizzle-orm";
import * as authServer from "../lib/auth.server";
import type { SanitizedUser } from "../lib/auth.server";
import { vi } from "vitest";

describe("Admin Reviews Management & Moderation System", () => {
  beforeEach(async () => {
    // Mock admin session
    vi.spyOn(authServer, "getSessionUserCore").mockResolvedValue({
      id: "admin-review-tester",
      email: "admin@pageinternational.com",
      role: "admin",
      name: "Admin Review Tester",
      createdAt: new Date(),
    } as unknown as SanitizedUser);
  });

  it("lists published reviews and maps them to storefront Review schema", async () => {
    const published = await listReviewsCore(true);
    expect(Array.isArray(published)).toBe(true);
    expect(published.length).toBeGreaterThan(0);

    const first = published[0]!;
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("name");
    expect(first).toHaveProperty("workshop");
    expect(first).toHaveProperty("comment");
    expect(first).toHaveProperty("rating");
    expect(first.rating).toBeGreaterThanOrEqual(1);
    expect(first.rating).toBeLessThanOrEqual(5);
  });

  it("allows public submission of a review and stores it in PostgreSQL", async () => {
    const testReview = await submitPublicReviewCore({
      name: "Test Engineer Kabir",
      role: "Diagnostic Specialist",
      workshop: "Dhaka Test Garage",
      equipment: "LAUNCH X-431 PAD9 LINK",
      comment: "Superb bi-directional coding and seamless ECU scanning on European vehicles.",
      rating: 5,
    });

    expect(testReview).toBeDefined();
    expect(testReview.id).toMatch(/^rev-/);
    expect(testReview.name).toBe("Test Engineer Kabir");
    expect(testReview.workshop).toBe("Dhaka Test Garage");
    expect(testReview.isPublished).toBe(true);

    // Verify presence in database
    const inDb = await db.select().from(reviewsTable).where(eq(reviewsTable.id, testReview.id));
    expect(inDb.length).toBe(1);
    expect(inDb[0]?.name).toBe("Test Engineer Kabir");

    // Clean up
    await db.delete(reviewsTable).where(eq(reviewsTable.id, testReview.id));
  });

  it("allows admin to create a test review and update it", async () => {
    const created = await saveReviewAdminCore({
      name: "Admin Tester Rahim",
      role: "Workshop Director",
      workshop: "Rahim Master Fleet",
      equipment: "LAUNCH SmartLink C Heavy-Duty",
      comment: "Initial comment for test verification.",
      rating: 4,
      isPublished: false,
    });

    expect(created.id).toBeDefined();
    expect(created.isPublished).toBe(false);

    // Update the review
    const updated = await saveReviewAdminCore({
      id: created.id,
      name: "Admin Tester Rahim (Updated)",
      role: "Managing Director",
      workshop: "Rahim Master Fleet HQ",
      equipment: "LAUNCH SmartLink C Heavy-Duty V2.0",
      comment: "Updated comment with verified field results.",
      rating: 5,
      isPublished: true,
    });

    expect(updated.name).toBe("Admin Tester Rahim (Updated)");
    expect(updated.rating).toBe(5);
    expect(updated.isPublished).toBe(true);

    // Clean up
    await deleteReviewAdminCore(created.id);
  });

  it("allows admin to toggle publish status on/off", async () => {
    const created = await saveReviewAdminCore({
      name: "Status Toggle Tester",
      role: "Fleet Tech",
      workshop: "Toggle Test Bay",
      equipment: "2-Post Lift 4.0T",
      comment: "Testing toggle publish functionality.",
      rating: 5,
      isPublished: true,
    });

    // Toggle to unpublished (hidden)
    const hidden = await toggleReviewPublishAdminCore({ id: created.id, isPublished: false });
    expect(hidden.isPublished).toBe(false);

    // Toggle back to published
    const published = await toggleReviewPublishAdminCore({ id: created.id, isPublished: true });
    expect(published.isPublished).toBe(true);

    // Clean up
    await deleteReviewAdminCore(created.id);
  });

  it("allows admin to permanently delete reviews to keep the panel organized", async () => {
    const created = await saveReviewAdminCore({
      name: "Temporary Review To Delete",
      role: "Tester",
      workshop: "Trash Test Hub",
      equipment: "AERO-10 Compressor",
      comment: "This review should be completely deleted.",
      rating: 5,
      isPublished: true,
    });

    const id = created.id;
    const deleteResult = await deleteReviewAdminCore(id);
    expect(deleteResult.success).toBe(true);
    expect(deleteResult.id).toBe(id);

    // Verify completely gone from PostgreSQL
    const remaining = await db.select().from(reviewsTable).where(eq(reviewsTable.id, id));
    expect(remaining.length).toBe(0);
  });
});
