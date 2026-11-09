import { Link } from "@tanstack/react-router";
import { ArrowRight, Users, Settings, Headphones } from "lucide-react";
import consultationEngineerImg from "@/assets/consultation-engineer.jpg";
import { cn } from "@/lib/utils";

interface ConsultationBannerProps {
  className?: string;
}

export function ConsultationBanner({ className }: ConsultationBannerProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden py-8 sm:py-12 lg:py-14 px-4 sm:px-6 lg:px-8",
        className,
      )}
    >
      {/* Full pure white background */}
      <div className="absolute inset-0 bg-white -z-10" />

      {/* Main Elevated Consultation Card - Balanced to max-w-7xl (1280px) */}
      <div className="relative mx-auto w-full max-w-7xl rounded-[24px] sm:rounded-[32px] bg-white border border-zinc-200/80 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Content Area (Columns 1 to 7) */}
          <div className="lg:col-span-7 p-6 sm:p-9 md:p-11 lg:p-12 xl:p-14 flex flex-col justify-center z-10">
            {/* Top Eyebrow */}
            <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
              <div className="h-5 w-5 rounded border border-red-500/80 flex items-center justify-center text-red-600 bg-red-50/50">
                <svg
                  className="w-3 h-3 text-red-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M7 8h10" />
                  <path d="M7 12h6" />
                </svg>
              </div>
              <span className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.18em] uppercase text-red-600">
                EXPERT CONSULTATION
              </span>
              <span className="h-[1.5px] w-8 sm:w-10 bg-red-500/80 rounded-full inline-block" />
            </div>

            {/* Big Headline */}
            <h2 className="font-display text-3xl sm:text-4xl md:text-[42px] lg:text-[44px] font-black tracking-tight leading-tight text-zinc-950">
              Need to <span className="text-red-600">Consult?</span>
            </h2>

            {/* Subtitle */}
            <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm md:text-[14.5px] text-zinc-500 font-sans leading-relaxed max-w-xl">
              Speak with our certified engineering specialists for workshop bay layouts, lifting
              specs, or power requirements.
            </p>

            {/* 3 Feature Pills */}
            <div className="flex flex-wrap items-center gap-5 sm:gap-7 mt-6 sm:mt-8 pt-1 mb-7 sm:mb-9">
              {/* Feature 1 */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0 shadow-xs">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-[11.5px] font-bold text-zinc-900 leading-snug">
                  <div>Certified</div>
                  <div className="text-zinc-700">Engineers</div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0 shadow-xs">
                  <Settings className="w-4 h-4" />
                </div>
                <div className="text-[11.5px] font-bold text-zinc-900 leading-snug">
                  <div>Tailored</div>
                  <div className="text-zinc-700">Solutions</div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0 shadow-xs">
                  <Headphones className="w-4 h-4" />
                </div>
                <div className="text-[11.5px] font-bold text-zinc-900 leading-snug">
                  <div>Fast</div>
                  <div className="text-zinc-700">Support</div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1">
              <Link
                to="/services/book"
                className="h-11 px-6 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <span>CONSULT AN ENGINEER</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/support"
                className="text-xs font-bold text-zinc-800 hover:text-red-600 underline underline-offset-4 decoration-zinc-400 hover:decoration-red-600 inline-flex items-center gap-1.5 transition-colors cursor-pointer py-1"
              >
                <span>Or contact our team</span>
                <ArrowRight className="w-3.5 h-3.5 text-red-600" />
              </Link>
            </div>
          </div>

          {/* Right Visual Area (Columns 8 to 12) */}
          <div className="lg:col-span-5 relative min-h-[300px] sm:min-h-[360px] lg:min-h-[420px] xl:min-h-[440px] overflow-hidden flex items-end justify-center bg-zinc-100">
            {/* Background Image of Engineer holding tablet in modern workshop with red lift */}
            <img
              src={consultationEngineerImg}
              alt="Certified automotive engineering specialist in modern workshop"
              className="absolute inset-0 w-full h-full object-cover object-[42%_center]"
              loading="lazy"
            />

            {/* Red Dynamic Angled Ribbon Accent Overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-30 mix-blend-multiply"
              style={{
                background:
                  "linear-gradient(135deg, rgba(220,38,38,0.7) 0%, rgba(239,68,68,0.1) 40%, transparent 70%)",
              }}
            />

            {/* Smooth left-edge gradient fade to white on large screens */}
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white via-white/40 to-transparent hidden lg:block pointer-events-none" />

            {/* Floating Speech Bubble with 3 White Dots (At Junction) */}
            <div className="absolute left-6 lg:-left-6 top-6 lg:top-1/2 lg:-translate-y-1/2 flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-white shadow-xl ring-8 ring-red-50/90 z-20">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-red-600 flex items-center justify-center text-white shadow-sm">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                  <circle cx="8" cy="10" r="1.2" fill="white" />
                  <circle cx="12" cy="10" r="1.2" fill="white" />
                  <circle cx="16" cy="10" r="1.2" fill="white" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
