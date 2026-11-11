export const DEFAULT_SHOP_BANNER_VIDEO_URL = "/1013.mp4";
export const SHOP_BANNER_VIDEO_SETTING_KEY = "shop_banner_video";

export interface ShopBannerVideoItem {
  id: string;
  title: string;
  url: string;
  createdAt: string;
}

export interface ShopBannerVideoPreset {
  id: string;
  title: string;
  url: string;
  subtitle: string;
}

export interface ShopBannerVideoConfig {
  activeVideoUrl: string;
  videos: ShopBannerVideoItem[];
}

export const PRESET_SHOP_BANNER_VIDEOS: ShopBannerVideoPreset[] = [
  {
    id: "preset-shop-default",
    title: "Default Shop Banner Video",
    url: "/1013.mp4",
    subtitle: "Original workshop showcase loop (Recommended shop banner ratio)",
  },
  {
    id: "preset-hero-showcase",
    title: "Automotive Equipment Reel",
    url: "/1015.mp4",
    subtitle: "Full-width garage & machinery highlight reel",
  },
];

function hasControlCharacters(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code <= 31 || code === 127) {
      return true;
    }
  }
  return false;
}

export function sanitizeShopBannerVideoUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    throw new Error("Video URL or path is required.");
  }
  if (hasControlCharacters(trimmed)) {
    throw new Error("Invalid control characters in video URL.");
  }

  // Allow root-relative paths like /1013.mp4 or /uploads/banners/...mp4 (but reject //protocol-relative)
  if (trimmed.startsWith("/")) {
    if (trimmed.startsWith("//") || trimmed.includes("\\")) {
      throw new Error("Invalid relative video path.");
    }
    return trimmed;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(
      "Video URL must start with `/` (e.g. /uploads/banners/...) or `https://` / `http://`.",
    );
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Only `/...`, `http://`, or `https://` video URLs are allowed.");
  }

  return parsed.toString();
}

export function normalizeShopBannerVideoConfig(raw: unknown): ShopBannerVideoConfig {
  const record =
    raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};

  let activeVideoUrl = DEFAULT_SHOP_BANNER_VIDEO_URL;
  if (typeof record["activeVideoUrl"] === "string") {
    try {
      activeVideoUrl = sanitizeShopBannerVideoUrl(record["activeVideoUrl"]);
    } catch {
      activeVideoUrl = DEFAULT_SHOP_BANNER_VIDEO_URL;
    }
  }

  const seenUrls = new Set<string>();
  const videos: ShopBannerVideoItem[] = [];

  if (Array.isArray(record["videos"])) {
    for (let i = 0; i < record["videos"].length; i++) {
      const entry = record["videos"][i];
      if (!entry || typeof entry !== "object") continue;
      const item = entry as Record<string, unknown>;
      if (typeof item["url"] !== "string") continue;

      let safeUrl: string;
      try {
        safeUrl = sanitizeShopBannerVideoUrl(item["url"]);
      } catch {
        continue;
      }

      if (seenUrls.has(safeUrl)) continue;
      seenUrls.add(safeUrl);

      videos.push({
        id:
          typeof item["id"] === "string" && item["id"].trim()
            ? item["id"].trim()
            : `shop-vid-${i + 1}`,
        title:
          typeof item["title"] === "string" && item["title"].trim()
            ? item["title"].trim()
            : safeUrl.split("/").pop() || "Shop Banner Video",
        url: safeUrl,
        createdAt:
          typeof item["createdAt"] === "string" && item["createdAt"].trim()
            ? item["createdAt"]
            : new Date().toISOString(),
      });
    }
  }

  return {
    activeVideoUrl,
    videos,
  };
}

export function isPresetShopBannerVideoUrl(url: string): boolean {
  return PRESET_SHOP_BANNER_VIDEOS.some((preset) => preset.url === url);
}

export function applyActiveShopBannerVideo(
  config: ShopBannerVideoConfig,
  rawUrl: string,
  title?: string,
): ShopBannerVideoConfig {
  const safeUrl = sanitizeShopBannerVideoUrl(rawUrl);
  const existing = config.videos.find((v) => v.url === safeUrl);
  const isPreset = isPresetShopBannerVideoUrl(safeUrl);

  if (existing || isPreset) {
    return {
      activeVideoUrl: safeUrl,
      videos: existing
        ? config.videos.map((v) =>
            v.url === safeUrl && title?.trim() ? { ...v, title: title.trim() } : v,
          )
        : config.videos,
    };
  }

  const fallbackName = safeUrl.split("/").pop()?.split("?")[0] || "Custom Shop Video";
  const nextItem: ShopBannerVideoItem = {
    id: `shop-vid-${Date.now().toString(36)}`,
    title: title?.trim() || fallbackName,
    url: safeUrl,
    createdAt: new Date().toISOString(),
  };

  return {
    activeVideoUrl: safeUrl,
    videos: [nextItem, ...config.videos],
  };
}

export function removeShopBannerVideo(
  config: ShopBannerVideoConfig,
  videoId: string,
): { nextConfig: ShopBannerVideoConfig; removedUrl: string | null } {
  const target = config.videos.find((v) => v.id === videoId);
  if (!target) {
    return { nextConfig: config, removedUrl: null };
  }

  const remaining = config.videos.filter((v) => v.id !== videoId);
  const nextActive =
    config.activeVideoUrl === target.url
      ? remaining[0]?.url || DEFAULT_SHOP_BANNER_VIDEO_URL
      : config.activeVideoUrl;

  return {
    nextConfig: {
      activeVideoUrl: nextActive,
      videos: remaining,
    },
    removedUrl: target.url,
  };
}
