import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Zap, Bike, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import targetSectorsWorkshopImg from "@/assets/target-sectors-workshop.jpg";
import evWorkshopBayImg from "@/assets/ev-workshop-bay.jpg";
import motoLiftImg from "@/assets/p-moto-lift.jpg";
import heroWorkshopImg from "@/assets/hero-workshop.jpg";
import commercial3wHubImg from "@/assets/commercial-3w-hub.jpg";

// Custom SVG Icons matching the clean technical line aesthetic
function IconWorkshop({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9.5l9-7 9 7v10.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20V9.5z" />
      <path d="M9 22V12h6v10" />
      <path d="M9 15.5h6" />
      <path d="M9 18.5h6" />
    </svg>
  );
}

function IconDealers({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 15h2l4-4-2-2-4 4-2-2-4 4 2 2 4-4" />
      <path d="M3 7l3.5 3.5a1 1 0 0 0 1.4 0l3.5-3.5a1 1 0 0 0 0-1.4L7.9 2.1a1 1 0 0 0-1.4 0L3 5.6a1 1 0 0 0 0 1.4z" />
      <path d="M13 17l2 2a1 1 0 0 0 1.4 0l4.3-4.3a1 1 0 0 0 0-1.4l-2-2" />
    </svg>
  );
}

function IconFleets({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="15" height="11" x="2" y="6" rx="2" />
      <path d="M17 9h2.5a1 1 0 0 1 .8.4l1.9 2.6H22v4a1 1 0 0 1-1 1h-4" />
      <circle cx="6.5" cy="18" r="2" />
      <circle cx="15.5" cy="18" r="2" />
    </svg>
  );
}

interface TargetSectorItem {
  num: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isFocus?: boolean;
  image: string;
  alt: string;
  tagline: string;
  highlights: string[];
  link: string;
  search?: Record<string, string>;
}

const targetSectors: TargetSectorItem[] = [
  {
    num: "01",
    title: "EV & HYBRID HUBS",
    desc: "1,000V VDE safety tools, battery balancing & EV diagnostic bays",
    icon: Zap,
    badge: "⚡ STRATEGIC FOCUS",
    isFocus: true,
    image: evWorkshopBayImg,
    alt: "PAGE International EV and hybrid high-voltage workshop setup",
    tagline: "NEXT-GEN ELECTRIC MOBILITY",
    highlights: [
      "1,000V Insulated Toolsets",
      "SmartSafe Battery Balancers",
      "EV Bay Safety Barriers",
    ],
    link: "/shop",
    search: { mobility: "EV" },
  },
  {
    num: "02",
    title: "2-WHEELER & BIKE CENTERS",
    desc: "Motorcycle pneumatic lifts, EFI diagnostic scanners & tyre bays",
    icon: Bike,
    badge: "2W / 3W Focus",
    image: motoLiftImg,
    alt: "PAGE International motorcycle and 2-wheeler workshop service equipment",
    tagline: "HIGH-TURNOVER 2W/3W MOBILITY",
    highlights: ["Pneumatic Bike Lifts", "Motorcycle EFI Scanners", "Rapid Tyre Changers"],
    link: "/shop",
    search: { mobility: "2-Wheeler" },
  },
  {
    num: "03",
    title: "AUTOMOTIVE WORKSHOPS",
    desc: "Independent multi-brand garages, 4.0T lifts & 3D wheel alignment",
    icon: IconWorkshop,
    image: targetSectorsWorkshopImg,
    alt: "PAGE International multi-brand automotive service workshop with vehicle lift",
    tagline: "PASSENGER & LIGHT COMMERCIAL",
    highlights: ["4.0 Ton Clear-Floor Lifts", "3D Wheel Alignment", "Launch Diagnostic Scanners"],
    link: "/shop",
    search: { cat: "Garage Equipment" },
  },
  {
    num: "04",
    title: "AUTHORIZED DEALERS",
    desc: "OEM dealership service bays, ADAS calibration & factory tooling",
    icon: IconDealers,
    image: heroWorkshopImg,
    alt: "PAGE International authorized dealership and OEM service hub",
    tagline: "OEM SERVICE NETWORK",
    highlights: ["SmartSafe ADAS Calibration", "OEM Factory Scanners", "High-Bay Turnkey Layouts"],
    link: "/solutions",
  },
  {
    num: "05",
    title: "COMMERCIAL FLEETS",
    desc: "Logistics, bus & corporate depots, heavy column lifts & lube pits",
    icon: IconFleets,
    image: commercial3wHubImg,
    alt: "PAGE International commercial vehicle and corporate fleet depot",
    tagline: "FLEETS & TRANSIT DEPOTS",
    highlights: [
      "Mobile Column Lifts",
      "Preventive Lube Stations",
      "High-Capacity Air Compressors",
    ],
    link: "/solutions",
  },
];

export function TargetSectorsSection() {
  // Sector 01 (EV & HYBRID HUBS) is selected by default so EV is on primary focus
  const [activeSector, setActiveSector] = useState(0);
  const current = targetSectors[activeSector] ?? targetSectors[0]!;

  return (
    <section className="relative w-full bg-white border-b border-border overflow-hidden lg:h-[calc(100vh-4.5rem)] lg:min-h-[600px] lg:max-h-[820px] xl:max-h-[860px] flex items-center">
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch w-full h-full">
        {/* ======================================================== */}
        {/* LEFT COLUMN: DYNAMIC WORKSHOP VISUAL WITH SMOOTH CROSSFADE*/}
        {/* ======================================================== */}
        <div className="lg:col-span-6 relative min-h-[360px] sm:min-h-[420px] lg:h-full overflow-hidden bg-zinc-950 flex flex-col justify-between">
          {/* Layered Crossfade Images corresponding to active sector */}
          {targetSectors.map((sector, idx) => (
            <img
              key={sector.num}
              src={sector.image}
              alt={sector.alt}
              className={cn(
                "absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out",
                activeSector === idx
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-105 pointer-events-none",
              )}
              loading="lazy"
              decoding="async"
            />
          ))}

          {/* Vignette & Contrast Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/60 pointer-events-none" />

          {/* Top-Left Floating Badge */}
          <div className="relative z-10 p-5 sm:p-7">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono uppercase tracking-widest shadow-lg">
              <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
              <span>PAGE WORKSHOP SOLUTIONS</span>
            </div>
          </div>

          {/* Bottom Dynamic Spec Card (Updates with active sector) */}
          <div className="relative z-10 p-5 sm:p-7 max-w-lg">
            <div className="inline-block px-2.5 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
              {current.tagline}
            </div>
            <h3 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-tight leading-tight">
              {current.title}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 mt-1 leading-snug font-sans">
              {current.desc}
            </p>

            {/* Equipment Chips */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {current.highlights.map((h) => (
                <span
                  key={h}
                  className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10.5px] font-sans font-medium text-white/90"
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Direct Shop Equipment Action */}
            <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between">
              <Link
                to={current.link as any}
                search={(current.search || {}) as any}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white hover:text-red-400 transition-colors group cursor-pointer"
              >
                <span>View {current.title} Equipment</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform text-red-500" />
              </Link>
              <span className="text-[11px] font-mono text-zinc-400">Sector {current.num} / 05</span>
            </div>
          </div>

          {/* Dynamic Aerodynamic Angled Red & White Faceted Ribbon (Center Divider) */}
          <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-32 lg:w-44 pointer-events-none z-10 hidden lg:block overflow-hidden">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
              {/* Outer Red Layer */}
              <polygon points="52,0 100,0 100,100 0,100" fill="#dc2626" opacity="0.95" />
              {/* Deep Red Facet */}
              <polygon points="72,0 100,0 100,100 32,100" fill="#b91c1c" />
              {/* Clean White Angled Cut Edge */}
              <polygon points="88,0 100,0 100,100 62,100" fill="#ffffff" />
            </svg>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: HEADLINE, TARGET SECTOR CARDS & CTA        */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 px-6 py-5 sm:px-8 sm:py-6 lg:px-8 xl:px-12 lg:py-4 xl:py-6 bg-white flex flex-col justify-center h-full z-10">
          {/* Header Block: Eyebrow + Massive Headline */}
          <div className="mb-2 sm:mb-2.5">
            {/* Eyebrow with horizontal line */}
            <div className="flex items-center gap-2 mb-1 sm:mb-1.5">
              <span className="text-[10.5px] sm:text-xs font-mono font-bold tracking-[0.2em] uppercase text-red-600">
                TARGET SECTORS
              </span>
              <span className="h-[1.5px] w-10 sm:w-14 bg-red-600/80 rounded-full inline-block" />
            </div>

            {/* Massive Bold Headline */}
            <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-[30px] xl:text-[34px] leading-[1.03] tracking-tight text-zinc-950 uppercase">
              BUILT FOR THE <br />
              BUSINESSES THAT <br />
              KEEP VEHICLES <br />
              <span className="text-red-600">MOVING.</span>
            </h2>
          </div>

          {/* Five Interactive Target Sector Cards */}
          <div className="space-y-1.5 sm:space-y-2 mt-1 sm:mt-2">
            {targetSectors.map((sector, idx) => {
              const isSelected = activeSector === idx;
              const Icon = sector.icon;

              return (
                <div
                  key={sector.num}
                  onClick={() => setActiveSector(idx)}
                  onMouseEnter={() => setActiveSector(idx)}
                  className={cn(
                    "group rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between transition-all duration-200 cursor-pointer select-none",
                    isSelected
                      ? "bg-red-600 text-white shadow-md shadow-red-600/20 border border-red-600"
                      : "bg-white text-zinc-900 border border-zinc-200/80 hover:border-red-500/30 hover:bg-zinc-50/70",
                  )}
                >
                  <div className="flex items-center gap-3.5 sm:gap-4 flex-1">
                    {/* Number */}
                    <span
                      className={cn(
                        "font-mono text-xs sm:text-[13px] font-bold tracking-wider",
                        isSelected ? "text-white" : "text-red-600",
                      )}
                    >
                      {sector.num}
                    </span>

                    {/* Icon */}
                    <div
                      className={cn(
                        "w-5 h-5 flex items-center justify-center shrink-0 transition-colors",
                        isSelected
                          ? "text-white"
                          : sector.isFocus
                            ? "text-emerald-600"
                            : "text-zinc-800",
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Titles */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3
                          className={cn(
                            "font-display text-[11.5px] sm:text-xs font-bold uppercase tracking-wide leading-tight",
                            isSelected ? "text-white" : "text-zinc-950",
                          )}
                        >
                          {sector.title}
                        </h3>

                        {/* Special Badges */}
                        {sector.badge && (
                          <span
                            className={cn(
                              "text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full leading-none",
                              isSelected
                                ? "bg-white text-red-700"
                                : sector.isFocus
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  : "bg-zinc-100 text-zinc-700 border border-zinc-200",
                            )}
                          >
                            {sector.badge}
                          </span>
                        )}
                      </div>

                      <p
                        className={cn(
                          "text-[10px] sm:text-[11px] leading-tight mt-0.5 font-sans",
                          isSelected ? "text-white/90" : "text-zinc-500",
                        )}
                      >
                        {sector.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Dark Solutions Bar */}
          <div className="mt-2.5 sm:mt-3 rounded-xl sm:rounded-2xl bg-zinc-950 text-white px-4 py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <Link
                to="/solutions"
                className="font-display text-[11px] sm:text-xs font-black uppercase tracking-wider text-white hover:text-red-400 inline-flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors"
              >
                <span>EXPLORE TURNKEY SOLUTIONS</span>
                <ArrowRight className="h-3.5 w-3.5 text-red-500" />
              </Link>
              <span className="h-3.5 w-[2px] bg-red-600 hidden sm:inline-block" />
            </div>

            <p className="text-[10px] sm:text-[10.5px] text-zinc-400 font-sans leading-snug">
              Equipping EV workshops, bike garages & commercial service bays across all 64
              districts.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
