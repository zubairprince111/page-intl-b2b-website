import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { images } from "@/lib/data";

/** Editorial hero: vehicle dominant, oversized type, vertical layout lines carried over from the intro. */
export function HeroStory() {
  return (
    <section
      className="relative min-h-[100svh] overflow-hidden bg-ink text-ink-foreground"
      aria-label="Introduction"
    >
      <img
        src={images.heroCar}
        alt="Dark sports sedan in a studio"
        width={1920}
        height={1088}
        fetchPriority="high"
        className="absolute inset-y-0 right-0 h-full w-full object-cover object-[65%_center] md:w-[78%]"
      />
      <div className="absolute inset-0 bg-hero-fade" />
      <div className="absolute inset-0 bg-bottom-fade" />
      <div className="layout-lines absolute inset-0" aria-hidden />

      <div className="relative flex min-h-[100svh] flex-col justify-end px-[clamp(1rem,4vw,3rem)] pb-12 pt-32">
        <p className="eyebrow">PAGE International Ltd.</p>
        <h1 className="display-hero mt-5 max-w-[11ch]">
          Everything your vehicle needs<span className="text-primary">.</span>
        </h1>
        <div className="mt-10 grid gap-8 border-t border-ink-border pt-6 md:grid-cols-[1fr_auto] md:items-end">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-ink-muted">
            Parts. Service. Technology.
          </p>
          <div className="flex flex-wrap gap-6">
            <Link to="/shop" className="link-arrow">
              Shop parts <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/services/book" className="link-arrow text-primary">
              Book service <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
