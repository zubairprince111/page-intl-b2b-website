import { ensureServerEnvLoaded } from "../lib/env.server";

ensureServerEnvLoaded();

import * as schema from "./schema";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import postgres from "postgres";
import { PGlite } from "@electric-sql/pglite";
import * as path from "node:path";
import * as fs from "node:fs";

const databaseUrl = process.env["DATABASE_URL"];
export const isPostgres = Boolean(databaseUrl && databaseUrl.trim().length > 0);

const globalForDb = globalThis as unknown as {
  __pageRawClient?: ReturnType<typeof postgres> | PGlite | null;
  __pageDb?:
    ReturnType<typeof drizzlePg<typeof schema>> | ReturnType<typeof drizzlePglite<typeof schema>>;
};

let rawClient: ReturnType<typeof postgres> | PGlite | null = globalForDb.__pageRawClient ?? null;

function initDb() {
  if (globalForDb.__pageDb) {
    return globalForDb.__pageDb;
  }

  if (isPostgres) {
    const pgClient = postgres(databaseUrl!, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    rawClient = pgClient;
    const instance = drizzlePg(pgClient, { schema });
    globalForDb.__pageRawClient = pgClient;
    globalForDb.__pageDb = instance;
    return instance;
  } else {
    const dataDir = path.resolve(process.cwd(), ".data", "postgres");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const pgliteClient = new PGlite(dataDir);
    rawClient = pgliteClient;
    const instance = drizzlePglite(pgliteClient, { schema });
    globalForDb.__pageRawClient = pgliteClient;
    globalForDb.__pageDb = instance;
    return instance;
  }
}

export const db = initDb();
export { rawClient };
export * from "./schema";
