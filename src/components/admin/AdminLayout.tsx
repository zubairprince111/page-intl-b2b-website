import { useState, useEffect, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  CalendarCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ExternalLink,
  Image as ImageIcon,
  FolderOpen,
  Newspaper,
} from "lucide-react";
import { useCurrentUser, useLogout } from "@/lib/auth-client";
import { useAdminStats } from "@/lib/data-client";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { to: "/admin/inventory", icon: Package, label: "Inventory" },
  { to: "/admin/banners", icon: ImageIcon, label: "Banners" },
  { to: "/admin/media", icon: FolderOpen, label: "Media Library" },
  { to: "/admin/updates", icon: Newspaper, label: "Field Updates" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/quotes", icon: FileText, label: "Quotations", badgeKey: "quotes" as const },
  { to: "/admin/bookings", icon: CalendarCheck, label: "Bookings", badgeKey: "bookings" as const },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

export function AdminLayout({
  children,
  activeRoute,
}: {
  children: ReactNode;
  activeRoute: string;
}) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: user, isLoading } = useCurrentUser();
  const logoutMutation = useLogout();
  const { data: stats } = useAdminStats();

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== "admin") {
        navigate({ to: "/admin/login" });
      }
    }
  }, [user, isLoading, navigate]);

  async function handleSignOut() {
    await logoutMutation.mutateAsync();
    navigate({ to: "/admin/login" });
  }

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#121212] text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
          <p className="text-xs font-mono">Verifying administrative privileges...</p>
        </div>
      </div>
    );
  }

  const notifCount = (stats?.pendingQuotes ?? 0) + (stats?.pendingBookings ?? 0);
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#121212] text-zinc-200 font-[Inter,system-ui,sans-serif]">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static top-0 bottom-0 left-0 z-50
          flex flex-col bg-[#171717] border-r border-white/[0.06]
          transition-all duration-200 ease-in-out shrink-0
          ${collapsed ? "w-16" : "w-60"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand Header */}
        <div className="h-14 border-b border-white/[0.06] flex items-center justify-between px-3.5 shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-black text-xs">
                P
              </div>
              <div>
                <span className="font-bold text-xs tracking-wider uppercase text-white font-display">
                  PAGE Admin
                </span>
                <span className="block text-[9px] font-mono text-zinc-500 uppercase">Console</span>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-black text-xs mx-auto">
              P
            </div>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:grid h-6 w-6 place-items-center rounded-md hover:bg-white/[0.06] text-zinc-400 hover:text-zinc-200 transition-colors"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <ChevronLeft className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden grid h-6 w-6 place-items-center rounded-md hover:bg-white/[0.06] text-zinc-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact ? activeRoute === item.to : activeRoute.startsWith(item.to);
            const pendingCount =
              item.badgeKey === "quotes"
                ? (stats?.pendingQuotes ?? 0)
                : item.badgeKey === "bookings"
                  ? (stats?.pendingBookings ?? 0)
                  : 0;

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`
                  group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all
                  ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-400 font-semibold shadow-xs"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                  }
                  ${collapsed ? "justify-center px-0" : ""}
                `}
                title={
                  collapsed
                    ? `${item.label}${pendingCount > 0 ? ` (${pendingCount} pending)` : ""}`
                    : undefined
                }
              >
                <div className="relative shrink-0 flex items-center justify-center">
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? "text-emerald-400" : "text-zinc-400 group-hover:text-zinc-200"
                    }`}
                  />
                  {collapsed && pendingCount > 0 && (
                    <span
                      className={`absolute -top-1 -right-1 h-2 w-2 rounded-full ${
                        item.badgeKey === "quotes"
                          ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]"
                          : "bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.9)]"
                      } animate-pulse`}
                    />
                  )}
                </div>

                {!collapsed && (
                  <>
                    <span className="truncate">{item.label}</span>
                    {pendingCount > 0 && (
                      <span
                        className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold font-mono transition-all ${
                          item.badgeKey === "quotes"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 group-hover:bg-amber-500/30"
                            : "bg-violet-500/20 text-violet-300 border border-violet-500/30 group-hover:bg-violet-500/30"
                        }`}
                      >
                        {pendingCount}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-white/[0.06] p-2.5 shrink-0 space-y-1">
          <Link
            to="/"
            target="_blank"
            className={`
              flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors
              ${collapsed ? "justify-center px-0" : ""}
            `}
            title="Open Storefront in new tab"
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
            {!collapsed && <span>Storefront</span>}
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className={`
              w-full flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium text-red-400/90 hover:text-red-300 hover:bg-red-500/10 transition-colors
              ${collapsed ? "justify-center px-0" : ""}
            `}
            title="Sign Out of Admin Console"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0 text-red-400" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 border-b border-white/[0.06] bg-[#171717]/80 backdrop-blur-xl flex items-center gap-3 px-4 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden grid h-8 w-8 place-items-center rounded-md hover:bg-white/[0.06] text-zinc-400"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg pl-9 pr-3 py-[7px] text-[13px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Notifications */}
            <button className="relative grid h-8 w-8 place-items-center rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-zinc-200 transition-colors">
              <Bell className="h-4 w-4" />
              {notifCount > 0 && (
                <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
                  {notifCount}
                </span>
              )}
            </button>

            {/* User avatar & popover */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-white/[0.06]">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[12px] font-medium text-zinc-200 leading-tight">{user.name}</p>
                <p className="text-[10px] text-zinc-500 leading-tight capitalize">
                  {user.role.replace(/_/g, " ")}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#1c1c1c]">{children}</main>
      </div>
    </div>
  );
}
