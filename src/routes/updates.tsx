import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  ExternalLink,
  Radio,
} from "lucide-react";
import { useUpdates } from "@/lib/data-client";
import { cn } from "@/lib/utils";

// Real image assets
import evWorkshopBayImg from "@/assets/ev-workshop-bay.jpg";
import liftImg from "@/assets/p-lift.jpg";
import scannerImg from "@/assets/p-scanner.jpg";
import motoLiftImg from "@/assets/p-moto-lift.jpg";
import tyreChangerImg from "@/assets/p-tyre-changer.jpg";
import wheelBalancerImg from "@/assets/p-wheel-balancer.jpg";
import compressorImg from "@/assets/p-compressor.jpg";
import consultationImg from "@/assets/consultation-engineer.jpg";
import heroWorkshopImg from "@/assets/hero-workshop.jpg";
import targetSectorsWorkshopImg from "@/assets/target-sectors-workshop.jpg";

export const Route = createFileRoute("/updates")({
  head: () => ({
    meta: [
      {
        title: "Field Updates & Live Dispatches — PAGE International Ltd.",
      },
      {
        name: "description",
        content:
          "Official Instagram-style live operational feed: Inbound container arrivals, client workshop installations, high-voltage EV diagnostic trials, and engineering bulletins across Bangladesh.",
      },
      {
        property: "og:title",
        content: "PAGE International — Live Activity Feed & Field Dispatches",
      },
      {
        property: "og:description",
        content:
          "Track new machinery arrivals, turnkey workshop handovers, and equipment commissioning in real time.",
      },
    ],
  }),
  component: UpdatesFeedPage,
});

export interface InstagramPost {
  id: string;
  slug: string;
  title: string;
  location: string;
  date: string;
  images: string[];
  summary: string;
  caption: string;
  pinned?: boolean | undefined;
}

// Curated high-resolution default field dispatches
const CURATED_FIELD_POSTS: InstagramPost[] = [
  {
    id: "post-1",
    slug: "container-arrival-chittagong-port-hydraulic-lifts",
    title: "Inbound Container Arrival: 16 Units of 4.0T Hydraulic Lifts",
    location: "Chittagong Container Terminal (CCT), Port of Chittagong",
    date: "2026-11-08",
    images: [heroWorkshopImg, liftImg],
    summary:
      "16 certified 4.0T electro-hydraulic two-post lifts cleared through Chittagong Port for Dhaka & Sylhet hubs.",
    caption:
      "40ft High-Cube container cleared through Chittagong customs carrying 16 units of our certified 4.0T electro-hydraulic two-post lifts. Pre-ordered bays for Dhaka & Sylhet service hubs are moving onto transport trailers today. All hydraulic cylinders pressure-tested at 210 bar before dispatch.",
    pinned: true,
  },
  {
    id: "post-2",
    slug: "turnkey-ev-diagnostic-bay-commissioning-tejgaon",
    title: "Turnkey Commissioning: High-Voltage EV Diagnostic Bay",
    location: "Tejgaon Industrial Area, Dhaka",
    date: "2026-11-06",
    images: [evWorkshopBayImg, scannerImg],
    summary:
      "Dedicated 1,000V VDE insulated EV diagnostic workstation handed over and calibrated in Tejgaon.",
    caption:
      "Live commissioning of the first dedicated EV diagnostic bay in Tejgaon. Complete 1,000V VDE insulated setup, CAT IV battery state-of-health analyzer, and digital cell balance workstation handed over to AutoFix Engineering team. Calibration completed with zero earth-leakage variance.",
    pinned: true,
  },
  {
    id: "post-3",
    slug: "rapid-2w-pneumatic-motorcycle-lift-installation-mirpur",
    title: "Rapid 2-Wheeler Service Bays: Pneumatic Motorcycle Scissor Lifts",
    location: "Mirpur Sector 10, Dhaka",
    date: "2026-11-04",
    images: [motoLiftImg, targetSectorsWorkshopImg],
    summary:
      "Four pneumatic foot-pedal motorcycle lifts commissioned in Mirpur with 14-second full-height lift cycles.",
    caption:
      "Four pneumatic foot-pedal motorcycle lifts installed and commissioned for Speed Motors Mirpur. Cycle time to full 1.0m height: 14 seconds flat. Floor-mounted safety drops ensure technicians work at eye-level with zero back strain across 60+ daily bike turnarounds.",
  },
  {
    id: "post-4",
    slug: "3d-wheel-alignment-dynamic-balancer-sylhet",
    title: "Precision Calibration: Dynamic Wheel Balancer & 3D Laser Alignment",
    location: "Agrabad Commercial Area, Chittagong",
    date: "2026-11-02",
    images: [wheelBalancerImg, tyreChangerImg],
    summary:
      "Laser-guided wheel balancing and robotic-arm tyre changing line commissioned in Agrabad, Chittagong.",
    caption:
      'Precision dynamic wheel balancing line operational at Dhaka Tyre Chittagong branch. Direct laser pointer indicates exact clip-on and stick-on lead weight positioning down to 1 gram accuracy. Tyre changer features robotic helper arm for 22" low-profile alloy wheel mounting.',
  },
  {
    id: "post-5",
    slug: "centralized-10bar-screw-compressor-gazipur",
    title: "Continuous Air Power: 15HP Rotary Screw Compressor Installation",
    location: "Gazipur Industrial Corridor, Dhaka",
    date: "2026-10-29",
    images: [compressorImg, consultationImg],
    summary:
      "10-bar compressed air distribution with integrated dryer installed across 8 service bays in Gazipur.",
    caption:
      "Continuous 10-bar compressed air line installed for 8 simultaneous pneumatic bays at GreenFleet Logistics Gazipur hub. Integrated refrigerated air dryer and particulate coalescing filters prevent moisture buildup inside air impact wrenches and tire inflators.",
  },
  {
    id: "post-6",
    slug: "cat-iv-high-voltage-safety-standards-bulletin",
    title: "Technical Field Bulletin: 1,000V VDE Safety Compliance for EV Garages",
    location: "PAGE National Technical Training Academy, Dhaka",
    date: "2026-10-25",
    images: [scannerImg, evWorkshopBayImg],
    summary:
      "Zero-voltage verification checklist and CAT III/IV isolation protocol for hybrid and EV service teams.",
    caption:
      "Field bulletin for automotive technicians handling hybrid & EV high-voltage safety interlocks. Always verify zero voltage across DC bus capacitors with certified CAT III 1000V / CAT IV 600V probes before detaching orange shielding harnesses. Download our 12-point EV inspection checklist.",
  },
];

export function UpdatesFeedPage() {
  const { data: rawUpdates = [] } = useUpdates(true);

  // State management
  const [slideIndices, setSlideIndices] = useState<Record<string, number>>({});
  const [activeDetailPost, setActiveDetailPost] = useState<InstagramPost | null>(null);

  const handleSlideChange = (postId: string, total: number, delta: number) => {
    setSlideIndices((prev) => {
      const current = prev[postId] ?? 0;
      const next = (current + delta + total) % total;
      return { ...prev, [postId]: next };
    });
  };

  // Merge Database Updates with Curated Field Posts
  const allPosts = useMemo<InstagramPost[]>(() => {
    const dbPosts: InstagramPost[] = rawUpdates.map((u) => ({
      id: u.id,
      slug: u.slug || `upd-${u.id}`,
      title: u.title,
      location: "Tejgaon Central Hub, Dhaka",
      date: u.publishedAt
        ? new Date(u.publishedAt).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      images: u.coverImage ? [u.coverImage] : [evWorkshopBayImg],
      summary: u.excerpt || u.content || "",
      caption: u.content || u.excerpt || "",
      pinned: false,
    }));

    // Deduplicate against curated posts
    const dbSlugs = new Set(dbPosts.map((p) => p.slug));
    const uniqueCurated = CURATED_FIELD_POSTS.filter((p) => !dbSlugs.has(p.slug));
    return [...dbPosts, ...uniqueCurated];
  }, [rawUpdates]);

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* TOP PROFILE HEADER */}
      <section className="pt-20 sm:pt-24 pb-6 sm:pb-8 border-b border-border bg-secondary/25">
        <div className="container-page max-w-6xl mx-auto">
          <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-7 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Left: Avatar + Brand Bio */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
                {/* Profile Avatar with Story Gradient Ring */}
                <div className="relative shrink-0">
                  <div className="p-[3px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-red-600 shadow-sm">
                    <div className="p-0.5 rounded-full bg-card">
                      <img
                        src="/page-logo-square.png"
                        alt="PAGE International"
                        className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover bg-white"
                      />
                    </div>
                  </div>
                  <div
                    className="absolute -bottom-0.5 -right-0.5 bg-red-600 text-white rounded-full p-1 border-2 border-card shadow-xs"
                    title="Live Field Feed"
                  >
                    <Radio className="h-3 w-3 animate-pulse" />
                  </div>
                </div>

                {/* Name, Bio & Location */}
                <div className="space-y-2 max-w-xl">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-foreground">
                      page.international
                    </h1>
                    <span title="Verified Commercial Automotive Partner">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-sky-500 fill-sky-500/20" />
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-foreground">
                    PAGE International Ltd. — Industrial & Automotive Infrastructure
                  </p>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Official field feed: Turnkey electro-hydraulic lifts, high-voltage EV diagnostic
                    labs, pneumatic 2W systems, and live inbound container logistics across
                    Bangladesh.
                  </p>

                  <div className="pt-0.5 flex items-center justify-center sm:justify-start text-[11px] font-mono text-primary font-semibold">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      Tejgaon Central Logistics Bay, Dhaka
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Direct CTAs */}
              <div className="flex items-center justify-center lg:justify-end gap-2.5 flex-wrap shrink-0">
                <a
                  href="https://wa.me/8809612724346?text=Hi%20PAGE%20International%2C%20I%20am%20following%20your%20field%20feed%20and%20would%20like%20to%20inquire%20about%20workshop%20machinery."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary h-9 px-4 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
                >
                  <span>Message WhatsApp</span>
                  <ExternalLink className="h-3 w-3" />
                </a>

                <Link
                  to="/services/book"
                  className="btn btn-outline h-9 px-3.5 text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <span>Book Consultation</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN TWO-COLUMN RESPONSIVE FEED CONTAINER (1 col on mobile, 2 cols on desktop) */}
      <main className="container-page max-w-6xl mx-auto py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {allPosts.map((post) => {
            const activeIdx = slideIndices[post.id] ?? 0;
            const currentImg = post.images[activeIdx] || post.images[0];

            return (
              <article
                key={post.id}
                className="flex flex-col rounded-2xl border border-border/80 bg-card shadow-[0_4px_24px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden transition-shadow"
              >
                {/* CARD HEADER */}
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/40 min-w-0">
                  {/* Avatar with gradient ring */}
                  <div className="p-[2px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-red-600 shrink-0">
                    <img
                      src="/page-logo-square.png"
                      alt="PAGE International"
                      className="h-8 w-8 rounded-full object-cover bg-white"
                    />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold font-display text-foreground truncate">
                        page.international
                      </span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-sky-500 fill-sky-500/20 shrink-0" />
                      <span className="text-muted-foreground text-xs">•</span>
                      <span className="text-[11px] text-muted-foreground font-mono shrink-0">
                        {new Date(post.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Location Geotag */}
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                      <span className="truncate font-medium">{post.location}</span>
                    </div>
                  </div>
                </div>

                {/* CARD MEDIA (PHOTO / CAROUSEL) */}
                <div
                  onClick={() => setActiveDetailPost(post)}
                  className="relative aspect-[4/3] md:aspect-[16/10] bg-muted overflow-hidden select-none cursor-pointer group"
                >
                  <img
                    src={currentImg}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    loading="lazy"
                  />

                  {/* Multi-image Carousel Controls */}
                  {post.images.length > 1 && (
                    <>
                      <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold font-mono px-2 py-0.5 rounded-full">
                        {activeIdx + 1} / {post.images.length}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSlideChange(post.id, post.images.length, -1);
                        }}
                        aria-label="Previous image"
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSlideChange(post.id, post.images.length, 1);
                        }}
                        aria-label="Next image"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>

                      <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-1.5 z-10 pointer-events-none">
                        {post.images.map((_, idx) => (
                          <span
                            key={idx}
                            className={cn(
                              "h-1.5 rounded-full transition-all",
                              idx === activeIdx ? "w-4 bg-white" : "w-1.5 bg-white/50",
                            )}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* MINIMAL DISPATCH INFO */}
                <div
                  onClick={() => setActiveDetailPost(post)}
                  className="px-4 py-3.5 sm:px-5 sm:py-4 flex-1 flex flex-col gap-1.5 cursor-pointer"
                >
                  <h2 className="font-bold text-foreground font-display text-sm sm:text-base leading-snug line-clamp-2 hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {post.summary}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      {/* DISPATCH PHOTO PREVIEW MODAL */}
      {activeDetailPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setActiveDetailPost(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[92vh] bg-card rounded-2xl sm:rounded-3xl border border-border shadow-2xl overflow-hidden my-auto grid grid-cols-1 md:grid-cols-12"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Left: Photo */}
            <div className="md:col-span-7 bg-black flex items-center justify-center relative aspect-[4/3] md:aspect-auto md:min-h-[420px]">
              <img
                src={
                  activeDetailPost.images[slideIndices[activeDetailPost.id] ?? 0] ||
                  activeDetailPost.images[0]
                }
                alt={activeDetailPost.title}
                className="w-full h-full object-cover"
              />
              {activeDetailPost.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      handleSlideChange(activeDetailPost.id, activeDetailPost.images.length, -1)
                    }
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSlideChange(activeDetailPost.id, activeDetailPost.images.length, 1)
                    }
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold font-mono px-2.5 py-1 rounded-full">
                    {(slideIndices[activeDetailPost.id] ?? 0) + 1} /{" "}
                    {activeDetailPost.images.length}
                  </div>
                </>
              )}
            </div>

            {/* Modal Right: Clean Dispatch Details */}
            <div className="md:col-span-5 flex flex-col max-h-[500px] md:max-h-[85vh] bg-card">
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src="/page-logo-square.png"
                    alt="PAGE"
                    className="h-8 w-8 rounded-full border border-border shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-foreground truncate">
                        page.international
                      </span>
                      <CheckCircle2 className="h-3 w-3 text-sky-500 fill-sky-500/20 shrink-0" />
                    </div>
                    <span className="text-[11px] text-muted-foreground truncate block">
                      {activeDetailPost.location}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveDetailPost(null)}
                  aria-label="Close preview"
                  className="h-8 w-8 rounded-full bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 overflow-y-auto space-y-3 text-xs sm:text-sm">
                <div className="text-[11px] font-mono text-muted-foreground">
                  {new Date(activeDetailPost.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>

                <h2 className="font-bold text-foreground font-display text-base leading-snug">
                  {activeDetailPost.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
                  {activeDetailPost.caption}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
