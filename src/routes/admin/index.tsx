import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { getAdminStats, getQuotes, getBookings } from "@/lib/admin-data";
import { taka } from "@/lib/data";
import {
  Package,
  AlertTriangle,
  XCircle,
  FileText,
  CalendarCheck,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Activity,
  Image as ImageIcon,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

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
  trend,
  trendUp,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
  trend?: string;
  trendUp?: boolean;
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
        {trend && (
          <span
            className={`flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              trendUp ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
            }`}
          >
            {trendUp ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-[12px] text-zinc-500 mt-1">{label}</p>
      {sub && <p className="text-[11px] text-zinc-600 mt-0.5">{sub}</p>}
    </div>
  );
}

function AdminDashboard() {
  const stats = getAdminStats();
  const quotes = getQuotes();
  const bookings = getBookings();

  const recentQuotes = quotes.slice(0, 5);
  const recentBookings = bookings.slice(0, 5);

  return (
    <AdminLayout activeRoute="/admin">
      <div className="p-6 lg:p-8 space-y-8 max-w-[1440px]">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-[13px] text-zinc-500 mt-1">
            Overview of your store, inventory, and operations.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={Package}
            label="Total Products"
            value={stats.totalProducts}
            sub={`${stats.lowStock} low stock, ${stats.outOfStock} out`}
            trend="+4.3%"
            trendUp
            color="#10b981"
          />
          <StatCard
            icon={DollarSign}
            label="Inventory Value"
            value={taka(stats.totalValue)}
            trend="+12.5%"
            trendUp
            color="#3b82f6"
          />
          <StatCard
            icon={FileText}
            label="Pending Quotations"
            value={stats.pendingQuotes}
            sub={`${stats.totalQuotes} total requests`}
            trend="-2.1%"
            trendUp={false}
            color="#f59e0b"
          />
          <StatCard
            icon={CalendarCheck}
            label="Upcoming Bookings"
            value={stats.confirmedBookings}
            sub={`${stats.pendingBookings} awaiting confirmation`}
            trend="+8.7%"
            trendUp
            color="#8b5cf6"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Revenue Chart */}
          <div className="xl:col-span-2 bg-[#232323] border border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-[14px] font-semibold text-white">Revenue Overview</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Last 6 months</p>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 text-[12px] font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full">
                <TrendingUp className="h-3.5 w-3.5" />
                +14.2%
              </div>
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.revenueData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#71717a", fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#71717a", fontSize: 11 }}
                    tickFormatter={(v: number) => `${(v / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#232323",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "8px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                    }}
                    labelStyle={{ color: "#fff", fontSize: 12, fontWeight: 600 }}
                    itemStyle={{ color: "#10b981", fontSize: 12 }}
                    formatter={(value: number) => [taka(value), "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#revGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-[#232323] border border-white/[0.06] rounded-xl p-5">
            <h3 className="text-[14px] font-semibold text-white mb-1">Inventory by Category</h3>
            <p className="text-[11px] text-zinc-500 mb-4">Product distribution</p>
            <div className="h-[180px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={45}
                    strokeWidth={2}
                    stroke="#1c1c1c"
                  >
                    {stats.categoryDistribution.map((_, idx) => (
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
              {stats.categoryDistribution.slice(0, 4).map((cat, idx) => (
                <div key={cat.name} className="flex items-center gap-2 text-[11px]">
                  <div
                    className="h-2.5 w-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: PIE_COLORS[idx] }}
                  />
                  <span className="text-zinc-400 truncate flex-1">{cat.name}</span>
                  <span className="text-zinc-500 font-medium">{cat.value}</span>
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
              {recentQuotes.map((q) => (
                <div
                  key={q.id}
                  className="px-5 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-zinc-200 truncate">
                      {q.companyName}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate">{q.productName}</p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      q.status === "pending"
                        ? "bg-amber-500/15 text-amber-400"
                        : q.status === "replied"
                          ? "bg-blue-500/15 text-blue-400"
                          : q.status === "accepted"
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
              {recentBookings.map((b) => (
                <div
                  key={b.id}
                  className="px-5 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-zinc-200 truncate">
                      {b.companyName}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate">{b.serviceName}</p>
                  </div>
                  <span className="text-[11px] text-zinc-500 shrink-0">
                    {new Date(b.preferredDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      b.status === "pending"
                        ? "bg-amber-500/15 text-amber-400"
                        : b.status === "confirmed"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : b.status === "completed"
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
