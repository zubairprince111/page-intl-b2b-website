import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBanners } from "@/lib/data-client";

export interface BannerItem {
  id: string;
  title: string;
  alt: string;
  image: string;
  link: string;
  mobilityKey?: string;
  bgColor?: string;
  active: boolean;
}

export type MobilityScene = BannerItem;

const FALLBACK_BANNERS: BannerItem[] = [
  {
    id: "banner-launch-durga-puja",
    title: "LAUNCH Professional Diagnostic Solutions",
    alt: "Launch Professional Diagnostic Solutions — Special Offer This Durga Puja Get Up To 20% Off",
    image: "/durga-puja-launch-banner.png",
    link: "/shop?cat=Garage+Equipment",
    mobilityKey: "All",
    bgColor: "bg-white",
    active: true,
  },
  {
    id: "banner-fuel-efficiency",
    title: "4-Wheeler Mobility Showcase — Fuel Efficiency",
    alt: "4-Wheeler Mobility Showcase — Fuel Efficiency",
    image: "/Fuel%20Efficiency%20Highway%20Showcase.png",
    link: "/shop?mobility=4-Wheeler",
    mobilityKey: "4-Wheeler",
    bgColor: "bg-gradient-to-r from-amber-950/40 via-zinc-950 to-sky-950/40",
    active: true,
  },
  {
    id: "banner-diagnostics",
    title: "2-Wheeler Mobility Showcase — Automotive Diagnostics",
    alt: "2-Wheeler Mobility Showcase — Automotive Diagnostics",
    image: "/Futuristic%20Automotive%20Diagnostics%20Showcase.png",
    link: "/shop?mobility=2-Wheeler",
    mobilityKey: "2-Wheeler",
    bgColor: "bg-zinc-900",
    active: true,
  },
  {
    id: "banner-lift",
    title: "3-Wheeler Commercial Mobility — Two-Post Lift 4.0 Ton",
    alt: "3-Wheeler Commercial Mobility — Two-Post Lift 4.0 Ton",
    image: "/Page%20Two-Post%20Lift%204.0%20Ton.png",
    link: "/shop?mobility=3-Wheeler",
    mobilityKey: "3-Wheeler",
    bgColor: "bg-white",
    active: true,
  },
];

export function MobilityScrollStack() {
  const { data: dbBanners = [] } = useBanners(true);

  const banners: BannerItem[] = useMemo(() => {
    if (!dbBanners || dbBanners.length === 0) return FALLBACK_BANNERS;
    return dbBanners.map((b: any) => {
      let bg = "bg-white";
      if (b.badge === "4-Wheeler" || b.title?.includes("4-Wheeler")) {
        bg = "bg-gradient-to-r from-amber-950/40 via-zinc-950 to-sky-950/40";
      } else if (b.badge === "2-Wheeler" || b.title?.includes("2-Wheeler")) {
        bg = "bg-zinc-900";
      }
      return {
        id: b.id,
        title: b.title,
        alt: b.subtitle || b.title,
        image: b.imageUrl,
        link: b.link || "/shop",
        mobilityKey: b.badge || "All",
        bgColor: bg,
        active: b.isActive,
      };
    });
  }, [dbBanners]);

  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Drag / swipe state
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = banners.length;

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Automatic slide progression (5-second intervals, resets on manual change, pauses on hover)
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % total);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, total, currentSlide]);

  // Touch Swipe Handlers (Mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      setDragStartX(touch.clientX);
      setIsDragging(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartX === null) return;
    const touch = e.touches[0];
    if (touch && Math.abs(touch.clientX - dragStartX) > 10) {
      setIsDragging(true);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStartX === null || total <= 1) return;
    const touch = e.changedTouches[0];
    if (touch) {
      const diff = dragStartX - touch.clientX;
      if (diff > 45) {
        nextSlide();
      } else if (diff < -45) {
        prevSlide();
      }
    }
    setDragStartX(null);
    setTimeout(() => setIsDragging(false), 80);
  };

  // Mouse Drag Handlers (Desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only left click triggers drag
    if (e.button !== 0) return;
    setDragStartX(e.clientX);
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStartX === null) return;
    if (Math.abs(e.clientX - dragStartX) > 12) {
      setIsDragging(true);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (dragStartX === null || total <= 1) return;
    const diff = dragStartX - e.clientX;
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    setDragStartX(null);
    setTimeout(() => setIsDragging(false), 80);
  };

  return (
    <div id="mobility-ecosystem" className="w-full">
      {/* Boxed E-commerce Ad Banner (Aspect ratio matches 2100 / 654 = 3.21:1) */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[2100/654] overflow-hidden group select-none rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.12)] border border-zinc-200/90 bg-white"
        style={{ aspectRatio: "2100 / 654" }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => {
          setIsPaused(false);
          setDragStartX(null);
          setIsDragging(false);
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {total === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-100 text-zinc-500 p-6 text-center">
            <p className="text-sm font-semibold">No active featured banners.</p>
            <p className="text-xs text-zinc-400 mt-1">
              Add banners from the Admin Panel to display them here.
            </p>
          </div>
        ) : (
          <>
            {/* Horizontal Slider Track: exactly (total * 100)% wide, shifted by (-100 / total)% per slide */}
            <div
              className="flex h-full transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
              style={{
                width: `${total * 100}%`,
                transform: `translateX(-${(currentSlide * 100) / total}%)`,
              }}
            >
              {banners.map((scene) => {
                const isExternal =
                  scene.link.startsWith("http://") || scene.link.startsWith("https://");
                const isTailwindBg = scene.bgColor?.startsWith("bg-");
                const bgClass = isTailwindBg ? scene.bgColor : !scene.bgColor ? "bg-white" : "";
                const bgStyle =
                  scene.bgColor && !isTailwindBg ? { background: scene.bgColor } : undefined;

                const content = (
                  <>
                    {/* Ambient Blurred Backdrop */}
                    <img
                      src={scene.image}
                      alt=""
                      aria-hidden="true"
                      draggable={false}
                      className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-25 scale-105 pointer-events-none select-none"
                    />

                    {/* Main Showcase Image */}
                    <img
                      src={scene.image}
                      alt={scene.alt || scene.title}
                      draggable={false}
                      className="relative z-10 w-full h-full object-contain object-center transition-transform duration-500 ease-out group-hover/link:scale-[1.01] select-none"
                    />
                  </>
                );

                const handleClick = (e: React.MouseEvent) => {
                  if (isDragging) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                };

                return (
                  <div
                    key={scene.id}
                    className={cn(
                      "h-full shrink-0 relative overflow-hidden flex items-center justify-center select-none",
                      bgClass,
                    )}
                    style={{
                      width: `${100 / total}%`,
                      ...bgStyle,
                    }}
                  >
                    {isExternal ? (
                      <a
                        href={scene.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                        onClick={handleClick}
                        className="relative w-full h-full block cursor-pointer group/link overflow-hidden select-none"
                      >
                        {content}
                      </a>
                    ) : (
                      <Link
                        to={scene.link as any}
                        search={
                          scene.mobilityKey && scene.mobilityKey !== "All"
                            ? ({ mobility: scene.mobilityKey } as any)
                            : ({} as any)
                        }
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                        onClick={handleClick}
                        className="relative w-full h-full block cursor-pointer group/link overflow-hidden select-none"
                      >
                        {content}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Previous Slide Arrow Button */}
            {total > 1 && (
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  prevSlide();
                }}
                aria-label="Previous Slide"
                className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-30 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/95 hover:bg-white text-zinc-900 border border-zinc-200/90 shadow-md hover:shadow-xl flex items-center justify-center opacity-85 hover:opacity-100 transition-all hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}

            {/* Next Slide Arrow Button */}
            {total > 1 && (
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  nextSlide();
                }}
                aria-label="Next Slide"
                className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-30 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/95 hover:bg-white text-zinc-900 border border-zinc-200/90 shadow-md hover:shadow-xl flex items-center justify-center opacity-85 hover:opacity-100 transition-all hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}

            {/* Slide Pagination Indicator Dots */}
            {total > 1 && (
              <div
                className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/20 shadow-lg transition-all"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                {banners.map((scene, idx) => (
                  <button
                    key={scene.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentSlide(idx);
                    }}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300 cursor-pointer p-0",
                      currentSlide === idx
                        ? "w-7 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.85)]"
                        : "w-2 bg-white/60 hover:bg-white hover:w-3.5",
                    )}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
