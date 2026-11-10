import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useBookings, useUpdateBooking, useDeleteBooking } from "@/lib/data-client";
import {
  CalendarCheck,
  Search,
  Check,
  XCircle,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  Building2,
  MapPin,
  Calendar,
  Wrench,
  Trash2,
  X,
  MessageCircle,
  User,
  FileEdit,
  Save,
  Sparkles,
} from "lucide-react";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/admin/bookings")({
  component: AdminBookings,
  head: () => ({
    meta: [{ title: "Bookings & Consultations — PAGE Admin" }],
  }),
});

function formatRelativeTime(dateString: string | Date | undefined | null) {
  if (!dateString) return "Flexible";
  try {
    const target = new Date(dateString);
    const now = new Date();
    // Normalize to dates
    const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.round((targetDate.getTime() - nowDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays > 1 && diffDays < 7) return `In ${diffDays} days`;
    if (diffDays < -1) return `${Math.abs(diffDays)}d ago`;
    return target.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return String(dateString);
  }
}

function formatWhatsAppLink(phone: string, company: string, service: string) {
  const digits = phone.replace(/[^0-9]/g, "");
  let cleanNumber = digits;
  if (digits.startsWith("880")) cleanNumber = digits;
  else if (digits.startsWith("01")) cleanNumber = `88${digits}`;
  else if (digits.length === 10) cleanNumber = `880${digits}`;

  const message = encodeURIComponent(
    `Hello ${company}, this is PAGE International Technical Support desk regarding your scheduled ${service || "equipment demonstration"}.`,
  );
  return `https://wa.me/${cleanNumber}?text=${message}`;
}

function AdminBookings() {
  const { data: rawBookings = [], isLoading } = useBookings();
  const updateBookingMutation = useUpdateBooking();
  const deleteBookingMutation = useDeleteBooking();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const bookings = useMemo(() => {
    return rawBookings.map((b: any) => ({
      ...b,
      serviceName: b.serviceType || b.serviceName || "Workshop Machinery Consultation",
      center: b.centerName || b.city || "PAGE Equipment Hub — Uttara, Dhaka",
    }));
  }, [rawBookings]);

  // KPI Calculations
  const pendingCount = bookings.filter((b) => b.status?.toLowerCase() === "pending").length;
  const confirmedCount = bookings.filter((b) => b.status?.toLowerCase() === "confirmed").length;
  const completedCount = bookings.filter((b) => b.status?.toLowerCase() === "completed").length;
  const cancelledCount = bookings.filter((b) => b.status?.toLowerCase() === "cancelled").length;

  const filtered = useMemo(() => {
    return bookings.filter((b: any) => {
      const matchSearch =
        !search ||
        b.companyName?.toLowerCase().includes(search.toLowerCase()) ||
        b.contactName?.toLowerCase().includes(search.toLowerCase()) ||
        b.serviceName?.toLowerCase().includes(search.toLowerCase()) ||
        b.center?.toLowerCase().includes(search.toLowerCase()) ||
        b.email?.toLowerCase().includes(search.toLowerCase()) ||
        b.phone?.toLowerCase().includes(search.toLowerCase());

      const status = (b.status || "pending").toLowerCase();
      let matchStatus = true;
      if (statusFilter === "pending") matchStatus = status === "pending";
      else if (statusFilter === "confirmed") matchStatus = status === "confirmed";
      else if (statusFilter === "completed") matchStatus = status === "completed";
      else if (statusFilter === "cancelled") matchStatus = status === "cancelled";

      return matchSearch && matchStatus;
    });
  }, [bookings, search, statusFilter]);

  async function handleStatusChange(id: string, status: string) {
    await updateBookingMutation.mutateAsync({ id, status: status.toUpperCase() });
  }

  async function handleSaveAdminNotes(id: string) {
    await updateBookingMutation.mutateAsync({ id, adminNotes: noteDraft });
    setEditingNotesId(null);
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to permanently delete this consultation booking?")) {
      await deleteBookingMutation.mutateAsync(id);
    }
  }

  function statusBadge(rawStatus: string) {
    const status = (rawStatus || "pending").toLowerCase();
    const isPending = status === "pending";
    const isConfirmed = status === "confirmed";
    const isCompleted = status === "completed";

    const badgeClass = isPending
      ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
      : isConfirmed
        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
        : isCompleted
          ? "bg-sky-500/15 text-sky-400 border-sky-500/30"
          : "bg-red-500/15 text-red-400 border-red-500/30";

    const icon = isPending ? (
      <Clock className="h-3 w-3 animate-pulse" />
    ) : isConfirmed ? (
      <Check className="h-3 w-3" />
    ) : isCompleted ? (
      <CheckCircle2 className="h-3 w-3" />
    ) : (
      <XCircle className="h-3 w-3" />
    );

    return (
      <span
        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeClass}`}
      >
        {icon}
        <span className="capitalize">{status}</span>
      </span>
    );
  }

  return (
    <AdminLayout activeRoute="/admin/bookings">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto">
        {/* Executive Header & Quick Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center">
                <CalendarCheck className="h-4 w-4" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight font-display">
                Machinery Consultation Bookings
              </h1>
            </div>
            <p className="text-[13px] text-zinc-400 mt-1">
              Manage equipment demonstration bay bookings & technical consultations •{" "}
              <strong className="text-white font-medium">{bookings.length} total bookings</strong> •{" "}
              <span className="text-amber-400 font-semibold">{pendingCount} pending review</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-mono font-medium">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              Live Demonstration Bay Schedule
            </span>
          </div>
        </div>

        {/* Executive KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#18181b] border border-white/[0.07] rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Total Bookings</span>
              <CalendarCheck className="h-4 w-4 text-zinc-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">{bookings.length}</span>
              <span className="text-[11px] text-zinc-500">appointments</span>
            </div>
          </div>

          <div className="bg-[#18181b] border border-amber-500/30 rounded-xl p-4 shadow-sm bg-gradient-to-br from-amber-500/5 to-transparent">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-300">Action Needed</span>
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-amber-400">{pendingCount}</span>
              <span className="text-[11px] text-amber-500/80 font-medium">pending review</span>
            </div>
          </div>

          <div className="bg-[#18181b] border border-white/[0.07] rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-400">Confirmed Sessions</span>
              <Check className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {confirmedCount}
              </span>
              <span className="text-[11px] text-zinc-500">scheduled</span>
            </div>
          </div>

          <div className="bg-[#18181b] border border-white/[0.07] rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-sky-400">Completed Sessions</span>
              <CheckCircle2 className="h-4 w-4 text-sky-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-sky-400">{completedCount}</span>
              <span className="text-[11px] text-zinc-500">conducted</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#18181b] p-3 rounded-xl border border-white/[0.07]">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by workshop, contact, service or city..."
              className="w-full bg-[#121214] border border-white/[0.08] rounded-lg pl-9 pr-8 py-2 text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Segmented Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: "all", label: "All", count: bookings.length },
              { id: "pending", label: "Pending", count: pendingCount, color: "text-amber-400" },
              {
                id: "confirmed",
                label: "Confirmed",
                count: confirmedCount,
                color: "text-emerald-400",
              },
              { id: "completed", label: "Completed", count: completedCount, color: "text-sky-400" },
              {
                id: "cancelled",
                label: "Cancelled",
                count: cancelledCount,
                color: "text-zinc-400",
              },
            ].map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    active
                      ? "bg-white/[0.1] text-white shadow-xs font-semibold"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      active ? "bg-white/20 text-white" : "bg-white/[0.05] text-zinc-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bookings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {isLoading ? (
            <div className="col-span-full py-20 text-center space-y-3 bg-[#18181b] rounded-2xl border border-white/[0.06]">
              <div className="h-8 w-8 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin mx-auto" />
              <p className="text-xs font-mono text-zinc-400">Loading consultation schedule...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-[#18181b] rounded-2xl border border-white/[0.06] space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-white/[0.04] flex items-center justify-center text-zinc-600 mx-auto">
                <CalendarCheck className="h-6 w-6" />
              </div>
              <p className="text-[14px] text-zinc-300 font-semibold">No bookings found</p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                {search || statusFilter !== "all"
                  ? "Try adjusting your search terms or clearing active filters."
                  : "Workshop appointment bookings will appear here."}
              </p>
              {(search || statusFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  className="btn btn-outline text-xs px-4 py-1.5 rounded-lg border-white/[0.1] text-zinc-300 hover:text-white"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            filtered.map((b: any) => {
              const status = (b.status || "pending").toLowerCase();
              const isPending = status === "pending";
              const isConfirmed = status === "confirmed";
              const isCompleted = status === "completed";
              const isEditingNotes = editingNotesId === b.id;

              // Border accent based on status
              const borderLeftAccent = isPending
                ? "border-l-4 border-l-amber-500"
                : isConfirmed
                  ? "border-l-4 border-l-emerald-500"
                  : isCompleted
                    ? "border-l-4 border-l-sky-500"
                    : "border-l-4 border-l-zinc-600";

              return (
                <div
                  key={b.id}
                  className={`bg-[#18181b] border border-white/[0.07] ${borderLeftAccent} rounded-2xl p-5 hover:border-white/[0.12] transition-all shadow-sm flex flex-col justify-between space-y-4`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
                        <CalendarCheck className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                            {b.companyName}
                          </h3>
                          <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.04] px-1.5 py-0.5 rounded">
                            #{b.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 truncate mt-0.5 flex items-center gap-1.5">
                          <User className="h-3 w-3 text-zinc-500" />
                          <span>{b.contactName}</span>
                        </p>
                      </div>
                    </div>
                    {statusBadge(b.status)}
                  </div>

                  {/* Consultation Specifications Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-[#121214] p-3 rounded-xl border border-white/[0.04] text-xs">
                    <div className="flex items-start gap-2.5">
                      <Wrench className="h-4 w-4 text-violet-400 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider block">
                          Service Mode
                        </span>
                        <span className="text-zinc-200 font-medium block truncate">
                          {b.serviceName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <MapPin className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider block">
                          Facility Hub
                        </span>
                        <span className="text-zinc-200 font-medium block truncate">{b.center}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 sm:col-span-2 border-t border-white/[0.04] pt-2">
                      <Calendar className="h-4 w-4 text-sky-400 mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider block">
                            Requested Schedule
                          </span>
                          <span className="text-zinc-100 font-semibold font-mono">
                            {b.bookingDate || "Flexible Date"}{" "}
                            {b.timeSlot ? `• Slot: ${b.timeSlot}` : ""}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20 font-semibold">
                          {formatRelativeTime(b.bookingDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Notes */}
                  {b.notes && (
                    <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                        Client Inquiries / Project Notes
                      </span>
                      <p className="text-zinc-300 italic">“{b.notes}”</p>
                    </div>
                  )}

                  {/* Internal Staff Notes / Lead Engineer Assignment */}
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                        <FileEdit className="h-3 w-3 text-zinc-500" />
                        Staff Engineering Notes
                      </span>
                      {!isEditingNotes && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNotesId(b.id);
                            setNoteDraft(b.adminNotes || "");
                          }}
                          className="text-[10px] text-zinc-400 hover:text-white font-medium hover:underline cursor-pointer"
                        >
                          {b.adminNotes ? "Edit" : "+ Add Note"}
                        </button>
                      )}
                    </div>

                    {isEditingNotes ? (
                      <div className="space-y-2 pt-1">
                        <textarea
                          rows={2}
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          placeholder="Assign lead engineer, bay number, or trial notes..."
                          className="w-full bg-[#121214] border border-white/[0.1] rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                        />
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingNotesId(null)}
                            className="px-2.5 py-1 text-[11px] text-zinc-400 hover:text-zinc-200 rounded cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveAdminNotes(b.id)}
                            className="px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-semibold rounded-md flex items-center gap-1 cursor-pointer shadow-sm"
                          >
                            <Save className="h-3 w-3" />
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-zinc-400 text-xs">
                        {b.adminNotes || (
                          <span className="text-zinc-600 italic">
                            No internal engineer notes recorded.
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Actions & Direct Contact Strip */}
                  <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
                    {/* Instant Contact Links */}
                    <div className="flex items-center gap-1.5">
                      {b.phone && (
                        <>
                          <a
                            href={`tel:${b.phone}`}
                            className="h-8 w-8 rounded-lg bg-white/[0.04] hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-300 border border-white/[0.06] flex items-center justify-center transition-colors"
                            title={`Call ${b.phone}`}
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </a>
                          <a
                            href={formatWhatsAppLink(b.phone, b.companyName, b.serviceName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-8 w-8 rounded-lg bg-white/[0.04] hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 border border-white/[0.06] flex items-center justify-center transition-colors"
                            title="Confirm via WhatsApp"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </a>
                        </>
                      )}
                      <a
                        href={`mailto:${b.email}?subject=${encodeURIComponent(
                          `[PAGE Consultation Confirmation] Appointment #${b.id.toUpperCase()}`,
                        )}`}
                        className="h-8 w-8 rounded-lg bg-white/[0.04] hover:bg-sky-500/20 text-zinc-400 hover:text-sky-300 border border-white/[0.06] flex items-center justify-center transition-colors"
                        title={`Email ${b.email}`}
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </a>
                    </div>

                    {/* Status Modifiers & Delete */}
                    <div className="flex items-center gap-2">
                      {isPending && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(b.id, "confirmed")}
                          className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Confirm</span>
                        </button>
                      )}

                      {isConfirmed && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(b.id, "completed")}
                          className="h-8 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Mark Done</span>
                        </button>
                      )}

                      {status !== "cancelled" && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(b.id, "cancelled")}
                          className="h-8 px-2.5 rounded-lg bg-white/[0.04] hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-white/[0.06] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Cancel</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(b.id)}
                        className="h-8 w-8 rounded-lg bg-white/[0.04] hover:bg-red-500/20 text-zinc-500 hover:text-red-400 border border-white/[0.06] flex items-center justify-center transition-colors cursor-pointer"
                        title="Delete booking"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
