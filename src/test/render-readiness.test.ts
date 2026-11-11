import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { PGlite } from "@electric-sql/pglite";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/pglite/migrator";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const { getSessionMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn<() => Promise<{ id: string; role: string } | null>>(),
}));

vi.mock("@/lib/auth.server", () => ({
  getSessionUserCore: getSessionMock,
}));

vi.mock("@/db", async () => {
  const { PGlite: MemPGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const schema = await import("../db/schema");
  const memClient = new MemPGlite();
  const isolatedDb = drizzle(memClient, { schema });
  return {
    ...schema,
    isPostgres: false,
    rawClient: memClient,
    db: isolatedDb,
  };
});

import * as schema from "@/db/schema";
import { db, rawClient } from "@/db";
import { buildPostgresOptions } from "@/db/pg-options";
import {
  hydrateMediaBufferByUrlCore,
  listMediaCore,
  shouldPersistMediaToDatabase,
} from "@/lib/media.server";
import { serveUploadedFile } from "@/lib/uploads.server";
import { getAdminDatabaseTableRowsCore } from "@/lib/admin-database.server";
import { images, normalizeProductAssetUrl } from "@/lib/data";

describe("Render Free Tier Readiness", () => {
  let tmpRoot: string;
  let uploadsDir: string;

  beforeAll(async () => {
    await migrate(db as unknown as NodePgDatabase<typeof schema>, {
      migrationsFolder: path.resolve(process.cwd(), "drizzle"),
    });
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "page-render-ready-"));
    uploadsDir = path.join(tmpRoot, "uploads");
    fs.mkdirSync(uploadsDir, { recursive: true });
  });

  afterAll(async () => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
    await (rawClient as PGlite).close();
  });

  describe("PostgreSQL SSL, Pooler & Connection Tuning (buildPostgresOptions)", () => {
    it("enables TLS and disables prepared statements for Neon transaction poolers", () => {
      const opts = buildPostgresOptions(
        "postgresql://user:pass@ep-cool-pine-pooler.ap-southeast-1.aws.neon.tech/neondb",
        { RENDER: "true" },
      );
      expect(opts.ssl).toBe("require");
      expect(opts.prepare).toBe(false);
      expect(opts.max).toBe(5);
      expect(opts.connect_timeout).toBe(15);
    });

    it("detects Supabase :6543 transaction pooler and Render external Postgres TLS", () => {
      const supabaseOpts = buildPostgresOptions(
        "postgresql://postgres.ref:pass@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres",
        {},
      );
      expect(supabaseOpts.ssl).toBe("require");
      expect(supabaseOpts.prepare).toBe(false);
      expect(supabaseOpts.max).toBe(10);

      const renderExternalOpts = buildPostgresOptions(
        "postgresql://page:secret@dpg-xyz123-a.singapore-postgres.render.com/pagedb",
        { RENDER: "true" },
      );
      expect(renderExternalOpts.ssl).toBe("require");
      expect(renderExternalOpts.prepare).toBe(true);
      expect(renderExternalOpts.max).toBe(5);
    });

    it("keeps TLS off for Docker service names, localhost, and Render internal single-label hosts", () => {
      expect(
        buildPostgresOptions("postgresql://page_admin:pw@postgres:5432/page_international", {}).ssl,
      ).toBe(false);
      expect(buildPostgresOptions("postgresql://postgres:pw@localhost:5432/app", {}).ssl).toBe(
        false,
      );
      expect(buildPostgresOptions("postgresql://user:pw@dpg-xyz123-a/pagedb", {}).ssl).toBe(false);
    });

    it("defers to explicit URL sslmode or DB_* env overrides", () => {
      const urlSslOpts = buildPostgresOptions(
        "postgresql://user:pass@db.example.com/app?sslmode=disable&pgbouncer=true",
        {},
      );
      expect(urlSslOpts.ssl).toBeUndefined();
      expect(urlSslOpts.prepare).toBe(false);

      const envOverrideOpts = buildPostgresOptions("postgresql://user:pass@localhost:5432/app", {
        DB_SSL: "require",
        DB_PREPARE: "false",
        DB_POOL_MAX: "3",
      });
      expect(envOverrideOpts.ssl).toBe("require");
      expect(envOverrideOpts.prepare).toBe(false);
      expect(envOverrideOpts.max).toBe(3);
    });
  });

  describe("Storage Driver Mode Detection", () => {
    it("persists uploads to PostgreSQL on Render Free or when STORAGE_DRIVER=database", () => {
      expect(shouldPersistMediaToDatabase({ STORAGE_DRIVER: "database" })).toBe(true);
      expect(shouldPersistMediaToDatabase({ STORAGE_DRIVER: "disk", RENDER: "true" })).toBe(false);
      expect(shouldPersistMediaToDatabase({ STORAGE_DRIVER: "local", RENDER: "true" })).toBe(false);
      expect(
        shouldPersistMediaToDatabase({
          RENDER: "true",
          DATABASE_URL: "postgresql://u:p@host.neon.tech/db",
        }),
      ).toBe(true);
      expect(shouldPersistMediaToDatabase({ DATABASE_URL: "" })).toBe(false);
    });
  });

  describe("Ephemeral Disk Recovery via PostgreSQL media.storage_data", () => {
    it("hydrates missing /uploads/* files from PostgreSQL, caches to disk, excludes blobs from list/inspector", async () => {
      const samplePng = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44,
        0x52,
      ]);
      const uploadUrl = "/uploads/products/render-recovered-lift.png";

      await db.insert(schema.media).values({
        id: "media-render-test-1",
        filename: "render-recovered-lift.png",
        originalName: "lift-photo.png",
        mimeType: "image/png",
        sizeBytes: samplePng.length,
        url: uploadUrl,
        category: "products",
        storageData: samplePng.toString("base64"),
      });

      // Confirm local disk does NOT have the file yet (simulating Render Free spin-up reset)
      const expectedCachedFile = path.join(uploadsDir, "products", "render-recovered-lift.png");
      expect(fs.existsSync(expectedCachedFile)).toBe(false);

      // Serve via uploads middleware + DB hydrator
      const reqUrl = new URL(`https://example.onrender.com${uploadUrl}`);
      const res = await serveUploadedFile(
        new Request(reqUrl),
        reqUrl,
        uploadsDir,
        hydrateMediaBufferByUrlCore,
      );
      expect(res).not.toBeNull();
      expect(res!.status).toBe(200);
      expect(res!.headers.get("content-type")).toBe("image/png");
      const received = Buffer.from(await res!.arrayBuffer());
      expect(received.equals(samplePng)).toBe(true);

      // Confirm file was cached back onto local container disk for subsequent hits & byte ranges
      expect(fs.existsSync(expectedCachedFile)).toBe(true);

      const rangeRes = await serveUploadedFile(
        new Request(reqUrl, { headers: { range: "bytes=0-3" } }),
        reqUrl,
        uploadsDir,
        hydrateMediaBufferByUrlCore,
      );
      expect(rangeRes!.status).toBe(206);
      expect(Buffer.from(await rangeRes!.arrayBuffer()).equals(samplePng.subarray(0, 4))).toBe(
        true,
      );

      // listMediaCore must NOT leak storageData blobs over RPC
      const listed = await listMediaCore();
      expect(listed).toHaveLength(1);
      expect("storageData" in (listed[0] as unknown as Record<string, unknown>)).toBe(false);

      // Admin DB inspector must replace storage_data with redacted placeholder
      getSessionMock.mockResolvedValue({ id: "admin-1", role: "admin" });
      const inspectorRows = await getAdminDatabaseTableRowsCore({ tableName: "media", limit: 10 });
      expect(inspectorRows.hasRedactedFields).toBe(true);
      expect(inspectorRows.rows[0]?.["storage_data"]).toBe("[REDACTED]");
    });
  });

  describe("Seeded Product Asset URL Normalization", () => {
    it("maps dev-seeded /src/assets/* URLs to active Vite asset paths cleanly", () => {
      expect(normalizeProductAssetUrl("/src/assets/p-lift.jpg")).toBe(images.lift);
      expect(normalizeProductAssetUrl("/uploads/products/custom.png")).toBe(
        "/uploads/products/custom.png",
      );
      expect(normalizeProductAssetUrl("https://cdn.example.com/item.webp")).toBe(
        "https://cdn.example.com/item.webp",
      );
    });
  });
});
