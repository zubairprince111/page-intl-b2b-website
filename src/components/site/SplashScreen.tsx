import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SplashScreenProps {
  /** Optional callback when splash animation completes */
  onComplete?: () => void;
  /** Force disable splash (e.g. for testing) */
  disabled?: boolean;
}

export function SplashScreen({ onComplete, disabled = false }: SplashScreenProps) {
  const [isMounted, setIsMounted] = useState(!disabled);
  const [isFading, setIsFading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (disabled) return;

    // Ensure video plays
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback
      });
    }

    // Play spinning wheel for ~1.8 seconds, then smooth fade-out
    const displayTimer = setTimeout(() => {
      setIsFading(true);
      const unmountTimer = setTimeout(() => {
        setIsMounted(false);
        onComplete?.();
      }, 650);
      return () => clearTimeout(unmountTimer);
    }, 1800);

    return () => clearTimeout(displayTimer);
  }, [disabled, onComplete]);

  const handleDismiss = () => {
    setIsFading(true);
    setTimeout(() => {
      setIsMounted(false);
      onComplete?.();
    }, 200);
  };

  if (!isMounted || disabled) {
    return null;
  }

  return (
    <aside
      aria-label="Loading"
      role="status"
      onClick={handleDismiss}
      className={cn(
        "fixed inset-0 z-[99999] flex items-center justify-center select-none overflow-hidden cursor-pointer transition-all duration-700 ease-out",
        isFading ? "opacity-0 pointer-events-none scale-105" : "opacity-100",
      )}
      style={{
        background: "radial-gradient(ellipse at 50% 50%, #ef4444 0%, #dc2626 55%, #991b1b 100%)",
      }}
    >
      {/* Subtle Technical Grid & Ambient Lighting Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/20 pointer-events-none" />

      {/* Central Wheel Only - Scaled to 1/4 size */}
      <div className="relative flex items-center justify-center z-10 pointer-events-none">
        {/* Ambient Red Glow Halo */}
        <div className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-red-400/40 blur-xl animate-pulse" />

        {/* Circular Wheel Frame (1/4 size: ~64px-80px) */}
        <div className="relative w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full overflow-hidden shadow-[0_12px_28px_-5px_rgba(0,0,0,0.6)] ring-2 ring-black/40 border border-white/30 bg-zinc-950 flex items-center justify-center">
          {/* Wheel Preloader Video */}
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            className="w-full h-full object-cover scale-[1.44] pointer-events-none transform-gpu will-change-transform"
          >
            <source src="/Car%20wheel%20preloader.mp4" type="video/mp4" />
          </video>

          {/* Scaled Metallic Wheel Center Hub Disc */}
          <div className="absolute inset-0 m-auto w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-zinc-950 border border-zinc-700 shadow-md flex items-center justify-center z-10 ring-[0.5px] ring-white/30">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
          </div>
        </div>
      </div>
    </aside>
  );
}
