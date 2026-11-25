import { Link } from "@tanstack/react-router";
import { Clock, Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./Header";

const socialChannels = [
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/page-international-ltd/",
    icon: Linkedin,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/pageinternationalltd/",
    icon: Facebook,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/pageintl",
    icon: Instagram,
  },
] as const;

interface FooterLink {
  label: string;
  to: string;
  search?: Record<string, string | undefined>;
  hash?: string;
}

const navSections: Array<{ title: string; links: FooterLink[] }> = [
  {
    title: "Products",
    links: [
      { label: "Vehicle Washing System", to: "/shop", search: { cat: "Vehicle Washing System" } },
      { label: "Lifting Equipment", to: "/shop", search: { cat: "Lifting Equipment" } },
      { label: "Wheel Service Equipment", to: "/shop", search: { cat: "Wheel Service Equipment" } },
      { label: "Diagnostic Equipment", to: "/shop", search: { cat: "Diagnostic Equipment" } },
      { label: "EV Equipment & Battery", to: "/shop", search: { cat: "EV Equipment" } },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Turnkey Workshop Setup", to: "/solutions" },
      { label: "Modernization & Retrofit", to: "/solutions" },
      { label: "Fleet Depots & Dealerships", to: "/solutions" },
      { label: "Service Center Contracts", to: "/solutions" },
      { label: "Commercial Consultation", to: "/services/book" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Request a Quote", to: "/support" },
      { label: "Service Centers", to: "/service-centers" },
      { label: "Warranty Policy", to: "/warranty" },
      { label: "Vehicle Compatibility", to: "/vehicles" },
      { label: "Book Technical Demo", to: "/services/book" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About PAGE", to: "/about" },
      { label: "Dispatches & Updates", to: "/updates" },
      { label: "Partner Brands", to: "/#brands" },
      { label: "Contact Desk", to: "/support" },
      { label: "Client Portal & Account", to: "/account" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-ink text-ink-foreground border-t border-ink-border">
      {/* Main Grid: Equal-Height Brand + 4 Nav Columns */}
      <div className="container-page py-8 lg:py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-12 lg:gap-10 items-start">
          {/* Brand Info (compact: logo + short line + socials) */}
          <div className="lg:col-span-4 space-y-3.5">
            <Logo />
            <p className="text-xs text-ink-muted leading-relaxed max-w-sm">
              PAGE International Ltd. is an authorized B2B distributor of automotive garage
              machinery, OE diagnostics, and workshop equipment in Bangladesh.
            </p>
            <div className="flex items-center gap-2 pt-0.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10.5px] font-medium text-zinc-300">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Authorized B2B Partner
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              {socialChannels.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`PAGE on ${item.name}`}
                  className="grid h-7 w-7 place-items-center rounded-md border border-ink-border text-ink-muted hover:border-primary/60 hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <item.icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* 4 Navigation Columns (8 cols on lg -> equal 2-col groups) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6 lg:gap-8">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-2.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-foreground">
                  {section.title}
                </h4>
                <ul className="space-y-2 text-xs text-ink-muted">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      {link.search ? (
                        <Link
                          to={link.to}
                          search={link.search as unknown as Record<string, string | undefined>}
                          {...(link.hash ? { hash: link.hash } : {})}
                          className="hover:text-primary transition-colors block py-0.5"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <Link
                          to={link.to}
                          {...(link.hash ? { hash: link.hash } : {})}
                          className="hover:text-primary transition-colors block py-0.5"
                        >
                          {link.label}
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

      {/* Horizontal Contact & Commercial Desk Bar */}
      <div className="border-t border-ink-border/40 bg-black/25 py-3.5">
        <div className="container-page flex flex-wrap items-center justify-between gap-y-2 gap-x-6 text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Sector 14, Uttara Model Town, Dhaka</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
            <a
              href="mailto:pageon18@gmail.com"
              className="hover:text-ink-foreground hover:underline transition-colors"
            >
              pageon18@gmail.com
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
            <a
              href="tel:+8801755502421"
              className="hover:text-ink-foreground hover:underline transition-colors"
            >
              +880 1755-502421
            </a>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
            <Clock className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
            <span>Sat – Thu: 9:00 AM – 7:00 PM</span>
          </div>
        </div>
      </div>

      {/* Clean Bottom Bar */}
      <div className="border-t border-ink-border/40 py-4 bg-black/40">
        <div className="container-page flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-ink-muted">
          <p>© {new Date().getFullYear()} PAGE International Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/privacy" className="hover:text-ink-foreground transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-ink-foreground transition-colors">
              Terms
            </Link>
            <Link to="/warranty" className="hover:text-ink-foreground transition-colors">
              Warranty
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/80" />
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
