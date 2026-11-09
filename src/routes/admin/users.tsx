import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useAdminUsers,
  useUpdateUserRole,
  useDeleteUser,
  useQuotes,
  useBookings,
} from "@/lib/data-client";
import {
  Users,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Save,
  Shield,
  Eye,
  UserCog,
  Briefcase,
  UserCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  ExternalLink,
  FileText,
  CalendarCheck,
} from "lucide-react";
import { useState, useMemo } from "react";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive?: boolean;
  status?: string;
  lastLogin?: Date | string | null;
  createdAt?: Date | string;
};

type ClientUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  companyName?: string | null;
  businessType?: string | null;
  city?: string | null;
  role: string;
  emailVerified?: boolean;
  isActive?: boolean;
  status?: string;
  lastLogin?: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
  head: () => ({
    meta: [{ title: "User & Client Management — PAGE Admin" }],
  }),
});

function AdminUsers() {
  const [activeTab, setActiveTab] = useState<"clients" | "staff">("clients");

  // Live database state
  const { data: allUsers = [], isLoading } = useAdminUsers();
  const { data: quotes = [] } = useQuotes();
  const { data: bookings = [] } = useBookings();
  const updateUserRoleMutation = useUpdateUserRole();
  const deleteUserMutation = useDeleteUser();

  const clientUsers = useMemo(() => {
    return allUsers.filter((u: any) => u.role === "customer");
  }, [allUsers]);

  const staffUsers = useMemo(() => {
    return allUsers.filter((u: any) => u.role !== "customer");
  }, [allUsers]);

  // Staff users state
  const [staffSearch, setStaffSearch] = useState("");
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [editStaffId, setEditStaffId] = useState<string | null>(null);
  const [staffFormData, setStaffFormData] = useState({
    name: "",
    email: "",
    role: "viewer" as any,
    status: "active" as any,
  });

  // Client users state
  const [clientSearch, setClientSearch] = useState("");
  const [clientTypeFilter, setClientTypeFilter] = useState("All");
  const [selectedClient, setSelectedClient] = useState<any | null>(null);

  // Filtered Client Users
  const filteredClients = useMemo(() => {
    return clientUsers.filter((c: any) => {
      const matchesSearch =
        !clientSearch ||
        c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.companyName.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.phone.includes(clientSearch) ||
        c.city.toLowerCase().includes(clientSearch.toLowerCase());

      const matchesType = clientTypeFilter === "All" || c.businessType === clientTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [clientUsers, clientSearch, clientTypeFilter]);

  // Filtered Staff Users
  const filteredStaff = useMemo(() => {
    return staffUsers.filter(
      (u: any) =>
        !staffSearch ||
        u.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(staffSearch.toLowerCase()),
    );
  }, [staffUsers, staffSearch]);

  function handleAddStaff() {
    alert(
      "New staff accounts can register via /login with corporate email and be assigned administrative roles here.",
    );
    setShowAddStaff(false);
  }

  function startEditStaff(user: any) {
    setEditStaffId(user.id);
    setStaffFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.isActive ? "active" : "suspended",
    });
  }

  async function handleUpdateStaff() {
    if (!editStaffId) return;
    await updateUserRoleMutation.mutateAsync({
      id: editStaffId,
      role: staffFormData.role,
      isActive: staffFormData.status === "active",
    });
    setEditStaffId(null);
  }

  async function handleDeleteStaff(id: string) {
    if (!confirm("Delete this staff user?")) return;
    try {
      await deleteUserMutation.mutateAsync(id);
    } catch (err: any) {
      alert(err?.message || "Could not delete user.");
    }
  }

  async function handleDeleteClient(id: string) {
    if (!confirm("Delete this registered customer account?")) return;
    try {
      await deleteUserMutation.mutateAsync(id);
      if (selectedClient?.id === id) setSelectedClient(null);
    } catch (err: any) {
      alert(err?.message || "Could not delete customer account.");
    }
  }

  function roleIcon(role: AdminUser["role"]) {
    switch (role) {
      case "admin":
        return <Shield className="h-3 w-3" />;
      case "product_manager":
        return <Briefcase className="h-3 w-3" />;
      case "staff":
        return <UserCheck className="h-3 w-3" />;
      default:
        return <Eye className="h-3 w-3" />;
    }
  }

  function roleColor(role: AdminUser["role"]) {
    switch (role) {
      case "admin":
        return "bg-red-500/15 text-red-400";
      case "product_manager":
        return "bg-purple-500/15 text-purple-400";
      case "staff":
        return "bg-blue-500/15 text-blue-400";
      default:
        return "bg-zinc-500/15 text-zinc-400";
    }
  }

  function roleLabel(role: AdminUser["role"]) {
    switch (role) {
      case "admin":
        return "Admin";
      case "product_manager":
        return "Product Manager";
      case "staff":
        return "Staff";
      default:
        return "Viewer";
    }
  }

  // Count user's related inquiries
  function getClientActivity(client: ClientUser) {
    const userQuotes = quotes.filter(
      (q) =>
        (client.email && q.email.toLowerCase() === client.email.toLowerCase()) ||
        (client.companyName && q.companyName.toLowerCase() === client.companyName.toLowerCase()),
    );
    const userBookings = bookings.filter(
      (b) =>
        (client.email && b.email.toLowerCase() === client.email.toLowerCase()) ||
        (client.companyName && b.companyName.toLowerCase() === client.companyName.toLowerCase()),
    );
    return {
      quoteCount: userQuotes.length,
      bookingCount: userBookings.length,
      quotes: userQuotes,
      bookings: userBookings,
    };
  }

  return (
    <AdminLayout activeRoute="/admin/users">
      <div className="p-6 lg:p-8 space-y-6 max-w-[1250px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Users & Client Accounts
            </h1>
            <p className="text-[13px] text-zinc-400 mt-1">
              View registered B2B workshop customers, inquiries, and manage internal admin team
              members.
            </p>
          </div>

          {activeTab === "staff" && (
            <button
              onClick={() => {
                setShowAddStaff(true);
                setEditStaffId(null);
                setStaffFormData({ name: "", email: "", role: "viewer", status: "active" });
              }}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors shrink-0"
            >
              <Plus className="h-4 w-4" />
              Add Staff Member
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/[0.08] gap-6">
          <button
            type="button"
            onClick={() => setActiveTab("clients")}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === "clients"
                ? "text-emerald-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-400"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Registered Customers ({clientUsers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("staff")}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === "staff"
                ? "text-emerald-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-400"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Admin & Staff Team ({staffUsers.length})
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: REGISTERED CLIENT USERS                          */}
        {/* ======================================================== */}
        {activeTab === "clients" && (
          <div className="space-y-5">
            {/* Summary KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#232323] border border-white/[0.06] rounded-xl p-4">
                <p className="text-xs text-zinc-400">Total Registered Clients</p>
                <p className="text-2xl font-bold text-white mt-1">{clientUsers.length}</p>
              </div>
              <div className="bg-[#232323] border border-white/[0.06] rounded-xl p-4">
                <p className="text-xs text-zinc-400">Active Workshops</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  {
                    clientUsers.filter(
                      (c) =>
                        c.businessType.includes("Workshop") || c.businessType.includes("Garage"),
                    ).length
                  }
                </p>
              </div>
              <div className="bg-[#232323] border border-white/[0.06] rounded-xl p-4">
                <p className="text-xs text-zinc-400">Total RFQ Inquiries</p>
                <p className="text-2xl font-bold text-amber-400 mt-1">{quotes.length}</p>
              </div>
              <div className="bg-[#232323] border border-white/[0.06] rounded-xl p-4">
                <p className="text-xs text-zinc-400">Booked Consultations</p>
                <p className="text-2xl font-bold text-sky-400 mt-1">{bookings.length}</p>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Search by name, company, email, phone, city..."
                  className="w-full bg-[#232323] border border-white/[0.06] rounded-lg pl-9 pr-3 py-2 text-[13px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 shrink-0">Sector:</span>
                <select
                  value={clientTypeFilter}
                  onChange={(e) => setClientTypeFilter(e.target.value)}
                  className="bg-[#232323] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                >
                  <option value="All">All Business Types</option>
                  <option value="Workshop / Garage">Workshop / Garage</option>
                  <option value="Tyre Service Center">Tyre Service Center</option>
                  <option value="Fleet Operator">Fleet Operator</option>
                  <option value="Multi-Brand Workshop">Multi-Brand Workshop</option>
                </select>
              </div>
            </div>

            {/* Clients Table */}
            <div className="bg-[#232323] border border-white/[0.06] rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      <th className="px-5 py-3">Client & Company</th>
                      <th className="px-4 py-3">Contact Info</th>
                      <th className="px-4 py-3">Business Type</th>
                      <th className="px-4 py-3">City / Hub</th>
                      <th className="px-4 py-3">Activity</th>
                      <th className="px-4 py-3">Registered</th>
                      <th className="text-center px-4 py-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-xs">
                    {filteredClients.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-8 text-center text-zinc-500">
                          No registered customer accounts match your search.
                        </td>
                      </tr>
                    ) : (
                      filteredClients.map((client) => {
                        const act = getClientActivity(client);
                        return (
                          <tr key={client.id} className="hover:bg-white/[0.02] transition-colors">
                            {/* Client & Company */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                                  {client.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-white truncate">{client.name}</p>
                                  <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5 truncate">
                                    <Building2 className="h-3 w-3 text-zinc-500 shrink-0" />
                                    <span>{client.companyName}</span>
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Contact Info */}
                            <td className="px-4 py-3.5">
                              <p className="text-zinc-200 font-mono text-[11px]">
                                <a
                                  href={`tel:${client.phone}`}
                                  className="hover:text-emerald-400 transition-colors"
                                >
                                  {client.phone}
                                </a>
                              </p>
                              <p className="text-zinc-400 text-[11px] truncate max-w-xs mt-0.5">
                                <a
                                  href={`mailto:${client.email}`}
                                  className="hover:text-emerald-400 transition-colors"
                                >
                                  {client.email}
                                </a>
                              </p>
                            </td>

                            {/* Business Type */}
                            <td className="px-4 py-3.5">
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
                                {client.businessType}
                              </span>
                            </td>

                            {/* City */}
                            <td className="px-4 py-3.5 text-zinc-400">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-zinc-500 shrink-0" />
                                <span>{client.city}</span>
                              </span>
                            </td>

                            {/* Activity */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                    act.quoteCount > 0
                                      ? "bg-amber-500/15 text-amber-400"
                                      : "bg-zinc-800 text-zinc-500"
                                  }`}
                                  title={`${act.quoteCount} Quotes`}
                                >
                                  {act.quoteCount} RFQ
                                </span>
                                <span
                                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                    act.bookingCount > 0
                                      ? "bg-sky-500/15 text-sky-400"
                                      : "bg-zinc-800 text-zinc-500"
                                  }`}
                                  title={`${act.bookingCount} Bookings`}
                                >
                                  {act.bookingCount} Demo
                                </span>
                              </div>
                            </td>

                            {/* Registered Date */}
                            <td className="px-4 py-3.5 text-zinc-500 font-mono text-[11px]">
                              {client.createdAt
                                ? new Date(client.createdAt).toISOString().slice(0, 10)
                                : "Recent"}
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3.5 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setSelectedClient(client)}
                                  className="p-1.5 rounded hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
                                  title="View full customer details & history"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteClient(client.id)}
                                  className="p-1.5 rounded hover:bg-red-500/15 text-zinc-400 hover:text-red-400 transition-colors"
                                  title="Delete customer account"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: INTERNAL ADMIN & STAFF USERS                     */}
        {/* ======================================================== */}
        {activeTab === "staff" && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                placeholder="Search staff members..."
                className="w-full bg-[#232323] border border-white/[0.06] rounded-lg pl-9 pr-3 py-2 text-[13px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>

            {/* Add / Edit Staff Modal Box */}
            {(showAddStaff || editStaffId) && (
              <div className="bg-[#232323] border border-white/[0.06] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[14px] font-semibold text-white">
                    {editStaffId ? "Edit Staff User" : "Add New Staff Member"}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddStaff(false);
                      setEditStaffId(null);
                    }}
                    className="h-7 w-7 rounded-md hover:bg-white/[0.06] text-zinc-400 flex items-center justify-center"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-500 font-medium block mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={staffFormData.name}
                      onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                      placeholder="e.g. Tanvir Ahmed"
                      className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-500 font-medium block mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={staffFormData.email}
                      onChange={(e) =>
                        setStaffFormData({ ...staffFormData, email: e.target.value })
                      }
                      placeholder="e.g. tanvir@company.com"
                      className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-500 font-medium block mb-1.5">
                      Role
                    </label>
                    <select
                      value={staffFormData.role}
                      onChange={(e) =>
                        setStaffFormData({
                          ...staffFormData,
                          role: e.target.value as AdminUser["role"],
                        })
                      }
                      className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-[13px] text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                    >
                      <option value="admin">Admin</option>
                      <option value="product_manager">Product Manager</option>
                      <option value="staff">Staff</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-500 font-medium block mb-1.5">
                      Status
                    </label>
                    <select
                      value={staffFormData.status}
                      onChange={(e) =>
                        setStaffFormData({
                          ...staffFormData,
                          status: e.target.value as AdminUser["status"],
                        })
                      }
                      className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-[13px] text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowAddStaff(false);
                      setEditStaffId(null);
                    }}
                    className="px-4 py-2 text-[13px] text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-white/[0.04] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editStaffId ? handleUpdateStaff : handleAddStaff}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {editStaffId ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            )}

            {/* Staff Table */}
            <div className="bg-[#232323] border border-white/[0.06] rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      <th className="px-5 py-3">Staff Member</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3">Last Login</th>
                      <th className="text-center px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-xs">
                    {filteredStaff.map((user) => (
                      <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                              {user.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{user.name}</p>
                              <p className="text-[11px] text-zinc-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${roleColor(
                              user.role,
                            )}`}
                          >
                            {roleIcon(user.role)}
                            {roleLabel(user.role)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              user.isActive !== false
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                user.isActive !== false ? "bg-emerald-400" : "bg-red-400"
                              }`}
                            />
                            {user.isActive !== false ? "Active" : "Suspended"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-500 font-mono text-[11px]">
                          {user.createdAt
                            ? new Date(user.createdAt).toISOString().slice(0, 10)
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-zinc-400 font-mono text-[11px]">
                          {user.lastLogin
                            ? new Date(user.lastLogin).toISOString().slice(0, 10)
                            : "Never"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => startEditStaff(user)}
                              className="p-1.5 rounded hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
                              title="Edit user"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStaff(user.id)}
                              className="p-1.5 rounded hover:bg-red-500/15 text-zinc-400 hover:text-red-400 transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CLIENT DETAILS INSPECTOR MODAL                          */}
        {/* ======================================================== */}
        {selectedClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#1f1f1f] border border-white/[0.1] rounded-2xl w-full max-w-lg p-6 shadow-2xl text-zinc-200 space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {selectedClient.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedClient.name}</h3>
                    <p className="text-xs text-emerald-400 font-medium">
                      {selectedClient.companyName}
                    </p>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      ID: {selectedClient.id}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedClient(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Profile details */}
              <div className="space-y-3 text-xs bg-black/20 p-4 rounded-xl border border-white/[0.06]">
                <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-zinc-500" />
                    Phone / WhatsApp:
                  </span>
                  <a
                    href={`tel:${selectedClient.phone}`}
                    className="font-mono text-emerald-400 hover:underline"
                  >
                    {selectedClient.phone}
                  </a>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-zinc-500" />
                    Email:
                  </span>
                  <a
                    href={`mailto:${selectedClient.email}`}
                    className="font-mono text-emerald-400 hover:underline"
                  >
                    {selectedClient.email}
                  </a>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-zinc-500" />
                    Business Sector:
                  </span>
                  <span className="font-semibold text-white">{selectedClient.businessType}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                    City / Facility Region:
                  </span>
                  <span className="text-white">{selectedClient.city}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                    Account Registered:
                  </span>
                  <span className="font-mono text-zinc-400">
                    {selectedClient.createdAt ? selectedClient.createdAt.slice(0, 10) : "N/A"}
                  </span>
                </div>
              </div>

              {/* Inquiries associated with this customer */}
              {(() => {
                const act = getClientActivity(selectedClient);
                return (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Inquiries & Activity ({act.quoteCount + act.bookingCount})
                    </h4>

                    {act.quoteCount === 0 && act.bookingCount === 0 ? (
                      <p className="text-xs text-zinc-500 p-3 bg-black/20 rounded-lg text-center">
                        No quotes or consultation bookings requested yet.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {act.quotes.map((q) => (
                          <div
                            key={q.id}
                            className="p-2.5 rounded-lg bg-black/30 border border-white/[0.06] text-xs flex items-center justify-between"
                          >
                            <div>
                              <span className="font-semibold text-white block">
                                {q.productName}
                              </span>
                              <span className="text-[11px] text-zinc-400 block font-mono">
                                Qty: {q.qty} · RFQ #{q.id}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-400">
                              {q.status}
                            </span>
                          </div>
                        ))}
                        {act.bookings.map((b) => (
                          <div
                            key={b.id}
                            className="p-2.5 rounded-lg bg-black/30 border border-white/[0.06] text-xs flex items-center justify-between"
                          >
                            <div>
                              <span className="font-semibold text-white block">
                                {b.serviceType || "Equipment Demonstration"}
                              </span>
                              <span className="text-[11px] text-zinc-400 block font-mono">
                                {b.bookingDate || "Flexible"} ·{" "}
                                {b.centerName || b.city || "Dhaka Hub"}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/15 text-sky-400">
                              {b.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedClient(null)}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
