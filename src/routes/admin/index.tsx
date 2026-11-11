import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminStats } from "@/lib/data-client";
import {
  Package,
  AlertTriangle,
  FileText,
  CalendarCheck,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
  head: () => ({
    meta: [{ title: "Admin Dashboard — PAGE International" }],
  }),
});

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#f97316"];

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-[#232323] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.1] transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div
          className="h-9 w-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="h-4.5 w-4.5" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-[12px] text-zinc-500 mt-1">{label}</p>
      {sub && <p className="text-[11px] text-zinc-600 mt-0.5">{sub}</p>}
    </div>
  );
}

export function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading || !stats) {
    return (
      <AdminLayout activeRoute="/admin">
        <div className="p-6 lg:p-8 space-y-8 max-w-[1440px]">
          <div>
            <div className="h-7 w-40 bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-64 bg-zinc-800/60 rounded mt-2 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-[#232323] border border-white/[0.06] rounded-xl p-5 animate-pulse"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 h-72 bg-[#232323] border border-white/[0.06] rounded-xl p-5 animate-pulse" />
            <div className="h-72 bg-[#232323] border border-white/[0.06] rounded-xl p-5 animate-pulse" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  const recentQuotes = stats.recentQuotes || [];
  const recentBookings = stats.recentBookings || [];
  const lowStockItems = stats.lowStockItems || [];

  return (
    <AdminLayout activeRoute="/admin">
      <div className="p-6 lg:p-8 space-y-8 max-w-[1440px]">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-[13px] text-zinc-500 mt-1">
            Real-time PostgreSQL overview of store catalog, stock alerts, quotes, and bookings.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={Package}
            label="Total Products"
            value={stats.totalProducts}
            sub={`${stats.lowStockCount} low stock`}
            color="#10b981"
          />
          <StatCard
            icon={AlertTriangle}
            label="Low Stock Alerts"
            value={stats.lowStockCount}
            sub="At or below reorder threshold"
            color="#ef4444"
          />
          <StatCard
            icon={FileText}
            label="Pending Quotations"
            value={stats.pendingQuotes}
            sub={`${stats.totalQuotes} total requests`}
            color="#f59e0b"
          />
          <StatCard
            icon={CalendarCheck}
            label="Upcoming Bookings"
            value={Math.max(0, stats.totalBookings - stats.pendingBookings)}
            sub={`${stats.pendingBookings} awaiting confirmation`}
            color="#8b5cf6"
          />
        </div>

        {/* Catalog & Stock Breakdown Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Low Stock Watchlist (Real DB data) */}
          <div className="xl:col-span-2 bg-[#232323] border border-white/[0.06] rounded-xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-semibold text-white">Low Stock Watchlist</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Warehouse items at or below configured reorder level
                </p>
              </div>
              <a
                href="/admin/inventory"
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                Manage stock →
              </a>
            </div>
            <div className="divide-y divide-white/[0.04] flex-1">
              {lowStockItems.map((item: any) => (
                <div
                  key={item.id ?? item.slug}
                  className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-medium text-zinc-200 truncate">{item.name}</p>
                    <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                      {item.sku} · {item.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-[12px] font-semibold text-white tabular-nums">
                        {item.warehouseQty} units
                      </p>
                      <p className="text-[10px] text-zinc-500 tabular-nums">
                        Reorder at {item.reorderLevel}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        item.warehouseQty <= 0
                          ? "bg-red-500/15 text-red-400"
                          : "bg-amber-500/15 text-amber-400"
                      }`}
                    >
                      {item.warehouseQty <= 0 ? "Out of stock" : "Low stock"}
                    </span>
                  </div>
                </div>
              ))}
              {lowStockItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <CheckCircle2 className="h-7 w-7 text-emerald-400 mb-2" />
                  <p className="text-[13px] font-medium text-zinc-200">
                    All catalog stock levels are healthy
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    No equipment or spare parts are currently below their reorder threshold.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-[#232323] border border-white/[0.06] rounded-xl p-5">
            <h3 className="text-[14px] font-semibold text-white mb-1">Inventory by Category</h3>
            <p className="text-[11px] text-zinc-500 mb-4">PostgreSQL Catalog Breakdown</p>
            <div className="h-[180px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryDistribution}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={45}
                    strokeWidth={2}
                    stroke="#1c1c1c"
                  >
                    {stats.categoryDistribution.map((_: any, idx: number) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#232323",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "8px",
                    }}
                    itemStyle={{ color: "#d4d4d8", fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 space-y-1.5">
              {stats.categoryDistribution
                .slice(0, 4)
                .map((cat: { name: string; count: number }, idx: number) => (
                  <div key={cat.name} className="flex items-center gap-2 text-[11px]">
                    <div
                      className="h-2.5 w-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span className="text-zinc-400 truncate flex-1">{cat.name}</span>
                    <span className="text-zinc-500 font-medium">{cat.count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Recent Quotes */}
          <div className="bg-[#232323] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <h3 className="text-[14px] font-semibold text-white">Recent Quotations</h3>
              <a
                href="/admin/quotes"
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                View all →
              </a>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {recentQuotes.map((q: any) => (
                <div
                  key={q.id}
                  className="px-5 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="text-[12px] font-medium text-zinc-200 truncate">
                        {q.companyName}
                      </p>
                      {q.quoteNumber && (
                        <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                          {q.quoteNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 truncate">{q.productName}</p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      q.status.toLowerCase() === "pending"
                        ? "bg-amber-500/15 text-amber-400"
                        : q.status.toLowerCase() === "replied" ||
                            q.status.toLowerCase() === "quoted"
                          ? "bg-blue-500/15 text-blue-400"
                          : q.status.toLowerCase() === "accepted" ||
                              q.status.toLowerCase() === "completed"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    {q.status}
                  </span>
                </div>
              ))}
              {recentQuotes.length === 0 && (
                <p className="text-zinc-600 text-[12px] text-center py-8">No quotations yet</p>
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-[#232323] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <h3 className="text-[14px] font-semibold text-white">Recent Bookings</h3>
              <a
                href="/admin/bookings"
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                View all →
              </a>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {recentBookings.map((b: any) => (
                <div
                  key={b.id}
                  className="px-5 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-zinc-200 truncate">
                      {b.companyName}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate">{b.serviceType}</p>
                  </div>
                  <span className="text-[11px] text-zinc-500 shrink-0">
                    {b.bookingDate} ({b.timeSlot})
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      b.status.toLowerCase() === "pending"
                        ? "bg-amber-500/15 text-amber-400"
                        : b.status.toLowerCase() === "confirmed"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : b.status.toLowerCase() === "completed"
                            ? "bg-blue-500/15 text-blue-400"
                            : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              ))}
              {recentBookings.length === 0 && (
                <p className="text-zinc-600 text-[12px] text-center py-8">No bookings yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: "Manage Inventory",
              desc: "Add, edit, or restock products",
              icon: Package,
              href: "/admin/inventory",
              color: "#10b981",
            },
            {
              label: "Featured Banners",
              desc: `${stats.activeBanners ?? 4} active promotional slides`,
              icon: ImageIcon,
              href: "/admin/banners",
              color: "#06b6d4",
            },
            {
              label: "Reply to Quotes",
              desc: `${stats.pendingQuotes} pending responses`,
              icon: FileText,
              href: "/admin/quotes",
              color: "#f59e0b",
            },
            {
              label: "Confirm Bookings",
              desc: `${stats.pendingBookings} awaiting action`,
              icon: CalendarCheck,
              href: "/admin/bookings",
              color: "#8b5cf6",
            },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="flex items-center gap-3.5 bg-[#232323] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.12] hover:bg-[#262626] transition-all group"
            >
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${action.color}15` }}
              >
                <action.icon className="h-5 w-5" style={{ color: action.color }} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white group-hover:text-emerald-400 transition-colors">
                  {action.label}
                </p>
                <p className="text-[11px] text-zinc-500">{action.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
