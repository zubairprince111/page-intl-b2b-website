import * as path from "node:path";
import * as fs from "node:fs";
import { migrate as migratePg } from "drizzle-orm/postgres-js/migrator";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { db, isPostgres } from "./index";

export async function runMigrations() {
  const migrationsFolder = path.resolve(process.cwd(), "drizzle");

  if (!fs.existsSync(migrationsFolder)) {
    console.warn(`[db:migrate] Migrations folder not found at ${migrationsFolder}`);
    return;
  }

  if (isPostgres) {
    console.log("[db:migrate] Applying PostgreSQL migrations...");
    await migratePg(db as any, { migrationsFolder });
    console.log("[db:migrate] PostgreSQL migrations applied successfully.");
  } else {
    console.log("[db:migrate] Applying PGlite migrations...");
    await migratePglite(db as any, { migrationsFolder });
    console.log("[db:migrate] PGlite migrations applied successfully.");
  }
}

// Auto-run when file is executed directly (e.g. npm run db:migrate)
const isMain = process.argv[1]?.replace(/\\/g, "/").endsWith("src/db/migrate.ts");
if (isMain) {
  runMigrations()
    .then(() => {
      console.log("[db:migrate] Done.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("[db:migrate] Failed:", err);
      process.exit(1);
    });
}
