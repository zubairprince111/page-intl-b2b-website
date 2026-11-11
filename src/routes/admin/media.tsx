import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useState, useEffect, useMemo, useRef } from "react";
import type { MediaListItem } from "@/lib/media-types";
import {
  uploadMediaFile,
  deleteMediaFile,
  fetchMediaList,
  fetchMediaStats,
  syncDiskFiles,
  formatFileSize,
  type MediaCategory,
} from "@/lib/client-media";
import {
  Upload,
  Trash2,
  Copy,
  Check,
  Search,
  FolderOpen,
  Image as ImageIcon,
  FileText,
  Video,
  File,
  RefreshCw,
  ExternalLink,
  Plus,
  X,
  AlertTriangle,
  HardDrive,
  Database,
  Layers,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/admin/media")({
  component: AdminMediaPage,
  head: () => ({
    meta: [{ title: "Media Library & Storage — PAGE Admin" }],
  }),
});

export function AdminMediaPage() {
  const [items, setItems] = useState<MediaListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<MediaCategory>("products");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Lightbox / Full Preview state
  const [previewMedia, setPreviewMedia] = useState<MediaListItem | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<MediaListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  // Load items from PostgreSQL
  async function loadMedia() {
    try {
      setLoading(true);
      const data = await fetchMediaList();
      setItems(data);
    } catch (err) {
      console.error("Failed to load media items:", err);
      showToast("Error connecting to media database");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMedia();
  }, []);

  // Handle Sync with disk
  async function handleSyncDisk() {
    try {
      setSyncing(true);
      const res = await syncDiskFiles();
      await loadMedia();
      showToast(`Disk synced: ${res.addedCount} new files cataloged in PostgreSQL`);
    } catch (err) {
      console.error("Sync failed:", err);
      showToast("Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  function applySelectedFile(file: File) {
    const lowerName = file.name.toLowerCase();
    const isVideo =
      file.type.startsWith("video/") || lowerName.endsWith(".mp4") || lowerName.endsWith(".webm");
    const maxBytes = isVideo ? 100 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError(
        isVideo
          ? "Video exceeds maximum allowed size of 100MB"
          : "File exceeds maximum allowed size of 50MB",
      );
      return;
    }

    setUploadError(null);
    setSelectedFile(file);

    setFilePreviewUrl((prev) => {
      if (prev && prev.startsWith("blob:")) {
        URL.revokeObjectURL(prev);
      }
      return file.type.startsWith("image/") || isVideo ? URL.createObjectURL(file) : null;
    });
  }

  // Handle file select in upload modal
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    applySelectedFile(file);
  }

  function handleFileDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      applySelectedFile(file);
    }
  }

  // Handle Upload Submission
  async function handleUploadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadError(null);
      const result = await uploadMediaFile(selectedFile, uploadCategory);
      if (result.success) {
        showToast(`Uploaded ${result.filename} successfully`);
        setIsUploadModalOpen(false);
        setSelectedFile(null);
        setFilePreviewUrl((prev) => {
          if (prev && prev.startsWith("blob:")) {
            URL.revokeObjectURL(prev);
          }
          return null;
        });
        await loadMedia();
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  }

  // Handle Copy URL
    function handleCopyUrl(row: MediaListItem) {
      const fullUrl = `${window.location.origin}${row.url}`;
      navigator.clipboard.writeText(fullUrl);
      setCopiedId(row.id);
      showToast("URL copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    }

    // Handle Delete
    async function confirmDelete() {
      if (!deleteTarget) return;
      try {
        setDeleting(true);
        const success = await deleteMediaFile({ id: deleteTarget.id, url: deleteTarget.url });
        if (success) {
          showToast("File deleted from disk and database");
          setDeleteTarget(null);
          await loadMedia();
        } else {
          showToast("Could not delete file");
        }
      } catch (err) {
        console.error("Delete failed:", err);
        showToast("Error deleting file");
      } finally {
        setDeleting(false);
      }
    }

    // Filtered Items
    const filteredItems = useMemo(() => {
      return items.filter((item) => {
        const matchCat = selectedCategory === "all" || item.category === selectedCategory;
        const matchQuery =
          !searchQuery ||
          item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.originalName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchQuery;
      });
    }, [items, selectedCategory, searchQuery]);

    // Storage calculation
    const totalBytes = useMemo(() => {
      return items.reduce((acc, curr) => acc + (curr.sizeBytes || 0), 0);
    }, [items]);

    const categoryCounts = useMemo(() => {
      const counts = { products: 0, banners: 0, documents: 0, general: 0 };
      items.forEach((item) => {
        if (item.category in counts) {
          counts[item.category as keyof typeof counts]++;
        } else {
          counts.general++;
        }
      });
      return counts;
    }, [items]);

    // Helper for rendering file icon
    function renderFileIcon(mime: string) {
      if (mime.startsWith("image/")) return <ImageIcon className="h-5 w-5 text-emerald-400" />;
      if (mime.includes("pdf")) return <FileText className="h-5 w-5 text-red-400" />;
      if (mime.startsWith("video/")) return <Video className="h-5 w-5 text-sky-400" />;
      return <File className="h-5 w-5 text-zinc-400" />;
    }

    return (
      <AdminLayout activeRoute="/admin/media">
        <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
          {/* Toast Alert */}
          {toastMessage && (
            <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-emerald-500 text-white px-4 py-2.5 rounded-lg shadow-2xl text-sm font-medium animate-in fade-in slide-in-from-top-3">
              <Check className="h-4 w-4" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Server Storage & Postgres
                </span>
                <span className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded">
                  <Database className="h-3 w-3 text-emerald-400" />
                  PostgreSQL 16
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white mt-1">Media Library & Storage</h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Persistent storage for product imagery, brochures, banners, and technical specs. Files
                are stored on server disk with records in PostgreSQL.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSyncDisk}
                disabled={syncing}
                className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.08] px-3.5 py-2 rounded-lg text-xs font-medium transition"
                title="Scan disk uploads folder and register any uncataloged files into PostgreSQL"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 text-zinc-400 ${syncing ? "animate-spin text-emerald-400" : ""}`}
                />
                <span>{syncing ? "Scanning Disk..." : "Sync Disk"}</span>
              </button>

              <button
                onClick={() => {
                  setSelectedFile(null);
                  setFilePreviewUrl((prev) => {
                    if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
                    return null;
                  });
                  setUploadError(null);
                  setIsUploadModalOpen(true);
                }}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg text-xs font-semibold shadow-lg shadow-emerald-500/20 transition"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Media</span>
              </button>
            </div>
          </div>

          {/* Storage Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#171717] border border-white/[0.06] rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Total Media Files</p>
                <p className="text-2xl font-bold text-white mt-1">{items.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <FolderOpen className="h-5 w-5 text-emerald-400" />
              </div>
            </div>

            <div className="bg-[#171717] border border-white/[0.06] rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Disk Space Used</p>
                <p className="text-2xl font-bold text-white mt-1">{formatFileSize(totalBytes)}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <HardDrive className="h-5 w-5 text-blue-400" />
              </div>
            </div>

            <div className="bg-[#171717] border border-white/[0.06] rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Product Images</p>
                <p className="text-2xl font-bold text-white mt-1">{categoryCounts.products}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-amber-400" />
              </div>
            </div>

            <div className="bg-[#171717] border border-white/[0.06] rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Banners & Docs</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {categoryCounts.banners + categoryCounts.documents}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Layers className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#171717] p-3 rounded-xl border border-white/[0.06]">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "all", label: `All (${items.length})` },
                { id: "products", label: `Products (${categoryCounts.products})` },
                { id: "banners", label: `Banners (${categoryCounts.banners})` },
                { id: "documents", label: `Documents (${categoryCounts.documents})` },
                { id: "general", label: `General (${categoryCounts.general})` },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${selectedCategory === cat.id
                      ? "bg-emerald-500 text-black font-semibold"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search file name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121212] border border-white/[0.08] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Media Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
              <div className="h-8 w-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin mb-3" />
              <p className="text-xs font-mono">Querying PostgreSQL media catalog...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-[#171717] rounded-xl border border-white/[0.06] p-8">
              <FolderOpen className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-zinc-300">No media files found</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? "No media matching your search term."
                  : "No files uploaded in this category yet. Upload your first product image or sync disk files."}
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={handleSyncDisk}
                  className="px-3.5 py-1.5 rounded-lg border border-white/[0.08] text-xs text-zinc-300 hover:bg-white/[0.05]"
                >
                  Scan Disk for Existing Files
                </button>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-black text-xs font-semibold hover:bg-emerald-400"
                >
                  Upload File
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item) => {
                const isImage = item.mimeType.startsWith("image/");
                const isCopied = copiedId === item.id;

                return (
                  <div
                    key={item.id}
                    className="group bg-[#171717] border border-white/[0.06] hover:border-white/[0.15] rounded-xl overflow-hidden flex flex-col transition duration-200"
                  >
                    {/* Media Thumbnail */}
                    <div
                      onClick={() => setPreviewMedia(item)}
                      className="relative aspect-[4/3] bg-[#121212] overflow-hidden flex items-center justify-center cursor-pointer"
                    >
                      {/* Preview Area */}
                      {isImage ? (
                        <img
                          src={item.url}
                          alt={item.originalName}
                          className="w-full h-full object-contain p-2 group-hover:scale-105 transition duration-300"
                          loading="lazy"
                        />
                      ) : item.mimeType.startsWith("video/") ? (
                        <video
                          src={item.url}
                          muted
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 p-4 text-center">
                          {renderFileIcon(item.mimeType)}
                          <span className="text-[11px] font-mono text-zinc-400 uppercase">
                            {item.mimeType.split("/")[1] || "FILE"}
                          </span>
                        </div>
                      )}

                      {/* Category Tag Overlay */}
                      <div className="absolute top-2 left-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur-md bg-black/60 text-zinc-300 border border-white/10">
                          {item.category}
                        </span>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <span className="text-xs font-medium text-white bg-black/70 px-2.5 py-1 rounded border border-white/20">
                          Click to preview
                        </span>
                      </div>
                    </div>

                    {/* Media Info */}
                    <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
                      <div>
                        <h4
                          className="text-xs font-medium text-white truncate"
                          title={item.originalName}
                        >
                          {item.originalName}
                        </h4>
                        <p
                          className="text-[11px] font-mono text-zinc-500 truncate mt-0.5"
                          title={item.url}
                        >
                          {item.url}
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2 font-mono">
                          <span>{formatFileSize(item.sizeBytes)}</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Actions Bar */}
                      <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04]">
                        <button
                          onClick={() => handleCopyUrl(item)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition ${isCopied
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.06]"
                            }`}
                          title="Copy public URL"
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy URL</span>
                            </>
                          )}
                        </button>

                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/[0.06] transition"
                          title="Open file in new tab"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>

                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition"
                          title="Delete file"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* MODAL: Upload New Media File */}
          {/* ---------------------------------------------------- */}
          {isUploadModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <div className="bg-[#171717] border border-white/[0.1] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <Upload className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Upload Media Asset</h3>
                      <p className="text-[11px] text-zinc-400">
                        Stores file on disk and indexes in PostgreSQL
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsUploadModalOpen(false)}
                    className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.04]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleUploadSubmit} className="p-5 space-y-4">
                  {/* Category Selection */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Storage Category
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: "products", label: "Products" },
                        { id: "banners", label: "Banners" },
                        { id: "documents", label: "Specs / PDF" },
                        { id: "general", label: "General" },
                      ].map((cat) => (
                        <button
                          type="button"
                          key={cat.id}
                          onClick={() => setUploadCategory(cat.id as MediaCategory)}
                          className={`py-2 text-xs font-medium rounded-lg border text-center transition ${uploadCategory === cat.id
                              ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
                              : "border-white/[0.06] bg-[#121212] text-zinc-400 hover:text-white"
                            }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dropzone / File Picker */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Select File (PNG, JPG, WEBP, GIF, PDF up to 50MB; MP4, WebM up to 100MB)
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingFile(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingFile(false);
                      }}
                      onDrop={handleFileDrop}
                      className={`border-2 border-dashed rounded-xl p-6 text-center bg-[#121212] cursor-pointer transition group ${isDraggingFile
                          ? "border-emerald-400 bg-emerald-500/[0.08]"
                          : "border-white/[0.12] hover:border-emerald-500/50"
                        }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,video/mp4,video/webm"
                      />

                      {filePreviewUrl ? (
                        <div className="space-y-3">
                          {selectedFile?.type.startsWith("video/") ||
                            selectedFile?.name.toLowerCase().endsWith(".mp4") ||
                            selectedFile?.name.toLowerCase().endsWith(".webm") ? (
                            <video
                              src={filePreviewUrl}
                              muted
                              loop
                              autoPlay
                              playsInline
                              className="max-h-36 mx-auto rounded-lg object-contain shadow-md bg-black"
                            />
                          ) : (
                            <img
                              src={filePreviewUrl}
                              alt="Upload preview"
                              className="max-h-36 mx-auto rounded-lg object-contain shadow-md"
                            />
                          )}
                          <div className="text-xs text-emerald-400 font-medium">
                            {selectedFile?.name} ({formatFileSize(selectedFile?.size || 0)})
                          </div>
                          <p className="text-[11px] text-zinc-500">
                            Click to choose a different file
                          </p>
                        </div>
                      ) : selectedFile ? (
                        <div className="space-y-2">
                          <FileText className="h-10 w-10 text-emerald-400 mx-auto" />
                          <p className="text-xs text-white font-medium">{selectedFile.name}</p>
                          <p className="text-[11px] text-zinc-500 font-mono">
                            {formatFileSize(selectedFile.size)} • {selectedFile.type || "binary"}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-8 w-8 text-zinc-500 group-hover:text-emerald-400 mx-auto transition" />
                          <p className="text-xs font-medium text-zinc-300">
                            Click to browse or drag and drop file here
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            File will be saved to{" "}
                            <code className="text-zinc-400">/uploads/{uploadCategory}/</code>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Error Banner */}
                  {uploadError && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/25 px-3 py-2 text-xs text-red-300 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* Submit / Cancel Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(false)}
                      className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!selectedFile || uploading}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black px-4 py-2 rounded-lg text-xs font-semibold shadow-lg shadow-emerald-500/20 transition"
                    >
                      {uploading ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Uploading to Server...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-3.5 w-3.5" />
                          <span>Confirm & Upload</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* MODAL: Full Preview Lightbox */}
          {/* ---------------------------------------------------- */}
          {previewMedia && (
            <div
              onClick={() => setPreviewMedia(null)}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-[#171717] border border-white/[0.1] rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl"
              >
                <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                  <div className="truncate pr-4">
                    <h3 className="text-sm font-bold text-white truncate">
                      {previewMedia.originalName}
                    </h3>
                    <p className="text-[11px] font-mono text-zinc-400 truncate mt-0.5">
                      {previewMedia.url}
                    </p>
                  </div>
                  <button
                    onClick={() => setPreviewMedia(null)}
                    className="text-zinc-400 hover:text-white p-1 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-4 bg-[#101010] flex items-center justify-center max-h-[60vh] overflow-auto">
                  {previewMedia.mimeType.startsWith("image/") ? (
                    <img
                      src={previewMedia.url}
                      alt={previewMedia.originalName}
                      className="max-h-[55vh] w-auto object-contain rounded-lg shadow-lg"
                    />
                  ) : previewMedia.mimeType.startsWith("video/") ? (
                    <video
                      src={previewMedia.url}
                      controls
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="max-h-[55vh] w-full object-contain rounded-lg shadow-lg bg-black"
                    />
                  ) : (
                    <div className="p-8 text-center space-y-3">
                      {renderFileIcon(previewMedia.mimeType)}
                      <p className="text-sm text-zinc-300 font-medium">Non-image asset</p>
                      <a
                        href={previewMedia.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-black text-xs font-semibold"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Download / View File</span>
                      </a>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-[#141414] border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-4">
                    <span>Size: {formatFileSize(previewMedia.sizeBytes)}</span>
                    <span>Type: {previewMedia.mimeType}</span>
                    <span>Category: {previewMedia.category}</span>
                  </div>
                  <button
                    onClick={() => handleCopyUrl(previewMedia)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 transition"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Public URL</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* MODAL: Delete Confirmation */}
          {/* ---------------------------------------------------- */}
          {deleteTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
              <div className="bg-[#171717] border border-red-500/30 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Delete Media File?</h3>
                    <p className="text-xs text-zinc-400">This action cannot be undone.</p>
                  </div>
                </div>

                <div className="p-3 bg-[#121212] rounded-lg border border-white/[0.04] text-xs space-y-1">
                  <p className="text-zinc-200 font-medium truncate">{deleteTarget.originalName}</p>
                  <p className="text-zinc-500 font-mono text-[11px] truncate">{deleteTarget.url}</p>
                  <p className="text-zinc-400 text-[11px]">
                    File will be unlinked from server disk and deleted from PostgreSQL.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    disabled={deleting}
                    className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-lg shadow-red-500/20 transition"
                  >
                    {deleting ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete Permanently</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    );
  }
