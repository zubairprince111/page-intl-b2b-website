import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardList,
  FileSpreadsheet,
  FileText,
  Minus,
  Plus,
  ZoomIn,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductImageZoomModal } from "@/components/site/ProductImageZoomModal";
import { QuoteModal } from "@/components/site/QuoteModal";
import { products, getProductBySlug, type Product } from "@/lib/data";
import { computeHoverOriginPercent, normalizeProductGalleryImages } from "@/lib/image-zoom";
import {
  buildProductJsonLdOffers,
  getDefaultProductPresentation,
  getDistinctProductFeatures,
  hasProductWarranty,
  normalizeStorefrontPriceLabel,
  sanitizeGuaranteeBadges,
  sanitizeHighlightTuples,
  sanitizeVariantGroups,
  type ProductVariantGroup,
} from "@/lib/product-utils";
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
            offers: buildProductJsonLdOffers(p),
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

export function ProductPage() {
  const { p: initialProduct, initialCatalog } = Route.useLoaderData();
  const { data: liveProduct } = useProductBySlug(initialProduct.slug, initialProduct);
  const { data: liveCatalog } = useCatalogProducts(initialCatalog);
  const p = liveProduct || initialProduct;

  const { add, vehicle, lines } = useCart();
  const [qty, setQty] = useState(1);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [isInlineZooming, setIsInlineZooming] = useState(false);
  const [inlineHoverOrigin, setInlineHoverOrigin] = useState({ x: 50, y: 50 });

  const presentationDefaults = useMemo(
    () =>
      getDefaultProductPresentation({
        slug: p.slug,
        category: p.category,
        isEquipment: Boolean(p.isEquipment),
        requiresQuote: Boolean(p.requiresQuote),
        specs: p.specs,
      }),
    [p.slug, p.category, p.isEquipment, p.requiresQuote, p.specs],
  );

  const effectiveHighlights = useMemo(
    () =>
      p.highlights !== undefined
        ? sanitizeHighlightTuples(p.highlights)
        : presentationDefaults.highlights,
    [p.highlights, presentationDefaults.highlights],
  );

  const effectiveVariantGroups = useMemo(
    () =>
      p.variantOptions !== undefined
        ? sanitizeVariantGroups(p.variantOptions)
        : presentationDefaults.variantOptions,
    [p.variantOptions, presentationDefaults.variantOptions],
  );

  const effectiveGuarantees = useMemo(
    () =>
      p.guarantees !== undefined
        ? sanitizeGuaranteeBadges(p.guarantees)
        : presentationDefaults.guarantees,
    [p.guarantees, presentationDefaults.guarantees],
  );

  const effectiveHub =
    p.dispatchHub !== undefined ? p.dispatchHub.trim() : presentationDefaults.dispatchHub;
  const effectivePriceLabel = normalizeStorefrontPriceLabel(
    p.priceLabel !== undefined ? p.priceLabel : presentationDefaults.priceLabel,
  );
  const productHasWarranty = hasProductWarranty({
    guarantees: effectiveGuarantees,
    specs: p.specs,
  });

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  useEffect(() => {
    setQty(1);
    setActiveImageIndex(0);
    setQuoteModalOpen(false);
    setZoomOpen(false);
    setIsInlineZooming(false);
    setSelectedOptions({});
  }, [p.slug]);

  const getActiveOption = (group: ProductVariantGroup): string => {
    const chosen = selectedOptions[group.name];
    if (chosen && group.options.includes(chosen)) return chosen;
    return group.options[0] || "";
  };

  const inCart = lines.some((l) => l.slug === p.slug);

  const out = p.stock === "Out of stock";
  const low = p.stock === "Low stock";

  // Gallery view configurations
  const galleryViews = useMemo(
    () => normalizeProductGalleryImages({ image: p.image, images: p.images }),
    [p.images, p.image],
  );

  const activeImage = galleryViews[activeImageIndex]?.img || p.image;

  // Distinct key engineering advantages/features for the Overview section
  const distinctFeatures = useMemo(
    () => getDistinctProductFeatures(p.features, p.fits),
    [p.features, p.fits],
  );

  // Technical spec rows (merge product specs + selected variants + canonical catalog metadata)
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
    for (const group of effectiveVariantGroups) {
      const chosen = selectedOptions[group.name];
      const activeChoice = chosen && group.options.includes(chosen) ? chosen : group.options[0];
      if (activeChoice) {
        appendIfMissing(group.name, activeChoice);
      }
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
    p.mobility,
    p.stock,
    effectiveVariantGroups,
    selectedOptions,
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
    <div className="bg-white text-zinc-900 pt-16 lg:pt-[4.25rem] min-h-screen selection:bg-primary selection:text-white">
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
            {/* Main Image Stage - Edge-to-Edge Border Cover with Hover Inspect & Zoom View */}
            <div className="relative aspect-square w-full rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-xs group">
              {/* Clickable Product Image with Desktop Cursor-Tracked Hover Zoom */}
              <button
                type="button"
                onClick={() => {
                  setIsInlineZooming(false);
                  setZoomOpen(true);
                }}
                onPointerEnter={(e) => {
                  if (e.pointerType !== "mouse") return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  setInlineHoverOrigin(
                    computeHoverOriginPercent({
                      clientX: e.clientX,
                      clientY: e.clientY,
                      rect,
                    }),
                  );
                  setIsInlineZooming(true);
                }}
                onPointerMove={(e) => {
                  if (e.pointerType !== "mouse") return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  setInlineHoverOrigin(
                    computeHoverOriginPercent({
                      clientX: e.clientX,
                      clientY: e.clientY,
                      rect,
                    }),
                  );
                  if (!isInlineZooming) {
                    setIsInlineZooming(true);
                  }
                }}
                onPointerLeave={() => setIsInlineZooming(false)}
                aria-label={`Inspect and zoom ${p.name}`}
                className="block h-full w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <img
                  src={activeImage}
                  alt={p.name}
                  width={700}
                  height={700}
                  style={
                    isInlineZooming
                      ? {
                          transformOrigin: `${inlineHoverOrigin.x}% ${inlineHoverOrigin.y}%`,
                          transform: "scale(1.85)",
                        }
                      : undefined
                  }
                  className="h-full w-full object-cover object-center transition-transform duration-150 ease-out will-change-transform"
                />
              </button>

              {/* Subtle Desktop Inspection Hint */}
              <span
                className={`pointer-events-none hidden sm:inline-flex items-center gap-1.5 absolute bottom-3 right-3 rounded-full bg-zinc-950/65 text-white/90 px-2.5 py-1 text-[10.5px] font-medium backdrop-blur-sm transition-opacity duration-200 ${
                  isInlineZooming ? "opacity-0" : "opacity-85"
                }`}
              >
                <ZoomIn className="h-3 w-3" />
                <span>Hover to inspect · Click to zoom</span>
              </span>
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
                      className={`aspect-square rounded-xl border overflow-hidden flex items-center justify-center transition-all bg-white cursor-pointer ${isActive
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

              {/* Compact Price / Quotation & Stock Status */}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-zinc-600">
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-500">Price:</span>
                  <span className="font-medium text-zinc-900">Quotation on Request</span>
                  {effectivePriceLabel && (
                    <span className="text-xs text-zinc-400 font-normal">
                      ({effectivePriceLabel})
                    </span>
                  )}
                </div>
                <span className="text-zinc-300">|</span>
                <span
                  className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-xs ${out ? "text-destructive" : low ? "text-amber-600" : "text-emerald-600"
                    }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${out ? "bg-destructive" : low ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                  />
                  {p.stock}
                </span>
                {effectiveHub && (
                  <>
                    <span className="text-zinc-300">|</span>
                    <span className="text-xs font-medium text-zinc-500">{effectiveHub}</span>
                  </>
                )}
              </div>
            </div>

            {/* Key Technical Highlights (Configurable per product) */}
            {effectiveHighlights.length > 0 ? (
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
                <ul className="space-y-2 text-sm text-zinc-700">
                  {effectiveHighlights.map(([k, v], idx) => (
                    <li key={`${k}-${idx}`} className="flex items-start gap-2">
                      <span className="text-primary font-bold mt-0.5">•</span>
                      <span>
                        {k && v ? (
                          <>
                            <strong className="font-semibold text-zinc-950">{k}:</strong> {v}
                          </>
                        ) : (
                          <span className="font-medium text-zinc-900">{k || v}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : isVehicleCompatible && vehicle ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-2.5 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-emerald-800">
                  Verified Workshop Match
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-white border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Fits {vehicle.make} {vehicle.model}
                </span>
              </div>
            ) : null}

            {/* Configurable Variant / Option Selectors (Shown only when configured for this product) */}
            {effectiveVariantGroups.length > 0 && (
              <div className="space-y-4 pt-1">
                {effectiveVariantGroups.map((group) => {
                  const activeChoice = getActiveOption(group);
                  return (
                    <div key={group.name}>
                      <div className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">
                        {group.name}:
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {group.options.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() =>
                              setSelectedOptions((prev) => ({
                                ...prev,
                                [group.name]: opt,
                              }))
                            }
                            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${activeChoice === opt
                              ? "border-zinc-950 bg-zinc-950 text-white shadow-xs"
                              : "border-zinc-300 bg-white text-zinc-800 hover:border-zinc-400"
                              }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

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
                  className={`flex-1 h-12 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl shadow-xs transition-all cursor-pointer ${inCart
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

            {/* Configurable Warranty, Dispatch & Certification Badges */}
            {effectiveGuarantees.length > 0 && (
              <div
                className={`pt-3 border-t border-zinc-200/80 grid gap-2 text-[11px] sm:text-xs text-zinc-600 font-medium text-center ${effectiveGuarantees.length === 1
                  ? "grid-cols-1"
                  : effectiveGuarantees.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-3"
                  }`}
              >
                {effectiveGuarantees.map((badge, idx) => (
                  <div
                    key={`${badge.title}-${badge.subtitle}-${idx}`}
                    className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-zinc-50"
                  >
                    {badge.title && <span className="font-bold text-zinc-950">{badge.title}</span>}
                    {badge.subtitle && <span>{badge.subtitle}</span>}
                  </div>
                ))}
              </div>
            )}
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
                        className={`py-3.5 px-5 sm:px-6 font-medium ${isMono ? "font-mono text-zinc-950" : "text-zinc-950"
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
                workshops, and commercial fleet depots{" "}
                {productHasWarranty && p.isEquipment
                  ? "with factory-backed warranty coverage and technical commissioning support"
                  : productHasWarranty
                    ? "with factory-backed warranty coverage"
                    : p.isEquipment
                      ? "with technical commissioning support"
                      : "with verified OEM specification assurance"}{" "}
                {effectiveHub ? `from our ${effectiveHub}` : "across Bangladesh"}.
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
              ) : p.slug === "heavy-duty-2-post-lift-4t" ? (
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
                        : "Genuine commercial automotive component supplied for reliable fleet and workshop service."}
                    </li>
                    <li>
                      Verified quality compliance supported by PAGE International technical
                      specialists.
                    </li>
                    <li>
                      Available for B2B wholesale pricing, VAT commercial invoicing, and{" "}
                      {effectiveHub ? `dispatch from ${effectiveHub}` : "nationwide fleet delivery"}.
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
      {/* INTERACTIVE FULLSCREEN IMAGE ZOOM VIEWER MODAL            */}
      {/* ======================================================== */}
      <ProductImageZoomModal
        open={zoomOpen}
        onOpenChange={setZoomOpen}
        productName={p.name}
        brand={p.brand}
        sku={p.sku}
        images={galleryViews}
        activeIndex={activeImageIndex}
        onActiveIndexChange={setActiveImageIndex}
      />

      {/* ======================================================== */}
      {/* QUICK B2B QUOTE MODAL (EMAIL OTP VERIFICATION)           */}
      {/* ======================================================== */}
      {quoteModalOpen && <QuoteModal product={p} onClose={() => setQuoteModalOpen(false)} />}
    </div>
  );
}
