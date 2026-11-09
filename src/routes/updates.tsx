import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  Tag,
  ArrowUpRight,
  ShoppingBag,
  Send,
  CheckCircle2,
  ExternalLink,
  Check,
  Radio,
} from "lucide-react";
import { QuoteModal } from "@/components/site/QuoteModal";
import { useUpdates } from "@/lib/data-client";
import { type UpdateCategory } from "@/lib/types";
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

// Category Styling & Metadata
const CATEGORY_CONFIG: Record<
  UpdateCategory,
  {
    label: string;
    badgeClass: string;
    dotColor: string;
  }
> = {
  shipment_inbound: {
    label: "Shipment Inbound",
    badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
    dotColor: "bg-sky-500",
  },
  client_delivery: {
    label: "Client Delivery",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    dotColor: "bg-emerald-500",
  },
  commissioning: {
    label: "Commissioning & Trial",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    dotColor: "bg-amber-500",
  },
  tech_bulletin: {
    label: "Tech Bulletin",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
    dotColor: "bg-purple-500",
  },
  product_launch: {
    label: "Product Launch",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    dotColor: "bg-rose-500",
  },
};

export interface InstagramPost {
  id: string;
  slug: string;
  title: string;
  category: UpdateCategory;
  categoryLabel?: string | undefined;
  location: string;
  date: string;
  images: string[];
  caption: string;
  likes: number;
  commentsCount: number;
  comments: Array<{
    id: string;
    user: string;
    userAvatar?: string | undefined;
    text: string;
    time: string;
    verified?: boolean | undefined;
  }>;
  equipment: Array<{
    name: string;
    slug: string;
    price?: number | undefined;
    image?: string | undefined;
  }>;
  pinned?: boolean | undefined;
  hashtags: string[];
  likedByText: string;
}

// Curated high-resolution default field dispatches
const CURATED_FIELD_POSTS: InstagramPost[] = [
  {
    id: "post-1",
    slug: "container-arrival-chittagong-port-hydraulic-lifts",
    title: "Inbound Container Arrival: 16 Units of 4.0T Hydraulic Lifts",
    category: "shipment_inbound",
    location: "Chittagong Container Terminal (CCT), Port of Chittagong",
    date: "2026-11-08",
    images: [heroWorkshopImg, liftImg],
    caption:
      "40ft High-Cube container cleared through Chittagong customs carrying 16 units of our certified 4.0T electro-hydraulic two-post lifts. Pre-ordered bays for Dhaka & Sylhet service hubs are moving onto transport trailers today. All hydraulic cylinders pressure-tested at 210 bar before dispatch.",
    likes: 218,
    commentsCount: 9,
    comments: [
      {
        id: "c-1",
        user: "tanvir_autofix",
        text: "Excited for our 2 units arriving in Tejgaon tomorrow!",
        time: "1d ago",
        verified: true,
      },
      {
        id: "c-2",
        user: "chittagong_fleet_hub",
        text: "Can we schedule forklift unloading on Thursday morning?",
        time: "18h ago",
        verified: false,
      },
    ],
    equipment: [
      {
        name: "Heavy-Duty 2-Post Electro-Hydraulic Lift 4.0T",
        slug: "heavy-duty-2-post-lift-4t",
        price: 285000,
        image: liftImg,
      },
    ],
    hashtags: [
      "#ChittagongPort",
      "#InboundLogistics",
      "#WorkshopLift",
      "#HeavyMachinery",
      "#PAGEInternational",
    ],
    likedByText: "chittagong_fleet_hub and 217 others",
    pinned: true,
  },
  {
    id: "post-2",
    slug: "turnkey-ev-diagnostic-bay-commissioning-tejgaon",
    title: "Turnkey Commissioning: High-Voltage EV Diagnostic Bay",
    category: "commissioning",
    location: "Tejgaon Industrial Area, Dhaka",
    date: "2026-11-06",
    images: [evWorkshopBayImg, scannerImg],
    caption:
      "Live commissioning of the first dedicated EV diagnostic bay in Tejgaon. Complete 1,000V VDE insulated setup, CAT IV battery state-of-health analyzer, and digital cell balance workstation handed over to AutoFix Engineering team. Calibration completed with zero earth-leakage variance.",
    likes: 342,
    commentsCount: 14,
    comments: [
      {
        id: "c-3",
        user: "greenfleet_bd",
        text: "Does this setup support 800V architecture for commercial electric buses?",
        time: "2d ago",
        verified: true,
      },
      {
        id: "c-4",
        user: "page.international",
        text: "@greenfleet_bd Yes! Rated up to 1,000V DC working voltage with dual interlock safety.",
        time: "1d ago",
        verified: true,
      },
    ],
    equipment: [
      {
        name: "High-Voltage EV Motor & Battery Insulation Tester",
        slug: "high-voltage-ev-motor-insulation-tester",
        price: 115000,
        image: scannerImg,
      },
      {
        name: "Automotive Diagnostic Tablet Scanner X-431",
        slug: "automotive-diagnostic-tablet-scanner",
        price: 165000,
        image: scannerImg,
      },
    ],
    hashtags: [
      "#EVBangladesh",
      "#BatteryDiagnostics",
      "#ElectricVehicles",
      "#TejgaonHub",
      "#CleanMobility",
    ],
    likedByText: "tanvir_autofix and 341 others",
    pinned: true,
  },
  {
    id: "post-3",
    slug: "rapid-2w-pneumatic-motorcycle-lift-installation-mirpur",
    title: "Rapid 2-Wheeler Service Bays: Pneumatic Motorcycle Scissor Lifts",
    category: "client_delivery",
    location: "Mirpur Sector 10, Dhaka",
    date: "2026-11-04",
    images: [motoLiftImg, targetSectorsWorkshopImg],
    caption:
      "Four pneumatic foot-pedal motorcycle lifts installed and commissioned for Speed Motors Mirpur. Cycle time to full 1.0m height: 14 seconds flat. Floor-mounted safety drops ensure technicians work at eye-level with zero back strain across 60+ daily bike turnarounds.",
    likes: 189,
    commentsCount: 6,
    comments: [
      {
        id: "c-5",
        user: "speed_motors_bd",
        text: "Technicians love the foot pedal control. Bay turnover speed doubled on Day 1.",
        time: "3d ago",
        verified: true,
      },
    ],
    equipment: [
      {
        name: "Heavy-Duty Pneumatic Motorcycle Scissor Lift 500kg",
        slug: "pneumatic-motorcycle-scissor-lift-500kg",
        price: 78000,
        image: motoLiftImg,
      },
    ],
    hashtags: [
      "#TwoWheeler",
      "#BikeGarage",
      "#MotorcycleLift",
      "#DhakaMechanics",
      "#RapidTurnaround",
    ],
    likedByText: "speed_motors_bd and 188 others",
  },
  {
    id: "post-4",
    slug: "3d-wheel-alignment-dynamic-balancer-sylhet",
    title: "Precision Calibration: Dynamic Wheel Balancer & 3D Laser Alignment",
    category: "commissioning",
    location: "Agrabad Commercial Area, Chittagong",
    date: "2026-11-02",
    images: [wheelBalancerImg, tyreChangerImg],
    caption:
      'Precision dynamic wheel balancing line operational at Dhaka Tyre Chittagong branch. Direct laser pointer indicates exact clip-on and stick-on lead weight positioning down to 1 gram accuracy. Tyre changer features robotic helper arm for 22" low-profile alloy wheel mounting.',
    likes: 164,
    commentsCount: 8,
    comments: [
      {
        id: "c-6",
        user: "dhaka_tyre_hub",
        text: "The robotic helper arm prevents scratches on chrome rims completely. Top tier build.",
        time: "4d ago",
        verified: true,
      },
    ],
    equipment: [
      {
        name: "Dynamic Digital Wheel Balancer with Laser Indicator",
        slug: "dynamic-digital-wheel-balancer",
        price: 195000,
        image: wheelBalancerImg,
      },
      {
        name: "Automatic Tyre Changer with Robotic Helper Arm",
        slug: "automatic-tyre-changer-helper-arm",
        price: 245000,
        image: tyreChangerImg,
      },
    ],
    hashtags: [
      "#WheelAlignment",
      "#DynamicBalancing",
      "#TyreService",
      "#ChittagongWorkshops",
      "#AlloyWheels",
    ],
    likedByText: "dhaka_tyre_hub and 163 others",
  },
  {
    id: "post-5",
    slug: "centralized-10bar-screw-compressor-gazipur",
    title: "Continuous Air Power: 15HP Rotary Screw Compressor Installation",
    category: "client_delivery",
    location: "Gazipur Industrial Corridor, Dhaka",
    date: "2026-10-29",
    images: [compressorImg, consultationImg],
    caption:
      "Continuous 10-bar compressed air line installed for 8 simultaneous pneumatic bays at GreenFleet Logistics Gazipur hub. Integrated refrigerated air dryer and particulate coalescing filters prevent moisture buildup inside air impact wrenches and tire inflators.",
    likes: 127,
    commentsCount: 5,
    comments: [
      {
        id: "c-7",
        user: "selim_greenfleet",
        text: "Zero air-pressure drop across all 8 lines even with three 1-inch impact guns firing.",
        time: "1w ago",
        verified: true,
      },
    ],
    equipment: [
      {
        name: "Industrial Rotary Screw Air Compressor 15HP",
        slug: "industrial-rotary-screw-compressor-15hp",
        price: 320000,
        image: compressorImg,
      },
    ],
    hashtags: [
      "#RotaryScrewCompressor",
      "#Pneumatics",
      "#FleetMaintenance",
      "#GazipurHub",
      "#EngineeringExcellence",
    ],
    likedByText: "selim_greenfleet and 126 others",
  },
  {
    id: "post-6",
    slug: "cat-iv-high-voltage-safety-standards-bulletin",
    title: "Technical Field Bulletin: 1,000V VDE Safety Compliance for EV Garages",
    category: "tech_bulletin",
    location: "PAGE National Technical Training Academy, Dhaka",
    date: "2026-10-25",
    images: [scannerImg, evWorkshopBayImg],
    caption:
      "Field bulletin for automotive technicians handling hybrid & EV high-voltage safety interlocks. Always verify zero voltage across DC bus capacitors with certified CAT III 1000V / CAT IV 600V probes before detaching orange shielding harnesses. Download our 12-point EV inspection checklist.",
    likes: 295,
    commentsCount: 11,
    comments: [
      {
        id: "c-8",
        user: "arif_speedmotors",
        text: "Our entire workshop team attended this training session. Crucial knowledge for 2026.",
        time: "2w ago",
        verified: true,
      },
    ],
    equipment: [
      {
        name: "Automotive Diagnostic Tablet Scanner X-431",
        slug: "automotive-diagnostic-tablet-scanner",
        price: 165000,
        image: scannerImg,
      },
    ],
    hashtags: [
      "#TechBulletin",
      "#ElectricalSafety",
      "#HighVoltage",
      "#TechnicianTraining",
      "#PAGEAcademy",
    ],
    likedByText: "arif_speedmotors and 294 others",
  },
];

// Stories Highlights data
export function UpdatesFeedPage() {
  const { data: rawUpdates = [] } = useUpdates(true);

  // State management
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});
  const [likesCount, setLikesCount] = useState<Record<string, number>>({});
  const [activeDetailPost, setActiveDetailPost] = useState<InstagramPost | null>(null);
  const [activeQuoteProduct, setActiveQuoteProduct] = useState<any>(null);
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [localComments, setLocalComments] = useState<
    Record<string, Array<{ id: string; user: string; text: string; time: string }>>
  >({});
  const [heartBurstPostId, setHeartBurstPostId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Merge Database Updates with Curated Field Posts
  const allPosts = useMemo<InstagramPost[]>(() => {
    const dbPosts: InstagramPost[] = rawUpdates.map((u: any) => ({
      id: u.id,
      slug: u.slug || `upd-${u.id}`,
      title: u.title,
      category: (u.category as UpdateCategory) || "shipment_inbound",
      categoryLabel: CATEGORY_CONFIG[u.category as UpdateCategory]?.label || u.category,
      location: "Tejgaon Central Hub, Dhaka",
      date: u.publishedAt
        ? new Date(u.publishedAt).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      images: u.coverImage ? [u.coverImage] : [evWorkshopBayImg],
      caption: u.content || u.excerpt || "",
      likes: 95,
      commentsCount: 3,
      comments: [
        {
          id: `db-c-${u.id}`,
          user: "autofix_engineering",
          text: "Noted with commercial desk. Excellent operational documentation.",
          time: "1d ago",
          verified: true,
        },
      ],
      equipment: [
        {
          name: "Heavy-Duty 2-Post Electro-Hydraulic Lift 4.0T",
          slug: "heavy-duty-2-post-lift-4t",
          price: 285000,
          image: liftImg,
        },
      ],
      hashtags: ["#PAGEInternational", "#WorkshopEngineering", "#FieldUpdate"],
      likedByText: "tanvir_autofix and 94 others",
      pinned: false,
    }));

    // Deduplicate against curated posts
    const dbSlugs = new Set(dbPosts.map((p) => p.slug));
    const uniqueCurated = CURATED_FIELD_POSTS.filter((p) => !dbSlugs.has(p.slug));
    return [...dbPosts, ...uniqueCurated];
  }, [rawUpdates]);

  // Handle Like toggle
  const handleToggleLike = (postId: string, initialLikes: number) => {
    setLikedPosts((prev) => {
      const isCurrentlyLiked = !!prev[postId];
      const nextState = !isCurrentlyLiked;
      setLikesCount((lc) => ({
        ...lc,
        [postId]: (lc[postId] ?? initialLikes) + (nextState ? 1 : -1),
      }));
      return { ...prev, [postId]: nextState };
    });
  };

  // Handle Double-Tap Heart animation
  const handleDoubleTap = (postId: string, initialLikes: number) => {
    setHeartBurstPostId(postId);
    setTimeout(() => setHeartBurstPostId(null), 800);
    if (!likedPosts[postId]) {
      handleToggleLike(postId, initialLikes);
    }
  };

  // Handle Bookmark toggle
  const handleToggleBookmark = (postId: string) => {
    setSavedPosts((prev) => {
      const isSaved = !!prev[postId];
      const next = !isSaved;
      showToast(next ? "Saved to your bookmarks" : "Removed from bookmarks");
      return { ...prev, [postId]: next };
    });
  };

  // Handle Share
  const handleSharePost = (post: InstagramPost) => {
    const url = `${window.location.origin}/updates?slug=${post.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard! 📋");
    }
  };

  // Handle Add Comment
  const handleAddComment = (postId: string) => {
    const text = newComments[postId]?.trim();
    if (!text) return;

    setLocalComments((prev) => ({
      ...prev,
      [postId]: [
        ...(prev[postId] || []),
        {
          id: `cmt-${Date.now()}`,
          user: "guest_engineer",
          text,
          time: "Just now",
        },
      ],
    }));

    setNewComments((prev) => ({ ...prev, [postId]: "" }));
    showToast("Field comment posted!");
  };

  // Open quote modal for equipment
  const handleOpenQuote = (equip: {
    name: string;
    slug: string;
    price?: number | undefined;
    image?: string | undefined;
  }) => {
    setActiveQuoteProduct({
      slug: equip.slug,
      name: equip.name,
      category: "Garage Equipment",
      price: equip.price || 0,
      image: equip.image || liftImg,
      rating: 5,
      reviewsCount: 1,
      stock: "In stock",
      brand: "PAGE International Partner",
      specs: [],
      fits: [],
    });
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-foreground text-background font-medium text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-border">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* TOP INSTAGRAM PROFILE HEADER */}
      <section className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10">
            {/* Profile Avatar with Story Gradient Ring */}
            <div className="relative shrink-0 group">
              <div className="p-[3.5px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-red-600 shadow-md">
                <div className="p-1 rounded-full bg-background">
                  <img
                    src="/page-logo-square.png"
                    alt="PAGE International"
                    className="h-20 w-20 sm:h-28 sm:w-28 rounded-full object-cover bg-white"
                  />
                </div>
              </div>
              <div className="absolute bottom-1 right-1 bg-red-600 text-white rounded-full p-1 border-2 border-background shadow-xs">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
              </div>
            </div>

            {/* Profile Info & Actions */}
            <div className="flex-1 text-center sm:text-left space-y-3 sm:space-y-4">
              {/* Username + Verified Badge + CTAs */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center justify-center sm:justify-start gap-1.5">
                  <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-foreground">
                    page.international
                  </h1>
                  <span title="Verified Commercial Automotive Partner">
                    <CheckCircle2 className="h-5 w-5 text-sky-500 fill-sky-500/20" />
                  </span>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <a
                    href="https://wa.me/8809612724346?text=Hi%20PAGE%20International%2C%20I%20am%20following%20your%20field%20feed%20and%20would%20like%20to%20inquire%20about%20workshop%20machinery."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary h-8 px-4 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Message WhatsApp</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  <Link
                    to="/services/book"
                    className="btn btn-outline h-8 px-3.5 text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <span>Book Bay Consultation</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                        showToast("Profile link copied!");
                      }
                    }}
                    className="h-8 w-8 rounded-lg border border-border bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    title="Share profile"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex items-center justify-center sm:justify-start gap-6 sm:gap-8 text-xs sm:text-sm">
                <div>
                  <span className="font-bold text-foreground">{allPosts.length}</span>{" "}
                  <span className="text-muted-foreground">dispatches</span>
                </div>
                <div>
                  <span className="font-bold text-foreground">1,850+</span>{" "}
                  <span className="text-muted-foreground">active bays</span>
                </div>
                <div>
                  <span className="font-bold text-foreground">64</span>{" "}
                  <span className="text-muted-foreground">districts</span>
                </div>
              </div>

              {/* Bio Description */}
              <div className="text-xs sm:text-sm text-foreground/90 max-w-xl space-y-1">
                <p className="font-semibold text-foreground">
                  PAGE International Ltd. — Industrial & Automotive Infrastructure
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  🇧🇩 Official field feed: Turnkey electro-hydraulic lifts, high-voltage EV
                  diagnostic labs, pneumatic 2W systems, and live inbound container logistics across
                  Bangladesh.
                </p>
                <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[11px] font-mono text-primary font-semibold">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Tejgaon Central Logistics Bay, Dhaka
                  </span>
                  <span>•</span>
                  <a
                    href="https://page.com.bd"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline flex items-center gap-1"
                  >
                    page.com.bd
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN VERTICAL FEED CONTAINER */}
      <main className="max-w-[580px] mx-auto px-3 sm:px-4 py-8 space-y-8 sm:space-y-10">
        {allPosts.map((post) => {
          const cfg = CATEGORY_CONFIG[post.category] || CATEGORY_CONFIG.shipment_inbound;
          const isLiked = !!likedPosts[post.id];
          const isSaved = !!savedPosts[post.id];
          const likes = likesCount[post.id] ?? post.likes;
          const commentsList = [...post.comments, ...(localComments[post.id] || [])];

          return (
            <article
              key={post.id}
              className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all"
            >
              {/* CARD HEADER */}
              <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-border/40">
                <div className="flex items-center gap-3">
                  {/* Avatar with gradient ring */}
                  <div className="p-[2px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-red-600">
                    <img
                      src="/page-logo-square.png"
                      alt="PAGE International"
                      className="h-9 w-9 rounded-full object-cover bg-white"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1">
                      <span className="text-xs sm:text-sm font-bold font-display text-foreground">
                        page.international
                      </span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-sky-500 fill-sky-500/20" />
                      <span className="text-muted-foreground text-xs">•</span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {new Date(post.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Location Geotag */}
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                      <span className="truncate max-w-[240px] sm:max-w-[320px] font-medium">
                        {post.location}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right category badge & options */}
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                      cfg.badgeClass,
                    )}
                  >
                    {cfg.label}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleSharePost(post)}
                    className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                    title="Share dispatch"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* CARD MEDIA (CAROUSEL / PHOTO WITH DOUBLE-TAP HEART) */}
              <div
                onDoubleClick={() => handleDoubleTap(post.id, post.likes)}
                className="relative aspect-square sm:aspect-[4/3] bg-muted overflow-hidden select-none cursor-pointer group"
              >
                <img
                  src={post.images[0]}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Double-tap animated heart pop */}
                {heartBurstPostId === post.id && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 animate-in zoom-in-50 duration-300">
                    <Heart className="h-24 w-24 text-white fill-white drop-shadow-2xl animate-pulse" />
                  </div>
                )}

                {/* Category badge overlay on mobile */}
                <div className="sm:hidden absolute top-3 left-3 z-10">
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border shadow-md",
                      cfg.badgeClass,
                      "bg-black/60 text-white border-white/20",
                    )}
                  >
                    {cfg.label}
                  </span>
                </div>

                {/* Multi-image indicator badge */}
                {post.images.length > 1 && (
                  <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    1 / {post.images.length}
                  </div>
                )}
              </div>

              {/* CARD ACTION BAR */}
              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Heart Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleLike(post.id, post.likes)}
                      className="group/btn flex items-center gap-1 focus:outline-none cursor-pointer"
                      aria-label="Like post"
                    >
                      <Heart
                        className={cn(
                          "h-6 w-6 transition-all duration-200 group-hover/btn:scale-115",
                          isLiked
                            ? "text-red-500 fill-red-500 scale-105"
                            : "text-foreground group-hover/btn:text-red-500",
                        )}
                      />
                    </button>

                    {/* Comment Button */}
                    <button
                      type="button"
                      onClick={() => setActiveDetailPost(post)}
                      className="group/btn text-foreground hover:text-primary transition-colors focus:outline-none cursor-pointer"
                      aria-label="View comments"
                    >
                      <MessageCircle className="h-6 w-6 group-hover/btn:scale-110 transition-transform" />
                    </button>

                    {/* Share Button */}
                    <button
                      type="button"
                      onClick={() => handleSharePost(post)}
                      className="group/btn text-foreground hover:text-primary transition-colors focus:outline-none cursor-pointer"
                      aria-label="Share post"
                    >
                      <Send className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleBookmark(post.id)}
                    className="group/btn text-foreground hover:text-primary transition-colors focus:outline-none cursor-pointer"
                    aria-label="Save post"
                  >
                    <Bookmark
                      className={cn(
                        "h-6 w-6 transition-transform group-hover/btn:scale-110",
                        isSaved ? "text-foreground fill-current" : "",
                      )}
                    />
                  </button>
                </div>

                {/* LIKES COUNTER */}
                <div className="text-xs sm:text-sm font-bold text-foreground">
                  Liked by{" "}
                  <span className="font-semibold text-foreground/90">
                    {isLiked ? "You and " : ""}
                    {post.likedByText}
                  </span>
                </div>

                {/* CAPTION & TITLE */}
                <div className="space-y-1 text-xs sm:text-sm leading-relaxed">
                  <div className="font-bold text-foreground font-display">{post.title}</div>
                  <p className="text-foreground/90 font-normal">
                    <span className="font-bold text-foreground mr-1.5">page.international</span>
                    {post.caption}
                  </p>
                </div>

                {/* HASHTAGS */}
                {post.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-semibold text-sky-600 dark:text-sky-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* FEATURED MACHINERY (INSTAGRAM SHOPPING TAG) */}
                {post.equipment.length > 0 && (
                  <div className="pt-2 border-t border-border/50">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                      <ShoppingBag className="h-3 w-3 text-primary" />
                      <span>Featured Machinery & Specs:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {post.equipment.map((eq) => (
                        <button
                          key={eq.name}
                          type="button"
                          onClick={() => handleOpenQuote(eq)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-secondary/80 hover:bg-primary/10 hover:text-primary hover:border-primary/40 border border-border transition-all cursor-pointer shadow-2xs group/tag"
                        >
                          <Tag className="h-3 w-3 text-primary group-hover/tag:scale-110 transition-transform" />
                          <span className="truncate max-w-[260px]">{eq.name}</span>
                          <ArrowUpRight className="h-3 w-3 opacity-60 group-hover/tag:opacity-100" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* COMMENTS PREVIEW */}
                <div className="pt-1 space-y-1 text-xs">
                  {commentsList.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveDetailPost(post)}
                      className="text-muted-foreground hover:text-foreground text-xs font-medium cursor-pointer"
                    >
                      View all {commentsList.length} field comments
                    </button>
                  )}

                  {commentsList.slice(-2).map((cmt) => (
                    <div key={cmt.id} className="text-foreground/90 leading-tight">
                      <span className="font-bold text-foreground mr-1.5">{cmt.user}</span>
                      <span>{cmt.text}</span>
                    </div>
                  ))}
                </div>

                {/* ADD COMMENT INPUT BAR */}
                <div className="pt-2 flex items-center gap-2 border-t border-border/40">
                  <input
                    type="text"
                    value={newComments[post.id] || ""}
                    onChange={(e) =>
                      setNewComments((prev) => ({ ...prev, [post.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddComment(post.id);
                      }
                    }}
                    placeholder="Add a field inquiry or technical note..."
                    className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none py-1"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddComment(post.id)}
                    disabled={!newComments[post.id]?.trim()}
                    className="text-primary font-bold text-xs uppercase disabled:opacity-30 disabled:pointer-events-none hover:text-primary/80 transition-colors"
                  >
                    Post
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </main>

      {/* INSTAGRAM POST DETAIL MODAL (DESKTOP SPLIT VIEW) */}
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
            <div className="md:col-span-7 bg-black flex items-center justify-center relative aspect-square md:aspect-auto">
              <img
                src={activeDetailPost.images[0]}
                alt={activeDetailPost.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Modal Right: Instagram Comments & Details Sidebar */}
            <div className="md:col-span-5 flex flex-col justify-between max-h-[500px] md:max-h-[85vh] bg-card">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/page-logo-square.png"
                    alt="PAGE"
                    className="h-8 w-8 rounded-full border border-border"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-foreground">page.international</span>
                      <CheckCircle2 className="h-3 w-3 text-sky-500 fill-sky-500/20" />
                    </div>
                    <span className="text-[11px] text-muted-foreground truncate block max-w-[180px]">
                      {activeDetailPost.location}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveDetailPost(null)}
                  className="h-8 w-8 rounded-full bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Sidebar Scrollable Body */}
              <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
                {/* Author caption */}
                <div className="space-y-1.5 pb-3 border-b border-border/50">
                  <h4 className="font-bold text-foreground font-display text-sm">
                    {activeDetailPost.title}
                  </h4>
                  <p className="text-foreground/90 leading-relaxed">{activeDetailPost.caption}</p>
                  <div className="flex flex-wrap gap-1 text-[11px] text-sky-600 dark:text-sky-400">
                    {activeDetailPost.hashtags.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </div>

                {/* Featured Equipment CTA */}
                {activeDetailPost.equipment.length > 0 && (
                  <div className="p-3 rounded-xl bg-secondary/50 border border-border space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                      Machinery Referenced:
                    </span>
                    {activeDetailPost.equipment.map((eq) => (
                      <button
                        key={eq.name}
                        type="button"
                        onClick={() => {
                          setActiveDetailPost(null);
                          handleOpenQuote(eq);
                        }}
                        className="w-full btn btn-outline h-8 px-2.5 text-xs font-semibold inline-flex items-center justify-between bg-card hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                      >
                        <span className="truncate">{eq.name}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-bold uppercase text-muted-foreground">
                    Field Inquiries & Notes:
                  </span>
                  {[
                    ...activeDetailPost.comments,
                    ...(localComments[activeDetailPost.id] || []),
                  ].map((cmt) => (
                    <div key={cmt.id} className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-foreground">{cmt.user}</span>
                        <span className="text-[10px] text-muted-foreground">{cmt.time}</span>
                      </div>
                      <p className="text-muted-foreground leading-snug">{cmt.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar Action Footer */}
              <div className="p-4 border-t border-border bg-secondary/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleLike(activeDetailPost.id, activeDetailPost.likes)}
                      className="focus:outline-none"
                    >
                      <Heart
                        className={cn(
                          "h-5 w-5",
                          likedPosts[activeDetailPost.id]
                            ? "text-red-500 fill-red-500"
                            : "text-foreground",
                        )}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSharePost(activeDetailPost)}
                      className="text-foreground hover:text-primary"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                  <button type="button" onClick={() => handleToggleBookmark(activeDetailPost.id)}>
                    <Bookmark
                      className={cn(
                        "h-5 w-5",
                        savedPosts[activeDetailPost.id] ? "fill-current text-foreground" : "",
                      )}
                    />
                  </button>
                </div>

                <div className="text-xs font-bold text-foreground">
                  {likesCount[activeDetailPost.id] ?? activeDetailPost.likes} likes
                </div>

                {/* Add Comment in Modal */}
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={newComments[activeDetailPost.id] || ""}
                    onChange={(e) =>
                      setNewComments((prev) => ({
                        ...prev,
                        [activeDetailPost.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddComment(activeDetailPost.id);
                      }
                    }}
                    placeholder="Add an inquiry..."
                    className="flex-1 bg-secondary border border-border rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddComment(activeDetailPost.id)}
                    disabled={!newComments[activeDetailPost.id]?.trim()}
                    className="btn btn-primary h-8 px-3 text-xs font-bold uppercase disabled:opacity-30"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUOTE MODAL */}
      {activeQuoteProduct && (
        <QuoteModal product={activeQuoteProduct} onClose={() => setActiveQuoteProduct(null)} />
      )}
    </div>
  );
}
