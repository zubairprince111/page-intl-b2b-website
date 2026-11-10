import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageHeader } from "@/components/site/PageHeader";
import { images } from "@/lib/data";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      {
        title: "Commercial Support, B2B Quotations & Product Guides — PAGE International",
      },
      {
        name: "description",
        content:
          "Contact PAGE automotive technical support, request equipment or fleet quotations, view warranty terms and download product datasheets.",
      },
      { property: "og:title", content: "PAGE B2B Support & Quotes" },
      {
        property: "og:description",
        content: "Direct technical assistance, commercial quotations and equipment datasheets.",
      },
    ],
  }),
  component: Support,
});

const faqs: [string, string][] = [
  [
    "How does vehicle platform compatibility verification work at PAGE?",
    "Use our Multi-Mobility Platform Finder across 4-Wheeler, 2-Wheeler, 3-Wheeler, and EV platforms. Our technical database cross-references manufacturer OEM part numbers against engine codes, battery voltages, and chassis tolerances.",
  ],
  [
    "Does PAGE supply on-site equipment installation and technician training?",
    "Yes. For commercial garage equipment (2-post lifts, tyre changers, wheel balancers, and compressors), PAGE provides certified on-site installation, concrete floor anchoring inspection, electrical wiring verification, and operator training at your workshop premises.",
  ],
  [
    "What warranty is provided on garage equipment and spare parts?",
    "Heavy-duty garage equipment carries 18 to 36 months of commercial warranty covering hydraulic rams, motors, and structural steel. Mechanical replacement parts carry standard manufacturer defect warranties. Keep your PAGE commercial tax invoice for expedited claims.",
  ],
  [
    "Can PAGE fulfill bulk fleet supply and volume workshop procurement?",
    "Yes. We support corporate fleet operators, delivery fleets, dealership networks, and multi-bay garages with centralized B2B purchasing, volume discount schedules, and scheduled spare parts replenishment.",
  ],
  [
    "Can PAGE engineers install equipment on-site at my workshop or service center?",
    "Yes. For commercial garage equipment (vehicle lifts, tyre changers, wheel balancers, and compressors), PAGE engineers travel to your workshop to perform foundation chemical anchoring, electrical 3-phase connections, hydraulic pressure synchronization, and technician calibration training.",
  ],
  [
    "How do I obtain product datasheets, CE certifications, or user manuals?",
    "Technical datasheets and dimensional drawings can be downloaded directly from the product detail page, or you can request complete equipment PDF catalogues from our support desk.",
  ],
];

export function Support() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <PageHeader
        eyebrow="Commercial Support & Engineering Desk"
        title="Technical Assistance & B2B Quotations"
        intro="Have questions regarding equipment dimensions, vehicle compatibility, or volume supply terms? Our technical applications engineers and B2B commercial advisors are ready to assist."
        image={images.supportHero}
        imageAlt="PAGE International commercial support engineer at technical desk in automotive workshop bay"
      />

      {/* Main Section: Custom Quotation Desk (Call / Email Direct) */}
      <section className="container-page py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left Column: Sourcing Proposition & Commercial Desk */}
          <div>
            <span className="eyebrow text-primary">Custom Sourcing & Procurement</span>
            <h2 className="display-hero text-foreground leading-[0.9] mt-3">
              NEED EQUIPMENT <br />
              <span className="text-primary">NOT IN OUR SHOP?</span>
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Looking for specialized garage machinery, unlisted OEM replacement parts, diagnostics,
              or turnkey workshop projects? Our commercial procurement desk sources directly from
              authorized global manufacturers.
            </p>

            {/* 3 Value Pillars */}
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
                    Fast Quotation Turnaround
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Official pro-forma invoices, technical datasheets, and delivery timelines within
                    2–4 business hours.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <Wrench className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
                    Custom Technical Sizing & Power Specs
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Machinery configured for your workshop ceiling height, electrical load
                    (3-phase/single-phase), and vehicle mix.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
                    Official Warranty & On-Site Installation
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Foundation chemical anchoring, hydraulic synchronization, and certified
                    technician operation training.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Link Notice */}
            <div className="mt-8 p-3.5 rounded-lg border border-border/80 bg-muted/40 text-xs text-muted-foreground flex items-center justify-between gap-2">
              <span>
                Looking for products in our catalog? Explore our{" "}
                <Link
                  to="/shop"
                  className="text-primary font-semibold underline hover:text-primary/80"
                >
                  Shop Catalogue
                </Link>{" "}
                or{" "}
                <Link
                  to="/cart"
                  className="text-primary font-semibold underline hover:text-primary/80"
                >
                  Quotation Cart
                </Link>
                .
              </span>
            </div>
          </div>

          {/* Right Column: Direct Commercial Call & Email Desk */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-lg space-y-6">
            <div className="border-b border-border pb-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary uppercase tracking-wider mb-2">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                Direct Quotation Desk
              </div>
              <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-foreground font-display">
                Need a Custom Quotation?
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                If custom quotation is needed, please call us or email our commercial desk directly.
                Our applications engineers prepare itemized formal quotes with technical drawings.
              </p>
            </div>

            {/* Call Us Directly */}
            <div className="rounded-xl border border-border/80 bg-secondary/50 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-md">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Call Commercial Hotline
                  </span>
                  <a
                    href="tel:+8801755502421"
                    className="text-base sm:text-lg font-bold text-foreground hover:text-primary transition-colors font-mono"
                  >
                    +880 1755-502421
                  </a>
                  <p className="text-[11px] text-muted-foreground">Direct phone & WhatsApp line</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                <a
                  href="tel:+8801755502421"
                  className="btn btn-primary h-9 px-4 text-xs font-bold uppercase flex-1 text-center justify-center"
                >
                  Call Hotline Now
                </a>
                <a
                  href="https://wa.me/8801755502421?text=Hello%20PAGE%20International,%20I%20would%20like%20to%20request%20a%20commercial%20price%20quotation."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline h-9 px-4 text-xs font-bold uppercase flex items-center justify-center gap-1.5 border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
                >
                  <span>WhatsApp Chat</span>
                </a>
              </div>
            </div>

            {/* Email Us Directly */}
            <div className="rounded-xl border border-border/80 bg-secondary/50 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-md">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Official Quotation Email
                  </span>
                  <a
                    href="mailto:pageon18@gmail.com?subject=Custom%20Quotation%20Request%20-%20PAGE%20International"
                    className="text-base sm:text-lg font-bold text-foreground hover:text-primary transition-colors font-mono"
                  >
                    pageon18@gmail.com
                  </a>
                  <p className="text-[11px] text-muted-foreground">
                    Direct commercial & engineering desk
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-border/60">
                <a
                  href="mailto:pageon18@gmail.com?subject=Custom%20Quotation%20Request%20-%20PAGE%20International"
                  className="btn btn-outline h-9 px-4 text-xs font-bold uppercase w-full flex items-center justify-center gap-2"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Email Quotation Request</span>
                </a>
              </div>
            </div>

            {/* Response Time SLA & Checklist */}
            <div className="rounded-xl bg-muted/40 border border-border p-4 text-xs text-muted-foreground space-y-2">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Clock className="h-4 w-4 text-primary" />
                <span>What to Include in Your Email Inquiry:</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li>Equipment model or replacement part number</li>
                <li>Required quantity and estimated deployment date</li>
                <li>Workshop / garage delivery address in Bangladesh</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Engineering Consultation Callout Banner */}
      <section className="bg-primary text-primary-foreground py-10 border-y border-primary/20">
        <div className="container-page flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-white/80">
              Complimentary Engineering Session
            </span>
            <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white font-display">
              Need an In-Person Equipment Consultation & Trial?
            </h3>
            <p className="text-xs sm:text-sm text-white/90 max-w-xl">
              Schedule a 1-on-1 session with our certified machinery engineers at our Uttara, Dhaka
              office or have our team audit your workshop premises.
            </p>
          </div>
          <Link
            to="/services/book"
            className="btn bg-white text-zinc-900 hover:bg-white/90 h-11 px-8 text-xs font-bold uppercase tracking-wider shrink-0 shadow-lg"
          >
            Book Consultation & Demo →
          </Link>
        </div>
      </section>

      {/* Dhaka Office Location & Google Maps */}
      <section className="border-b border-border bg-card py-16 lg:py-20">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1.9fr] items-center">
            {/* Office Details */}
            <div className="space-y-6">
              <div>
                <span className="eyebrow text-primary">Headquarters & Office</span>
                <h2 className="display-sm text-foreground uppercase mt-1">
                  DHAKA CORPORATE OFFICE & SHOWROOM
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                  Visit our headquarters in Uttara Model Town, Dhaka to discuss turnkey workshop
                  planning, spare parts procurement, and diagnostic machinery supply in person.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-secondary/40">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                      Dhaka Corporate Office
                    </h4>
                    <p className="text-muted-foreground mt-0.5 leading-snug">
                      Road #18, House # 100, Sector # 14, Uttara Model Town, Dhaka
                    </p>
                    <p className="text-[10px] text-primary font-medium mt-1">
                      Sector # 14, Uttara Model Town • Dhaka, Bangladesh
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-secondary/40">
                  <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                      Showroom & Office Hours
                    </h4>
                    <p className="text-muted-foreground mt-0.5">
                      Saturday – Thursday: 8:00 AM – 8:00 PM
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Friday: Emergency engineer standby available
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="https://www.google.com/maps?cid=15320172382916100456&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAMYASAF"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary h-10 px-5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Open in Google Maps</span>
                </a>
                <a
                  href="tel:+8801755502421"
                  className="btn btn-outline h-10 px-5 text-xs font-bold uppercase tracking-wider"
                >
                  Call Office Reception
                </a>
              </div>

              {/* Official Social Channels */}
              <div className="pt-3 border-t border-border/80 flex flex-wrap items-center gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Official Channels:
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href="https://www.linkedin.com/company/page-international-ltd/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="PAGE International on LinkedIn"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:border-[#0A66C2] hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-colors"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href="https://www.facebook.com/pageinternationalltd/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="PAGE International on Facebook"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:border-[#1877F2] hover:text-[#1877F2] hover:bg-[#1877F2]/10 transition-colors"
                  >
                    <Facebook className="h-3.5 w-3.5" />
                    <span>Facebook</span>
                  </a>
                  <a
                    href="https://www.instagram.com/pageintl"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="PAGE International on Instagram"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:border-[#E4405F] hover:text-[#E4405F] hover:bg-[#E4405F]/10 transition-colors"
                  >
                    <Instagram className="h-3.5 w-3.5" />
                    <span>Instagram</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Google Maps Embed */}
            <div className="rounded-2xl border border-border overflow-hidden shadow-lg aspect-[16/10] sm:aspect-[16/9] w-full relative bg-muted">
              <iframe
                title="PAGE International Dhaka Office Location"
                src="https://maps.google.com/maps?cid=15320172382916100456&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Dedicated FAQs Section */}
      <section className="border-t border-border bg-secondary/30 py-16 lg:py-20">
        <div className="container-page max-w-4xl">
          <div className="mb-10 text-center">
            <span className="eyebrow text-primary">Support & Documentation</span>
            <h2 className="display-md text-foreground mt-1">FREQUENTLY ASKED QUESTIONS</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
              Common questions regarding equipment delivery, installation, warranty claims, and
              commercial supply terms.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-2.5">
            {faqs.map(([q, a], idx) => (
              <AccordionItem
                key={idx}
                value={`faq-${idx}`}
                className="rounded-lg border border-border bg-card px-4"
              >
                <AccordionTrigger className="text-left text-xs sm:text-sm font-semibold hover:text-primary py-3.5">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-4">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}
