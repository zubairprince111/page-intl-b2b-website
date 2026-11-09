import {
  uploadMediaServerFn,
  deleteMediaServerFn,
  listMediaServerFn,
  getMediaStatsServerFn,
  syncExistingMediaServerFn,
  type UploadResult,
  type MediaStats,
} from "./media";
import type { MediaRow } from "@/db/schema";

export type MediaCategory = "products" | "banners" | "documents" | "general";

/**
 * Format raw byte size into human readable string (KB, MB, GB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Read File object as Base64 Data URL
 */
export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) resolve(result);
      else reject(new Error("Failed to read file as Data URL"));
    };
    reader.onerror = () => reject(reader.error || new Error("File read error"));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload a browser File to the VPS/local disk & persist in PostgreSQL
 */
export async function uploadMediaFile(
  file: File,
  category: MediaCategory = "general",
): Promise<UploadResult> {
  if (file.size > 50 * 1024 * 1024) {
    throw new Error("File exceeds maximum allowed size of 50MB");
  }

  const base64Data = await readFileAsBase64(file);
  return await uploadMediaServerFn({
    data: {
      fileName: file.name,
      base64Data,
      category,
    },
  });
}

/**
 * Upload a raw base64 string to the server & persist in PostgreSQL
 */
export async function uploadBase64Media(
  fileName: string,
  base64Data: string,
  category: MediaCategory = "general",
): Promise<UploadResult> {
  return await uploadMediaServerFn({
    data: {
      fileName,
      base64Data,
      category,
    },
  });
}

/**
 * Delete a media file from disk and PostgreSQL
 */
export async function deleteMediaFile(target: { url?: string; id?: string }): Promise<boolean> {
  const result = await deleteMediaServerFn({ data: target });
  return !!result.success;
}

/**
 * List media records from PostgreSQL
 */
export async function fetchMediaList(category?: string): Promise<MediaRow[]> {
  const payload = category ? { category } : {};
  const list = await listMediaServerFn({ data: payload });
  return list as unknown as MediaRow[];
}

/**
 * Fetch storage usage statistics
 */
export async function fetchMediaStats(): Promise<MediaStats> {
  return await getMediaStatsServerFn();
}

/**
 * Scan public/uploads disk directory and index any uncataloged files into PostgreSQL
 */
export async function syncDiskFiles(): Promise<{ addedCount: number }> {
  const res = await syncExistingMediaServerFn();
  return { addedCount: res.addedCount };
}
