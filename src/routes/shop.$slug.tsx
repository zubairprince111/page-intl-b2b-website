import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardList,
  FileSpreadsheet,
  FileText,
  Maximize2,
  Minus,
  Plus,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/site/ProductCard";
import { QuoteModal } from "@/components/site/QuoteModal";
import { products, getProductBySlug, type Product } from "@/lib/data";
import { getDistinctProductFeatures } from "@/lib/product-utils";
import { getProductBySlugServerFn, listCatalogProductsServerFn } from "@/lib/server-functions";
import { useCatalogProducts, useProductBySlug } from "@/lib/data-client";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/shop/$slug")({
  loader: async ({ params }) => {
    let p: Product | null = null;
    let initialCatalog: Product[] = products;
    try {
      const [loadedProduct, loadedCatalog] = await Promise.all([
        getProductBySlugServerFn({ data: { slug: params.slug } }),
        listCatalogProductsServerFn(),
      ]);
      p = loadedProduct;
      if (loadedCatalog && loadedCatalog.length > 0) {
        initialCatalog = loadedCatalog;
      }
    } catch {
      p = getProductBySlug(params.slug) || null;
    }
    if (!p) throw notFound();
    return { p, initialCatalog };
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

function ProductPage() {
  const { p: initialProduct, initialCatalog } = Route.useLoaderData();
  const { data: liveProduct } = useProductBySlug(initialProduct.slug, initialProduct);
  const { data: liveCatalog } = useCatalogProducts(initialCatalog);
  const p = liveProduct || initialProduct;

  const { add, vehicle, lines } = useCart();
  const [qty, setQty] = useState(1);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
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

  const out = p.stock === "Out of stock";
  const low = p.stock === "Low stock";

  // Gallery view configurations
  const galleryViews = useMemo(() => {
    const rawList = p.images && p.images.length > 0 ? p.images : [p.image];
    const unique = Array.from(new Set(rawList.filter(Boolean)));
    const sourceImages = unique.length > 0 ? unique : [p.image];
    return sourceImages.map((img, idx) => ({
      id: `view-${idx}`,
      label: idx === 0 ? "Primary View" : `Detail View ${idx + 1}`,
      img,
    }));
  }, [p.images, p.image]);

  const activeImage = galleryViews[activeImageIndex]?.img || p.image;

  // Key Technical Highlights (First 4 specs for the right-hand highlight box)
  const quickHighlights = p.specs.slice(0, 4);

  // Distinct key engineering advantages/features for the Overview section
  const distinctFeatures = useMemo(
    () => getDistinctProductFeatures(p.features, p.fits),
    [p.features, p.fits],
  );

  // Technical spec rows (merge product specs + canonical catalog metadata without duplicate keys)
  const fullTechnicalSpecRows = useMemo(() => {
    const existingKeys = new Set(p.specs.map(([k]) => k.trim().toLowerCase()));
    const rows: [string, string, boolean?][] = p.specs.map(([k, v]) => [k, v, false]);

    const appendIfMissing = (label: string, val: string | undefined, mono = false) => {
      if (!val || !val.trim()) return;
      if (existingKeys.has(label.toLowerCase())) return;
      rows.push([label, val, mono]);
    };

    appendIfMissing("Brand / Manufacturer", p.brand);
    appendIfMissing("Part / Model SKU", p.sku, true);
    appendIfMissing("Category", p.category);
    if (voltageOptions.length > 1 || p.isEquipment) {
      appendIfMissing(
        "Power Supply",
        selectedVoltage === "380v" ? "380V 3-Phase (Industrial)" : "220V Single-Phase",
        true,
      );
    }
    if (armOptions.length > 0) {
      appendIfMissing(
        "Arm Configuration",
        selectedArmType === "asymmetric" ? "Asymmetric (EV Platform)" : "Symmetric Telescopic",
      );
    }
    if (p.mobility && p.mobility.length > 0) {
      appendIfMissing("Supported Vehicle Platforms", p.mobility.join(", "));
    }
    appendIfMissing("Availability", p.stock);

    return rows;
  }, [
    p.specs,
    p.brand,
    p.sku,
    p.category,
    p.isEquipment,
    p.mobility,
    p.stock,
    voltageOptions.length,
    selectedVoltage,
    armOptions.length,
    selectedArmType,
  ]);

  // Related products from same category or complementary equipment
  const allCatalog = liveCatalog && liveCatalog.length > 0 ? liveCatalog : initialCatalog;
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

            {/* Thumbnail Switcher (Shown when product has multiple gallery images) */}
            {galleryViews.length > 1 && (
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
            )}
          </div>

          {/* ==================================================== */}
          {/* RIGHT COLUMN: Minimalist Product Details & Buy Block  */}
          {/* ==================================================== */}
          <div className="lg:col-span-6 flex flex-col space-y-5">
            {/* Title & Status */}
            <div>
              {/* Title */}
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-zinc-950 leading-tight">
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
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                  Key Technical Highlights
                </h3>
                {isVehicleCompatible && vehicle && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Fits {vehicle.make} {vehicle.model}
                  </span>
                )}
              </div>
              {quickHighlights.length > 0 ? (
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
              ) : (
                <p className="text-sm text-zinc-700 leading-relaxed line-clamp-3">
                  {p.description}
                </p>
              )}
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
      {/* LOWER SECTION: TECHNICAL SPECIFICATIONS -> PRODUCT OVERVIEW */}
      {/* ======================================================== */}
      <section className="border-t border-zinc-200 bg-zinc-50/50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* 1. TECHNICAL SPECIFICATIONS (FIRST) */}
          <div id="technical-specifications" className="scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <ClipboardList className="h-3.5 w-3.5" />
                  <span>Engineering Datasheet</span>
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 mt-1">
                  Technical Specifications
                </h2>
              </div>
              <a
                href="#product-overview"
                className="text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-primary transition-colors self-start sm:self-auto"
              >
                Skip to Product Overview ↓
              </a>
            </div>

            <div className="max-w-5xl bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
              <table className="w-full text-sm sm:text-base">
                <tbody className="divide-y divide-zinc-200">
                  {fullTechnicalSpecRows.map(([k, v, isMono], idx) => (
                    <tr
                      key={`${k}-${idx}`}
                      className={idx % 2 === 0 ? "bg-white" : "bg-zinc-50/60"}
                    >
                      <td className="w-2/5 sm:w-1/3 py-3.5 px-5 sm:px-6 font-bold text-zinc-800 align-top">
                        {k}
                      </td>
                      <td
                        className={`py-3.5 px-5 sm:px-6 font-medium ${
                          isMono ? "font-mono text-zinc-950" : "text-zinc-950"
                        }`}
                      >
                        {v}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. PRODUCT OVERVIEW (SECOND — ON THE SAME PAGE) */}
          <div id="product-overview" className="scroll-mt-24">
            <div className="mb-5">
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                <span>System Architecture &amp; Applications</span>
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 mt-1">
                Product Overview
              </h2>
            </div>

            <div className="max-w-5xl bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-xs space-y-6 text-sm sm:text-base text-zinc-700 leading-relaxed">
              <p className="whitespace-pre-line text-zinc-800">{p.description}</p>

              <p className="text-zinc-600">
                Supplied directly by PAGE International to automotive service centers, dealership
                workshops, and commercial fleet depots with factory-backed warranty coverage and
                technical commissioning support from our Dhaka Central Hub.
              </p>

              {distinctFeatures.length > 0 ? (
                <div className="pt-5 border-t border-zinc-100">
                  <h3 className="font-bold text-zinc-950 text-sm uppercase tracking-wider mb-3">
                    Key Engineering Highlights
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-zinc-700">
                    {distinctFeatures.map((feat, idx) => (
                      <li key={idx}>{feat}</li>
                    ))}
                  </ul>
                </div>
              ) : p.slug.includes("lift") ? (
                <div className="pt-5 border-t border-zinc-100">
                  <h3 className="font-bold text-zinc-950 text-sm uppercase tracking-wider mb-3">
                    Key Engineering Advantages
                  </h3>
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
              ) : (
                <div className="pt-5 border-t border-zinc-100">
                  <h3 className="font-bold text-zinc-950 text-sm uppercase tracking-wider mb-3">
                    Commercial B2B Highlights
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-zinc-700">
                    <li>
                      {p.isEquipment
                        ? "Industrial-grade workshop machinery engineered for continuous daily bay throughput."
                        : "Certified OEM-spec commercial replacement part built for extended fleet durability."}
                    </li>
                    <li>
                      Verified quality compliance supported by PAGE International technical
                      specialists.
                    </li>
                    <li>
                      Available for B2B wholesale pricing, VAT commercial invoicing, and nationwide
                      delivery from Dhaka.
                    </li>
                  </ul>
                </div>
              )}

              {p.fits && p.fits.length > 0 && (
                <div className="pt-5 border-t border-zinc-100">
                  <h3 className="font-bold text-zinc-950 text-sm uppercase tracking-wider mb-3">
                    Workshop Compatibility &amp; Applications
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {p.fits.map((fit, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-800"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{fit}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
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
            {galleryViews.length > 1 && (
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
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* QUICK B2B QUOTE MODAL (EMAIL OTP VERIFICATION)           */}
      {/* ======================================================== */}
      {quoteModalOpen && <QuoteModal product={p} onClose={() => setQuoteModalOpen(false)} />}
    </div>
  );
}
