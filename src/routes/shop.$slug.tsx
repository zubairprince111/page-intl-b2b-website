import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowRight,
  Car,
  Check,
  CheckCircle2,
  FileSpreadsheet,
  Maximize2,
  Minus,
  Plus,
  Send,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/site/ProductCard";
import { products, getShopProducts, getProductBySlug, type Product } from "@/lib/data";
import { useCart } from "@/lib/cart";
import { useCreateQuote } from "@/lib/data-client";

export const Route = createFileRoute("/shop/$slug")({
  loader: ({ params }) => {
    const p = getProductBySlug(params.slug);
    if (!p) throw notFound();
    return { p };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Product Not Found — PAGE International" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { p } = loaderData;
    return {
      meta: [
        {
          title: `${p.name} (${p.sku}) — Technical Specifications | PAGE International`,
        },
        { name: "description", content: p.description },
        { property: "og:title", content: `${p.name} — PAGE International B2B` },
        { property: "og:description", content: p.description },
        { property: "og:type", content: "product" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: p.name,
            description: p.description,
            sku: p.sku,
            brand: {
              "@type": "Brand",
              name: p.brand,
            },
            offers: {
              "@type": "Offer",
              url: `https://page-bd.com/shop/${p.slug}`,
              priceCurrency: "BDT",
              price: p.price,
              availability:
                p.stock === "In stock"
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
              seller: {
                "@type": "Organization",
                name: "PAGE International Ltd.",
              },
            },
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-page py-40 text-center text-zinc-900">
      <h1 className="display-lg">Product Not Found</h1>
      <p className="mt-2 text-zinc-600">
        The equipment or spare part you requested is not in the active catalogue.
      </p>
      <Link to="/shop" className="btn btn-primary mt-6">
        Back to Products
      </Link>
    </div>
  ),
  component: ProductPage,
});

type TabType = "description" | "specs";

function ProductPage() {
  const { p } = Route.useLoaderData();
  const { add, vehicle, lines } = useCart();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<TabType>("description");
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteSent, setQuoteSent] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  // Define configurable options dynamically (pre-select first item as default)
  const voltageOptions = p.isEquipment
    ? [
        { id: "380v", label: "380V 3-Phase", desc: "Commercial High-Torque (Recommended)" },
        { id: "220v", label: "220V Single-Phase", desc: "Standard Workshop Supply" },
      ]
    : [{ id: "standard", label: "OEM Standard Spec", desc: "Factory Specification" }];

  const armOptions =
    p.isEquipment && p.slug.includes("lift")
      ? [
          { id: "standard", label: "Symmetric Telescopic Arms", desc: "Universal Workshop Fleet" },
          { id: "asymmetric", label: "Asymmetric + EV Bay Arms", desc: "Low-profile EV Clearance" },
        ]
      : [];

  // Default option state (always pre-selected so customer can add directly to cart)
  const [selectedVoltage, setSelectedVoltage] = useState(voltageOptions[0]?.id || "");
  const [selectedArmType, setSelectedArmType] = useState(armOptions[0]?.id || "standard");

  const inCart = lines.some((l) => l.slug === p.slug);
  const createQuoteMutation = useCreateQuote();

  // Quote Form State
  const [quoteData, setQuoteData] = useState({
    businessName: "",
    contactPerson: "",
    phone: "",
    email: "",
    businessType: "Workshop",
    quantity: String(qty),
    notes: "",
  });

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteData.businessName || !quoteData.phone) return;
    try {
      await createQuoteMutation.mutateAsync({
        companyName: quoteData.businessName,
        contactName: quoteData.contactPerson || quoteData.businessName,
        phone: quoteData.phone,
        email: quoteData.email || "inquiry@workshop.bd",
        productSlug: p.slug,
        productName: p.name,
        qty: Math.max(1, Number(quoteData.quantity) || 1),
        businessType: quoteData.businessType || "Workshop",
        city: "Dhaka",
        notes: quoteData.notes
          ? `${quoteData.notes} [Config: ${selectedVoltage.toUpperCase()} / ${selectedArmType}]`
          : `Config: ${selectedVoltage.toUpperCase()} / ${selectedArmType}`,
      });
    } catch (err) {
      console.error("Failed to add quotation from product page:", err);
    }
    setQuoteSent(true);
  };

  const out = p.stock === "Out of stock";
  const low = p.stock === "Low stock";

  // Gallery view configurations
  const galleryViews = useMemo(() => {
    return [
      { id: "main", label: "Front View", img: p.image },
      { id: "mechanism", label: "Hydraulic Core", img: p.image },
      { id: "safety", label: "Safety Lock", img: p.image },
      { id: "bay", label: "Workshop Scale", img: p.image },
    ];
  }, [p.image]);

  const activeImage = galleryViews[activeImageIndex]?.img || p.image;

  // Key Technical Highlights (First 4-5 specs for the right-hand highlight box)
  const quickHighlights = p.specs.slice(0, 4);

  // Related products from same category or complementary equipment
  const allCatalog = getShopProducts();
  const sameCategory = allCatalog.filter((x) => x.slug !== p.slug && x.category === p.category);
  const otherItems = allCatalog.filter((x) => x.slug !== p.slug && x.category !== p.category);
  const related = [...sameCategory, ...otherItems].slice(0, 4);

  // Vehicle compatibility match status
  const isVehicleCompatible = vehicle
    ? p.fits.some(
        (f) =>
          f.toLowerCase().includes(vehicle.model.toLowerCase()) ||
          f.toLowerCase().includes(vehicle.make.toLowerCase()) ||
          f.toLowerCase().includes("universal") ||
          f.toLowerCase().includes("most"),
      )
    : false;

  return (
    <div className="bg-white text-zinc-900 pt-20 lg:pt-24 min-h-screen selection:bg-primary selection:text-white">
      {/* ======================================================== */}
      {/* CLEAN MINIMALIST BREADCRUMBS                             */}
      {/* ======================================================== */}
      <div className="border-b border-zinc-200/80 bg-zinc-50/60 py-3">
        <nav
          aria-label="Breadcrumb"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-zinc-600 flex items-center gap-2 flex-wrap"
        >
          <Link to="/" className="hover:text-zinc-950 font-medium">
            Home
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-zinc-950 font-medium">
            Products
          </Link>
          <span>/</span>
          <Link
            to="/shop"
            search={{ cat: p.category }}
            className="hover:text-zinc-950 font-semibold text-zinc-900"
          >
            {p.category}
          </Link>
          <span>/</span>
          <span className="text-zinc-500 truncate max-w-sm">{p.name}</span>
        </nav>
      </div>

      {/* ======================================================== */}
      {/* MAIN TWO-COLUMN HERO SECTION (MINIMALIST & CLEAN)         */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ==================================================== */}
          {/* LEFT COLUMN: Clean Minimal Product Gallery Stage     */}
          {/* ==================================================== */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Image Stage - Edge-to-Edge Border Cover */}
            <div className="relative aspect-square w-full rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-xs group">
              {/* Minimal Platform Icon Badges */}
              <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5">
                {p.mobility?.includes("EV") && (
                  <span
                    className="grid h-7 w-7 place-items-center rounded-full bg-white/90 border border-white/60 text-emerald-600 shadow-xs backdrop-blur-md transition-all cursor-help"
                    title="EV Platform Compatible"
                    aria-label="EV Platform Compatible"
                  >
                    <Zap className="h-3.5 w-3.5 stroke-[1.75] fill-none" />
                  </span>
                )}
                {p.isEquipment ? (
                  <span
                    className="grid h-7 w-7 place-items-center rounded-full bg-white/90 border border-white/60 text-zinc-700 shadow-xs backdrop-blur-md transition-all cursor-help"
                    title="Garage Machinery Equipment"
                    aria-label="Garage Machinery Equipment"
                  >
                    <Wrench className="h-3.5 w-3.5 stroke-[1.75]" />
                  </span>
                ) : !p.mobility?.includes("EV") ? (
                  <span
                    className="grid h-7 w-7 place-items-center rounded-full bg-white/90 border border-white/60 text-primary shadow-xs backdrop-blur-md transition-all cursor-help"
                    title="OEM Genuine Replacement"
                    aria-label="OEM Genuine Replacement"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 stroke-[1.75]" />
                  </span>
                ) : null}
              </div>

              {/* Fullscreen Zoom Trigger */}
              <button
                type="button"
                onClick={() => setZoomOpen(true)}
                className="absolute top-3.5 right-3.5 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 hover:bg-white text-zinc-700 hover:text-zinc-950 shadow-sm border border-white/60 backdrop-blur-md transition-all cursor-pointer"
                title="View High-Resolution Gallery"
                aria-label="Expand image"
              >
                <Maximize2 className="h-4 w-4" />
              </button>

              {/* Product Visual - Full Border Cover */}
              <img
                src={activeImage}
                alt={p.name}
                width={700}
                height={700}
                className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Thumbnail Switcher (Clean, simple row) */}
            <div className="grid grid-cols-4 gap-3">
              {galleryViews.map((item, idx) => {
                const isActive = activeImageIndex === idx;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`aspect-square rounded-xl border overflow-hidden flex items-center justify-center transition-all bg-white cursor-pointer ${
                      isActive
                        ? "border-primary ring-2 ring-primary/20 shadow-xs"
                        : "border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    <img
                      src={item.img}
                      alt={item.label}
                      className="h-full w-full object-cover object-center"
                    />
                    <span className="sr-only">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ==================================================== */}
          {/* RIGHT COLUMN: Minimalist Product Details & Buy Block  */}
          {/* ==================================================== */}
          <div className="lg:col-span-6 flex flex-col space-y-5">
            {/* Brand, Category, SKU */}
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                <span className="text-primary font-bold">{p.brand}</span>
                <span>•</span>
                <span>{p.category}</span>
                <span>•</span>
                <span>SKU: {p.sku}</span>
              </div>

              {/* Title */}
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-zinc-950 mt-1.5 leading-tight">
                {p.name}
              </h1>

              {/* Compact Price / Quotation & Stock Status (TechDiversity clean style) */}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-zinc-600">
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-500">Price:</span>
                  <span className="font-medium text-zinc-900">Quotation on Request</span>
                  <span className="text-xs text-zinc-400 font-normal">(Pro-Forma B2B)</span>
                </div>
                <span className="text-zinc-300">|</span>
                <span
                  className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-xs ${
                    out ? "text-destructive" : low ? "text-amber-600" : "text-emerald-600"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      out ? "bg-destructive" : low ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                  />
                  {p.stock}
                </span>
                <span className="text-zinc-300">|</span>
                <span className="text-xs font-medium text-zinc-500">Dhaka Central Hub</span>
              </div>
            </div>

            {/* Quick Highlight Description on Side */}
            <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 sm:p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 mb-2.5">
                Key Technical Highlights:
              </h3>
              <ul className="space-y-2 text-sm text-zinc-700">
                {quickHighlights.map(([k, v]) => (
                  <li key={k} className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5">•</span>
                    <span>
                      <strong className="font-semibold text-zinc-950">{k}:</strong> {v}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Variant / Option Selectors (Customer can toggle, default pre-set) */}
            <div className="space-y-4 pt-1">
              {/* Option 1: Power & Voltage */}
              {voltageOptions.length > 1 ? (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">
                    <span>Power & Voltage Supply:</span>
                    <span className="text-primary font-mono lowercase font-semibold">
                      {voltageOptions.find((v) => v.id === selectedVoltage)?.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {voltageOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedVoltage(opt.id)}
                        className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                          selectedVoltage === opt.id
                            ? "border-zinc-950 bg-zinc-950 text-white shadow-xs"
                            : "border-zinc-300 bg-white text-zinc-800 hover:border-zinc-400"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-zinc-500 flex items-center gap-2">
                  <span className="font-semibold text-zinc-700">Specification:</span>
                  <span className="font-mono bg-zinc-100 px-2.5 py-1 rounded-md text-zinc-800">
                    {voltageOptions[0]?.label || "Standard"} (Default)
                  </span>
                </div>
              )}

              {/* Option 2: Arm / Carriage configuration (if applicable) */}
              {armOptions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">
                    <span>Lifting Arm Configuration:</span>
                    <span className="text-primary font-mono lowercase font-semibold">
                      {armOptions.find((a) => a.id === selectedArmType)?.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {armOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedArmType(opt.id)}
                        className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                          selectedArmType === opt.id
                            ? "border-zinc-950 bg-zinc-950 text-white shadow-xs"
                            : "border-zinc-300 bg-white text-zinc-800 hover:border-zinc-400"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Stepper + Add to Cart + Request Quote */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-3">
                {/* Stepper */}
                <div className="flex h-12 items-center rounded-xl border border-zinc-300 bg-white shadow-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    aria-label="Decrease quantity"
                    className="grid h-full w-10 place-items-center hover:bg-zinc-100 text-zinc-700 transition-colors rounded-l-xl cursor-pointer"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center font-bold font-mono text-sm text-zinc-950">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty(qty + 1)}
                    aria-label="Increase quantity"
                    className="grid h-full w-10 place-items-center hover:bg-zinc-100 text-zinc-700 transition-colors rounded-r-xl cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Add to RFQ Cart Button */}
                <button
                  type="button"
                  disabled={out}
                  onClick={() => add(p.slug, qty)}
                  className={`flex-1 h-12 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl shadow-xs transition-all cursor-pointer ${
                    inCart
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-primary text-white hover:bg-primary/90 shadow-sm active:scale-[0.99]"
                  }`}
                >
                  {inCart ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>In RFQ Cart</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Add to RFQ Cart</span>
                    </>
                  )}
                </button>
              </div>

              {/* Direct Request Quote Secondary Button */}
              <button
                type="button"
                onClick={() => setQuoteModalOpen(true)}
                className="w-full h-11 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4 text-primary" />
                <span>
                  Request Commercial Quotation ({qty} {qty === 1 ? "Unit" : "Units"})
                </span>
              </button>
            </div>

            {/* Minimal Guarantees */}
            <div className="pt-3 border-t border-zinc-200/80 grid grid-cols-3 gap-2 text-[11px] sm:text-xs text-zinc-600 font-medium text-center">
              <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-zinc-50">
                <span className="font-bold text-zinc-950">2–4 Days</span>
                <span>Fast Hub Dispatch</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-zinc-50">
                <span className="font-bold text-zinc-950">2-Year</span>
                <span>Parts Warranty</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-zinc-50">
                <span className="font-bold text-zinc-950">Certified</span>
                <span>CE European Standard</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* LOWER SECTION: FULL PRODUCT DETAILS & SPECS               */}
      {/* ======================================================== */}
      <section className="border-t border-zinc-200 bg-zinc-50/50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Clean Tab Switcher */}
          <div className="border-b border-zinc-200 mb-8 flex items-center gap-2 sm:gap-6 overflow-x-auto">
            {[
              { id: "description", label: "Product Overview" },
              { id: "specs", label: "Technical Specifications" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id as TabType)}
                className={`py-3 px-1 text-sm sm:text-base font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  tab === t.id
                    ? "border-primary text-primary"
                    : "border-transparent text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Description */}
          {tab === "description" && (
            <div className="max-w-4xl bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-xs space-y-5 text-sm sm:text-base text-zinc-700 leading-relaxed">
              <h3 className="text-lg font-bold text-zinc-950">Detailed Product Overview</h3>
              <p>{p.description}</p>
              <p>
                Supplied directly to professional automotive service centers, dealership workshops,
                and commercial fleet depots. Engineered for continuous operation with reinforced
                dual hydraulic lifting cylinders and precision synchronization cables.
              </p>
              <div className="pt-4 border-t border-zinc-100">
                <h4 className="font-bold text-zinc-950 text-sm uppercase tracking-wider mb-3">
                  Key Engineering Advantages:
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-zinc-700">
                  <li>
                    Reinforced dual-column laser cut structural steel with heavy-duty baseplates.
                  </li>
                  <li>
                    Electro-hydraulic synchronization ensuring smooth, level carriage movement.
                  </li>
                  <li>Integrated mechanical safety ladders with automatic solenoid release.</li>
                  <li>Tested to 115% dynamic load and 150% static structural benchmark.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab 2: Specs */}
          {tab === "specs" && (
            <div className="max-w-4xl bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
              <table className="w-full text-sm sm:text-base">
                <tbody className="divide-y divide-zinc-200">
                  {p.specs.map(([k, v], idx) => (
                    <tr key={k} className={idx % 2 === 0 ? "bg-white" : "bg-zinc-50/60"}>
                      <td className="w-1/3 py-3.5 px-6 font-bold text-zinc-800">{k}</td>
                      <td className="py-3.5 px-6 font-medium text-zinc-950">{v}</td>
                    </tr>
                  ))}
                  <tr className="bg-white">
                    <td className="py-3.5 px-6 font-bold text-zinc-800">Brand / Manufacturer</td>
                    <td className="py-3.5 px-6 font-medium text-zinc-950">{p.brand}</td>
                  </tr>
                  <tr className="bg-zinc-50/60">
                    <td className="py-3.5 px-6 font-bold text-zinc-800">Part / Model SKU</td>
                    <td className="py-3.5 px-6 font-mono font-medium text-zinc-950">{p.sku}</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="py-3.5 px-6 font-bold text-zinc-800">Selected Power Supply</td>
                    <td className="py-3.5 px-6 font-mono font-semibold text-primary">
                      {selectedVoltage === "380v"
                        ? "380V 3-Phase (Industrial)"
                        : "220V Single-Phase"}
                    </td>
                  </tr>
                  {armOptions.length > 0 && (
                    <tr className="bg-zinc-50/60">
                      <td className="py-3.5 px-6 font-bold text-zinc-800">Arm Configuration</td>
                      <td className="py-3.5 px-6 font-medium text-zinc-950">
                        {selectedArmType === "asymmetric"
                          ? "Asymmetric (EV Platform)"
                          : "Symmetric Telescopic"}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-white">
                    <td className="py-3.5 px-6 font-bold text-zinc-800">
                      Supported Vehicle Platforms
                    </td>
                    <td className="py-3.5 px-6 font-medium text-zinc-950">
                      {p.mobility.join(", ")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* RELATED WORKSHOP PRODUCTS                                 */}
      {/* ======================================================== */}
      <section className="bg-white py-12 sm:py-16 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                Complementary Workshop Equipment
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 mt-1">
                Related Equipment & Spare Parts
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1.5"
            >
              <span>View All Products</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.slug} p={r} />
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* FULLSCREEN IMAGE LIGHTBOX MODAL                           */}
      {/* ======================================================== */}
      {zoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-zinc-950 p-6 sm:p-10 text-white shadow-2xl">
            <button
              onClick={() => setZoomOpen(false)}
              aria-label="Close high-res view"
              className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="text-center mb-4">
              <h3 className="font-display text-2xl uppercase tracking-wide">{p.name}</h3>
              <p className="text-xs text-white/60">
                {p.brand} · SKU: {p.sku}
              </p>
            </div>
            <div className="relative aspect-square sm:aspect-16/10 max-h-[65vh] w-full flex items-center justify-center p-4">
              <img
                src={activeImage}
                alt={p.name}
                className="max-h-full max-w-full object-contain rounded-xl"
              />
            </div>
            <div className="mt-4 flex justify-center gap-3">
              {galleryViews.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? "bg-primary text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* QUICK B2B QUOTE MODAL                                    */}
      {/* ======================================================== */}
      {quoteModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-lg rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-2xl sm:p-8">
            <button
              onClick={() => {
                setQuoteModalOpen(false);
                setQuoteSent(false);
              }}
              aria-label="Close modal"
              className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {quoteSent ? (
              <div className="py-8 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 mb-4">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-zinc-950">
                  Quotation Request Sent
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 mt-2 max-w-sm mx-auto leading-relaxed">
                  Thank you! Our B2B commercial equipment desk has registered your request for{" "}
                  <strong>{p.name}</strong>. A pro-forma quote with tax and delivery schedule will
                  be provided within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setQuoteModalOpen(false);
                    setQuoteSent(false);
                  }}
                  className="btn btn-primary h-11 px-8 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl mt-6 cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} className="space-y-4">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                    B2B Commercial Procurement
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-zinc-950 mt-1">
                    Request Quote: {p.name}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Model: <span className="font-mono font-semibold">{p.sku}</span> · Brand:{" "}
                    <span className="font-semibold">{p.brand}</span> · Config:{" "}
                    <span className="font-mono font-semibold text-primary">
                      {selectedVoltage.toUpperCase()}
                    </span>
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                      Business / Garage Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Dhaka Auto Tech Ltd."
                      className="field text-sm rounded-xl h-11 px-3.5"
                      value={quoteData.businessName}
                      onChange={(e) => setQuoteData({ ...quoteData, businessName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      placeholder="Name"
                      className="field text-sm rounded-xl h-11 px-3.5"
                      value={quoteData.contactPerson}
                      onChange={(e) =>
                        setQuoteData({ ...quoteData, contactPerson: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                      Phone / WhatsApp *
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="+880 17XXXXXXXX"
                      className="field text-sm rounded-xl h-11 px-3.5"
                      value={quoteData.phone}
                      onChange={(e) => setQuoteData({ ...quoteData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                      Business Email
                    </label>
                    <input
                      type="email"
                      placeholder="procurement@workshop.com"
                      className="field text-sm rounded-xl h-11 px-3.5"
                      value={quoteData.email}
                      onChange={(e) => setQuoteData({ ...quoteData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                      Business Type
                    </label>
                    <select
                      className="field text-sm rounded-xl h-11 px-3.5"
                      value={quoteData.businessType}
                      onChange={(e) => setQuoteData({ ...quoteData, businessType: e.target.value })}
                    >
                      <option value="Workshop">Independent Workshop</option>
                      <option value="Service Center">Service Center Hub</option>
                      <option value="Dealership">Dealership Workshop</option>
                      <option value="Distributor">Wholesale Distributor</option>
                      <option value="Fleet">Commercial Fleet Operator</option>
                      <option value="EV Business">EV Workshop / Specialized</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                      Quantity Required
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1 unit / 5 sets"
                      className="field text-sm rounded-xl h-11 px-3.5"
                      value={quoteData.quantity}
                      onChange={(e) => setQuoteData({ ...quoteData, quantity: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                    Bay Specifications / Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Bay dimensions, ceiling height, or power availability..."
                    className="field text-sm rounded-xl p-3 min-h-[72px]"
                    value={quoteData.notes}
                    onChange={(e) => setQuoteData({ ...quoteData, notes: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary h-12 w-full text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl cursor-pointer shadow-sm hover:shadow transition-all"
                >
                  <Send className="h-4 w-4" />
                  <span>Send Quotation Request</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
