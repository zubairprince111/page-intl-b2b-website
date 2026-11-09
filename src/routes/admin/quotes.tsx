import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuotes, useInventory, useUpdateQuote, useDeleteQuote } from "@/lib/data-client";
import { openGmailQuotationDraft } from "@/lib/quotation-email";
import { taka } from "@/lib/data";
import {
  FileText,
  Search,
  Send,
  X,
  Check,
  XCircle,
  Clock,
  MessageSquare,
  Mail,
  Phone,
  Building2,
  MapPin,
  ChevronDown,
  ChevronUp,
  Package,
  Calculator,
  Eye,
  Sparkles,
  Copy,
  MessageCircle,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Filter,
} from "lucide-react";
import { useState, useMemo } from "react";
import {
  QuotationEmailModal,
  generateQuotationEmailHtml,
  copyQuotationHtmlToClipboard,
} from "@/components/admin/QuotationEmailModal";

export const Route = createFileRoute("/admin/quotes")({
  component: AdminQuotes,
  head: () => ({
    meta: [{ title: "Quotations Management — PAGE Admin" }],
  }),
});

function formatRelativeTime(dateString: string | Date) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 5) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "Recent";
  }
}

function formatWhatsAppLink(phone: string) {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("880")) return `https://wa.me/${digits}`;
  if (digits.startsWith("01")) return `https://wa.me/88${digits}`;
  if (digits.length === 10) return `https://wa.me/880${digits}`;
  return `https://wa.me/${digits}`;
}

function AdminQuotes() {
  const { data: rawQuotes = [], isLoading: quotesLoading } = useQuotes();
  const { data: inventory = [] } = useInventory();
  const updateQuoteMutation = useUpdateQuote();
  const deleteQuoteMutation = useDeleteQuote();

  const quotes = useMemo(() => {
    return rawQuotes.map((q: any) => ({
      ...q,
      items: Array.isArray(q.itemsJson) ? q.itemsJson : undefined,
    }));
  }, [rawQuotes]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [gmailToast, setGmailToast] = useState(false);
  const [copiedQuoteId, setCopiedQuoteId] = useState<string | null>(null);
  const [previewEmailQuote, setPreviewEmailQuote] = useState<{
    quote: any;
    productName: string;
    unitPrice: number;
    qty: number;
    message: string;
  } | null>(null);

  // Active quote reply state
  const [replyState, setReplyState] = useState<{
    productSlug: string;
    productName: string;
    unitPrice: number;
    qty: number;
    message: string;
  }>({
    productSlug: "",
    productName: "",
    unitPrice: 0,
    qty: 1,
    message: "",
  });

  // KPI Calculations
  const pendingCount = quotes.filter((q: any) => q.status.toLowerCase() === "pending").length;
  const repliedCount = quotes.filter((q: any) =>
    ["replied", "quoted"].includes(q.status.toLowerCase()),
  ).length;
  const acceptedCount = quotes.filter((q: any) =>
    ["accepted", "completed"].includes(q.status.toLowerCase()),
  ).length;
  const declinedCount = quotes.filter((q: any) => q.status.toLowerCase() === "declined").length;

  const totalQuotedVolume = useMemo(() => {
    return quotes.reduce((acc: number, q: any) => {
      if (q.quotedPrice) {
        return acc + q.quotedPrice * (q.qty || 1);
      }
      return acc;
    }, 0);
  }, [quotes]);

  const filtered = useMemo(() => {
    return quotes.filter((q: any) => {
      const matchSearch =
        !search ||
        q.companyName?.toLowerCase().includes(search.toLowerCase()) ||
        q.contactName?.toLowerCase().includes(search.toLowerCase()) ||
        q.productName?.toLowerCase().includes(search.toLowerCase()) ||
        q.email?.toLowerCase().includes(search.toLowerCase()) ||
        q.phone?.toLowerCase().includes(search.toLowerCase());

      const status = q.status.toLowerCase();
      let matchStatus = true;
      if (statusFilter === "pending") matchStatus = status === "pending";
      else if (statusFilter === "replied")
        matchStatus = status === "replied" || status === "quoted";
      else if (statusFilter === "accepted")
        matchStatus = status === "accepted" || status === "completed";
      else if (statusFilter === "declined") matchStatus = status === "declined";

      return matchSearch && matchStatus;
    });
  }, [quotes, search, statusFilter]);

  function toggleExpand(q: any) {
    if (expandedId === q.id) {
      setExpandedId(null);
    } else {
      setExpandedId(q.id);
      const matchInv = inventory.find(
        (i) => i.slug === q.productSlug || i.name.toLowerCase() === q.productName.toLowerCase(),
      );
      const isMulti = (q.itemsJson || q.items) && (q.itemsJson || q.items).length > 1;
      const qItems = q.itemsJson || q.items;
      const calculatedTotal =
        isMulti && qItems
          ? qItems.reduce(
              (acc: number, it: any) =>
                acc + (it.unitPrice || matchInv?.priceBdt || 150000) * it.qty,
              0,
            )
          : q.quotedPrice || matchInv?.priceBdt || 150000;

      const unitPrice = q.quotedPrice || (isMulti ? calculatedTotal : matchInv?.priceBdt || 150000);
      const qty = isMulti ? 1 : q.qty || 1;

      setReplyState({
        productSlug: q.productSlug || matchInv?.slug || (inventory[0]?.slug ?? ""),
        productName: q.productName || matchInv?.name || (inventory[0]?.name ?? ""),
        unitPrice,
        qty,
        message:
          q.reply ||
          `Dear ${q.contactName || q.companyName}, thank you for your quotation request for ${
            isMulti ? `${qItems?.length} workshop products` : q.productName
          }. We are pleased to provide you with this official commercial quotation including certified on-site delivery, leveling, chemical anchoring, and manufacturer warranty.`,
      });
    }
  }

  function handleProductChange(slug: string) {
    const item = inventory.find((i) => i.slug === slug);
    if (item) {
      setReplyState((prev) => ({
        ...prev,
        productSlug: item.slug,
        productName: item.name,
        unitPrice: item.priceBdt,
      }));
    }
  }

  async function handleSendDetailedReply(id: string, status = "replied") {
    const q = quotes.find((item: any) => item.id === id);
    await updateQuoteMutation.mutateAsync({
      id,
      status,
      reply: replyState.message,
      quotedPrice: replyState.unitPrice,
    });

    if (q) {
      const html = generateQuotationEmailHtml({
        quote: q as any,
        productName: replyState.productName,
        unitPrice: replyState.unitPrice,
        qty: replyState.qty,
        message: replyState.message,
      });

      await copyQuotationHtmlToClipboard(html, replyState.message);
      openGmailQuotationDraft({
        quote: q,
        productName: replyState.productName,
        unitPrice: replyState.unitPrice,
        qty: replyState.qty,
        message: replyState.message,
        mode: "rich",
      });
      setGmailToast(true);
    }
  }

  async function handleCopyQuotation(q: any) {
    const prodName = q.productName || "Workshop Machinery Equipment";
    const unitPrice = q.quotedPrice || 150000;
    const qty = q.qty || 1;

    const html = generateQuotationEmailHtml({
      quote: q,
      productName: prodName,
      unitPrice,
      qty,
      message: q.reply,
    });

    await copyQuotationHtmlToClipboard(html, q.reply || "");
    setCopiedQuoteId(q.id);
    setTimeout(() => setCopiedQuoteId(null), 2500);
  }

  async function handleOpenDirectGmail(q: any) {
    const prodName = q.productName || "Workshop Machinery Equipment";
    const unitPrice = q.quotedPrice || 150000;
    const qty = q.qty || 1;

    const html = generateQuotationEmailHtml({
      quote: q,
      productName: prodName,
      unitPrice,
      qty,
      message: q.reply,
    });

    await copyQuotationHtmlToClipboard(html, q.reply || "");
    openGmailQuotationDraft({
      quote: q,
      productName: prodName,
      unitPrice,
      qty,
      message: q.reply,
      mode: "rich",
    });
    setGmailToast(true);
  }

  async function handleStatusChange(id: string, status: string) {
    await updateQuoteMutation.mutateAsync({ id, status });
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to permanently delete this quotation request?")) {
      await deleteQuoteMutation.mutateAsync(id);
    }
  }

  function statusBadge(rawStatus: string) {
    const status = (rawStatus || "pending").toLowerCase();
    const isPending = status === "pending";
    const isReplied = status === "replied" || status === "quoted";
    const isAccepted = status === "accepted" || status === "completed";

    const badgeClass = isPending
      ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
      : isReplied
        ? "bg-sky-500/15 text-sky-400 border-sky-500/30"
        : isAccepted
          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
          : "bg-red-500/15 text-red-400 border-red-500/30";

    const icon = isPending ? (
      <Clock className="h-3 w-3 animate-pulse" />
    ) : isReplied ? (
      <MessageSquare className="h-3 w-3" />
    ) : isAccepted ? (
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
    <AdminLayout activeRoute="/admin/quotes">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto">
        {/* Executive Header & Quick Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <FileText className="h-4 w-4" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight font-display">
                Commercial Quotations
              </h1>
            </div>
            <p className="text-[13px] text-zinc-400 mt-1">
              Review incoming RFQ pricing requests •{" "}
              <strong className="text-white font-medium">{quotes.length} total requests</strong> •{" "}
              <span className="text-amber-400 font-semibold">{pendingCount} pending response</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
              <ShieldCheck className="h-3.5 w-3.5" />
              Email OTP Verified System
            </span>
          </div>
        </div>

        {/* Executive KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#18181b] border border-white/[0.07] rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Total Inquiries</span>
              <FileText className="h-4 w-4 text-zinc-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">{quotes.length}</span>
              <span className="text-[11px] text-zinc-500">RFQ submissions</span>
            </div>
          </div>

          <div className="bg-[#18181b] border border-amber-500/30 rounded-xl p-4 shadow-sm bg-gradient-to-br from-amber-500/5 to-transparent">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-300">Action Required</span>
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-amber-400">{pendingCount}</span>
              <span className="text-[11px] text-amber-500/80 font-medium">pending reply</span>
            </div>
          </div>

          <div className="bg-[#18181b] border border-white/[0.07] rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-sky-400">Proposals Sent</span>
              <Send className="h-4 w-4 text-sky-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-sky-400">{repliedCount}</span>
              <span className="text-[11px] text-zinc-500">formal quotations</span>
            </div>
          </div>

          <div className="bg-[#18181b] border border-white/[0.07] rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-400">Quoted Pipeline</span>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-emerald-400">
                {taka(totalQuotedVolume)}
              </span>
              <span className="text-[10px] text-zinc-500 uppercase">active</span>
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
              placeholder="Search by workshop, phone, contact or product..."
              className="w-full bg-[#121214] border border-white/[0.08] rounded-lg pl-9 pr-8 py-2 text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
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
              { id: "all", label: "All", count: quotes.length },
              { id: "pending", label: "Pending", count: pendingCount, color: "text-amber-400" },
              { id: "replied", label: "Replied", count: repliedCount, color: "text-sky-400" },
              {
                id: "accepted",
                label: "Accepted",
                count: acceptedCount,
                color: "text-emerald-400",
              },
              { id: "declined", label: "Declined", count: declinedCount, color: "text-zinc-400" },
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

        {/* Quotations List */}
        <div className="space-y-3">
          {quotesLoading ? (
            <div className="py-20 text-center space-y-3 bg-[#18181b] rounded-2xl border border-white/[0.06]">
              <div className="h-8 w-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin mx-auto" />
              <p className="text-xs font-mono text-zinc-400">Loading quotation database...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-[#18181b] rounded-2xl border border-white/[0.06] space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-white/[0.04] flex items-center justify-center text-zinc-600 mx-auto">
                <FileText className="h-6 w-6" />
              </div>
              <p className="text-[14px] text-zinc-300 font-semibold">No quotations found</p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                {search || statusFilter !== "all"
                  ? "Try adjusting your search query or switching status filters."
                  : "New quotation requests submitted through the storefront will appear here."}
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
            filtered.map((q: any) => {
              const isExpanded = expandedId === q.id;
              const status = q.status.toLowerCase();
              const isMulti = q.items && q.items.length > 1;

              // Border accent based on status
              const borderLeftAccent =
                status === "pending"
                  ? "border-l-4 border-l-amber-500"
                  : status === "replied" || status === "quoted"
                    ? "border-l-4 border-l-sky-500"
                    : status === "accepted" || status === "completed"
                      ? "border-l-4 border-l-emerald-500"
                      : "border-l-4 border-l-zinc-600";

              return (
                <div
                  key={q.id}
                  className={`bg-[#18181b] border border-white/[0.07] ${borderLeftAccent} rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all shadow-sm`}
                >
                  {/* Top Bar / Summary Row */}
                  <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-zinc-300 shrink-0">
                        {isMulti ? (
                          <Package className="h-5 w-5 text-purple-400" />
                        ) : (
                          <FileText className="h-5 w-5 text-emerald-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                            {q.companyName}
                          </h3>
                          <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.04] px-1.5 py-0.5 rounded">
                            #{q.id.slice(0, 8).toUpperCase()}
                          </span>
                          {statusBadge(q.status)}
                          {isMulti ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-mono">
                              <Package className="h-3 w-3" />
                              {q.items.length} Products
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
                          <span className="text-zinc-300 font-medium">{q.productName}</span>
                          <span className="text-zinc-600">•</span>
                          <span className="font-mono text-zinc-400">Qty: {q.qty} units</span>
                          {q.quotedPrice ? (
                            <>
                              <span className="text-zinc-600">•</span>
                              <span className="font-mono font-bold text-emerald-400">
                                Quoted: {taka(q.quotedPrice * (q.qty || 1))}
                              </span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Quick Direct Actions Strip */}
                    <div className="flex items-center justify-between md:justify-end gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-white/[0.04] shrink-0">
                      <div className="flex items-center gap-1.5">
                        {q.phone && (
                          <>
                            <a
                              href={`tel:${q.phone}`}
                              className="h-8 w-8 rounded-lg bg-white/[0.04] hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-300 border border-white/[0.06] flex items-center justify-center transition-colors"
                              title={`Call ${q.phone}`}
                            >
                              <Phone className="h-3.5 w-3.5" />
                            </a>
                            <a
                              href={formatWhatsAppLink(q.phone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-8 w-8 rounded-lg bg-white/[0.04] hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 border border-white/[0.06] flex items-center justify-center transition-colors"
                              title="Message on WhatsApp"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                            </a>
                          </>
                        )}
                        <a
                          href={`mailto:${q.email}?subject=${encodeURIComponent(
                            `[PAGE Commercial Quotation] Ref #${q.id.toUpperCase()}`,
                          )}`}
                          className="h-8 w-8 rounded-lg bg-white/[0.04] hover:bg-sky-500/20 text-zinc-400 hover:text-sky-300 border border-white/[0.06] flex items-center justify-center transition-colors"
                          title={`Email ${q.email}`}
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </a>
                      </div>

                      <div className="text-right pl-2">
                        <span className="text-[11px] font-mono text-zinc-400 block">
                          {formatRelativeTime(q.createdAt)}
                        </span>
                        <span className="text-[10px] text-zinc-500 truncate block max-w-[120px]">
                          {q.contactName}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleExpand(q)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isExpanded
                            ? "bg-white/[0.1] text-white"
                            : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        <span>{isExpanded ? "Close" : "Configure Quote"}</span>
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Proposal Desk Drawer */}
                  {isExpanded && (
                    <div className="border-t border-white/[0.06] bg-[#141416] p-4 sm:p-6 space-y-5 animate-in slide-in-from-top-2 duration-200">
                      {/* Customer & Location Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#18181b] p-3.5 rounded-xl border border-white/[0.05]">
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider block">
                            Business Type
                          </span>
                          <span className="text-xs font-medium text-zinc-200 mt-0.5 block truncate">
                            {q.businessType || "Workshop Client"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider block">
                            Delivery Region
                          </span>
                          <span className="text-xs font-medium text-zinc-200 mt-0.5 block truncate">
                            {q.city || "Dhaka Division"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider block">
                            Direct Phone
                          </span>
                          <a
                            href={`tel:${q.phone}`}
                            className="text-xs font-mono font-medium text-emerald-400 hover:underline mt-0.5 block truncate"
                          >
                            {q.phone}
                          </a>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider block">
                            Verified Email
                          </span>
                          <a
                            href={`mailto:${q.email}`}
                            className="text-xs font-medium text-sky-400 hover:underline mt-0.5 block truncate"
                          >
                            {q.email}
                          </a>
                        </div>
                      </div>

                      {/* Customer Requirements Notes */}
                      {q.notes && (
                        <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3.5 text-xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                            Client Procurement Requirements / Notes
                          </span>
                          <p className="text-zinc-300 italic">“{q.notes}”</p>
                        </div>
                      )}

                      {/* Multi-Product Requested Line Items Table */}
                      {isMulti && q.items && q.items.length > 0 && (
                        <div className="bg-[#18181b] border border-white/[0.07] rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                              <Package className="h-4 w-4 text-purple-400" />
                              <span>Multi-Product Cart Inquiry ({q.items.length} Line Items)</span>
                            </h4>
                            <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.05] px-2 py-0.5 rounded">
                              {q.items.reduce((acc: number, it: any) => acc + it.qty, 0)} total
                              units
                            </span>
                          </div>

                          <div className="divide-y divide-white/[0.06] rounded-lg border border-white/[0.06] overflow-hidden bg-[#121214]">
                            {q.items.map((it: any, idx: number) => (
                              <div
                                key={idx}
                                className="p-3 flex items-center justify-between gap-3 text-xs"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className="h-5 w-5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-bold flex items-center justify-center font-mono shrink-0">
                                    {idx + 1}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-zinc-200 truncate">
                                      {it.productName}
                                    </p>
                                    <p className="text-[10px] text-zinc-500 font-mono">
                                      SKU: {it.productSlug}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 text-right shrink-0">
                                  <span className="font-mono font-semibold text-zinc-300 bg-white/[0.04] px-2 py-0.5 rounded">
                                    {it.qty} × {it.unitPrice ? taka(it.unitPrice) : "Price on RFQ"}
                                  </span>
                                  {it.unitPrice ? (
                                    <span className="font-mono font-bold text-emerald-400 text-xs">
                                      {taka(it.unitPrice * it.qty)}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Commercial Pricing Configurator */}
                      <div className="bg-[#18181b] border border-white/[0.08] rounded-xl p-4 sm:p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                            <Calculator className="h-4 w-4 text-emerald-400" />
                            Official Commercial Proposal Configuration
                          </h4>
                          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                            Total Quoted: {taka(replyState.unitPrice * replyState.qty)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                          {/* Select Equipment Model */}
                          <div>
                            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                              Equipment Catalog Item
                            </label>
                            <select
                              value={replyState.productSlug}
                              onChange={(e) => handleProductChange(e.target.value)}
                              className="w-full bg-[#121214] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            >
                              {inventory.map((item) => (
                                <option key={item.slug} value={item.slug}>
                                  {item.name} ({taka(item.priceBdt)})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Quoted Unit Price */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                                Unit Price (BDT)
                              </label>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setReplyState((s) => ({
                                      ...s,
                                      unitPrice: Math.round(s.unitPrice * 0.95),
                                    }))
                                  }
                                  className="text-[9px] bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white px-1.5 py-0.5 rounded cursor-pointer"
                                  title="Apply 5% Fleet Rebate"
                                >
                                  -5%
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setReplyState((s) => ({
                                      ...s,
                                      unitPrice: Math.round(s.unitPrice * 0.9),
                                    }))
                                  }
                                  className="text-[9px] bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white px-1.5 py-0.5 rounded cursor-pointer"
                                  title="Apply 10% Volume Rebate"
                                >
                                  -10%
                                </button>
                              </div>
                            </div>
                            <input
                              type="number"
                              value={replyState.unitPrice}
                              onChange={(e) =>
                                setReplyState({
                                  ...replyState,
                                  unitPrice: Number(e.target.value) || 0,
                                })
                              }
                              className="w-full bg-[#121214] border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono font-semibold text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>

                          {/* Quantity */}
                          <div>
                            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                              Units Included
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={replyState.qty}
                              onChange={(e) =>
                                setReplyState({
                                  ...replyState,
                                  qty: Math.max(1, Number(e.target.value) || 1),
                                })
                              }
                              className="w-full bg-[#121214] border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono font-semibold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                        </div>

                        {/* Official Commercial Terms & Reply Body */}
                        <div>
                          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                            Official Proposal Letter & Warranty Terms
                          </label>
                          <textarea
                            value={replyState.message}
                            onChange={(e) =>
                              setReplyState({ ...replyState, message: e.target.value })
                            }
                            rows={3}
                            placeholder="Enter payment terms, delivery lead time, and certified installation details..."
                            className="w-full bg-[#121214] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none leading-relaxed"
                          />
                        </div>
                      </div>

                      {/* Executive Action Toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSendDetailedReply(q.id, "replied")}
                            className="btn btn-primary h-9.5 px-4 text-xs font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                          >
                            <Send className="h-3.5 w-3.5" />
                            <span>Save & Launch Gmail Draft</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyQuotation(q)}
                            className="h-9.5 px-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.08] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            {copiedQuoteId === q.id ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied Template!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5 text-zinc-400" />
                                <span>Copy HTML Invoice</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setPreviewEmailQuote({
                                quote: q,
                                productName: replyState.productName,
                                unitPrice: replyState.unitPrice,
                                qty: replyState.qty,
                                message: replyState.message,
                              })
                            }
                            className="h-9.5 px-3.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Preview Invoice</span>
                          </button>
                        </div>

                        {/* Status Switchers & Delete */}
                        <div className="flex items-center gap-2">
                          {status !== "accepted" && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(q.id, "accepted")}
                              className="h-9 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Mark proposal as Accepted by Client"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Accept</span>
                            </button>
                          )}
                          {status !== "declined" && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(q.id, "declined")}
                              className="h-9 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Mark proposal as Declined"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              <span>Decline</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(q.id)}
                            className="h-9 w-9 rounded-lg bg-white/[0.04] hover:bg-red-500/20 text-zinc-500 hover:text-red-400 border border-white/[0.06] flex items-center justify-center transition-colors cursor-pointer"
                            title="Delete quotation"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Logged Official Response */}
                      {q.reply && (
                        <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3.5 text-xs space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-emerald-400 font-semibold">
                            <span>Logged Official Commercial Offer:</span>
                            {q.quotedPrice ? (
                              <span className="font-mono">
                                Total: {taka(q.quotedPrice * (q.qty || 1))}
                              </span>
                            ) : null}
                          </div>
                          <p className="text-zinc-300 leading-relaxed font-sans">{q.reply}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Branded Commercial HTML Email Template Preview Modal */}
      {previewEmailQuote && (
        <QuotationEmailModal
          quote={previewEmailQuote.quote}
          productName={previewEmailQuote.productName}
          unitPrice={previewEmailQuote.unitPrice}
          qty={previewEmailQuote.qty}
          message={previewEmailQuote.message}
          onClose={() => setPreviewEmailQuote(null)}
          onSent={() => setPreviewEmailQuote(null)}
        />
      )}

      {/* Gmail Rich Paste Floating Helper Toast */}
      {gmailToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-2xl bg-zinc-900 border border-emerald-500/40 text-white shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex-1 pr-2">
              <h4 className="text-xs font-bold text-white mb-0.5">
                Quotation Template Ready in Gmail!
              </h4>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Gmail compose opened with recipient prefilled. Simply press{" "}
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                  Ctrl + V
                </kbd>{" "}
                to paste your branded quotation layout.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setGmailToast(false)}
              className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
