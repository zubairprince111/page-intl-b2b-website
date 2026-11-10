import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";

let envLoaded = false;
let lastEnvMtimeMs: number | null = null;
const bootDefinedKeys = new Set(
  Object.keys(process.env).filter((key) => {
    const val = process.env[key];
    return typeof val === "string" && val.length > 0;
  }),
);

/**
 * Loads variables from .env into process.env for Node/Nitro runtimes.
 * Skipped during automated tests (Vitest / NODE_ENV=test) so test runs stay
 * isolated, and never overrides non-empty variables provided by Docker/OS/CI.
 * In non-production dev mode, re-reads .env automatically if the file changes.
 */
export function ensureServerEnvLoaded(): void {
  if (process.env["VITEST"] || process.env["NODE_ENV"] === "test") {
    return;
  }

  const isProd = process.env["NODE_ENV"] === "production";
  if (envLoaded && isProd) {
    return;
  }

  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (!fs.existsSync(envPath)) {
      envLoaded = true;
      return;
    }

    const stat = fs.statSync(envPath);
    if (envLoaded && lastEnvMtimeMs === stat.mtimeMs) {
      return;
    }

    const parsed = dotenv.parse(fs.readFileSync(envPath, "utf8"));
    for (const [key, value] of Object.entries(parsed)) {
      if (!bootDefinedKeys.has(key)) {
        process.env[key] = value;
      }
    }

    lastEnvMtimeMs = stat.mtimeMs;
    envLoaded = true;
  } catch {
    envLoaded = true;
  }
}
