import { describe, it, expect } from "vitest";
import { db, media } from "@/db";
import { eq } from "drizzle-orm";
import { products } from "@/lib/data";
import { hydrateMediaBufferByUrlCore } from "@/lib/media.server";

describe("Product Images Database Persistence", () => {
  it("ensures NO product image uses an external direct URL from another website", () => {
    for (const p of products) {
      expect(p.image).not.toMatch(/^https?:\/\//i);
      expect(p.image).toMatch(/^\/(uploads|assets|src\/assets)\//);
      if (Array.isArray(p.images)) {
        for (const img of p.images) {
          expect(img).not.toMatch(/^https?:\/\//i);
          expect(img).toMatch(/^\/(uploads|assets|src\/assets)\//);
        }
      }
    }
  });

  it("persists all product images directly in the PostgreSQL media table with binary storageData", async () => {
    const launchProducts = products.filter((p) => p.slug.startsWith("launch-"));
    expect(launchProducts.length).toBeGreaterThanOrEqual(70);

    for (let i = 0; i < launchProducts.length; i++) {
      const p = launchProducts[i]!;
      const canonicalUrl = p.image.split("?")[0] || "";
      expect(canonicalUrl).toBeTruthy();

      const rows = await db
        .select({
          id: media.id,
          url: media.url,
          mimeType: media.mimeType,
          sizeBytes: media.sizeBytes,
        })
        .from(media)
        .where(eq(media.url, canonicalUrl))
        .limit(1);

      expect(rows.length).toBe(1);
      const row = rows[0]!;
      expect(row.url).toBe(canonicalUrl);
      expect(row.sizeBytes).toBeGreaterThan(10000);

      // Sample first 5 and last 5 products for full base64 decode and hydration to prevent WASM heap bloat
      if (i < 5 || i >= launchProducts.length - 5) {
        const fullRows = await db
          .select({ storageData: media.storageData })
          .from(media)
          .where(eq(media.url, canonicalUrl))
          .limit(1);
        const fullRow = fullRows[0]!;
        expect(fullRow.storageData).not.toBeNull();
        expect(typeof fullRow.storageData).toBe("string");
        expect(fullRow.storageData!.length).toBeGreaterThan(10000);

        const buf = Buffer.from(fullRow.storageData!, "base64");
        expect(buf.length).toBe(row.sizeBytes);
        const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
        const isJpg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
        expect(isPng || isJpg).toBe(true);

        const hydrated = await hydrateMediaBufferByUrlCore(canonicalUrl);
        expect(hydrated).not.toBeNull();
        expect(hydrated!.length).toBe(row.sizeBytes);
      }
    }
  });
});
