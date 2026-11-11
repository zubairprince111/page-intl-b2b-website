import { describe, expect, it } from "vitest";
import {
  DEFAULT_SHOP_BANNER_VIDEO_URL,
  applyActiveShopBannerVideo,
  normalizeShopBannerVideoConfig,
  removeShopBannerVideo,
  sanitizeShopBannerVideoUrl,
} from "@/lib/shop-banner-video";

describe("Shop Page Hero Banner Video Configuration", () => {
  it("sanitizes valid relative and HTTP/HTTPS video URLs and rejects unsafe schemes", () => {
    expect(sanitizeShopBannerVideoUrl(" /1013.mp4 ")).toBe("/1013.mp4");
    expect(sanitizeShopBannerVideoUrl("/uploads/banners/promo.mp4")).toBe(
      "/uploads/banners/promo.mp4",
    );
    expect(sanitizeShopBannerVideoUrl("https://cdn.example.com/shop-hero.mp4")).toBe(
      "https://cdn.example.com/shop-hero.mp4",
    );

    expect(() => sanitizeShopBannerVideoUrl("")).toThrow();
    expect(() => sanitizeShopBannerVideoUrl("//evil.com/banner.mp4")).toThrow();
    expect(() => sanitizeShopBannerVideoUrl("javascript:alert(1)")).toThrow();
    expect(() => sanitizeShopBannerVideoUrl("data:text/html,<script>")).toThrow();
  });

  it("normalizes empty or invalid storage payloads to the default single video", () => {
    expect(normalizeShopBannerVideoConfig(undefined)).toEqual({
      activeVideoUrl: DEFAULT_SHOP_BANNER_VIDEO_URL,
      videos: [],
    });

    const normalized = normalizeShopBannerVideoConfig({
      activeVideoUrl: "javascript:bad()",
      videos: [
        { id: "v1", title: "Custom Promo", url: "/uploads/banners/custom.mp4" },
        { id: "v2", title: "Duplicate", url: "/uploads/banners/custom.mp4" },
        { id: "v3", title: "Unsafe", url: "javascript:alert(1)" },
      ],
    });

    expect(normalized.activeVideoUrl).toBe(DEFAULT_SHOP_BANNER_VIDEO_URL);
    expect(normalized.videos).toHaveLength(1);
    expect(normalized.videos[0]).toMatchObject({
      id: "v1",
      title: "Custom Promo",
      url: "/uploads/banners/custom.mp4",
    });
  });

  it("switches strictly one active video at a time without duplicating presets", () => {
    let config = normalizeShopBannerVideoConfig(undefined);

    config = applyActiveShopBannerVideo(config, "/uploads/banners/bay-demo.mp4", "Bay Demo");
    expect(config.activeVideoUrl).toBe("/uploads/banners/bay-demo.mp4");
    expect(config.videos).toHaveLength(1);

    // Switching to built-in preset sets it as single active URL without adding duplicate row to custom list
    config = applyActiveShopBannerVideo(config, "/1015.mp4", "Automotive Equipment Reel");
    expect(config.activeVideoUrl).toBe("/1015.mp4");
    expect(config.videos).toHaveLength(1);

    // Removing custom video keeps active preset untouched
    const removedInactive = removeShopBannerVideo(config, config.videos[0]!.id);
    expect(removedInactive.nextConfig.activeVideoUrl).toBe("/1015.mp4");
    expect(removedInactive.nextConfig.videos).toHaveLength(0);

    // Setting and then removing an active custom video falls back cleanly to default video
    config = applyActiveShopBannerVideo(
      removedInactive.nextConfig,
      "/uploads/banners/active-custom.mp4",
      "Active Custom",
    );
    expect(config.activeVideoUrl).toBe("/uploads/banners/active-custom.mp4");
    const removedActive = removeShopBannerVideo(config, config.videos[0]!.id);
    expect(removedActive.removedUrl).toBe("/uploads/banners/active-custom.mp4");
    expect(removedActive.nextConfig.activeVideoUrl).toBe(DEFAULT_SHOP_BANNER_VIDEO_URL);
    expect(removedActive.nextConfig.videos).toHaveLength(0);
  });
});
