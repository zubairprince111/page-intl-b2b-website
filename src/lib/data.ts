import brakepads from "@/assets/p-brakepads.jpg";
import battery from "@/assets/p-battery.jpg";
import oil from "@/assets/p-oil.jpg";
import scanner from "@/assets/p-scanner.jpg";
import brakes from "@/assets/brakes.jpg";
import engine from "@/assets/engine.jpg";
import workshop from "@/assets/workshop.jpg";
import heroCar from "@/assets/hero-car.jpg";
import heroWorkshop from "@/assets/hero-workshop.jpg";
import lift from "@/assets/p-lift.jpg";
import tyreChanger from "@/assets/p-tyre-changer.jpg";
import wheelBalancer from "@/assets/p-wheel-balancer.jpg";
import compressor from "@/assets/p-compressor.jpg";
import evTools from "@/assets/p-ev-tools.jpg";
import evBatteryAnalyzer from "@/assets/p-ev-battery-analyzer.jpg";
import motoLift from "@/assets/p-moto-lift.jpg";
import evWorkshopBay from "@/assets/ev-workshop-bay.jpg";
import commercial3wHub from "@/assets/commercial-3w-hub.jpg";
import supportHero from "@/assets/support-hero.jpg";
import solutionsHero from "@/assets/solutions-hero.jpg";
import {
  deriveProductStockStatus,
  getDefaultProductPresentation,
  getDistinctProductFeatures,
  inferIsEquipment,
  normalizeStorefrontPriceLabel,
  resolveOrderedSpecs,
  sanitizeGuaranteeBadges,
  sanitizeHighlightTuples,
  sanitizeVariantGroups,
  type ProductGuaranteeBadge,
  type ProductLikeRow,
  type ProductVariantGroup,
} from "./product-utils";
import { launchProducts } from "./launch-products";
import { atsElgiProducts } from "./ats-elgi-products";

export const images = {
  brakes,
  engine,
  workshop,
  heroCar,
  heroWorkshop,
  lift,
  tyreChanger,
  wheelBalancer,
  compressor,
  evTools,
  evBatteryAnalyzer,
  motoLift,
  evWorkshopBay,
  commercial3wHub,
  supportHero,
  solutionsHero,
  scanner,
  brakepads,
  battery,
  oil,
};

export type MobilityType = "4-Wheeler" | "2-Wheeler" | "3-Wheeler" | "EV";

export type Product = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  subcategory?: string | undefined;
  mobility: MobilityType[];
  price: number;
  costPrice?: number | undefined;
  oldPrice?: number | undefined;
  rating: number;
  reviews: number;
  stock: "In stock" | "Low stock" | "Out of stock";
  warehouseQty?: number | undefined;
  reorderLevel?: number | undefined;
  badge?: string | undefined;
  image: string;
  images?: string[] | undefined;
  fits: string[];
  features?: string[] | undefined;
  sku: string;
  description: string;
  specs: [string, string][];
  highlights?: [string, string][] | undefined;
  variantOptions?: ProductVariantGroup[] | undefined;
  guarantees?: ProductGuaranteeBadge[] | undefined;
  dispatchHub?: string | undefined;
  priceLabel?: string | undefined;
  isEquipment?: boolean | undefined;
  requiresQuote?: boolean | undefined;
};

export const categories = [
  "Diagnostic Equipment",
  "EV Equipment",
  "Tyre & Wheel",
  "Garage Equipment",
];

export const mobilitySegments = [
  {
    id: "4-Wheeler" as MobilityType,
    label: "Four-Wheeler",
    desc: "Passenger cars, SUVs, commercial vans & light commercial fleet vehicles",
    badge: "Cars & Commercial",
    types: [
      "Passenger Sedans & Hatchbacks",
      "SUVs & 4x4 Off-Road",
      "Commercial Cargo Vans",
      "Fleet Transport Platforms",
    ],
  },
  {
    id: "2-Wheeler" as MobilityType,
    label: "Two-Wheeler",
    desc: "Motorcycles, scooters, electric bikes & workshop scissor lift benches",
    badge: "Bikes & Scooters",
    types: [
      "Commuter 100-160cc",
      "Sport & Performance",
      "Automatic Scooters",
      "Electric Two-Wheelers",
    ],
  },
  {
    id: "3-Wheeler" as MobilityType,
    label: "Three-Wheeler",
    desc: "Auto rickshaws, commercial cargo 3W & electric 3W service tooling",
    badge: "Commercial 3W",
    types: [
      "CNG Auto-Rickshaws",
      "Electric E-Rickshaws",
      "Commercial Cargo 3W",
      "Passenger Three-Wheelers",
    ],
  },
  {
    id: "EV" as MobilityType,
    label: "Electric Mobility (EV)",
    desc: "1000V high-voltage tools, battery analyzers, cell balancers & charging stations",
    badge: "2W / 3W / 4W EV",
    types: [
      "EV Battery Diagnostics",
      "High-Voltage VDE Tools",
      "Traction Pack Tables",
      "EV Powertrain Scanners",
    ],
  },
];

export const shopVisualCategories = [
  {
    name: "Garage Equipment",
    desc: "2-Post & scissor lifts, tyre changers, wheel balancers",
    link: "/shop?cat=Garage+Equipment",
    img: lift,
    badge: "Commercial Machinery",
  },
  {
    name: "Diagnostics & Testing",
    desc: "Multi-brand OBD2 tablets, battery analyzers & oscilloscopes",
    link: "/shop?cat=Diagnostic+Equipment",
    img: scanner,
    badge: "Electronic Diagnostics",
  },
  {
    name: "EV Workshop Equipment",
    desc: "1000V VDE safety tools, traction battery cell balancers",
    link: "/shop?mobility=EV",
    img: evTools,
    badge: "Next-Gen Tooling",
  },
  {
    name: "Brake Systems & Spares",
    desc: "Low-dust ceramic brake pads, vented disc rotors, fluid bleeders",
    link: "/shop?cat=Brakes",
    img: brakepads,
    badge: "Certified Spares",
  },
  {
    name: "Tyre & Wheel Service",
    desc: "Automatic tyre changers, digital laser wheel balancers",
    link: "/shop?cat=Tyre+%26+Wheel",
    img: tyreChanger,
    badge: "Tyre Bay",
  },
  {
    name: "Rotary Air Compressors",
    desc: "Continuous rotary screw compressors, dryers & tanks",
    link: "/shop?cat=Garage+Equipment",
    img: compressor,
    badge: "Pneumatics",
  },
  {
    name: "Commercial Batteries",
    desc: "AGM and EFB heavy-duty batteries for start-stop & fleets",
    link: "/shop?cat=Batteries",
    img: battery,
    badge: "Power & Electrical",
  },
  {
    name: "Lubricants & Fluids",
    desc: "Full synthetic engine oils, transmission fluids, brake fluids",
    link: "/shop?cat=Lubricants+%26+Fluids",
    img: oil,
    badge: "Lubrication",
  },
];

export const garageEquipmentCategories = [
  {
    id: "lifts",
    name: "Vehicle Lifts",
    desc: "2-post, 4-post and low-profile scissor lifts up to 5.5T",
    count: "12 Models",
    img: lift,
    link: "/shop?cat=Garage+Equipment",
  },
  {
    id: "tyre",
    name: "Tyre Equipment",
    desc: "Automatic tyre changers with pneumatic assist arms",
    count: "8 Models",
    img: tyreChanger,
    link: "/shop?cat=Tyre+%26+Wheel",
  },
  {
    id: "balancing",
    name: "Wheel Balancers",
    desc: "Microprocessor balancers with laser line positioning",
    count: "6 Models",
    img: wheelBalancer,
    link: "/shop?cat=Tyre+%26+Wheel",
  },
  {
    id: "diagnostics",
    name: "Diagnostic Platforms",
    desc: "OE-level vehicle diagnostic tablets and code readers",
    count: "14 Models",
    img: scanner,
    link: "/shop?cat=Diagnostic+Equipment",
  },
  {
    id: "compressors",
    name: "Air Compressors",
    desc: "Rotary screw and silent piston workshop compressors",
    count: "9 Models",
    img: compressor,
    link: "/shop?cat=Garage+Equipment",
  },
  {
    id: "ev-tools",
    name: "EV Safety Tooling",
    desc: "1000V insulated hand tools, battery cell balancers & tables",
    count: "Complete Kits",
    img: evTools,
    link: "/shop?mobility=EV",
  },
];

export const whoWeServe = [
  {
    title: "Automotive Workshops",
    subtitle: "Garages & Independent Repair Bays",
    desc: "Heavy-duty 2-post lifts, compressed air lines, wheel balancers, and replacement parts to maximize workshop bay turnover.",
    supplies: [
      "2-Post & Scissor Lifts",
      "Tyre Changers & Balancers",
      "Turnkey Bay Layouts",
      "Operator Safety Training",
    ],
    deliverables: [
      "2-Post & Scissor Lifts",
      "Tyre Changers & Balancers",
      "Turnkey Bay Layouts",
      "Operator Safety Training",
    ],
  },
  {
    title: "Service Centers",
    subtitle: "Multi-Brand Service Hubs",
    desc: "Supplying the specialized diagnostic scanners, fluid exchange machinery, and certified OEM parts that your technicians rely on.",
    supplies: [
      "OE Diagnostic Tablets",
      "AC Recovery & Flush Machines",
      "Laser 4-Wheel Alignment",
      "Wholesale Spares Supply",
    ],
    deliverables: [
      "OE Diagnostic Tablets",
      "AC Recovery & Flush Machines",
      "Laser 4-Wheel Alignment",
      "Wholesale Spares Supply",
    ],
  },
  {
    title: "Dealerships",
    subtitle: "Authorized Automotive Dealers",
    desc: "Standardized equipment and tooling complying with vehicle manufacturer service mandates and warranty compliance standards.",
    supplies: [
      "OEM Mandated Tooling",
      "Diagnostic Software Updates",
      "B2B Volume Procurement",
      "Turnkey Workshop Installation",
    ],
    deliverables: [
      "OEM Mandated Tooling",
      "Diagnostic Software Updates",
      "B2B Volume Procurement",
      "Turnkey Workshop Installation",
    ],
  },
  {
    title: "Automotive Distributors",
    subtitle: "Regional Parts & Tooling Wholesalers",
    desc: "Reliable bulk import and distribution supply chain with direct manufacturer warranties, registered VAT invoicing, and credit terms.",
    supplies: [
      "Container & Pallet Supply",
      "Official Warranty Backing",
      "Exclusive Territorial Lines",
      "Technical Sales Training",
    ],
    deliverables: [
      "Container & Pallet Supply",
      "Official Warranty Backing",
      "Exclusive Territorial Lines",
      "Technical Sales Training",
    ],
  },
  {
    title: "Commercial Fleets",
    subtitle: "Bus, Truck, Van & Ride-Hail Fleets",
    desc: "Equipping in-house fleet maintenance depots with heavy-duty lifting equipment, diagnostic tools, and high-wear consumable reserves.",
    supplies: [
      "Depot Workshop Setup",
      "Heavy Lifts & Air Lines",
      "Brake & Battery Supply",
      "Scheduled Fleet Spares",
    ],
    deliverables: [
      "Depot Workshop Setup",
      "Heavy Lifts & Air Lines",
      "Brake & Battery Supply",
      "Scheduled Fleet Spares",
    ],
  },
  {
    title: "EV Workshops",
    subtitle: "Next-Gen Electric Vehicle Specialists",
    desc: "Everything required to safely service 2W, 3W, and 4W electric mobility: 1000V VDE safety tools, battery cell balancers, and chargers.",
    supplies: [
      "1000V Insulated Tool Kits",
      "EV Battery Pack Analyzers",
      "Safety Isolation PPE",
      "High-Voltage Enclosures",
    ],
    deliverables: [
      "1000V Insulated Tool Kits",
      "EV Battery Pack Analyzers",
      "Safety Isolation PPE",
      "High-Voltage Enclosures",
    ],
  },
];

export type Center = {
  id: string;
  name: string;
  area: string;
  address: string;
  rating: number;
  hours: string;
  services: string[];
  x: number;
  y: number;
};

export const centers: Center[] = [
  {
    id: "dhaka-uttara",
    name: "PAGE Equipment Hub — Uttara, Dhaka",
    area: "Dhaka",
    address: "Road #18, House # 100, Sector # 14, Uttara Model Town, Dhaka",
    rating: 4.9,
    hours: "Sat–Thu 9:00–19:00",
    services: [
      "Vehicle Lifts Demo",
      "Tyre Bay Machinery",
      "EV Tooling Benches",
      "Spare Parts Pickup",
    ],
    x: 48,
    y: 42,
  },
];

export type Service = {
  slug: string;
  name: string;
  desc: string;
  from?: number;
  duration: string;
};

export const services: Service[] = [
  {
    slug: "general-service",
    name: "Turnkey Bay Planning",
    desc: "2D/3D workshop layout modeling, electrical load, and equipment placement.",
    duration: "3–5 days",
  },
  {
    slug: "diagnostics",
    name: "Lift Anchoring & Rigging",
    desc: "Chemical torque anchoring, hydraulic synchronization, and load testing.",
    duration: "1–2 days",
  },
  {
    slug: "ac-service",
    name: "Machinery Calibration",
    desc: "3D aligner, digital balancer, and diagnostic tablet calibration.",
    duration: "Half day",
  },
  {
    slug: "brake-service",
    name: "Air Line Installation",
    desc: "Aluminum pipe ring-main line, dryer, and drop installation.",
    duration: "2–3 days",
  },
  {
    slug: "wheel-alignment",
    name: "Technician Training",
    desc: "Hands-on operator training for automated changers and lifts.",
    duration: "1 day",
  },
  {
    slug: "battery-service",
    name: "Annual Maintenance (AMC)",
    desc: "Scheduled preventive maintenance contracts for workshop machinery.",
    duration: "Quarterly",
  },
  {
    slug: "ev-service",
    name: "EV Workshop Audit",
    desc: "High-voltage safety zone setup, rescue hook, and PPE compliance.",
    duration: "1–2 days",
  },
  {
    slug: "adas-calibration",
    name: "Diagnostic Subscriptions",
    desc: "Cloud protocol updates and ECU software renewals.",
    duration: "Immediate",
  },
];

export const guides = [
  {
    slug: "choosing-workshop-lift",
    title: "Selecting the Right 2-Post vs Scissor Lift for Your Workshop",
    cat: "Equipment Guide",
    mins: 5,
    img: engine,
  },
  {
    slug: "ev-workshop-readiness",
    title: "How to Safely Equip Your Bays for EV & Hybrid Servicing",
    cat: "EV Transition",
    mins: 6,
    img: brakes,
  },
  {
    slug: "air-compressor-piping",
    title: "Rotary Screw Compressors & Pneumatic Ring-Main Sizing",
    cat: "Workshop Setup",
    mins: 4,
    img: workshop,
  },
];

export const products: Product[] = [...launchProducts];

export const brands = ["LAUNCH"];

export const b2bSolutions = [
  {
    slug: "workshop-setup",
    name: "Turnkey Workshop Setup",
    subtitle: "Complete bay planning, machinery supply & commissioning",
    desc: "For new workshop investments, dealership bay expansions, or independent garages. We provide 2D/3D workshop ergonomics, 2-post and scissor lift anchoring, compressor ring-main line installation, and technician operation training.",
    icon: "Wrench",
    target: "New Workshop Owners, Expanding Garages, Tyre Centers",
  },
  {
    slug: "workshop-upgrade",
    name: "Workshop Equipment Modernization",
    subtitle: "Upgrade machinery throughput and technician productivity",
    desc: "Replace aging manual equipment with high-speed automated tyre changers, laser wheel balancers, and computerized ECU diagnostic tablets capable of servicing modern Japanese, European, and hybrid models.",
    icon: "ArrowUpRight",
    target: "Independent Repair Garages, Quick-Service Bays",
  },
  {
    slug: "ev-workshop",
    name: "EV Workshop Transition",
    subtitle: "High-voltage safety gear, battery testing & EV tooling",
    desc: "Equip your facility to safely service 2W, 3W, and 4W electric mobility. We supply certified 1000V insulated hand tools, traction battery cell balancing stations, safety perimeter barriers, and PPE kits.",
    icon: "Zap",
    target: "Pioneering EV Garages, Hybrid Specialists, Fleet Hubs",
  },
  {
    slug: "service-center",
    name: "Service Center Solutions",
    subtitle: "Equipment and parts supply contracts for professional service hubs",
    desc: "Comprehensive parts supply contracts, bulk lubricant drum dispensing setups, multi-bay vehicle lifts, and computerized alignment stations designed for high daily vehicle volume.",
    icon: "Building2",
    target: "Multi-Brand Service Hubs, Dealerships, Franchise Operations",
  },
  {
    slug: "fleet",
    name: "Commercial Fleet Depots",
    subtitle: "Machinery & scheduled parts supply for corporate fleets",
    desc: "Equip in-house fleet maintenance depots with heavy lifts, air tools, diagnostic tablets, and scheduled replenishment of brake pads, batteries, filters, and synthetic fluids.",
    icon: "Truck",
    target: "Logistics Depots, Corporate Shuttles, Bus & Delivery Fleets",
  },
  {
    slug: "distributor",
    name: "Distributor & Wholesale Supply",
    subtitle: "Authorized wholesale supply of automotive equipment & parts",
    desc: "Join the PAGE regional distribution network. Access volume container pricing, exclusive territorial product lines, manufacturer marketing assets, and registered commercial tax invoices.",
    icon: "Users",
    target: "Regional Wholesalers, Automotive Store Chains, Importers",
  },
];

// Multi-mobility platform data structure for vehicle/fleet compatibility finder
export const vehiclePlatformData: Record<MobilityType, Record<string, Record<string, string[]>>> = {
  "4-Wheeler": {
    Toyota: {
      Corolla: ["1.5 Petrol", "1.8 Hybrid", "2.0 Diesel"],
      Axio: ["1.5 Petrol", "1.5 Hybrid"],
      Premio: ["1.5 Petrol", "1.8 Petrol", "2.0 Petrol"],
      HiAce: ["2.5 Diesel", "2.7 Petrol", "3.0 Turbo Diesel"],
    },
    Honda: {
      Civic: ["1.5 VTEC Turbo", "1.8 i-VTEC"],
      Vezel: ["1.5 i-DCD Hybrid", "1.5 Turbo"],
      CR_V: ["1.5 Turbo", "2.0 Hybrid"],
    },
    Nissan: {
      X_Trail: ["2.0 Petrol", "2.0 Hybrid"],
      Sunny: ["1.5 Petrol"],
      Urvan: ["2.5 Diesel"],
    },
    Mitsubishi: {
      Outlander: ["2.4 PHEV", "2.0 Petrol"],
      Pajero: ["3.2 DI-D Turbo Diesel", "3.8 MIVEC"],
    },
  },
  "2-Wheeler": {
    Honda: {
      CB150R: ["150cc DOHC Liquid Cooled"],
      X_Blade: ["160cc Air Cooled"],
      Activa: ["110cc PGM-FI Scooter"],
    },
    Yamaha: {
      FZ_S_V3: ["149cc FI Single Cylinder"],
      R15_V4: ["155cc VVA Liquid Cooled"],
      RayZR: ["125cc Hybrid Scooter"],
    },
    Bajaj: {
      Pulsar_150: ["150cc DTS-i Twin Spark"],
      Pulsar_NS200: ["199cc 4-Valve Triple Spark"],
      Discover_125: ["125cc DTS-i"],
    },
    TVS: {
      Apache_RTR_160: ["160cc 4V Race Edition"],
      Metro_Plus: ["110cc EcoThrust"],
    },
  },
  "3-Wheeler": {
    Bajaj: {
      RE_4_Stroke: ["198cc Petrol / CNG"],
      Maxima_C: ["470cc Diesel Cargo"],
    },
    Piaggio: {
      Ape_Auto_DX: ["395cc Diesel Passenger"],
      Ape_City_Plus: ["230cc Petrol / LPG"],
    },
    Atul: {
      Gem_Paxx: ["436cc Diesel Passenger"],
      Elite_Cargo: ["Electric 48V / 60V Cargo"],
    },
    Runner: {
      E_Rickshaw: ["48V 1000W BLDC Motor"],
      Cargo_3W: ["60V 1200W Electric Carrier"],
    },
  },
  EV: {
    BYD: {
      Atto_3: ["60.48 kWh Blade Battery 150kW"],
      Dolphin: ["44.9 kWh Blade Battery 70kW"],
      Seal: ["82.5 kWh Dual Motor 390kW"],
    },
    MG: {
      ZS_EV: ["51.1 kWh Ternary Lithium 130kW"],
      MG4: ["64 kWh Ultium Battery 150kW"],
    },
    Hero_Electric: {
      Optima_CX: ["51.2V 30Ah Lithium Battery"],
      Photon: ["72V 26Ah Dual Battery Pack"],
    },
    Runner_EV: {
      E_Rickshaw_Pro: ["48V 100Ah LFP Battery System"],
      Eco_Delivery: ["60V 120Ah Commercial Carrier"],
    },
  },
};

export const vehicleData = vehiclePlatformData["4-Wheeler"];

export const years = Array.from({ length: 15 }, (_, i) => String(2024 - i));

export const taka = (n: number) => "৳" + n.toLocaleString("en-IN");

/**
 * Returns all active products for the shop, pulling live products from Admin Inventory
 * (localStorage `admin_inventory`) if present, or falling back to the base `products` catalogue.
 * This guarantees any product added, edited, or deleted in the Admin panel instantly reflects in the frontend shop!
 */
const validMobilitySet = new Set<MobilityType>(["4-Wheeler", "2-Wheeler", "3-Wheeler", "EV"]);

const STATIC_ASSET_BY_BASENAME: Record<string, string> = {
  "p-brakepads.jpg": brakepads,
  "p-battery.jpg": battery,
  "p-oil.jpg": oil,
  "p-scanner.jpg": scanner,
  "brakes.jpg": brakes,
  "engine.jpg": engine,
  "workshop.jpg": workshop,
  "hero-car.jpg": heroCar,
  "hero-workshop.jpg": heroWorkshop,
  "p-lift.jpg": lift,
  "p-tyre-changer.jpg": tyreChanger,
  "p-wheel-balancer.jpg": wheelBalancer,
  "p-compressor.jpg": compressor,
  "p-ev-tools.jpg": evTools,
  "p-ev-battery-analyzer.jpg": evBatteryAnalyzer,
  "p-moto-lift.jpg": motoLift,
  "ev-workshop-bay.jpg": evWorkshopBay,
  "commercial-3w-hub.jpg": commercial3wHub,
  "support-hero.jpg": supportHero,
  "solutions-hero.jpg": solutionsHero,
};

/**
 * Normalizes seeded `/src/assets/<file>` paths to Vite's active runtime URL
 * (`/assets/<file>-<hash>.<ext>` in production Nitro builds, `/src/assets/...` in dev).
 */
const LAUNCH_JPEG_FILENAMES = new Set([
  "launch-creader-professional-919s-359",
  "launch-how-to-do-dpf-regen-for-cummins-on-an-x-431-scan-tool",
  "launch-launch-introduces-split-screen-multitasking-on-x-431-tablets",
  "launch-products",
  "launch-the-graphical-dpf-regen-is-now-available-on-your-x-431-diagnostic-tablet",
  "launch-x-431-adas-pro",
  "launch-x-431-immo-pro",
  "launch-x-431-pro3-se",
  "launch-x-431-smartlink-c-hd-lite",
  "launch-x-prog-3",
]);

export function normalizeProductAssetUrl(src: string): string {
  let trimmed = src.trim();
  if (trimmed.startsWith("/src/assets/")) {
    const basename = trimmed.slice("/src/assets/".length).split(/[?#]/)[0] || "";
    return STATIC_ASSET_BY_BASENAME[basename] || trimmed;
  }
  if (trimmed.startsWith("/uploads/products/launch/")) {
    for (const name of LAUNCH_JPEG_FILENAMES) {
      if (trimmed.includes(`/uploads/products/launch/${name}.png`)) {
        trimmed = trimmed.replace(
          `/uploads/products/launch/${name}.png`,
          `/uploads/products/launch/${name}.jpg`,
        );
      }
    }
    if (!trimmed.includes("?v=") && !trimmed.includes("&v=")) {
      const sep = trimmed.includes("?") ? "&" : "?";
      return `${trimmed}${sep}v=launch-2`;
    }
  }
  return trimmed;
}

export function mapDbProductToProduct(row: ProductLikeRow): Product {
  const fallback = products.find((p) => p.slug === row.slug);
  const resolvedImages =
    Array.isArray(row.images) && row.images.length > 0
      ? row.images
          .filter((src): src is string => typeof src === "string" && src.trim().length > 0)
          .map(normalizeProductAssetUrl)
      : fallback
        ? [fallback.image]
        : [lift];
  const primaryImage =
    resolvedImages[0] ||
    (row.image ? normalizeProductAssetUrl(row.image) : undefined) ||
    fallback?.image ||
    lift;

  const resolvedMobility: MobilityType[] =
    Array.isArray(row.mobility) && row.mobility.length > 0
      ? row.mobility.filter((m): m is MobilityType => validMobilitySet.has(m as MobilityType))
      : fallback?.mobility || ["4-Wheeler"];

  const resolvedFits =
    Array.isArray(row.fits) && row.fits.length > 0
      ? row.fits
      : row.fits === undefined && fallback
        ? fallback.fits
        : [];

  const distinctFeatures = getDistinctProductFeatures(row.features, row.fits);
  const resolvedFeatures =
    distinctFeatures.length > 0 ? distinctFeatures : fallback?.features || [];

  const price = row.priceBdt ?? row.price ?? fallback?.price ?? 0;
  const costPrice =
    row.costPriceBdt ??
    row.costPrice ??
    fallback?.costPrice ??
    (price > 0 ? Math.round((price * 0.72) / 500) * 500 : 0);
  const warehouseQty = row.warehouseQty ?? 10;
  const reorderLevel = row.reorderLevel ?? 2;
  const isEquipment =
    row.isEquipment !== undefined && row.isEquipment !== null
      ? row.isEquipment
      : (fallback?.isEquipment ?? inferIsEquipment(row.category));
  const requiresQuote =
    row.requiresQuote !== undefined && row.requiresQuote !== null
      ? row.requiresQuote
      : (fallback?.requiresQuote ?? (isEquipment || price >= 50000));

  const resolvedCategory =
    row.category || fallback?.category || categories[0] || "Garage Equipment";
  const resolvedSpecs = resolveOrderedSpecs(row.specs, fallback?.specs);
  const defaults = getDefaultProductPresentation({
    slug: row.slug,
    category: resolvedCategory,
    isEquipment,
    requiresQuote,
    specs: resolvedSpecs,
  });

  const resolvedHighlights =
    row.highlights !== undefined && row.highlights !== null
      ? sanitizeHighlightTuples(row.highlights)
      : fallback?.highlights !== undefined
        ? fallback.highlights
        : defaults.highlights;

  const resolvedVariants =
    row.variantOptions !== undefined && row.variantOptions !== null
      ? sanitizeVariantGroups(row.variantOptions)
      : fallback?.variantOptions !== undefined
        ? fallback.variantOptions
        : defaults.variantOptions;

  const resolvedGuarantees =
    row.guarantees !== undefined && row.guarantees !== null
      ? sanitizeGuaranteeBadges(row.guarantees)
      : fallback?.guarantees !== undefined
        ? fallback.guarantees
        : defaults.guarantees;

  const resolvedDispatchHub =
    row.dispatchHub !== undefined && row.dispatchHub !== null
      ? row.dispatchHub.trim()
      : fallback?.dispatchHub !== undefined
        ? fallback.dispatchHub
        : defaults.dispatchHub;

  const rawPriceLabel =
    row.priceLabel !== undefined && row.priceLabel !== null
      ? row.priceLabel.trim()
      : fallback?.priceLabel !== undefined
        ? fallback.priceLabel
        : defaults.priceLabel;
  const resolvedPriceLabel = normalizeStorefrontPriceLabel(rawPriceLabel);

  return {
    slug: row.slug,
    name: row.name,
    brand: row.brand || fallback?.brand || "PAGE Genuine",
    category: resolvedCategory,
    subcategory: row.subcategory || fallback?.subcategory || undefined,
    mobility: resolvedMobility.length > 0 ? resolvedMobility : ["4-Wheeler"],
    price,
    costPrice,
    oldPrice: fallback?.oldPrice,
    rating: fallback?.rating ?? 4.8,
    reviews: fallback?.reviews ?? 1,
    stock: deriveProductStockStatus({
      inStock: row.inStock,
      warehouseQty,
      reorderLevel,
    }),
    warehouseQty,
    reorderLevel,
    badge: row.badge || fallback?.badge || undefined,
    image: primaryImage,
    images: resolvedImages.length > 0 ? resolvedImages : [primaryImage],
    fits: resolvedFits,
    features: resolvedFeatures,
    sku: (row.sku && row.sku.trim()) || fallback?.sku || `PG-${row.slug.slice(0, 6).toUpperCase()}`,
    description: row.description || fallback?.description || row.name,
    specs: resolvedSpecs,
    highlights: resolvedHighlights,
    variantOptions: resolvedVariants,
    guarantees: resolvedGuarantees,
    dispatchHub: resolvedDispatchHub,
    priceLabel: resolvedPriceLabel,
    isEquipment,
    requiresQuote,
  };
}

export function getShopProducts(): Product[] {
  if (typeof window === "undefined") return products;
  try {
    const raw = localStorage.getItem("admin_inventory");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as Product[];
      }
    }
  } catch {
    // fallback
  }
  return products;
}

export function getProductBySlug(slug: string): Product | undefined {
  const all = getShopProducts();
  return all.find((p) => p.slug === slug) || products.find((p) => p.slug === slug);
}
