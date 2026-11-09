import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Ship,
  Truck,
  Wrench,
  Zap,
  Sparkles,
  MapPin,
  Building2,
  Calendar,
  Clock,
  Search,
  Share2,
  Check,
  ChevronRight,
  Filter,
  ArrowUpRight,
  Tag,
  X,
  Radio,
  FileText,
  Bookmark,
  MessageSquare,
} from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { QuoteModal } from "@/components/site/QuoteModal";
import { useUpdates } from "@/lib/data-client";
import { type FeedUpdate, type UpdateCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/updates")({
  head: () => ({
    meta: [
      {
        title: "Field Updates, Shipments & Deliveries — PAGE International Ltd.",
      },
      {
        name: "description",
        content:
          "Live activity feed, inbound shipment notices, client workshop deliveries, equipment commissioning, and technical bulletins from PAGE International.",
      },
      {
        property: "og:title",
        content: "PAGE International — Live Activity Feed & Dispatches",
      },
      {
        property: "og:description",
        content:
          "Track new equipment shipments arriving in Bangladesh and commercial workshop handovers in real time.",
      },
    ],
  }),
  component: UpdatesFeedPage,
});

const CATEGORY_CONFIG: Record<
  UpdateCategory,
  {
    label: string;
    icon: typeof Truck;
    badgeClass: string;
    pillClass: string;
    dotColor: string;
  }
> = {
  shipment_inbound: {
    label: "Shipment Inbound",
    icon: Ship,
    badgeClass:
      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800",
    pillClass: "hover:border-sky-300 hover:text-sky-600",
    dotColor: "bg-sky-500",
  },
  client_delivery: {
    label: "Client Delivery",
    icon: Truck,
    badgeClass:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
    pillClass: "hover:border-emerald-300 hover:text-emerald-600",
    dotColor: "bg-emerald-500",
  },
  commissioning: {
    label: "Commissioning & Trial",
    icon: Wrench,
    badgeClass:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
    pillClass: "hover:border-amber-300 hover:text-amber-600",
    dotColor: "bg-amber-500",
  },
  tech_bulletin: {
    label: "Tech Bulletin",
    icon: Zap,
    badgeClass:
      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
    pillClass: "hover:border-purple-300 hover:text-purple-600",
    dotColor: "bg-purple-500",
  },
  product_launch: {
    label: "Product Launch",
    icon: Sparkles,
    badgeClass:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
    pillClass: "hover:border-rose-300 hover:text-rose-600",
    dotColor: "bg-rose-500",
  },
};

export function UpdatesFeedPage() {
  const { data: rawUpdates = [], isLoading } = useUpdates(true);

  const updates = useMemo<FeedUpdate[]>(() => {
    return rawUpdates.map((u: any) => ({
      id: u.id,
      title: u.title,
      slug: u.slug,
      category: (u.category as UpdateCategory) || "shipment_inbound",
      categoryLabel: CATEGORY_CONFIG[u.category as UpdateCategory]?.label || u.category,
      date: u.publishedAt
        ? new Date(u.publishedAt).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      summary: u.excerpt || u.content.slice(0, 120),
      content: u.content,
      companyOrClient: "PAGE Commercial Partner Bay",
      location: "Tejgaon Central Hub, Dhaka",
      images: u.coverImage ? [u.coverImage] : ["/durga-puja-launch-banner.png"],
      equipmentNames: ["Automotive Bay Lift", "Diagnostic Station"],
      badge: "Verified Commissioning",
      pinned: false,
      published: Boolean(u.isPublished),
      author: "PAGE Field Operations Desk",
      readTimeMinutes: 3,
      tags: ["Commercial", "Workshop", "Installation"],
      createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: u.updatedAt ? new Date(u.updatedAt).toISOString() : new Date().toISOString(),
    }));
  }, [rawUpdates]);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeLocation, setActiveLocation] = useState<string>("all");
  const [readingStory, setReadingStory] = useState<FeedUpdate | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeQuoteProduct, setActiveQuoteProduct] = useState<any>(null);

  // Filter published only for public viewing
  const publishedUpdates = useMemo(() => {
    return updates.filter((u) => u.published);
  }, [updates]);

  // Extract unique regions/cities for quick filter chips
  const locations = useMemo(() => {
    const locs = new Set<string>();
    publishedUpdates.forEach((u) => {
      if (u.location) {
        if (
          u.location.includes("Dhaka") ||
          u.location.includes("Tejgaon") ||
          u.location.includes("Mirpur")
        ) {
          locs.add("Dhaka Region");
        }
        if (u.location.includes("Chittagong") || u.location.includes("Agrabad")) {
          locs.add("Chittagong");
        }
        if (u.location.includes("Sylhet")) {
          locs.add("Sylhet");
        }
      }
    });
    return Array.from(locs);
  }, [publishedUpdates]);

  // Filtered dataset
  const filteredUpdates = useMemo(() => {
    return publishedUpdates.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }

      // Location filter
      if (activeLocation !== "all") {
        if (activeLocation === "Dhaka Region") {
          const match = item.location.toLowerCase();
          if (!match.includes("dhaka") && !match.includes("tejgaon") && !match.includes("mirpur")) {
            return false;
          }
        } else if (activeLocation === "Chittagong") {
          if (
            !item.location.toLowerCase().includes("chittagong") &&
            !item.location.toLowerCase().includes("agrabad")
          ) {
            return false;
          }
        } else if (activeLocation === "Sylhet") {
          if (!item.location.toLowerCase().includes("sylhet")) {
            return false;
          }
        }
      }

      // Search query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(q);
        const inSummary = item.summary.toLowerCase().includes(q);
        const inContent = item.content.toLowerCase().includes(q);
        const inClient = item.companyOrClient?.toLowerCase().includes(q);
        const inLoc = item.location.toLowerCase().includes(q);
        const inEquip = item.equipmentNames?.some((e) => e.toLowerCase().includes(q));
        const inTags = item.tags?.some((t) => t.toLowerCase().includes(q));
        return inTitle || inSummary || inContent || inClient || inLoc || inEquip || inTags;
      }

      return true;
    });
  }, [publishedUpdates, selectedCategory, activeLocation, searchQuery]);

  const handleShare = (item: FeedUpdate) => {
    const url = `${window.location.origin}/updates?slug=${item.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleOpenQuoteForEquipment = (equipName: string) => {
    setActiveQuoteProduct({
      slug: equipName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: equipName,
      category: "Garage Equipment",
      price: 0,
      image: "/durga-puja-launch-banner.png",
      rating: 5,
      reviewsCount: 1,
      stock: "In stock",
      brand: "PAGE Partner Brands",
      specs: [],
      fits: [],
    });
  };

  const categories: { id: string; label: string; count: number }[] = [
    { id: "all", label: "All Dispatches", count: publishedUpdates.length },
    {
      id: "shipment_inbound",
      label: "Inbound Shipments",
      count: publishedUpdates.filter((u) => u.category === "shipment_inbound").length,
    },
    {
      id: "client_delivery",
      label: "Client Deliveries",
      count: publishedUpdates.filter((u) => u.category === "client_delivery").length,
    },
    {
      id: "commissioning",
      label: "Commissioning",
      count: publishedUpdates.filter((u) => u.category === "commissioning").length,
    },
    {
      id: "tech_bulletin",
      label: "Tech Bulletins",
      count: publishedUpdates.filter((u) => u.category === "tech_bulletin").length,
    },
  ];

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Editorial Header */}
      <PageHeader
        eyebrow="Activity Feed & Operational Dispatches"
        title="Field Updates & Logistics"
        intro="Real-time operational dispatches from our logistics desks, port shipments, and client workshop installations across Bangladesh."
      />

      {/* Main Container */}
      <section className="container-page py-10 sm:py-14 lg:py-18">
        {/* Top Control Bar: Search + Category Pills */}
        <div className="space-y-4 mb-10 sm:mb-12">
          {/* Search + Region Pills */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-secondary/50 border border-border">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search updates by equipment, workshop name, port, or city..."
                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Quick Location Filter */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mr-1 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-primary" /> Region:
              </span>
              <button
                type="button"
                onClick={() => setActiveLocation("all")}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer",
                  activeLocation === "all"
                    ? "bg-foreground text-background border-foreground font-semibold"
                    : "bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground",
                )}
              >
                All Regions
              </button>
              {locations.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setActiveLocation(loc)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer",
                    activeLocation === loc
                      ? "bg-foreground text-background border-foreground font-semibold"
                      : "bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground",
                  )}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Category Tabs Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all whitespace-nowrap cursor-pointer shadow-xs",
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-foreground border-border hover:bg-muted hover:border-border/80",
                )}
              >
                <span>{cat.label}</span>
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono",
                    selectedCategory === cat.id
                      ? "bg-white/20 text-white"
                      : "bg-secondary text-muted-foreground",
                  )}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Feed Story Stream */}
        {filteredUpdates.length === 0 ? (
          <div className="text-center py-16 px-4 border border-dashed border-border rounded-2xl bg-card">
            <Radio className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-foreground">No updates matching your filter</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Try adjusting your search query, selecting another category, or clearing region
              filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
                setActiveLocation("all");
              }}
              className="mt-4 btn btn-outline h-9 px-4 text-xs font-bold uppercase"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-12">
            {filteredUpdates.map((item, index) => {
              const cfg = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.shipment_inbound;
              const Icon = cfg.icon;
              const formattedDate = new Date(item.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              });

              return (
                <article
                  key={item.id}
                  className="group relative rounded-2xl sm:rounded-3xl border border-border/80 bg-card hover:border-border transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
                >
                  {/* Top Meta Header Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-8 pt-6 pb-4 border-b border-border/50 bg-secondary/20">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Category Badge */}
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-xs",
                          cfg.badgeClass,
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{item.categoryLabel || cfg.label}</span>
                      </span>

                      {/* Pinned Tag */}
                      {item.pinned && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          <Bookmark className="h-3 w-3 fill-current" />
                          <span>Pinned Dispatch</span>
                        </span>
                      )}

                      {/* Custom Badge */}
                      {item.badge && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {/* Date & Read Time */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        {formattedDate}
                      </span>
                      {item.readTimeMinutes && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.readTimeMinutes} min read
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Main Content Body: Grid Layout (Image + Text Story) */}
                  <div className="p-5 sm:p-8 grid gap-6 lg:grid-cols-12 lg:items-start">
                    {/* Story Left Column */}
                    <div
                      className={cn(
                        "space-y-4",
                        item.images && item.images.length > 0 ? "lg:col-span-7" : "lg:col-span-12",
                      )}
                    >
                      {/* Client / Location Context Line */}
                      {(item.companyOrClient || item.location) && (
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                          {item.companyOrClient && (
                            <div className="flex items-center gap-1.5 font-semibold text-foreground">
                              <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span>{item.companyOrClient}</span>
                            </div>
                          )}
                          {item.location && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                              <span>{item.location}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Headline / Story Title */}
                      <h2
                        onClick={() => setReadingStory(item)}
                        className="text-xl sm:text-2xl lg:text-[26px] font-bold font-display text-foreground leading-snug hover:text-primary transition-colors cursor-pointer"
                      >
                        {item.title}
                      </h2>

                      {/* Summary Paragraph (Hook) */}
                      <p className="text-sm sm:text-base leading-relaxed text-foreground/80 font-normal">
                        {item.summary}
                      </p>

                      {/* Equipment Pills */}
                      {item.equipmentNames && item.equipmentNames.length > 0 && (
                        <div className="pt-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                            Featured Machinery & Tooling:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {item.equipmentNames.map((eq) => (
                              <button
                                key={eq}
                                type="button"
                                onClick={() => handleOpenQuoteForEquipment(eq)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-secondary text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 border border-border/80 transition-all cursor-pointer group/pill"
                              >
                                <Tag className="h-3 w-3 text-primary group-hover/pill:scale-110 transition-transform" />
                                <span>{eq}</span>
                                <ArrowUpRight className="h-3 w-3 opacity-40 group-hover/pill:opacity-100" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Bar: Read Full Story + Share + Quick Quote */}
                      <div className="pt-4 flex flex-wrap items-center gap-3 border-t border-border/60">
                        <button
                          type="button"
                          onClick={() => setReadingStory(item)}
                          className="btn btn-primary h-9 px-4 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <span>Read Full Dispatch</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleShare(item)}
                          className="btn btn-outline h-9 px-3 text-xs font-semibold inline-flex items-center gap-1.5"
                          title="Copy direct link to this dispatch"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="text-emerald-600">Copied Link</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="h-3.5 w-3.5" />
                              <span>Share</span>
                            </>
                          )}
                        </button>

                        <Link
                          to="/support"
                          className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors ml-auto hidden sm:inline-flex items-center gap-1"
                        >
                          <span>Inquire with Commercial Desk</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* Story Right Column (Photography / Visual Preview) */}
                    {item.images && item.images.length > 0 && (
                      <div className="lg:col-span-5 space-y-3">
                        <div
                          onClick={() => setReadingStory(item)}
                          className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden border border-border bg-muted cursor-pointer group/img shadow-sm"
                        >
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            loading={index === 0 ? "eager" : "lazy"}
                            className="w-full h-full object-cover object-center group-hover/img:scale-105 transition-transform duration-500 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end p-4">
                            <span className="text-white text-xs font-semibold inline-flex items-center gap-1">
                              <span>Click to read full dispatch & view photos</span>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        </div>

                        {/* Secondary Thumbnails */}
                        {item.images.length > 1 && (
                          <div className="grid grid-cols-3 gap-2">
                            {item.images.slice(1, 4).map((img, imgIdx) => (
                              <div
                                key={imgIdx}
                                onClick={() => setReadingStory(item)}
                                className="relative aspect-[16/10] rounded-lg overflow-hidden border border-border bg-muted cursor-pointer hover:opacity-80 transition-opacity"
                              >
                                <img
                                  src={img}
                                  alt=""
                                  className="w-full h-full object-cover object-center"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Author Byline */}
                  <div className="px-5 sm:px-8 py-3 bg-secondary/30 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
                    <span className="font-medium">
                      Reported by:{" "}
                      <span className="text-foreground font-semibold">{item.author}</span>
                    </span>
                    <span className="text-primary font-bold uppercase tracking-wider text-[10px]">
                      PAGE International Ltd.
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Bottom Callout: Receive Live Updates via WhatsApp & Email */}
        <div className="mt-14 sm:mt-18 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-secondary/60 p-6 sm:p-10 text-center max-w-3xl mx-auto shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <Radio className="h-6 w-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-display text-foreground uppercase tracking-tight">
            Stay Connected with PAGE Field Operations
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Are you a workshop owner, automotive technician, or corporate fleet manager? Get early
            arrival notices for inbound containers, seasonal discounts, and technician training
            sessions.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://wa.me/8809612724346?text=Hi%20PAGE%20International%2C%20I%20would%20like%20to%20subscribe%20to%20your%20inbound%20shipment%20and%20equipment%20delivery%20updates."
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary h-10 px-6 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-md"
            >
              <span>Connect on WhatsApp Updates</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <Link
              to="/support"
              className="btn btn-outline h-10 px-6 text-xs font-bold uppercase tracking-wider"
            >
              Contact Commercial Desk
            </Link>
          </div>
        </div>
      </section>

      {/* MODAL: Full Reading Experience ("Feel Like Reading It") */}
      {readingStory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setReadingStory(null)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[90vh] bg-card rounded-2xl sm:rounded-3xl border border-border shadow-2xl overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between p-4 sm:p-6 bg-card/95 backdrop-blur-md border-b border-border">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-bold uppercase border",
                    CATEGORY_CONFIG[readingStory.category]?.badgeClass,
                  )}
                >
                  {readingStory.categoryLabel || CATEGORY_CONFIG[readingStory.category]?.label}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {new Date(readingStory.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReadingStory(null)}
                className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-10 space-y-6">
              {/* Context Pill (Client & Location) */}
              {(readingStory.companyOrClient || readingStory.location) && (
                <div className="p-3.5 rounded-xl bg-secondary/50 border border-border flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                  {readingStory.companyOrClient && (
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span>{readingStory.companyOrClient}</span>
                    </div>
                  )}
                  {readingStory.location && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-zinc-400" />
                      <span>{readingStory.location}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-foreground leading-tight">
                {readingStory.title}
              </h1>

              {/* Main Photo */}
              {readingStory.images && readingStory.images.length > 0 && (
                <div className="rounded-2xl overflow-hidden border border-border shadow-md">
                  <img
                    src={readingStory.images[0]}
                    alt={readingStory.title}
                    className="w-full aspect-[16/9] object-cover"
                  />
                </div>
              )}

              {/* Story Content / Paragraphs */}
              <div className="prose prose-zinc dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed space-y-4">
                {readingStory.content.split("\n\n").map((para, pIdx) => (
                  <p key={pIdx} className="whitespace-pre-line text-foreground/90">
                    {para}
                  </p>
                ))}
              </div>

              {/* Featured Equipment Mentioned */}
              {readingStory.equipmentNames && readingStory.equipmentNames.length > 0 && (
                <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary block">
                    Referenced Machinery in This Dispatch:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {readingStory.equipmentNames.map((eq) => (
                      <button
                        key={eq}
                        type="button"
                        onClick={() => {
                          setReadingStory(null);
                          handleOpenQuoteForEquipment(eq);
                        }}
                        className="btn btn-outline h-8 px-3 text-xs font-semibold inline-flex items-center gap-1.5 bg-card hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                      >
                        <Tag className="h-3 w-3 text-primary" />
                        <span>{eq}</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Author & Signature */}
              <div className="pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground">Author: {readingStory.author}</p>
                  <p className="text-[11px]">PAGE International Technical & Operations Group</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleShare(readingStory)}
                  className="btn btn-outline h-9 px-4 text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share This Update</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quote Modal when an equipment is clicked */}
      {activeQuoteProduct && (
        <QuoteModal product={activeQuoteProduct} onClose={() => setActiveQuoteProduct(null)} />
      )}
    </div>
  );
}
