import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ShieldCheck,
  Wrench,
  Zap,
  Calendar,
  PenSquare,
  Clock,
  X,
} from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { MobilityScrollStack } from "@/components/site/MobilityScrollStack";
import { BrandPartners } from "@/components/site/BrandPartners";
import { ReviewCard } from "@/components/site/ReviewCard";
import { ConsultationBanner } from "@/components/site/ConsultationBanner";
import { TargetSectorsSection } from "@/components/site/TargetSectorsSection";
import {
  IconExtensiveNetwork,
  IconMarketPresence,
  IconIndustryConnections,
  IconProactiveSales,
  IconReliablePartner,
  IconFocusedExpertise,
} from "@/components/icons/EngineeringIcons";
import { ProductCard } from "@/components/site/ProductCard";
import { QuoteModal } from "@/components/site/QuoteModal";
import { getPublishedReviews, addPublishedReview, type Review } from "@/lib/reviews";
import { images, products, taka, type Product } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "PAGE International — Automotive Equipment, Parts & Workshop Solutions",
      },
      {
        name: "description",
        content:
          "PAGE International is a specialized B2B supplier and distributor of automotive garage machinery, spare parts, diagnostics, tools, and workshop solutions to service centers, workshops, dealers, fleets, and EV businesses.",
      },
      {
        property: "og:title",
        content: "PAGE International — Automotive Equipment, Parts & Workshop Solutions",
      },
      {
        property: "og:description",
        content:
          "The company behind the workshop. Commercial automotive machinery, spare parts, and workshop engineering.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://page-bd.com/#organization",
              name: "PAGE International Ltd.",
              url: "https://page-bd.com",
              logo: "https://page-bd.com/page logo.png",
              description:
                "Specialized B2B supplier and distributor of automotive garage machinery, spare parts, diagnostics, tools, and workshop solutions in Bangladesh.",
              telephone: "+880-1713-000000",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Tejgaon Industrial Area",
                addressLocality: "Dhaka",
                postalCode: "1208",
                addressCountry: "BD",
              },
            },
            {
              "@type": "WebSite",
              "@id": "https://page-bd.com/#website",
              url: "https://page-bd.com",
              name: "PAGE International",
              publisher: { "@id": "https://page-bd.com/#organization" },
            },
          ],
        }),
      },
    ],
  }),
  component: Home,
});

const heroLines = [
  { prefix: "AUTOMOTIVE", highlight: "EQUIPMENT." },
  { prefix: "AUTOMOTIVE", highlight: "PARTS." },
  { prefix: "WORKSHOP", highlight: "SOLUTIONS." },
];

const HeroVideo = memo(function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.play().catch(() => {});

    const handleWaiting = () => {
      video.play().catch(() => {});
    };
    video.addEventListener("waiting", handleWaiting);
    return () => {
      video.removeEventListener("waiting", handleWaiting);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        className="h-full w-full object-cover object-center opacity-90 brightness-100 pointer-events-none transform-gpu will-change-transform"
      >
        <source src="/1015.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
    </div>
  );
});

function Home() {
  const navigate = useNavigate();

  // 3-second single-line rotating hero headline
  const [heroLineIndex, setHeroLineIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroLineIndex((prev) => (prev + 1) % heroLines.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Active product for quotation modal
  const [activeQuoteProduct, setActiveQuoteProduct] = useState<Product | null>(null);

  // Published reviews state (live dynamic)
  const [publishedReviews, setPublishedReviews] = useState<Review[]>(() => getPublishedReviews());

  useEffect(() => {
    const handleReviewsUpdate = () => {
      setPublishedReviews(getPublishedReviews());
    };
    window.addEventListener("reviews_updated", handleReviewsUpdate);
    window.addEventListener("storage", handleReviewsUpdate);
    return () => {
      window.removeEventListener("reviews_updated", handleReviewsUpdate);
      window.removeEventListener("storage", handleReviewsUpdate);
    };
  }, []);

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [revRating, setRevRating] = useState(5);
  const [revName, setRevName] = useState("");
  const [revRole, setRevRole] = useState("");
  const [revWorkshop, setRevWorkshop] = useState("");
  const [revEquipment, setRevEquipment] = useState("");
  const [revComment, setRevComment] = useState("");

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revName || !revWorkshop || !revComment) return;

    addPublishedReview({
      name: revName.trim(),
      role: revRole.trim() || "Workshop Managing Director",
      workshop: revWorkshop.trim(),
      equipment: revEquipment.trim() || "Commercial Workshop Equipment",
      comment: revComment.trim(),
      title: revEquipment.trim()
        ? `Review on ${revEquipment.trim()}`
        : "Verified Workshop Experience",
    });

    setReviewSubmitted(true);
    setRevName("");
    setRevRole("");
    setRevWorkshop("");
    setRevEquipment("");
    setRevComment("");
  };

  function handleOpenReviewModal() {
    setReviewSubmitted(false);
    setIsReviewModalOpen(true);
  }

  // 4 Featured High-Impact Products
  const featuredItems: Product[] = [
    products.find((p) => p.slug === "heavy-duty-2-post-lift-4t") ?? products[0]!,
    products.find((p) => p.slug === "pro-tyre-changer-assist-arm") ?? products[1]!,
    products.find((p) => p.slug === "digital-wheel-balancer-laser") ?? products[2]!,
    products.find((p) => p.slug === "rotary-screw-air-compressor-10hp") ?? products[3]!,
  ].filter((p): p is Product => Boolean(p));

  return (
    <div className="bg-background text-foreground selection:bg-primary selection:text-white">
      {/* ======================================================== */}
      {/* 01 — HERO: FULL-SCREEN CINEMATIC WORKSHOP ENVIRONMENT     */}
      {/* ======================================================== */}
      <section className="relative h-screen min-h-screen h-[100svh] min-h-[100svh] w-full flex items-center justify-center text-center overflow-hidden bg-black text-white pt-16 sm:pt-20">
        {/* Full-Screen Cinematic Workshop Video (FastStart Streamed & Hardware-Accelerated) */}
        <HeroVideo />

        {/* Hero Content: Centered Bold Typography */}
        <div className="container-page relative z-10 py-16 lg:py-24 flex flex-col items-center justify-center text-center">
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
            {/* Single line headline rotating every 3 seconds */}
            <div className="h-11 sm:h-13 md:h-15 flex items-center justify-center">
              <h1
                key={heroLineIndex}
                className="font-display font-extrabold text-xl sm:text-3xl md:text-4xl lg:text-5xl tracking-tight text-white uppercase drop-shadow-[0_2px_14px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-2 duration-500 whitespace-nowrap"
              >
                <span>{(heroLines[heroLineIndex] ?? heroLines[0]!).prefix} </span>
                <span className="text-primary">
                  {(heroLines[heroLineIndex] ?? heroLines[0]!).highlight}
                </span>
              </h1>
            </div>

            <p className="mt-3 max-w-xl mx-auto text-xs sm:text-sm md:text-base text-zinc-100 leading-relaxed font-sans drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]">
              Professional equipment, parts and workshop solutions for the businesses that keep
              vehicles moving.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 02 — FEATURED PRODUCTS & COMMERCIAL MACHINERY            */}
      {/* ======================================================== */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white border-b border-border">
        <div className="container-page">
          {/* Upper side of that ad card */}
          <div className="mb-6 sm:mb-8">
            <span className="eyebrow text-primary">Commercial Machinery</span>
            <h2 className="display-lg mt-1 text-foreground">FEATURED EQUIPMENT</h2>
          </div>

          {/* That Ad Card */}
          <div className="mb-8 sm:mb-10">
            <MobilityScrollStack />
          </div>

          {/* 4 Strong Products matching /shop card design */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {featuredItems.map((p) => (
              <ProductCard key={p.slug} p={p} onQuote={(prod) => setActiveQuoteProduct(prod)} />
            ))}
          </div>

          {/* Explore All Machinery CTA */}
          <div className="mt-8 sm:mt-10 flex justify-center">
            <Link
              to="/shop"
              search={{ cat: "Garage Equipment" }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-zinc-900 hover:bg-primary dark:hover:bg-primary text-zinc-900 dark:text-zinc-100 hover:text-white dark:hover:text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider border border-zinc-200 dark:border-zinc-700/80 shadow-xs hover:shadow-md transition-all group cursor-pointer"
            >
              <span>Explore All Machinery</span>
              <span className="h-5 w-5 rounded-full bg-primary group-hover:bg-white text-white group-hover:text-primary flex items-center justify-center transition-colors">
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 02B — WORKSHOP ENGINEERING CONSULTATION                  */}
      {/* ======================================================== */}
      <section className="border-b border-border bg-white">
        <ConsultationBanner />
      </section>

      {/* ======================================================== */}
      {/* 08 — TARGET SECTORS: BUILT FOR THE BUSINESSES THAT MOVE  */}
      {/* ======================================================== */}
      <TargetSectorsSection />

      {/* ======================================================== */}
      {/* 08B — WHY CHOOSE US: THE PAGE ADVANTAGE                  */}
      {/* ======================================================== */}
      <section
        id="why-choose-us"
        className="py-16 sm:py-20 bg-zinc-50 border-b border-border scroll-mt-20"
      >
        <div className="container-page">
          {/* Header Row */}
          <div className="pb-8 border-b border-border">
            <div className="max-w-3xl">
              <span className="eyebrow text-primary">Why Choose Us?</span>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-foreground leading-tight mt-1">
                BUILT TO PERFORM. CERTIFIED TO LAST.
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                PAGE International Limited boasts a nationwide footprint of over 500 workshops,
                official industry affiliations, and dedicated on-site technical teams across
                Bangladesh.
              </p>
            </div>
          </div>

          {/* Six Cards In A Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 xl:gap-4 pt-8">
            {[
              {
                num: "01",
                title: "Extensive Network",
                desc: "PAGE International Limited boasts a comprehensive database of over 500 workshops strategically located throughout Bangladesh, ensuring broad reach and accessibility for clients seeking automotive solutions.",
                icon: IconExtensiveNetwork,
              },
              {
                num: "02",
                title: "Strong Market Presence",
                desc: "PAGE International maintains consistent and active communication channels with workshops nationwide, fostering strong relationships and staying informed of market trends and customer needs.",
                icon: IconMarketPresence,
              },
              {
                num: "03",
                title: "Industry Connections",
                desc: "As a member of the Dhaka and Chittagong Workshop Owner Associations, PAGE International Limited demonstrates its commitment to the automotive industry and its involvement in key industry discussions and developments.",
                icon: IconIndustryConnections,
              },
              {
                num: "04",
                title: "Proactive Sales",
                desc: "With a dedicated team undertaking over 100 marketing visits each month, PAGE International actively engages with potential clients, building relationships, and showcasing its products and services.",
                icon: IconProactiveSales,
              },
              {
                num: "05",
                title: "Reliable Partner",
                desc: "PAGE International Limited is committed to providing dependable garage equipment and training solutions, supporting its clients' operational efficiency and workforce development.",
                icon: IconReliablePartner,
              },
              {
                num: "06",
                title: "Focused Expertise",
                desc: "PAGE International Limited specializes in garage equipment and training equipment, allowing the company to provide deep expertise and tailored solutions to its clients within this specific niche.",
                icon: IconFocusedExpertise,
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.num}
                  className="group rounded-xl border border-border bg-white p-4 sm:p-5 flex flex-col hover:border-primary/50 transition-all duration-200 shadow-xs"
                >
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="h-11 w-11 rounded-xl bg-zinc-50 border border-border/80 p-1.5 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-all duration-300 shadow-xs">
                      <Icon className="w-full h-full text-zinc-800" />
                    </div>
                    <span className="font-mono text-[11px] font-bold text-muted-foreground">
                      {card.num}
                    </span>
                  </div>
                  <h3 className="font-display text-xs sm:text-sm font-bold uppercase text-foreground tracking-tight leading-snug">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-[11.5px] text-muted-foreground leading-relaxed font-sans">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 09 — CLIENT REVIEWS & WORKSHOP TESTIMONIALS              */}
      {/* ======================================================== */}
      <section className="py-16 sm:py-20 bg-zinc-50/80 border-b border-border overflow-hidden">
        <div className="container-page mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="eyebrow text-primary">Verified Feedback</span>
              <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-foreground mt-0.5">
                Audited B2B Workshop Feedback
              </h3>
            </div>

            <button
              type="button"
              onClick={handleOpenReviewModal}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-zinc-100 hover:bg-zinc-200/80 text-zinc-500 hover:text-zinc-800 text-xs font-medium transition-colors self-start sm:self-auto cursor-pointer"
            >
              <PenSquare className="w-3.5 h-3.5 text-zinc-400" />
              <span>Drop a review</span>
            </button>
          </div>
        </div>

        {/* Seamless Infinite Slideshow Loop (Left to Right) */}
        <div className="relative w-full overflow-hidden py-2">
          {/* Continuous Left-to-Right Moving Track */}
          <div className="animate-reviews-ltr flex items-center gap-5 sm:gap-6">
            {[...publishedReviews, ...publishedReviews].map((rev, index) => (
              <ReviewCard key={`${rev.id}-${index}`} review={rev} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 10 — BRANDS: MINIMAL LOGO WALL                           */}
      <section id="brands" className="py-14 sm:py-16 bg-white border-b border-border scroll-mt-20">
        <div className="container-page">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground mb-8 sm:mb-10">
            Authorized Equipment & Component Partners
          </p>
          <BrandPartners />
        </div>
      </section>

      {/* ======================================================== */}
      {/* 11 — THINK NEXT: MASSIVE FULL-PAGE BRAND STATEMENT        */}
      {/* ======================================================== */}
      <section className="relative w-full flex flex-col items-center justify-center bg-black text-white text-center overflow-hidden border-t border-zinc-900 py-10 sm:py-14 md:py-18 select-none">
        {/* Ambient atmospheric backdrop */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="h-[30vw] w-[45vw] max-w-[600px] max-h-[260px] rounded-full bg-primary/10 blur-[120px]" />
        </div>

        <div className="relative z-10 w-full flex items-center justify-center overflow-hidden">
          <h2 className="font-display font-black tracking-tighter leading-none text-white uppercase whitespace-nowrap text-[14.7vw] select-none text-center">
            THINK NEXT<span className="text-primary">.</span>
          </h2>
        </div>
      </section>

      {/* Review Submission Modal Dialog (Sent to Admin Panel) */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-zinc-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {reviewSubmitted ? (
              <div className="py-10 text-center animate-in fade-in zoom-in-95 duration-200">
                <div className="h-14 w-14 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Published Immediately</span>
                </div>
                <h3 className="font-display text-xl font-bold uppercase text-foreground">
                  Review Published Successfully
                </h3>
                <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
                  Thank you! Your feedback has been published and is now live in the verified
                  workshop testimonials carousel.
                </p>
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setReviewSubmitted(false);
                      setIsReviewModalOpen(false);
                    }}
                    className="btn btn-primary h-9 px-6 text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-5">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary">
                    Verified B2B Review Submission
                  </span>
                  <h3 className="font-display text-xl font-black uppercase text-zinc-900 mt-1">
                    Share Your Workshop Machinery Experience
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your feedback will be published directly to our community of 500+ workshop
                    owners across Bangladesh.
                  </p>
                </div>

                <form onSubmit={handleReviewSubmit} className="space-y-3.5">
                  {/* Name and Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-zinc-600 mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={revName}
                        onChange={(e) => setRevName(e.target.value)}
                        placeholder="e.g. Engr. Tanvir Ahmed"
                        className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-zinc-600 mb-1">
                        Role / Designation
                      </label>
                      <input
                        type="text"
                        value={revRole}
                        onChange={(e) => setRevRole(e.target.value)}
                        placeholder="e.g. Workshop Managing Director"
                        className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Workshop & Equipment */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-zinc-600 mb-1">
                        Workshop / Hub Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={revWorkshop}
                        onChange={(e) => setRevWorkshop(e.target.value)}
                        placeholder="e.g. Apex Autocare Dhaka"
                        className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-zinc-600 mb-1">
                        Equipment Supplied
                      </label>
                      <input
                        type="text"
                        value={revEquipment}
                        onChange={(e) => setRevEquipment(e.target.value)}
                        placeholder="e.g. 4.0T 2-Post Lift"
                        className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Detailed Comment */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-600 mb-1">
                      Feedback & Performance Details *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={revComment}
                      onChange={(e) => setRevComment(e.target.value)}
                      placeholder="Share your experience regarding build quality, installation certification, and after-sales support..."
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                    />
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      className="btn btn-primary w-full h-10 text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer"
                    >
                      Submit Review For Verification
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Direct Product Quotation Modal */}
      {activeQuoteProduct && (
        <QuoteModal product={activeQuoteProduct} onClose={() => setActiveQuoteProduct(null)} />
      )}
    </div>
  );
}
