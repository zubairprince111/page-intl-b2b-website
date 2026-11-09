// ─── Admin Dashboard Data Layer ───────────────────────────────────────────────
// All admin data is persisted to localStorage so edits survive refreshes.
// In production this would connect to a real backend / Supabase instance.

import { products as catalogProducts, type Product } from "./data";

/* ──── Types ──── */

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "product_manager" | "staff" | "viewer";
  status: "active" | "suspended";
  avatar?: string;
  createdAt: string;
  lastLogin: string;
};

export type InventoryItem = Product & {
  warehouseQty: number;
  reorderLevel: number;
  lastRestocked: string;
};

export type QuoteItem = {
  productSlug: string;
  productName: string;
  qty: number;
  unitPrice?: number;
};

export type QuoteRequest = {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  productSlug: string;
  productName: string;
  qty: number;
  items?: QuoteItem[] | undefined;
  businessType: string;
  city: string;
  notes: string;
  status: "pending" | "replied" | "accepted" | "declined";
  reply?: string | undefined;
  quotedPrice?: number | undefined;
  createdAt: string;
  updatedAt: string;
};

export type ConsultBooking = {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  serviceId: string;
  serviceName: string;
  centerId: string;
  centerName: string;
  preferredDate: string;
  notes: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
};

export type SiteSetting = {
  siteName: string;
  tagline: string;
  primaryColor: string;
  contactEmail: string;
  contactPhone: string;
  heroHeadline: string;
  heroSubline: string;
  announcementBar: string;
  announcementActive: boolean;
  socialLinkedin?: string;
  socialFacebook?: string;
  socialInstagram?: string;
};

export type BannerItem = {
  id: string;
  title: string;
  image: string;
  link: string;
  mobilityKey?: "4-Wheeler" | "2-Wheeler" | "3-Wheeler" | "All";
  alt: string;
  bgColor?: string;
  active: boolean;
  order: number;
  createdAt: string;
};

export type UpdateCategory =
  "shipment_inbound" | "client_delivery" | "commissioning" | "product_launch" | "tech_bulletin";

export type FeedUpdate = {
  id: string;
  title: string;
  slug: string;
  category: UpdateCategory;
  categoryLabel?: string | undefined;
  date: string;
  summary: string;
  content: string;
  companyOrClient?: string | undefined;
  location: string;
  images: string[];
  equipmentNames?: string[] | undefined;
  badge?: string | undefined;
  pinned?: boolean | undefined;
  published: boolean;
  author: string;
  readTimeMinutes?: number | undefined;
  tags?: string[] | undefined;
  createdAt: string;
  updatedAt: string;
};

/* ──── Helpers ──── */

const LS_KEYS = {
  users: "admin_users",
  inventory: "admin_inventory",
  quotes: "admin_quotes",
  bookings: "admin_bookings",
  settings: "admin_settings",
  auth: "admin_auth_user",
  banners: "admin_banners",
  updates: "admin_updates",
} as const;

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function now() {
  return new Date().toISOString();
}

/* ──── Seed Data ──── */

const seedUsers: AdminUser[] = [
  {
    id: "u-admin-01",
    name: "Rafiq Hossain",
    email: "rafiq@pageinternational.com",
    role: "admin",
    status: "active",
    createdAt: "2024-08-01T10:00:00Z",
    lastLogin: "2025-10-15T08:30:00Z",
  },
  {
    id: "u-pm-01",
    name: "Nusrat Akhter",
    email: "nusrat@pageinternational.com",
    role: "product_manager",
    status: "active",
    createdAt: "2024-10-12T09:00:00Z",
    lastLogin: "2025-10-14T14:20:00Z",
  },
  {
    id: "u-staff-01",
    name: "Tanvir Ahmed",
    email: "staff@pageinternational.com",
    role: "staff",
    status: "active",
    createdAt: "2025-01-15T09:30:00Z",
    lastLogin: "2025-10-15T07:15:00Z",
  },
  {
    id: "u-viewer-01",
    name: "Kamal Uddin",
    email: "kamal@pageinternational.com",
    role: "viewer",
    status: "active",
    createdAt: "2025-01-20T11:00:00Z",
    lastLogin: "2025-10-13T10:00:00Z",
  },
];

const seedQuotes: QuoteRequest[] = [
  {
    id: "q-001",
    companyName: "AutoFix Garage Ltd.",
    contactName: "Tanvir Ahmed",
    phone: "+880-1711-123456",
    email: "tanvir@autofixbd.com",
    productSlug: "heavy-duty-2-post-lift-4t",
    productName: "Heavy-Duty 2-Post Electro-Hydraulic Lift 4.0T",
    qty: 2,
    businessType: "Workshop / Garage",
    city: "Dhaka",
    notes: "Need installation service as well.",
    status: "pending",
    createdAt: "2025-10-10T09:00:00Z",
    updatedAt: "2025-10-10T09:00:00Z",
  },
  {
    id: "q-002",
    companyName: "Dhaka Tyre Center",
    contactName: "Rashid Khan",
    phone: "+880-1911-654321",
    email: "rashid@dhakatyre.com",
    productSlug: "pro-tyre-changer-assist-arm",
    productName: "Pro Automatic Tyre Changer with Dual Assist Arm",
    qty: 1,
    businessType: "Tyre Service Center",
    city: "Dhaka",
    notes: "",
    status: "replied",
    reply:
      "Thank you for your interest. We can offer a 5% bulk discount for 2+ units. Please confirm to proceed.",
    createdAt: "2025-10-08T14:00:00Z",
    updatedAt: "2025-10-09T11:00:00Z",
  },
  {
    id: "q-003",
    companyName: "Green Fleet BD",
    contactName: "Selim Reza",
    phone: "+880-1611-987654",
    email: "selim@greenfleetbd.com",
    productSlug: "ev-battery-pack-diagnostic-analyzer",
    productName: "High-Voltage EV Battery Pack Diagnostic Station",
    qty: 1,
    businessType: "Fleet Operator",
    city: "Chattogram",
    notes: "Need urgent for our EV fleet expansion.",
    status: "accepted",
    reply: "Confirmed at ৳3,60,000 with free installation. Delivery in 5 business days.",
    createdAt: "2025-10-05T10:30:00Z",
    updatedAt: "2025-10-07T16:00:00Z",
  },
];

const seedBookings: ConsultBooking[] = [
  {
    id: "b-001",
    companyName: "Speed Motors Workshop",
    contactName: "Arif Hossain",
    phone: "+880-1811-111111",
    email: "arif@speedmotors.com",
    serviceId: "lift-demo",
    serviceName: "Vehicle Lift Machinery Demonstration",
    centerId: "dhaka-tejgaon",
    centerName: "PAGE Equipment Hub — Tejgaon",
    preferredDate: "2025-10-20",
    notes: "Interested in 4-post alignment lift",
    status: "confirmed",
    createdAt: "2025-10-12T08:00:00Z",
    updatedAt: "2025-10-12T10:00:00Z",
  },
  {
    id: "b-002",
    companyName: "EcoRide EV Center",
    contactName: "Fariha Begum",
    phone: "+880-1511-222222",
    email: "fariha@ecoride.com",
    serviceId: "ev-audit",
    serviceName: "EV Workshop Transition & 1000V Tooling Consultation",
    centerId: "chattogram-port",
    centerName: "PAGE Regional Hub — Chattogram",
    preferredDate: "2025-10-25",
    notes: "Planning to set up 3 EV bays",
    status: "pending",
    createdAt: "2025-10-14T15:00:00Z",
    updatedAt: "2025-10-14T15:00:00Z",
  },
];

const defaultSettings: SiteSetting = {
  siteName: "PAGE International",
  tagline: "Think Next. Build Better.",
  primaryColor: "#dc2626",
  contactEmail: "info@pageinternational.com",
  contactPhone: "+880-1700-000000",
  heroHeadline: "THINK NEXT.",
  heroSubline: "Built to Perform. Certified to Last.",
  announcementBar: "🔥 Free installation on all 2-post lifts this month!",
  announcementActive: false,
  socialLinkedin: "https://www.linkedin.com/company/page-international-ltd/",
  socialFacebook: "https://www.facebook.com/pageinternationalltd/",
  socialInstagram: "https://www.instagram.com/pageintl",
};

export const seedBanners: BannerItem[] = [
  {
    id: "banner-durga-puja",
    title: "Launch Diagnostic Solutions — Durga Puja 20% Off",
    image: "/durga-puja-launch-banner.png",
    link: "/shop",
    mobilityKey: "4-Wheeler",
    alt: "Launch Professional Diagnostic Solutions — Special Offer This Durga Puja Get Up To 20% Off",
    bgColor: "bg-white",
    active: true,
    order: 1,
    createdAt: "2025-10-15T10:00:00Z",
  },
  {
    id: "banner-fuel-efficiency",
    title: "4-Wheeler Mobility Showcase — Fuel Efficiency",
    image: "/Fuel Efficiency Highway Showcase.png",
    link: "/shop",
    mobilityKey: "4-Wheeler",
    alt: "4-Wheeler Mobility Showcase — Fuel Efficiency",
    bgColor: "bg-gradient-to-r from-amber-950/40 via-zinc-950 to-sky-950/40",
    active: true,
    order: 2,
    createdAt: "2025-10-14T09:00:00Z",
  },
  {
    id: "banner-diagnostics",
    title: "2-Wheeler Mobility Showcase — Automotive Diagnostics",
    image: "/Futuristic Automotive Diagnostics Showcase.png",
    link: "/shop",
    mobilityKey: "2-Wheeler",
    alt: "2-Wheeler Mobility Showcase — Automotive Diagnostics",
    bgColor: "bg-zinc-900",
    active: true,
    order: 3,
    createdAt: "2025-10-13T08:00:00Z",
  },
  {
    id: "banner-lift",
    title: "3-Wheeler Mobility Showcase — Two-Post Lift 4.0 Ton",
    image: "/Page Two-Post Lift 4.0 Ton.png",
    link: "/shop",
    mobilityKey: "3-Wheeler",
    alt: "3-Wheeler Mobility Showcase — Two-Post Lift 4.0 Ton",
    bgColor: "bg-white",
    active: true,
    order: 4,
    createdAt: "2025-10-12T07:00:00Z",
  },
];

export const seedUpdates: FeedUpdate[] = [
  {
    id: "update-launch-container-chittagong",
    title:
      "40ft High-Cube Maritime Consignment of Launch X-431 Diagnostics Cleared to Tejgaon Central Hub",
    slug: "launch-x431-maritime-consignment-tejgaon-hub",
    category: "shipment_inbound",
    categoryLabel: "Inbound Shipment",
    date: "2026-11-06",
    summary:
      "Our quarterly sea freight container of Launch commercial diagnostic scan tools, ADAS benches, and wireless oscilloscopes has cleared Chittagong Customs and docked at our Tejgaon warehouse.",
    content:
      "We are pleased to announce the safe arrival and customs clearance of our latest 40ft high-cube shipping container at the Tejgaon Central Distribution Center in Dhaka. Sourced directly from Launch Tech manufacturing facilities, this consignment replenishes high-demand workshop inventory across Bangladesh.\n\nIncluded in this shipment:\n• 35 units of Launch X-431 PAD VII Elite & PRO3 V5.0 Smartlink scan tablets pre-loaded with Bangladesh commercial vehicle database packages.\n• 8 sets of wireless optical 3D camera wheel alignment benches with heavy-duty turntables.\n• 50 specialized automotive high-voltage multimeter probes and EV insulated safety toolkits.\n\nPre-ordered workshop suites are currently undergoing serial registry, warranty logging, and firmware provisioning by our engineering team. Next-day dispatch across Dhaka, Chittagong, Sylhet, and Bogra is now underway.",
    companyOrClient: "PAGE Central Import Logistics",
    location: "Tejgaon Central Hub, Dhaka",
    images: ["/durga-puja-launch-banner.png", "/Futuristic Automotive Diagnostics Showcase.png"],
    equipmentNames: ["Launch X-431 PAD VII", "Launch PRO3 V5.0", "3D Optical Wheel Aligner Bench"],
    badge: "Shipment Docked",
    pinned: true,
    published: true,
    author: "PAGE Logistics & Import Desk",
    readTimeMinutes: 2,
    tags: ["Launch", "Diagnostics", "Tejgaon Hub", "Port Clearance"],
    createdAt: "2026-11-06T09:30:00Z",
    updatedAt: "2026-11-06T09:30:00Z",
  },
  {
    id: "update-navana-motors-lifts",
    title:
      "Commercial Delivery & Commissioning: 4x 4.0-Ton Two-Post Hydraulic Lifts for Navana Motors Bay Expansion",
    slug: "navana-motors-bay-expansion-two-post-lifts",
    category: "client_delivery",
    categoryLabel: "Client Delivery",
    date: "2026-11-04",
    summary:
      "Successful delivery, chemical floor anchoring, and load-certification of four PAGE 4.0-ton dual-cylinder electro-hydraulic vehicle lifts for Navana Motors' expanded service bay in Mirpur.",
    content:
      "PAGE International's workshop engineering team has successfully finalized the installation, hydraulic synchronization, and load-testing of four heavy-duty 4.0-ton electro-hydraulic two-post lifts for Navana Motors' expanded automotive service facility in Mirpur, Dhaka.\n\nOur certified technicians conducted core drill chemical anchoring using high-tensile anchor studs rated for continuous commercial duty cycles. Each lift was rigorously tested with full-load static holding cycles and dual mechanical safety arm synchronization.\n\nFollowing installation, we held an on-site technician safety briefing for Navana's workshop mechanics, covering symmetric/asymmetric arm positioning, mechanical carriage locking verification, and daily hydraulic pressure checks. We thank Navana Motors for their continued trust in PAGE workshop engineering.",
    companyOrClient: "Navana Motors Ltd. (Mirpur Service Bay)",
    location: "Mirpur Commercial Zone, Dhaka",
    images: ["/Page Two-Post Lift 4.0 Ton.png"],
    equipmentNames: ["Page 4.0 Ton Electro-Hydraulic Two-Post Lift", "Rotary Screw Air System"],
    badge: "Delivered & Certified",
    pinned: false,
    published: true,
    author: "Senior Field Engineer, PAGE International",
    readTimeMinutes: 3,
    tags: ["Navana Motors", "Two-Post Lift", "Mirpur", "Commissioning"],
    createdAt: "2026-11-04T14:15:00Z",
    updatedAt: "2026-11-04T14:15:00Z",
  },
  {
    id: "update-apex-auto-tyre-changer",
    title:
      "Turnkey Workshop Handover: Heavy-Duty Automatic Tyre Changer & Digital Balancer Deployed at Apex Auto Workshop",
    slug: "apex-auto-chittagong-tyre-changer-balancer",
    category: "commissioning",
    categoryLabel: "Commissioning",
    date: "2026-11-01",
    summary:
      "Apex Auto Care has commissioned their high-throughput commercial wheel service center in Chittagong, powered by PAGE automatic tyre changers and dynamic computerized wheel balancers.",
    content:
      "We are excited to share the successful commissioning of Apex Auto Care's upgraded commercial tyre and wheel bay in Agrabad, Chittagong. To keep up with high customer volumes and low-profile alloy wheel demands, Apex selected our pneumatic tilt-back tyre changer featuring dual pneumatic assist arms and our high-speed digital wheel balancer.\n\nCommissioning Highlights:\n• Pneumatic assist arms calibrated for clamping run-flat and alloy rims up to 24 inches without rim scratching.\n• Microprocessor wheel balancer calibrated with laser weight-placement pointer, achieving dynamic balance accuracy within 1 gram.\n• Full team training completed with Apex's senior wheel technicians.",
    companyOrClient: "Apex Auto Care Ltd.",
    location: "Agrabad Commercial Area, Chittagong",
    images: ["/Fuel Efficiency Highway Showcase.png"],
    equipmentNames: ["Heavy-Duty Automatic Tyre Changer", "High-Precision Dynamic Wheel Balancer"],
    badge: "Commissioned",
    pinned: false,
    published: true,
    author: "Chittagong Field Technical Desk",
    readTimeMinutes: 2,
    tags: ["Tyre Changer", "Wheel Balancer", "Chittagong", "Apex Auto Care"],
    createdAt: "2026-11-01T11:00:00Z",
    updatedAt: "2026-11-01T11:00:00Z",
  },
  {
    id: "update-ev-diagnostic-bulletin-2026",
    title:
      "Technology Bulletin: 2026 Commercial EV Battery Diagnostics & Protocol Patch Released for Bangladesh Fleets",
    slug: "2026-commercial-ev-battery-diagnostic-patch",
    category: "tech_bulletin",
    categoryLabel: "Tech Bulletin",
    date: "2026-10-28",
    summary:
      "Comprehensive diagnostic database update now available for 2W, 3W, and 4W commercial electric vehicles operating across Bangladesh, with live cell balancing and high-voltage isolation safety guides.",
    content:
      "As commercial fleet electrification accelerates across Bangladesh, PAGE International has released our 2026 EV Diagnostic Software and Safety Bulletin for authorized workshop subscribers.\n\nKey inclusions in this release:\n• BMS Protocol Support: Live CAN-bus battery management telemetry for popular commercial electric delivery vans, light trucks, and electric three-wheelers.\n• Cell Degradation & Temperature Mapping: Individual cell voltage variance analysis to identify failing battery modules before thermal anomalies occur.\n• High-Voltage Isolation Verification: Guided step-by-step 1000V insulation testing sequences using PAGE VDE safety tools.\n\nRegistered workshops can update their Launch diagnostic tablets via Wi-Fi or contact our Tejgaon technical desk for on-site assistance.",
    companyOrClient: "PAGE Engineering & Software Division",
    location: "Tejgaon Hub, Dhaka",
    images: ["/Futuristic Automotive Diagnostics Showcase.png"],
    equipmentNames: ["1000V Insulated VDE Tool Set", "High-Voltage Cell Balancer Suite"],
    badge: "Tech Bulletin",
    pinned: false,
    published: true,
    author: "PAGE Technical & EV Applications Group",
    readTimeMinutes: 3,
    tags: ["EV", "Battery Diagnostics", "Software Bulletin", "Safety"],
    createdAt: "2026-10-28T16:45:00Z",
    updatedAt: "2026-10-28T16:45:00Z",
  },
  {
    id: "update-corghi-3d-aligner-in-stock",
    title:
      "Inbound Warehouse Arrival: Consignment of Corghi 3D Optical Alignment Camera Sensors & Turntables Ready",
    slug: "corghi-3d-optical-camera-sensors-arrival",
    category: "shipment_inbound",
    categoryLabel: "Inbound Shipment",
    date: "2026-10-25",
    summary:
      "High-definition optical targets, precision runout compensation plates, and heavy-duty mechanical turn-plates have been unboxed and verified for workshop demonstrations and customer installations.",
    content:
      "Our warehouse inventory in Tejgaon has received a fresh consignment of specialized alignment accessories and optical camera fixtures from Corghi. This inventory ensures immediate fulfillment for workshops setting up dedicated alignment bays without waiting for overseas manufacturing cycles.\n\nAvailable for immediate dispatch:\n• High-resolution camera target discs resistant to shop-floor oil and impact.\n• Heavy-duty turn-plates with smooth 360-degree rotational bearing assemblies.\n• Chemical anchor sets and calibration jigs for all 4-post and scissor alignment lift racks.\n\nShowroom live demonstrations can be booked online via our consultation desk.",
    companyOrClient: "Tejgaon Central Hub",
    location: "Tejgaon Industrial Area, Dhaka",
    images: ["/Page Two-Post Lift 4.0 Ton.png"],
    equipmentNames: ["Corghi 3D Optical Camera Aligner", "Heavy Duty Turntables"],
    badge: "In Stock",
    pinned: false,
    published: true,
    author: "PAGE Parts Inventory Team",
    readTimeMinutes: 2,
    tags: ["Corghi", "Wheel Alignment", "Tejgaon Hub", "Immediate Dispatch"],
    createdAt: "2026-10-25T10:20:00Z",
    updatedAt: "2026-10-25T10:20:00Z",
  },
];

/* ──── CRUD Operations ──── */

// Users
export function getUsers(): AdminUser[] {
  const users = load<AdminUser[]>(LS_KEYS.users, seedUsers);
  let changed = false;
  const migrated = users.map((u) => {
    if ((u.role as string) === "editor") {
      changed = true;
      return { ...u, role: "product_manager" as const };
    }
    return u;
  });
  if (!migrated.some((u) => u.email === "staff@pageinternational.com")) {
    migrated.push({
      id: "u-staff-01",
      name: "Tanvir Ahmed",
      email: "staff@pageinternational.com",
      role: "staff",
      status: "active",
      createdAt: "2025-01-15T09:30:00Z",
      lastLogin: "2025-10-15T07:15:00Z",
    });
    changed = true;
  }
  if (changed) {
    save(LS_KEYS.users, migrated);
  }
  return migrated;
}
export function saveUsers(users: AdminUser[]) {
  save(LS_KEYS.users, users);
}
export function addUser(user: Omit<AdminUser, "id" | "createdAt" | "lastLogin">): AdminUser {
  const users = getUsers();
  const newUser: AdminUser = { ...user, id: uid(), createdAt: now(), lastLogin: "Never" };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}
export function updateUser(id: string, patch: Partial<AdminUser>) {
  const users = getUsers().map((u) => (u.id === id ? { ...u, ...patch } : u));
  saveUsers(users);
}
export function deleteUser(id: string) {
  saveUsers(getUsers().filter((u) => u.id !== id));
}

// Inventory
export function getInventory(): InventoryItem[] {
  const stored = load<InventoryItem[] | null>(LS_KEYS.inventory, null);
  if (stored) return stored;
  // Initialize from catalog
  const inv: InventoryItem[] = catalogProducts.map((p) => ({
    ...p,
    warehouseQty:
      p.stock === "Out of stock"
        ? 0
        : p.stock === "Low stock"
          ? 3
          : Math.floor(Math.random() * 40) + 10,
    reorderLevel: 5,
    lastRestocked: "2025-09-15T00:00:00Z",
  }));
  save(LS_KEYS.inventory, inv);
  return inv;
}
export function saveInventory(inv: InventoryItem[]) {
  save(LS_KEYS.inventory, inv);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("inventory_updated", { detail: inv }));
  }
}
export function updateInventoryItem(slug: string, patch: Partial<InventoryItem>) {
  const inv = getInventory().map((i) => (i.slug === slug ? { ...i, ...patch } : i));
  saveInventory(inv);
}

export function addInventoryItem(
  item: Omit<InventoryItem, "lastRestocked"> & { lastRestocked?: string },
): InventoryItem {
  const inv = getInventory();
  const newItem: InventoryItem = {
    ...item,
    lastRestocked: item.lastRestocked || now(),
  };
  inv.unshift(newItem);
  saveInventory(inv);
  return newItem;
}

export function deleteInventoryItem(slug: string) {
  const inv = getInventory().filter((i) => i.slug !== slug);
  saveInventory(inv);
}

// Quotes
export function getQuotes(): QuoteRequest[] {
  return load(LS_KEYS.quotes, seedQuotes);
}
export function saveQuotes(quotes: QuoteRequest[]) {
  save(LS_KEYS.quotes, quotes);
}
export function addQuote(
  quote: Omit<QuoteRequest, "id" | "status" | "createdAt" | "updatedAt">,
): QuoteRequest {
  const quotes = getQuotes();
  const newQuote: QuoteRequest = {
    ...quote,
    id: `q-${uid()}`,
    status: "pending",
    createdAt: now(),
    updatedAt: now(),
  };
  quotes.unshift(newQuote);
  saveQuotes(quotes);
  return newQuote;
}
export function replyToQuote(
  id: string,
  reply: string,
  status: QuoteRequest["status"] = "replied",
) {
  const quotes = getQuotes().map((q) =>
    q.id === id ? { ...q, reply, status, updatedAt: now() } : q,
  );
  saveQuotes(quotes);
}
export function replyToQuoteWithDetails(
  id: string,
  details: {
    productSlug?: string | undefined;
    productName?: string | undefined;
    qty?: number | undefined;
    quotedPrice?: number | undefined;
    unitPrice?: number | undefined;
    reply: string;
    status?: QuoteRequest["status"] | undefined;
  },
) {
  const finalQuotedPrice = details.quotedPrice ?? details.unitPrice;
  const quotes = getQuotes().map((q) =>
    q.id === id
      ? {
          ...q,
          productSlug: details.productSlug || q.productSlug,
          productName: details.productName || q.productName,
          qty: details.qty ?? q.qty,
          quotedPrice: finalQuotedPrice !== undefined ? finalQuotedPrice : q.quotedPrice,
          reply: details.reply,
          status: details.status || "replied",
          updatedAt: now(),
        }
      : q,
  );
  saveQuotes(quotes);
}
export function updateQuoteStatus(id: string, status: QuoteRequest["status"]) {
  const quotes = getQuotes().map((q) => (q.id === id ? { ...q, status, updatedAt: now() } : q));
  saveQuotes(quotes);
}

// Bookings
export function getBookings(): ConsultBooking[] {
  return load(LS_KEYS.bookings, seedBookings);
}
export function saveBookings(bookings: ConsultBooking[]) {
  save(LS_KEYS.bookings, bookings);
}
export function addBooking(
  booking: Omit<ConsultBooking, "id" | "status" | "createdAt" | "updatedAt">,
): ConsultBooking {
  const bookings = getBookings();
  const newBooking: ConsultBooking = {
    ...booking,
    id: `b-${uid()}`,
    status: "pending",
    createdAt: now(),
    updatedAt: now(),
  };
  bookings.unshift(newBooking);
  saveBookings(bookings);
  return newBooking;
}
export function updateBookingStatus(id: string, status: ConsultBooking["status"]) {
  const bookings = getBookings().map((b) => (b.id === id ? { ...b, status, updatedAt: now() } : b));
  saveBookings(bookings);
}

// Settings
export function getSettings(): SiteSetting {
  return load(LS_KEYS.settings, defaultSettings);
}
export function saveSettings(settings: SiteSetting) {
  save(LS_KEYS.settings, settings);
}

// Banners (Featured Equipment / Commercial Machinery)
export function getBanners(): BannerItem[] {
  const banners = load<BannerItem[]>(LS_KEYS.banners, seedBanners);
  return [...banners].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function saveBanners(banners: BannerItem[]) {
  save(LS_KEYS.banners, banners);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("banners_updated", { detail: banners }));
  }
}

export function addBanner(
  banner: Omit<BannerItem, "id" | "createdAt" | "order"> & { order?: number },
): BannerItem {
  const banners = getBanners();
  const maxOrder = banners.reduce((max, b) => Math.max(max, b.order || 0), 0);
  const newBanner: BannerItem = {
    ...banner,
    id: "b-" + uid(),
    order: banner.order ?? maxOrder + 1,
    createdAt: now(),
  };
  banners.push(newBanner);
  saveBanners(banners);
  return newBanner;
}

export function updateBanner(id: string, patch: Partial<BannerItem>) {
  const banners = getBanners().map((b) => (b.id === id ? { ...b, ...patch } : b));
  saveBanners(banners);
}

export function deleteBanner(id: string) {
  const banners = getBanners().filter((b) => b.id !== id);
  saveBanners(banners);
}

export function toggleBannerActive(id: string) {
  const banners = getBanners().map((b) => (b.id === id ? { ...b, active: !b.active } : b));
  saveBanners(banners);
}

export function reorderBanners(orderedIds: string[]): BannerItem[] {
  const current = getBanners();
  const map = new Map(current.map((b) => [b.id, b]));
  const reordered: BannerItem[] = [];
  orderedIds.forEach((id, index) => {
    const item = map.get(id);
    if (item) {
      reordered.push({ ...item, order: index + 1 });
      map.delete(id);
    }
  });
  map.forEach((item) => {
    reordered.push({ ...item, order: reordered.length + 1 });
  });
  saveBanners(reordered);
  return reordered;
}

export function resetBannersToDefault(): BannerItem[] {
  saveBanners(seedBanners);
  return seedBanners;
}

// ──── Field Updates & Activity Feed ────
export function getUpdates(): FeedUpdate[] {
  const updates = load<FeedUpdate[]>(LS_KEYS.updates, seedUpdates);
  return [...updates].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export function saveUpdates(updates: FeedUpdate[]) {
  save(LS_KEYS.updates, updates);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("updates_updated", { detail: updates }));
  }
}

export function addUpdate(
  item: Omit<FeedUpdate, "id" | "createdAt" | "updatedAt" | "slug"> & { slug?: string },
): FeedUpdate {
  const updates = getUpdates();
  const slug =
    item.slug ||
    item.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const newUpdate: FeedUpdate = {
    ...item,
    id: "update-" + uid(),
    slug,
    createdAt: now(),
    updatedAt: now(),
  };
  updates.unshift(newUpdate);
  saveUpdates(updates);
  return newUpdate;
}

export function updateUpdate(id: string, patch: Partial<FeedUpdate>): FeedUpdate | undefined {
  const updates = getUpdates();
  let updatedItem: FeedUpdate | undefined;
  const next = updates.map((u) => {
    if (u.id === id) {
      updatedItem = { ...u, ...patch, updatedAt: now() };
      return updatedItem;
    }
    return u;
  });
  saveUpdates(next);
  return updatedItem;
}

export function deleteUpdate(id: string): boolean {
  const updates = getUpdates();
  const filtered = updates.filter((u) => u.id !== id);
  if (filtered.length !== updates.length) {
    saveUpdates(filtered);
    return true;
  }
  return false;
}

export function getUpdateBySlug(slug: string): FeedUpdate | undefined {
  const updates = getUpdates();
  return updates.find((u) => u.slug === slug);
}

export function resetUpdatesToDefault(): FeedUpdate[] {
  saveUpdates(seedUpdates);
  return seedUpdates;
}

/* ──── Admin Authentication ──── */

export function getAuthAdminUser(): AdminUser | null {
  const user = load<AdminUser | null>(LS_KEYS.auth, null);
  if (user && (user.role as string) === "editor") {
    user.role = "product_manager";
    save(LS_KEYS.auth, user);
  }
  return user;
}

export function loginAdmin(
  email: string,
  password?: string,
): { success: boolean; user?: AdminUser; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const users = getUsers();
  const found = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (found) {
    if (found.status === "suspended") {
      return {
        success: false,
        error: "This admin account is suspended. Contact system administrator.",
      };
    }
    updateUser(found.id, { lastLogin: now() });
    const updatedUser: AdminUser = { ...found, lastLogin: now() };
    save(LS_KEYS.auth, updatedUser);
    return { success: true, user: updatedUser };
  }

  // Allow master default admin login
  if (
    cleanEmail === "admin@page.com" ||
    cleanEmail === "admin@pageinternational.com" ||
    cleanEmail === "admin"
  ) {
    const adminUser = users[0] || seedUsers[0];
    if (adminUser) {
      save(LS_KEYS.auth, adminUser);
      return { success: true, user: adminUser };
    }
  }

  return {
    success: false,
    error: "Invalid email or credentials. Please use an authorized administrator account.",
  };
}

export function logoutAdmin() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LS_KEYS.auth);
}

export function resetAllAdminData() {
  if (typeof window === "undefined") return;
  Object.values(LS_KEYS).forEach((k) => localStorage.removeItem(k));
}

/* ──── Quotation Report Email Generation (Gmail) ──── */

export function openGmailQuotationDraft({
  quote,
  productName,
  unitPrice,
  qty,
  message,
  mode = "rich",
}: {
  quote: QuoteRequest;
  productName: string;
  unitPrice: number;
  qty: number;
  message?: string | undefined;
  mode?: "rich" | "plain" | undefined;
}): { gmailUrl: string; mailtoUrl: string; subject: string; body: string } {
  const total = unitPrice * qty;
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const isMultiItem = quote.items && quote.items.length > 1;

  const subject = isMultiItem
    ? `[OFFICIAL COMMERCIAL QUOTATION] PAGE International — Ref #${quote.id.toUpperCase()} (${quote.items?.length} Products Order)`
    : `[OFFICIAL COMMERCIAL QUOTATION] PAGE International — Ref #${quote.id.toUpperCase()} for ${productName}`;

  const inquirySection =
    isMultiItem && quote.items
      ? `2. ORIGINAL INQUIRY SUBMITTED BY CLIENT (${quote.items.length} Products):
${quote.items.map((it, idx) => `  ${idx + 1}. ${it.productName} — Requested Qty: ${it.qty} unit(s)`).join("\n")}
${quote.notes ? `\n• Client Notes / Specifications: "${quote.notes}"\n` : ""}`
      : `2. ORIGINAL INQUIRY SUBMITTED BY CLIENT:
• Product Requested: ${quote.productName}
• Quantity Requested: ${quote.qty} unit(s)
${quote.notes ? `• Client Notes / Specifications: "${quote.notes}"\n` : ""}`;

  const itemsTotal =
    isMultiItem && quote.items
      ? quote.items.reduce((acc, it) => acc + (it.unitPrice || unitPrice) * it.qty, 0)
      : total;

  const offerSection =
    isMultiItem && quote.items
      ? `3. OFFICIAL COMMERCIAL OFFER (ITEMIZED BREAKDOWN):
${quote.items
  .map(
    (it, idx) => `  ${idx + 1}. ${it.productName}
     • Unit Price: ৳${(it.unitPrice || unitPrice).toLocaleString("en-BD")} BDT
     • Quantity: ${it.qty} unit(s)
     • Line Total: ৳${((it.unitPrice || unitPrice) * it.qty).toLocaleString("en-BD")} BDT`,
  )
  .join("\n\n")}

• COMBINED COMMERCIAL VALUATION: ৳${itemsTotal.toLocaleString("en-BD")} BDT
(All standard commercial terms apply. Formal itemized Tax/Mushak invoice provided upon PO confirmation.)`
      : `3. OFFICIAL COMMERCIAL OFFER:
• Equipment / Product Model: ${productName}
• Quoted Unit Price: ৳${unitPrice.toLocaleString("en-BD")} BDT
• Quantity: ${qty} unit(s)
• Total Commercial Valuation: ৳${total.toLocaleString("en-BD")} BDT
(All standard commercial terms apply. Formal itemized Tax/Mushak invoice provided upon PO confirmation.)`;

  const body = `Dear ${quote.contactName || quote.companyName},

Thank you for your business inquiry with PAGE International. Regarding your quotation request (Ref: #${quote.id.toUpperCase()}), please find our official commercial offer and quotation report below:

=======================================================
PAGE INTERNATIONAL — COMMERCIAL QUOTATION REPORT
=======================================================
Quotation Ref: #${quote.id.toUpperCase()}
Issue Date: ${dateStr}
Validity: 15 Calendar Days
Prepared For: ${quote.companyName}

1. CLIENT & DELIVERY DETAILS:
• Company Name: ${quote.companyName}
• Contact Person: ${quote.contactName}
• Phone: ${quote.phone}
• Email: ${quote.email}
• City / Workshop Location: ${quote.city || "Dhaka, Bangladesh"}
• Industry / Business Type: ${quote.businessType || "Automotive Workshop / Fleet"}

${inquirySection}

${offerSection}

4. TECHNICAL INCLUSIONS & WARRANTY:
✓ Certified on-site delivery, leveling, chemical anchoring, and power wiring inspection
✓ 18 to 36 Months official manufacturer warranty with priority certified engineer dispatch
✓ Free operator safety and technician calibration training at your workshop bay
✓ 10-Year guaranteed genuine spare parts availability from PAGE Tejgaon logistics hub

5. NOTES & TERMS FROM COMMERCIAL DESK:
${message || "We look forward to partnering with your workshop and ensuring world-class equipment uptime."}

=======================================================
HOW TO PROCEED / CONFIRM ORDER:
To accept this quotation, request pro-forma tax invoice, or schedule an in-person demonstration at our Tejgaon Hub, simply reply to this email or contact our commercial desk:

• Direct B2B Hotline: +880 9612-PAGE-INTL (+880 9612-724346)
• Official WhatsApp: +880 1700-000000
• Commercial Email: b2b@page-intl.com | sales@page-intl.com

Warm regards,

B2B Commercial & Technical Support Desk
PAGE International Ltd.
Tejgaon Industrial Area, Dhaka-1208, Bangladesh
Website: www.pageinternational.com
"The Company Behind The Workshop"
`;

  // Gmail URL scheme: we intentionally omit &body= so Gmail opens with a clean,
  // focused body where the admin simply presses Ctrl+V to paste the rich graphical template.
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    quote.email,
  )}&su=${encodeURIComponent(subject)}`;

  const mailtoUrl = `mailto:${encodeURIComponent(quote.email)}?subject=${encodeURIComponent(
    subject,
  )}`;

  if (typeof window !== "undefined") {
    const win = window.open(gmailUrl, "_blank");
    if (!win || win.closed || typeof win.closed === "undefined") {
      window.location.href = mailtoUrl;
    }
  }

  return { gmailUrl, mailtoUrl, subject, body };
}

// Stats (computed)
export function getAdminStats() {
  const inv = getInventory();
  const quotes = getQuotes();
  const bookings = getBookings();
  const users = getUsers();
  const banners = getBanners();

  return {
    totalProducts: inv.length,
    lowStock: inv.filter((i) => i.warehouseQty <= i.reorderLevel && i.warehouseQty > 0).length,
    outOfStock: inv.filter((i) => i.warehouseQty === 0).length,
    totalValue: inv.reduce((acc, i) => acc + i.price * i.warehouseQty, 0),
    pendingQuotes: quotes.filter((q) => q.status === "pending").length,
    totalQuotes: quotes.length,
    pendingBookings: bookings.filter((b) => b.status === "pending").length,
    confirmedBookings: bookings.filter((b) => b.status === "confirmed").length,
    totalBookings: bookings.length,
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === "active").length,
    totalBanners: banners.length,
    activeBanners: banners.filter((b) => b.active).length,
    // Revenue simulation
    revenueData: [
      { month: "May", revenue: 1250000 },
      { month: "Jun", revenue: 1890000 },
      { month: "Jul", revenue: 2140000 },
      { month: "Aug", revenue: 1760000 },
      { month: "Sep", revenue: 2350000 },
      { month: "Oct", revenue: 2680000 },
    ],
    categoryDistribution: [
      {
        name: "Garage Equipment",
        value: inv.filter((i) => i.category === "Garage Equipment").length,
      },
      { name: "Tyre & Wheel", value: inv.filter((i) => i.category === "Tyre & Wheel").length },
      {
        name: "Diagnostics",
        value: inv.filter((i) => i.category === "Diagnostic Equipment").length,
      },
      { name: "EV Equipment", value: inv.filter((i) => i.category === "EV Equipment").length },
      { name: "Brakes", value: inv.filter((i) => i.category === "Brakes").length },
      { name: "Batteries", value: inv.filter((i) => i.category === "Batteries").length },
      { name: "Lubricants", value: inv.filter((i) => i.category === "Lubricants & Fluids").length },
    ],
  };
}
