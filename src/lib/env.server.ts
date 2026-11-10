import dotenv from "dotenv";

let envLoaded = false;

/**
 * Loads variables from .env into process.env for Node/Nitro runtimes.
 * Skipped during automated tests (Vitest / NODE_ENV=test) so test runs stay
 * isolated, and never overrides variables already provided by Docker/OS/CI.
 */
export function ensureServerEnvLoaded(): void {
  if (envLoaded) return;
  envLoaded = true;

  if (process.env["VITEST"] || process.env["NODE_ENV"] === "test") {
    return;
  }

  try {
    dotenv.config({ quiet: true });
  } catch {
    // Ignore in edge/worker runtimes without filesystem access
  }
}
