import { getSessionUserByToken, parseSessionTokenFromCookieHeader } from "./auth.server";
import { saveAdminMediaBufferCore } from "./media.server";
import { MAX_VIDEO_BYTES } from "./media-magic";

function jsonResponse(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

/**
 * Handles binary `multipart/form-data` media uploads at `POST /api/media/upload`.
 * Avoids base64 JSON inflation so larger assets (including MP4 / WebM shop banner videos)
 * upload quickly and reliably in both Vite dev and Nitro production servers.
 */
export async function handleMediaUploadHttpRequest(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const token = parseSessionTokenFromCookieHeader(request.headers.get("cookie"));
  const adminUser = await getSessionUserByToken(token);
  if (!adminUser) {
    return jsonResponse({ error: "Unauthorized. Please sign in as an administrator." }, 401);
  }
  if (adminUser.role !== "admin") {
    return jsonResponse(
      { error: "Forbidden. Administrative privileges required to upload media." },
      403,
    );
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    return jsonResponse({ error: "Expected multipart/form-data request body." }, 400);
  }

  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_VIDEO_BYTES + 1024 * 1024) {
    return jsonResponse({ error: "Uploaded payload exceeds the 100MB maximum limit." }, 413);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonResponse({ error: "Failed to parse multipart form upload." }, 400);
  }

  const fileEntry = formData.get("file");
  if (!fileEntry || typeof fileEntry === "string") {
    return jsonResponse({ error: "No file field provided in upload payload." }, 400);
  }

  const categoryEntry = formData.get("category");
  const category = typeof categoryEntry === "string" ? categoryEntry : "general";

  if (fileEntry.size > MAX_VIDEO_BYTES) {
    return jsonResponse({ error: "File exceeds maximum allowed size of 100MB" }, 413);
  }

  try {
    const arrayBuffer = await fileEntry.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName =
      typeof (fileEntry as File).name === "string" && (fileEntry as File).name
        ? (fileEntry as File).name
        : "upload.bin";

    const result = await saveAdminMediaBufferCore({
      fileName,
      buffer,
      category,
      adminUser,
    });
    return jsonResponse(result, 200);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save uploaded media.";
    const status = message.toLowerCase().includes("exceeds maximum") ? 413 : 400;
    return jsonResponse({ error: message }, status);
  }
}
