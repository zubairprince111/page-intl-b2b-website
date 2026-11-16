import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useAdminReviews,
  useSaveReview,
  useToggleReviewPublish,
  useDeleteReview,
  useSeedDefaultReviews,
} from "@/lib/data-client";
import type { ReviewRow } from "@/db";
import {
  Star,
  MessageSquareQuote,
  CheckCircle2,
  AlertTriangle,
  Search,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  RotateCcw,
  X,
  ShieldCheck,
  Check,
  Sparkles,
  Building2,
  Wrench,
  User,
  Calendar,
} from "lucide-react";
import { useState, useMemo } from "react";
import { requireAdminBeforeLoad } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/reviews")({
  beforeLoad: requireAdminBeforeLoad,
  component: AdminReviews,
  head: () => ({
    meta: [{ title: "Reviews Management — PAGE Admin" }],
  }),
});

interface ReviewFormData {
  id?: string;
  name: string;
  role: string;
  workshop: string;
  equipment: string;
  rating: number;
  title: string;
  comment: string;
  isPublished: boolean;
}

const INITIAL_FORM: ReviewFormData = {
  name: "",
  role: "Workshop Managing Director",
  workshop: "",
  equipment: "LAUNCH X-431 PAD9 LINK Flagship Diagnostics",
  rating: 5,
  title: "Outstanding performance and OE-level diagnostic speed",
  comment: "",
  isPublished: true,
};

const TEST_TEMPLATES: Array<Omit<ReviewFormData, "id">> = [
  {
    name: "Engr. Zahirul Haque",
    role: "Chief Technical Officer",
    workshop: "Delta Apex Commercial Fleet Depot",
    equipment: "LAUNCH SmartLink C Heavy-Duty Diagnostic Module V2.0",
    rating: 5,
    title: "Faultless heavy-duty commercial truck ECU scanning",
    comment:
      "We tested the SmartLink C on our Cummins and Volvo prime mover fleet in Gazipur. The dual processor handles J1939 and J1708 protocols instantly with zero communication lag. Highly recommended for commercial transport workshops.",
    isPublished: true,
  },
  {
    name: "Kamrul Ahsan",
    role: "Proprietor & Master Tech",
    workshop: "Dhaka AutoCraft Modern Garages",
    equipment: "TORQ-4000 · 4.0T Electro-Hydraulic 2-Post Lift",
    rating: 5,
    title: "Remarkable lifting stability with zero hydraulic creep",
    comment:
      "Installed two PAGE 4-ton lifts three months ago. The synchronization cables and dual hydraulic rams perform smoothly under full load. Customer service and foundation commissioning were prompt and professional.",
    isPublished: true,
  },
  {
    name: "Sajjad Hossain",
    role: "EV Diagnostics Specialist",
    workshop: "VoltCare EV Service Hub",
    equipment: "LAUNCH X-431 PRO5 SmartLink Bi-Directional Diagnostic Tablet",
    rating: 4,
    title: "Solid bi-directional coding and battery module test support",
    comment:
      "Great tablet scanner for modern EV high-voltage diagnostics and guided trouble shooting. Software updates over Wi-Fi are seamless.",
    isPublished: false,
  },
];

export function AdminReviews() {
  const { data: rawReviews = [], isLoading } = useAdminReviews();
  const reviewsList = rawReviews as ReviewRow[];
  const saveReviewMutation = useSaveReview();
  const togglePublishMutation = useToggleReviewPublish();
  const deleteReviewMutation = useDeleteReview();
  const seedDefaultMutation = useSeedDefaultReviews();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "hidden">("all");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<ReviewFormData>(INITIAL_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Confirmation State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Toast / status feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return reviewsList.filter((r) => {
      // Status filter
      if (statusFilter === "published" && !r.isPublished) return false;
      if (statusFilter === "hidden" && r.isPublished) return false;

      // Rating filter
      if (ratingFilter !== "all" && r.rating !== ratingFilter) return false;

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = r.name?.toLowerCase().includes(q);
        const matchesWorkshop = r.workshop?.toLowerCase().includes(q);
        const matchesEquipment = r.equipment?.toLowerCase().includes(q);
        const matchesComment = r.comment?.toLowerCase().includes(q);
        const matchesRole = r.role?.toLowerCase().includes(q);
        if (
          !matchesName &&
          !matchesWorkshop &&
          !matchesEquipment &&
          !matchesComment &&
          !matchesRole
        ) {
          return false;
        }
      }

      return true;
    });
  }, [reviewsList, statusFilter, ratingFilter, search]);

  // Aggregate Stats
  const stats = useMemo(() => {
    const total = reviewsList.length;
    const published = reviewsList.filter((r) => r.isPublished).length;
    const hidden = total - published;
    const avgRating =
      total > 0
        ? (reviewsList.reduce((sum: number, r) => sum + (r.rating || 5), 0) / total).toFixed(2)
        : "5.00";
    return { total, published, hidden, avgRating };
  }, [reviewsList]);

  function handleOpenCreate() {
    setFormData(INITIAL_FORM);
    setFormError(null);
    setIsModalOpen(true);
  }

  function handleOpenEdit(r: ReviewRow) {
    setFormData({
      id: r.id,
      name: r.name,
      role: r.role,
      workshop: r.workshop,
      equipment: r.equipment,
      rating: r.rating ?? 5,
      title: r.title ?? "",
      comment: r.comment,
      isPublished: Boolean(r.isPublished),
    });
    setFormError(null);
    setIsModalOpen(true);
  }

  function handleApplyTemplate(idx: number) {
    const template = TEST_TEMPLATES[idx];
    if (!template) return;
    setFormData((prev) => ({
      ...prev,
      ...template,
    }));
  }

  async function handleSaveReview(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Full name is required.");
      return;
    }
    if (!formData.workshop.trim()) {
      setFormError("Workshop or company name is required.");
      return;
    }
    if (!formData.comment.trim()) {
      setFormError("Review comment is required.");
      return;
    }

    try {
      await saveReviewMutation.mutateAsync({
        id: formData.id,
        name: formData.name.trim(),
        role: formData.role.trim() || "Workshop Managing Director",
        workshop: formData.workshop.trim(),
        equipment: formData.equipment.trim() || "Commercial Machinery",
        rating: formData.rating,
        title: formData.title.trim() || `Review on ${formData.equipment.trim()}`,
        comment: formData.comment.trim(),
        isPublished: formData.isPublished,
      });

      setIsModalOpen(false);
      showToast(
        formData.id ? "Review updated successfully." : "Test review created and saved to database.",
      );
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to save review.");
    }
  }

  async function handleTogglePublish(id: string, currentStatus: boolean) {
    try {
      await togglePublishMutation.mutateAsync({ id, isPublished: !currentStatus });
      showToast(
        !currentStatus ? "Review published to storefront." : "Review hidden from storefront.",
      );
    } catch (err: unknown) {
      showToast(`Error: ${err instanceof Error ? err.message : "Failed to update status."}`);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTargetId) return;
    try {
      await deleteReviewMutation.mutateAsync({ id: deleteTargetId });
      setDeleteTargetId(null);
      showToast("Review deleted permanently.");
    } catch (err: unknown) {
      showToast(`Error: ${err instanceof Error ? err.message : "Failed to delete review."}`);
    }
  }

  async function handleRestoreDefaults() {
    if (!window.confirm("Restore and sync default verified reviews to the database?")) return;
    try {
      const res = await seedDefaultMutation.mutateAsync();
      showToast(`Synced ${res.count} default verified reviews.`);
    } catch (err: unknown) {
      showToast(`Error: ${err instanceof Error ? err.message : "Failed to restore defaults."}`);
    }
  }

  return (
    <AdminLayout activeRoute="/admin/reviews">
      <div className="p-6 lg:p-8 space-y-6 max-w-[1440px]">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Star className="h-6 w-6 text-amber-400 fill-amber-400" />
              Customer & Workshop Reviews
            </h1>
            <p className="text-[13px] text-zinc-400 mt-1">
              Review, moderate, approve, test, and manage client feedback and verified workshop
              testimonials.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRestoreDefaults}
              disabled={seedDefaultMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              title="Sync default verified reviews if missing"
            >
              <RotateCcw
                className={`h-3.5 w-3.5 ${seedDefaultMutation.isPending ? "animate-spin" : ""}`}
              />
              Sync Defaults
            </button>

            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add Test Review
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#232323] border border-white/[0.06] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Total Reviews</span>
              <MessageSquareQuote className="h-4 w-4 text-zinc-500" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">{stats.total}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Stored in PostgreSQL</p>
          </div>

          <div className="bg-[#232323] border border-white/[0.06] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-400">Published Live</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-emerald-400 mt-2">{stats.published}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Visible on Storefront</p>
          </div>

          <div className="bg-[#232323] border border-white/[0.06] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-400">Hidden / Pending</span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-400 mt-2">{stats.hidden}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Moderation required</p>
          </div>

          <div className="bg-[#232323] border border-white/[0.06] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-yellow-400">Average Rating</span>
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-yellow-400 mt-2">{stats.avgRating} ★</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Out of 5.0 scale</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-[#1b1b1b] border border-white/[0.06] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by reviewer, workshop, equipment, or quote..."
              className="w-full bg-[#121212] border border-white/10 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-emerald-500/50"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Pills */}
            <div className="flex items-center bg-[#121212] border border-white/10 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  statusFilter === "all"
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setStatusFilter("published")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  statusFilter === "published"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "text-zinc-400 hover:text-emerald-400"
                }`}
              >
                Published ({stats.published})
              </button>
              <button
                onClick={() => setStatusFilter("hidden")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  statusFilter === "hidden"
                    ? "bg-amber-500/20 text-amber-400"
                    : "text-zinc-400 hover:text-amber-400"
                }`}
              >
                Hidden ({stats.hidden})
              </button>
            </div>

            {/* Rating Filter Dropdown */}
            <select
              value={ratingFilter}
              onChange={(e) =>
                setRatingFilter(e.target.value === "all" ? "all" : Number(e.target.value))
              }
              aria-label="Filter reviews by star rating"
              className="bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-hidden focus:border-emerald-500/50"
            >
              <option value="all">All Star Ratings</option>
              <option value="5">5 Stars Only</option>
              <option value="4">4 Stars Only</option>
              <option value="3">3 Stars Only</option>
              <option value="2">2 Stars Only</option>
              <option value="1">1 Star Only</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 bg-[#1f1f1f] border border-white/[0.06] rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-[#1b1b1b] border border-white/[0.06] rounded-xl p-12 text-center">
            <MessageSquareQuote className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white">No reviews found</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              {search || statusFilter !== "all" || ratingFilter !== "all"
                ? "No reviews match your search or filter criteria. Try clearing filters."
                : "No customer reviews currently in database. Click 'Add Test Review' or 'Sync Defaults' to populate."}
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={handleOpenCreate}
                className="btn btn-primary h-8 px-4 text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Test Review
              </button>
              <button
                onClick={handleRestoreDefaults}
                className="btn btn-outline h-8 px-4 text-xs font-semibold text-zinc-300 border-white/10 hover:bg-white/5"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Restore Default Reviews
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReviews.map((r) => {
              const initials =
                r.name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .filter(Boolean)
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "REV";

              return (
                <div
                  key={r.id}
                  className="bg-[#1e1e1e] border border-white/[0.06] rounded-xl p-4 sm:p-5 hover:border-white/15 transition-all duration-150 flex flex-col md:flex-row md:items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* Reviewer Avatar */}
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-600 to-rose-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                      {initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Name & Workshop Header */}
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <h4 className="text-sm font-bold text-white tracking-tight">{r.name}</h4>
                        <span className="text-xs text-zinc-400 font-medium">· {r.role}</span>
                        <div className="flex items-center gap-1 text-[11px] text-zinc-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                          <Building2 className="h-3 w-3 text-primary shrink-0" />
                          <span className="truncate max-w-[200px]">{r.workshop}</span>
                        </div>
                      </div>

                      {/* Equipment Pill & Star Rating */}
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < (r.rating || 5)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-zinc-600 fill-zinc-600/30"
                              }`}
                            />
                          ))}
                          <span className="text-xs font-semibold ml-1 text-zinc-300 font-mono">
                            {r.rating || 5}.0
                          </span>
                        </div>

                        {r.equipment && (
                          <div className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                            <Wrench className="h-2.5 w-2.5 shrink-0" />
                            <span className="font-mono truncate max-w-[260px]">{r.equipment}</span>
                          </div>
                        )}

                        <span className="text-[11px] text-zinc-500 font-mono ml-auto md:ml-0">
                          {r.createdAt
                            ? new Date(r.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Recently submitted"}
                        </span>
                      </div>

                      {/* Review Title & Comment */}
                      {r.title && (
                        <p className="text-xs font-semibold text-zinc-200 mt-2">"{r.title}"</p>
                      )}
                      <p className="text-xs text-zinc-300/90 leading-relaxed mt-1 line-clamp-3 hover:line-clamp-none transition-all">
                        {r.comment}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Status on Right */}
                  <div className="flex items-center md:flex-col md:items-end justify-between gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/[0.06]">
                    {/* Published Toggle Button */}
                    <button
                      onClick={() => handleTogglePublish(r.id, r.isPublished)}
                      disabled={togglePublishMutation.isPending}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer border ${
                        r.isPublished
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                          : "bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25"
                      }`}
                      title="Click to toggle storefront visibility"
                    >
                      {r.isPublished ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(r)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title="Edit review"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteTargetId(r.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete review to keep panel organized"
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

        {/* Add / Edit Review Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#1a1a1a] p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-zinc-200">
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider mb-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{formData.id ? "Edit Review" : "Add / Test Review"}</span>
              </div>
              <h2 className="text-xl font-bold text-white">
                {formData.id ? "Edit Customer Review" : "Create Verified Review"}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Save directly into PostgreSQL. Set visibility to control display on the storefront
                testimonials carousel.
              </p>

              {/* Sample Templates Bar (Only when creating new) */}
              {!formData.id && (
                <div className="mt-3.5 p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-amber-400" />
                      Quick Test Templates:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {TEST_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyTemplate(idx)}
                        className="px-2.5 py-1 rounded bg-[#252525] hover:bg-[#303030] text-[11px] text-zinc-300 hover:text-white border border-white/5 transition-colors cursor-pointer text-left"
                      >
                        {tmpl.name} ({tmpl.workshop.split(" ")[0]})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {formError && (
                <div className="mt-3 p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-xs text-red-300">
                  {formError}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSaveReview} className="space-y-3.5 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Reviewer Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Engr. Rafiqul Islam"
                      className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Role / Designation
                    </label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g. Managing Director"
                      className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Workshop / Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.workshop}
                      onChange={(e) => setFormData({ ...formData, workshop: e.target.value })}
                      placeholder="e.g. Apex Master Garage & Fleet Hub"
                      className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Equipment / Product Model
                    </label>
                    <input
                      type="text"
                      value={formData.equipment}
                      onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                      placeholder="e.g. LAUNCH X-431 PAD9 LINK"
                      className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                {/* Rating Selector */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Rating ({formData.rating} of 5 Stars)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            star <= formData.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-zinc-600 fill-zinc-600/30"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Title */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Headline / Summary Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Faultless lifting power and outstanding structural steel build"
                    className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500/50"
                  />
                </div>

                {/* Review Comment */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Testimonial / Review Comment *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    placeholder="Describe machinery performance, installation experience, diagnostic accuracy, or after-sales technical support..."
                    className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500/50 resize-y"
                  />
                </div>

                {/* Visibility Toggle */}
                <div className="flex items-center gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="rounded bg-[#121212] border-white/20 text-emerald-500 focus:ring-emerald-500"
                  />
                  <label htmlFor="isPublished" className="text-xs text-zinc-300 cursor-pointer">
                    Publish immediately to storefront testimonials carousel
                  </label>
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-white/10 text-xs text-zinc-300 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveReviewMutation.isPending}
                    className="btn btn-primary h-9 px-5 text-xs font-semibold"
                  >
                    {saveReviewMutation.isPending
                      ? "Saving..."
                      : formData.id
                        ? "Update Review"
                        : "Save Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {deleteTargetId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="relative w-full max-w-sm rounded-xl border border-white/10 bg-[#1e1e1e] p-5 shadow-2xl text-zinc-200">
              <div className="h-10 w-10 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mb-3">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Delete Review?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Are you sure you want to remove this review? It will be permanently removed from
                PostgreSQL and the storefront.
              </p>

              <div className="flex items-center justify-end gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(null)}
                  className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-zinc-300 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleteReviewMutation.isPending}
                  className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  {deleteReviewMutation.isPending ? "Deleting..." : "Delete Permanently"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
