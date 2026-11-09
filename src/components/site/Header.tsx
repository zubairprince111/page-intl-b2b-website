import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronRight,
  Facebook,
  Instagram,
  Linkedin,
  Menu,
  ShoppingBag,
  Wrench,
  X,
  Zap,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { useCurrentUser } from "@/lib/auth-client";

const shopLinks = [
  {
    to: "/shop",
    label: "Products",
    desc: "Complete catalog of parts, tools & workshop machinery",
    icon: ShoppingBag,
  },
  {
    to: "/shop",
    search: { cat: "Garage Equipment" },
    label: "Garage Equipment",
    desc: "Lifts, tyre changers, wheel balancers & compressors",
    icon: Wrench,
  },
  {
    to: "/shop",
    search: { mobility: "EV" },
    label: "EV",
    desc: "Electric vehicle tools, battery analyzers & safety kits",
    icon: Zap,
  },
] as const;

const navLinks = [
  { to: "/updates", label: "Updates" },
  { to: "/solutions", label: "Solutions" },
  { to: "/support", label: "Support" },
  { to: "/about", label: "About" },
] as const;

export function Logo({ className = "" }: { className?: string; scrolled?: boolean }) {
  return (
    <Link
      to="/"
      aria-label="PAGE International Ltd."
      className={`group flex items-center ${className}`}
    >
      <img
        src="/page logo.png"
        alt="PAGE International Ltd."
        width={140}
        height={56}
        className="h-8 sm:h-9 md:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
      />
    </Link>
  );
}

export function Header() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const { count } = useCart();
  const { data: currentUser } = useCurrentUser();

  useEffect(() => {
    setOpen(false);
    setShopDropdownOpen(false);
  }, [path]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Check if current page begins with dark hero/header
  const isDarkTopPage =
    path === "/" ||
    path.startsWith("/solutions") ||
    path.startsWith("/support") ||
    path.startsWith("/about") ||
    path.startsWith("/service-centers");

  // Show liquid glass if user has scrolled down, if on a light-background page, or if mobile menu is open
  const isGlass = scrolled || !isDarkTopPage || open;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-in-out ${
          isGlass
            ? "bg-white/90 backdrop-blur-2xl border-b border-zinc-200/80 shadow-[inset_0_1px_1.5px_0_rgba(255,255,255,1),0_12px_36px_-8px_rgba(0,0,0,0.08)] text-zinc-900"
            : "bg-gradient-to-b from-black/60 via-black/25 to-transparent border-b border-white/10 text-white"
        }`}
      >
        {/* Main Header Row */}
        <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-[4.25rem]">
          <Logo scrolled={isGlass} />

          {/* Primary Navigation Links (Desktop) */}
          <nav aria-label="Primary" className="hidden items-center gap-4 xl:gap-6 lg:flex">
            {/* Shop Dropdown Button & Submenu */}
            <div
              className="relative"
              onMouseEnter={() => setShopDropdownOpen(true)}
              onMouseLeave={() => setShopDropdownOpen(false)}
            >
              <Link
                to="/shop"
                onClick={() => setShopDropdownOpen(false)}
                className={`relative flex items-center gap-1.5 py-2 text-xs xl:text-[13px] font-bold uppercase tracking-wider transition-colors ${
                  isGlass ? "text-zinc-700 hover:text-primary" : "text-white/85 hover:text-white"
                } ${
                  path.startsWith("/shop")
                    ? isGlass
                      ? "!text-primary after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:bg-primary after:shadow-[0_0_6px_rgba(224,36,36,0.6)]"
                      : "!text-white after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:bg-primary after:shadow-[0_0_6px_rgba(224,36,36,0.6)]"
                    : ""
                }`}
              >
                <span>Shop</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    shopDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </Link>

              {/* Dropdown Menu */}
              {shopDropdownOpen && (
                <div className="absolute left-0 top-full pt-2 z-50 min-w-[280px] animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="rounded-xl border border-zinc-200/90 bg-white/95 p-2 shadow-2xl backdrop-blur-2xl ring-1 ring-black/5 text-zinc-900">
                    <div className="px-3 py-1.5 text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-600">
                      Product Categories
                    </div>
                    <div className="space-y-1">
                      {shopLinks.map((item) => (
                        <Link
                          key={item.label}
                          to={item.to}
                          search={"search" in item ? item.search : {}}
                          onClick={() => setShopDropdownOpen(false)}
                          className="group flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-zinc-100"
                        >
                          <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                            <item.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold uppercase tracking-wider text-zinc-900 group-hover:text-primary transition-colors">
                              {item.label}
                            </div>
                            <div className="text-[11px] text-zinc-600 line-clamp-1">
                              {item.desc}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {navLinks.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                className={`relative py-2 text-xs xl:text-[13px] font-bold uppercase tracking-wider transition-colors ${
                  isGlass ? "text-zinc-700 hover:text-primary" : "text-white/85 hover:text-white"
                }`}
                activeProps={{
                  className: `${
                    isGlass ? "!text-primary" : "!text-white"
                  } after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:bg-primary after:shadow-[0_0_6px_rgba(224,36,36,0.6)]`,
                }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            {/* Admin Portal Sign In */}
            <Link
              to={currentUser ? "/admin" : "/admin/login"}
              aria-label={currentUser ? `Admin Portal: ${currentUser.name}` : "Admin Staff Sign In"}
              title={currentUser ? `Admin Portal: ${currentUser.name}` : "Admin Staff Sign In"}
              className={`relative grid h-9.5 w-9.5 place-items-center rounded-full border transition-all ${
                isGlass
                  ? "border-zinc-200/90 bg-white/80 hover:bg-white text-zinc-800 shadow-xs"
                  : "border-white/20 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
              }`}
            >
              {currentUser ? (
                <span className="text-[11px] font-bold font-mono text-primary">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </span>
              ) : (
                <User className="h-4 w-4" />
              )}
            </Link>

            <Link
              to="/cart"
              aria-label={`Cart, ${count} items`}
              className={`relative grid h-9.5 w-9.5 place-items-center rounded-full border transition-all ${
                isGlass
                  ? "border-zinc-200/90 bg-white/80 hover:bg-white text-zinc-800 shadow-xs"
                  : "border-white/20 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-primary px-1 text-[10px] font-black text-white shadow-md">
                  {count}
                </span>
              )}
            </Link>

            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={open}
              className={`grid h-9 w-9 place-items-center rounded-full border transition-all lg:hidden ${
                isGlass
                  ? "border-zinc-200/90 bg-white/80 hover:bg-white text-zinc-800 shadow-xs"
                  : "border-white/20 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
              }`}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown: Clean, Professional B2B Navigation */}
        {open && (
          <div
            id="mobile-navigation-dropdown"
            className="lg:hidden border-t border-zinc-200/80 bg-white/98 backdrop-blur-2xl text-zinc-900 shadow-2xl animate-in slide-in-from-top-2 fade-in duration-200 max-h-[calc(100vh-4.25rem)] overflow-y-auto"
          >
            <div className="container-page py-4 space-y-4">
              {/* Primary Navigation Links */}
              <nav aria-label="Mobile Navigation" className="divide-y divide-zinc-100">
                {/* Shop / Products Section */}
                <div className="py-1">
                  <div className="flex items-center justify-between">
                    <Link
                      to="/shop"
                      onClick={() => setOpen(false)}
                      className={`flex-1 py-3 text-base font-bold uppercase tracking-wider transition-colors ${
                        path.startsWith("/shop")
                          ? "text-primary"
                          : "text-zinc-900 hover:text-primary"
                      }`}
                    >
                      Shop
                    </Link>
                    <button
                      type="button"
                      onClick={() => setMobileShopOpen((v) => !v)}
                      aria-label="Toggle shop categories"
                      className="p-3 text-zinc-400 hover:text-zinc-900 transition-colors"
                    >
                      <ChevronDown
                        className={`h-4.5 w-4.5 transition-transform duration-200 ${
                          mobileShopOpen ? "rotate-180 text-zinc-900" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {mobileShopOpen && (
                    <div className="pl-3 pb-2 space-y-0.5 border-l-2 border-primary/20 ml-1 mt-1 animate-in fade-in duration-150">
                      <Link
                        to="/shop"
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between py-2 px-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-primary hover:bg-zinc-50 transition-colors"
                      >
                        <span>All Products & Machinery</span>
                        <ChevronRight className="h-3.5 w-3.5 text-zinc-300" />
                      </Link>
                      <Link
                        to="/shop"
                        search={{ cat: "Garage Equipment" }}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between py-2 px-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-primary hover:bg-zinc-50 transition-colors"
                      >
                        <span>Garage Equipment</span>
                        <ChevronRight className="h-3.5 w-3.5 text-zinc-300" />
                      </Link>
                      <Link
                        to="/shop"
                        search={{ mobility: "EV" }}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between py-2 px-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-primary hover:bg-zinc-50 transition-colors"
                      >
                        <span>EV Platform & Tools</span>
                        <ChevronRight className="h-3.5 w-3.5 text-zinc-300" />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Updates / Dispatches Feed */}
                <div className="py-1">
                  <Link
                    to="/updates"
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between py-3 text-base font-bold uppercase tracking-wider transition-colors ${
                      path.startsWith("/updates")
                        ? "text-primary"
                        : "text-zinc-900 hover:text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>Updates & Dispatches</span>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase">
                        Live
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-300" />
                  </Link>
                </div>

                {/* Solutions */}
                <div className="py-1">
                  <Link
                    to="/solutions"
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between py-3 text-base font-bold uppercase tracking-wider transition-colors ${
                      path.startsWith("/solutions")
                        ? "text-primary"
                        : "text-zinc-900 hover:text-primary"
                    }`}
                  >
                    <span>Solutions</span>
                    <ChevronRight className="h-4 w-4 text-zinc-300" />
                  </Link>
                </div>

                {/* Support */}
                <div className="py-1">
                  <Link
                    to="/support"
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between py-3 text-base font-bold uppercase tracking-wider transition-colors ${
                      path.startsWith("/support")
                        ? "text-primary"
                        : "text-zinc-900 hover:text-primary"
                    }`}
                  >
                    <span>Support</span>
                    <ChevronRight className="h-4 w-4 text-zinc-300" />
                  </Link>
                </div>

                {/* About */}
                <div className="py-1">
                  <Link
                    to="/about"
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between py-3 text-base font-bold uppercase tracking-wider transition-colors ${
                      path.startsWith("/about")
                        ? "text-primary"
                        : "text-zinc-900 hover:text-primary"
                    }`}
                  >
                    <span>About</span>
                    <ChevronRight className="h-4 w-4 text-zinc-300" />
                  </Link>
                </div>
              </nav>

              {/* Bottom Quotation Cart Action */}
              <div className="pt-2 border-t border-zinc-100">
                <Link
                  to="/cart"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 transition-all text-zinc-900 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-8.5 w-8.5 place-items-center rounded-lg bg-zinc-900 text-white shadow-xs">
                      <ShoppingBag className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                        Quotation Cart
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {count > 0 ? `${count} items in list` : "No items selected"}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Social Channels in Mobile Menu */}
              <div className="pt-3 flex items-center justify-between text-xs text-zinc-500">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Connect With Us
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href="https://www.linkedin.com/company/page-international-ltd/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="PAGE International on LinkedIn"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-200 text-zinc-600 hover:text-[#0A66C2] hover:border-[#0A66C2] hover:bg-[#0A66C2]/10 transition-colors"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href="https://www.facebook.com/pageinternationalltd/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="PAGE International on Facebook"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-200 text-zinc-600 hover:text-[#1877F2] hover:border-[#1877F2] hover:bg-[#1877F2]/10 transition-colors"
                  >
                    <Facebook className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href="https://www.instagram.com/pageintl"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="PAGE International on Instagram"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-200 text-zinc-600 hover:text-[#E4405F] hover:border-[#E4405F] hover:bg-[#E4405F]/10 transition-colors"
                  >
                    <Instagram className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Backdrop overlay for outside tap */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 top-16 bg-black/40 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}
    </>
  );
}
