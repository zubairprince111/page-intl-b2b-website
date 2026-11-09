import { createServerFn } from "@tanstack/react-start";
import type { UploadPayload, UploadResult, MediaStats } from "./media-types";
export * from "./media-types";

// =============================================================================
// TANSTACK START SERVER FUNCTIONS (Exported for Browser/RPC use)
// All Node/DB dependencies are isolated in `./media.server.ts` and loaded dynamically
// inside `.handler()` so client browser bundles stay 100% free of Node/Postgres code.
// =============================================================================

export const uploadMediaServerFn = createServerFn({ method: "POST" })
  .validator((data: UploadPayload) => data)
  .handler(async ({ data }) => {
    const { uploadMediaCore } = await import("./media.server");
    return await uploadMediaCore(data);
  });

export const deleteMediaServerFn = createServerFn({ method: "POST" })
  .validator((payload: { url?: string | undefined; id?: string | undefined }) => payload)
  .handler(async ({ data }) => {
    const { deleteMediaCore } = await import("./media.server");
    return await deleteMediaCore(data);
  });

export const listMediaServerFn = createServerFn({ method: "GET" })
  .validator((payload?: { category?: string | undefined }) => payload || {})
  .handler(async ({ data }) => {
    const { listMediaCore } = await import("./media.server");
    return await listMediaCore(data);
  });

export const syncExistingMediaServerFn = createServerFn({ method: "POST" }).handler(async () => {
  const { syncExistingMediaCore } = await import("./media.server");
  return await syncExistingMediaCore();
});

export const getMediaStatsServerFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getMediaStatsCore } = await import("./media.server");
  return await getMediaStatsCore();
});
