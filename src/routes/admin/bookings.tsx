import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { getBookings, updateBookingStatus, type ConsultBooking } from "@/lib/admin-data";
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
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/bookings")({
  component: AdminBookings,
  head: () => ({
    meta: [{ title: "Bookings — PAGE Admin" }],
  }),
});

function AdminBookings() {
  const [bookings, setBookings] = useState(() => getBookings());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = bookings.filter((b) => {
    const matchSearch =
      !search ||
      b.companyName.toLowerCase().includes(search.toLowerCase()) ||
      b.contactName.toLowerCase().includes(search.toLowerCase()) ||
      b.serviceName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function handleStatusChange(id: string, status: ConsultBooking["status"]) {
    updateBookingStatus(id, status);
    setBookings(getBookings());
  }

  function statusBadge(status: ConsultBooking["status"]) {
    const styles = {
      pending: "bg-amber-500/15 text-amber-400",
      confirmed: "bg-emerald-500/15 text-emerald-400",
      completed: "bg-blue-500/15 text-blue-400",
      cancelled: "bg-red-500/15 text-red-400",
    };
    const icons = {
      pending: <Clock className="h-3 w-3" />,
      confirmed: <Check className="h-3 w-3" />,
      completed: <CheckCircle2 className="h-3 w-3" />,
      cancelled: <XCircle className="h-3 w-3" />,
    };
    return (
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${styles[status]}`}
      >
        {icons[status]}
        {status}
      </span>
    );
  }

  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  return (
    <AdminLayout activeRoute="/admin/bookings">
      <div className="p-6 lg:p-8 space-y-6 max-w-[1440px]">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Bookings</h1>
          <p className="text-[13px] text-zinc-500 mt-1">
            {bookings.length} consultation bookings • {pendingCount} pending
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bookings..."
              className="w-full bg-[#232323] border border-white/[0.06] rounded-lg pl-9 pr-3 py-[7px] text-[13px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
            />
          </div>

          <div className="flex gap-1.5">
            {["all", "pending", "confirmed", "completed", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-[7px] rounded-lg text-[12px] font-medium transition-all ${
                  statusFilter === s
                    ? "bg-white/[0.08] text-white"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
                }`}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                {s === "pending" && pendingCount > 0 && (
                  <span className="ml-1.5 bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Booking Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="bg-[#232323] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.1] transition-all space-y-4"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                    <CalendarCheck className="h-5 w-5 text-violet-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-white truncate">{b.companyName}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{b.contactName}</p>
                  </div>
                </div>
                {statusBadge(b.status)}
              </div>

              {/* Service & Center */}
              <div className="space-y-2.5">
                <div className="flex items-start gap-2">
                  <Wrench className="h-3.5 w-3.5 text-zinc-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-zinc-600">Service</p>
                    <p className="text-[12px] text-zinc-300">{b.serviceName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-zinc-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-zinc-600">Center</p>
                    <p className="text-[12px] text-zinc-300">{b.centerName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="h-3.5 w-3.5 text-zinc-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-zinc-600">Preferred Date</p>
                    <p className="text-[12px] text-zinc-300 font-medium">
                      {new Date(b.preferredDate).toLocaleDateString("en-GB", {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                  <Phone className="h-3 w-3" />
                  {b.phone}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                  <Mail className="h-3 w-3" />
                  {b.email}
                </div>
              </div>

              {b.notes && (
                <div className="bg-white/[0.02] rounded-lg p-2.5">
                  <p className="text-[11px] text-zinc-400">{b.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-1 border-t border-white/[0.04]">
                {b.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleStatusChange(b.id, "confirmed")}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Check className="h-3 w-3" />
                      Confirm
                    </button>
                    <button
                      onClick={() => handleStatusChange(b.id, "cancelled")}
                      className="flex items-center gap-1.5 bg-white/[0.06] hover:bg-red-500/20 text-zinc-300 hover:text-red-400 text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <XCircle className="h-3 w-3" />
                      Cancel
                    </button>
                  </>
                )}
                {b.status === "confirmed" && (
                  <>
                    <button
                      onClick={() => handleStatusChange(b.id, "completed")}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Mark Complete
                    </button>
                    <button
                      onClick={() => handleStatusChange(b.id, "cancelled")}
                      className="flex items-center gap-1.5 bg-white/[0.06] hover:bg-red-500/20 text-zinc-300 hover:text-red-400 text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <XCircle className="h-3 w-3" />
                      Cancel
                    </button>
                  </>
                )}
                {(b.status === "completed" || b.status === "cancelled") && (
                  <span className="text-[11px] text-zinc-600 italic">
                    {b.status === "completed" ? "Consultation completed" : "Booking cancelled"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <CalendarCheck className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-[14px] text-zinc-400 font-medium">No bookings found</p>
            <p className="text-[12px] text-zinc-600 mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
