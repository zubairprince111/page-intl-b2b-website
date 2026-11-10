import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { BrandPartners } from "@/components/site/BrandPartners";
import { images } from "@/lib/data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      {
        title: "About — PAGE International Ltd.",
      },
      {
        name: "description",
        content:
          "PAGE International Ltd. is a specialized B2B supplier and distributor of automotive service equipment, training systems, spare parts, and workshop construction solutions in Bangladesh. Authorized distributor for LAUNCH, SmartSafe, ATS Elgi & WIPRO.",
      },
      {
        property: "og:title",
        content: "About PAGE International Ltd. — The Company Behind the Workshop",
      },
      {
        property: "og:description",
        content:
          "Over 20 years of automotive engineering experience, 220+ completed projects, and official distribution for LAUNCH, SmartSafe, ATS Elgi & WIPRO in Bangladesh.",
      },
    ],
  }),
  component: AboutPage,
});

export function AboutPage() {
  const stats = [
    {
      value: "220+",
      label: "Completed Projects",
      detail: "Workshop bays & machinery commissioned",
    },
    {
      value: "30+",
      label: "Monthly Site Visits",
      detail: "On-site audits, maintenance & calibration",
    },
    { value: "26", label: "Team Members", detail: "Engineers, technicians & logistics staff" },
    { value: "20+", label: "Years Experience", detail: "In automotive manufacturing & service" },
  ];

  const distributors = [
    {
      brand: "LAUNCH",
      role: "Official Distributor",
      specialty: "Diagnostics, scan tablets & ADAS calibration",
    },
    {
      brand: "SmartSafe",
      role: "Official Distributor",
      specialty: "EV battery testing & high-voltage tools",
    },
    {
      brand: "ATS ELGI",
      role: "Official Distributor",
      specialty: "Hydraulic lifts, lubrication & wash bays",
    },
    {
      brand: "WIPRO Enterprises Ltd.",
      role: "Official Distributor",
      specialty: "Precision hydraulic workshop systems",
    },
  ];

  const pillars = [
    {
      no: "01",
      title: "Auto-Service Equipment",
      description:
        "Tools and technology for vehicle maintenance, repair, hydraulic lifting, and wheel service.",
    },
    {
      no: "02",
      title: "Auto-Training Equipment",
      description:
        "Educational resources, diagnostic simulators, and cutaway trainers for automotive technicians.",
    },
    {
      no: "03",
      title: "Spare Parts",
      description:
        "A comprehensive B2B inventory of genuine replacement components, lubricants, and filtration.",
    },
    {
      no: "04",
      title: "Warehouse Equipment",
      description:
        "Industrial solutions for efficient parts storage, pallet racking, and material handling.",
    },
    {
      no: "05",
      title: "Construction Equipment",
      description:
        "Machinery, core drilling, and chemical anchoring applicable to workshop bays and pits.",
    },
  ];

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* ── 1. HEADER ── */}
      <section className="border-b border-border">
        <div className="container-page py-16 sm:py-24 max-w-5xl">
          <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-primary mb-3">
            PAGE International Ltd. / Bangladesh
          </p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold uppercase tracking-tight text-foreground leading-[1.05]">
            We are passionate about our work.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-3xl leading-relaxed">
            A fast-growing journey. Our team comprises experienced engineers with over fifteen to
            twenty years in the automobile industry, making us trusted partners in modernizing
            Bangladesh’s automotive workshops, dealerships, and fleet service centers.
          </p>
        </div>
      </section>

      {/* ── 2. METRICS ROW (Clean Swiss Divider) ── */}
      <section className="border-b border-border bg-card">
        <div className="container-page py-10 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-border">
            {stats.map((s, idx) => (
              <div key={s.label} className={idx > 0 ? "pt-6 md:pt-0 md:pl-8" : ""}>
                <div className="text-3xl sm:text-4xl font-display font-bold text-foreground tracking-tight">
                  {s.value}
                </div>
                <div className="mt-1 text-xs font-bold uppercase tracking-wider text-foreground">
                  {s.label}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{s.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. HISTORY & MARKET OPPORTUNITY ── */}
      <section className="border-b border-border py-16 sm:py-24">
        <div className="container-page max-w-5xl">
          <div className="grid md:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left Narrative */}
            <div className="md:col-span-7 space-y-5">
              <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block">
                01 / History & Direction
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold uppercase text-foreground leading-tight">
                A fast-growing journey in Bangladesh’s automotive industry.
              </h2>
              <div className="space-y-4 text-sm sm:text-[15px] leading-relaxed text-muted-foreground">
                <p>
                  Our team comprises experienced engineers with over fifteen to twenty years in the
                  automobile industry, making us well-known and trusted within Bangladesh’s
                  automotive sector. We specialize in supplying premium tools, equipment, and
                  workshop construction solutions tailored to our customers’ needs.
                </p>
                <p>
                  We proudly serve as the official distributor for{" "}
                  <strong className="text-foreground font-semibold">
                    LAUNCH, SmartSafe, ATS Elgi & WIPRO Enterprises Ltd.
                  </strong>{" "}
                  In the past year alone, we have compiled an extensive database of over 500 local
                  workshops and parts sellers across Bangladesh, with plans to expand this number
                  further.
                </p>
                <p>
                  Notably, our field audits identified that{" "}
                  <strong className="text-foreground font-semibold">
                    around 80% of workshops lack modern diagnostic and lifting tools
                  </strong>
                  , creating a timely opportunity for upgrading. As workshop owners recognize our
                  expertise and reputation, we aggressively connect world-class manufacturing with
                  this promising market.
                </p>
              </div>
            </div>

            {/* Right Photo & Market Insight Card */}
            <div className="md:col-span-5 space-y-4">
              <div className="rounded-xl overflow-hidden border border-border bg-muted">
                <img
                  src={images.heroWorkshop}
                  alt="Uttara Office & Demonstration Showroom"
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>
              <p className="text-[11px] text-muted-foreground font-mono">
                Dhaka Office (Uttara Sector 14) — Equipment showroom & workshop advisory desk.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-lg border border-border bg-card">
                  <span className="text-2xl font-display font-bold text-foreground block">
                    500+
                  </span>
                  <span className="text-[11px] text-muted-foreground leading-tight block mt-0.5">
                    Local workshops & sellers mapped nationwide
                  </span>
                </div>
                <div className="p-4 rounded-lg border border-border bg-card">
                  <span className="text-2xl font-display font-bold text-primary block">~80%</span>
                  <span className="text-[11px] text-muted-foreground leading-tight block mt-0.5">
                    Currently lack modern diagnostic tooling
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. OFFICIAL DISTRIBUTORS (Clean 4-Col Grid) ── */}
      <section className="border-b border-border bg-card py-14 sm:py-18">
        <div className="container-page max-w-5xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 border-b border-border">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                02 / Global Partnerships
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-bold uppercase text-foreground mt-1">
                Official Distributorships in Bangladesh
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Direct factory provenance & authorized warranty
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {distributors.map((d) => (
              <div
                key={d.brand}
                className="p-5 rounded-lg border border-border bg-background space-y-1.5"
              >
                <div className="text-xs font-mono font-semibold text-primary uppercase tracking-wider">
                  {d.role}
                </div>
                <div className="text-lg font-display font-bold text-foreground">{d.brand}</div>
                <p className="text-xs text-muted-foreground leading-snug pt-1">{d.specialty}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. PHILOSOPHY ── */}
      <section className="border-b border-border py-16 sm:py-20">
        <div className="container-page max-w-5xl">
          <div className="max-w-3xl space-y-4">
            <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block">
              03 / Philosophy
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold uppercase text-foreground leading-snug">
              We strive to provide our customers with the highest quality.
            </h2>
            <div className="text-sm sm:text-base leading-relaxed text-muted-foreground space-y-4 pt-1">
              <p>
                PAGE International Ltd. operates on the philosophy that investing in the automotive
                industry is an investment in Bangladesh’s future. We believe in empowering
                individuals with the knowledge and tools to excel, fostering a culture of continuous
                learning and improvement.
              </p>
              <p>
                Our commitment to excellence extends beyond providing equipment; we strive to build
                lasting partnerships with our customers, contributing to their success and the
                advancement of the entire automotive ecosystem in Bangladesh through integrity,
                innovation, and unwavering support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. THE 5 PILLARS (Clean Numbered Index) ── */}
      <section className="border-b border-border bg-card py-16 sm:py-24">
        <div className="container-page max-w-5xl space-y-8">
          <div className="pb-4 border-b border-border">
            <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block">
              04 / Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold uppercase text-foreground mt-1">
              Pillars of PAGE that drive everything we do.
            </h2>
          </div>

          <div className="divide-y divide-border">
            {pillars.map((p) => (
              <div
                key={p.no}
                className="py-5 sm:py-6 grid sm:grid-cols-12 gap-2 sm:gap-6 items-baseline group"
              >
                <div className="sm:col-span-1 text-xs font-mono font-bold text-muted-foreground">
                  {p.no}
                </div>
                <div className="sm:col-span-4 text-base font-display font-bold text-foreground">
                  {p.title}
                </div>
                <div className="sm:col-span-7 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {p.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. LEADERSHIP / "OUR VISIONARIES" ── */}
      <section className="border-b border-border py-16 sm:py-24">
        <div className="container-page max-w-5xl space-y-10">
          <div className="pb-4 border-b border-border">
            <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block">
              05 / Leadership
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold uppercase text-foreground mt-1">
              Our Team — Our Visionaries
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Managing Director */}
            <div className="p-7 sm:p-8 rounded-xl border border-border bg-card space-y-4">
              <div>
                <span className="text-[11px] font-mono font-semibold uppercase text-primary tracking-wider">
                  Executive
                </span>
                <h3 className="text-xl font-display font-bold uppercase text-foreground mt-0.5">
                  Managing Director
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                  Mechanical Engineering & Finance • 20+ Years Experience
                </p>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Managing Director of PAGE International, has over 20 years of automotive experience,
                specializing in sustainable transportation and modern automobile service and
                training equipment supply. His background in Mechanical Engineering and Finance
                drives innovation. He aims to redefine mobility in Bangladesh with electric vehicles
                and global partnerships.
              </p>
            </div>

            {/* Director Operations */}
            <div className="p-7 sm:p-8 rounded-xl border border-border bg-card space-y-4">
              <div>
                <span className="text-[11px] font-mono font-semibold uppercase text-primary tracking-wider">
                  Operations
                </span>
                <h3 className="text-xl font-display font-bold uppercase text-foreground mt-0.5">
                  Director Operations
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                  Mechanical Engineering & China R&D • 18+ Years Experience
                </p>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Director Operations, leverages his mechanical engineering background and over 18
                years of auto industry experience to specialize in vehicle and electric vehicle
                assembly. His expertise is further honed by R&D training in China and a robust
                network cultivated through automobile service equipment sales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. MISSION & VISION (Split Block) ── */}
      <section className="border-b border-border bg-card py-16 sm:py-20">
        <div className="container-page max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Mission */}
            <div className="space-y-3 md:pr-8">
              <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block">
                06 / Purpose
              </span>
              <h3 className="text-xl font-display font-bold uppercase text-foreground">
                Our Mission
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                PAGE International Ltd. is dedicated to supplying cutting-edge equipment, delivering
                industry-leading training programs, and providing exceptional customer service,
                empowering automotive professionals and driving the growth and modernization of
                Bangladesh’s automotive sector.
              </p>
            </div>

            {/* Vision */}
            <div className="space-y-3 pt-6 md:pt-0 md:pl-8">
              <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block">
                07 / Horizon
              </span>
              <h3 className="text-xl font-display font-bold uppercase text-foreground">
                Our Vision
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                To be the premier provider of advanced automotive service equipment and training
                solutions in Bangladesh, recognized for innovation, quality, and a commitment to
                developing a highly skilled automotive workforce.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. BRAND PARTNERS LOGO STRIP ── */}
      <section className="border-b border-border py-12">
        <div className="container-page max-w-5xl space-y-6">
          <p className="text-center text-[10px] font-mono font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Authorized Equipment & Component Partners
          </p>
          <BrandPartners />
        </div>
      </section>

      {/* ── 10. SIMPLE DIRECT CTA ── */}
      <section className="py-14 sm:py-18">
        <div className="container-page max-w-5xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-xl font-display font-bold uppercase text-foreground">
              Equip your workshop with PAGE International.
            </h3>
            <p className="text-xs text-muted-foreground">
              Visit our Uttara, Dhaka office or discuss equipment supply with our engineering desk.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/services/book"
              className="btn btn-primary h-10 px-5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
            >
              <span>Book Consultation</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/shop"
              className="btn btn-outline h-10 px-5 text-xs font-bold uppercase tracking-wider"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
