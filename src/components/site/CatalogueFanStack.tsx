import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
} from "lucide-react";
import { images } from "@/lib/data";

export interface CatalogueItem {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  count: string;
  badge: string;
  specs: string;
  desc: string;
  image: string;
  link: string;
  search?: Record<string, string>;
}

export function CatalogueFanStack({ className = "" }: { className?: string }) {
  const navigate = useNavigate();

  // 5 Signature B2B Automotive Catalogue Disciplines
  const catalogueItems: CatalogueItem[] = [
    {
      id: "garage-equipment",
      title: "GARAGE EQUIPMENT",
      subtitle: "Machinery & Lifts",
      code: "CAT / 01",
      count: "48 Products",
      badge: "Commercial Machinery",
      specs: "4.0T - 5.5T Capacity",
      desc: "Electro-hydraulic 2-post and scissor lifts, hydraulic shop presses, transmission jacks & vehicle anchoring systems.",
      image: images.lift,
      link: "/shop",
      search: { cat: "Garage Equipment" },
    },
    {
      id: "tyre-wheel",
      title: "TYRE & WHEEL",
      subtitle: "Service Bays",
      code: "CAT / 02",
      count: "32 Products",
      badge: "Tyre Fitment Systems",
      specs: '10" - 26" Clamping',
      desc: "Automatic pneumatic tyre changers with dual power assist arms, laser wheel balancers & bead seating blasters.",
      image: images.tyreChanger,
      link: "/shop",
      search: { cat: "Tyre & Wheel" },
    },
    {
      id: "diagnostics",
      title: "DIAGNOSTICS",
      subtitle: "ECU & Scanning",
      code: "CAT / 03",
      count: "26 Products",
      badge: "Electronic Scanning",
      specs: "CAN-FD / DoIP Protocols",
      desc: "OE-level diagnostic tablets, multi-system ECU scanners, digital battery analyzers, code readers & oscilloscopes.",
      image: images.scanner,
      link: "/shop",
      search: { cat: "Diagnostic Equipment" },
    },
    {
      id: "ev-equipment",
      title: "EV EQUIPMENT",
      subtitle: "High-Voltage Tools",
      code: "CAT / 04",
      count: "18 Products",
      badge: "EV & Hybrid Safety",
      specs: "1000V IEC Certified",
      desc: "1000V VDE insulated hand tools, high-voltage battery cell balancers, pack diagnostic stations & safety barrier systems.",
      image: images.evBatteryAnalyzer,
      link: "/shop",
      search: { mobility: "EV" },
    },
    {
      id: "workshop-tools",
      title: "WORKSHOP TOOLS",
      subtitle: "Pneumatics & Air",
      code: "CAT / 05",
      count: "64 Products",
      badge: "Pneumatic Plant",
      specs: "10 Bar / 100% Duty",
      desc: "Continuous-duty rotary screw compressors, pneumatic piping ring mains, impact tools, filter regulators & mobile tool cabinets.",
      image: images.compressor,
      link: "/shop",
      search: { cat: "Workshop Tools" },
    },
  ];

  const total = catalogueItems.length;
  // Center active card index (default 0)
  const [activeIndex, setActiveIndex] = useState<number>(0);
  // Hover & Fan state
  const [isHovered, setIsHovered] = useState<boolean>(false);
  // Manual toggle: "auto" (fans on hover like reference) | "fanned" (always fanned) | "stacked" (compact deck)
  const [viewMode, setViewMode] = useState<"auto" | "fanned" | "stacked">("auto");
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );

  // Hover Intent Timer to avoid nervous sensitivity / rapid jitter
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(media.matches);
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    media.addEventListener("change", handler);

    // Detect touch device (default touch devices to fanned view for immediate access)
    if (
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0)
    ) {
      setIsTouchDevice(true);
    }

    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      media.removeEventListener("change", handler);
      window.removeEventListener("resize", onResize);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const nextItem = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevItem = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEnd = e.changedTouches[0];
    if (!touchEnd) return;
    const touchEndX = touchEnd.clientX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 40) {
      if (diff < 0) {
        nextItem();
      } else {
        prevItem();
      }
    }
    setTouchStartX(null);
  };

  // Intent-based hover handler: prevents rapid jitter / oversensitivity
  const handleCardMouseEnter = (index: number) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (activeIndex === index) return;

    // Intent buffer: 140ms dwell time before re-centering
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveIndex(index);
    }, 140);
  };

  const handleCardMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  // Determine whether cards are currently fanned out
  const isCurrentlyFanned =
    viewMode === "fanned" || (viewMode === "auto" && (isHovered || isTouchDevice));

  // Dynamic responsive horizontal offsets ensuring true dead-center alignment
  const getFanOffsets = () => {
    if (windowWidth >= 1024) {
      return { step1: 185, step2: 355 };
    }
    if (windowWidth >= 768) {
      return { step1: 140, step2: 270 };
    }
    return { step1: 65, step2: 125 };
  };

  const { step1, step2 } = getFanOffsets();

  // Compute balanced circular fan offset for each card relative to activeIndex
  // Note: All transforms start from -50% on X and -50% on Y to guarantee DEAD-CENTER alignment
  const getCardStyle = (index: number) => {
    const rawDiff =
      ((index - activeIndex + total + Math.floor(total / 2)) % total) - Math.floor(total / 2);

    if (isReducedMotion) {
      return {
        transform: `translate3d(calc(-50% + ${rawDiff * 50}px), -50%, 0px) scale(${rawDiff === 0 ? 1 : 0.92})`,
        zIndex: rawDiff === 0 ? 40 : 20 - Math.abs(rawDiff) * 5,
        opacity: rawDiff === 0 ? 1 : 0.75,
        boxShadow: rawDiff === 0 ? "0 20px 40px -10px rgba(0,0,0,0.5)" : "none",
        transformOrigin: "50% 50%",
      };
    }

    // STATE 1: FANNED OUT ARC (Dead-Centered on Screen)
    if (isCurrentlyFanned) {
      switch (rawDiff) {
        case 0: // ACTIVE CENTER (True Middle)
          return {
            transform: "translate3d(-50%, calc(-50% - 32px), 0px) rotate(0deg) scale(1.02)",
            zIndex: 40,
            opacity: 1,
            boxShadow: "0 32px 64px -16px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.25)",
            transformOrigin: "50% 115%",
          };
        case -1: // LEFT 1
          return {
            transform: `translate3d(calc(-50% - ${step1}px), calc(-50% + 14px), -40px) rotate(-8.5deg) scale(0.92)`,
            zIndex: 30,
            opacity: 0.95,
            boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.15)",
            transformOrigin: "50% 115%",
          };
        case 1: // RIGHT 1
          return {
            transform: `translate3d(calc(-50% + ${step1}px), calc(-50% + 14px), -40px) rotate(8.5deg) scale(0.92)`,
            zIndex: 30,
            opacity: 0.95,
            boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.15)",
            transformOrigin: "50% 115%",
          };
        case -2: // FAR LEFT 2
          return {
            transform: `translate3d(calc(-50% - ${step2}px), calc(-50% + 42px), -80px) rotate(-16deg) scale(0.84)`,
            zIndex: 20,
            opacity: 0.86,
            boxShadow: "0 14px 30px -8px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)",
            transformOrigin: "50% 115%",
          };
        case 2: // FAR RIGHT 2
          return {
            transform: `translate3d(calc(-50% + ${step2}px), calc(-50% + 42px), -80px) rotate(16deg) scale(0.84)`,
            zIndex: 20,
            opacity: 0.86,
            boxShadow: "0 14px 30px -8px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)",
            transformOrigin: "50% 115%",
          };
        default:
          return {
            transform: "translate3d(-50%, -50%, 0px) scale(0.7)",
            zIndex: 10,
            opacity: 0.4,
            boxShadow: "none",
            transformOrigin: "50% 115%",
          };
      }
    }

    // STATE 2: STACKED DECK (Dead-Centered on Screen)
    switch (rawDiff) {
      case 0: // ACTIVE FRONT
        return {
          transform: "translate3d(-50%, -50%, 0px) rotate(0deg) scale(1)",
          zIndex: 40,
          opacity: 1,
          boxShadow: "0 28px 56px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.25)",
          transformOrigin: "50% 50%",
        };
      case -1: // BEHIND LEFT 1
        return {
          transform:
            "translate3d(calc(-50% - 6px), calc(-50% + 3px), -20px) rotate(-2.8deg) scale(0.985)",
          zIndex: 30,
          opacity: 0.96,
          boxShadow: "0 14px 28px -6px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          transformOrigin: "50% 50%",
        };
      case 1: // BEHIND RIGHT 1
        return {
          transform:
            "translate3d(calc(-50% + 6px), calc(-50% + 3px), -20px) rotate(2.8deg) scale(0.985)",
          zIndex: 29,
          opacity: 0.96,
          boxShadow: "0 14px 28px -6px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          transformOrigin: "50% 50%",
        };
      case -2: // BEHIND FAR LEFT 2
        return {
          transform:
            "translate3d(calc(-50% - 12px), calc(-50% + 7px), -40px) rotate(-5deg) scale(0.97)",
          zIndex: 20,
          opacity: 0.9,
          boxShadow: "0 10px 22px -5px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.08)",
          transformOrigin: "50% 50%",
        };
      case 2: // BEHIND FAR RIGHT 2
        return {
          transform:
            "translate3d(calc(-50% + 12px), calc(-50% + 7px), -40px) rotate(5deg) scale(0.97)",
          zIndex: 19,
          opacity: 0.9,
          boxShadow: "0 10px 22px -5px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.08)",
          transformOrigin: "50% 50%",
        };
      default:
        return {
          transform: "translate3d(-50%, -50%, 0px) scale(0.9)",
          zIndex: 10,
          opacity: 0.5,
          boxShadow: "none",
          transformOrigin: "50% 50%",
        };
    }
  };

  const handleCardClick = (index: number, item: CatalogueItem) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (activeIndex === index) {
      // Already active: navigate to catalogue route
      if (item.search) {
        navigate({ to: item.link, search: item.search } as any);
      } else {
        navigate({ to: item.link } as any);
      }
    } else {
      // Bring to center
      setActiveIndex(index);
    }
  };

  const activeCatalogue = catalogueItems[activeIndex];

  return (
    <section
      id="catalogue-showcase"
      className={`relative py-20 lg:py-28 bg-[#C81E1E] text-white overflow-hidden border-b border-red-900/60 shadow-inner ${className}`}
      style={{
        background: "linear-gradient(180deg, #B91C1C 0%, #C81E1E 50%, #991B1B 100%)",
      }}
    >
      {/* Background Showroom Radial Atmosphere & Architectural Grid */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Central warm spotlight */}
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[950px] h-[520px] bg-white/[0.12] blur-[140px] rounded-full" />
        {/* Dark vignette corners */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_30%,rgba(0,0,0,0.35)_100%)]" />
        {/* Subtle engineering layout dots */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:32px_32px] opacity-40 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_50%,black_40%,transparent_100%)]" />
      </div>

      <div className="container-page relative z-10">
        {/* SECTION HEADER: High-Contrast White on Red Background */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-[0.25em] text-white bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 mb-3 shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              <span>CATALOGUE / 01 · B2B COMMERCIAL DISCIPLINES</span>
            </div>
            <h2 className="display-lg text-white tracking-tight drop-shadow-sm">
              EXPLORE OUR CATALOGUE.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-red-50/90 max-w-xl font-sans leading-relaxed">
              Professional equipment, diagnostic systems, and workshop engineering solutions for
              modern automotive facilities.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-xs font-mono text-white/80 uppercase tracking-widest bg-black/20 px-3 py-1 rounded border border-white/10">
              {isCurrentlyFanned ? "HOVER / TAP TO INSPECT" : "HOVER TO SPREAD FAN"}
            </span>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-950 bg-white hover:bg-zinc-100 px-4 py-2.5 rounded-sm shadow-lg shadow-black/20 transition-all hover:scale-105 group"
            >
              <span>View Full B2B Catalog</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* ======================================================== */}
        {/* THE INTERACTIVE CATALOGUE FAN STACK (DEAD-CENTERED)      */}
        {/* ======================================================== */}
        <div
          onPointerEnter={() => setIsHovered(true)}
          onPointerLeave={() => {
            setIsHovered(false);
            handleCardMouseLeave();
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative mx-auto flex items-center justify-center w-full min-h-[500px] sm:min-h-[540px] md:min-h-[570px] lg:min-h-[600px] select-none py-6 px-4"
          style={{
            perspective: "1400px",
            perspectiveOrigin: "50% 50%",
          }}
          role="region"
          aria-label="Interactive Catalogue Fan Stack"
        >
          {/* Ground Soft Table Shadow beneath Stack */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[75%] max-w-3xl h-16 bg-black/45 blur-2xl rounded-full pointer-events-none" />

          {/* Render 5 Fanned Catalogue Panels */}
          {catalogueItems.map((item, index) => {
            const isCenter = activeIndex === index;
            const style = getCardStyle(index);

            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                aria-label={`${item.title}, ${item.subtitle}. ${
                  isCenter
                    ? "Active catalogue. Press Enter to view products."
                    : "Press Enter to inspect catalogue."
                }`}
                onPointerEnter={() => handleCardMouseEnter(index)}
                onPointerLeave={handleCardMouseLeave}
                onClick={() => handleCardClick(index, item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCardClick(index, item);
                  } else if (e.key === "ArrowRight") {
                    e.preventDefault();
                    nextItem();
                  } else if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    prevItem();
                  }
                }}
                className={`absolute left-1/2 top-1/2 cursor-pointer w-[250px] sm:w-[280px] md:w-[305px] lg:w-[325px] h-[385px] sm:h-[415px] md:h-[435px] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] rounded-[28px] sm:rounded-[32px] border flex flex-col justify-between p-4 sm:p-5 will-change-transform ${
                  isCenter
                    ? "bg-[#141518] text-white border-white/30 shadow-[0_36px_72px_-16px_rgba(0,0,0,0.75)] ring-1 ring-white/20"
                    : "bg-white text-zinc-950 border-white/60 shadow-xl hover:border-white"
                }`}
                style={{
                  transform: style.transform,
                  zIndex: style.zIndex,
                  opacity: style.opacity,
                  transformOrigin: style.transformOrigin,
                  boxShadow: style.boxShadow,
                }}
              >
                {/* Top Action Row */}
                <div className="flex items-center justify-between gap-2 z-10">
                  {/* Category Code or Badge */}
                  <div>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${
                        isCenter ? "text-primary" : "text-zinc-600"
                      }`}
                    >
                      {item.code}
                    </span>
                    <span
                      className={`text-[9px] font-sans font-semibold tracking-tight block ${
                        isCenter ? "text-zinc-400" : "text-zinc-600"
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  {/* Top Button: Pill on Active, Circle on Inactive */}
                  {isCenter ? (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.search) {
                          navigate({ to: item.link, search: item.search } as any);
                        } else {
                          navigate({ to: item.link } as any);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-zinc-950 text-xs font-bold tracking-tight shadow-lg transition-all hover:bg-zinc-100 hover:scale-105"
                    >
                      <span>Explore Catalogue</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
                    </div>
                  ) : (
                    <div
                      className="size-8 sm:size-9 rounded-full bg-zinc-100 border border-zinc-200/90 flex items-center justify-center text-zinc-900 transition-all hover:bg-zinc-200 hover:scale-105 shadow-xs"
                      aria-hidden="true"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {/* Dominant Catalogue Image Canvas with Rounded Inset Container */}
                <div
                  className={`relative my-2 sm:my-3 aspect-[4/3] w-full flex items-center justify-center overflow-hidden rounded-[20px] p-4 transition-colors ${
                    isCenter
                      ? "bg-[#222327] border border-white/10"
                      : "bg-[#F4F4F5] border border-zinc-100"
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className={`h-full w-full object-contain transition-transform duration-500 ${
                      isCenter ? "scale-105" : "mix-blend-multiply scale-95 hover:scale-100"
                    }`}
                  />

                  {/* Active Floating Spec Pill */}
                  {isCenter && (
                    <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/75 text-white text-[9px] font-mono font-bold uppercase tracking-wider backdrop-blur-xs border border-white/15 shadow-xs">
                      {item.specs}
                    </div>
                  )}
                </div>

                {/* Bottom Editorial Content */}
                <div className="pt-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest block mb-0.5 ${
                      isCenter ? "text-primary" : "text-zinc-600"
                    }`}
                  >
                    {item.subtitle}
                  </span>

                  <h3
                    className={`font-display text-lg sm:text-xl md:text-2xl font-bold uppercase leading-tight line-clamp-1 ${
                      isCenter ? "text-white" : "text-zinc-950"
                    }`}
                  >
                    {item.title}
                  </h3>

                  <p
                    className={`mt-1 text-xs line-clamp-2 min-h-[2rem] leading-relaxed ${
                      isCenter ? "text-zinc-300" : "text-zinc-700"
                    }`}
                  >
                    {item.desc}
                  </p>

                  {/* Bottom Stats Row */}
                  <div
                    className={`mt-3 pt-2.5 border-t flex items-center justify-between text-xs font-mono font-semibold ${
                      isCenter ? "border-zinc-800 text-zinc-300" : "border-zinc-100 text-zinc-600"
                    }`}
                  >
                    <span>{item.count}</span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider ${
                        isCenter ? "text-primary" : "text-zinc-800 hover:text-primary"
                      }`}
                    >
                      {isCenter ? "Ready To Order" : "Inspect →"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* BELOW STACK CONTROLS & ACTIVE INDEX INDICATOR            */}
        {/* ======================================================== */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/20">
          {/* Active Product Index Indicator: 01 / 05 */}
          <div className="flex items-center gap-4">
            <span className="font-display text-2xl sm:text-3xl font-bold text-white tracking-wider drop-shadow-xs">
              0{activeIndex + 1} <span className="text-red-200/80">/ 0{total}</span>
            </span>

            {/* Interactive Dot Selectors */}
            <div className="flex items-center gap-2">
              {catalogueItems.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Inspect ${item.title}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeIndex === idx
                      ? "w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)]"
                      : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>

            <span className="hidden md:inline-block text-xs font-medium text-white/90 truncate max-w-xs ml-2">
              {activeCatalogue?.title} · {activeCatalogue?.subtitle}
            </span>
          </div>

          {/* Quick View Mode Toggle & Navigation Chevrons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* View Mode Switch: Deck Stack vs Fan Out */}
            <div className="hidden sm:inline-flex items-center p-1 rounded-full bg-black/35 backdrop-blur-md border border-white/20 text-[11px] font-bold text-white">
              <button
                onClick={() => setViewMode("stacked")}
                className={`px-3 py-1 rounded-full flex items-center gap-1.5 transition-all ${
                  viewMode === "stacked"
                    ? "bg-white text-zinc-950 shadow-sm"
                    : "text-white/80 hover:text-white"
                }`}
                title="Keep cards stacked as a deck"
              >
                <Layers className="h-3 w-3" />
                <span>Deck</span>
              </button>
              <button
                onClick={() => setViewMode("auto")}
                className={`px-3 py-1 rounded-full flex items-center gap-1.5 transition-all ${
                  viewMode === "auto"
                    ? "bg-white text-zinc-950 shadow-sm"
                    : "text-white/80 hover:text-white"
                }`}
                title="Cards fan out on hover"
              >
                <Sparkles className="h-3 w-3 text-primary" />
                <span>Interactive</span>
              </button>
              <button
                onClick={() => setViewMode("fanned")}
                className={`px-3 py-1 rounded-full flex items-center gap-1.5 transition-all ${
                  viewMode === "fanned"
                    ? "bg-white text-zinc-950 shadow-sm"
                    : "text-white/80 hover:text-white"
                }`}
                title="Keep cards fanned out"
              >
                <span>Fanned</span>
              </button>
            </div>

            {/* Arrows for manual navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevItem}
                aria-label="Previous catalogue panel"
                className="grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-black/25 text-white hover:bg-white/20 transition-colors shadow-xs"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextItem}
                aria-label="Next catalogue panel"
                className="grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-black/25 text-white hover:bg-white/20 transition-colors shadow-xs"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <Link
              to="/shop"
              className="btn bg-white text-zinc-950 hover:bg-zinc-100 h-9 sm:h-10 px-4 sm:px-5 text-xs font-bold uppercase tracking-wider rounded-sm shadow-xl shadow-black/20"
            >
              <span>Explore Complete Catalogue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
