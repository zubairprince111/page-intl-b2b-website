import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Lock } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — PAGE International" },
      {
        name: "description",
        content:
          "Official Privacy Policy of PAGE International Ltd. Learn about our zero-password quotation policy, data protection, and B2B confidentiality.",
      },
      { property: "og:title", content: "Privacy Policy — PAGE International" },
      {
        property: "og:description",
        content:
          "Zero-password quotations, ephemeral email OTP verification, and strict commercial confidentiality in Bangladesh.",
      },
    ],
  }),
  component: PrivacyPage,
});

export function PrivacyPage() {
  return (
    <div className="bg-background text-foreground min-h-screen py-10 sm:py-16">
      <div className="container-page max-w-3xl">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>

        {/* Minimal Header */}
        <div className="border-b border-border pb-6">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-primary mb-1">
            <Lock className="h-3.5 w-3.5" />
            <span>Governance & Legal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display uppercase tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            PAGE International Ltd. • Effective: January 1, 2026 • Uttara Model Town, Dhaka,
            Bangladesh
          </p>
        </div>

        {/* Minimal Highlight Box */}
        <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4 text-xs sm:text-sm text-foreground/90">
          <p className="font-semibold text-foreground mb-1">
            Zero-Password & Account-Free Quotations
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            You do not need to register an account or set a password to request equipment quotations
            from PAGE. Commercial quotation requests (RFQs) are verified solely via a one-time
            6-digit Email OTP valid for 10 minutes.
          </p>
        </div>

        {/* Minimal Body Content */}
        <div className="mt-8 space-y-6 text-xs sm:text-sm text-foreground/90 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-foreground">1. Overview & Scope</h2>
            <p className="text-muted-foreground">
              This Privacy Policy explains how PAGE International Ltd. (“PAGE”, “we”, “our”, or
              “us”), incorporated in Dhaka, Bangladesh with corporate offices at Road #18, House #
              100, Sector # 14, Uttara Model Town, Dhaka, handles business information collected
              through our digital catalog, commercial quotation desks, and consultation scheduling
              portals.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              2. Information We Collect
            </h2>
            <p className="text-muted-foreground">
              We collect strictly the minimum information required to prepare accurate commercial
              pro-forma invoices, organize on-site engineer installations, and fulfill equipment
              orders:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                <strong>Company Details:</strong> Workshop or enterprise name, operating address,
                and delivery division in Bangladesh.
              </li>
              <li>
                <strong>Contact Information:</strong> Contact person's name, corporate email
                address, and contact phone number (+880).
              </li>
              <li>
                <strong>Technical Specifications:</strong> Workshop ceiling heights, power phase
                (380V 3-phase or 220V single-phase), and vehicle mix.
              </li>
              <li>
                <strong>Consultation Details:</strong> Preferred date and location (our Uttara,
                Dhaka office or on-site at your facility).
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              3. Purpose of Data Processing
            </h2>
            <p className="text-muted-foreground">
              The information you provide is utilized exclusively for genuine B2B commercial
              operations:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                Generating itemized commercial quotations, tax invoices, and shipping estimates.
              </li>
              <li>Validating technical workshop compatibility prior to equipment dispatch.</li>
              <li>
                Coordinating field engineers for chemical anchoring, installation, and handover.
              </li>
              <li>Maintaining warranty records and machine serial number registries.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              4. No Data Resale or Marketing Brokering
            </h2>
            <p className="text-muted-foreground">
              PAGE International Ltd. does not sell, trade, rent, or lease customer contact lists or
              procurement histories to third parties or marketing networks. All inquiries remain
              strictly confidential between your workshop and PAGE.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              5. Authorized Service Disclosures
            </h2>
            <p className="text-muted-foreground">
              Information is shared only with third-party service providers directly involved in
              order execution:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                <strong>Licensed Freight Carriers:</strong> Inter-district haulers delivering
                machinery to your garage address.
              </li>
              <li>
                <strong>Certified Field Engineers:</strong> Technical personnel assigned to
                commission and calibrate your equipment.
              </li>
              <li>
                <strong>Statutory Bodies:</strong> National Board of Revenue (NBR) as legally
                mandated for VAT (Mushak 6.3) compliance.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              6. Data Security & Retention
            </h2>
            <p className="text-muted-foreground">
              All communications are encrypted in transit via TLS 1.3. Internal data access is
              restricted to authorized commercial personnel. Commercial records are retained in
              compliance with statutory Bangladesh commercial record retention guidelines (minimum 5
              years for tax audit records).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              7. Contact & Compliance Desk
            </h2>
            <p className="text-muted-foreground">
              For any questions regarding this Privacy Policy or your procurement records, contact
              our compliance desk:
            </p>
            <div className="rounded-lg border border-border bg-secondary/30 p-3.5 text-xs space-y-1">
              <p className="font-semibold text-foreground">
                PAGE International Ltd. — Compliance Desk
              </p>
              <p className="text-muted-foreground">
                Road #18, House # 100, Sector # 14, Uttara Model Town, Dhaka
              </p>
              <p className="text-muted-foreground">
                Email:{" "}
                <a
                  href="mailto:pageon18@gmail.com"
                  className="text-primary font-semibold hover:underline"
                >
                  pageon18@gmail.com
                </a>
              </p>
              <p className="text-muted-foreground">
                Phone:{" "}
                <a href="tel:+8801755502421" className="text-primary font-semibold hover:underline">
                  +880 1755-502421
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
