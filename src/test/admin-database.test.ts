import path from "node:path";
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
import {
  ADMIN_DB_TABLE_NAMES,
  extractExecuteRows,
  getAdminDatabaseOverviewCore,
  getAdminDatabaseTableRowsCore,
  isAllowedDatabaseTableName,
  redactSensitiveRowValues,
} from "@/lib/admin-database.server";

describe("Admin Database Inspector", () => {
  beforeAll(async () => {
    await migrate(db as unknown as NodePgDatabase<typeof schema>, {
      migrationsFolder: path.resolve(process.cwd(), "drizzle"),
    });

    await db.insert(schema.users).values({
      id: "usr-test-admin",
      name: "Test Admin",
      email: "admin@test.local",
      phone: "+880 1711-000000",
      passwordHash: "$2b$12$testHashMustBeRedactedOnInspector",
      companyName: "PAGE Test Corp",
      role: "admin",
      emailVerified: true,
      isActive: true,
    });

    await db.insert(schema.productsTable).values({
      id: "prod-test-lift",
      slug: "test-hydraulic-lift",
      sku: "PAGE-TEST-01",
      name: "Test 2-Post Lift",
      brand: "PAGE Tech",
      category: "Garage Equipment",
      description: "Test inspection machinery unit",
      warehouseQty: 5,
      reorderLevel: 2,
    });
  });

  afterAll(async () => {
    await (rawClient as PGlite).close();
  });

  it("validates table names strictly against the 16-table schema allowlist", () => {
    expect(ADMIN_DB_TABLE_NAMES.length).toBe(16);
    for (const table of ADMIN_DB_TABLE_NAMES) {
      expect(isAllowedDatabaseTableName(table)).toBe(true);
    }

    expect(isAllowedDatabaseTableName("users; DROP TABLE users;--")).toBe(false);
    expect(isAllowedDatabaseTableName("pg_catalog")).toBe(false);
    expect(isAllowedDatabaseTableName("")).toBe(false);
  });

  it("redacts sensitive authentication columns while preserving metadata", () => {
    const { sanitized, hadRedactions } = redactSensitiveRowValues({
      id: "usr-1",
      email: "admin@pageintl.com",
      password_hash: "$2b$12$secretbcryptstring",
      token: "abcdef123456",
      token_hash: "sha256hash",
      created_at: new Date("2026-11-11T10:00:00Z"),
      notes: null,
    });

    expect(hadRedactions).toBe(true);
    expect(sanitized["id"]).toBe("usr-1");
    expect(sanitized["email"]).toBe("admin@pageintl.com");
    expect(sanitized["password_hash"]).toBe("[REDACTED]");
    expect(sanitized["token"]).toBe("[REDACTED]");
    expect(sanitized["token_hash"]).toBe("[REDACTED]");
    expect(sanitized["created_at"]).toBe("2026-11-11T10:00:00.000Z");
    expect(sanitized["notes"]).toBeNull();
  });

  it("rejects unauthenticated and non-admin callers before executing queries", async () => {
    getSessionMock.mockResolvedValueOnce(null);
    await expect(getAdminDatabaseOverviewCore()).rejects.toThrow(/Unauthorized/i);

    getSessionMock.mockResolvedValueOnce({ id: "u2", role: "customer" });
    await expect(getAdminDatabaseTableRowsCore({ tableName: "users", limit: 10 })).rejects.toThrow(
      /Unauthorized/i,
    );
  });

  it("rejects disallowed table names even for authenticated admins", async () => {
    getSessionMock.mockResolvedValueOnce({ id: "adm", role: "admin" });
    await expect(
      getAdminDatabaseTableRowsCore({ tableName: "pg_shadow", limit: 10 }),
    ).rejects.toThrow(/Invalid or unsupported table name/i);
  });

  it("normalizes db.execute rows from both PGlite objects and postgres-js arrays", () => {
    expect(extractExecuteRows({ rows: [{ cnt: 7 }] })).toEqual([{ cnt: 7 }]);
    expect(extractExecuteRows([{ cnt: 12 }])).toEqual([{ cnt: 12 }]);
    expect(extractExecuteRows(null)).toEqual([]);
  });

  it("queries public schema tables in PGlite and redacts user credentials for admin sessions", async () => {
    getSessionMock.mockResolvedValue({ id: "adm", role: "admin" });

    const overview = await getAdminDatabaseOverviewCore();
    expect(overview.tables.length).toBe(16);

    const productsOverview = overview.tables.find((t) => t.name === "products");
    const usersOverview = overview.tables.find((t) => t.name === "users");
    expect(productsOverview?.rowCount).toBe(1);
    expect(usersOverview?.rowCount).toBe(1);

    const usersResult = await getAdminDatabaseTableRowsCore({
      tableName: "users",
      limit: 5,
      offset: 0,
    });
    expect(usersResult.tableName).toBe("users");
    expect(usersResult.columns.length).toBeGreaterThan(5);
    expect(usersResult.rows).toHaveLength(1);
    expect(usersResult.hasRedactedFields).toBe(true);
    expect(usersResult.rows[0]?.["password_hash"]).toBe("[REDACTED]");
    expect(usersResult.rows[0]?.["email"]).toBe("admin@test.local");
  });
});
