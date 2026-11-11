import { db, isPostgres } from "@/db";
import { sql } from "drizzle-orm";
import { getSessionUserCore } from "./auth.server";

export const ADMIN_DB_TABLE_NAMES = [
  "users",
  "sessions",
  "products",
  "quotes",
  "bookings",
  "banners",
  "reviews",
  "media",
  "orders",
  "order_items",
  "settings",
  "updates",
  "password_reset_tokens",
  "email_verification_tokens",
  "email_log",
  "audit_log",
] as const;

export type AdminDbTableName = (typeof ADMIN_DB_TABLE_NAMES)[number];

const ADMIN_DB_TABLE_SET = new Set<string>(ADMIN_DB_TABLE_NAMES);

const SENSITIVE_COLUMNS = new Set([
  "password_hash",
  "passwordhash",
  "token",
  "token_hash",
  "tokenhash",
  "secret",
  "api_key",
  "apikey",
  "storage_data",
  "storagedata",
]);

export type AdminDbPrimitive = string | number | boolean | null;
export type AdminDbJsonValue =
  AdminDbPrimitive | AdminDbJsonValue[] | { [key: string]: AdminDbJsonValue };

export interface AdminDbColumnMeta {
  name: string;
  dataType: string;
  isNullable: boolean;
}

export interface AdminDbTableOverview {
  name: AdminDbTableName;
  rowCount: number;
  columns: AdminDbColumnMeta[];
}

export interface AdminDbOverviewResult {
  engine: string;
  isPostgres: boolean;
  tables: AdminDbTableOverview[];
}

export interface AdminDbTableRowsResult {
  tableName: AdminDbTableName;
  totalRows: number;
  limit: number;
  offset: number;
  columns: AdminDbColumnMeta[];
  rows: Record<string, AdminDbJsonValue>[];
  hasRedactedFields: boolean;
}

async function requireAdminUser() {
  const user = await getSessionUserCore();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: Administrative privileges required.");
  }
  return user;
}

export function isAllowedDatabaseTableName(name: string): name is AdminDbTableName {
  return ADMIN_DB_TABLE_SET.has(name);
}

export function extractExecuteRows<T extends Record<string, unknown>>(result: unknown): T[] {
  if (Array.isArray(result)) {
    return result as T[];
  }
  if (result && typeof result === "object" && "rows" in result) {
    const maybeRows = (result as { rows?: unknown }).rows;
    if (Array.isArray(maybeRows)) {
      return maybeRows as T[];
    }
  }
  return [];
}

function serializeCellValue(value: unknown): AdminDbJsonValue {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : String(value);
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "bigint") return value.toString();
  if (Array.isArray(value)) return value.map((item) => serializeCellValue(item));
  if (typeof value === "object") {
    const out: Record<string, AdminDbJsonValue> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = serializeCellValue(v);
    }
    return out;
  }
  return String(value);
}

export function redactSensitiveRowValues(row: Record<string, unknown>): {
  sanitized: Record<string, AdminDbJsonValue>;
  hadRedactions: boolean;
} {
  const sanitized: Record<string, AdminDbJsonValue> = {};
  let hadRedactions = false;

  for (const [key, rawVal] of Object.entries(row)) {
    if (SENSITIVE_COLUMNS.has(key.toLowerCase())) {
      if (rawVal !== null && rawVal !== undefined && String(rawVal).length > 0) {
        sanitized[key] = "[REDACTED]";
        hadRedactions = true;
      } else {
        sanitized[key] = null;
      }
    } else {
      sanitized[key] = serializeCellValue(rawVal);
    }
  }

  return { sanitized, hadRedactions };
}

export async function getAdminDatabaseOverviewCore(): Promise<AdminDbOverviewResult> {
  await requireAdminUser();

  const colResult = await db.execute(sql`
    SELECT table_name, column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position
  `);

  const columnsByTable = new Map<string, AdminDbColumnMeta[]>();
  const rawCols = extractExecuteRows<{
    table_name: string;
    column_name: string;
    data_type: string;
    is_nullable: string;
  }>(colResult);

  for (const raw of rawCols) {
    if (!isAllowedDatabaseTableName(raw.table_name)) continue;
    const list = columnsByTable.get(raw.table_name) ?? [];
    list.push({
      name: raw.column_name,
      dataType: raw.data_type,
      isNullable: raw.is_nullable === "YES",
    });
    columnsByTable.set(raw.table_name, list);
  }

  const tables: AdminDbTableOverview[] = [];
  for (const tableName of ADMIN_DB_TABLE_NAMES) {
    const columns = columnsByTable.get(tableName) ?? [];
    if (columns.length === 0) {
      tables.push({ name: tableName, rowCount: 0, columns: [] });
      continue;
    }
    const countRes = await db.execute(sql.raw(`SELECT COUNT(*)::int AS cnt FROM "${tableName}"`));
    const countRows = extractExecuteRows<{ cnt?: number | string }>(countRes);
    const rowCount = Number(countRows[0]?.cnt ?? 0);
    tables.push({ name: tableName, rowCount, columns });
  }

  return {
    engine: isPostgres ? "PostgreSQL Server" : "Embedded PGlite (.data/postgres)",
    isPostgres,
    tables,
  };
}

export async function getAdminDatabaseTableRowsCore(input: {
  tableName: string;
  limit?: number | undefined;
  offset?: number | undefined;
}): Promise<AdminDbTableRowsResult> {
  await requireAdminUser();

  const tableName = input.tableName.trim();
  if (!isAllowedDatabaseTableName(tableName)) {
    throw new Error(`Invalid or unsupported table name: "${input.tableName}"`);
  }

  const limit = Math.min(100, Math.max(1, Math.floor(input.limit ?? 50)));
  const offset = Math.max(0, Math.floor(input.offset ?? 0));

  const colResult = await db.execute(sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ${tableName}
    ORDER BY ordinal_position
  `);

  const columns: AdminDbColumnMeta[] = extractExecuteRows<{
    column_name: string;
    data_type: string;
    is_nullable: string;
  }>(colResult).map((c) => ({
    name: c.column_name,
    dataType: c.data_type,
    isNullable: c.is_nullable === "YES",
  }));

  const countRes = await db.execute(sql.raw(`SELECT COUNT(*)::int AS cnt FROM "${tableName}"`));
  const countRows = extractExecuteRows<{ cnt?: number | string }>(countRes);
  const totalRows = Number(countRows[0]?.cnt ?? 0);

  const columnNames = columns.map((c) => c.name);
  const preferredOrderColumn =
    columnNames.find((c) => c === "created_at") ??
    columnNames.find((c) => c === "updated_at") ??
    columnNames.find((c) => c === "published_at") ??
    columnNames[0];

  const orderClause = preferredOrderColumn
    ? `ORDER BY "${preferredOrderColumn}" DESC NULLS LAST`
    : "";

  const selectProjection = columns
    .map((c) => {
      if (c.name === "storage_data") {
        return `CASE WHEN "storage_data" IS NOT NULL AND length("storage_data") > 0 THEN '[BINARY_STORED]' ELSE NULL END AS "storage_data"`;
      }
      return `"${c.name}"`;
    })
    .join(", ");

  const rowsRes = await db.execute(
    sql.raw(
      `SELECT ${selectProjection || "*"} FROM "${tableName}" ${orderClause} LIMIT ${limit} OFFSET ${offset}`,
    ),
  );

  let hasRedactedFields = false;
  const rows = extractExecuteRows<Record<string, unknown>>(rowsRes).map((rawRow) => {
    const { sanitized, hadRedactions } = redactSensitiveRowValues(rawRow);
    if (hadRedactions) hasRedactedFields = true;
    return sanitized;
  });

  return {
    tableName,
    totalRows,
    limit,
    offset,
    columns,
    rows,
    hasRedactedFields,
  };
}
