import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  CalendarCheck,
  ShoppingBag,
  Lock,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useCurrentUser, useLogout, useChangePassword } from "@/lib/auth-client";
import { getUserDashboardDataServerFn } from "@/lib/user-functions";
import { taka } from "@/lib/data";

export const Route = createFileRoute("/account")({
  component: AccountPage,
  head: () => ({
    meta: [{ title: "My Workshop Account — PAGE International" }],
  }),
});

function AccountPage() {
  const navigate = useNavigate();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const logoutMutation = useLogout();
  const changePasswordMutation = useChangePassword();

  const [activeTab, setActiveTab] = useState<
    "overview" | "quotes" | "orders" | "bookings" | "security"
  >("overview");

  // Change Password Form State
  const [currPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, userLoading, navigate]);

  const { data: dashboardData, isLoading: dataLoading } = useQuery({
    queryKey: ["userDashboardData", user?.id],
    queryFn: async () => {
      return await getUserDashboardDataServerFn();
    },
    enabled: !!user,
  });

  async function handleLogout() {
    await logoutMutation.mutateAsync();
    navigate({ to: "/login" });
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwSuccess(null);
    setPwError(null);

    if (newPassword.length < 10) {
      setPwError("New password must be at least 10 characters long.");
      return;
    }

    try {
      const res = await changePasswordMutation.mutateAsync({
        currentPassword: currPassword,
        newPassword,
      });

      if (res.success) {
        setPwSuccess(res.message || "Password updated successfully.");
        setCurrPassword("");
        setNewPassword("");
      } else {
        setPwError(res.error || "Password change failed.");
      }
    } catch (err: any) {
      setPwError(err?.message || "Failed to change password.");
    }
  }

  if (userLoading || !user) {
    return (
      <div className="min-h-screen bg-zinc-50 pt-28 pb-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
          <p className="text-xs font-mono text-zinc-500">Loading workshop dashboard...</p>
        </div>
      </div>
    );
  }

  const quotesList = dashboardData?.quotes || [];
  const bookingsList = dashboardData?.bookings || [];
  const ordersList = dashboardData?.orders || [];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pt-24 lg:pt-28 pb-20">
      <div className="container-page max-w-6xl">
        {/* Top Account Header Card */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-red-600/10 text-red-600 border border-red-600/20 flex items-center justify-center text-xl font-bold font-display shrink-0">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black font-display uppercase tracking-tight text-zinc-950">
                  {user.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Verified B2B Client
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-500 mt-0.5 font-medium flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                <span>{user.companyName}</span>
                <span>•</span>
                <span>{user.businessType}</span>
                <span>•</span>
                <span>{user.city}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user.role === "admin" && (
              <Link
                to="/admin"
                className="px-4 py-2 rounded-xl bg-zinc-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 transition-colors inline-flex items-center gap-1.5"
              >
                <span>Admin Console</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-zinc-200 gap-2 mb-8 pb-px scrollbar-none">
          {[
            { id: "overview", label: "Overview", icon: Building2 },
            { id: "quotes", label: `My Quotations (${quotesList.length})`, icon: FileText },
            { id: "orders", label: `My Orders (${ordersList.length})`, icon: ShoppingBag },
            { id: "bookings", label: `Bay Bookings (${bookingsList.length})`, icon: CalendarCheck },
            { id: "security", label: "Security & Password", icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isCurrent
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">
                  Active Quotes
                </span>
                <span className="text-2xl font-black font-display text-zinc-900">
                  {quotesList.length}
                </span>
              </div>
              <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">
                  Orders Placed
                </span>
                <span className="text-2xl font-black font-display text-zinc-900">
                  {ordersList.length}
                </span>
              </div>
              <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">
                  Consultation Bookings
                </span>
                <span className="text-2xl font-black font-display text-zinc-900">
                  {bookingsList.length}
                </span>
              </div>
            </div>

            {/* Profile Information Card */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-7 shadow-xs">
              <h2 className="text-sm font-black font-display uppercase tracking-wider text-zinc-950 mb-4">
                Workshop Profile Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                    Managing Engineer / Proprietor
                  </span>
                  <p className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-zinc-400" />
                    <span>{user.name}</span>
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                    Email Address
                  </span>
                  <p className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-zinc-400" />
                    <span>{user.email}</span>
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                    Direct Contact Phone
                  </span>
                  <p className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-zinc-400" />
                    <span>{user.phone}</span>
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                    Business Entity
                  </span>
                  <p className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-zinc-400" />
                    <span>{user.companyName}</span>
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                    Operating City
                  </span>
                  <p className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-zinc-400" />
                    <span>{user.city}</span>
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                    Member Since
                  </span>
                  <p className="text-sm font-semibold text-zinc-900">
                    {new Date(user.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: My Quotations */}
        {activeTab === "quotes" && (
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
              <h2 className="text-sm font-black font-display uppercase tracking-wider text-zinc-950">
                Official Quotation Requests (RFQs)
              </h2>
              <Link
                to="/shop"
                className="text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-700"
              >
                + Request New Quote
              </Link>
            </div>
            {quotesList.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="h-10 w-10 text-zinc-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-zinc-500">No quotation requests found.</p>
                <Link
                  to="/shop"
                  className="mt-3 inline-block px-4 py-2 rounded-xl bg-zinc-900 text-white font-bold text-xs uppercase tracking-wider"
                >
                  Browse Machinery Catalog
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-zinc-200">
                {quotesList.map((q) => (
                  <div
                    key={q.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-zinc-500">
                          {q.quoteNumber || q.id}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            q.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800"
                              : q.status === "CONTACTED"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {q.status}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-sm text-zinc-900 mt-1">
                        {q.productName}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Quantity: {q.qty} units • Submitted on{" "}
                        {new Date(q.createdAt).toLocaleDateString("en-GB")}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <Link
                        to="/shop/$slug"
                        params={{ slug: q.productSlug }}
                        className="text-xs font-bold uppercase tracking-wider text-zinc-900 hover:text-red-600 inline-flex items-center gap-1"
                      >
                        <span>View Machinery</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: My Orders */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-zinc-200">
              <h2 className="text-sm font-black font-display uppercase tracking-wider text-zinc-950">
                Workshop Machinery & Parts Orders
              </h2>
            </div>
            {ordersList.length === 0 ? (
              <div className="py-12 text-center">
                <ShoppingBag className="h-10 w-10 text-zinc-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-zinc-500">No orders placed yet.</p>
                <Link
                  to="/shop"
                  className="mt-3 inline-block px-4 py-2 rounded-xl bg-zinc-900 text-white font-bold text-xs uppercase tracking-wider"
                >
                  Explore Storefront
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-zinc-200">
                {ordersList.map((ord) => (
                  <div key={ord.id} className="p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-zinc-900">
                          {ord.orderNumber}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            ord.status === "DELIVERED"
                              ? "bg-emerald-100 text-emerald-800"
                              : ord.status === "CONFIRMED"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>
                      <span className="text-sm font-black font-display text-zinc-900">
                        Total: {taka(ord.total)}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-600 bg-zinc-50 rounded-xl p-3 border border-zinc-200/80">
                      {ord.items && ord.items.length > 0 ? (
                        <div className="space-y-1">
                          {ord.items.map((it) => (
                            <div key={it.id} className="flex justify-between">
                              <span>
                                {it.productName} × {it.quantity}
                              </span>
                              <span className="font-mono">{taka(it.subtotal)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>1 × Heavy Machinery Order</p>
                      )}
                    </div>

                    <div className="text-[11px] text-zinc-500 flex flex-wrap gap-4">
                      <span>
                        Shipping Address: {ord.shippingAddress}, {ord.city}
                      </span>
                      <span>
                        Payment: {ord.paymentMethod.replace(/_/g, " ")} ({ord.paymentStatus})
                      </span>
                      <span>Date: {new Date(ord.createdAt).toLocaleDateString("en-GB")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Bay Bookings */}
        {activeTab === "bookings" && (
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
              <h2 className="text-sm font-black font-display uppercase tracking-wider text-zinc-950">
                Workshop Engineering Consultations
              </h2>
              <Link
                to="/services/book"
                className="text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-700"
              >
                + Book New Bay Session
              </Link>
            </div>
            {bookingsList.length === 0 ? (
              <div className="py-12 text-center">
                <CalendarCheck className="h-10 w-10 text-zinc-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-zinc-500">
                  No consultation bookings registered.
                </p>
                <Link
                  to="/services/book"
                  className="mt-3 inline-block px-4 py-2 rounded-xl bg-zinc-900 text-white font-bold text-xs uppercase tracking-wider"
                >
                  Book Bay Planning
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-zinc-200">
                {bookingsList.map((b) => (
                  <div
                    key={b.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-zinc-500">
                          {b.bookingNumber || b.id}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            b.status === "CONFIRMED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-sm text-zinc-900 mt-1">
                        {b.serviceType}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Date: {b.bookingDate} • Time: {b.timeSlot} • City: {b.city || "Dhaka"}
                      </p>
                    </div>

                    {b.notes && (
                      <p className="text-xs text-zinc-600 max-w-xs italic">"{b.notes}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Security & Password */}
        {activeTab === "security" && (
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-7 shadow-xs max-w-xl">
            <h2 className="text-sm font-black font-display uppercase tracking-wider text-zinc-950 mb-1">
              Account Security & Password
            </h2>
            <p className="text-xs text-zinc-500 mb-5">
              Update your password regularly to secure access to workshop orders and quotations.
            </p>

            {pwSuccess && (
              <div className="mb-4 flex items-start gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-3 text-xs">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{pwSuccess}</span>
              </div>
            )}

            {pwError && (
              <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{pwError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 block mb-1">
                  Current Password *
                </label>
                <input
                  type="password"
                  required
                  value={currPassword}
                  onChange={(e) => setCurrPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 block mb-1">
                  New Password (Min. 10 chars, letters & numbers) *
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
              >
                {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
