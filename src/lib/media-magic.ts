export const MAX_IMAGE_DOCUMENT_BYTES = 50 * 1024 * 1024; // 50 MB
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB

/**
 * Inspect magic bytes of an uploaded buffer and return the canonical verified MIME type.
 * Rejects executable scripts, SVGs, HTML, and spoofed file extensions.
 */
export function validateMediaMagicBytes(buffer: Buffer): string {
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
  if (
    buffer.length >= 6 &&
    (buffer.toString("ascii", 0, 6) === "GIF87a" || buffer.toString("ascii", 0, 6) === "GIF89a")
  ) {
    return "image/gif";
  }
  if (buffer.length >= 4 && buffer.toString("ascii", 0, 4) === "%PDF") {
    return "application/pdf";
  }
  // ISO Base Media File Format (MP4 / M4V): bytes 4..7 are ASCII "ftyp"
  if (buffer.length >= 12 && buffer.toString("ascii", 4, 8) === "ftyp") {
    return "video/mp4";
  }
  // WebM (EBML header 0x1A 0x45 0xDF 0xA3 with "webm" DocType in initial header bytes)
  if (
    buffer.length >= 16 &&
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3 &&
    buffer.subarray(0, 64).includes(Buffer.from("webm"))
  ) {
    return "video/webm";
  }

  throw new Error(
    "Invalid file content. Only authentic JPEG, PNG, WEBP, GIF, PDF, MP4, and WebM files are accepted.",
  );
}
