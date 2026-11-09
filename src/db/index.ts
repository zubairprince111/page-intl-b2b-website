import * as schema from "./schema";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import postgres from "postgres";
import { PGlite } from "@electric-sql/pglite";
import * as path from "node:path";
import * as fs from "node:fs";

const databaseUrl = process.env["DATABASE_URL"];
export const isPostgres = Boolean(databaseUrl && databaseUrl.trim().length > 0);

let rawClient: any = null;

function initDb() {
  if (isPostgres) {
    rawClient = postgres(databaseUrl!, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    return drizzlePg(rawClient, { schema });
  } else {
    const dataDir = path.resolve(process.cwd(), ".data", "postgres");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    rawClient = new PGlite(dataDir);
    return drizzlePglite(rawClient, { schema });
  }
}

export const db = initDb();
export { rawClient };
export * from "./schema";
