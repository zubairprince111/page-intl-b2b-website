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
  DollarSign,
  Calculator,
  Eye,
  Sparkles,
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
    meta: [{ title: "Quotations — PAGE Admin" }],
  }),
});

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

  const filtered = quotes.filter((q: any) => {
    const matchSearch =
      !search ||
      q.companyName.toLowerCase().includes(search.toLowerCase()) ||
      q.contactName.toLowerCase().includes(search.toLowerCase()) ||
      q.productName.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" || q.status.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

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
          `Dear ${q.contactName || q.companyName}, thank you for your quotation request for ${isMulti ? `${qItems?.length} workshop products` : q.productName}. We are pleased to provide you with this official commercial quotation including certified installation, delivery, and warranty support.`,
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
      // 1. Copy formatted HTML email template to clipboard
      const html = generateQuotationEmailHtml({
        quote: q as any,
        productName: replyState.productName,
        unitPrice: replyState.unitPrice,
        qty: replyState.qty,
        message: replyState.message,
      });
      await copyQuotationHtmlToClipboard(html, replyState.message);
      setGmailToast(true);

      // 2. Open Gmail compose with clean body so user can paste the rich layout
      openGmailQuotationDraft({
        quote: q as any,
        productName: replyState.productName,
        unitPrice: replyState.unitPrice,
        qty: replyState.qty,
        message: replyState.message,
        mode: "rich",
      });
    }
  }

  async function handleOpenDirectGmail(q: any) {
    const qItems = q.itemsJson || q.items;
    const isMulti = qItems && qItems.length > 1;
    const matchInv = inventory.find(
      (i) => i.slug === q.productSlug || i.name.toLowerCase() === q.productName.toLowerCase(),
    );
    const calculatedTotal =
      isMulti && qItems
        ? qItems.reduce(
            (acc: number, it: any) => acc + (it.unitPrice || matchInv?.priceBdt || 150000) * it.qty,
            0,
          )
        : q.quotedPrice || matchInv?.priceBdt || 150000;

    const unitPrice = q.quotedPrice || (isMulti ? calculatedTotal : matchInv?.priceBdt || 150000);
    const qty = isMulti ? 1 : q.qty || 1;
    const prodName = isMulti
      ? `${qItems?.length} Products (${qItems?.map((it: any) => it.productName).join(", ")})`
      : q.productName;

    const html = generateQuotationEmailHtml({
      quote: q,
      productName: prodName,
      unitPrice,
      qty,
      message: q.reply,
    });
    await copyQuotationHtmlToClipboard(html, q.reply || "");
    setGmailToast(true);

    openGmailQuotationDraft({
      quote: q,
      productName: prodName,
      unitPrice,
      qty,
      message: q.reply,
      mode: "rich",
    });
  }

  async function handleStatusChange(id: string, status: string) {
    await updateQuoteMutation.mutateAsync({ id, status });
  }

  function statusBadge(rawStatus: string) {
    const status = rawStatus.toLowerCase();
    const isPending = status === "pending";
    const isReplied = status === "replied" || status === "quoted";
    const isAccepted = status === "accepted" || status === "completed";

    const badgeClass = isPending
      ? "bg-amber-500/15 text-amber-400"
      : isReplied
        ? "bg-blue-500/15 text-blue-400"
        : isAccepted
          ? "bg-emerald-500/15 text-emerald-400"
          : "bg-red-500/15 text-red-400";

    const icon = isPending ? (
      <Clock className="h-3 w-3" />
    ) : isReplied ? (
      <MessageSquare className="h-3 w-3" />
    ) : isAccepted ? (
      <Check className="h-3 w-3" />
    ) : (
      <XCircle className="h-3 w-3" />
    );

    return (
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}
      >
        {icon}
        <span className="capitalize">{status}</span>
      </span>
    );
  }

  const pendingCount = quotes.filter((q: any) => q.status === "pending").length;

  return (
    <AdminLayout activeRoute="/admin/quotes">
      <div className="p-6 lg:p-8 space-y-6 max-w-[1440px]">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Quotations</h1>
          <p className="text-[13px] text-zinc-500 mt-1">
            {quotes.length} total requests • {pendingCount} pending response
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
              placeholder="Search by company, contact, or product..."
              className="w-full bg-[#232323] border border-white/[0.06] rounded-lg pl-9 pr-3 py-[7px] text-[13px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
            />
          </div>

          <div className="flex gap-1.5">
            {["all", "pending", "replied", "accepted", "declined"].map((s) => (
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

        {/* Quote Cards */}
        <div className="space-y-3">
          {filtered.map((q: any) => {
            const isExpanded = expandedId === q.id;
            return (
              <div
                key={q.id}
                className="bg-[#232323] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.1] transition-all"
              >
                {/* Quote Header */}
                <button
                  onClick={() => toggleExpand(q)}
                  className="w-full px-5 py-4 flex items-center gap-4 text-left"
                >
                  <div className="h-10 w-10 rounded-lg bg-white/[0.04] flex items-center justify-center text-zinc-400 shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[13px] font-semibold text-white truncate">
                        {q.companyName}
                      </p>
                      {statusBadge(q.status)}
                      {q.items && q.items.length > 1 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20 font-mono">
                          <Package className="h-3 w-3" />
                          {q.items.length} Products
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                      {q.productName} × {q.qty}
                      {q.quotedPrice ? ` • Quoted: ${taka(q.quotedPrice * q.qty)}` : ""}
                    </p>
                  </div>
                  <div className="hidden sm:block text-right shrink-0">
                    <p className="text-[11px] text-zinc-500">
                      {new Date(q.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-[10px] text-zinc-600">{q.contactName}</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-zinc-500 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0" />
                  )}
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t border-white/[0.06] px-5 py-4 space-y-4">
                    {/* Contact Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-zinc-500" />
                        <div>
                          <p className="text-[10px] text-zinc-600">Business Type</p>
                          <p className="text-[12px] text-zinc-300">{q.businessType}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-zinc-500" />
                        <div>
                          <p className="text-[10px] text-zinc-600">Phone</p>
                          <p className="text-[12px] text-zinc-300">{q.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-zinc-500" />
                        <div>
                          <p className="text-[10px] text-zinc-600">Email</p>
                          <p className="text-[12px] text-zinc-300 truncate">{q.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                        <div>
                          <p className="text-[10px] text-zinc-600">City</p>
                          <p className="text-[12px] text-zinc-300">{q.city}</p>
                        </div>
                      </div>
                    </div>

                    {q.notes && (
                      <div className="bg-white/[0.02] rounded-lg p-3">
                        <p className="text-[10px] text-zinc-600 mb-1">
                          Customer Notes / Requirements
                        </p>
                        <p className="text-[12px] text-zinc-300">{q.notes}</p>
                      </div>
                    )}

                    {/* Multi-Product Requested Line Items */}
                    {q.items && q.items.length > 0 && (
                      <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[12px] font-semibold text-zinc-200 flex items-center gap-2">
                            <Package className="h-4 w-4 text-emerald-400" />
                            <span>Requested Products ({q.items.length} Line Items)</span>
                          </h4>
                          <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded">
                            {q.items.reduce((acc: number, it: any) => acc + it.qty, 0)} total units
                          </span>
                        </div>
                        <div className="divide-y divide-white/[0.06] overflow-hidden rounded-lg border border-white/[0.06] bg-[#1a1a1a]">
                          {q.items.map((it: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-3 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="h-5 w-5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold flex items-center justify-center font-mono shrink-0">
                                  {idx + 1}
                                </span>
                                <div className="min-w-0">
                                  <p className="font-medium text-zinc-100 truncate">
                                    {it.productName}
                                  </p>
                                  <p className="text-[11px] text-zinc-500 font-mono">
                                    Model ID: {it.productSlug}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 text-right shrink-0">
                                <span className="text-zinc-300 font-mono font-semibold bg-white/[0.05] px-2 py-0.5 rounded">
                                  {it.qty} unit{it.qty > 1 ? "s" : ""}
                                </span>
                                {it.unitPrice ? (
                                  <span className="text-emerald-400 font-mono text-[11px]">
                                    ৳{(it.unitPrice * it.qty).toLocaleString("en-BD")}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quotation Item & Pricing Configuration */}
                    <div className="bg-[#1c1c1c] border border-white/[0.08] rounded-xl p-4 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[12px] font-semibold text-white flex items-center gap-1.5">
                          <Calculator className="h-4 w-4 text-emerald-400" />
                          Commercial Quotation Specifications
                        </h4>
                        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Total: {taka(replyState.unitPrice * replyState.qty)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Select Product */}
                        <div className="sm:col-span-1">
                          <label className="text-[11px] text-zinc-400 font-medium block mb-1">
                            Equipment / Product
                          </label>
                          <select
                            value={replyState.productSlug}
                            onChange={(e) => handleProductChange(e.target.value)}
                            className="w-full bg-[#232323] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[12px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          >
                            {inventory.map((item) => (
                              <option key={item.slug} value={item.slug}>
                                {item.name} (
                                {(item as any).sku || item.slug.slice(0, 6).toUpperCase()})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quoted Unit Price */}
                        <div>
                          <label className="text-[11px] text-zinc-400 font-medium block mb-1">
                            Quoted Unit Price (BDT)
                          </label>
                          <input
                            type="number"
                            value={replyState.unitPrice}
                            onChange={(e) =>
                              setReplyState({
                                ...replyState,
                                unitPrice: Number(e.target.value) || 0,
                              })
                            }
                            className="w-full bg-[#232323] border border-white/[0.08] rounded-lg px-3 py-1.5 text-[12px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        {/* Quantity */}
                        <div>
                          <label className="text-[11px] text-zinc-400 font-medium block mb-1">
                            Quantity
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
                            className="w-full bg-[#232323] border border-white/[0.08] rounded-lg px-3 py-1.5 text-[12px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Reply Message */}
                      <div>
                        <label className="text-[11px] text-zinc-400 font-medium block mb-1">
                          Official Reply Message & Commercial Terms
                        </label>
                        <textarea
                          value={replyState.message}
                          onChange={(e) =>
                            setReplyState({ ...replyState, message: e.target.value })
                          }
                          rows={3}
                          placeholder="Type your official reply, payment terms, or delivery schedule..."
                          className="w-full bg-[#232323] border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 pt-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleSendDetailedReply(q.id, "replied")}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[12px] font-medium px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Send Reply & Open Gmail ({taka(replyState.unitPrice * replyState.qty)})
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
                          className="flex items-center gap-1.5 bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/25 text-[12px] font-medium px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                          title="Preview Branded Commercial HTML Email Template"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Preview Email Template
                        </button>
                        <button
                          onClick={() => handleOpenDirectGmail(q)}
                          className="flex items-center gap-1.5 bg-red-600/15 hover:bg-red-600/25 text-red-400 border border-red-500/20 text-[12px] font-medium px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                          title="Open Gmail Compose & Copy Formatted Design"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          Open in Gmail
                        </button>
                        <button
                          onClick={() => handleSendDetailedReply(q.id, "accepted")}
                          className="flex items-center gap-1.5 bg-white/[0.06] hover:bg-emerald-500/20 text-zinc-300 hover:text-emerald-400 text-[12px] font-medium px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve & Accept
                        </button>
                        <button
                          onClick={() => handleStatusChange(q.id, "declined")}
                          className="flex items-center gap-1.5 bg-white/[0.06] hover:bg-red-500/20 text-zinc-400 hover:text-red-400 text-[12px] font-medium px-3.5 py-2 rounded-lg transition-colors ml-auto cursor-pointer"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Decline
                        </button>
                      </div>
                      <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                        <Mail className="h-3 w-3 text-emerald-400" />
                        <span>
                          Clicking reply logs the status and opens Gmail with an itemized commercial
                          quotation report addressed to {q.email}.
                        </span>
                      </p>
                    </div>

                    {q.reply && (
                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[10px] text-emerald-500 font-medium">
                            Logged Official Response
                          </p>
                          {q.quotedPrice && (
                            <span className="text-[10px] text-emerald-400 font-mono">
                              Quoted Total: {taka(q.quotedPrice * q.qty)}
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-zinc-300">{q.reply}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <FileText className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
              <p className="text-[14px] text-zinc-400 font-medium">No quotations found</p>
              <p className="text-[12px] text-zinc-600 mt-1">Try adjusting your filters</p>
            </div>
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
          onSent={() => {
            setPreviewEmailQuote(null);
          }}
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
                Quotation Template Copied to Clipboard!
              </h4>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Gmail opened with empty body. Simply press{" "}
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                  Ctrl + V
                </kbd>{" "}
                in Gmail to paste your styled commercial quotation template.
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
