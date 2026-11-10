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
  mobility: MobilityType[];
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  stock: "In stock" | "Low stock" | "Out of stock";
  image: string;
  fits: string[];
  sku: string;
  description: string;
  specs: [string, string][];
  isEquipment?: boolean;
  requiresQuote?: boolean;
};

export const categories = [
  "Garage Equipment",
  "Tyre & Wheel",
  "Diagnostic Equipment",
  "EV Equipment",
  "Brakes",
  "Batteries",
  "Lubricants & Fluids",
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
    id: "dhaka-tejgaon",
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
  {
    id: "chattogram-port",
    name: "PAGE Regional Hub — Chattogram",
    area: "Chattogram",
    address: "Agrabad Commercial Area, Chattogram",
    rating: 4.8,
    hours: "Sat–Thu 9:00–19:00",
    services: [
      "Heavy Machinery Stock",
      "Diagnostic Scanner Demo",
      "Wholesale Spares",
      "Field Engineer Dispatch",
    ],
    x: 76,
    y: 74,
  },
  {
    id: "bogura-north",
    name: "PAGE North Hub — Bogura",
    area: "Bogura",
    address: "Sherpur Road Industrial Belt, Bogura",
    rating: 4.7,
    hours: "Sat–Thu 9:00–18:00",
    services: ["Tyre Changers & Balancers", "Commercial Fleet Spares", "Lift Anchoring Support"],
    x: 38,
    y: 32,
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

export const products: Product[] = [
  // Commercial Garage Equipment & Lifts
  {
    slug: "heavy-duty-2-post-lift-4t",
    name: "Heavy-Duty 2-Post Electro-Hydraulic Lift 4.0T",
    brand: "Torq",
    category: "Garage Equipment",
    mobility: ["4-Wheeler", "EV"],
    price: 285000,
    oldPrice: 310000,
    rating: 4.9,
    reviews: 34,
    stock: "In stock",
    image: lift,
    fits: ["Commercial Workshop Bay", "Passenger Cars, SUVs & Light Vans"],
    sku: "TQ-LIFT-4000",
    description:
      "Clear-floor electro-hydraulic 2-post lift with 4,000 kg capacity. Features automatic arm restraint locks, dual hydraulic synchronization cylinders, and CE-certified electromagnetic release safety latches for heavy commercial workshop use.",
    specs: [
      ["Lifting Capacity", "4,000 kg (4.0 Ton)"],
      ["Max Lifting Height", "1,900 mm"],
      ["Min Lifting Height", "100 mm"],
      ["Overall Height", "3,840 mm"],
      ["Motor Power", "2.2 kW / 3.0 HP"],
      ["Power Supply", "380V 3-Phase / 50Hz"],
      ["Lifting Time", "50 seconds"],
      ["Warranty", "24 months commercial warranty"],
    ],
    isEquipment: true,
    requiresQuote: true,
  },
  {
    slug: "motorcycle-hydraulic-scissor-lift-500kg",
    name: "Motorcycle & Scooter Hydraulic Scissor Lift 500kg",
    brand: "Torq",
    category: "Garage Equipment",
    mobility: ["2-Wheeler", "EV"],
    price: 68000,
    oldPrice: 75000,
    rating: 4.8,
    reviews: 19,
    stock: "In stock",
    image: motoLift,
    fits: ["Two-Wheeler Garages", "Motorcycles, Scooters & E-Bikes"],
    sku: "TQ-ML-500",
    description:
      "Heavy-duty 2-wheeler workshop scissor lift table with pneumatic foot pedal control, integrated mechanical wheel vise, and drop-out tail plate for rear wheel servicing on motorcycles and scooters.",
    specs: [
      ["Lifting Capacity", "500 kg"],
      ["Max Lifting Height", "1,200 mm"],
      ["Platform Dimensions", "2,200 mm × 680 mm"],
      ["Drive System", "Pneumatic-Hydraulic Foot Pedal"],
      ["Safety Mechanism", "Multi-position mechanical lock bar"],
      ["Wheel Clamp", "Heavy-duty rubber-lined vise clamp included"],
      ["Warranty", "18 months commercial warranty"],
    ],
    isEquipment: true,
    requiresQuote: false,
  },
  {
    slug: "pro-tyre-changer-assist-arm",
    name: "Pro Automatic Tyre Changer with Dual Assist Arm",
    brand: "Torq",
    category: "Tyre & Wheel",
    mobility: ["4-Wheeler", "3-Wheeler", "EV"],
    price: 175000,
    oldPrice: 195000,
    rating: 4.8,
    reviews: 29,
    stock: "In stock",
    image: tyreChanger,
    fits: ["Tyre Service Centers", '10"–24" Passenger & Commercial Rims'],
    sku: "TQ-TC-9000",
    description:
      "Heavy-duty commercial tyre changer equipped with pneumatic tilt-back column and dual power assist arms for effortless demounting of stiff run-flat and ultra-low-profile tyres without rim scratch.",
    specs: [
      ["Clamping Range", '10"–24" (Internal/External)'],
      ["Max Wheel Diameter", "1,040 mm"],
      ["Max Wheel Width", '355 mm (14")'],
      ["Working Pressure", "8–10 bar (115–145 psi)"],
      ["Motor Power", "1.1 kW / 220V or 380V"],
      ["Bead Breaker Force", "2,500 kg"],
      ["Warranty", "18 months commercial warranty"],
    ],
    isEquipment: true,
    requiresQuote: true,
  },
  {
    slug: "digital-wheel-balancer-laser",
    name: "Microprocessor Digital Wheel Balancer with Laser",
    brand: "Axion",
    category: "Tyre & Wheel",
    mobility: ["4-Wheeler", "3-Wheeler", "EV"],
    price: 145000,
    rating: 4.9,
    reviews: 22,
    stock: "In stock",
    image: wheelBalancer,
    fits: ["Automotive Workshop Tyre Bays", "Light Commercial & Passenger Wheels"],
    sku: "AX-WB-900",
    description:
      "High-precision digital wheel balancing system featuring automatic 3D distance and rim diameter sensor input, multi-mode alloy balancing cycles, and laser beam pointer for adhesive weight positioning.",
    specs: [
      ["Rim Diameter", '10"–24"'],
      ["Balancing Accuracy", "±1 g"],
      ["Cycle Time", "7 seconds"],
      ["Max Wheel Weight", "65 kg"],
      ["Shaft Diameter", "40 mm high-grade steel"],
      ["Display", "Digital LED with interactive wheel graphic"],
      ["Warranty", "24 months warranty"],
    ],
    isEquipment: true,
    requiresQuote: true,
  },
  {
    slug: "commercial-truck-bus-tyre-changer-56in",
    name: 'Heavy-Duty Commercial Truck & Bus Tyre Changer 14"–56"',
    brand: "Axion",
    category: "Tyre & Wheel",
    mobility: ["4-Wheeler"],
    price: 385000,
    oldPrice: 420000,
    rating: 4.8,
    reviews: 17,
    stock: "In stock",
    image: tyreChanger,
    fits: ["Commercial Fleet Depots", "Truck, Bus, Tractor & Earthmover Wheels"],
    sku: "AX-TC-5600",
    description:
      "Universal electro-hydraulic commercial tyre changer designed for demounting and mounting tubed and tubeless truck, bus, agricultural, and industrial wheels up to 56 inches in diameter.",
    specs: [
      ["Clamping Rim Capacity", '14"–56" with extension clamps'],
      ["Max Wheel Weight", "1,500 kg"],
      ["Max Wheel Diameter", "2,300 mm"],
      ["Max Wheel Width", "1,050 mm"],
      ["Hydraulic Motor", "1.5 kW / 380V 3-Phase"],
      ["Chuck Motor", "2.2 kW dual speed"],
      ["Warranty", "24 months commercial warranty"],
    ],
    isEquipment: true,
    requiresQuote: true,
  },
  {
    slug: "precision-3d-hd-wheel-alignment-system",
    name: "High-Definition 3D Optical Wheel Alignment System",
    brand: "Axion",
    category: "Tyre & Wheel",
    mobility: ["4-Wheeler", "EV"],
    price: 430000,
    rating: 4.9,
    reviews: 31,
    stock: "In stock",
    image: wheelBalancer,
    fits: ["Precision Alignment Bays", "All Passenger & Light Commercial Vehicles"],
    sku: "AX-WA-3DPRO",
    description:
      "Industrial high-definition dual-camera 3D wheel alignment system with passive target reflectors, automatic vehicle tracking beam, and comprehensive global OEM vehicle database.",
    specs: [
      ["Camera Resolution", "Dual 5.0 Megapixel Industrial CMOS Sensors"],
      ["Measuring Accuracy", "Camber: ±0.02°, Caster: ±0.04°, Toe: ±0.02°"],
      ["Target Clamps", 'Non-contact rim-grip target clamps (11"–25")'],
      ["Database", "Over 45,000 OEM vehicle chassis specifications with annual updates"],
      ["Software", '3D animated alignment adjustment wizard on 32" LED display'],
      ["Warranty", "24 months warranty with calibration certificate"],
    ],
    isEquipment: true,
    requiresQuote: true,
  },
  {
    slug: "rotary-screw-air-compressor-10hp",
    name: "Rotary Screw Air Compressor 10HP / 300L Tank",
    brand: "Kraftwerk",
    category: "Garage Equipment",
    mobility: ["4-Wheeler", "2-Wheeler", "3-Wheeler", "EV"],
    price: 240000,
    rating: 4.7,
    reviews: 18,
    stock: "In stock",
    image: compressor,
    fits: ["Full Workshop Air Line Supply", "Pneumatic Tools, Lifts & Changers"],
    sku: "KW-SC-10HP",
    description:
      "Continuous-duty rotary screw compressor unit mounted on a 300L air receiver vessel with integrated refrigerated dryer and inline filtration. Engineered for 100% duty cycle commercial workshop pneumatic demands.",
    specs: [
      ["Motor Power", "7.5 kW / 10 HP"],
      ["Working Pressure", "10 bar (145 psi)"],
      ["Air Delivery", "1,050 L/min (37 CFM)"],
      ["Tank Volume", "300 Litres ASME Certified"],
      ["Noise Level", "65 dB(A) whisper quiet acoustic cabinet"],
      ["Warranty", "36 months on screw air end"],
    ],
    isEquipment: true,
    requiresQuote: true,
  },
  {
    slug: "heavy-duty-4-post-alignment-lift-5t",
    name: "Heavy-Duty 4-Post Wheel Alignment Lift 5.0T",
    brand: "Torq",
    category: "Garage Equipment",
    mobility: ["4-Wheeler", "EV"],
    price: 360000,
    oldPrice: 395000,
    rating: 4.9,
    reviews: 26,
    stock: "In stock",
    image: lift,
    fits: ["Commercial Alignment Bays", "Passenger Cars, SUVs & Light Trucks"],
    sku: "TQ-4PL-5000",
    description:
      "Precision 4-post commercial vehicle hoist with integrated slip plates, turntable recesses, and secondary pneumatic scissor jack beam for heavy-duty 3D wheel alignment operations.",
    specs: [
      ["Lifting Capacity", "5,000 kg (5.0 Ton)"],
      ["Runway Length", "5,100 mm"],
      ["Lifting Height", "1,850 mm"],
      ["Drive System", "Electro-hydraulic with cable synchronization"],
      ["Safety Locks", "Multi-position pneumatic mechanical ladder locks"],
      ["Secondary Jacking Beam", "3,000 kg pneumatic rolling jack included"],
      ["Warranty", "24 months commercial warranty"],
    ],
    isEquipment: true,
    requiresQuote: true,
  },

  // EV Equipment & Safety
  {
    slug: "ev-1000v-insulated-tool-kit",
    name: "1000V VDE Insulated EV Safety Tool Kit (42-Piece)",
    brand: "Kraftwerk",
    category: "EV Equipment",
    mobility: ["EV", "2-Wheeler", "3-Wheeler", "4-Wheeler"],
    price: 48500,
    oldPrice: 54000,
    rating: 4.9,
    reviews: 41,
    stock: "In stock",
    image: evTools,
    fits: ["EV Workshops", "Electric Cars, E-Bikes, E-Rickshaws & Hybrids"],
    sku: "KW-EV-1000V",
    description:
      "Certified IEC 60900 / DIN EN 60900 1000V insulated hand tool set in a heavy-duty IP67 protective case. Crucial safety equipment for mechanics and technicians working on high-voltage battery disconnects, inverters, and EV wiring.",
    specs: [
      ["Insulation Rating", "1000V AC / 1500V DC tested"],
      ["Standard Compliance", "IEC 60900:2018 / VDE GS"],
      ["Tool Count", "42 precision insulated tools"],
      ["Case", "Heavy-duty impact-resistant foam cut organizer"],
      [
        "Included",
        "Insulated ratchet, sockets (8-22mm), open wrenches, screwdrivers, pliers, torque wrench",
      ],
      ["Warranty", "Lifetime warranty on steel forging"],
    ],
    isEquipment: false,
    requiresQuote: false,
  },
  {
    slug: "ev-battery-pack-diagnostic-analyzer",
    name: "High-Voltage EV Battery Pack Diagnostic Station",
    brand: "Diagtek",
    category: "EV Equipment",
    mobility: ["EV", "3-Wheeler", "4-Wheeler"],
    price: 380000,
    rating: 4.9,
    reviews: 14,
    stock: "In stock",
    image: evBatteryAnalyzer,
    fits: ["EV Repair Centers", "Lithium-ion Battery Modules & Packs"],
    sku: "DT-EV-BT950",
    description:
      "Mobile commercial testing workstation for high-voltage traction batteries. Measures module State of Health (SOH), individual cell voltage consistency, internal resistance, and automated cell equalization balancing for 4W and 3W electric vehicles.",
    specs: [
      ["Voltage Range", "0–800V DC High Voltage"],
      ["Cell Measurement", "Up to 32S simultaneously with CAN/RS485 logging"],
      ["Max Current", "100A Charge / Discharge Testing"],
      ["Interface", '10.1" Rugged Industrial Touchscreen'],
      ["Protocols", "CAN Bus, OBD2, K-Line, UDS EV Protocol"],
      ["Safety", "Emergency shutoff, reverse polarity, overtemp interlock"],
      ["Warranty", "24 months manufacturer warranty"],
    ],
    isEquipment: true,
    requiresQuote: true,
  },
  {
    slug: "ev-traction-battery-cell-balancer",
    name: "Automated EV Battery Cell Equalizer & Module Balancer",
    brand: "Voltis",
    category: "EV Equipment",
    mobility: ["EV", "3-Wheeler", "4-Wheeler"],
    price: 295000,
    rating: 4.8,
    reviews: 16,
    stock: "In stock",
    image: evBatteryAnalyzer,
    fits: ["EV Battery Service Garages", "NMC, LFP & LTO Lithium Modules"],
    sku: "VT-EQ-800",
    description:
      "Professional high-precision multi-channel battery cell equalizer designed for workshop battery reconditioning, cell replacement matching, and active pack balancing.",
    specs: [
      ["Channels", "16 independent bi-directional balancing channels"],
      ["Equalization Current", "Up to 10A per channel programmable"],
      ["Voltage Accuracy", "±1 mV high-precision sampling"],
      ["Cooling", "Intelligent variable-speed forced-air thermal system"],
      ["Protection", "Overvoltage, undervoltage, reverse polarity, and short-circuit"],
      ["Warranty", "18 months manufacturer warranty"],
    ],
    isEquipment: true,
    requiresQuote: true,
  },
  {
    slug: "high-voltage-ev-motor-insulation-tester",
    name: "5000V High-Voltage EV Motor Insulation Tester & Megohmmeter",
    brand: "Diagtek",
    category: "EV Equipment",
    mobility: ["EV", "2-Wheeler", "3-Wheeler", "4-Wheeler"],
    price: 115000,
    oldPrice: 128000,
    rating: 4.9,
    reviews: 23,
    stock: "In stock",
    image: evTools,
    fits: ["EV Powertrain Diagnostic Bays", "Permanent Magnet AC & Induction Traction Motors"],
    sku: "DT-HV-5KV",
    description:
      "High-voltage diagnostic insulation resistance tester certified for testing stator windings, inverter DC bus isolation, and chassis leak resistance up to 5kV DC.",
    specs: [
      ["Test Voltages", "250V, 500V, 1000V, 2500V, 5000V DC"],
      ["Resistance Range", "0.01 MΩ to 10.0 TΩ"],
      ["Dielectric Discharge", "Automatic polarization index (PI) and DAR calculation"],
      ["Safety Rating", "CAT IV 600V / CAT III 1000V EN 61010-1"],
      ["Display", "Dual backlit analog bargraph & digital LCD display"],
      ["Warranty", "24 months manufacturer warranty"],
    ],
    isEquipment: false,
    requiresQuote: false,
  },

  // Diagnostics & Tools
  {
    slug: "pro-obd2-diagnostic-scanner",
    name: "Pro OBD2 / CAN Universal Diagnostic Scanner Tablet",
    brand: "Diagtek",
    category: "Diagnostic Equipment",
    mobility: ["4-Wheeler", "EV"],
    price: 32500,
    oldPrice: 36000,
    rating: 4.7,
    reviews: 71,
    stock: "In stock",
    image: scanner,
    fits: ["Automotive Workshop Diagnostics", "1996+ OBD2 / CAN / EOBD Vehicles"],
    sku: "DT-PRO-5",
    description:
      'Multi-brand workshop diagnostic tool with 5" touchscreen. Read and clear manufacturer DTCs, live PID data graphing, automated service resets, EPB calibration, battery registration, and bi-directional component actuation.',
    specs: [
      ["Screen", '5.0" IPS Color Touchscreen'],
      ["Coverage", "90+ Global vehicle manufacturers"],
      ["Updates", "2 Years Free Wi-Fi Software Updates"],
      ["Protocols", "CAN-FD, DoIP, ISO9141, KWP2000, J1850"],
      ["Warranty", "12 months commercial warranty"],
    ],
    isEquipment: false,
    requiresQuote: false,
  },
  {
    slug: "bluetooth-obd-dongle",
    name: "Heavy-Duty Workshop Bluetooth Diagnostic Interface",
    brand: "Diagtek",
    category: "Diagnostic Equipment",
    mobility: ["4-Wheeler", "EV"],
    price: 3900,
    rating: 4.4,
    reviews: 203,
    stock: "In stock",
    image: scanner,
    fits: ["Technicians & Quick Diagnostics", "Universal OBD2 Vehicles"],
    sku: "DT-BT-1",
    description:
      "Pocket wireless adapter connecting vehicle OBD port directly to Android/iOS tablet or smartphone for rapid bay triage, readiness monitors, and fault code scanning.",
    specs: [
      ["Connection", "Bluetooth 5.0 Low Energy"],
      ["Compatibility", "Android / iOS / Windows PC"],
      ["Supported Protocols", "All standard OBD2 & CAN protocols"],
      ["Warranty", "12 months warranty"],
    ],
    isEquipment: false,
    requiresQuote: false,
  },
  {
    slug: "commercial-adas-radar-camera-calibration-station",
    name: "Commercial ADAS Radar & Camera Target Calibration Station",
    brand: "Diagtek",
    category: "Diagnostic Equipment",
    mobility: ["4-Wheeler", "EV"],
    price: 395000,
    rating: 4.9,
    reviews: 19,
    stock: "In stock",
    image: scanner,
    fits: ["Collision Repair Centers & Windshield Replacement Hubs", "Camera & Radar ADAS Systems"],
    sku: "DT-ADAS-CAL",
    description:
      "Multi-target optical and millimeter-wave radar calibration rig for Lane Departure Warning (LDW), Adaptive Cruise Control (ACC), and Around View Monitoring (AVM) sensor calibration.",
    specs: [
      ["Target Coverage", "Toyota, Honda, Nissan, Hyundai, VAG, Mercedes, BMW"],
      ["Laser Alignment", "High-accuracy dual millimeter laser centering"],
      ["Frame Structure", "Heavy-duty aluminum alloy mobile crossbeam with micro-height adjuster"],
      ["Compatibility", "Integrates seamlessly with Diagtek Pro diagnostic tablets"],
      ["Warranty", "24 months commercial warranty with target boards"],
    ],
    isEquipment: true,
    requiresQuote: true,
  },
  {
    slug: "heavy-duty-fleet-commercial-scanner-tablet",
    name: 'Commercial Fleet Heavy Truck & Bus Diagnostic Scanner 10"',
    brand: "Diagtek",
    category: "Diagnostic Equipment",
    mobility: ["4-Wheeler"],
    price: 185000,
    oldPrice: 205000,
    rating: 4.8,
    reviews: 35,
    stock: "In stock",
    image: scanner,
    fits: [
      "Commercial Fleets, Bus Depots & Heavy Transport Garages",
      "J1939, J1708, OBD Heavy Duty",
    ],
    sku: "DT-HD-10",
    description:
      "Ruggedized IP65 industrial 10-inch Android diagnostic tablet with full bi-directional actuation, DPF regeneration, SCR/AdBlue reset, cylinder cut-out, and injector coding for commercial diesel engines.",
    specs: [
      ["Hardware", '10.1" Sunlight-Readable Gorilla Glass Display, 8-Core CPU'],
      ["Protocols", "SAE J1939, SAE J1708, J1587, ISO 15765-4, CAN 2.0"],
      [
        "Engine Coverage",
        "Cummins, Isuzu, Hino, Mitsubishi Fuso, Caterpillar, Detroit Diesel, Volvo",
      ],
      ["Battery Life", "12,000 mAh rechargeable lithium pack (10+ hours continuous use)"],
      ["Warranty", "24 months commercial warranty + 2 years free software updates"],
    ],
    isEquipment: false,
    requiresQuote: false,
  },

  // Parts & Consumables
  {
    slug: "ceramic-brake-pad-set-front",
    name: "Commercial Grade Ceramic Brake Pad Set — Front Axle",
    brand: "Stopline",
    category: "Brakes",
    mobility: ["4-Wheeler"],
    price: 4850,
    oldPrice: 5600,
    rating: 4.8,
    reviews: 214,
    stock: "In stock",
    image: brakepads,
    fits: ["Toyota Corolla 2014–2022", "Toyota Axio 2015–2023", "Toyota Allion"],
    sku: "SL-BP-2210",
    description:
      "Low-dust, high-temperature ceramic friction compound formulated for long rotor life and consistent coefficient of friction under heavy stop-and-go fleet driving. Chamfered with multi-layer noise damping shims.",
    specs: [
      ["Compound", "High-Friction Ceramic Formulation"],
      ["Position", "Front Axle"],
      ["Backing Plate", "Anti-Corrosion Powder Coated"],
      ["Wear Sensor", "Included in pack"],
      ["Warranty", "12 months / 20,000 km warranty"],
    ],
    isEquipment: false,
    requiresQuote: false,
  },
  {
    slug: "ceramic-brake-pad-set-rear",
    name: "Commercial Grade Ceramic Brake Pad Set — Rear Axle",
    brand: "Stopline",
    category: "Brakes",
    mobility: ["4-Wheeler"],
    price: 4200,
    rating: 4.7,
    reviews: 132,
    stock: "In stock",
    image: brakepads,
    fits: ["Honda Civic 2016–2021", "Honda CR-V 2017–2022"],
    sku: "SL-BP-2280",
    description:
      "Rear-axle ceramic pads engineered for passenger cars and light commercial applications. Minimum dust and zero rotor scoring.",
    specs: [
      ["Compound", "Ceramic Low-Metallic"],
      ["Position", "Rear Axle"],
      ["Hardware", "Stainless steel abutment clips included"],
      ["Warranty", "12 months warranty"],
    ],
    isEquipment: false,
    requiresQuote: false,
  },
  {
    slug: "high-carbon-ventilated-brake-rotors-front",
    name: "Commercial High-Carbon Ventilated Front Brake Disc Rotors (Pair)",
    brand: "Stopline",
    category: "Brakes",
    mobility: ["4-Wheeler"],
    price: 9800,
    oldPrice: 11200,
    rating: 4.8,
    reviews: 94,
    stock: "In stock",
    image: brakepads,
    fits: ["Toyota HiAce 2010–2023", "Toyota Premio / Allion", "Nissan NV200"],
    sku: "SL-DR-4100",
    description:
      "High-carbon grey cast iron brake disc pair engineered with directional cooling vanes for thermal warp resistance, noise suppression, and long service life in commercial delivery fleets.",
    specs: [
      ["Material", "High-Carbon G3000 Grey Cast Iron"],
      ["Vane Type", "Curved Directional Ventilation Vanes"],
      ["Coating", "Geomet anti-rust zinc flake surface treatment"],
      ["Runout Tolerance", "< 0.02 mm precision balanced"],
      ["Warranty", "12 months / 30,000 km warranty"],
    ],
    isEquipment: false,
    requiresQuote: false,
  },
  {
    slug: "synthetic-dot4-high-boiling-brake-fluid-12l",
    name: "Synthetic DOT 4 High-Boiling Brake Fluid (Commercial Case 12×1L)",
    brand: "Stopline",
    category: "Brakes",
    mobility: ["4-Wheeler", "2-Wheeler", "3-Wheeler"],
    price: 11400,
    rating: 4.9,
    reviews: 118,
    stock: "In stock",
    image: oil,
    fits: ["All Hydraulic Disc & Drum Brake Systems", "ABS, ESP & TCS Equipped Fleets"],
    sku: "SL-BF-DOT4-12",
    description:
      "Premium glycol-ether synthetic hydraulic brake fluid with high dry and wet boiling points to prevent vapor lock and pedal fade under severe braking conditions in commercial service.",
    specs: [
      ["Standard", "DOT 4 / SAE J1704 / ISO 4925 Class 4"],
      ["Dry Boiling Point", "265°C (509°F) minimum"],
      ["Wet Boiling Point", "165°C (329°F) minimum"],
      ["Packaging", "Workshop case of 12 sealed 1-Litre bottles"],
      ["Corrosion Inhibitor", "Protects cast iron, steel, copper, and aluminum brake lines"],
    ],
    isEquipment: false,
    requiresQuote: false,
  },
  {
    slug: "agm-battery-70ah",
    name: "Heavy-Duty AGM Start-Stop Battery 70Ah / 760 CCA",
    brand: "Voltis",
    category: "Batteries",
    mobility: ["4-Wheeler", "EV"],
    price: 18900,
    rating: 4.8,
    reviews: 96,
    stock: "Low stock",
    image: battery,
    fits: ["Honda Vezel Hybrid", "Toyota Premio", "European Start-Stop Models"],
    sku: "VT-AGM-70",
    description:
      "Absorbent Glass Mat (AGM) battery engineered for commercial vehicles, start-stop regenerative braking systems, and high electronic accessory loads.",
    specs: [
      ["Capacity", "70 Ah"],
      ["Cold Cranking Amps (CCA)", "760 A (EN standard)"],
      ["Chemistry", "VRLA / AGM Sealed Maintenance-Free"],
      ["Cycle Life", "3x standard flooded battery life"],
      ["Warranty", "24 months commercial replacement warranty"],
    ],
    isEquipment: false,
    requiresQuote: false,
  },
  {
    slug: "efb-battery-60ah",
    name: "Enhanced Flooded EFB Battery 60Ah / 560 CCA",
    brand: "Voltis",
    category: "Batteries",
    mobility: ["4-Wheeler", "3-Wheeler"],
    price: 13400,
    rating: 4.6,
    reviews: 58,
    stock: "In stock",
    image: battery,
    fits: ["Toyota Corolla", "Commercial 3-Wheelers", "Passenger Cars"],
    sku: "VT-EFB-60",
    description:
      "Enhanced flooded battery designed for entry-level start-stop vehicles, commercial delivery fleets, and high-temperature operating conditions.",
    specs: [
      ["Capacity", "60 Ah"],
      ["Cold Cranking Amps (CCA)", "560 A"],
      ["Type", "Enhanced Flooded (EFB)"],
      ["Warranty", "18 months warranty"],
    ],
    isEquipment: false,
    requiresQuote: false,
  },
  {
    slug: "commercial-fleet-heavy-duty-battery-200ah",
    name: "Commercial Heavy Fleet & Bus Battery 200Ah / 1200 CCA",
    brand: "Voltis",
    category: "Batteries",
    mobility: ["4-Wheeler"],
    price: 28500,
    oldPrice: 31000,
    rating: 4.8,
    reviews: 77,
    stock: "In stock",
    image: battery,
    fits: [
      "Commercial Buses, Heavy Cargo Haulers & Generators",
      "Hino, Isuzu, Tata, Ashok Leyland",
    ],
    sku: "VT-HD-200",
    description:
      "Commercial heavy-duty lead-calcium battery with vibration-resistant anchor bonded plates and reinforced labyrinth lid designed for long service life in extreme tropical operating climates.",
    specs: [
      ["Capacity", "200 Ah @ 20Hr Rate"],
      ["Cold Cranking Amps (CCA)", "1,200 A (EN)"],
      ["Terminal Type", "Standard Heavy Commercial A-Post"],
      ["Vibration Resistance", "V3 vibration proof certified"],
      ["Warranty", "18 months commercial warranty"],
    ],
    isEquipment: false,
    requiresQuote: false,
  },
  {
    slug: "lifepo4-auxiliary-lithium-battery-100ah",
    name: "Deep-Cycle LiFePO4 Lithium Auxiliary Battery 12V 100Ah",
    brand: "Voltis",
    category: "Batteries",
    mobility: ["EV", "3-Wheeler", "4-Wheeler"],
    price: 38500,
    rating: 4.9,
    reviews: 43,
    stock: "In stock",
    image: battery,
    fits: ["Electric 3-Wheelers, Workshop Test Benches & Service Shuttles"],
    sku: "VT-LFP-100",
    description:
      "Grade-A prismatic lithium iron phosphate auxiliary battery with built-in 100A smart Bluetooth BMS for cell monitoring, thermal protection, and 4,000+ deep-discharge cycles.",
    specs: [
      ["Nominal Voltage", "12.8V DC"],
      ["Capacity", "100 Ah (1,280 Wh)"],
      ["Cycle Life", "4,000+ cycles @ 80% DOD"],
      ["BMS", "Integrated Smart Bluetooth BMS with mobile telemetry app"],
      ["Weight", "11.2 kg (60% lighter than equivalent lead-acid)"],
      ["Warranty", "36 months manufacturer warranty"],
    ],
    isEquipment: false,
    requiresQuote: false,
  },
  {
    slug: "synthetic-engine-oil-5w30-4l",
    name: "Full Synthetic Engine Oil 5W-30 (4L Commercial Pack)",
    brand: "Lubrix",
    category: "Lubricants & Fluids",
    mobility: ["4-Wheeler", "3-Wheeler"],
    price: 5200,
    rating: 4.9,
    reviews: 388,
    stock: "In stock",
    image: oil,
    fits: ["Petrol & Turbo Diesel Engines", "Toyota, Honda, Nissan, Mitsubishi"],
    sku: "LX-5W30-4",
    description:
      "Advanced PAO full synthetic formulation engineered for thermal stability, anti-wear valve-train protection, and sludge control in commercial service operations.",
    specs: [
      ["Viscosity Grade", "SAE 5W-30"],
      ["Specifications", "API SP / ILSAC GF-6A / ACEA C3"],
      ["Base Stock", "Full Synthetic Group III / PAO"],
      ["Volume", "4 Litres (Also available in 208L workshop drums)"],
    ],
    isEquipment: false,
    requiresQuote: false,
  },
  {
    slug: "synthetic-engine-oil-0w20-4l",
    name: "Hybrid Low-Viscosity Engine Oil 0W-20 (4L Pack)",
    brand: "Lubrix",
    category: "Lubricants & Fluids",
    mobility: ["4-Wheeler", "EV"],
    price: 5600,
    rating: 4.8,
    reviews: 144,
    stock: "Out of stock",
    image: oil,
    fits: ["Toyota Aqua, Prius, Honda Hybrid Platforms"],
    sku: "LX-0W20-4",
    description:
      "Ultra-low viscosity synthetic fluid tailored for hybrid electric powertrains with frequent cold stop-start ignition cycles.",
    specs: [
      ["Viscosity Grade", "SAE 0W-20"],
      ["Standard", "API SP Resource Conserving"],
      ["Volume", "4 Litres"],
    ],
    isEquipment: false,
    requiresQuote: false,
  },
  {
    slug: "heavy-duty-diesel-engine-oil-15w40-20l",
    name: "Commercial Heavy-Duty Diesel Engine Oil 15W-40 (20L Pail)",
    brand: "Lubrix",
    category: "Lubricants & Fluids",
    mobility: ["4-Wheeler", "3-Wheeler"],
    price: 14800,
    oldPrice: 16500,
    rating: 4.9,
    reviews: 162,
    stock: "In stock",
    image: oil,
    fits: ["Commercial Fleet Vans, Light Trucks, Buses & Heavy Equipment"],
    sku: "LX-15W40-20",
    description:
      "Heavy-duty diesel engine oil formulated with high soot-dispersancy additives and shear-stable polymers for extended oil-drain intervals in commercial transport operations.",
    specs: [
      ["Viscosity Grade", "SAE 15W-40"],
      ["Specifications", "API CK-4 / CJ-4 / CI-4 PLUS / ACEA E9"],
      ["Base Stock", "Hydro-cracked Group II+ Mineral Formulation"],
      ["Packaging", "20 Litre industrial workshop pail with pour spout"],
      ["TBN", "10.2 mg KOH/g for acid neutralization"],
    ],
    isEquipment: false,
    requiresQuote: false,
  },
  {
    slug: "universal-full-synthetic-atf-cvt-fluid-4l",
    name: "Multi-Vehicle Full Synthetic ATF & CVT Transmission Fluid 4L",
    brand: "Lubrix",
    category: "Lubricants & Fluids",
    mobility: ["4-Wheeler", "EV"],
    price: 6400,
    rating: 4.8,
    reviews: 110,
    stock: "In stock",
    image: oil,
    fits: ["Toyota, Honda, Nissan, Mitsubishi Automatic & CVT Transmissions"],
    sku: "LX-ATFCVT-4",
    description:
      "Universal full synthetic transmission fluid engineered with friction-durability modifiers for smooth torque-converter lockup and anti-shudder belt grip in modern automatic and CVT gearboxes.",
    specs: [
      ["Compatibility", "Toyota WS/T-IV, Honda ATF-Z1/DW-1, Nissan Matic-D/J/S & CVT NS-2/NS-3"],
      ["Base Stock", "Full Synthetic Group IV PAO"],
      ["Volume", "4 Litres"],
      ["Viscosity Index", "175 high viscosity index for thermal resistance"],
    ],
    isEquipment: false,
    requiresQuote: false,
  },
];

export const brands = [
  "Torq",
  "Diagtek",
  "Kraftwerk",
  "Axion",
  "Stopline",
  "Voltis",
  "Lubrix",
  "Nordline",
  "Meridian",
  "Hexa",
];

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
