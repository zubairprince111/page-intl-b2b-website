export interface UploadPayload {
  fileName: string;
  base64Data: string; // Data URL or raw base64
  category?: "products" | "banners" | "documents" | "general" | undefined;
}

export interface UploadResult {
  success: boolean;
  id: string;
  url: string;
  filename: string;
  sizeBytes: number;
  mimeType: string;
}

export interface MediaStats {
  totalCount: number;
  totalSizeBytes: number;
  byCategory: {
    products: number;
    banners: number;
    documents: number;
    general: number;
  };
  dbOnline: boolean;
}

export function getMimeFromExtension(ext: string): string {
  switch (ext.toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".gif":
      return "image/gif";
    case ".pdf":
      return "application/pdf";
    case ".mp4":
      return "video/mp4";
    case ".webm":
      return "video/webm";
    default:
      return "application/octet-stream";
  }
}

export function getExtensionFromMime(mime: string): string {
  switch (mime.toLowerCase()) {
    case "image/jpeg":
    case "image/jpg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/svg+xml":
      return ".svg";
    case "image/gif":
      return ".gif";
    case "application/pdf":
      return ".pdf";
    case "video/mp4":
      return ".mp4";
    case "video/webm":
      return ".webm";
    default:
      return ".bin";
  }
}
