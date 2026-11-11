import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { products, type Product } from "@/lib/data";

interface EquipmentFanStackProps {
  className?: string;
}

export function EquipmentFanStack({ className = "" }: EquipmentFanStackProps) {
  const navigate = useNavigate();

  // Curate 5 flagship industrial equipment items from real product dataset
  const equipmentItems: Product[] = [
    products.find((p) => p.slug === "heavy-duty-2-post-lift-4t") ?? products[0]!,
    products.find((p) => p.slug === "pro-tyre-changer-assist-arm") ?? products[1]!,
    products.find((p) => p.slug === "digital-wheel-balancer-laser") ?? products[2]!,
    products.find((p) => p.slug === "rotary-screw-air-compressor-10hp") ?? products[3]!,
    products.find((p) => p.slug === "ev-battery-pack-diagnostic-analyzer") ?? products[4]!,
  ].filter((p): p is Product => Boolean(p));

  // Initial active card is center item (index 0: Vehicle Lift, or index 2)
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(media.matches);
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  const total = equipmentItems.length;

  const nextProduct = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevProduct = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Touch Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEnd = e.changedTouches[0];
    if (!touchEnd) return;
    const touchEndX = touchEnd.clientX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 45) {
      if (diff < 0) {
        nextProduct();
      } else {
        prevProduct();
      }
    }
    setTouchStartX(null);
  };

  // Compute balanced circular fan offset for each card relative to activeIndex
  const getCardStyle = (index: number) => {
    // Symmetrical cyclic difference: -2, -1, 0, 1, 2
    const rawDiff =
      ((index - activeIndex + total + Math.floor(total / 2)) % total) - Math.floor(total / 2);

    if (isReducedMotion) {
      return {
        transform: `translateX(${rawDiff * 60}px) scale(${rawDiff === 0 ? 1 : 0.9})`,
        zIndex: rawDiff === 0 ? 30 : 20 - Math.abs(rawDiff) * 5,
        opacity: rawDiff === 0 ? 1 : 0.7,
      };
    }

    // Mathematical fan placement variables based on offset
    switch (rawDiff) {
      case 0: // ACTIVE CENTER
        return {
          transform: "translateX(0px) translateY(-14px) translateZ(0px) rotate(0deg) scale(1)",
          zIndex: 35,
          opacity: 1,
          filter: "brightness(100%)",
          shadow: "0 28px 50px -15px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.15)",
        };
      case -1: // LEFT 1
        return {
          transform:
            "translateX(calc(-52% - 20px)) translateY(12px) translateZ(-60px) rotate(-8deg) scale(0.88)",
          zIndex: 25,
          opacity: 0.88,
          filter: "brightness(90%)",
          shadow: "0 18px 35px -10px rgba(0, 0, 0, 0.5)",
        };
      case 1: // RIGHT 1
        return {
          transform:
            "translateX(calc(52% + 20px)) translateY(12px) translateZ(-60px) rotate(8deg) scale(0.88)",
          zIndex: 25,
          opacity: 0.88,
          filter: "brightness(90%)",
          shadow: "0 18px 35px -10px rgba(0, 0, 0, 0.5)",
        };
      case -2: // LEFT 2
        return {
          transform:
            "translateX(calc(-98% - 30px)) translateY(32px) translateZ(-120px) rotate(-14deg) scale(0.78)",
          zIndex: 15,
          opacity: 0.68,
          filter: "brightness(78%)",
          shadow: "0 12px 25px -8px rgba(0, 0, 0, 0.4)",
        };
      case 2: // RIGHT 2
        return {
          transform:
            "translateX(calc(98% + 30px)) translateY(32px) translateZ(-120px) rotate(14deg) scale(0.78)",
          zIndex: 15,
          opacity: 0.68,
          filter: "brightness(78%)",
          shadow: "0 12px 25px -8px rgba(0, 0, 0, 0.4)",
        };
      default:
        return {
          transform: "translateX(0) scale(0.7)",
          zIndex: 5,
          opacity: 0.4,
        };
    }
  };

  const handleCardClick = (index: number, slug: string) => {
    if (activeIndex === index) {
      // Already active: navigate to detail page
      navigate({ to: "/shop/$slug", params: { slug } });
    } else {
      // Set to center active
      setActiveIndex(index);
    }
  };

  const activeProduct = equipmentItems[activeIndex] ?? equipmentItems[0]!;

  return (
    <section
      id="equipment-showcase"
      className={`relative py-24 lg:py-32 bg-[#08090b] text-white overflow-hidden border-b border-zinc-800 ${className}`}
    >
      {/* Background Subtle Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft radial table spotlight */}
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-white/[0.03] blur-[120px] rounded-full" />
        {/* Warm active red ambient shimmer */}
        <div className="absolute top-[55%] left-1/2 -translate-x-1/2 w-[580px] h-[260px] bg-primary/[0.12] blur-[100px] rounded-full" />
        {/* Engineering layout grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_50%,black_30%,transparent_100%)] opacity-70" />
      </div>

      <div className="container-page relative z-10">
        {/* SECTION HEADER: Clean, Editorial, Minimal */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-[0.25em] text-primary mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>EQUIPMENT / 01 · B2B WORKSHOP SHOWCASE</span>
            </div>
            <h2 className="display-lg text-white tracking-tight">EXPLORE OUR EQUIPMENT.</h2>
            <p className="mt-2 text-sm sm:text-base text-zinc-400 max-w-xl font-sans">
              Professional machinery, lifting platforms, and diagnostic solutions engineered for
              modern automotive workshops.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-xs font-mono text-zinc-500 uppercase tracking-widest">
              INTERACTIVE TABLE · HOVER TO INSPECT
            </span>
            <Link
              to="/shop"
              search={{ cat: "Garage Equipment" }}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary hover:text-white transition-colors group"
            >
              <span>View Full Machinery Catalog</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* ======================================================== */}
        {/* THE INTERACTIVE PRODUCT FAN STACK CONTAINER              */}
        {/* ======================================================== */}
        <div
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative mx-auto flex items-center justify-center min-h-[500px] sm:min-h-[540px] md:min-h-[570px] lg:min-h-[600px] select-none py-6"
          style={{
            perspective: "1400px",
            perspectiveOrigin: "50% 45%",
          }}
          role="region"
          aria-label="Interactive Equipment Fan Stack"
        >
          {/* Ground Showroom Table Shadow beneath Stack */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[80%] max-w-4xl h-12 bg-black/85 blur-2xl rounded-full pointer-events-none" />

          {/* Render 5 Fanned Product Panels */}
          {equipmentItems.map((p, index) => {
            const isCenter = activeIndex === index;
            const style = getCardStyle(index);

            return (
              <div
                key={p.slug}
                role="button"
                tabIndex={0}
                aria-label={`${p.name}, ${p.category}. ${isCenter ? "Active product. Press Enter to view details." : "Press Enter to bring to center."}`}
                onPointerEnter={() => setActiveIndex(index)}
                onClick={() => handleCardClick(index, p.slug)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCardClick(index, p.slug);
                  } else if (e.key === "ArrowRight") {
                    e.preventDefault();
                    nextProduct();
                  } else if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    prevProduct();
                  }
                }}
                className={`absolute left-1/2 top-1/2 -translate-y-1/2 cursor-pointer w-[275px] sm:w-[315px] md:w-[340px] lg:w-[365px] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] rounded-sm bg-white text-zinc-900 border ${
                  isCenter
                    ? "border-white shadow-[0_28px_50px_-12px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.4)] ring-1 ring-white/30"
                    : "border-zinc-200 shadow-xl hover:border-zinc-300"
                }`}
                style={{
                  transform: style.transform,
                  zIndex: style.zIndex,
                  opacity: style.opacity,
                  filter: style.filter,
                  transformOrigin: "50% 95%",
                  boxShadow: style.shadow,
                }}
              >
                {/* Active PAGE Red Top Indicator Bar */}
                <div
                  className={`h-1 w-full rounded-t-sm transition-all duration-300 ${
                    isCenter ? "bg-primary shadow-[0_0_8px_rgba(224,36,36,0.6)]" : "bg-transparent"
                  }`}
                />

                <div className="p-5 sm:p-6 flex flex-col h-full justify-between">
                  {/* Card Top Label & SKU */}
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
                      {p.brand} · {p.category}
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-zinc-400">
                      {p.sku}
                    </span>
                  </div>

                  {/* Dominant Product Image Canvas */}
                  <div className="relative my-4 aspect-[4/3] w-full flex items-center justify-center overflow-hidden rounded bg-gradient-to-b from-zinc-50 to-zinc-100/70 p-4">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className={`h-full w-full object-contain mix-blend-multiply transition-transform duration-500 ${
                        isCenter ? "scale-105" : "scale-95 group-hover:scale-100"
                      }`}
                    />

                    {/* Active Floating Spec Pill */}
                    {isCenter && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-zinc-900/90 text-white text-[9px] font-mono font-bold uppercase tracking-wider backdrop-blur-xs shadow-xs animate-in fade-in duration-300">
                        {p.specs[0]?.[1] || "Commercial"}
                      </div>
                    )}
                  </div>

                  {/* Bottom Editorial Content */}
                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">
                      {p.category}
                    </span>

                    <h3 className="font-display text-xl sm:text-2xl font-bold uppercase leading-tight text-zinc-950 line-clamp-2 min-h-[3.25rem]">
                      {p.name}
                    </h3>

                    {/* Bottom CTA Row */}
                    <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                      <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600">
                        Quotation on Request
                      </div>

                      <div
                        className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                          isCenter
                            ? "text-primary translate-x-0"
                            : "text-zinc-600 hover:text-primary"
                        }`}
                      >
                        <span>View Product</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subtle PAGE Red Bottom Accent Line on Active */}
                {isCenter && <div className="h-0.5 w-full bg-primary rounded-b-sm" />}
              </div>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* BELOW STACK CONTROLS & ACTIVE INDEX INDICATOR            */}
        {/* ======================================================== */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-zinc-800/80">
          {/* Active Product Index Indicator: 01 / 05 */}
          <div className="flex items-center gap-4">
            <span className="font-display text-2xl sm:text-3xl font-bold text-white tracking-wider">
              0{activeIndex + 1} <span className="text-zinc-600">/ 0{total}</span>
            </span>

            {/* Interactive Dot Selectors */}
            <div className="flex items-center gap-2">
              {equipmentItems.map((item, idx) => (
                <button
                  key={item.slug}
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Inspect ${item.name}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeIndex === idx
                      ? "w-8 bg-primary shadow-[0_0_8px_rgba(224,36,36,0.6)]"
                      : "w-2 bg-zinc-700 hover:bg-zinc-500"
                  }`}
                />
              ))}
            </div>

            <span className="hidden md:inline-block text-xs font-medium text-zinc-400 truncate max-w-xs ml-2">
              {activeProduct.name}
            </span>
          </div>

          {/* Arrows for manual navigation & View All link */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={prevProduct}
                aria-label="Previous equipment panel"
                className="grid h-9 w-9 place-items-center rounded-full border border-zinc-700 bg-zinc-900/80 text-white hover:border-zinc-500 hover:bg-zinc-800 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextProduct}
                aria-label="Next equipment panel"
                className="grid h-9 w-9 place-items-center rounded-full border border-zinc-700 bg-zinc-900/80 text-white hover:border-zinc-500 hover:bg-zinc-800 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <Link
              to="/shop"
              search={{ cat: "Garage Equipment" }}
              className="btn btn-primary h-10 px-5 text-xs font-bold uppercase tracking-wider rounded-sm shadow-lg shadow-primary/25"
            >
              <span>Explore All Equipment</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
