import * as fs from "node:fs";
import * as path from "node:path";
import { Readable } from "node:stream";
import { getMimeFromExtension } from "./media-types";

const SAFE_UPLOAD_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".pdf",
  ".mp4",
  ".webm",
]);

function isPathWithinBase(baseDir: string, targetPath: string): boolean {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(targetPath);
  const comparableBase = process.platform === "win32" ? resolvedBase.toLowerCase() : resolvedBase;
  const comparableTarget =
    process.platform === "win32" ? resolvedTarget.toLowerCase() : resolvedTarget;
  const basePrefix = comparableBase.endsWith(path.sep) ? comparableBase : comparableBase + path.sep;
  return comparableTarget.startsWith(basePrefix);
}

function parseSingleByteRange(
  rangeHeader: string,
  fileSize: number,
): { kind: "range"; start: number; end: number } | { kind: "unsatisfiable" } | { kind: "ignore" } {
  if (!rangeHeader.startsWith("bytes=")) {
    return { kind: "ignore" };
  }
  const spec = rangeHeader.slice("bytes=".length).trim();
  // Reject multi-range requests cleanly by falling back to full 200 response per RFC 9110
  if (!spec || spec.includes(",")) {
    return { kind: "ignore" };
  }
  const dashIdx = spec.indexOf("-");
  if (dashIdx === -1) {
    return { kind: "ignore" };
  }
  if (fileSize <= 0) {
    return { kind: "unsatisfiable" };
  }

  const startStr = spec.slice(0, dashIdx).trim();
  const endStr = spec.slice(dashIdx + 1).trim();

  if (!startStr && !endStr) {
    return { kind: "ignore" };
  }

  // Suffix range: bytes=-N
  if (!startStr) {
    if (!/^\d+$/.test(endStr)) return { kind: "ignore" };
    const suffixLen = Number(endStr);
    if (suffixLen <= 0) return { kind: "unsatisfiable" };
    const start = Math.max(0, fileSize - suffixLen);
    return { kind: "range", start, end: fileSize - 1 };
  }

  if (!/^\d+$/.test(startStr)) return { kind: "ignore" };
  const start = Number(startStr);
  if (start >= fileSize) {
    return { kind: "unsatisfiable" };
  }

  if (!endStr) {
    return { kind: "range", start, end: fileSize - 1 };
  }

  if (!/^\d+$/.test(endStr)) return { kind: "ignore" };
  const requestedEnd = Number(endStr);
  if (requestedEnd < start) {
    return { kind: "ignore" };
  }

  return { kind: "range", start, end: Math.min(requestedEnd, fileSize - 1) };
}

function serveBufferResponse(
  request: Request,
  buffer: Buffer,
  contentType: string,
  etagSeed: number,
): Response {
  const etag = `W/"${buffer.length}-${etagSeed}"`;
  const headers = new Headers({
    "content-type": contentType,
    "content-length": String(buffer.length),
    "accept-ranges": "bytes",
    etag,
    "cache-control": "public, max-age=3600",
    "x-content-type-options": "nosniff",
  });

  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers });
  }

  const rangeHeader = request.headers.get("range");
  if (rangeHeader) {
    const parsedRange = parseSingleByteRange(rangeHeader.trim(), buffer.length);
    if (parsedRange.kind === "unsatisfiable") {
      headers.set("content-range", `bytes */${buffer.length}`);
      headers.set("content-length", "0");
      return new Response(null, { status: 416, headers });
    }
    if (parsedRange.kind === "range") {
      const { start, end } = parsedRange;
      const slice = buffer.subarray(start, end + 1);
      headers.set("content-range", `bytes ${start}-${end}/${buffer.length}`);
      headers.set("content-length", String(slice.length));
      if (request.method === "HEAD") {
        return new Response(null, { status: 206, headers });
      }
      return new Response(new Uint8Array(slice), { status: 206, headers });
    }
  }

  if (request.method === "HEAD") {
    return new Response(null, { status: 200, headers });
  }

  return new Response(new Uint8Array(buffer), { status: 200, headers });
}

/**
 * Serve runtime-uploaded assets from `public/uploads` in both Vite dev and Nitro production.
 * Vite snapshots `public/` at startup (and ignores public watch updates), and Nitro only
 * serves build-time `.output/public` files — so newly uploaded assets must be served here.
 * On ephemeral containers (such as Render Free Tier), missing files are lazily re-hydrated
 * from PostgreSQL (`media.storage_data`) via `hydrateMissingFile` and cached to disk.
 */
export async function serveUploadedFile(
  request: Request,
  url: URL,
  uploadsBaseDir = path.resolve(process.cwd(), "public", "uploads"),
  hydrateMissingFile?: (urlPathname: string) => Promise<Buffer | null>,
): Promise<Response | null> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return null;
  }
  if (!url.pathname.startsWith("/uploads/")) {
    return null;
  }

  let decodedPathname: string;
  try {
    decodedPathname = decodeURIComponent(url.pathname);
  } catch {
    return new Response("Invalid upload path encoding.", { status: 400 });
  }

  if (decodedPathname.includes("\0") || decodedPathname.includes("\\")) {
    return new Response("Forbidden", { status: 403 });
  }

  const relativePath = decodedPathname.slice("/uploads/".length).replace(/^\/+/, "");
  if (!relativePath) {
    return new Response("Not Found", { status: 404 });
  }

  const resolvedFile = path.resolve(uploadsBaseDir, relativePath);
  if (!isPathWithinBase(uploadsBaseDir, resolvedFile)) {
    return new Response("Forbidden", { status: 403 });
  }

  const ext = path.extname(resolvedFile).toLowerCase();
  if (!SAFE_UPLOAD_EXTENSIONS.has(ext)) {
    return new Response("Forbidden", { status: 403 });
  }

  let stat: fs.Stats;
  try {
    stat = await fs.promises.lstat(resolvedFile);
  } catch (err: unknown) {
    const code = (err as { code?: unknown })?.code;
    if (code === "ENOENT" || code === "ENOTDIR") {
      if (hydrateMissingFile) {
        const canonicalUploadPath = `/uploads/${relativePath}`;
        const hydrated = await hydrateMissingFile(canonicalUploadPath).catch(() => null);
        if (hydrated && hydrated.length > 0) {
          try {
            const parentDir = path.dirname(resolvedFile);
            await fs.promises.mkdir(parentDir, { recursive: true });
            const tempPath = path.join(
              parentDir,
              `.${path.basename(resolvedFile)}.${process.pid}.${Date.now()}.tmp`,
            );
            await fs.promises.writeFile(tempPath, hydrated);
            await fs.promises.rename(tempPath, resolvedFile);
            stat = await fs.promises.lstat(resolvedFile);
          } catch {
            // Read-only or non-cacheable filesystem: serve directly from hydrated memory buffer
            return serveBufferResponse(request, hydrated, getMimeFromExtension(ext), 1);
          }
        } else {
          return new Response("Not Found", { status: 404 });
        }
      } else {
        return new Response("Not Found", { status: 404 });
      }
    } else {
      throw err;
    }
  }

  if (stat.isSymbolicLink()) {
    return new Response("Forbidden", { status: 403 });
  }
  if (!stat.isFile()) {
    return new Response("Not Found", { status: 404 });
  }

  try {
    const [realBase, realFile] = await Promise.all([
      fs.promises.realpath(uploadsBaseDir),
      fs.promises.realpath(resolvedFile),
    ]);
    if (!isPathWithinBase(realBase, realFile)) {
      return new Response("Forbidden", { status: 403 });
    }
  } catch {
    return new Response("Not Found", { status: 404 });
  }

  const etag = `W/"${stat.size}-${Math.trunc(stat.mtimeMs)}"`;
  const headers = new Headers({
    "content-type": getMimeFromExtension(ext),
    "content-length": String(stat.size),
    "accept-ranges": "bytes",
    etag,
    "last-modified": stat.mtime.toUTCString(),
    "cache-control": "public, max-age=3600",
    "x-content-type-options": "nosniff",
  });

  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers });
  }

  const rangeHeader = request.headers.get("range");
  if (rangeHeader) {
    const parsedRange = parseSingleByteRange(rangeHeader.trim(), stat.size);
    if (parsedRange.kind === "unsatisfiable") {
      headers.set("content-range", `bytes */${stat.size}`);
      headers.set("content-length", "0");
      return new Response(null, { status: 416, headers });
    }
    if (parsedRange.kind === "range") {
      const { start, end } = parsedRange;
      const chunkLength = end - start + 1;
      headers.set("content-range", `bytes ${start}-${end}/${stat.size}`);
      headers.set("content-length", String(chunkLength));
      if (request.method === "HEAD") {
        return new Response(null, { status: 206, headers });
      }
      const stream = Readable.toWeb(fs.createReadStream(resolvedFile, { start, end }));
      return new Response(stream as unknown as ReadableStream<Uint8Array>, {
        status: 206,
        headers,
      });
    }
  }

  if (request.method === "HEAD") {
    return new Response(null, { status: 200, headers });
  }

  if (stat.size === 0) {
    return new Response(new Uint8Array(0), { status: 200, headers });
  }

  const stream = Readable.toWeb(fs.createReadStream(resolvedFile));
  return new Response(stream as unknown as ReadableStream<Uint8Array>, {
    status: 200,
    headers,
  });
}
