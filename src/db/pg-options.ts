export interface PostgresConnectionOptions {
  max: number;
  idle_timeout: number;
  connect_timeout: number;
  prepare: boolean;
  ssl?: false | true | "require" | "prefer" | "allow" | "verify-full" | undefined;
}

function isLocalOrInternalHostname(hostname: string): boolean {
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
  if (host.endsWith(".local") || host.endsWith(".internal")) {
    return true;
  }
  // Single-label private service names (e.g. Docker Compose services or Render internal DB "dpg-xxx-a")
  if (!host.includes(".")) {
    return true;
  }
  return false;
}

function parseExplicitSslOverride(
  rawValue: string | undefined,
): PostgresConnectionOptions["ssl"] | undefined {
  if (!rawValue) return undefined;
  const normalized = rawValue.trim().toLowerCase();
  if (!normalized) return undefined;
  if (["false", "0", "no", "off", "disable"].includes(normalized)) {
    return false;
  }
  if (["require", "no-verify"].includes(normalized)) {
    return "require";
  }
  if (["verify-full", "true", "1", "yes", "on"].includes(normalized)) {
    return true;
  }
  return "require";
}

/**
 * Derives `postgres-js` options tailored for local Docker, VPS, Neon, Supabase,
 * and Render Managed PostgreSQL (including TLS auto-detection, PgBouncer transaction
 * pooler `prepare: false`, cold-compute timeouts, and RAM/connection-safe pooling).
 */
export function buildPostgresOptions(
  databaseUrl: string,
  env: Record<string, string | undefined> = process.env,
): PostgresConnectionOptions {
  let hostname = "";
  let port = "";
  let searchParams = new URLSearchParams();

  try {
    const normalizedUrl = databaseUrl.trim().replace(/^postgres(ql)?:/i, "http:");
    const parsed = new URL(normalizedUrl);
    hostname = parsed.hostname.toLowerCase();
    port = parsed.port;
    searchParams = parsed.searchParams;
  } catch {
    // Fall back gracefully if URL has unusual unescaped characters
  }

  const isRenderEnv = Boolean(env["RENDER"] || env["RENDER_SERVICE_ID"]);
  const explicitMax = Number(env["DB_POOL_MAX"]);
  const max =
    Number.isFinite(explicitMax) && explicitMax >= 1
      ? Math.floor(explicitMax)
      : isRenderEnv
        ? 5
        : 10;

  // Disable prepared statements on transaction poolers (Neon "-pooler.", Supabase ":6543", ?pgbouncer=true)
  const prepareEnv = env["DB_PREPARE"]?.trim().toLowerCase();
  const isPoolerUrl =
    searchParams.get("pgbouncer") === "true" ||
    hostname.includes("-pooler.") ||
    (hostname.includes(".pooler.") && port === "6543") ||
    port === "6543";
  const prepare = prepareEnv === "false" ? false : !isPoolerUrl;

  const explicitSsl = parseExplicitSslOverride(env["DB_SSL"]);
  const urlHasSslParam = searchParams.has("sslmode") || searchParams.has("ssl");

  const options: PostgresConnectionOptions = {
    max,
    idle_timeout: 20,
    connect_timeout: 15,
    prepare,
  };

  if (explicitSsl !== undefined) {
    options.ssl = explicitSsl;
  } else if (!urlHasSslParam) {
    options.ssl = isLocalOrInternalHostname(hostname) ? false : "require";
  }

  return options;
}
