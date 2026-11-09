import { ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface WhyChooseUsCardProps {
  className?: string;
}

export function WhyChooseUsCard({ className = "" }: WhyChooseUsCardProps) {
  return (
    <article
      className={`group relative aspect-square w-[250px] sm:w-[270px] shrink-0 rounded-2xl bg-gradient-to-br from-[#0c192c] via-[#0f213a] to-[#091322] text-white border border-[#1e3250] shadow-xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden select-none transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-primary/50 ${className}`}
    >
      {/* Subtle atmospheric glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 w-32 h-32 rounded-full bg-primary/20 blur-2xl" />

      {/* Top Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
          <ShieldCheck className="w-3 h-3 text-primary" />
          <span>The PAGE Standard</span>
        </div>
        <h3 className="font-display text-base sm:text-lg font-black uppercase tracking-tight text-white mt-2 leading-tight">
          Why Choose Us?
        </h3>
      </div>

      {/* Center: Core Value Pillars */}
      <div className="space-y-2.5 my-auto py-1">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
          <p className="text-[11px] sm:text-xs text-zinc-300 leading-tight">
            <strong className="text-white font-semibold">Turnkey Bays:</strong> Certified foundation
            & hydraulic setup
          </p>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
          <p className="text-[11px] sm:text-xs text-zinc-300 leading-tight">
            <strong className="text-white font-semibold">Genuine Spares:</strong> 100% in-stock OEM
            parts
          </p>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
          <p className="text-[11px] sm:text-xs text-zinc-300 leading-tight">
            <strong className="text-white font-semibold">Field Support:</strong> Direct on-site
            certified engineers
          </p>
        </div>
      </div>

      {/* Bottom Link */}
      <div className="pt-2 border-t border-white/10">
        <Link
          to="/about"
          className="group/link inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-primary hover:text-white transition-colors"
        >
          <span>Certified Standards</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
