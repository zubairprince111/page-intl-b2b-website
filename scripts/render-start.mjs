import { spawn } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import postgres from "postgres";

const rootDir = process.cwd();

function isLocalOrInternalHostname(hostname) {
  const host = hostname
    .trim()
    .toLowerCase()
    .replace(/^\[|\]$/g, "");
  if (!host) return true;
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host === "postgres" ||
    host === "db"
  ) {
    return true;
  }
  if (host.endsWith(".local") || host.endsWith(".internal") || !host.includes(".")) {
    return true;
  }
  return false;
}

function buildProbePostgresOptions(databaseUrl) {
  let hostname = "";
  let port = "";
  let searchParams = new URLSearchParams();

  try {
    const parsed = new URL(databaseUrl.trim().replace(/^postgres(ql)?:/i, "http:"));
    hostname = parsed.hostname.toLowerCase();
    port = parsed.port;
    searchParams = parsed.searchParams;
  } catch {
    // ignore URL parse error; let postgres driver report connection error
  }

  const isPooler =
    searchParams.get("pgbouncer") === "true" ||
    hostname.includes("-pooler.") ||
    (hostname.includes(".pooler.") && port === "6543") ||
    port === "6543";

  const opts = {
    max: 1,
    idle_timeout: 5,
    connect_timeout: 15,
    prepare: !isPooler,
  };

  const dbSsl = (process.env["DB_SSL"] || "").trim().toLowerCase();
  if (["false", "0", "no", "off", "disable"].includes(dbSsl)) {
    opts.ssl = false;
  } else if (dbSsl === "require" || dbSsl === "no-verify") {
    opts.ssl = "require";
  } else if (["verify-full", "true", "1", "yes", "on"].includes(dbSsl)) {
    opts.ssl = true;
  } else if (!searchParams.has("sslmode") && !searchParams.has("ssl")) {
    opts.ssl = isLocalOrInternalHostname(hostname) ? false : "require";
  }

  return opts;
}

function describeDatabaseHost(databaseUrl) {
  try {
    const parsed = new URL(databaseUrl.trim().replace(/^postgres(ql)?:/i, "http:"));
    return `${parsed.hostname || "localhost"}${parsed.port ? `:${parsed.port}` : ""}`;
  } catch {
    return "postgresql";
  }
}

function runNodeScript(scriptRelativePath, fallbackNpxArgs) {
  return new Promise((resolve, reject) => {
    const builtScript = path.resolve(rootDir, scriptRelativePath);
    const useBuilt = fs.existsSync(builtScript);
    const cmd = useBuilt ? process.execPath : process.platform === "win32" ? "npx.cmd" : "npx";
    const args = useBuilt ? [builtScript] : fallbackNpxArgs;

    const child = spawn(cmd, args, {
      cwd: rootDir,
      env: process.env,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command "${cmd} ${args.join(" ")}" exited with code ${code}`));
      }
    });
  });
}

function countLocalMigrationFiles() {
  const drizzleDir = path.resolve(rootDir, "drizzle");
  if (!fs.existsSync(drizzleDir)) return 0;
  return fs.readdirSync(drizzleDir).filter((file) => file.endsWith(".sql")).length;
}

async function prepareDatabase() {
  const databaseUrl = process.env["DATABASE_URL"]?.trim();
  if (!databaseUrl) {
    const pgliteDir = process.env["PGLITE_DATA_DIR"]?.trim()
      ? path.resolve(process.env["PGLITE_DATA_DIR"].trim())
      : path.resolve(rootDir, ".data", "postgres");
    const isFreshPglite = !fs.existsSync(path.join(pgliteDir, "PG_VERSION"));
    console.log(
      `[render:start] DATABASE_URL not set — using embedded PGlite storage (${path.relative(rootDir, pgliteDir) || pgliteDir}).`,
    );
    if (isFreshPglite || process.env["FORCE_DB_SEED"] === "true") {
      await runNodeScript(".output/cli/seed.mjs", ["vite-node", "src/db/seed.ts"]);
    } else {
      await runNodeScript(".output/cli/migrate.mjs", ["vite-node", "src/db/migrate.ts"]);
    }
    return;
  }

  console.log(
    `[render:start] Checking PostgreSQL connectivity (${describeDatabaseHost(databaseUrl)})...`,
  );
  const sql = postgres(databaseUrl, buildProbePostgresOptions(databaseUrl));

  let usersTableExists = false;
  let userCount = 0;
  let appliedMigrations = 0;

  try {
    const maxAttempts = 10;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await sql`SELECT 1`;
        break;
      } catch (err) {
        if (attempt === maxAttempts) {
          throw err;
        }
        console.log(
          `[render:start] Waiting for PostgreSQL (${attempt}/${maxAttempts}) — retrying in 2s...`,
        );
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    try {
      const migRows = await sql`SELECT COUNT(*)::int AS cnt FROM drizzle.__drizzle_migrations`;
      appliedMigrations = Number(migRows[0]?.cnt ?? 0);
    } catch {
      appliedMigrations = 0;
    }

    try {
      const regRows = await sql`SELECT to_regclass('public.users') AS tbl`;
      usersTableExists = Boolean(regRows[0]?.tbl);
      if (usersTableExists) {
        const cntRows = await sql`SELECT COUNT(*)::int AS cnt FROM public.users`;
        userCount = Number(cntRows[0]?.cnt ?? 0);
      }
    } catch {
      usersTableExists = false;
      userCount = 0;
    }
  } finally {
    await sql.end({ timeout: 3 }).catch(() => { });
  }

  const localMigrationCount = countLocalMigrationFiles();
  const needsMigration = !usersTableExists || appliedMigrations < localMigrationCount;
  const needsSeed = !usersTableExists || userCount === 0 || process.env["FORCE_DB_SEED"] === "true";

  if (needsSeed) {
    console.log(
      `[render:start] Initializing database schema & seed data (migrations: ${appliedMigrations}/${localMigrationCount}, users: ${userCount})...`,
    );
    await runNodeScript(".output/cli/seed.mjs", ["vite-node", "src/db/seed.ts"]);
  } else if (needsMigration) {
    console.log(
      `[render:start] Applying pending PostgreSQL migrations (${appliedMigrations}/${localMigrationCount})...`,
    );
    await runNodeScript(".output/cli/migrate.mjs", ["vite-node", "src/db/migrate.ts"]);
  } else {
    console.log(
      `[render:start] Database healthy (${appliedMigrations} migrations applied, ${userCount} users present) — fast-booting server.`,
    );
  }
}

function ensureRuntimeDirectories() {
  for (const cat of ["products", "banners", "documents", "general"]) {
    const dir = path.resolve(rootDir, "public", "uploads", cat);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

async function start() {
  const serverEntry = path.resolve(rootDir, ".output", "server", "index.mjs");
  if (!fs.existsSync(serverEntry)) {
    console.error(
      "[render:start] Missing production build at .output/server/index.mjs. Run 'npm run build' first.",
    );
    process.exit(1);
  }

  if (
    process.env["NODE_ENV"] === "production" &&
    (!process.env["AUTH_SECRET"] || process.env["AUTH_SECRET"].includes("replace_with"))
  ) {
    console.warn(
      "[render:start] WARNING: AUTH_SECRET is missing or using a placeholder. Configure a strong random secret in Render Environment.",
    );
  }

  ensureRuntimeDirectories();
  await prepareDatabase();

  const port = process.env["NITRO_PORT"] || process.env["PORT"] || "3000";
  console.log(`[render:start] Starting PAGE International Nitro server on port ${port}...`);
  await import(pathToFileURL(serverEntry).href);
}

start().catch((err) => {
  console.error("[render:start] Fatal startup failure:", err);
  process.exit(1);
});