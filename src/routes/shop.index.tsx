import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bike,
  Car,
  Check,
  ChevronDown,
  FileSpreadsheet,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Truck,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { ProductCard } from "@/components/site/ProductCard";
import { cn } from "@/lib/utils";
import { QuoteModal } from "@/components/site/QuoteModal";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  brands,
  categories,
  mobilitySegments,
  products,
  getShopProducts,
  type MobilityType,
  type Product,
} from "@/lib/data";
import { useCart } from "@/lib/cart";

type S = {
  q?: string | undefined;
  cat?: string | undefined;
  vehicle?: string | undefined;
  brand?: string | undefined;
  type?: string | undefined;
  mobility?: string | undefined;
};

export const Route = createFileRoute("/shop/")({
  validateSearch: (s: Record<string, unknown>): S => ({
    q: typeof s["q"] === "string" ? (s["q"] as string) : undefined,
    cat: typeof s["cat"] === "string" ? (s["cat"] as string) : undefined,
    vehicle: typeof s["vehicle"] === "string" ? (s["vehicle"] as string) : undefined,
    brand: typeof s["brand"] === "string" ? (s["brand"] as string) : undefined,
    type: typeof s["type"] === "string" ? (s["type"] as string) : undefined,
    mobility: typeof s["mobility"] === "string" ? (s["mobility"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      {
        title: "B2B Automotive Equipment & Parts Shop — PAGE International",
      },
      {
        name: "description",
        content:
          "Buy vehicle lifts, diagnostic tools, 4W, 2W, 3W and EV equipment, brake parts, batteries, synthetic oils and workshop machinery with verified compatibility.",
      },
      {
        property: "og:title",
        content: "Shop Automotive Equipment & Parts — PAGE International",
      },
      {
        property: "og:description",
        content: "Commercial automotive B2B catalog with 4W, 2W, 3W & EV mobility platforms.",
      },
    ],
  }),
  component: Shop,
});

export function Shop() {
  const {
    q = "",
    cat,
    vehicle,
    brand: searchBrand,
    type: searchType,
    mobility: searchMobility,
  } = Route.useSearch();
  const nav = Route.useNavigate();
  const { vehicle: savedVehicle } = useCart();

  const [query, setQuery] = useState(q);
  const [inStock, setInStock] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string>(searchBrand ?? "");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [activeQuoteProduct, setActiveQuoteProduct] = useState<Product | null>(null);

  // Live products list: seamlessly pulls admin additions from localStorage
  const [allProducts, setAllProducts] = useState<Product[]>(() => getShopProducts());

  useEffect(() => {
    setAllProducts(getShopProducts());

    function onInventoryChange() {
      setAllProducts(getShopProducts());
    }

    window.addEventListener("inventory_updated", onInventoryChange);
    window.addEventListener("storage", onInventoryChange);
    return () => {
      window.removeEventListener("inventory_updated", onInventoryChange);
      window.removeEventListener("storage", onInventoryChange);
    };
  }, []);

  // Filter application
  const filteredList = useMemo(() => {
    return allProducts.filter((p) => {
      // Mobility Platform filter (4-Wheeler, 2-Wheeler, 3-Wheeler, EV)
      if (searchMobility && searchMobility !== "All") {
        if (!p.mobility.includes(searchMobility as MobilityType)) return false;
      }

      // Category filter
      if (cat && p.category !== cat) return false;

      // Search query filter (matches name, brand, category, SKU, description)
      if (
        q &&
        !`${p.name} ${p.brand} ${p.category} ${p.sku} ${p.description} ${p.mobility.join(" ")}`
          .toLowerCase()
          .includes(q.toLowerCase())
      ) {
        return false;
      }

      // Brand filter
      if (selectedBrand && p.brand !== selectedBrand) return false;

      // Stock filter
      if (inStock && p.stock === "Out of stock") return false;

      // Product Type filter (Equipment vs Parts)
      if (searchType === "equipment" && !p.isEquipment) return false;
      if (searchType === "parts" && p.isEquipment) return false;

      // Vehicle compatibility filter
      if (vehicle) {
        const v = vehicle.split(" ")[1]?.toLowerCase() || vehicle.toLowerCase();
        const matchesFit = p.fits.some(
          (f) =>
            f.toLowerCase().includes(v) ||
            f.toLowerCase().includes("universal") ||
            f.toLowerCase().includes("most"),
        );
        if (!matchesFit) return false;
      }

      return true;
    });
  }, [allProducts, q, cat, vehicle, selectedBrand, inStock, searchType, searchMobility]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nav({
      search: (s: S) => ({ ...s, q: query.trim() || undefined }),
    });
  };

  const handleClearAll = () => {
    setQuery("");
    setSelectedBrand("");
    setInStock(false);
    nav({
      search: () => ({}),
    });
  };

  const activeFiltersCount = [
    searchMobility,
    cat,
    vehicle,
    selectedBrand,
    searchType,
    inStock ? "1" : "",
    q,
  ].filter(Boolean).length;

  return (
    <div className="bg-white text-zinc-900 min-h-screen">
      {/* Search Bar & Video Section */}
      <section className="pt-20 sm:pt-24 pb-2 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-4 sm:space-y-5">
        <h1 className="sr-only">
          {cat
            ? `${cat} — Automotive Equipment & Spare Parts`
            : "Automotive Equipment & Spare Parts"}
        </h1>

        {/* Centered Search Bar: Under the navbar, above the video */}
        <div className="flex justify-center w-full pt-1 sm:pt-2">
          <form onSubmit={handleSearchSubmit} className="w-full max-w-xl sm:max-w-2xl">
            <div className="relative flex items-center">
              <input
                id="shop-q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search equipment, SKU, brand, or parts..."
                className="w-full h-11 sm:h-12 pl-11 pr-24 rounded-2xl bg-white border border-zinc-300 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all shadow-sm hover:border-zinc-400"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 sm:h-9 px-4 sm:px-5 rounded-xl bg-primary text-white text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Hero Video Banner Card */}
        <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-200 shadow-md ring-1 ring-black/5">
          <div className="relative w-full h-40 sm:h-48 md:h-56 lg:h-64 max-h-[265px] flex items-center justify-center bg-black overflow-hidden">
            <video
              src="/1013.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover object-center pointer-events-none"
            />
          </div>
        </div>
      </section>

      {/* Main Shop Container */}
      <section className="container-page py-6 sm:py-8 lg:py-10">
        {/* Mobile Filter Toggle */}
        <div className="mb-4 lg:hidden">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="w-full h-9 px-3.5 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-foreground flex items-center justify-center gap-1.5 shadow-xs cursor-pointer hover:bg-secondary/50 transition-colors"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
            <span>Filters</span>
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
          {/* ======================================================== */}
          {/* LEFT: ULTRA-COMPACT B2B CATALOGUE FILTERS                */}
          {/* ======================================================== */}
          <aside className="hidden lg:block">
            {/* Fits 100% On Screen Without Scrolling */}
            <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-4 shadow-xs space-y-3.5 sticky top-24">
              {/* Header: Title + Reset */}
              <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                  Filters
                </span>
                {(cat ||
                  vehicle ||
                  selectedBrand ||
                  q ||
                  inStock ||
                  searchType ||
                  searchMobility) && (
                  <button
                    onClick={handleClearAll}
                    className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" /> Reset
                  </button>
                )}
              </div>

              {/* 1. Availability Switch (Modern Toggle) */}
              <div className="flex items-center justify-between py-1 px-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800">
                <span className="text-xs font-semibold text-foreground">In Stock Only</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={inStock}
                  onClick={() => setInStock(!inStock)}
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    inStock ? "bg-primary" : "bg-zinc-300 dark:bg-zinc-700",
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out",
                      inStock ? "translate-x-4" : "translate-x-0",
                    )}
                  />
                </button>
              </div>

              {/* 2. Vehicle Platform (Compact 4-Column Row) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Platform
                  </span>
                  {searchMobility && (
                    <button
                      onClick={() => nav({ search: (s: S) => ({ ...s, mobility: undefined }) })}
                      className="text-[10px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1 text-xs">
                  {[
                    { id: "4-Wheeler", label: "4W", title: "4-Wheeler", icon: Car },
                    { id: "2-Wheeler", label: "2W", title: "2-Wheeler", icon: Bike },
                    { id: "3-Wheeler", label: "3W", title: "3-Wheeler", icon: Truck },
                    { id: "EV", label: "EV", title: "Electric Mobility", icon: Zap },
                  ].map((item) => {
                    const active = searchMobility === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        title={item.title}
                        onClick={() =>
                          nav({
                            search: (s: S) => ({
                              ...s,
                              mobility: active ? undefined : item.id,
                            }),
                          })
                        }
                        className={cn(
                          "flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-center font-medium transition-all cursor-pointer border text-xs gap-0.5",
                          active
                            ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow-xs font-bold"
                            : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200/80 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 hover:border-zinc-300",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-3.5 w-3.5",
                            active ? "text-primary" : "text-muted-foreground",
                          )}
                        />
                        <span className="text-[10.5px] leading-tight font-semibold">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Product Nature (3-way Segmented Control) */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  Product Type
                </span>
                <div className="grid grid-cols-3 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-xs">
                  {[
                    { id: undefined, label: "All" },
                    { id: "equipment", label: "Machinery" },
                    { id: "parts", label: "Parts" },
                  ].map((item) => {
                    const active = searchType === item.id;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => nav({ search: (s: S) => ({ ...s, type: item.id }) })}
                        className={cn(
                          "py-1 rounded-lg font-semibold transition-all cursor-pointer text-center truncate px-1 text-[11px]",
                          active
                            ? "bg-white dark:bg-zinc-900 text-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Category Dropdown (Compact, No Scroll) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="filter-cat"
                    className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Category
                  </label>
                  {cat && (
                    <button
                      onClick={() => nav({ search: (s: S) => ({ ...s, cat: undefined }) })}
                      className="text-[10px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="relative">
                  <select
                    id="filter-cat"
                    value={cat || ""}
                    onChange={(e) =>
                      nav({ search: (s: S) => ({ ...s, cat: e.target.value || undefined }) })
                    }
                    className="w-full h-8.5 pl-3 pr-8 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer appearance-none"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>

              {/* 5. Manufacturer Brand Dropdown (Compact, No Scroll) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="filter-brand"
                    className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Brand
                  </label>
                  {selectedBrand && (
                    <button
                      onClick={() => setSelectedBrand("")}
                      className="text-[10px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="relative">
                  <select
                    id="filter-brand"
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full h-8.5 pl-3 pr-8 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer appearance-none"
                  >
                    <option value="">All Brands</option>
                    {brands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>

              {/* Fleet Fitment Active Tag (if selected) */}
              {vehicle && (
                <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-primary/5 border border-primary/20">
                  <span className="font-semibold text-primary truncate text-[11px]">{vehicle}</span>
                  <button
                    onClick={() => nav({ search: (s: S) => ({ ...s, vehicle: undefined }) })}
                    className="text-[10px] text-muted-foreground hover:text-foreground ml-2 shrink-0 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* ======================================================== */}
          {/* RIGHT: PRODUCT RESULTS & TOP CONTROLS                    */}
          {/* ======================================================== */}
          <div>
            {/* Active Filter Chips Bar (Only shown when active filters exist) */}
            {activeFiltersCount > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-2 text-xs border-b border-border/70 pb-3">
                {searchMobility && (
                  <Chip
                    label={`Platform: ${searchMobility}`}
                    onClear={() => nav({ search: (s: S) => ({ ...s, mobility: undefined }) })}
                  />
                )}
                {vehicle && (
                  <Chip
                    label={`Fits: ${vehicle}`}
                    onClear={() => nav({ search: (s: S) => ({ ...s, vehicle: undefined }) })}
                  />
                )}
                {cat && (
                  <Chip
                    label={`Category: ${cat}`}
                    onClear={() => nav({ search: (s: S) => ({ ...s, cat: undefined }) })}
                  />
                )}
                {selectedBrand && (
                  <Chip label={`Brand: ${selectedBrand}`} onClear={() => setSelectedBrand("")} />
                )}
                {searchType && (
                  <Chip
                    label={`Type: ${searchType === "equipment" ? "Machinery" : "Parts"}`}
                    onClear={() => nav({ search: (s: S) => ({ ...s, type: undefined }) })}
                  />
                )}
                {q && (
                  <Chip
                    label={`Search: “${q}”`}
                    onClear={() => {
                      setQuery("");
                      nav({ search: (s: S) => ({ ...s, q: undefined }) });
                    }}
                  />
                )}
              </div>
            )}

            {/* Product Grid Render: Guaranteed 2 Columns on Mobile */}
            {filteredList.length > 0 ? (
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {filteredList.map((p) => (
                  <ProductCard key={p.slug} p={p} onQuote={setActiveQuoteProduct} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border py-20 text-center bg-card/50">
                <h3 className="display-md text-foreground">No Products Found</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                  We could not find any products matching your current combination of filters. Try
                  clearing some filters or searching by a broader term.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <button
                    onClick={handleClearAll}
                    className="btn btn-primary h-10 text-xs font-bold uppercase rounded-full px-6"
                  >
                    Clear All Filters
                  </button>
                  <Link
                    to="/support"
                    className="btn btn-outline h-10 text-xs font-bold uppercase rounded-full px-6"
                  >
                    Request Custom Quote
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile Filters Drawer (Slides from the left) */}
      <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
        <SheetContent
          side="left"
          className="w-[310px] max-w-[88vw] h-full bg-card p-5 flex flex-col justify-between overflow-y-auto"
        >
          <div className="space-y-4">
            {/* Drawer Header: Title + Reset (Close button is rendered top-right by SheetContent) */}
            <SheetHeader className="border-b border-border pb-3 pr-8 text-left space-y-0">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Filters
                </SheetTitle>
                {(cat ||
                  vehicle ||
                  selectedBrand ||
                  q ||
                  inStock ||
                  searchType ||
                  searchMobility) && (
                  <button
                    onClick={handleClearAll}
                    className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              <SheetDescription className="sr-only">
                Filter catalogue by platform, stock, category, brand, and type
              </SheetDescription>
            </SheetHeader>

            {/* 1. Mobile In Stock Switch */}
            <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800">
              <span className="text-xs font-semibold text-foreground">In Stock Only</span>
              <button
                type="button"
                role="switch"
                aria-checked={inStock}
                onClick={() => setInStock(!inStock)}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  inStock ? "bg-primary" : "bg-zinc-300 dark:bg-zinc-700",
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out",
                    inStock ? "translate-x-4" : "translate-x-0",
                  )}
                />
              </button>
            </div>

            {/* 2. Mobile Vehicle Platform (4-Column Segmented Row) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Platform
                </span>
                {searchMobility && (
                  <button
                    onClick={() => nav({ search: (s: S) => ({ ...s, mobility: undefined }) })}
                    className="text-[10px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-1 text-xs">
                {[
                  { id: "4-Wheeler", label: "4W", title: "4-Wheeler", icon: Car },
                  { id: "2-Wheeler", label: "2W", title: "2-Wheeler", icon: Bike },
                  { id: "3-Wheeler", label: "3W", title: "3-Wheeler", icon: Truck },
                  { id: "EV", label: "EV", title: "Electric Mobility", icon: Zap },
                ].map((item) => {
                  const active = searchMobility === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      title={item.title}
                      onClick={() =>
                        nav({
                          search: (s: S) => ({
                            ...s,
                            mobility: active ? undefined : item.id,
                          }),
                        })
                      }
                      className={cn(
                        "flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-center font-medium transition-all cursor-pointer border text-xs gap-0.5",
                        active
                          ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow-xs font-bold"
                          : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200/80 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 hover:border-zinc-300",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-3.5 w-3.5",
                          active ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                      <span className="text-[10.5px] leading-tight font-semibold">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Mobile Product Nature (3-way Segmented Control) */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Product Type
              </span>
              <div className="grid grid-cols-3 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-xs">
                {[
                  { id: undefined, label: "All" },
                  { id: "equipment", label: "Machinery" },
                  { id: "parts", label: "Parts" },
                ].map((item) => {
                  const active = searchType === item.id;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => nav({ search: (s: S) => ({ ...s, type: item.id }) })}
                      className={cn(
                        "py-1 rounded-lg font-semibold transition-all cursor-pointer text-center truncate px-1 text-[11px]",
                        active
                          ? "bg-white dark:bg-zinc-900 text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Mobile Category Dropdown */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="m-filter-cat"
                  className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Category
                </label>
                {cat && (
                  <button
                    onClick={() => nav({ search: (s: S) => ({ ...s, cat: undefined }) })}
                    className="text-[10px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="relative">
                <select
                  id="m-filter-cat"
                  value={cat || ""}
                  onChange={(e) =>
                    nav({ search: (s: S) => ({ ...s, cat: e.target.value || undefined }) })
                  }
                  className="w-full h-8.5 pl-3 pr-8 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer appearance-none"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>

            {/* 5. Mobile Brand Dropdown */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="m-filter-brand"
                  className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Brand
                </label>
                {selectedBrand && (
                  <button
                    onClick={() => setSelectedBrand("")}
                    className="text-[10px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="relative">
                <select
                  id="m-filter-brand"
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full h-8.5 pl-3 pr-8 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer appearance-none"
                >
                  <option value="">All Brands</option>
                  {brands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-border">
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="btn btn-primary w-full h-10 text-xs font-bold uppercase rounded-xl shadow-sm cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Direct Product Quotation Modal */}
      {activeQuoteProduct && (
        <QuoteModal product={activeQuoteProduct} onClose={() => setActiveQuoteProduct(null)} />
      )}
    </div>
  );
}

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold text-ink-foreground shadow-xs">
      <span>{label}</span>
      <button
        onClick={onClear}
        aria-label={`Remove ${label}`}
        className="hover:text-primary transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
