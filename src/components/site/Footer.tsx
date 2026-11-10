import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
  Wrench,
  Zap,
} from "lucide-react";
import { Logo } from "./Header";

export const socialChannels = [
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/page-international-ltd/",
    icon: Linkedin,
    hoverClass: "hover:border-[#0A66C2] hover:text-[#0A66C2] hover:bg-[#0A66C2]/10",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/pageinternationalltd/",
    icon: Facebook,
    hoverClass: "hover:border-[#1877F2] hover:text-[#1877F2] hover:bg-[#1877F2]/10",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/pageintl",
    icon: Instagram,
    hoverClass: "hover:border-[#E4405F] hover:text-[#E4405F] hover:bg-[#E4405F]/10",
  },
] as const;

const cols: Array<{
  title: string;
  links: Array<{
    l: string;
    to: string;
    search?: Record<string, string>;
    hash?: string;
  }>;
}> = [
  {
    title: "Products",
    links: [
      { l: "Brake Systems & Rotors", to: "/shop", search: { cat: "Brakes" } },
      { l: "Commercial Batteries", to: "/shop", search: { cat: "Batteries" } },
      { l: "Synthetic Lubricants & Fluids", to: "/shop", search: { cat: "Lubricants" } },
      { l: "Air, Oil & Fuel Filters", to: "/shop", search: { cat: "Filters" } },
      { l: "Workshop Hand Tools", to: "/shop", search: { cat: "Workshop Tools" } },
      { l: "Suspension & Steering", to: "/shop", search: { cat: "Suspension" } },
    ],
  },
  {
    title: "Equipment",
    links: [
      { l: "2-Post & Scissor Lifts", to: "/shop", search: { cat: "Garage Equipment" } },
      { l: "Automatic Tyre Changers", to: "/shop", search: { cat: "Tyre & Wheel" } },
      { l: "Digital Wheel Balancers", to: "/shop", search: { cat: "Tyre & Wheel" } },
      { l: "Rotary Screw Compressors", to: "/shop", search: { cat: "Garage Equipment" } },
      { l: "OBD2 Diagnostic Tablets", to: "/shop", search: { cat: "Diagnostic Equipment" } },
      { l: "Brake Lathes & Testers", to: "/shop", search: { cat: "Garage Equipment" } },
    ],
  },
  {
    title: "EV",
    links: [
      { l: "1000V Insulated Tool Kits", to: "/shop", search: { mobility: "EV" } },
      { l: "High-Voltage Battery Analyzers", to: "/shop", search: { mobility: "EV" } },
      { l: "Battery Cell Balancers", to: "/shop", search: { mobility: "EV" } },
      { l: "Workshop DC Fast Chargers", to: "/shop", search: { mobility: "EV" } },
      { l: "EV Safety Barriers & PPE", to: "/shop", search: { mobility: "EV" } },
      { l: "2W / 3W / 4W EV Tooling", to: "/shop", search: { mobility: "EV" } },
    ],
  },
  {
    title: "Solutions",
    links: [
      { l: "Turnkey Workshop Setup", to: "/solutions" },
      { l: "Workshop Modernization", to: "/solutions" },
      { l: "EV Workshop Transition", to: "/solutions" },
      { l: "Service Center Supply", to: "/solutions" },
      { l: "Commercial Fleet Depots", to: "/solutions" },
      { l: "Distributor & Wholesale", to: "/solutions" },
    ],
  },
  {
    title: "Support",
    links: [
      { l: "Request Commercial Quote", to: "/support" },
      { l: "Product Catalogues & Specs", to: "/support" },
      { l: "Machinery Warranty & Service", to: "/warranty" },
      { l: "Bay Layout Consultation", to: "/services/book" },
      { l: "Fitment & Compatibility", to: "/vehicles" },
      { l: "Equip Your Service Center", to: "/service-centers" },
    ],
  },
  {
    title: "Company",
    links: [
      { l: "About PAGE International", to: "/about" },
      { l: "Updates & Dispatches Feed", to: "/updates" },
      { l: "Industrial Demo Hubs", to: "/service-centers" },
      { l: "Partner Brands", to: "/#brands" },
      { l: "Supply Network", to: "/about" },
      { l: "Commercial Terms of Supply", to: "/terms" },
      { l: "Contact Commercial Desk", to: "/support" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-ink text-ink-foreground border-t border-ink-border">
      {/* Top Value Propositions */}
      <div className="border-b border-white/10 bg-black/40 py-7 sm:py-8">
        <div className="container-page grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* 1. Genuine Supply Guarantee */}
          <div className="flex items-start gap-3.5">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" strokeWidth={2} />
            <div>
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                Genuine Supply Guarantee
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5 leading-snug">
                Authorized B2B parts provenance
              </p>
            </div>
          </div>

          {/* 2. Workshop Engineering */}
          <div className="flex items-start gap-3.5">
            <Wrench className="h-5 w-5 text-primary shrink-0 mt-0.5" strokeWidth={2} />
            <div>
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                Workshop Engineering
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5 leading-snug">
                Installation, calibration & training
              </p>
            </div>
          </div>

          {/* 3. EV Readiness */}
          <div className="flex items-start gap-3.5">
            <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" strokeWidth={2} />
            <div>
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                EV Readiness
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5 leading-snug">
                2W, 3W & 4W EV workshop solutions
              </p>
            </div>
          </div>

          {/* 4. Nationwide B2B Logistics */}
          <div className="flex items-start gap-3.5">
            <Truck className="h-5 w-5 text-primary shrink-0 mt-0.5" strokeWidth={2} />
            <div>
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                Nationwide B2B Logistics
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5 leading-snug">
                Express hub dispatch to garages
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Link Columns */}
      <div className="container-page py-14 lg:py-16">
        <div className="grid gap-10 xl:grid-cols-[1.3fr_3fr]">
          {/* Company Brief & Direct Contacts */}
          <div className="max-w-md">
            <Logo />
            <p className="mt-4 text-xs leading-relaxed text-ink-muted">
              PAGE International Ltd. is a specialized B2B supplier and distributor of automotive
              garage machinery, replacement spare parts, diagnostics, and workshop solutions to
              professional service centers, workshops, dealerships, fleets, and EV businesses.
            </p>
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-primary">
              The Company Behind The Workshop.
            </p>

            <div className="mt-6 space-y-2.5 text-xs text-ink-muted">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <a
                  href="https://www.google.com/maps?cid=15320172382916100456&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAMYASAF"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ink-foreground hover:underline transition-colors"
                >
                  Road #18, House # 100, Sector # 14, Uttara Model Town, Dhaka
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <a
                  href="mailto:pageon18@gmail.com"
                  className="hover:text-ink-foreground hover:underline transition-colors"
                >
                  pageon18@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <a
                  href="tel:+8801755502421"
                  className="hover:text-ink-foreground hover:underline transition-colors"
                >
                  +880 1755-502421
                </a>
              </div>
            </div>

            {/* Official Social Media Links */}
            <div className="mt-6 flex items-center gap-2.5">
              {socialChannels.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow PAGE International on ${item.name}`}
                  title={`PAGE International on ${item.name}`}
                  className={cn(
                    "grid h-8.5 w-8.5 place-items-center rounded-lg border border-ink-border text-ink-muted transition-all duration-200 shadow-xs",
                    item.hoverClass,
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* 6 Link Columns: Products, Equipment, EV, Solutions, Support, Company */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-6">
            {cols.map((col) => (
              <div key={col.title}>
                <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-foreground border-b border-ink-border/50 pb-2">
                  {col.title}
                </h3>
                <ul className="mt-3.5 space-y-2 text-xs">
                  {col.links.map((link) => (
                    <li key={link.l}>
                      {"search" in link && link.search ? (
                        <Link
                          to={link.to}
                          search={link.search as any}
                          {...(link.hash ? { hash: link.hash } : {})}
                          className="text-ink-muted transition-colors hover:text-primary"
                        >
                          {link.l}
                        </Link>
                      ) : (
                        <Link
                          to={link.to}
                          {...(link.hash ? { hash: link.hash } : {})}
                          className="text-ink-muted transition-colors hover:text-primary"
                        >
                          {link.l}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar with Payment & Copyright */}
      <div className="border-t border-ink-border/70 bg-black/40">
        <div className="container-page flex flex-col gap-4 py-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} PAGE International Ltd. All rights reserved. B2B Automotive
            Equipment & Spare Parts Distributor.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              THINK NEXT.
            </span>
            <Link to="/privacy" className="hover:text-ink-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-ink-foreground transition-colors">
              Commercial Terms of Supply
            </Link>
            <Link to="/warranty" className="hover:text-ink-foreground transition-colors">
              Equipment Warranty Policy
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1 rounded bg-white/5 px-2 py-0.5 text-[11px] font-medium text-ink-muted hover:bg-primary/20 hover:text-primary transition-colors border border-white/10"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
