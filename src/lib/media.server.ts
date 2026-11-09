import { db, media } from "@/db";
import type { MediaRow } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import * as fs from "node:fs";
import * as path from "node:path";
import crypto from "node:crypto";
import { getSessionUserCore } from "./auth.server";
import {
  getMimeFromExtension,
  getExtensionFromMime,
  type UploadPayload,
  type UploadResult,
  type MediaStats,
} from "./media-types";

// -----------------------------------------------------------------------------
// SECURITY: Validate Magic Bytes
// -----------------------------------------------------------------------------
function validateMagicBytes(buffer: Buffer): string {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  if (buffer.length >= 4 && buffer.toString("ascii", 0, 4) === "%PDF") {
    return "application/pdf";
  }
  throw new Error(
    "Invalid file content. Only authentic JPEG, PNG, WEBP, and PDF files are accepted.",
  );
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

// -----------------------------------------------------------------------------
// CORE 1: Upload file to disk & persist metadata in PostgreSQL
// -----------------------------------------------------------------------------
export async function uploadMediaCore(data: UploadPayload): Promise<UploadResult> {
  // 1. Verify administrative privileges
  const adminUser = await getSessionUserCore();
  if (!adminUser || adminUser.role !== "admin") {
    throw new Error("Unauthorized. Administrative privileges required to upload media.");
  }

  const { fileName, base64Data, category = "general" } = data;

  let base64Content = base64Data;
  const dataUrlMatch = base64Data.match(/^data:([^;]+);base64,(.+)$/);
  if (dataUrlMatch && dataUrlMatch[2]) {
    base64Content = dataUrlMatch[2];
  }

  const buffer = Buffer.from(base64Content, "base64");
  if (buffer.length > 50 * 1024 * 1024) {
    throw new Error("File exceeds maximum allowed size of 50MB");
  }

  // 2. Validate magic bytes against allowed MIME types
  const verifiedMime = validateMagicBytes(buffer);

  // 3. Generate randomized filename to prevent collision and arbitrary script execution
  const ext = getExtensionFromMime(verifiedMime) || path.extname(fileName) || ".jpg";
  const randomSuffix = crypto.randomBytes(16).toString("hex");
  const cleanFilename = `${category}-${randomSuffix}${ext}`;

  // 4. Target upload folder with path containment verification
  const uploadsBase = path.resolve(process.cwd(), "public", "uploads");
  const targetDir = path.join(uploadsBase, category);
  assertContainedPath(uploadsBase, targetDir);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filePath = path.join(targetDir, cleanFilename);
  assertContainedPath(targetDir, filePath);
  fs.writeFileSync(filePath, buffer);

  const publicUrl = `/uploads/${category}/${cleanFilename}`;
  const mediaId = `media-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

  // 5. Insert record into PostgreSQL media table
  await db.insert(media).values({
    id: mediaId,
    filename: cleanFilename,
    originalName: fileName,
    mimeType: verifiedMime,
    sizeBytes: buffer.length,
    url: publicUrl,
    category,
  });

  return {
    success: true,
    id: mediaId,
    url: publicUrl,
    filename: cleanFilename,
    sizeBytes: buffer.length,
    mimeType: verifiedMime,
  };
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

  let row: MediaRow | undefined;
  if (data.id) {
    const rows = await db.select().from(media).where(eq(media.id, data.id)).limit(1);
    row = rows[0];
  } else if (data.url) {
    const rows = await db.select().from(media).where(eq(media.url, data.url)).limit(1);
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
// CORE 3: Query media records from PostgreSQL
// -----------------------------------------------------------------------------
export async function listMediaCore(data?: { category?: string | undefined }) {
  const all = await db.select().from(media).orderBy(desc(media.createdAt));
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
      const existing = await db.select().from(media).where(eq(media.url, url)).limit(1);

      if (existing.length === 0) {
        const ext = path.extname(file);
        const mimeType = getMimeFromExtension(ext);
        const id = `media-sync-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
        await db.insert(media).values({
          id,
          filename: file,
          originalName: file,
          mimeType,
          sizeBytes: stats.size,
          url,
          category: cat,
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
  const all = await db.select().from(media);
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
