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
    subtitle: "Everything needed to build a professional automotive workshop",
    desc: "For new workshop investments, dealership bay expansions, or independent garages. We provide 2D/3D workshop ergonomics, 2-post and scissor lift anchoring, compressor ring-main line installation, electrical load planning, and technician equipment operation training.",
    target: "New Workshop Owners, Expanding Garages, Tyre Centers, Dealerships",
    features: [
      "2D/3D vehicle workflow and bay layout engineering",
      "Supply and certified anchoring of 2-post, 4-post and scissor lifts",
      "Rotary screw compressor line sizing & pneumatic ring-main installation",
      "Technician machinery calibration & safety operation training",
      "Official 2-year commercial equipment warranty & tax invoicing",
    ],
    actionLink: "/shop",
    actionSearch: { cat: "Garage Equipment" },
    actionText: "Explore Workshop Setup Equipment",
    image: images.heroWorkshop,
  },
  {
    slug: "workshop-upgrade",
    name: "Workshop Upgrade & Modernization",
    subtitle: "Upgrade equipment, diagnostics, and technician productivity",
    desc: "Replace aging manual equipment with high-speed automated tyre changers, laser wheel balancers, and computerized ECU diagnostic tablets capable of servicing modern Japanese, European, and hybrid models. Increase workshop throughput and vehicle turnover.",
    target: "Independent Garages, Quick-Service Bays, Tyre Fitment Centers",
    features: [
      "Microprocessor laser-guided digital wheel balancers",
      "Pneumatic tilt-back run-flat tyre changing machines",
      "Multi-brand OE-level ECU diagnostic tablets with active actuation",
      "Machinery trade-in consultation and staggered delivery plans",
      "Fast replacement spare parts inventory access",
    ],
    actionLink: "/shop",
    actionSearch: { type: "equipment" },
    actionText: "Explore Modernization Machinery",
    image: images.workshop,
  },
  {
    slug: "ev-workshop",
    name: "EV Workshop Solutions",
    subtitle: "Prepare your workshop for the next generation of electric mobility",
    desc: "Equip your facility to safely diagnose and service 2W, 3W, and 4W electric mobility. We supply certified 1000V VDE insulated hand tools, traction battery cell balancing stations, high-voltage insulation testers, safety perimeter barriers, and PPE kits.",
    target: "Pioneering EV Garages, Hybrid Specialists, Fleet Hubs, Conversion Centers",
    features: [
      "1000V VDE certified insulated tool sets & lockout kits",
      "High-voltage battery pack cell balancing & capacity test stations",
      "Specialized diagnostic software for BYD, MG, Tesla and Hybrid platforms",
      "Hydraulic battery pack lowering and lifting tables",
      "Safety perimeter barriers, rescue hooks, and high-voltage PPE gear",
    ],
    actionLink: "/shop",
    actionSearch: { mobility: "EV" },
    actionText: "Explore EV Workshop Tooling",
    image: images.brakes,
  },
  {
    slug: "service-center",
    name: "Service Center Solutions",
    subtitle: "Equipment and parts for professional high-volume service operations",
    desc: "Comprehensive parts supply contracts, bulk lubricant drum dispensing setups, multi-bay vehicle lifts, and computerized 3D wheel alignment stations designed for high daily vehicle traffic in multi-brand and dealership service operations.",
    target: "Multi-Brand Service Hubs, Dealerships, Franchise Workshop Operations",
    features: [
      "Volume spare parts supply agreements with guaranteed stock levels",
      "Multi-post vehicle lifts engineered for 12-hour continuous daily cycles",
      "Centralized lubricant storage and pneumatic overhead reel dispensers",
      "Consolidated monthly corporate billing with registered VAT tax invoices",
      "Priority technical hotline and emergency engineer dispatch",
    ],
    actionLink: "/shop",
    actionSearch: { cat: "Brakes" },
    actionText: "Explore Service Center Supplies",
    image: images.engine,
  },
  {
    slug: "commercial-vehicles",
    name: "Commercial Vehicle & Fleet Depots",
    subtitle: "Equipment for commercial, bus, logistics, and fleet environments",
    desc: "Equip in-house fleet maintenance depots with heavy-duty vehicle lifts, high-torque pneumatic impact wrenches, computerized diagnostic tablets, and scheduled replenishment of brake pads, commercial batteries, filters, and synthetic fluids.",
    target: "Logistics Depots, Corporate Shuttles, Bus & Truck Garages, Delivery Fleets",
    features: [
      "Heavy commercial vehicle lifts & mobile column lift systems",
      "Commercial fleet wear-item stocking (heavy brake drums, pads, filters)",
      "High-output rotary screw compressors for simultaneous air tool use",
      "Scheduled fleet replenishment to prevent roadside operational downtime",
      "Standardized fleet preventive maintenance toolkits",
    ],
    actionLink: "/shop",
    actionSearch: { type: "parts" },
    actionText: "Explore Fleet Maintenance Parts",
    image: images.compressor,
  },
  {
    slug: "distributor",
    name: "Distributor & Wholesale Supply",
    subtitle: "Reliable automotive product supply for regional businesses",
    desc: "Partner with PAGE International as an authorized regional equipment dealer or spare parts stockist. Access volume container pricing, exclusive territorial product lines, manufacturer marketing assets, and registered commercial tax invoices.",
    target: "Regional Wholesalers, Automotive Store Chains, Importers, Equipment Resellers",
    features: [
      "Volume wholesale and container-load discount schedules",
      "Exclusive territorial distribution opportunities for select machinery brands",
      "Direct technical training for your regional field sales and service staff",
      "Marketing collaterals, display stands, and digital spec sheets provided",
      "Flexible commercial trade credit terms for verified institutional partners",
    ],
    actionLink: "/support",
    actionSearch: {},
    actionText: "Inquire About Distribution Terms",
    image: images.tyreChanger,
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
