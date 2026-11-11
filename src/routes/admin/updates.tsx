import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useUpdates, useSaveUpdate, useDeleteUpdate } from "@/lib/data-client";
import { type UpdateCategory } from "@/lib/types";
import {
  Newspaper,
  Plus,
  Trash2,
  Edit3,
  Eye,
  ExternalLink,
  RotateCcw,
  Check,
  X,
  Upload,
  Search,
  Sparkles,
  MapPin,
  Building2,
  Calendar,
  Clock,
  Bookmark,
  Ship,
  Truck,
  Wrench,
  Zap,
  Tag,
} from "lucide-react";
import { useState, useMemo } from "react";
import { uploadMediaFile } from "@/lib/client-media";

export const Route = createFileRoute("/admin/updates")({
  component: AdminUpdates,
  head: () => ({
    meta: [{ title: "Field Updates & Dispatches — PAGE Admin" }],
  }),
});

const CATEGORY_META: Record<
  UpdateCategory,
  { label: string; icon: typeof Truck; badgeClass: string }
> = {
  shipment_inbound: {
    label: "Shipment Inbound",
    icon: Ship,
    badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  },
  client_delivery: {
    label: "Client Delivery",
    icon: Truck,
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  commissioning: {
    label: "Commissioning & Trial",
    icon: Wrench,
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  tech_bulletin: {
    label: "Tech Bulletin",
    icon: Zap,
    badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  product_launch: {
    label: "Product Launch",
    icon: Sparkles,
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
};

export function AdminUpdates() {
  const { data: rawUpdates = [], isLoading } = useUpdates();
  const saveUpdateMutation = useSaveUpdate();
  const deleteUpdateMutation = useDeleteUpdate();

  const updates = useMemo(() => {
    return rawUpdates.map((u: any) => ({
      id: u.id,
      title: u.title,
      slug: u.slug,
      category: u.category as UpdateCategory,
      categoryLabel: CATEGORY_META[u.category as UpdateCategory]?.label || u.category,
      date: u.publishedAt
        ? new Date(u.publishedAt).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      summary: u.excerpt || u.content.slice(0, 120),
      content: u.content,
      images: u.coverImage ? [u.coverImage] : ["/durga-puja-launch-banner.png"],
      published: Boolean(u.isPublished),
      author: "PAGE Operations Desk",
      pinned: false,
      location: "Uttara Model Town, Dhaka",
      companyOrClient: "PAGE Commercial Bay",
      equipmentNames: ["Automotive Lift", "Diagnostic Station"],
      readTimeMinutes: 3,
    }));
  }, [rawUpdates]);

  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<any | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<UpdateCategory>("shipment_inbound");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [companyOrClient, setCompanyOrClient] = useState("");
  const [location, setLocation] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [equipmentInput, setEquipmentInput] = useState("");
  const [badge, setBadge] = useState("");
  const [pinned, setPinned] = useState(false);
  const [published, setPublished] = useState(true);
  const [author, setAuthor] = useState("PAGE Operations Desk");
  const [isUploading, setIsUploading] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleOpenCreate() {
    setEditingItem(null);
    setTitle("");
    setCategory("shipment_inbound");
    setDate(new Date().toISOString().slice(0, 10));
    setCompanyOrClient("");
    setLocation("Uttara Model Town, Dhaka");
    setSummary("");
    setContent("");
    setImageUrl("/durga-puja-launch-banner.png");
    setEquipmentInput("");
    setBadge("Shipment Inbound");
    setPinned(false);
    setPublished(true);
    setAuthor("PAGE Operations Desk");
    setModalOpen(true);
  }

  function handleOpenEdit(item: any) {
    setEditingItem(item);
    setTitle(item.title);
    setCategory(item.category);
    setDate(item.date);
    setCompanyOrClient(item.companyOrClient || "");
    setLocation(item.location || "");
    setSummary(item.summary);
    setContent(item.content);
    setImageUrl(item.images[0] || "");
    setEquipmentInput((item.equipmentNames || []).join(", "));
    setBadge(item.badge || "");
    setPinned(Boolean(item.pinned));
    setPublished(Boolean(item.published));
    setAuthor(item.author || "PAGE Operations Desk");
    setModalOpen(true);
  }

  async function handleSave() {
    if (!title.trim()) {
      showToast("Title is required");
      return;
    }
    if (!summary.trim()) {
      showToast("Summary is required");
      return;
    }

    const slug =
      editingItem?.slug ||
      title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
        "-" +
        Date.now().toString(36).slice(-4);

    await saveUpdateMutation.mutateAsync({
      id: editingItem?.id || undefined,
      title: title.trim(),
      slug,
      content: content.trim() || summary.trim(),
      excerpt: summary.trim(),
      coverImage: imageUrl.trim() || "/durga-puja-launch-banner.png",
      category,
      isPublished: published,
    });

    showToast(editingItem ? "Update modified successfully!" : "New field update published!");
    setModalOpen(false);
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this update?")) {
      await deleteUpdateMutation.mutateAsync(id);
      showToast("Update deleted.");
    }
  }

  function handleReset() {
    showToast("Updates preserved in PostgreSQL.");
  }

  async function handleFileUpload(file: File) {
    setIsUploading(true);
    try {
      const res = await uploadMediaFile(file, "banners");
      if (res.success && res.url) {
        setImageUrl(res.url);
        showToast("Image uploaded successfully!");
      }
    } catch (err: any) {
      console.error(err);
      showToast("Upload failed: " + (err.message || "Unknown error"));
    } finally {
      setIsUploading(false);
    }
  }

  const filtered = useMemo(() => {
    return updates.filter((u) => {
      if (selectedCat !== "all" && u.category !== selectedCat) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          u.title.toLowerCase().includes(q) ||
          u.summary.toLowerCase().includes(q) ||
          u.companyOrClient?.toLowerCase().includes(q) ||
          u.location.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [updates, selectedCat, search]);

  return (
    <AdminLayout activeRoute="/admin/updates">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <Newspaper className="h-4 w-4" />
              <span>Operational News & Field Feeds</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">Field Updates Manager</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Publish inbound shipping container notices, client workshop handovers, and technical
              bulletins to <code className="text-zinc-300">/updates</code>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg transition-colors inline-flex items-center gap-1.5"
              title="Reset to default seed dispatches"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Defaults</span>
            </button>
            <a
              href="/updates"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <span>View Public Feed</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Post New Update</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#232323] border border-white/[0.06] p-3 rounded-xl">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search updates by client, title, machinery..."
              className="bg-transparent border-0 text-xs text-white placeholder:text-zinc-500 focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {["all", "shipment_inbound", "client_delivery", "commissioning", "tech_bulletin"].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    selectedCat === cat
                      ? "bg-white/10 text-white font-semibold"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {cat === "all"
                    ? `All (${updates.length})`
                    : CATEGORY_META[cat as UpdateCategory]?.label || cat}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Updates Table / Stream */}
        <div className="bg-[#232323] border border-white/[0.06] rounded-xl overflow-hidden shadow-sm">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 text-xs">
              No field updates found matching your filter.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {filtered.map((item) => {
                const meta = CATEGORY_META[item.category] || CATEGORY_META.shipment_inbound;
                const Icon = meta.icon;

                return (
                  <div
                    key={item.id}
                    className="p-5 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left: Thumbnail + Info */}
                    <div className="flex items-start gap-4 flex-1">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt=""
                          className="h-16 w-24 object-cover rounded-lg border border-white/10 shrink-0 bg-black/40"
                        />
                      ) : (
                        <div className="h-16 w-24 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <Newspaper className="h-6 w-6 text-zinc-600" />
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${meta.badgeClass}`}
                          >
                            <Icon className="h-3 w-3" />
                            <span>{item.categoryLabel || meta.label}</span>
                          </span>

                          {item.pinned && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <Bookmark className="h-2.5 w-2.5 fill-current" />
                              <span>PINNED</span>
                            </span>
                          )}

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              item.published
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-zinc-700 text-zinc-400"
                            }`}
                          >
                            {item.published ? "Published" : "Draft"}
                          </span>

                          <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {item.date}
                          </span>
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                          {item.title}
                        </h3>

                        <p className="text-xs text-zinc-400 line-clamp-1">{item.summary}</p>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-400 pt-1">
                          {item.companyOrClient && (
                            <span className="flex items-center gap-1 text-zinc-300 font-medium">
                              <Building2 className="h-3 w-3 text-red-500" />
                              {item.companyOrClient}
                            </span>
                          )}
                          {item.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-zinc-500" />
                              {item.location}
                            </span>
                          )}
                          {item.equipmentNames && item.equipmentNames.length > 0 && (
                            <span className="flex items-center gap-1 text-zinc-400">
                              <Tag className="h-3 w-3 text-zinc-500" />
                              {item.equipmentNames.join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <button
                        onClick={() => setPreviewItem(item)}
                        className="p-2 text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-lg transition-colors"
                        title="Quick Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Delete Update"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Create / Edit Update */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-5 my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-red-500" />
                <h3 className="text-base font-bold text-white">
                  {editingItem ? "Edit Field Update" : "Publish New Field Update"}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Title */}
              <div>
                <label className="block text-zinc-400 font-medium mb-1.5">
                  Update Title / Headline *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 4x 4.0-Ton Two-Post Lifts Delivered to Navana Motors Bay Expansion"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              {/* Category & Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1.5">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as UpdateCategory)}
                    className="w-full bg-[#2a2a2a] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <option value="shipment_inbound">Shipment Inbound (Port/Container)</option>
                    <option value="client_delivery">Client Delivery (Garages/Workshops)</option>
                    <option value="commissioning">Commissioning & Testing</option>
                    <option value="tech_bulletin">Technical Bulletin & EV Notice</option>
                    <option value="product_launch">Product Launch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1.5">Date *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Client / Company & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1.5">
                    Client / Workshop / Source
                  </label>
                  <input
                    type="text"
                    value={companyOrClient}
                    onChange={(e) => setCompanyOrClient(e.target.value)}
                    placeholder="e.g. Navana Motors Ltd., Chittagong Port"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1.5">
                    Location / Region
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Mirpur, Dhaka or Agrabad, Chittagong"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Equipment Tags */}
              <div>
                <label className="block text-zinc-400 font-medium mb-1.5">
                  Featured Machinery / Equipment (comma-separated)
                </label>
                <input
                  type="text"
                  value={equipmentInput}
                  onChange={(e) => setEquipmentInput(e.target.value)}
                  placeholder="e.g. Page 4.0 Ton Two-Post Lift, Launch X-431 PAD VII, Rotary Compressor"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              {/* Image URL & Uploader */}
              <div>
                <label className="block text-zinc-400 font-medium mb-1.5">
                  Photo / Banner Image
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="/durga-puja-launch-banner.png or /uploads/banners/..."
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  <label className="px-3 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors">
                    <Upload className="h-3.5 w-3.5" />
                    <span>{isUploading ? "Uploading..." : "Upload"}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (file) handleFileUpload(file);
                      }}
                    />
                  </label>
                </div>
                {imageUrl.trim() && (
                  <div className="mt-2 rounded-lg border border-white/[0.08] bg-black/30 p-2 flex items-center gap-3">
                    <img
                      src={imageUrl}
                      alt="Update preview"
                      className="h-14 w-24 rounded object-cover bg-zinc-900 shrink-0"
                    />
                    <span className="text-[11px] font-mono text-zinc-400 truncate">{imageUrl}</span>
                  </div>
                )}
              </div>

              {/* Summary (Hook) */}
              <div>
                <label className="block text-zinc-400 font-medium mb-1.5">
                  Short Summary / Hook * (Displayed on card)
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={2}
                  placeholder="1-2 sentences summarizing the delivery or shipment arrival..."
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
                />
              </div>

              {/* Full Content */}
              <div>
                <label className="block text-zinc-400 font-medium mb-1.5">
                  Full Dispatch Story (Markdown / Paragraphs for reader mode)
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  placeholder="Provide technical specifics, customer feedback, machine serial checks, training details..."
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              {/* Toggles: Pinned + Published + Author */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/[0.08]">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1.5">Author / Desk</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. PAGE Operations Desk"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="pinned-checkbox"
                    checked={pinned}
                    onChange={(e) => setPinned(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-800 text-red-600 focus:ring-red-500"
                  />
                  <label
                    htmlFor="pinned-checkbox"
                    className="text-zinc-300 font-medium cursor-pointer"
                  >
                    Pin to Top of Feed
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="published-checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-800 text-red-600 focus:ring-red-500"
                  />
                  <label
                    htmlFor="published-checkbox"
                    className="text-zinc-300 font-medium cursor-pointer"
                  >
                    Live (Published)
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-sm"
              >
                {editingItem ? "Save Changes" : "Publish Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="relative w-full max-w-xl bg-[#232323] border border-white/10 rounded-2xl p-6 space-y-4 my-auto text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                Feed Preview
              </span>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {previewItem.images && previewItem.images.length > 0 && (
              <img
                src={previewItem.images[0]}
                alt=""
                className="w-full aspect-[16/9] object-cover rounded-xl border border-white/10"
              />
            )}

            <h2 className="text-base font-bold text-white leading-snug">{previewItem.title}</h2>
            <p className="text-zinc-300 leading-relaxed">{previewItem.summary}</p>
            <div className="pt-2 text-[11px] text-zinc-500 font-mono">
              Date: {previewItem.date} • {previewItem.location} • By {previewItem.author}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 border border-white/10 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}
    </AdminLayout>
  );
}
