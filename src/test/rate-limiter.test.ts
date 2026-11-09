import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimits } from "@/lib/rate-limiter";

describe("Sliding Window Rate Limiter", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it("allows requests under the maximum limit", () => {
    const key = "test-ip-1";
    const res1 = checkRateLimit(key, 3, 60);
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = checkRateLimit(key, 3, 60);
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = checkRateLimit(key, 3, 60);
    expect(res3.allowed).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it("blocks requests that exceed the limit", () => {
    const key = "test-ip-blocked";
    checkRateLimit(key, 2, 60);
    checkRateLimit(key, 2, 60);

    const blocked = checkRateLimit(key, 2, 60);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetInSeconds).toBeGreaterThan(0);
  });

  it("isolates different keys from each other", () => {
    const keyA = "ip-a";
    const keyB = "ip-b";

    checkRateLimit(keyA, 1, 60);
    expect(checkRateLimit(keyA, 1, 60).allowed).toBe(false);

    // keyB is fresh and must be allowed
    expect(checkRateLimit(keyB, 1, 60).allowed).toBe(true);
  });
});
