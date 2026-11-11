import { db, isPostgres, media } from "@/db";
import { eq, desc } from "drizzle-orm";
import * as fs from "node:fs";
import * as path from "node:path";
import crypto from "node:crypto";
import { getSessionUserCore, type SanitizedUser } from "./auth.server";
import { validateMediaMagicBytes, MAX_IMAGE_DOCUMENT_BYTES, MAX_VIDEO_BYTES } from "./media-magic";
import {
  getMimeFromExtension,
  getExtensionFromMime,
  type MediaListItem,
  type UploadPayload,
  type UploadResult,
  type MediaStats,
} from "./media-types";

export const MAX_DB_PERSISTED_MEDIA_BYTES = 15 * 1024 * 1024; // 15 MB binary ceiling per DB-persisted media row

export function shouldPersistMediaToDatabase(
  env: Record<string, string | undefined> = process.env,
): boolean {
  const driver = (env["STORAGE_DRIVER"] || "").trim().toLowerCase();
  if (driver === "database" || driver === "db") {
    return true;
  }
  if (driver === "local" || driver === "disk") {
    return false;
  }
  return (
    Boolean(env["RENDER"] || env["RENDER_SERVICE_ID"]) &&
    (Boolean(env["DATABASE_URL"]?.trim()) || isPostgres)
  );
}

const ALLOWED_MEDIA_CATEGORIES = new Set(["products", "banners", "documents", "general"]);

function sanitizeMediaCategory(
  rawCategory?: string,
): "products" | "banners" | "documents" | "general" {
  const normalized = (rawCategory || "general").trim().toLowerCase();
  if (!ALLOWED_MEDIA_CATEGORIES.has(normalized)) {
    throw new Error("Invalid media storage category.");
  }
  return normalized as "products" | "banners" | "documents" | "general";
}

// -----------------------------------------------------------------------------
// SECURITY: Path Containment Check
// -----------------------------------------------------------------------------
function assertContainedPath(baseDir: string, filePath: string) {
  const resolvedBase = path.resolve(baseDir);
  const resolvedFile = path.resolve(filePath);
  if (!resolvedFile.startsWith(resolvedBase + path.sep)) {
    throw new Error("Security violation: path traversal detected.");
  }
}

export async function saveAdminMediaBufferCore(params: {
  fileName: string;
  buffer: Buffer;
  category?: string | undefined;
  adminUser: Pick<SanitizedUser, "id" | "role"> | null;
}): Promise<UploadResult> {
  if (!params.adminUser || params.adminUser.role !== "admin") {
    throw new Error("Unauthorized. Administrative privileges required to upload media.");
  }

  if (params.buffer.length === 0) {
    throw new Error("Uploaded file is empty.");
  }

  const category = sanitizeMediaCategory(params.category);

  // Validate magic bytes against allowed MIME types before size check differentiation
  const verifiedMime = validateMediaMagicBytes(params.buffer);
  const maxAllowedBytes = verifiedMime.startsWith("video/")
    ? MAX_VIDEO_BYTES
    : MAX_IMAGE_DOCUMENT_BYTES;
  if (params.buffer.length > maxAllowedBytes) {
    const limitMb = Math.round(maxAllowedBytes / (1024 * 1024));
    throw new Error(`File exceeds maximum allowed size of ${limitMb}MB`);
  }

  // Generate randomized filename to prevent collision and arbitrary script execution
  const ext = getExtensionFromMime(verifiedMime) || path.extname(params.fileName) || ".bin";
  const randomSuffix = crypto.randomBytes(16).toString("hex");
  const cleanFilename = `${category}-${randomSuffix}${ext}`;

  // Target upload folder with path containment verification
  const uploadsBase = path.resolve(process.cwd(), "public", "uploads");
  const targetDir = path.join(uploadsBase, category);
  assertContainedPath(uploadsBase, targetDir);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filePath = path.join(targetDir, cleanFilename);
  assertContainedPath(targetDir, filePath);
  await fs.promises.writeFile(filePath, params.buffer);

  const publicUrl = `/uploads/${category}/${cleanFilename}`;
  const mediaId = `media-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const persistToDb =
    shouldPersistMediaToDatabase() && params.buffer.length <= MAX_DB_PERSISTED_MEDIA_BYTES;

  // Insert record into PostgreSQL media table (with base64 persistence for ephemeral cloud containers)
  await db.insert(media).values({
    id: mediaId,
    filename: cleanFilename,
    originalName: params.fileName || cleanFilename,
    mimeType: verifiedMime,
    sizeBytes: params.buffer.length,
    url: publicUrl,
    category,
    storageData: persistToDb ? params.buffer.toString("base64") : null,
  });

  return {
    success: true,
    id: mediaId,
    url: publicUrl,
    filename: cleanFilename,
    sizeBytes: params.buffer.length,
    mimeType: verifiedMime,
    persistedToDatabase: persistToDb,
  };
}

// -----------------------------------------------------------------------------
// CORE 1: Upload file to disk & persist metadata in PostgreSQL (Base64 RPC)
// -----------------------------------------------------------------------------
export async function uploadMediaCore(data: UploadPayload): Promise<UploadResult> {
  const adminUser = await getSessionUserCore();
  if (!adminUser || adminUser.role !== "admin") {
    throw new Error("Unauthorized. Administrative privileges required to upload media.");
  }

  const { fileName, base64Data, category = "general" } = data;

  let base64Content = base64Data.trim();
  const dataUrlMatch = base64Content.match(/^data:[^,]*;base64,(.+)$/);
  if (dataUrlMatch && dataUrlMatch[1]) {
    base64Content = dataUrlMatch[1];
  }

  const buffer = Buffer.from(base64Content, "base64");
  if (buffer.length > MAX_VIDEO_BYTES) {
    throw new Error("File exceeds maximum allowed size of 100MB");
  }

  return await saveAdminMediaBufferCore({
    fileName,
    buffer,
    category,
    adminUser,
  });
}

// -----------------------------------------------------------------------------
// CORE 2: Delete file from disk & remove record from PostgreSQL
// -----------------------------------------------------------------------------
export async function deleteMediaCore(data: { url?: string | undefined; id?: string | undefined }) {
  // Verify administrative privileges
  const adminUser = await getSessionUserCore();
  if (!adminUser || adminUser.role !== "admin") {
    throw new Error("Unauthorized. Administrative privileges required to delete media.");
  }

  let row: { id: string; url: string } | undefined;
  if (data.id) {
    const rows = await db
      .select({ id: media.id, url: media.url })
      .from(media)
      .where(eq(media.id, data.id))
      .limit(1);
    row = rows[0];
  } else if (data.url) {
    const rows = await db
      .select({ id: media.id, url: media.url })
      .from(media)
      .where(eq(media.url, data.url))
      .limit(1);
    row = rows[0];
  }

  const uploadsBase = path.resolve(process.cwd(), "public", "uploads");

  if (row) {
    const relativePath = row.url.replace(/^\//, "");
    const fullPath = path.resolve(process.cwd(), "public", relativePath);
    try {
      assertContainedPath(uploadsBase, fullPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (err) {
      console.warn("Could not delete file from disk:", fullPath, err);
    }
    await db.delete(media).where(eq(media.id, row.id));
    return { success: true, deleted: true, id: row.id };
  }

  return { success: false, message: "Media record not found" };
}

// -----------------------------------------------------------------------------
// CORE 3: Query media metadata records from PostgreSQL (excludes blob payloads)
// -----------------------------------------------------------------------------
  export async function listMediaCore(data?: {
    category?: string | undefined;
  }): Promise<MediaListItem[]> {
    const all = await db
      .select({
        id: media.id,
        filename: media.filename,
        originalName: media.originalName,
        mimeType: media.mimeType,
        sizeBytes: media.sizeBytes,
        url: media.url,
        category: media.category,
        createdAt: media.createdAt,
      })
      .from(media)
      .orderBy(desc(media.createdAt));

    if (data?.category && data.category !== "all") {
      return all.filter((m) => m.category === data.category);
    }
    return all;
  }

  // -----------------------------------------------------------------------------
  // CORE 4: Sync existing files on disk into PostgreSQL media table
  // -----------------------------------------------------------------------------
  export async function syncExistingMediaCore() {
    const categories: ("products" | "banners" | "documents" | "general")[] = [
      "products",
      "banners",
      "documents",
      "general",
    ];
    let addedCount = 0;
    const persistToDb = shouldPersistMediaToDatabase();

    for (const cat of categories) {
      const dirPath = path.resolve(process.cwd(), "public", "uploads", cat);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        continue;
      }

      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stats = fs.statSync(fullPath);
        if (!stats.isFile()) continue;

        const url = `/uploads/${cat}/${file}`;
        const existing = await db
          .select({ id: media.id })
          .from(media)
          .where(eq(media.url, url))
          .limit(1);

        if (existing.length === 0) {
          const ext = path.extname(file);
          const mimeType = getMimeFromExtension(ext);
          const id = `media-sync-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
          let storageData: string | null = null;
          if (persistToDb && stats.size > 0 && stats.size <= MAX_DB_PERSISTED_MEDIA_BYTES) {
            storageData = (await fs.promises.readFile(fullPath)).toString("base64");
          }
          await db.insert(media).values({
            id,
            filename: file,
            originalName: file,
            mimeType,
            sizeBytes: stats.size,
            url,
            category: cat,
            storageData,
          });
          addedCount++;
        }
      }
    }

    return { success: true, addedCount };
  }

  // -----------------------------------------------------------------------------
  // CORE 5: Get media statistics
  // -----------------------------------------------------------------------------
  export async function getMediaStatsCore(): Promise<MediaStats> {
    const all = await db
      .select({
        sizeBytes: media.sizeBytes,
        category: media.category,
      })
      .from(media);
    const byCategory = {
      products: 0,
      banners: 0,
      documents: 0,
      general: 0,
    };

    let totalSizeBytes = 0;
    for (const item of all) {
      totalSizeBytes += item.sizeBytes || 0;
      if (item.category in byCategory) {
        byCategory[item.category as keyof typeof byCategory]++;
      } else {
        byCategory.general++;
      }
    }

    return {
      totalCount: all.length,
      totalSizeBytes,
      byCategory,
      dbOnline: true,
    };
  }

  // -----------------------------------------------------------------------------
  // CORE 6: Hydrate missing /uploads/* file from PostgreSQL after container reset
  // -----------------------------------------------------------------------------
  export async function hydrateMediaBufferByUrlCore(urlPathname: string): Promise<Buffer | null> {
    if (!urlPathname.startsWith("/uploads/")) {
      return null;
    }
    const rows = await db
      .select({ storageData: media.storageData })
      .from(media)
      .where(eq(media.url, urlPathname))
      .limit(1);

    const encoded = rows[0]?.storageData;
    if (!encoded || encoded.length === 0) {
      return null;
    }
    return Buffer.from(encoded, "base64");
  }
