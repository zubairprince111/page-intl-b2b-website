import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { images } from "@/lib/data";

export interface SolutionCardItem {
  id: string;
  num: string;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  specs: string[];
  image: string;
  link: string;
  search?: Record<string, string>;
  theme: "dark" | "light" | "graphite" | "accent";
}

// Cubic bezier evaluator for: cubic-bezier(0.22, 1, 0.36, 1)
function cubicBezier(p1x: number, p1y: number, p2x: number, p2y: number) {
  return function (t: number): number {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const ttt = tt * t;
    return 3 * uu * t * p1y + 3 * u * tt * p2y + ttt;
  };
}
const easeHeavy = cubicBezier(0.22, 1, 0.36, 1);

export function ScrollSolutionsStack() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );

  // 6 PAGE Automotive B2B Workshop Solutions (Matching all prompt requirements)
  const solutions: SolutionCardItem[] = useMemo(
    () => [
      {
        id: "workshop-equipment",
        num: "01",
        category: "HEAVY MACHINERY & LIFTS",
        title: "WORKSHOP EQUIPMENT",
        subtitle: "Electro-Hydraulic Lifting Bays",
        description:
          "Commercial 2-post and 4-post vehicle lifts, heavy-duty scissor bays, hydraulic shop presses and vehicle anchoring infrastructure.",
        specs: [
          "4.0T - 5.5T Lift Capacity",
          "CE & ISO 9001 Certified",
          "Heavy Vehicle Clear-Floor",
        ],
        image: images.lift,
        link: "/shop",
        search: { cat: "Garage Equipment" },
        theme: "dark",
      },
      {
        id: "diagnostic-equipment",
        num: "02",
        category: "OE SCANNING & TELEMATICS",
        title: "DIAGNOSTIC SYSTEMS",
        subtitle: "OE Tablets & ECU Consoles",
        description:
          "OE-level bi-directional diagnostic scanners, multi-brand ECU coding tablets, oscilloscopes, and CAN-FD/DoIP vehicle interfaces.",
        specs: ["CAN-FD & DoIP High Speed", "Wireless VCI Protocol", "Multi-System Topology Scan"],
        image: images.scanner,
        link: "/shop",
        search: { cat: "Diagnostic Equipment" },
        theme: "light",
      },
      {
        id: "parts-consumables",
        num: "03",
        category: "COMMERCIAL SPARES DISTRIBUTION",
        title: "PARTS & CONSUMABLES",
        subtitle: "OEM Spares & Rapid Replenishment",
        description:
          "OEM-certified ceramic brake friction sets, heavy-duty commercial starter batteries, synthetic fluids, and scheduled depot replenishment.",
        specs: [
          "ECE R90 Certified Friction",
          "High-Crank AGM Batteries",
          "Daily Workshop Logistics",
        ],
        image: images.brakepads,
        link: "/shop",
        search: { cat: "Brakes" },
        theme: "graphite",
      },
      {
        id: "ev-workshop-solutions",
        num: "04",
        category: "1000V HIGH-VOLTAGE SAFETY",
        title: "EV WORKSHOP SOLUTIONS",
        subtitle: "High-Voltage Isolation & Cells",
        description:
          "IEC 60900 certified 1000V VDE insulated hand tooling sets, high-voltage battery cell balancers, pack diagnostic stations and safety barriers.",
        specs: ["1000V VDE Safety Rated", "Pack Balancer Stations", "Hybrid Safety Isolation"],
        image: images.evBatteryAnalyzer,
        link: "/shop",
        search: { mobility: "EV" },
        theme: "accent",
      },
      {
        id: "tyre-wheel-systems",
        num: "05",
        category: "PRECISION FITMENT & BALANCING",
        title: "TYRE & WHEEL SYSTEMS",
        subtitle: "Pneumatic Bays & Laser Balancing",
        description:
          "Automatic pneumatic tyre changers with dual power assist arms, laser-guided computerised wheel balancers, and run-flat fitment stations.",
        specs: ['10" - 26" Rim Clamping', "Laser Pinpoint Balancing", "Dual Pneumatic Assist"],
        image: images.tyreChanger,
        link: "/shop",
        search: { cat: "Tyre & Wheel" },
        theme: "light",
      },
      {
        id: "commercial-fleet-solutions",
        num: "06",
        category: "DEPOT & LOGISTICS FLEET",
        title: "FLEET & DEPOT SOLUTIONS",
        subtitle: "Pneumatic Plant & Column Lifts",
        description:
          "Continuous-duty 10-bar rotary screw air compressors, mobile column lifts, bulk air piping ring mains, and dedicated fleet supply contracts.",
        specs: ["10 Bar Continuous Rating", "Rotary Screw Efficiency", "Turnkey Workshop Install"],
        image: images.compressor,
        link: "/solutions",
        theme: "dark",
      },
    ],
    [],
  );

  const totalCards = solutions.length;

  // Track reduced motion preference
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(media.matches);
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  // Window resize listener
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll Progress Tracking using requestAnimationFrame
  useEffect(() => {
    let rafId: number;
    const calculateProgress = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const scrollableDistance = sectionRef.current.offsetHeight - window.innerHeight;
      if (scrollableDistance <= 0) return;

      // When rect.top reaches 0, section is pinned; when rect.top reaches -scrollableDistance, section is released
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollableDistance));
      setScrollProgress(progress);
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(calculateProgress);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    calculateProgress();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Determine active card index based on scrollProgress
  // We reserve [0.94 - 1.0] as a hold state for the final card
  const activeCardIndex = useMemo(() => {
    if (scrollProgress <= 0.05) return 0;
    const stepSize = 0.9 / (totalCards - 1);
    const index = Math.min(totalCards - 1, Math.floor((scrollProgress - 0.02) / stepSize) + 1);
    return Math.max(0, Math.min(totalCards - 1, index));
  }, [scrollProgress, totalCards]);

  const activeSolution = solutions[activeCardIndex] ?? solutions[0]!;

  // Desktop vs mobile offset sizing
  const isMobile = windowWidth < 768;
  const cardTopStep = isMobile ? 20 : 28;

  // Card transform & depth logic for each card index
  const getCardTransform = (index: number) => {
    if (isReducedMotion) {
      return {
        transform: "none",
        opacity: 1,
        zIndex: index + 1,
      };
    }

    // Card 0 is already present at progress = 0
    if (index === 0) {
      const settledY = 0;
      // As subsequent cards enter on top of it, scale down slightly for depth
      const depthOffset = activeCardIndex - index;
      const scale = depthOffset > 0 ? Math.max(0.92, 1 - depthOffset * 0.016) : 1;
      return {
        transform: `translate3d(0, ${settledY}px, 0) scale(${scale})`,
        opacity: 1,
        zIndex: 10 + index,
      };
    }

    // For cards 1 to 5: Each has its entry window
    // Step size for transitions across [0.04 to 0.94]
    const transitionStep = 0.9 / (totalCards - 1);
    const startProgress = 0.04 + (index - 1) * transitionStep;
    const endProgress = startProgress + transitionStep * 0.88;

    const targetSettledY = index * cardTopStep;

    if (scrollProgress < startProgress) {
      // Below viewport waiting to rise
      return {
        transform: "translate3d(0, 110%, 0) scale(0.94)",
        opacity: 0,
        zIndex: 10 + index,
      };
    }

    if (scrollProgress >= endProgress) {
      // Settled in stack
      const depthOffset = activeCardIndex - index;
      const scale = depthOffset > 0 ? Math.max(0.92, 1 - depthOffset * 0.016) : 1;
      return {
        transform: `translate3d(0, ${targetSettledY}px, 0) scale(${scale})`,
        opacity: 1,
        zIndex: 10 + index,
      };
    }

    // Currently Rising & Overlapping with heavy cubic-bezier easing
    const rawT = (scrollProgress - startProgress) / (endProgress - startProgress);
    const easedT = easeHeavy(Math.max(0, Math.min(1, rawT)));

    // Starts from 105% of viewport down and moves up to targetSettledY
    const startY = 650;
    const currentY = startY * (1 - easedT) + targetSettledY * easedT;
    const currentScale = 0.94 + 0.06 * easedT;
    const currentOpacity = Math.min(1, easedT * 2.5);

    return {
      transform: `translate3d(0, ${currentY}px, 0) scale(${currentScale})`,
      opacity: currentOpacity,
      zIndex: 10 + index,
    };
  };

  return (
    <section
      ref={sectionRef}
      id="workshop-solutions-stack"
      className="relative bg-[#090A0D] text-white border-b border-zinc-800"
      style={{
        // 380vh scroll height ensures silky smooth pacing (~60vh per card) without feeling trapped
        height: isReducedMotion ? "auto" : "390vh",
      }}
    >
      {/* Visual Ambient Lighting & Technical Blueprint Texture */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft radial spotlight centered on right stack area */}
        <div className="absolute top-[20%] right-[10%] w-[750px] h-[550px] bg-primary/[0.06] blur-[150px] rounded-full" />
        <div className="absolute top-[40%] left-[5%] w-[600px] h-[400px] bg-white/[0.02] blur-[130px] rounded-full" />
        {/* Engineering dot matrix grid */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:32px_32px] opacity-40 [mask-image:radial-gradient(ellipse_80%_70%_at_50%_50%,black_30%,transparent_100%)]" />
      </div>

      {/* ======================================================== */}
      {/* PINNED VIEWPORT CONTAINER                                 */}
      {/* ======================================================== */}
      <div
        className={`${
          isReducedMotion ? "py-20" : "sticky top-0 h-screen flex items-center overflow-hidden"
        } w-full`}
      >
        <div className="container-page w-full relative z-10 py-6 sm:py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* ======================================================== */}
            {/* LEFT COLUMN: Editorial Context & Real-Time Step Tracker  */}
            {/* ======================================================== */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full max-w-xl">
              <div>
                {/* Live Section Eyebrow */}
                <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-[0.25em] text-primary mb-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  <span>SOLUTIONS / 0{activeCardIndex + 1} · WORKSHOP PLATFORM</span>
                </div>

                {/* Section Main Heading (Requested Copy) */}
                <h2 className="display-lg text-white tracking-tight leading-[0.95]">
                  SOLUTIONS FOR <br />
                  <span className="text-zinc-100">THE WORKSHOP.</span>
                </h2>

                {/* Supporting Line */}
                <p className="mt-3 sm:mt-4 text-sm sm:text-base text-zinc-400 font-sans leading-relaxed">
                  Equipment, parts and solutions built around the businesses that keep vehicles
                  moving.
                </p>

                {/* Active Dynamic Solution Overview Panel */}
                <div className="mt-6 sm:mt-8 p-4 sm:p-5 rounded-lg border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md transition-all duration-300">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <span className="text-xs font-mono font-bold text-primary tracking-wider uppercase">
                      {activeSolution.category}
                    </span>
                    <span className="text-xs font-mono text-zinc-500 font-semibold">
                      STEP 0{activeCardIndex + 1} / 0{totalCards}
                    </span>
                  </div>

                  <h3 className="mt-3 font-display text-lg sm:text-xl font-bold uppercase text-white tracking-wide">
                    {activeSolution.title}
                  </h3>

                  <p className="mt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {activeSolution.subtitle}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {activeSolution.specs.map((spec, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 text-[10px] font-mono text-zinc-300 bg-zinc-800/80 px-2.5 py-1 rounded"
                      >
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                        <span>{spec}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Subtle Progress Indicator: 01 ──── 06 & Direct CTA */}
              <div className="mt-8 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* 01 ───── 06 Progress Bar */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-white">01</span>
                  <div className="flex items-center gap-1.5">
                    {solutions.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx <= activeCardIndex
                            ? idx === activeCardIndex
                              ? "w-7 bg-primary shadow-[0_0_8px_rgba(224,36,36,0.6)]"
                              : "w-3 bg-zinc-400"
                            : "w-3 bg-zinc-800"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-mono font-semibold text-zinc-500">06</span>
                </div>

                <Link
                  to="/solutions"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary hover:text-white transition-colors group"
                >
                  <span>All Solutions</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* ======================================================== */}
            {/* RIGHT COLUMN: The Scroll-Driven Stacked Cards            */}
            {/* ======================================================== */}
            <div className="lg:col-span-7 relative flex items-center justify-center">
              {/* Stack Stage Bounds */}
              <div
                className="relative w-full max-w-[580px] lg:max-w-[620px] h-[450px] sm:h-[490px] md:h-[510px]"
                style={{ perspective: "1200px" }}
              >
                {/* Deep Drop Shadow under stack stage */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[85%] h-14 bg-black/80 blur-2xl rounded-full pointer-events-none" />

                {/* Render the 6 Stacking Cards */}
                {solutions.map((item, index) => {
                  const cardStyle = getCardTransform(index);
                  const isCurrent = activeCardIndex === index;

                  // Variety in panel appearance
                  const isLightPanel = item.theme === "light";
                  const isAccent = item.theme === "accent";

                  return (
                    <div
                      key={item.id}
                      className={`absolute top-0 left-0 right-0 rounded-2xl sm:rounded-3xl border transition-shadow duration-300 will-change-transform ${
                        isLightPanel
                          ? "bg-[#FAF9F6] text-zinc-950 border-zinc-200/90 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.55)]"
                          : isAccent
                            ? "bg-[#141518] text-white border-primary/40 ring-1 ring-primary/25 shadow-[0_35px_70px_-15px_rgba(0,0,0,0.7)]"
                            : "bg-[#121316] text-white border-zinc-700/80 shadow-[0_30px_65px_-15px_rgba(0,0,0,0.65)]"
                      }`}
                      style={{
                        transform: cardStyle.transform,
                        opacity: cardStyle.opacity,
                        zIndex: cardStyle.zIndex,
                        height: isMobile ? "380px" : "440px",
                      }}
                    >
                      {/* CARD CONTENT INNER */}
                      <div className="p-5 sm:p-7 flex flex-col justify-between h-full">
                        {/* Top Sticky Header Row (Always visible when stacked behind!) */}
                        <div className="flex items-start justify-between gap-4 pb-3 border-b border-inherit/20">
                          <div className="flex items-center gap-3">
                            {/* Big Bold Industrial Index Number */}
                            <span
                              className={`font-display text-3xl sm:text-4xl font-bold tracking-tight leading-none ${
                                isAccent
                                  ? "text-primary"
                                  : isLightPanel
                                    ? "text-zinc-950"
                                    : "text-white"
                              }`}
                            >
                              {item.num}
                            </span>
                            <div>
                              <span
                                className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${
                                  isAccent
                                    ? "text-primary"
                                    : isLightPanel
                                      ? "text-zinc-500"
                                      : "text-zinc-400"
                                }`}
                              >
                                {item.category}
                              </span>
                              <span
                                className={`font-display text-base sm:text-lg font-bold uppercase leading-tight line-clamp-1 ${
                                  isLightPanel ? "text-zinc-900" : "text-white"
                                }`}
                              >
                                {item.title}
                              </span>
                            </div>
                          </div>

                          {/* Direct Link Action */}
                          <Link
                            to={item.link}
                            search={item.search as any}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 shrink-0 ${
                              isLightPanel
                                ? "bg-zinc-900 text-white hover:bg-zinc-800"
                                : "bg-white text-zinc-950 hover:bg-zinc-100"
                            }`}
                          >
                            <span>Explore</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>

                        {/* Mid Section: Dual Composition (Product Imagery + Industrial Spec) */}
                        <div className="grid grid-cols-12 gap-4 items-center my-auto py-2">
                          {/* Image Box */}
                          <div className="col-span-5 sm:col-span-5 relative aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-b from-black/5 to-black/20 p-2 border border-inherit/10">
                            <img
                              src={item.image}
                              alt={item.title}
                              loading="lazy"
                              className={`h-full w-full object-contain transition-transform duration-500 ${
                                isLightPanel ? "mix-blend-multiply" : "brightness-105"
                              } ${isCurrent ? "scale-105" : "scale-100"}`}
                            />
                          </div>

                          {/* Text / Spec Info */}
                          <div className="col-span-7 sm:col-span-7 flex flex-col justify-center">
                            <p
                              className={`text-xs sm:text-sm leading-relaxed line-clamp-3 ${
                                isLightPanel ? "text-zinc-600" : "text-zinc-300"
                              }`}
                            >
                              {item.description}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {item.specs.slice(0, 2).map((sp, i) => (
                                <span
                                  key={i}
                                  className={`text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                                    isLightPanel
                                      ? "bg-zinc-200/80 text-zinc-800"
                                      : "bg-zinc-800/90 text-zinc-300"
                                  }`}
                                >
                                  {sp}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Bottom Accent / Meta Row */}
                        <div className="pt-2 border-t border-inherit/15 flex items-center justify-between text-[11px] font-mono">
                          <span
                            className={
                              isLightPanel ? "text-zinc-500 font-semibold" : "text-zinc-400"
                            }
                          >
                            B2B Distribution & Infrastructure
                          </span>
                          <span className="font-bold text-primary">Turnkey Solutions →</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
