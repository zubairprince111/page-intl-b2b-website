import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  Check,
  FileSpreadsheet,
  ShieldCheck,
  Truck,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { images } from "@/lib/data";

export const Route = createFileRoute("/solutions")({
  head: () => ({
    meta: [
      { title: "B2B Workshop & Automotive Solutions — PAGE International" },
      {
        name: "description",
        content:
          "Turnkey workshop setup, equipment upgrades, service center supply, EV workshop tooling, commercial fleet depots, and distributor supply.",
      },
      { property: "og:title", content: "PAGE B2B Automotive Solutions" },
      {
        property: "og:description",
        content:
          "Commercial workshop solutions for workshops, service centers, dealerships, and EV businesses.",
      },
    ],
  }),
  component: Solutions,
});

const b2bSolutionPackages = [
  {
    slug: "workshop-setup",
    name: "Workshop Setup",
    subtitle: "Everything needed to build a professional LAUNCH automotive workshop",
    desc: "For new workshop investments, dealership bay expansions, or independent garages. We provide 2D/3D workshop ergonomics, certified anchoring of LAUNCH TLT-series 2-post, 4-post, and ultra-thin scissor lifts, utility line planning, and technician equipment operation training.",
    target: "New Workshop Owners, Expanding Garages, Tyre Centers, Dealerships",
    features: [
      "2D/3D vehicle workflow and multi-bay layout engineering",
      "Supply and certified anchoring of LAUNCH TLT235 / TLT240 2-post and TLT840 scissor lifts",
      "LAUNCH mechanic tool trolleys, pneumatic distribution & electrical bay load planning",
      "Technician machinery calibration & safety operation training",
      "Official commercial equipment warranty & registered VAT tax invoicing",
    ],
    actionLink: "/shop",
    actionSearch: { cat: "Garage Equipment" },
    actionText: "Explore Workshop Setup Equipment",
    image: images.heroWorkshop,
  },
  {
    slug: "workshop-upgrade",
    name: "Workshop Upgrade & Modernization",
    subtitle: "Upgrade equipment, LAUNCH X-431 diagnostics, and bay productivity",
    desc: "Replace aging manual equipment with high-speed automated LAUNCH TWC-621 tyre changers, LAUNCH KWB-621 laser wheel balancers, and LAUNCH X-431 PAD9 LINK / PRO5 computerized ECU diagnostic tablets capable of servicing modern Japanese, European, and hybrid vehicles.",
    target: "Independent Garages, Quick-Service Bays, Tyre Fitment Centers",
    features: [
      "LAUNCH KWB-621 microprocessor laser-guided digital wheel balancers",
      "LAUNCH TWC-621 pneumatic tilt-back run-flat tyre changing machines",
      "LAUNCH X-431 PAD9 LINK & PRO5 multi-brand OE-level ECU diagnostic tablets",
      "Machinery upgrade consultation and phased multi-bay rollout plans",
      "Direct genuine LAUNCH accessories, VCI modules, and replacement consumables",
    ],
    actionLink: "/shop",
    actionSearch: { type: "equipment" },
    actionText: "Explore Modernization Machinery",
    image: images.solutionsWorkshopUpgrade,
  },
  {
    slug: "ev-workshop",
    name: "EV Workshop Solutions",
    subtitle: "Prepare your workshop with LAUNCH New Energy & EV battery tooling",
    desc: "Equip your facility to safely diagnose and service high-voltage electric and hybrid vehicles. We supply genuine LAUNCH X-431 EV MAX diagnostic workstations, LAUNCH EVB624 / EVB648 traction battery cell equalizers, LAUNCH EVC201 airtightness testers, hydraulic battery lift tables, and 1000V VDE insulated toolkits.",
    target: "Pioneering EV Garages, Hybrid Specialists, Fleet Hubs, Dealership EV Bays",
    features: [
      "LAUNCH X-431 EV MAX dedicated new-energy battery pack diagnostic systems",
      "LAUNCH EVB624 & EVB648 high-voltage lithium cell balancing and capacity test stations",
      "LAUNCH X-431 EVC201 battery pack airtightness and leak testing equipment",
      "1.0T electro-hydraulic double-scissor EV traction battery lowering tables",
      "Certified 1000V VDE insulated tool sets and high-voltage safety instrumentation",
    ],
    actionLink: "/shop",
    actionSearch: { mobility: "EV" },
    actionText: "Explore EV Workshop Tooling",
    image: images.solutionsEvWorkshop,
  },
  {
    slug: "service-center",
    name: "Service Center Solutions",
    subtitle: "High-throughput 3D alignment, ADAS calibration & multi-bay lifts",
    desc: "Complete multi-bay service center outfitting featuring LAUNCH X-861 PRO 3D and X-931 touchless wheel alignment towers paired with LAUNCH TLT440W / TLT455W 4-post alignment lifts, X-431 ADAS PRO+ calibration frames, and continuous-duty service bay machinery.",
    target: "Multi-Brand Service Hubs, Authorized Dealerships, Franchise Workshop Operations",
    features: [
      "LAUNCH X-861 PRO 3D & X-931 touchless four-wheel alignment workstations",
      "LAUNCH TLT440W (4.0T) & TLT455W (5.5T) 4-post wheel alignment lifts with rolling jacks",
      "LAUNCH X-431 ADAS PRO+ V2 radar and camera calibration bays",
      "Consolidated corporate B2B invoicing with registered VAT documentation",
      "Priority technical support and on-site engineer calibration service",
    ],
    actionLink: "/shop",
    actionSearch: { cat: "Tyre & Wheel" },
    actionText: "Explore Service Center Equipment",
    image: images.solutionsServiceCenter,
  },
  {
    slug: "commercial-vehicles",
    name: "Commercial Vehicle & Fleet Depots",
    subtitle: "24V SmartLink HD diagnostics & heavy-tonnage lifting for fleets",
    desc: "Equip in-house fleet maintenance depots with LAUNCH X-431 PRO3S+ SmartLink HD and V+ SmartLink HD 24V commercial truck diagnostic workstations, SmartLink C 2.0 heavy-duty interfaces, LAUNCH TLT260AT 6.0T heavy two-post lifts, and heavy mobile column lift systems.",
    target: "Logistics Depots, Corporate Shuttles, Bus & Truck Garages, Delivery Fleets",
    features: [
      "LAUNCH X-431 PRO3S+ SmartLink HD & CRP 129 HD 12V/24V commercial diesel diagnostics",
      "LAUNCH SmartLink C 2.0 heavy-duty VCI supporting J1939, J1708, DoIP, and remote B2B diagnosis",
      "LAUNCH TLT260AT (6.0T) & TLT250AT (5.0T) heavy-duty hydraulic two-post lifts",
      "Heavy commercial washing hoists and synchronized mobile column lifts",
      "Standardized fleet diagnostic and preventive maintenance workstation kits",
    ],
    actionLink: "/shop",
    actionSearch: { cat: "Diagnostic Equipment" },
    actionText: "Explore Commercial Fleet Equipment",
    image: images.solutionsCommercialFleet,
  },
  {
    slug: "distributor",
    name: "Distributor & Wholesale Supply",
    subtitle: "Authorized B2B wholesale supply of LAUNCH equipment & tooling",
    desc: "Partner with PAGE International as an authorized regional equipment dealer or commercial reseller. Access wholesale pricing on crated LAUNCH TLT vehicle lifts, X-431 diagnostic tablet lines, TPMS programmers, tyre changers, wheel balancers, and EV battery equipment.",
    target: "Regional Wholesalers, Automotive Equipment Dealers, Importers, Tool Resellers",
    features: [
      "Volume wholesale and multi-unit B2B dealer discount schedules",
      "Complete line of genuine LAUNCH diagnostic scanners, lifts, TPMS, and tyre machines",
      "Direct technical and product training for regional sales and service teams",
      "Official product specification sheets, warranty registration, and showroom assets",
      "Registered commercial pro-forma invoicing and dedicated B2B account management",
    ],
    actionLink: "/support",
    actionSearch: {},
    actionText: "Inquire About Distribution Terms",
    image: images.solutionsDistributorSupply,
  },
];

export function Solutions() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <PageHeader
        eyebrow="B2B Commercial Solutions"
        title="Solutions for Automotive Businesses"
        intro="PAGE International equips the businesses that service vehicles. Whether setting up a new garage, transitioning to EV service, or outfitting a commercial fleet depot, we supply industrial machinery, verified spare parts, and workshop engineering."
        image={images.solutionsHero}
        imageAlt="PAGE International turnkey automotive workshop bay with 2-post lift, wheel balancer, EV diagnostics cart, and solutions engineer"
      >
        <div className="flex flex-wrap gap-3">
          <a
            href="#inquiry"
            className="btn btn-primary h-11 px-6 text-xs font-bold uppercase tracking-wider"
          >
            <FileSpreadsheet className="h-4 w-4" /> Request Solutions Quote
          </a>
          <Link
            to="/shop"
            className="btn btn-outline border-ink-border bg-black/35 text-ink-foreground hover:bg-ink-2 h-11 px-6 text-xs font-bold uppercase tracking-wider backdrop-blur-xs"
          >
            Browse Products
          </Link>
        </div>
      </PageHeader>

      <section className="container-page py-16 space-y-12">
        {b2bSolutionPackages.map((s, idx) => (
          <article
            key={s.slug}
            id={s.slug}
            className={`grid gap-8 rounded border border-border bg-card overflow-hidden shadow-xs lg:grid-cols-2 lg:items-center scroll-mt-24 ${
              idx % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
            }`}
          >
            {/* Visual Image */}
            <div className="relative aspect-[16/10] lg:aspect-auto lg:h-full min-h-[320px] bg-ink">
              <img
                src={s.image}
                alt={s.name}
                loading="lazy"
                className="h-full w-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent lg:hidden" />
              <span className="absolute bottom-4 left-4 font-display text-4xl font-bold text-white/20 lg:top-4 lg:left-4">
                0{idx + 1}
              </span>
            </div>

            {/* Solution Details */}
            <div className="p-6 sm:p-10 lg:p-12">
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                {s.subtitle}
              </span>
              <h2 className="display-lg mt-2 text-foreground font-bold">{s.name}</h2>
              <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {s.desc}
              </p>

              <div className="mt-4 rounded bg-secondary/60 p-3 text-xs">
                <span className="font-bold text-foreground">Target Businesses: </span>
                <span className="text-muted-foreground">{s.target}</span>
              </div>

              <div className="mt-6 space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                  What PAGE Delivers:
                </p>
                {s.features.map((f) => (
                  <div key={f} className="flex items-start gap-2.5 text-xs text-foreground/80">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
                <Link
                  to={s.actionLink}
                  search={s.actionSearch}
                  className="btn btn-primary h-10 text-xs font-bold uppercase tracking-wider"
                >
                  {s.actionText} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to="/support"
                  className="btn btn-outline h-10 text-xs font-bold uppercase tracking-wider"
                >
                  Request Consultation
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Solutions Conversion Banner */}
      <section id="inquiry" className="bg-ink text-ink-foreground py-16 border-t border-ink-border">
        <div className="container-page text-center max-w-3xl">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-primary block">
            Commercial Project Consultation
          </span>
          <h2 className="display-lg mt-2 text-ink-foreground">
            CONSULT WITH A PAGE WORKSHOP ENGINEER
          </h2>
          <p className="mt-3 text-sm text-ink-muted leading-relaxed max-w-xl mx-auto">
            Discuss machinery specifications, bay layout blueprints, or bulk container supply
            contracts with our commercial equipment team.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/support"
              className="btn btn-primary h-11 px-8 text-xs font-bold uppercase tracking-wider"
            >
              Submit Commercial Project Details
            </Link>
            <Link
              to="/shop"
              className="btn btn-ghost-light h-11 px-8 text-xs font-bold uppercase tracking-wider"
            >
              Browse Equipment Catalogue
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
