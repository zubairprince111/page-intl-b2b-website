import "./lib/error-capture";
import { ensureServerEnvLoaded } from "./lib/env.server";

ensureServerEnvLoaded();

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);

    // Healthcheck endpoint for Docker, Caddy, Kubernetes & monitoring
    if (url.pathname === "/api/health") {
      try {
        const { db } = await import("./db");
        const { sql } = await import("drizzle-orm");
        await db.execute(sql`SELECT 1`);

        return new Response(
          JSON.stringify({
            status: "ok",
            uptime: Math.floor(process.uptime()),
            database: "connected",
            timestamp: new Date().toISOString(),
            version: "2.0.0",
            service: "page-international-platform",
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
              "cache-control": "no-cache, no-store, must-revalidate",
            },
          },
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({
            status: "error",
            uptime: Math.floor(process.uptime()),
            database: "disconnected",
            error: err?.message || "Database query failed",
            timestamp: new Date().toISOString(),
            version: "2.0.0",
          }),
          {
            status: 503,
            headers: {
              "content-type": "application/json",
              "cache-control": "no-cache, no-store, must-revalidate",
            },
          },
        );
      }
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
