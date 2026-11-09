import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  getInventory,
  updateInventoryItem,
  addInventoryItem,
  deleteInventoryItem,
  getQuotes,
  replyToQuoteWithDetails,
  openGmailQuotationDraft,
  type InventoryItem,
  type QuoteRequest,
} from "@/lib/admin-data";
import { taka, categories, images } from "@/lib/data";
import {
  Package,
  Search,
  Filter,
  ChevronDown,
  Edit3,
  X,
  Save,
  AlertTriangle,
  XCircle,
  Check,
  ArrowUpDown,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  Send,
  MessageSquare,
  Calculator,
  Mail,
  Eye,
  RefreshCw,
} from "lucide-react";
import { useState, useMemo, useRef } from "react";
import { uploadMediaFile, deleteMediaFile } from "@/lib/client-media";
import {
  QuotationEmailModal,
  generateQuotationEmailHtml,
  copyQuotationHtmlToClipboard,
} from "@/components/admin/QuotationEmailModal";

export const Route = createFileRoute("/admin/inventory")({
  component: AdminInventory,
  head: () => ({
    meta: [{ title: "Inventory Management — PAGE Admin" }],
  }),
});

const PRESET_GALLERY = [
  { label: "2-Post Lift", src: images.lift },
  { label: "Tyre Changer", src: images.tyreChanger },
  { label: "Wheel Balancer", src: images.wheelBalancer },
  { label: "Air Compressor", src: images.compressor },
  { label: "Scanner / ADAS", src: images.scanner },
  { label: "EV Tools 1000V", src: images.evTools },
  { label: "EV Battery Analyzer", src: images.evBatteryAnalyzer },
  { label: "Motorcycle Lift", src: images.motoLift },
  { label: "Brake Pads", src: images.brakepads },
  { label: "Battery Pack", src: images.battery },
  { label: "Lubricants / Oil", src: images.oil },
  { label: "Workshop Bay", src: images.workshop },
];

function AdminInventory() {
  const [inventory, setInventory] = useState(() => getInventory());
  const [quotes, setQuotes] = useState(() => getQuotes());
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [imageTab, setImageTab] = useState<"presets" | "upload" | "url">("presets");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quote reply modal state
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>("");
  const [quoteProductSlug, setQuoteProductSlug] = useState<string>("");
  const [quotePrice, setQuotePrice] = useState<number>(0);
  const [quoteQty, setQuoteQty] = useState<number>(1);
  const [quoteMessage, setQuoteMessage] = useState<string>("");
  const [quoteSuccessMsg, setQuoteSuccessMsg] = useState<string | null>(null);
  const [previewEmailQuote, setPreviewEmailQuote] = useState<{
    quote: QuoteRequest;
    productName: string;
    unitPrice: number;
    qty: number;
    message: string;
  } | null>(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    brand: "",
    category: categories[0] || "Garage Equipment",
    price: 0,
    warehouseQty: 10,
    reorderLevel: 5,
    sku: "",
    description: "",
    image: images.lift,
  });
  const [editData, setEditData] = useState<{
    price: number;
    warehouseQty: number;
    reorderLevel: number;
    stock: string;
  }>({
    price: 0,
    warehouseQty: 0,
    reorderLevel: 5,
    stock: "In stock",
  });
  const [sortField, setSortField] = useState<"name" | "price" | "warehouseQty">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    let items = [...inventory];

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.sku.toLowerCase().includes(q) ||
          i.brand.toLowerCase().includes(q),
      );
    }
    if (catFilter !== "All") {
      items = items.filter((i) => i.category === catFilter);
    }
    if (stockFilter === "Low") {
      items = items.filter((i) => i.warehouseQty > 0 && i.warehouseQty <= i.reorderLevel);
    } else if (stockFilter === "Out") {
      items = items.filter((i) => i.warehouseQty === 0);
    } else if (stockFilter === "In") {
      items = items.filter((i) => i.warehouseQty > i.reorderLevel);
    }

    items.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "price") cmp = a.price - b.price;
      else cmp = a.warehouseQty - b.warehouseQty;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return items;
  }, [inventory, search, catFilter, stockFilter, sortField, sortDir]);

  function startEdit(item: InventoryItem) {
    setEditingSlug(item.slug);
    setEditData({
      price: item.price,
      warehouseQty: item.warehouseQty,
      reorderLevel: item.reorderLevel,
      stock: item.stock,
    });
  }

  function saveEdit() {
    if (!editingSlug) return;
    updateInventoryItem(editingSlug, {
      price: editData.price,
      warehouseQty: editData.warehouseQty,
      reorderLevel: editData.reorderLevel,
      stock: editData.stock as any,
    });
    setInventory(getInventory());
    setEditingSlug(null);
  }

  async function handleDelete(slug: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}" from inventory?`)) return;
    const item = inventory.find((i) => i.slug === slug);
    if (item && item.image && item.image.startsWith("/uploads/")) {
      try {
        await deleteMediaFile({ url: item.image });
      } catch (err) {
        console.warn("Could not delete product media file:", err);
      }
    }
    deleteInventoryItem(slug);
    setInventory(getInventory());
  }

  function handleCreateProduct() {
    if (!newProduct.name || !newProduct.sku) {
      alert("Product name and SKU are required.");
      return;
    }
    const slug =
      newProduct.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Date.now().toString(36).slice(-4);
    addInventoryItem({
      slug,
      name: newProduct.name,
      brand: newProduct.brand || "PAGE Genuine",
      category: newProduct.category,
      price: Number(newProduct.price) || 0,
      warehouseQty: Number(newProduct.warehouseQty) || 0,
      reorderLevel: Number(newProduct.reorderLevel) || 5,
      sku: newProduct.sku.toUpperCase(),
      description:
        newProduct.description || "Commercial grade equipment distributed by PAGE International.",
      rating: 5.0,
      reviews: 1,
      stock:
        Number(newProduct.warehouseQty) === 0
          ? "Out of stock"
          : Number(newProduct.warehouseQty) <= 5
            ? "Low stock"
            : "In stock",
      image: newProduct.image || images.workshop,
      fits: ["Universal Workshop Fit"],
      specs: [
        ["Warranty", "1 Year Commercial"],
        ["Standard", "ISO/CE Certified"],
      ],
      mobility: ["4-Wheeler"],
      isEquipment: true,
    });
    setInventory(getInventory());
    setShowAddModal(false);
    setNewProduct({
      name: "",
      brand: "",
      category: categories[0] || "Garage Equipment",
      price: 0,
      warehouseQty: 10,
      reorderLevel: 5,
      sku: "",
      description: "",
      image: images.lift,
    });
  }

  async function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert("Please select an image smaller than 20MB");
        return;
      }
      try {
        setIsUploadingImage(true);
        const res = await uploadMediaFile(file, "products");
        if (res.success) {
          setNewProduct((prev) => ({ ...prev, image: res.url }));
        }
      } catch (err: any) {
        console.error("Product media upload error:", err);
        alert(err.message || "Failed to upload product image to server storage");
      } finally {
        setIsUploadingImage(false);
      }
    }
  }

  function openQuoteReplyForProduct(product?: InventoryItem) {
    const currentQuotes = getQuotes();
    setQuotes(currentQuotes);
    const pendingQuotes = currentQuotes.filter((q) => q.status === "pending");
    const firstQuote = pendingQuotes[0] || currentQuotes[0];

    const targetProduct =
      product ||
      (firstQuote
        ? inventory.find(
            (i) =>
              i.slug === firstQuote.productSlug ||
              i.name.toLowerCase() === firstQuote.productName.toLowerCase(),
          )
        : null) ||
      inventory[0];

    setSelectedQuoteId(firstQuote ? firstQuote.id : "");
    setQuoteProductSlug(targetProduct?.slug || "");
    setQuotePrice(targetProduct?.price || 0);
    setQuoteQty(firstQuote?.qty || 1);
    setQuoteMessage(
      firstQuote
        ? `Dear ${firstQuote.contactName || firstQuote.companyName}, thank you for reaching out to PAGE International. We are pleased to provide you with the formal price quotation for ${firstQuote.qty}x ${targetProduct?.name || firstQuote.productName}. Certified installation and warranty support included.`
        : `Thank you for reaching out to PAGE International. We are pleased to provide you with this official price quotation.`,
    );
    setShowQuoteModal(true);
  }

  function handleQuoteSelectChange(quoteId: string) {
    setSelectedQuoteId(quoteId);
    const quote = quotes.find((q) => q.id === quoteId);
    if (quote) {
      const matched = inventory.find(
        (i) =>
          i.slug === quote.productSlug || i.name.toLowerCase() === quote.productName.toLowerCase(),
      );
      const prod = matched || inventory[0];
      if (prod) {
        setQuoteProductSlug(prod.slug);
        setQuotePrice(prod.price);
        setQuoteQty(quote.qty || 1);
        setQuoteMessage(
          `Dear ${quote.contactName || quote.companyName}, thank you for reaching out to PAGE International. We are pleased to provide you with the formal price quotation for ${quote.qty}x ${prod.name}. Certified installation and warranty support included.`,
        );
      }
    }
  }

  function handleQuoteProductChange(slug: string) {
    setQuoteProductSlug(slug);
    const prod = inventory.find((i) => i.slug === slug);
    if (prod) {
      setQuotePrice(prod.price);
    }
  }

  async function submitQuoteReply() {
    if (!selectedQuoteId) {
      alert("Please select a customer quotation request to reply to.");
      return;
    }
    const q = quotes.find((item) => item.id === selectedQuoteId);
    const prod = inventory.find((i) => i.slug === quoteProductSlug);
    const finalProdName = prod?.name || "Equipment";

    replyToQuoteWithDetails(selectedQuoteId, {
      productSlug: quoteProductSlug,
      productName: finalProdName,
      unitPrice: quotePrice,
      qty: quoteQty,
      reply: quoteMessage,
      status: "replied",
    });
    setQuotes(getQuotes());

    if (q) {
      // 1. Copy rich HTML to clipboard so the admin can paste directly into Gmail
      const html = generateQuotationEmailHtml({
        quote: q,
        productName: finalProdName,
        unitPrice: quotePrice,
        qty: quoteQty,
        message: quoteMessage,
      });
      await copyQuotationHtmlToClipboard(html, quoteMessage);

      // 2. Open Gmail compose with prefilled quotation report
      openGmailQuotationDraft({
        quote: q,
        productName: finalProdName,
        unitPrice: quotePrice,
        qty: quoteQty,
        message: quoteMessage,
      });
    }

    setQuoteSuccessMsg("Quotation saved & opened in Gmail with quotation report pre-filled!");
    setTimeout(() => {
      setQuoteSuccessMsg(null);
      setShowQuoteModal(false);
    }, 2500);
  }

  function toggleSort(field: typeof sortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  const lowCount = inventory.filter(
    (i) => i.warehouseQty > 0 && i.warehouseQty <= i.reorderLevel,
  ).length;
  const outCount = inventory.filter((i) => i.warehouseQty === 0).length;
  const pendingQuotesCount = quotes.filter((q) => q.status === "pending").length;

  return (
    <AdminLayout activeRoute="/admin/inventory">
      <div className="p-6 lg:p-8 space-y-6 max-w-[1440px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Inventory</h1>
            <p className="text-[13px] text-zinc-500 mt-1">
              {inventory.length} products • {lowCount} low stock • {outCount} out of stock
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={() => openQuoteReplyForProduct()}
              className="flex items-center gap-1.5 bg-[#232323] hover:bg-white/[0.08] text-zinc-200 border border-white/[0.08] text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Send className="h-3.5 w-3.5 text-emerald-400" />
              <span>Reply to Quotation</span>
              {pendingQuotesCount > 0 && (
                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {pendingQuotesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, SKU, or brand..."
              className="w-full bg-[#232323] border border-white/[0.06] rounded-lg pl-9 pr-3 py-[7px] text-[13px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
            />
          </div>

          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="bg-[#232323] border border-white/[0.06] rounded-lg px-3 py-[7px] text-[13px] text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 appearance-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="bg-[#232323] border border-white/[0.06] rounded-lg px-3 py-[7px] text-[13px] text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 appearance-none cursor-pointer"
          >
            <option value="All">All Stock Levels</option>
            <option value="In">In Stock</option>
            <option value="Low">Low Stock</option>
            <option value="Out">Out of Stock</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-[#232323] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                    <button
                      onClick={() => toggleSort("name")}
                      className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
                    >
                      Product
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                    <button
                      onClick={() => toggleSort("price")}
                      className="flex items-center gap-1 ml-auto hover:text-zinc-300 transition-colors"
                    >
                      Price
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                    <button
                      onClick={() => toggleSort("warehouseQty")}
                      className="flex items-center gap-1 ml-auto hover:text-zinc-300 transition-colors"
                    >
                      Qty
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-center px-4 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-center px-4 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((item) => {
                  const isEditing = editingSlug === item.slug;
                  const isLow = item.warehouseQty > 0 && item.warehouseQty <= item.reorderLevel;
                  const isOut = item.warehouseQty === 0;

                  return (
                    <tr key={item.slug} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3 max-w-[280px]">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-9 w-9 rounded-lg object-cover bg-zinc-800 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-[12px] font-medium text-zinc-200 truncate">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-zinc-500">{item.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] text-zinc-400 font-mono bg-white/[0.04] px-1.5 py-0.5 rounded">
                          {item.sku}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-zinc-400">{item.category}</td>
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editData.price}
                            onChange={(e) =>
                              setEditData({ ...editData, price: Number(e.target.value) })
                            }
                            className="w-24 bg-white/[0.06] border border-emerald-500/50 rounded px-2 py-1 text-[12px] text-white text-right focus:outline-none"
                          />
                        ) : (
                          <span className="text-[12px] text-zinc-200 font-medium">
                            {taka(item.price)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editData.warehouseQty}
                            onChange={(e) =>
                              setEditData({ ...editData, warehouseQty: Number(e.target.value) })
                            }
                            className="w-16 bg-white/[0.06] border border-emerald-500/50 rounded px-2 py-1 text-[12px] text-white text-right focus:outline-none"
                          />
                        ) : (
                          <span
                            className={`text-[12px] font-medium ${isOut ? "text-red-400" : isLow ? "text-amber-400" : "text-zinc-200"}`}
                          >
                            {item.warehouseQty}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full">
                            <XCircle className="h-3 w-3" /> Out
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="h-3 w-3" /> Low
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full">
                            <Check className="h-3 w-3" /> In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={saveEdit}
                              className="h-7 w-7 rounded-md bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors flex items-center justify-center"
                            >
                              <Save className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingSlug(null)}
                              className="h-7 w-7 rounded-md bg-white/[0.06] text-zinc-400 hover:bg-white/[0.1] transition-colors flex items-center justify-center"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openQuoteReplyForProduct(item)}
                              title="Reply to customer quotation with this product"
                              className="h-7 w-7 rounded-md bg-white/[0.04] text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors flex items-center justify-center"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => startEdit(item)}
                              title="Edit item"
                              className="h-7 w-7 rounded-md bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-200 transition-colors flex items-center justify-center"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.slug, item.name)}
                              title="Delete product"
                              className="h-7 w-7 rounded-md bg-white/[0.04] text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors flex items-center justify-center"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-[13px] text-zinc-500">No products match your filters</p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-white/[0.06] px-5 py-3 flex items-center justify-between">
            <p className="text-[11px] text-zinc-500">
              Showing {filtered.length} of {inventory.length} products
            </p>
          </div>
        </div>

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-[#232323] border border-white/[0.08] rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Add New Product</h3>
                    <p className="text-[11px] text-zinc-500">
                      Create a new item in your catalog and warehouse stock
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors h-7 w-7 rounded-lg hover:bg-white/[0.06] flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">
                {/* Product Title */}
                <div>
                  <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="e.g. Hunter TCX575 Heavy-Duty Tyre Changer"
                    className="w-full bg-[#1c1c1c] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* SKU & Brand */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                      SKU Code *
                    </label>
                    <input
                      type="text"
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                      placeholder="e.g. TCX-575"
                      className="w-full bg-[#1c1c1c] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={newProduct.brand}
                      onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                      placeholder="e.g. Hunter Engineering / Bosch"
                      className="w-full bg-[#1c1c1c] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Category & Pricing & Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-1">
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                      Category
                    </label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full bg-[#1c1c1c] border border-white/[0.08] rounded-lg px-2.5 py-2 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                      Price (BDT) *
                    </label>
                    <input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, price: Number(e.target.value) })
                      }
                      className="w-full bg-[#1c1c1c] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                      Warehouse Qty
                    </label>
                    <input
                      type="number"
                      value={newProduct.warehouseQty}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, warehouseQty: Number(e.target.value) })
                      }
                      className="w-full bg-[#1c1c1c] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                      Reorder Threshold
                    </label>
                    <input
                      type="number"
                      value={newProduct.reorderLevel}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, reorderLevel: Number(e.target.value) })
                      }
                      className="w-full bg-[#1c1c1c] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* ── Product Image Selector ── */}
                <div className="bg-[#1c1c1c] border border-white/[0.08] rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[12px] font-semibold text-zinc-200 flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
                      Product Image
                    </label>
                    <div className="flex items-center gap-1 bg-[#232323] p-0.5 rounded-lg border border-white/[0.06]">
                      <button
                        type="button"
                        onClick={() => setImageTab("presets")}
                        className={`text-[11px] font-medium px-2 py-1 rounded-md transition-all ${
                          imageTab === "presets"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        Presets Gallery
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageTab("upload")}
                        className={`text-[11px] font-medium px-2 py-1 rounded-md transition-all ${
                          imageTab === "upload"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageTab("url")}
                        className={`text-[11px] font-medium px-2 py-1 rounded-md transition-all ${
                          imageTab === "url"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        Image URL
                      </button>
                    </div>
                  </div>

                  {/* Active Preview */}
                  <div className="flex items-center gap-3 bg-[#232323] p-2.5 rounded-lg border border-white/[0.04]">
                    <div className="relative h-14 w-14 rounded-lg bg-zinc-900 overflow-hidden border border-white/[0.08] shrink-0">
                      <img
                        src={newProduct.image || images.lift}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium text-white truncate">Selected Image</p>
                      <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                        {newProduct.image?.startsWith("data:")
                          ? "Custom Uploaded File (Base64)"
                          : newProduct.image?.slice(0, 48) + "..."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-md transition-colors shrink-0"
                    >
                      Change
                    </button>
                  </div>

                  {/* Tab 1: Presets Gallery */}
                  {imageTab === "presets" && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-zinc-500">
                        Select a high-resolution workshop machinery image from the catalog library:
                      </p>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto pr-1">
                        {PRESET_GALLERY.map((item, idx) => {
                          const isSelected = newProduct.image === item.src;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setNewProduct({ ...newProduct, image: item.src })}
                              className={`group relative rounded-lg overflow-hidden border transition-all aspect-square bg-zinc-900 ${
                                isSelected
                                  ? "border-emerald-500 ring-2 ring-emerald-500/30"
                                  : "border-white/[0.08] hover:border-white/[0.2]"
                              }`}
                            >
                              <img
                                src={item.src}
                                alt={item.label}
                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                              />
                              {isSelected && (
                                <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                                  <div className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                                    <Check className="h-3 w-3" strokeWidth={3} />
                                  </div>
                                </div>
                              )}
                              <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-zinc-300 px-1 py-0.5 truncate text-center">
                                {item.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tab 2: File Upload */}
                  {imageTab === "upload" && (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                      <div
                        onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors bg-white/[0.01] ${
                          isUploadingImage
                            ? "border-emerald-500/50 bg-emerald-500/[0.04] cursor-wait"
                            : "border-white/[0.12] hover:border-emerald-500/50 hover:bg-emerald-500/[0.02]"
                        }`}
                      >
                        {isUploadingImage ? (
                          <div className="space-y-1.5">
                            <RefreshCw className="h-6 w-6 text-emerald-400 mx-auto animate-spin" />
                            <p className="text-[12px] font-semibold text-emerald-300">
                              Uploading to server disk & indexing in PostgreSQL...
                            </p>
                            <p className="text-[10px] text-zinc-500">
                              Writing persistent media file
                            </p>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-6 w-6 text-emerald-400 mx-auto mb-1.5" />
                            <p className="text-[12px] font-medium text-zinc-200">
                              Click to browse image or drag and drop
                            </p>
                            <p className="text-[10px] text-zinc-500 mt-0.5">
                              Supports PNG, JPG, WEBP, or SVG (Saved to /uploads/products/ on disk)
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Direct URL */}
                  {imageTab === "url" && (
                    <div className="space-y-1.5">
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                        <input
                          type="url"
                          placeholder="https://example.com/images/workshop-equipment.jpg"
                          value={newProduct.image?.startsWith("data:") ? "" : newProduct.image}
                          onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                          className="w-full bg-[#232323] border border-white/[0.08] rounded-lg pl-9 pr-3 py-2 text-[12px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <p className="text-[10px] text-zinc-500">
                        Paste any public image URL or cloud asset link
                      </p>
                    </div>
                  )}
                </div>

                {/* Technical Specifications */}
                <div>
                  <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                    Technical Specifications & Description
                  </label>
                  <textarea
                    rows={3}
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Key specifications, power rating, warranty details..."
                    className="w-full bg-[#1c1c1c] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-[13px] text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.04] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateProduct}
                  className="px-5 py-2 text-[13px] font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-sm"
                >
                  Create Product
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Reply to Customer Quotation Modal */}
        {showQuoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-[#232323] border border-white/[0.08] rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Send className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Reply to Customer Quotation</h3>
                    <p className="text-[11px] text-zinc-500">
                      Configure product, custom pricing and quantity
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors h-7 w-7 rounded-lg hover:bg-white/[0.06] flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {quoteSuccessMsg ? (
                <div className="py-8 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <Check className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-bold text-white">{quoteSuccessMsg}</h4>
                  <p className="text-xs text-zinc-400">
                    The customer request status has been updated to Replied.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">
                  {/* Select Customer Quote */}
                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                      Customer Inquiry Request *
                    </label>
                    <select
                      value={selectedQuoteId}
                      onChange={(e) => handleQuoteSelectChange(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      {quotes.map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.companyName} ({q.contactName}) — {q.productName} [
                          {q.status.toUpperCase()}]
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Customer Info Card if selected */}
                  {(() => {
                    const activeQuote = quotes.find((q) => q.id === selectedQuoteId);
                    if (!activeQuote) return null;
                    return (
                      <div className="rounded-lg bg-[#1c1c1c] border border-white/[0.06] p-3 text-xs text-zinc-300 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Contact:</span>
                          <span className="font-semibold text-white">
                            {activeQuote.contactName} ({activeQuote.phone})
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Business / City:</span>
                          <span>
                            {activeQuote.businessType} • {activeQuote.city}
                          </span>
                        </div>
                        {activeQuote.notes && (
                          <div className="pt-1 border-t border-white/[0.04] text-[11px] text-zinc-400 italic">
                            "{activeQuote.notes}"
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Select Product */}
                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                      Quoted Product / Machinery *
                    </label>
                    <select
                      value={quoteProductSlug}
                      onChange={(e) => handleQuoteProductChange(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      {inventory.map((item) => (
                        <option key={item.slug} value={item.slug}>
                          {item.name} ({item.brand} - {item.sku}) — {taka(item.price)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pricing and Quantity */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                        Quoted Unit Price (BDT) *
                      </label>
                      <input
                        type="number"
                        value={quotePrice}
                        onChange={(e) => setQuotePrice(Number(e.target.value) || 0)}
                        className="w-full bg-[#1c1c1c] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={quoteQty}
                        onChange={(e) => setQuoteQty(Math.max(1, Number(e.target.value) || 1))}
                        className="w-full bg-[#1c1c1c] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Valuation Banner */}
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-center justify-between">
                    <span className="text-[12px] font-medium text-emerald-300">
                      Total Quoted Amount
                    </span>
                    <span className="text-base font-bold text-emerald-400 font-mono">
                      {taka(quotePrice * quoteQty)}
                    </span>
                  </div>

                  {/* Commercial Reply Message */}
                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                      Official Reply Message & Terms
                    </label>
                    <textarea
                      rows={3}
                      value={quoteMessage}
                      onChange={(e) => setQuoteMessage(e.target.value)}
                      placeholder="Specify delivery timeline, warranty, and payment terms..."
                      className="w-full bg-[#1c1c1c] border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
                    <p className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>
                        Pressing reply logs the quotation and opens Gmail with an itemized
                        commercial quotation report.
                      </span>
                    </p>
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        type="button"
                        onClick={() => setShowQuoteModal(false)}
                        className="px-4 py-2 text-[13px] text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const activeQuote = quotes.find((q) => q.id === selectedQuoteId);
                          if (!activeQuote) return;
                          const productObj = inventory.find((i) => i.slug === quoteProductSlug);
                          setPreviewEmailQuote({
                            quote: activeQuote,
                            productName: productObj?.name || activeQuote.productName,
                            unitPrice: quotePrice,
                            qty: quoteQty,
                            message: quoteMessage,
                          });
                        }}
                        className="flex items-center gap-1.5 bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/25 text-[13px] font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Preview Email Template
                      </button>
                      <button
                        type="button"
                        onClick={submitQuoteReply}
                        className="px-5 py-2 text-[13px] font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Reply & Open Gmail ({taka(quotePrice * quoteQty)})
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
              setQuotes(getQuotes());
              setShowQuoteModal(false);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}
