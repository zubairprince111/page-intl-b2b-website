import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useInventory,
  useUpdateInventoryItem,
  useCreateInventoryItem,
  useDeleteInventoryItem,
  useQuotes,
  useUpdateQuote,
} from "@/lib/data-client";
import { openGmailQuotationDraft } from "@/lib/quotation-email";
import {
  taka,
  categories,
  brands,
  images,
  mapDbProductToProduct,
  type MobilityType,
} from "@/lib/data";
import {
  getDistinctProductFeatures,
  inferIsEquipment,
  parseFitsText,
  parseSpecsText,
  sanitizeFeatureLines,
  sanitizeSpecRows,
} from "@/lib/product-utils";
import {
  Package,
  Search,
  Edit3,
  X,
  AlertTriangle,
  XCircle,
  Check,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Minus,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Send,
  Mail,
  Eye,
  RefreshCw,
  ClipboardList,
  FileText,
  ExternalLink,
  Loader2,
  Sparkles,
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

const SPEC_TEMPLATES = [
  "Lifting Capacity",
  "Power Supply",
  "Motor Power",
  "Operating Pressure",
  "Dimensions",
  "Weight",
  "Safety Rating",
  "Warranty",
];

const MOBILITY_OPTIONS: MobilityType[] = ["4-Wheeler", "2-Wheeler", "3-Wheeler", "EV"];

interface ProductFormState {
  slug: string;
  name: string;
  sku: string;
  brand: string;
  category: string;
  isEquipment: boolean;
  mobility: MobilityType[];
  price: number;
  warehouseQty: number;
  reorderLevel: number;
  inStock: boolean;
  image: string;
  specRows: { key: string; value: string }[];
  description: string;
  featureRows: string[];
  fitsText: string;
}

function createEmptyProductForm(): ProductFormState {
  const defaultCategory = categories[0] || "Garage Equipment";
  return {
    slug: "",
    name: "",
    sku: "",
    brand: "",
    category: defaultCategory,
    isEquipment: inferIsEquipment(defaultCategory),
    mobility: ["4-Wheeler"],
    price: 0,
    warehouseQty: 10,
    reorderLevel: 5,
    inStock: true,
    image: images.lift,
    specRows: [{ key: "", value: "" }],
    description: "",
    featureRows: [],
    fitsText: "",
  };
}

function AdminInventory() {
  const { data: rawInventory = [] } = useInventory();
  const { data: quotes = [] } = useQuotes();
  const updateItemMutation = useUpdateInventoryItem();
  const createItemMutation = useCreateInventoryItem();
  const deleteItemMutation = useDeleteInventoryItem();
  const updateQuoteMutation = useUpdateQuote();

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [productModalMode, setProductModalMode] = useState<"create" | "edit" | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(() => createEmptyProductForm());
  const [isEquipmentManual, setIsEquipmentManual] = useState(false);
  const [showBulkSpecs, setShowBulkSpecs] = useState(false);
  const [bulkSpecsText, setBulkSpecsText] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [imageTab, setImageTab] = useState<"presets" | "upload" | "url">("presets");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [updatingQtySlug, setUpdatingQtySlug] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalize database product rows merged with canonical storefront metadata
  const inventory = useMemo(() => {
    return rawInventory.map((p: any) => {
      const mapped = mapDbProductToProduct(p);
      return {
        ...p,
        ...mapped,
        warehouseQty: mapped.warehouseQty ?? p.warehouseQty ?? 10,
        reorderLevel: mapped.reorderLevel ?? p.reorderLevel ?? 5,
      };
    });
  }, [rawInventory]);

  // Quote reply modal state
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>("");
  const [quoteProductSlug, setQuoteProductSlug] = useState<string>("");
  const [quotePrice, setQuotePrice] = useState<number>(0);
  const [quoteQty, setQuoteQty] = useState<number>(1);
  const [quoteMessage, setQuoteMessage] = useState<string>("");
  const [quoteSuccessMsg, setQuoteSuccessMsg] = useState<string | null>(null);
  const [previewEmailQuote, setPreviewEmailQuote] = useState<{
    quote: any;
    productName: string;
    unitPrice: number;
    qty: number;
    message: string;
  } | null>(null);

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
      items = items.filter((i) => i.warehouseQty === 0 || i.stock === "Out of stock");
    } else if (stockFilter === "In") {
      items = items.filter((i) => i.stock !== "Out of stock" && i.warehouseQty > i.reorderLevel);
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

  function openAddModal() {
    setProductForm(createEmptyProductForm());
    setIsEquipmentManual(false);
    setShowBulkSpecs(false);
    setBulkSpecsText("");
    setFormError(null);
    setImageTab("presets");
    setProductModalMode("create");
  }

  function startEdit(item: any) {
    const mappedSpecs: [string, string][] = Array.isArray(item.specs) ? item.specs : [];
    const specRows =
      mappedSpecs.length > 0
        ? mappedSpecs.map(([key, value]) => ({ key, value }))
        : [{ key: "", value: "" }];
    const featureRows = getDistinctProductFeatures(item.features, item.fits);

    setProductForm({
      slug: item.slug,
      name: item.name || "",
      sku: item.sku || "",
      brand: item.brand || "",
      category: item.category || categories[0] || "Garage Equipment",
      isEquipment: Boolean(item.isEquipment),
      mobility:
        Array.isArray(item.mobility) && item.mobility.length > 0 ? item.mobility : ["4-Wheeler"],
      price: Number(item.price) || 0,
      warehouseQty: Number(item.warehouseQty ?? 10),
      reorderLevel: Number(item.reorderLevel ?? 5),
      inStock: item.stock !== "Out of stock",
      image: item.image || images.lift,
      specRows,
      description: item.description || "",
      featureRows,
      fitsText: Array.isArray(item.fits) ? item.fits.join(", ") : "",
    });
    setIsEquipmentManual(true);
    setShowBulkSpecs(false);
    setBulkSpecsText("");
    setFormError(null);
    setImageTab("presets");
    setProductModalMode("edit");
  }

  function closeProductModal() {
    setProductModalMode(null);
    setFormError(null);
    setShowBulkSpecs(false);
    setBulkSpecsText("");
  }

  function toggleMobility(platform: MobilityType) {
    setProductForm((prev) => {
      const exists = prev.mobility.includes(platform);
      const next = exists
        ? prev.mobility.filter((m) => m !== platform)
        : [...prev.mobility, platform];
      return { ...prev, mobility: next.length > 0 ? next : [platform] };
    });
  }

  function addSpecRow(presetKey = "") {
    setProductForm((prev) => {
      // If there's only one completely blank placeholder row and a preset was clicked, fill it directly
      if (
        presetKey &&
        prev.specRows.length === 1 &&
        !prev.specRows[0]?.key.trim() &&
        !prev.specRows[0]?.value.trim()
      ) {
        return { ...prev, specRows: [{ key: presetKey, value: "" }] };
      }
      return { ...prev, specRows: [...prev.specRows, { key: presetKey, value: "" }] };
    });
  }

  function updateSpecRow(idx: number, field: "key" | "value", val: string) {
    setProductForm((prev) => ({
      ...prev,
      specRows: prev.specRows.map((row, i) => (i === idx ? { ...row, [field]: val } : row)),
    }));
  }

  function moveSpecRow(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= productForm.specRows.length) return;
    setProductForm((prev) => {
      const next = [...prev.specRows];
      const current = next[idx]!;
      next[idx] = next[target]!;
      next[target] = current;
      return { ...prev, specRows: next };
    });
  }

  function removeSpecRow(idx: number) {
    setProductForm((prev) => ({
      ...prev,
      specRows: prev.specRows.filter((_, i) => i !== idx),
    }));
  }

  function applyBulkSpecs() {
    const parsed = parseSpecsText(bulkSpecsText);
    if (parsed.length === 0) {
      setFormError("Could not find any `Key: Value` lines in the pasted specification block.");
      return;
    }
    setFormError(null);
    setProductForm((prev) => {
      const existingNonEmpty = prev.specRows.filter(
        (r) => r.key.trim().length > 0 || r.value.trim().length > 0,
      );
      return {
        ...prev,
        specRows: [...existingNonEmpty, ...parsed.map(([key, value]) => ({ key, value }))],
      };
    });
    setBulkSpecsText("");
    setShowBulkSpecs(false);
  }

  function addFeatureRow() {
    setProductForm((prev) => ({ ...prev, featureRows: [...prev.featureRows, ""] }));
  }

  function updateFeatureRow(idx: number, val: string) {
    setProductForm((prev) => ({
      ...prev,
      featureRows: prev.featureRows.map((item, i) => (i === idx ? val : item)),
    }));
  }

  function removeFeatureRow(idx: number) {
    setProductForm((prev) => ({
      ...prev,
      featureRows: prev.featureRows.filter((_, i) => i !== idx),
    }));
  }

  async function handleSaveProductModal() {
    setFormError(null);
    const trimmedName = productForm.name.trim();
    const trimmedSku = productForm.sku.trim();

    if (!trimmedName || !trimmedSku) {
      setFormError("Product Title and SKU Code are required.");
      return;
    }

    const specsTuples = sanitizeSpecRows(productForm.specRows);
    const cleanFeatures = sanitizeFeatureLines(productForm.featureRows);
    const cleanFits = parseFitsText(productForm.fitsText);
    const cleanDescription =
      productForm.description.trim() ||
      `${trimmedName} distributed by PAGE International with commercial technical support.`;

    try {
      if (productModalMode === "edit" && productForm.slug) {
        await updateItemMutation.mutateAsync({
          slug: productForm.slug,
          sku: trimmedSku,
          name: trimmedName,
          brand: productForm.brand.trim() || "PAGE Genuine",
          category: productForm.category,
          isEquipment: productForm.isEquipment,
          mobility: productForm.mobility,
          priceBdt: Math.max(0, Number(productForm.price) || 0),
          warehouseQty: Math.max(0, Math.floor(Number(productForm.warehouseQty) || 0)),
          reorderLevel: Math.max(0, Math.floor(Number(productForm.reorderLevel) || 0)),
          inStock: productForm.inStock && Number(productForm.warehouseQty) > 0,
          description: cleanDescription,
          specs: specsTuples,
          features: cleanFeatures,
          fits: cleanFits,
          images: productForm.image ? [productForm.image] : [images.lift],
        });
      } else {
        const baseSlug = trimmedName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        const slug = `${baseSlug || "product"}-${Date.now().toString(36).slice(-4)}`;

        await createItemMutation.mutateAsync({
          slug,
          sku: trimmedSku,
          name: trimmedName,
          brand: productForm.brand.trim() || "PAGE Genuine",
          category: productForm.category,
          isEquipment: productForm.isEquipment,
          mobility: productForm.mobility,
          priceBdt: Math.max(0, Number(productForm.price) || 0),
          warehouseQty: Math.max(0, Math.floor(Number(productForm.warehouseQty) || 0)),
          reorderLevel: Math.max(0, Math.floor(Number(productForm.reorderLevel) || 0)),
          inStock: productForm.inStock && Number(productForm.warehouseQty) > 0,
          description: cleanDescription,
          specs: specsTuples,
          features: cleanFeatures,
          fits: cleanFits,
          images: [productForm.image || images.lift],
        });
      }
      closeProductModal();
    } catch (err: any) {
      setFormError(err?.message || "Failed to save product changes.");
    }
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
    await deleteItemMutation.mutateAsync(slug);
  }

  async function handleAdjustQty(slug: string, currentQty: number, delta: number) {
    const nextQty = Math.max(0, Math.floor(currentQty) + delta);
    if (nextQty === currentQty) return;

    setUpdatingQtySlug(slug);
    try {
      await updateItemMutation.mutateAsync({
        slug,
        warehouseQty: nextQty,
        inStock: nextQty > 0,
      });
    } catch (err) {
      console.error("Failed to adjust inventory quantity:", err);
    } finally {
      setUpdatingQtySlug((prev) => (prev === slug ? null : prev));
    }
  }

  async function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        setFormError("Please select an image smaller than 20MB.");
        return;
      }
      try {
        setIsUploadingImage(true);
        const res = await uploadMediaFile(file, "products");
        if (res.success) {
          setProductForm((prev) => ({ ...prev, image: res.url }));
        }
      } catch (err: any) {
        console.error("Product media upload error:", err);
        setFormError(err?.message || "Failed to upload product image to server storage.");
      } finally {
        setIsUploadingImage(false);
      }
    }
  }

  function openQuoteReplyForProduct(product?: any) {
    const pendingQuotes = quotes.filter((q: any) => q.status?.toLowerCase() === "pending");
    const firstQuote = pendingQuotes[0] || quotes[0];

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

    await updateQuoteMutation.mutateAsync({
      id: selectedQuoteId,
      status: "replied",
      reply: quoteMessage,
      quotedPrice: quotePrice,
    });

    if (q) {
      // 1. Copy rich HTML to clipboard so the admin can paste directly into Gmail
      const html = generateQuotationEmailHtml({
        quote: q as any,
        productName: finalProdName,
        unitPrice: quotePrice,
        qty: quoteQty,
        message: quoteMessage,
      });
      await copyQuotationHtmlToClipboard(html, quoteMessage);

      // 2. Open Gmail compose with prefilled quotation report
      openGmailQuotationDraft({
        quote: q as any,
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
  const pendingQuotesCount = quotes.filter((q) => q.status?.toLowerCase() === "pending").length;

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
              onClick={openAddModal}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
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
                  const isOut = item.warehouseQty === 0 || item.stock === "Out of stock";
                  const isLow = !isOut && item.warehouseQty <= item.reorderLevel;
                  const specsCount = Array.isArray(item.specs) ? item.specs.length : 0;

                  return (
                    <tr key={item.slug} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3 max-w-[300px]">
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
                            <p className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                              <span>{item.brand}</span>
                              <span>•</span>
                              <span
                                className={
                                  specsCount > 0 ? "text-emerald-400/90" : "text-amber-400/90"
                                }
                              >
                                {specsCount} {specsCount === 1 ? "spec" : "specs"}
                              </span>
                            </p>
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
                        <span className="text-[12px] text-zinc-200 font-medium">
                          {taka(item.price)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAdjustQty(item.slug, item.warehouseQty, -1)}
                            disabled={item.warehouseQty <= 0 || updatingQtySlug === item.slug}
                            aria-label={`Decrease quantity for ${item.name}`}
                            title="Decrease quantity"
                            className="h-6 w-6 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:bg-white/[0.1] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span
                            className={`min-w-[2.25rem] text-center text-[12px] font-medium font-mono tabular-nums ${isOut ? "text-red-400" : isLow ? "text-amber-400" : "text-zinc-200"}`}
                          >
                            {updatingQtySlug === item.slug ? (
                              <Loader2 className="h-3 w-3 animate-spin mx-auto text-emerald-400" />
                            ) : (
                              item.warehouseQty
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAdjustQty(item.slug, item.warehouseQty, 1)}
                            disabled={updatingQtySlug === item.slug}
                            aria-label={`Increase quantity for ${item.name}`}
                            title="Increase quantity"
                            className="h-6 w-6 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/30 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
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
                        <div className="flex items-center justify-center gap-1">
                          <a
                            href={`/shop/${item.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            title="View public product page"
                            className="h-7 w-7 rounded-md bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white transition-colors flex items-center justify-center"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                          <button
                            onClick={() => openQuoteReplyForProduct(item)}
                            title="Reply to customer quotation with this product"
                            className="h-7 w-7 rounded-md bg-white/[0.04] text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors flex items-center justify-center cursor-pointer"
                          >
                            <Send className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => startEdit(item)}
                            title="Edit product, specs & overview"
                            className="h-7 w-7 rounded-md bg-white/[0.04] text-zinc-300 hover:bg-white/[0.1] hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.slug, item.name)}
                            title="Delete product"
                            className="h-7 w-7 rounded-md bg-white/[0.04] text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
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

        {/* Add / Edit Product Modal (Technical Specifications & Product Overview Builder) */}
        {productModalMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-[#232323] border border-white/[0.08] rounded-2xl w-full max-w-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    {productModalMode === "edit" ? (
                      <Edit3 className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {productModalMode === "edit" ? "Edit Product Details" : "Add New Product"}
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Configure catalog metadata, Technical Specifications, and Product Overview
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {productModalMode === "edit" && productForm.slug && (
                    <a
                      href={`/shop/${productForm.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <span>View Store Page</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={closeProductModal}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors h-7 w-7 rounded-lg hover:bg-white/[0.06] flex items-center justify-center cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {formError && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/25 px-3.5 py-2.5 text-xs text-red-300 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-5 max-h-[72vh] overflow-y-auto pr-1.5">
                {/* ── Section 1: Basic Info, Pricing & Platforms ── */}
                <div className="bg-[#1c1c1c] border border-white/[0.08] rounded-xl p-4 space-y-3.5">
                  <h4 className="text-[12px] font-bold uppercase tracking-wider text-zinc-300">
                    1. Basic Details &amp; Stock
                  </h4>

                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="e.g. Hunter TCX575 Heavy-Duty Tyre Changer"
                      className="w-full bg-[#232323] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                        SKU Code *
                      </label>
                      <input
                        type="text"
                        value={productForm.sku}
                        onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                        placeholder="e.g. TCX-575"
                        className="w-full bg-[#232323] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                        Brand / Manufacturer
                      </label>
                      <input
                        type="text"
                        list="inventory-brand-options"
                        value={productForm.brand}
                        onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                        placeholder="e.g. Torq, Diagtek, Hunter Engineering"
                        className="w-full bg-[#232323] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <datalist id="inventory-brand-options">
                        {brands.map((b) => (
                          <option key={b} value={b} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                        Category
                      </label>
                      <select
                        value={productForm.category}
                        onChange={(e) => {
                          const cat = e.target.value;
                          setProductForm((prev) => ({
                            ...prev,
                            category: cat,
                            isEquipment: isEquipmentManual
                              ? prev.isEquipment
                              : inferIsEquipment(cat),
                          }));
                        }}
                        className="w-full bg-[#232323] border border-white/[0.08] rounded-lg px-2.5 py-2 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                        value={productForm.price}
                        onChange={(e) =>
                          setProductForm({ ...productForm, price: Number(e.target.value) })
                        }
                        className="w-full bg-[#232323] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                        Warehouse Qty
                      </label>
                      <div className="flex items-center bg-[#232323] border border-white/[0.08] rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-emerald-500">
                        <button
                          type="button"
                          onClick={() => {
                            const nextQty = Math.max(0, (productForm.warehouseQty || 0) - 1);
                            setProductForm({
                              ...productForm,
                              warehouseQty: nextQty,
                              inStock: nextQty > 0,
                            });
                          }}
                          disabled={(productForm.warehouseQty || 0) <= 0}
                          aria-label="Decrease modal warehouse quantity"
                          className="h-[36px] w-8 shrink-0 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <input
                          type="number"
                          min={0}
                          value={productForm.warehouseQty}
                          onChange={(e) => {
                            const qty = Math.max(0, Math.floor(Number(e.target.value) || 0));
                            setProductForm({
                              ...productForm,
                              warehouseQty: qty,
                              inStock: qty > 0,
                            });
                          }}
                          className="w-full min-w-0 bg-transparent px-1 py-2 text-center text-[13px] font-mono tabular-nums text-white focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const nextQty = Math.max(0, (productForm.warehouseQty || 0) + 1);
                            setProductForm({
                              ...productForm,
                              warehouseQty: nextQty,
                              inStock: nextQty > 0,
                            });
                          }}
                          aria-label="Increase modal warehouse quantity"
                          className="h-[36px] w-8 shrink-0 flex items-center justify-center text-zinc-400 hover:text-emerald-300 hover:bg-emerald-500/15 transition-colors cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                        Reorder Threshold
                      </label>
                      <input
                        type="number"
                        value={productForm.reorderLevel}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            reorderLevel: Number(e.target.value),
                          })
                        }
                        className="w-full bg-[#232323] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Product Type & Supported Platforms */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[11px] font-medium text-zinc-400 block mb-1.5">
                        Product Classification
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 bg-[#232323] p-1 rounded-lg border border-white/[0.06]">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEquipmentManual(true);
                            setProductForm((prev) => ({ ...prev, isEquipment: true }));
                          }}
                          className={`py-1.5 px-2 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                            productForm.isEquipment
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          Workshop Machinery
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEquipmentManual(true);
                            setProductForm((prev) => ({ ...prev, isEquipment: false }));
                          }}
                          className={`py-1.5 px-2 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                            !productForm.isEquipment
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          Parts / Tooling
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-zinc-400 block mb-1.5">
                        Target Mobility Platforms
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {MOBILITY_OPTIONS.map((platform) => {
                          const active = productForm.mobility.includes(platform);
                          return (
                            <button
                              key={platform}
                              type="button"
                              onClick={() => toggleMobility(platform)}
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                                active
                                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                                  : "bg-[#232323] border-white/[0.06] text-zinc-400 hover:text-zinc-200"
                              }`}
                            >
                              {platform}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Section 2: Technical Specifications Builder (Shown FIRST on Product Page) ── */}
                <div className="bg-[#1c1c1c] border border-white/[0.08] rounded-xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-[12px] font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                        <ClipboardList className="h-3.5 w-3.5 text-emerald-400" />
                        <span>2. Technical Specifications</span>
                      </h4>
                      <p className="text-[10.5px] text-zinc-400 mt-0.5">
                        Displayed first on the storefront product page as a structured datasheet
                        table
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setShowBulkSpecs((v) => !v)}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#232323] border border-white/[0.08] text-zinc-300 hover:text-white hover:border-white/[0.2] transition-colors cursor-pointer"
                      >
                        {showBulkSpecs ? "Hide Bulk Paste" : "Bulk Paste Specs"}
                      </button>
                      <button
                        type="button"
                        onClick={() => addSpecRow("")}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 transition-colors cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                        Add Spec Row
                      </button>
                    </div>
                  </div>

                  {/* Quick Spec Preset Chips */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-medium text-zinc-500 mr-1">Quick add:</span>
                    {SPEC_TEMPLATES.map((key) => {
                      const alreadyAdded = productForm.specRows.some(
                        (r) => r.key.trim().toLowerCase() === key.toLowerCase(),
                      );
                      return (
                        <button
                          key={key}
                          type="button"
                          disabled={alreadyAdded}
                          onClick={() => addSpecRow(key)}
                          className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors ${
                            alreadyAdded
                              ? "border-white/[0.04] bg-white/[0.02] text-zinc-600 cursor-default"
                              : "border-white/[0.08] bg-[#232323] text-zinc-300 hover:border-emerald-500/40 hover:text-emerald-300 cursor-pointer"
                          }`}
                        >
                          + {key}
                        </button>
                      );
                    })}
                  </div>

                  {/* Optional Bulk Paste Area */}
                  {showBulkSpecs && (
                    <div className="rounded-xl bg-[#232323] border border-emerald-500/25 p-3 space-y-2">
                      <label className="text-[11px] font-medium text-emerald-300 block">
                        Paste specifications (one per line, formatted as Key: Value)
                      </label>
                      <textarea
                        rows={4}
                        value={bulkSpecsText}
                        onChange={(e) => setBulkSpecsText(e.target.value)}
                        placeholder={
                          "Lifting Capacity: 4,000 kg (4.0 Ton)\nMotor Power: 2.2 kW / 3.0 HP\nPower Supply: 380V 3-Phase / 50Hz\nWarranty: 24 months commercial warranty"
                        }
                        className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowBulkSpecs(false)}
                          className="text-[11px] text-zinc-400 hover:text-white px-2.5 py-1 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={applyBulkSpecs}
                          className="text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          Parse &amp; Add Rows
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Interactive Specification Rows */}
                  {productForm.specRows.length > 0 ? (
                    <div className="space-y-2">
                      {productForm.specRows.map((row, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            aria-label={`Specification name ${idx + 1}`}
                            value={row.key}
                            onChange={(e) => updateSpecRow(idx, "key", e.target.value)}
                            placeholder="Spec Name (e.g. Lifting Capacity)"
                            className="w-2/5 bg-[#232323] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[12px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <input
                            type="text"
                            aria-label={`Specification value ${idx + 1}`}
                            value={row.value}
                            onChange={(e) => updateSpecRow(idx, "value", e.target.value)}
                            placeholder="Spec Value (e.g. 4,000 kg / 380V)"
                            className="flex-1 bg-[#232323] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[12px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => moveSpecRow(idx, -1)}
                              disabled={idx === 0}
                              title="Move up"
                              className="h-7 w-7 rounded-md bg-[#232323] border border-white/[0.06] text-zinc-400 hover:text-white disabled:opacity-30 flex items-center justify-center cursor-pointer"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveSpecRow(idx, 1)}
                              disabled={idx === productForm.specRows.length - 1}
                              title="Move down"
                              className="h-7 w-7 rounded-md bg-[#232323] border border-white/[0.06] text-zinc-400 hover:text-white disabled:opacity-30 flex items-center justify-center cursor-pointer"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeSpecRow(idx)}
                              title="Remove row"
                              className="h-7 w-7 rounded-md bg-[#232323] border border-white/[0.06] text-zinc-400 hover:text-red-400 hover:border-red-500/30 flex items-center justify-center cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-zinc-500 italic py-1">
                      No custom technical specification rows yet. Click &ldquo;Add Spec Row&rdquo;
                      or pick a quick template above.
                    </p>
                  )}
                </div>

                {/* ── Section 3: Product Overview & Highlights (Shown SECOND on Product Page) ── */}
                <div className="bg-[#1c1c1c] border border-white/[0.08] rounded-xl p-4 space-y-3.5">
                  <div>
                    <h4 className="text-[12px] font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-emerald-400" />
                      <span>3. Product Overview &amp; Highlights</span>
                    </h4>
                    <p className="text-[10.5px] text-zinc-400 mt-0.5">
                      Displayed right below Technical Specifications on the storefront product page
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                      Detailed Product Overview *
                    </label>
                    <textarea
                      rows={4}
                      value={productForm.description}
                      onChange={(e) =>
                        setProductForm({ ...productForm, description: e.target.value })
                      }
                      placeholder="Describe the machine engineering, operational capabilities, safety systems, and commercial workshop use-cases..."
                      className="w-full bg-[#232323] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Key Engineering Highlights / Advantages */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-medium text-zinc-300 flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-emerald-400" />
                        <span>Key Engineering Highlights (Bullet List)</span>
                      </label>
                      <button
                        type="button"
                        onClick={addFeatureRow}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#232323] border border-white/[0.08] text-emerald-300 hover:border-emerald-500/40 transition-colors cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                        Add Highlight
                      </button>
                    </div>

                    {productForm.featureRows.length > 0 ? (
                      <div className="space-y-1.5">
                        {productForm.featureRows.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              aria-label={`Highlight ${idx + 1}`}
                              value={feat}
                              onChange={(e) => updateFeatureRow(idx, e.target.value)}
                              placeholder="e.g. Dual hydraulic synchronization cylinders with solenoid safety lock release"
                              className="flex-1 bg-[#232323] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[12px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <button
                              type="button"
                              onClick={() => removeFeatureRow(idx)}
                              title="Remove highlight"
                              className="h-7 w-7 rounded-md bg-[#232323] border border-white/[0.06] text-zinc-400 hover:text-red-400 flex items-center justify-center cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10.5px] text-zinc-500">
                        Optional bullet points shown under &ldquo;Key Engineering Highlights&rdquo;
                        inside Product Overview.
                      </p>
                    )}
                  </div>

                  {/* Workshop Compatibility / Fits */}
                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                      Workshop Compatibility / Applications (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={productForm.fitsText}
                      onChange={(e) => setProductForm({ ...productForm, fitsText: e.target.value })}
                      placeholder="e.g. Commercial Workshop Bay, Passenger Cars, SUVs & Light Vans"
                      className="w-full bg-[#232323] border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* ── Section 4: Product Image Selector ── */}
                <div className="bg-[#1c1c1c] border border-white/[0.08] rounded-xl p-4 space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                  <div className="flex items-center justify-between">
                    <label className="text-[12px] font-semibold text-zinc-200 flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
                      <span>4. Product Image</span>
                    </label>
                    <div className="flex items-center gap-1 bg-[#232323] p-0.5 rounded-lg border border-white/[0.06]">
                      <button
                        type="button"
                        onClick={() => setImageTab("presets")}
                        className={`text-[11px] font-medium px-2 py-1 rounded-md transition-all cursor-pointer ${
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
                        className={`text-[11px] font-medium px-2 py-1 rounded-md transition-all cursor-pointer ${
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
                        className={`text-[11px] font-medium px-2 py-1 rounded-md transition-all cursor-pointer ${
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
                        src={productForm.image || images.lift}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium text-white truncate">Selected Image</p>
                      <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                        {productForm.image?.startsWith("data:")
                          ? "Custom Uploaded File (Base64)"
                          : productForm.image?.slice(0, 60)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setImageTab("upload");
                        fileInputRef.current?.click();
                      }}
                      className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-md transition-colors shrink-0 cursor-pointer"
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
                          const isSelected = productForm.image === item.src;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setProductForm({ ...productForm, image: item.src })}
                              className={`group relative rounded-lg overflow-hidden border transition-all aspect-square bg-zinc-900 cursor-pointer ${
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
                              Uploading to server disk &amp; indexing in PostgreSQL...
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
                          value={productForm.image?.startsWith("data:") ? "" : productForm.image}
                          onChange={(e) =>
                            setProductForm({ ...productForm, image: e.target.value })
                          }
                          className="w-full bg-[#232323] border border-white/[0.08] rounded-lg pl-9 pr-3 py-2 text-[12px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <p className="text-[10px] text-zinc-500">
                        Paste any public image URL or cloud asset link
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={closeProductModal}
                  className="px-4 py-2 text-[13px] text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={createItemMutation.isPending || updateItemMutation.isPending}
                  onClick={handleSaveProductModal}
                  className="px-5 py-2 text-[13px] font-medium bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg transition-colors shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {(createItemMutation.isPending || updateItemMutation.isPending) && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  <span>
                    {productModalMode === "edit" ? "Save Product Changes" : "Create Product"}
                  </span>
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
              setShowQuoteModal(false);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}
