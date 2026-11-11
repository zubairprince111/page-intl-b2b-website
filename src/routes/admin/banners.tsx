import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useBanners,
  useSaveBanner,
  useDeleteBanner,
  useReorderBanners,
  useAdminShopBannerVideo,
  useSaveShopBannerVideo,
} from "@/lib/data-client";
import {
  ImageIcon,
  Film,
  Plus,
  Trash2,
  Edit3,
  MoveUp,
  MoveDown,
  Eye,
  ExternalLink,
  RotateCcw,
  Check,
  X,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useState, useRef, useMemo } from "react";
import { uploadMediaFile, deleteMediaFile } from "@/lib/client-media";
import {
  DEFAULT_SHOP_BANNER_VIDEO_URL,
  PRESET_SHOP_BANNER_VIDEOS,
  applyActiveShopBannerVideo,
  isPresetShopBannerVideoUrl,
  removeShopBannerVideo,
  sanitizeShopBannerVideoUrl,
} from "@/lib/shop-banner-video";

export const Route = createFileRoute("/admin/banners")({
  component: AdminBanners,
  head: () => ({
    meta: [{ title: "Banners Management — PAGE Admin" }],
  }),
});

// Preset banner options for quick selection
const BANNER_PRESETS = [
  {
    title: "Durga Puja — Launch Special Offer (20% OFF)",
    image: "/durga-puja-launch-banner.png",
    alt: "Launch Professional Diagnostic Solutions — Special Offer Durga Puja Get Up To 20% Off",
    link: "/shop",
    mobilityKey: "4-Wheeler" as const,
    bgColor: "bg-white",
  },
  {
    title: "4-Wheeler Highway Fuel Efficiency Showcase",
    image: "/Fuel%20Efficiency%20Highway%20Showcase.png",
    alt: "4-Wheeler Mobility Showcase — Fuel Efficiency",
    link: "/shop?mobility=4-Wheeler",
    mobilityKey: "4-Wheeler" as const,
    bgColor: "bg-gradient-to-r from-amber-950/40 via-zinc-950 to-sky-950/40",
  },
  {
    title: "2-Wheeler Automotive Diagnostics Showcase",
    image: "/Futuristic%20Automotive%20Diagnostics%20Showcase.png",
    alt: "2-Wheeler Mobility Showcase — Automotive Diagnostics",
    link: "/shop?mobility=2-Wheeler",
    mobilityKey: "2-Wheeler" as const,
    bgColor: "bg-zinc-900",
  },
  {
    title: "3-Wheeler Workshop Lift 4.0 Ton Showcase",
    image: "/Page%20Two-Post%20Lift%204.0%20Ton.png",
    alt: "3-Wheeler Mobility Showcase — Two-Post Lift 4.0 Ton",
    link: "/shop?mobility=3-Wheeler",
    mobilityKey: "3-Wheeler" as const,
    bgColor: "bg-white",
  },
];

const BG_COLOR_OPTIONS = [
  { label: "Clean White", value: "bg-white", swatch: "bg-white" },
  { label: "Dark Zinc", value: "bg-zinc-900", swatch: "bg-zinc-900" },
  {
    label: "Amber Glow Gradient",
    value: "bg-gradient-to-r from-amber-950/40 via-zinc-950 to-sky-950/40",
    swatch: "bg-gradient-to-r from-amber-900 to-sky-950",
  },
  {
    label: "Emerald Gradient",
    value: "bg-gradient-to-r from-emerald-950/50 via-zinc-950 to-teal-950/40",
    swatch: "bg-gradient-to-r from-emerald-900 to-teal-900",
  },
  { label: "Pure Black", value: "bg-black", swatch: "bg-black" },
];

function AdminBanners() {
  const { data: rawBanners = [], isLoading } = useBanners();
  const saveBannerMutation = useSaveBanner();
  const deleteBannerMutation = useDeleteBanner();
  const reorderBannersMutation = useReorderBanners();
  const { data: shopVideoConfig } = useAdminShopBannerVideo();
  const saveShopVideoMutation = useSaveShopBannerVideo();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Shop Page Hero Banner Video State (1 active video at a time)
  const [shopVideoTab, setShopVideoTab] = useState<"upload" | "url">("upload");
  const [shopVideoTitleInput, setShopVideoTitleInput] = useState("");
  const [shopVideoUrlInput, setShopVideoUrlInput] = useState("");
  const [isUploadingShopVideo, setIsUploadingShopVideo] = useState(false);
  const [isDraggingShopVideo, setIsDraggingShopVideo] = useState(false);
  const [shopVideoError, setShopVideoError] = useState<string | null>(null);
  const shopVideoInputRef = useRef<HTMLInputElement>(null);

  const currentShopVideoConfig = useMemo(
    () =>
      shopVideoConfig ?? {
        activeVideoUrl: DEFAULT_SHOP_BANNER_VIDEO_URL,
        videos: [],
      },
    [shopVideoConfig],
  );
  const activeShopVideoUrl = currentShopVideoConfig.activeVideoUrl || DEFAULT_SHOP_BANNER_VIDEO_URL;

  const banners = useMemo(() => {
    return rawBanners.map((b: any) => ({
      id: b.id,
      title: b.title,
      alt: b.subtitle || b.title,
      image: b.imageUrl,
      link: b.link || "/shop",
      mobilityKey: (b.badge as any) || "All",
      bgColor: "bg-white",
      active: b.isActive,
      order: b.sortOrder,
    }));
  }, [rawBanners]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formAlt, setFormAlt] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formLink, setFormLink] = useState("/shop");
  const [formMobilityKey, setFormMobilityKey] = useState<
    "4-Wheeler" | "2-Wheeler" | "3-Wheeler" | "All"
  >("All");
  const [formBgColor, setFormBgColor] = useState("bg-white");
  const [formActive, setFormActive] = useState(true);
  const [imageTab, setImageTab] = useState<"upload" | "presets" | "url">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  function handleOpenAdd() {
    setEditingBannerId(null);
    setFormTitle("");
    setFormAlt("");
    setFormImage("/durga-puja-launch-banner.png");
    setFormLink("/shop");
    setFormMobilityKey("All");
    setFormBgColor("bg-white");
    setFormActive(true);
    setImageTab("upload");
    setIsModalOpen(true);
  }

  function handleOpenEdit(b: any) {
    setEditingBannerId(b.id);
    setFormTitle(b.title);
    setFormAlt(b.alt);
    setFormImage(b.image);
    setFormLink(b.link || "/shop");
    setFormMobilityKey(b.mobilityKey || "All");
    setFormBgColor(b.bgColor || "bg-white");
    setFormActive(b.active);
    setImageTab(b.image.startsWith("data:") ? "upload" : "url");
    setIsModalOpen(true);
  }

  async function handleSaveForm(e: React.FormEvent) {
    e.preventDefault();
    if (!formImage.trim()) {
      alert("Please upload or provide an image for the banner.");
      return;
    }

    await saveBannerMutation.mutateAsync({
      id: editingBannerId || undefined,
      title: formTitle.trim() || "Featured Equipment Banner",
      subtitle: formAlt.trim() || formTitle.trim() || "Featured Equipment Showcase",
      imageUrl: formImage.trim(),
      link: formLink.trim() || "/shop",
      badge: formMobilityKey,
      category: "Commercial Machinery",
      isActive: formActive,
    });

    showToast(editingBannerId ? "Banner updated successfully" : "New banner added to carousel");
    setIsModalOpen(false);
  }

  async function handleDelete(id: string) {
    const banner = banners.find((b) => b.id === id);
    if (banner && banner.image.startsWith("/uploads/")) {
      try {
        await deleteMediaFile({ url: banner.image });
      } catch (err) {
        console.warn("Could not delete banner media file:", err);
      }
    }
    await deleteBannerMutation.mutateAsync(id);
    setDeleteConfirmId(null);
    showToast("Banner deleted successfully");
  }

  async function handleToggle(id: string) {
    const b = banners.find((item) => item.id === id);
    if (b) {
      await saveBannerMutation.mutateAsync({
        id,
        title: b.title,
        imageUrl: b.image,
        isActive: !b.active,
      });
      showToast("Banner status updated");
    }
  }

  async function handleMove(id: string, direction: "up" | "down") {
    const idx = banners.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= banners.length) return;

    const newOrder = [...banners];
    const [moved] = newOrder.splice(idx, 1);
    if (!moved) return;
    newOrder.splice(targetIdx, 0, moved);

    await reorderBannersMutation.mutateAsync(newOrder.map((b) => b.id));
    showToast("Banner reordered");
  }

  function handleResetDefaults() {
    showToast("Default banners preserved in database.");
  }

  async function uploadBannerImageFile(file: File) {
    if (file.size > 20 * 1024 * 1024) {
      alert("Please select an image smaller than 20MB");
      return;
    }
    try {
      setIsUploading(true);
      const res = await uploadMediaFile(file, "banners");
      if (res.success && res.url) {
        setFormImage(res.url);
        if (!formTitle) {
          setFormTitle(file.name.replace(/\.[^/.]+$/, ""));
        }
        showToast("Banner image saved to server storage & PostgreSQL");
      }
    } catch (err: any) {
      console.error("Banner upload error:", err);
      alert(err.message || "Failed to upload banner image");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) {
      await uploadBannerImageFile(file);
    }
  }

  function handleBannerDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isUploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void uploadBannerImageFile(file);
    }
  }

  async function uploadShopVideoFile(file: File) {
    const lowerName = file.name.toLowerCase();
    const isAllowedVideo =
      file.type === "video/mp4" ||
      file.type === "video/webm" ||
      lowerName.endsWith(".mp4") ||
      lowerName.endsWith(".webm");
    if (!isAllowedVideo) {
      setShopVideoError("Please select a valid MP4 or WebM video file.");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setShopVideoError("Video file exceeds maximum allowed size of 100MB.");
      return;
    }

    try {
      setShopVideoError(null);
      setIsUploadingShopVideo(true);
      const res = await uploadMediaFile(file, "banners");
      if (!res.success || !res.url) {
        throw new Error("Server did not return an uploaded video URL.");
      }

      const nextTitle =
        shopVideoTitleInput.trim() || file.name.replace(/\.[^/.]+$/, "") || "Custom Shop Video";
      const nextConfig = applyActiveShopBannerVideo(currentShopVideoConfig, res.url, nextTitle);
      await saveShopVideoMutation.mutateAsync(nextConfig);
      setShopVideoTitleInput("");
      showToast("Shop banner video uploaded & set live on /shop");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload shop banner video.";
      console.error("Shop video upload error:", err);
      setShopVideoError(msg);
    } finally {
      setIsUploadingShopVideo(false);
    }
  }

  function handleShopVideoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) {
      void uploadShopVideoFile(file);
    }
  }

  function handleShopVideoDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingShopVideo(false);
    if (isUploadingShopVideo) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void uploadShopVideoFile(file);
    }
  }

  async function handleSaveShopVideoUrl(e: React.FormEvent) {
    e.preventDefault();
    try {
      setShopVideoError(null);
      const safeUrl = sanitizeShopBannerVideoUrl(shopVideoUrlInput);
      const nextConfig = applyActiveShopBannerVideo(
        currentShopVideoConfig,
        safeUrl,
        shopVideoTitleInput.trim() || undefined,
      );
      await saveShopVideoMutation.mutateAsync(nextConfig);
      setShopVideoUrlInput("");
      setShopVideoTitleInput("");
      showToast("Shop banner video updated & set live on /shop");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid video URL or path.";
      setShopVideoError(msg);
    }
  }

  async function handleSelectActiveShopVideo(url: string, title?: string) {
    try {
      setShopVideoError(null);
      const nextConfig = applyActiveShopBannerVideo(currentShopVideoConfig, url, title);
      await saveShopVideoMutation.mutateAsync(nextConfig);
      showToast("Active shop banner video switched");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to switch shop banner video.";
      setShopVideoError(msg);
    }
  }

  async function handleRemoveCustomShopVideo(videoId: string) {
    try {
      setShopVideoError(null);
      const { nextConfig, removedUrl } = removeShopBannerVideo(currentShopVideoConfig, videoId);
      await saveShopVideoMutation.mutateAsync(nextConfig);
      if (removedUrl && removedUrl.startsWith("/uploads/")) {
        try {
          await deleteMediaFile({ url: removedUrl });
        } catch (err) {
          console.warn("Could not delete shop video media file:", err);
        }
      }
      showToast("Custom shop video removed");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to remove custom shop video.";
      setShopVideoError(msg);
    }
  }

  const activeCount = useMemo(() => banners.filter((b) => b.active).length, [banners]);

  return (
    <AdminLayout activeRoute="/admin/banners">
      <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-emerald-500 text-white px-4 py-2.5 rounded-lg shadow-xl text-sm font-medium animate-in fade-in slide-in-from-top-3">
            <Check className="h-4 w-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Storefront Showcase
              </span>
              <span className="text-zinc-500 text-xs">•</span>
              <span className="text-zinc-400 text-xs">Section 02: Commercial Machinery</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              Featured Equipment Banners
            </h1>
            <p className="text-[13px] text-zinc-400 mt-1">
              Add, reorder, or delete slides appearing in the Featured Equipment banner carousel on
              the homepage.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/#mobility-ecosystem"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] text-[12px] font-medium px-3.5 py-2 rounded-lg border border-white/[0.08] transition-colors"
            >
              <Eye className="h-3.5 w-3.5 text-zinc-400" />
              <span>Preview on Site</span>
              <ExternalLink className="h-3 w-3 text-zinc-500" />
            </a>

            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 bg-white/[0.04] hover:bg-white/[0.08] text-[12px] px-3 py-2 rounded-lg border border-white/[0.08] transition-colors"
              title="Reset default banners"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[13px] font-medium px-4 py-2 rounded-lg shadow-sm transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add Banner</span>
            </button>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#232323] border border-white/[0.06] rounded-xl p-4">
            <p className="text-xs text-zinc-400">Total Banners</p>
            <p className="text-xl font-bold text-white mt-1">{banners.length}</p>
          </div>
          <div className="bg-[#232323] border border-white/[0.06] rounded-xl p-4">
            <p className="text-xs text-zinc-400">Active in Carousel</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">{activeCount}</p>
          </div>
          <div className="bg-[#232323] border border-white/[0.06] rounded-xl p-4">
            <p className="text-xs text-zinc-400">Hidden / Draft</p>
            <p className="text-xl font-bold text-zinc-400 mt-1">{banners.length - activeCount}</p>
          </div>
          <div className="bg-[#232323] border border-white/[0.06] rounded-xl p-4">
            <p className="text-xs text-zinc-400">Carousel Cycle</p>
            <p className="text-xl font-bold text-sky-400 mt-1">5s Auto-play</p>
          </div>
        </div>

        {/* Shop Page Hero Banner Video (One Active at a Time) */}
        <div className="bg-[#232323] border border-white/[0.06] rounded-xl p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div>
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4 text-sky-400" />
                <h2 className="text-sm font-semibold text-white">Shop Page Hero Banner Video</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  1 Active Video Shown
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Change the single looping video shown above the product catalog on{" "}
                <code className="text-zinc-300 font-mono">/shop</code>. Uses the same banner aspect
                ratio and auto-plays cleanly with no player controls.
              </p>
            </div>
            <a
              href="/shop"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium px-3 py-1.5 rounded-lg border border-white/[0.08] transition-colors shrink-0 self-start sm:self-center"
            >
              <Eye className="h-3.5 w-3.5 text-zinc-400" />
              <span>View /shop Banner</span>
              <ExternalLink className="h-3 w-3 text-zinc-500" />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Live Preview in exact Shop Banner ratio */}
            <div className="lg:col-span-6 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-300">
                  Live Storefront Banner Ratio Preview
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  h-40..h-64 / object-cover
                </span>
              </div>
              <div className="relative w-full rounded-2xl overflow-hidden bg-zinc-950 border border-white/[0.1] shadow-md">
                <div className="relative w-full h-40 sm:h-48 lg:h-52 max-h-[265px] flex items-center justify-center bg-black overflow-hidden">
                  <video
                    key={activeShopVideoUrl}
                    src={activeShopVideoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    disablePictureInPicture
                    disableRemotePlayback
                    className="w-full h-full object-cover object-center pointer-events-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 bg-black/30 border border-white/[0.06] rounded-lg px-3 py-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-emerald-400">Active on /shop</p>
                  <p
                    className="text-[11px] font-mono text-zinc-400 truncate"
                    title={activeShopVideoUrl}
                  >
                    {activeShopVideoUrl}
                  </p>
                </div>
                {activeShopVideoUrl !== DEFAULT_SHOP_BANNER_VIDEO_URL && (
                  <button
                    type="button"
                    disabled={saveShopVideoMutation.isPending}
                    onClick={() =>
                      void handleSelectActiveShopVideo(
                        DEFAULT_SHOP_BANNER_VIDEO_URL,
                        "Default Shop Banner Video",
                      )
                    }
                    className="text-[11px] text-zinc-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] px-2.5 py-1 rounded-md border border-white/[0.08] shrink-0 transition-colors cursor-pointer"
                  >
                    Restore Default
                  </button>
                )}
              </div>
            </div>

            {/* Replace / Upload / URL Controls */}
            <div className="lg:col-span-6 space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300">
                  Upload or Replace Shop Video
                </label>
                <div className="flex rounded-lg bg-black/40 p-0.5 border border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setShopVideoTab("upload")}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      shopVideoTab === "upload"
                        ? "bg-emerald-500 text-white"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Upload className="h-3 w-3 inline mr-1" />
                    Upload Video
                  </button>
                  <button
                    type="button"
                    onClick={() => setShopVideoTab("url")}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      shopVideoTab === "url"
                        ? "bg-emerald-500 text-white"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <LinkIcon className="h-3 w-3 inline mr-1" />
                    Video URL / Path
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={shopVideoTitleInput}
                onChange={(e) => setShopVideoTitleInput(e.target.value)}
                placeholder="Optional label (e.g. Q4 Workshop Highlight Reel)"
                className="w-full bg-[#141414] border border-white/[0.08] focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
              />

              {shopVideoTab === "upload" ? (
                <div>
                  <input
                    ref={shopVideoInputRef}
                    type="file"
                    accept="video/mp4,video/webm"
                    onChange={handleShopVideoFileChange}
                    className="hidden"
                  />
                  <div
                    onClick={() => !isUploadingShopVideo && shopVideoInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!isUploadingShopVideo) setIsDraggingShopVideo(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDraggingShopVideo(false);
                    }}
                    onDrop={handleShopVideoDrop}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors bg-black/20 ${
                      isUploadingShopVideo
                        ? "border-emerald-500/50 bg-emerald-500/[0.04] cursor-wait"
                        : isDraggingShopVideo
                          ? "border-emerald-400 bg-emerald-500/[0.08]"
                          : "border-white/[0.12] hover:border-emerald-500/50 hover:bg-emerald-500/[0.02]"
                    }`}
                  >
                    {isUploadingShopVideo ? (
                      <div className="space-y-1.5">
                        <RefreshCw className="h-6 w-6 text-emerald-400 mx-auto animate-spin" />
                        <p className="text-xs font-semibold text-emerald-300">
                          Uploading video &amp; updating live shop banner...
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          Saving to persistent disk storage &amp; PostgreSQL
                        </p>
                      </div>
                    ) : (
                      <>
                        <Film className="h-6 w-6 text-sky-400 mx-auto mb-1.5" />
                        <p className="text-xs font-medium text-zinc-200">
                          Click to upload or drag &amp; drop an MP4 / WebM video
                        </p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          Recommended landscape banner ratio (up to 100MB, auto-sets live on /shop)
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveShopVideoUrl} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shopVideoUrlInput}
                      onChange={(e) => setShopVideoUrlInput(e.target.value)}
                      placeholder="/uploads/banners/video.mp4 or https://.../banner.mp4"
                      className="flex-1 bg-[#141414] border border-white/[0.08] focus:border-emerald-500 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-zinc-500 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={saveShopVideoMutation.isPending || !shopVideoUrlInput.trim()}
                      className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
                    >
                      Set Live
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Paste a direct MP4/WebM URL or relative `/...` video path.
                  </p>
                </form>
              )}

              {shopVideoError && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/25 px-3 py-2 text-xs text-red-300 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{shopVideoError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Video Switcher (Strictly 1 Active at a Time) */}
          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-zinc-300">
                Available Shop Videos (select one active video)
              </p>
              <span className="text-[11px] text-zinc-500">
                Only the selected video displays on /shop
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {currentShopVideoConfig.videos.map((vid) => {
                const isActive = activeShopVideoUrl === vid.url;
                return (
                  <div
                    key={vid.id}
                    className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-colors ${
                      isActive
                        ? "border-emerald-500/60 bg-emerald-500/10"
                        : "border-white/[0.06] bg-[#181818] hover:border-white/[0.14]"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-white truncate">{vid.title}</p>
                        {isActive && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded shrink-0">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-zinc-500 truncate mt-0.5">
                        {vid.url}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isActive && (
                        <button
                          type="button"
                          disabled={saveShopVideoMutation.isPending}
                          onClick={() => void handleSelectActiveShopVideo(vid.url, vid.title)}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 transition-colors cursor-pointer"
                        >
                          Use Video
                        </button>
                      )}
                      {!isPresetShopBannerVideoUrl(vid.url) && (
                        <button
                          type="button"
                          disabled={saveShopVideoMutation.isPending}
                          onClick={() => void handleRemoveCustomShopVideo(vid.id)}
                          title="Remove custom video"
                          className="p-1.5 rounded-md hover:bg-red-500/15 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {PRESET_SHOP_BANNER_VIDEOS.map((preset) => {
                const isActive = activeShopVideoUrl === preset.url;
                return (
                  <div
                    key={preset.id}
                    className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-colors ${
                      isActive
                        ? "border-emerald-500/60 bg-emerald-500/10"
                        : "border-white/[0.06] bg-[#181818] hover:border-white/[0.14]"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-white truncate">{preset.title}</p>
                        <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.06] px-1.5 py-0.5 rounded shrink-0">
                          Preset
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded shrink-0">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 truncate mt-0.5">{preset.subtitle}</p>
                    </div>
                    {!isActive && (
                      <button
                        type="button"
                        disabled={saveShopVideoMutation.isPending}
                        onClick={() => void handleSelectActiveShopVideo(preset.url, preset.title)}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 transition-colors shrink-0 cursor-pointer"
                      >
                        Use Video
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Admin Carousel Preview */}
        {activeCount > 0 && (
          <div className="bg-[#232323] border border-white/[0.06] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-white">Live Carousel Preview</h2>
                <span className="text-[11px] text-zinc-400">(Aspect ratio 3.21:1)</span>
              </div>
              <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
                {activeCount} active slides rotating
              </span>
            </div>

            <div className="relative w-full aspect-[2100/654] overflow-hidden rounded-xl border border-white/[0.1] bg-black">
              {banners
                .filter((b) => b.active)
                .slice(0, 1)
                .map((slide) => (
                  <div
                    key={slide.id}
                    className={`relative w-full h-full flex items-center justify-center overflow-hidden ${
                      slide.bgColor?.startsWith("bg-") ? slide.bgColor : "bg-white"
                    }`}
                  >
                    <img
                      src={slide.image}
                      alt={slide.alt}
                      className="absolute inset-0 w-full h-full object-cover blur-xl opacity-20 pointer-events-none"
                    />
                    <img
                      src={slide.image}
                      alt={slide.alt}
                      className="relative z-10 w-full h-full object-contain"
                    />
                    <div className="absolute top-3 left-3 z-20 bg-black/60 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-md border border-white/20">
                      Top Active Slide: {slide.title}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Banners List */}
        <div className="bg-[#232323] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-zinc-400" />
              <h2 className="text-sm font-semibold text-white">Configured Banners</h2>
              <span className="text-xs text-zinc-500 font-mono">({banners.length})</span>
            </div>
            <p className="text-[11px] text-zinc-500 hidden sm:block">
              Use arrows to change slide order in the carousel
            </p>
          </div>

          {banners.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-zinc-500">
                <ImageIcon className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200">No Banners Configured</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                No slides exist in the Featured Equipment banner section. Click below to add a new
                slide or restore factory defaults.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={handleResetDefaults}
                  className="px-3.5 py-1.5 rounded-lg text-xs bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 transition-colors"
                >
                  Load Defaults
                </button>
                <button
                  onClick={handleOpenAdd}
                  className="px-3.5 py-1.5 rounded-lg text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors"
                >
                  + Add First Banner
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                    banner.active
                      ? "bg-transparent hover:bg-white/[0.02]"
                      : "bg-black/20 opacity-60 hover:opacity-80"
                  }`}
                >
                  {/* Left: Reorder & Thumbnail */}
                  <div className="flex items-center gap-3.5 w-full sm:w-auto">
                    {/* Move Up/Down Controls */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={() => handleMove(banner.id, "up")}
                        disabled={index === 0}
                        title="Move slide up"
                        className="p-1 rounded hover:bg-white/[0.08] disabled:opacity-20 disabled:hover:bg-transparent text-zinc-400 hover:text-white transition-colors"
                      >
                        <MoveUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleMove(banner.id, "down")}
                        disabled={index === banners.length - 1}
                        title="Move slide down"
                        className="p-1 rounded hover:bg-white/[0.08] disabled:opacity-20 disabled:hover:bg-transparent text-zinc-400 hover:text-white transition-colors"
                      >
                        <MoveDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Order indicator */}
                    <div className="h-6 w-6 rounded-md bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[11px] font-mono font-bold text-zinc-400 shrink-0">
                      {index + 1}
                    </div>

                    {/* Thumbnail */}
                    <div className="relative h-16 w-32 sm:h-20 sm:w-40 rounded-lg overflow-hidden border border-white/[0.1] bg-black/40 shrink-0 flex items-center justify-center">
                      <img
                        src={banner.image}
                        alt={banner.alt}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-white truncate max-w-[280px] sm:max-w-md">
                          {banner.title}
                        </h3>
                        {banner.active ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-medium text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full border border-white/[0.08]">
                            Hidden
                          </span>
                        )}
                        {banner.mobilityKey && (
                          <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20 font-mono">
                            {banner.mobilityKey}
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                        <span className="flex items-center gap-1 font-mono text-[11px] text-zinc-500 truncate max-w-xs">
                          <LinkIcon className="h-3 w-3 shrink-0" />
                          {banner.link || "/shop"}
                        </span>
                        <span
                          className="text-[11px] text-zinc-500 truncate max-w-[200px]"
                          title={banner.alt}
                        >
                          Alt: {banner.alt}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggle(banner.id)}
                      className={`text-[11px] font-medium px-2.5 py-1.5 rounded-md transition-colors ${
                        banner.active
                          ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      }`}
                    >
                      {banner.active ? "Deactivate" : "Activate"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(banner)}
                      className="p-1.5 rounded-md hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
                      title="Edit banner"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(banner.id)}
                      className="p-1.5 rounded-md hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-colors"
                      title="Delete banner"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add / Edit Banner Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#1f1f1f] border border-white/[0.1] rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl text-zinc-200">
              <form onSubmit={handleSaveForm}>
                {/* Modal Header */}
                <div className="p-5 border-b border-white/[0.08] flex items-center justify-between sticky top-0 bg-[#1f1f1f] z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <ImageIcon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white">
                        {editingBannerId ? "Edit Featured Banner" : "Add Featured Banner"}
                      </h2>
                      <p className="text-xs text-zinc-400">
                        Slide for the Commercial Machinery / Featured Equipment section
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-5">
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">
                      Banner Title / Internal Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Launch Diagnostics Durga Puja Promo 20% OFF"
                      className="w-full bg-[#141414] border border-white/[0.08] focus:border-emerald-500 rounded-lg px-3.5 py-2 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
                    />
                  </div>

                  {/* Alt text & Target segment */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">
                        Alt Text (Accessibility & SEO)
                      </label>
                      <input
                        type="text"
                        value={formAlt}
                        onChange={(e) => setFormAlt(e.target.value)}
                        placeholder="e.g. Special offer this Durga Puja get up to 20% off"
                        className="w-full bg-[#141414] border border-white/[0.08] focus:border-emerald-500 rounded-lg px-3.5 py-2 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">
                        Mobility Category Filter
                      </label>
                      <select
                        value={formMobilityKey}
                        onChange={(e) =>
                          setFormMobilityKey(
                            e.target.value as "4-Wheeler" | "2-Wheeler" | "3-Wheeler" | "All",
                          )
                        }
                        className="w-full bg-[#141414] border border-white/[0.08] focus:border-emerald-500 rounded-lg px-3.5 py-2 text-sm text-white outline-none transition-colors"
                      >
                        <option value="All">All Categories (Universal)</option>
                        <option value="4-Wheeler">4-Wheeler</option>
                        <option value="2-Wheeler">2-Wheeler</option>
                        <option value="3-Wheeler">3-Wheeler</option>
                      </select>
                    </div>
                  </div>

                  {/* Target Link */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">
                      Destination Link / URL
                    </label>
                    <input
                      type="text"
                      value={formLink}
                      onChange={(e) => setFormLink(e.target.value)}
                      placeholder="/shop or /services/book or https://..."
                      className="w-full bg-[#141414] border border-white/[0.08] focus:border-emerald-500 rounded-lg px-3.5 py-2 text-sm text-white placeholder-zinc-500 font-mono text-xs outline-none transition-colors"
                    />
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setFormLink("/shop")}
                        className="text-[10px] text-zinc-400 bg-white/[0.04] hover:bg-white/[0.08] px-2 py-0.5 rounded font-mono"
                      >
                        /shop
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormLink("/shop?cat=Diagnostic+Equipment")}
                        className="text-[10px] text-zinc-400 bg-white/[0.04] hover:bg-white/[0.08] px-2 py-0.5 rounded font-mono"
                      >
                        /shop?cat=Diagnostics
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormLink("/shop?cat=Garage+Equipment")}
                        className="text-[10px] text-zinc-400 bg-white/[0.04] hover:bg-white/[0.08] px-2 py-0.5 rounded font-mono"
                      >
                        /shop?cat=Garage Equipment
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormLink("/services/book")}
                        className="text-[10px] text-zinc-400 bg-white/[0.04] hover:bg-white/[0.08] px-2 py-0.5 rounded font-mono"
                      >
                        /services/book
                      </button>
                    </div>
                  </div>

                  {/* Image Source Selection */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-300">
                        Banner Image Source <span className="text-red-400">*</span>
                      </label>
                      <div className="flex rounded-lg bg-black/40 p-0.5 border border-white/[0.08]">
                        <button
                          type="button"
                          onClick={() => setImageTab("upload")}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                            imageTab === "upload"
                              ? "bg-emerald-500 text-white"
                              : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          <Upload className="h-3 w-3 inline mr-1" />
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageTab("presets")}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                            imageTab === "presets"
                              ? "bg-emerald-500 text-white"
                              : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          <Sparkles className="h-3 w-3 inline mr-1" />
                          Presets
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageTab("url")}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                            imageTab === "url"
                              ? "bg-emerald-500 text-white"
                              : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          <LinkIcon className="h-3 w-3 inline mr-1" />
                          URL / Path
                        </button>
                      </div>
                    </div>

                    {/* Tab 1: Upload */}
                    {imageTab === "upload" && (
                      <div className="space-y-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <div
                          onClick={() => !isUploading && fileInputRef.current?.click()}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!isUploading) setIsDragging(true);
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsDragging(false);
                          }}
                          onDrop={handleBannerDrop}
                          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors bg-black/20 ${
                            isUploading
                              ? "border-emerald-500/50 bg-emerald-500/[0.04] cursor-wait"
                              : isDragging
                                ? "border-emerald-400 bg-emerald-500/[0.08]"
                                : "border-white/[0.12] hover:border-emerald-500/50 hover:bg-emerald-500/[0.02]"
                          }`}
                        >
                          {isUploading ? (
                            <div className="space-y-1.5">
                              <RefreshCw className="h-6 w-6 text-emerald-400 mx-auto animate-spin" />
                              <p className="text-xs font-semibold text-emerald-300">
                                Uploading to server disk & cataloging in PostgreSQL...
                              </p>
                              <p className="text-[11px] text-zinc-500">
                                Writing persistent media file
                              </p>
                            </div>
                          ) : (
                            <>
                              <Upload className="h-6 w-6 text-emerald-400 mx-auto mb-1.5" />
                              <p className="text-xs font-medium text-zinc-200">
                                Click to select image or drag and drop
                              </p>
                              <p className="text-[11px] text-zinc-500 mt-0.5">
                                PNG, JPG, or WebP (Stores directly on server disk at
                                /uploads/banners/)
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tab 2: Presets */}
                    {imageTab === "presets" && (
                      <div className="grid grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1 bg-black/20 rounded-xl border border-white/[0.06]">
                        {BANNER_PRESETS.map((preset) => (
                          <div
                            key={preset.image}
                            onClick={() => {
                              setFormImage(preset.image);
                              if (!formTitle) setFormTitle(preset.title);
                              if (!formAlt) setFormAlt(preset.alt);
                              if (preset.bgColor) setFormBgColor(preset.bgColor);
                              if (preset.mobilityKey) setFormMobilityKey(preset.mobilityKey);
                            }}
                            className={`p-2 rounded-lg border text-left cursor-pointer transition-all flex flex-col gap-1.5 ${
                              formImage === preset.image
                                ? "border-emerald-500 bg-emerald-500/10"
                                : "border-white/[0.06] hover:border-white/[0.15] bg-[#1a1a1a]"
                            }`}
                          >
                            <div className="h-14 w-full rounded overflow-hidden bg-black/40 flex items-center justify-center">
                              <img
                                src={preset.image}
                                alt=""
                                className="h-full w-full object-contain"
                              />
                            </div>
                            <p className="text-[11px] font-medium text-white truncate">
                              {preset.title}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tab 3: URL */}
                    {imageTab === "url" && (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={formImage}
                          onChange={(e) => setFormImage(e.target.value)}
                          placeholder="e.g. /durga-puja-launch-banner.png or https://example.com/banner.jpg"
                          className="w-full bg-[#141414] border border-white/[0.08] focus:border-emerald-500 rounded-lg px-3.5 py-2 text-xs font-mono text-white outline-none"
                        />
                      </div>
                    )}

                    {/* Preview of Selected Image */}
                    {formImage && (
                      <div className="pt-2">
                        <p className="text-[11px] text-zinc-400 mb-1.5">Selected Image Preview:</p>
                        <div
                          className={`relative w-full aspect-[2100/654] rounded-lg overflow-hidden border border-white/[0.1] flex items-center justify-center ${
                            formBgColor.startsWith("bg-") ? formBgColor : "bg-white"
                          }`}
                        >
                          <img
                            src={formImage}
                            alt="Preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Background Color & Style */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">
                      Card Backdrop / Canvas Background
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {BG_COLOR_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFormBgColor(opt.value)}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-colors ${
                            formBgColor === opt.value
                              ? "border-emerald-500 bg-emerald-500/10 text-white"
                              : "border-white/[0.06] hover:border-white/[0.12] bg-[#171717] text-zinc-400"
                          }`}
                        >
                          <span
                            className={`h-3.5 w-3.5 rounded-full border border-white/20 shrink-0 ${opt.swatch}`}
                          />
                          <span className="truncate">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <div className="pt-2 border-t border-white/[0.08]">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formActive}
                        onChange={(e) => setFormActive(e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-medium text-zinc-200">
                        Display this banner in the active homepage carousel
                      </span>
                    </label>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-white/[0.08] flex items-center justify-end gap-2.5 bg-[#171717]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-medium bg-emerald-500 hover:bg-emerald-600 text-white shadow-md transition-all"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{editingBannerId ? "Save Changes" : "Create Banner"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#1f1f1f] border border-white/[0.1] rounded-2xl w-full max-w-md p-6 shadow-2xl text-zinc-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Delete Banner Slide?</h3>
                  <p className="text-xs text-zinc-400">
                    This will immediately remove this slide from the storefront carousel.
                  </p>
                </div>
              </div>

              {(() => {
                const b = banners.find((x) => x.id === deleteConfirmId);
                if (!b) return null;
                return (
                  <div className="p-3 rounded-lg bg-black/30 border border-white/[0.06] flex items-center gap-3">
                    <img
                      src={b.image}
                      alt=""
                      className="h-12 w-24 object-contain rounded bg-black/40"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white truncate">{b.title}</p>
                      <p className="text-[11px] text-zinc-400 truncate">{b.link}</p>
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Confirm Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
