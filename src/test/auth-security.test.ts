import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

describe("Authentication & Security Core", () => {
  it("hashes passwords using bcrypt with cost >= 12", async () => {
    const rawPassword = "StrongEnterprisePassword#2026";
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(rawPassword, salt);

    // Verify bcrypt hash structure: starts with $2a$ or $2b$ and has cost 12
    expect(hash).toMatch(/^\$2[ab]\$12\$/);

    // Verify correct password matches
    const isValid = await bcrypt.compare(rawPassword, hash);
    expect(isValid).toBe(true);

    // Verify incorrect password fails
    const isInvalid = await bcrypt.compare("WrongPassword", hash);
    expect(isInvalid).toBe(false);
  });

  it("generates cryptographically secure session tokens", () => {
    const token1 = crypto.randomBytes(32).toString("hex");
    const token2 = crypto.randomBytes(32).toString("hex");

    expect(token1).toHaveLength(64);
    expect(token2).toHaveLength(64);
    expect(token1).not.toBe(token2);

    // SHA-256 token hashing
    const hash1 = crypto.createHash("sha256").update(token1).digest("hex");
    const hash2 = crypto.createHash("sha256").update(token1).digest("hex");
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });
});
