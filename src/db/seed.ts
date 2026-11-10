import { and, eq, isNull } from "drizzle-orm";
import { db } from "./index";
import {
  users,
  productsTable,
  banners,
  reviews,
  quotes,
  bookings,
  orders,
  orderItems,
  settings,
  updates,
} from "./schema";
import { runMigrations } from "./migrate";
import { products } from "../lib/data";
import { normalizeSpecsToTuples } from "../lib/product-utils";
import { reviewsData } from "../lib/reviews";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

export async function initAndSeedDatabase() {
  console.log("[db:seed] Ensuring database schema is migrated...");
  await runMigrations();

  console.log("[db:seed] Seeding initial data...");

  // 1. Seed or Verify Administrator Account
  const adminEmail = (process.env["ADMIN_EMAIL"] || "admin@pageintl.com").toLowerCase().trim();
  const existingAdmin = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);

  if (existingAdmin.length > 0) {
    console.log(
      `[db:seed] Admin account already exists for ${adminEmail} (credentials preserved).`,
    );
  } else {
    const adminPassword = process.env["ADMIN_PASSWORD"] || "PageAdmin2026!Secure";
    const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

    await db.insert(users).values({
      id: "usr-admin-01",
      name: "PAGE Platform Administrator",
      email: adminEmail,
      phone: "+880 1711-000000",
      passwordHash: adminPasswordHash,
      companyName: "PAGE International Head Office",
      businessType: "Industrial Machinery Importer",
      city: "Dhaka (Tejgaon)",
      role: "admin",
      emailVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`[db:seed] Admin account configured for ${adminEmail}`);
  }

  // 2. Seed Verified Workshop Accounts
  const demoWorkshopPasswordHash = await bcrypt.hash("PAGE-Workshop-2026!", 12);
  const workshopAccounts = [
    {
      id: "usr-01",
      name: "Engr. Tanvir Ahmed",
      email: "tanvir@autofixbd.com",
      phone: "+880 1711-234567",
      passwordHash: demoWorkshopPasswordHash,
      companyName: "AutoFix Multi-Brand Workshop",
      businessType: "Workshop / Garage",
      city: "Dhaka (Tejgaon)",
      role: "customer",
      emailVerified: true,
      isActive: true,
    },
    {
      id: "usr-02",
      name: "Rashidul Hassan Khan",
      email: "rashid@dhakatyre.com",
      phone: "+880 1819-345678",
      passwordHash: demoWorkshopPasswordHash,
      companyName: "Dhaka Tyre & Alignment Hub",
      businessType: "Tyre Service Center",
      city: "Dhaka (Mohakhali)",
      role: "customer",
      emailVerified: true,
      isActive: true,
    },
    {
      id: "usr-03",
      name: "Engr. Selim Reza",
      email: "selim@greenfleetbd.com",
      phone: "+880 1912-456789",
      passwordHash: demoWorkshopPasswordHash,
      companyName: "GreenFleet Commercial Logistics",
      businessType: "Fleet Operator",
      city: "Dhaka (Mirpur)",
      role: "customer",
      emailVerified: true,
      isActive: true,
    },
    {
      id: "usr-04",
      name: "Arif Hossain",
      email: "arif@speedmotors.com",
      phone: "+880 1613-567890",
      passwordHash: demoWorkshopPasswordHash,
      companyName: "Speed Motors Service Bay",
      businessType: "Dealership Workshop",
      city: "Sylhet",
      role: "customer",
      emailVerified: true,
      isActive: true,
    },
  ];

  for (const acc of workshopAccounts) {
    await db.insert(users).values(acc).onConflictDoNothing();
  }

  // 3. Seed Machinery & Tools Catalog
  for (const p of products) {
    const specsTuples = normalizeSpecsToTuples(p.specs);
    await db
      .insert(productsTable)
      .values({
        id: `prod-${p.slug}`,
        slug: p.slug,
        sku: p.sku,
        name: p.name,
        brand: p.brand,
        category: p.category,
        subcategory: p.subcategory || null,
        mobility: p.mobility || ["4-Wheeler"],
        isEquipment: Boolean(p.isEquipment),
        requiresQuote: Boolean(p.requiresQuote),
        priceBdt: p.price || 0,
        inStock: p.stock !== "Out of stock",
        badge: p.badge || null,
        description: p.description || p.name,
        specs: specsTuples,
        features: p.features || [],
        images: [p.image],
        fits: p.fits || [],
      })
      .onConflictDoNothing();

    // Backfill newly added catalog metadata columns on legacy pre-seeded rows without overwriting custom admin edits
    await db
      .update(productsTable)
      .set({
        sku: p.sku,
        mobility: p.mobility || ["4-Wheeler"],
        isEquipment: Boolean(p.isEquipment),
        requiresQuote: Boolean(p.requiresQuote),
      })
      .where(and(eq(productsTable.slug, p.slug), isNull(productsTable.sku)));
  }

  // 4. Seed Homepage Machinery Banners (2100x654 High-Resolution Showcases)
  const initialBanners = [
    {
      id: "banner-launch-durga-puja",
      title: "LAUNCH Professional Diagnostic Solutions",
      subtitle:
        "Commercial Diagnostic Scanners, Key Programmers & Calibration Benches with On-Site Training",
      imageUrl: "/durga-puja-launch-banner.png",
      badge: "Commercial Special",
      category: "Commercial Machinery",
      link: "/shop?cat=Garage+Equipment",
      isActive: true,
      sortOrder: 0,
    },
    {
      id: "banner-fuel-efficiency",
      title: "4-Wheeler Mobility Showcase — Fuel Efficiency",
      subtitle: "Commercial fleet lubricants, synthetic oils & hybrid engine parts",
      imageUrl: "/Fuel%20Efficiency%20Highway%20Showcase.png",
      badge: "4-Wheeler",
      category: "Commercial Machinery",
      link: "/shop?mobility=4-Wheeler",
      isActive: true,
      sortOrder: 1,
    },
    {
      id: "banner-diagnostics",
      title: "2-Wheeler Mobility Showcase — Automotive Diagnostics",
      subtitle: "Computerized motorcycle scanning, EFI tools & rapid scissor lifts",
      imageUrl: "/Futuristic%20Automotive%20Diagnostics%20Showcase.png",
      badge: "2-Wheeler",
      category: "Commercial Machinery",
      link: "/shop?mobility=2-Wheeler",
      isActive: true,
      sortOrder: 2,
    },
    {
      id: "banner-lift",
      title: "3-Wheeler Commercial Mobility — Two-Post Lift 4.0 Ton",
      subtitle: "Heavy-duty electro-hydraulic vehicle lifts & garage machinery",
      imageUrl: "/Page%20Two-Post%20Lift%204.0%20Ton.png",
      badge: "3-Wheeler",
      category: "Commercial Machinery",
      link: "/shop?mobility=3-Wheeler",
      isActive: true,
      sortOrder: 3,
    },
  ];

  // Remove legacy test banner if present
  await db.delete(banners).where(eq(banners.id, "banner-corghi-wheel-alignment"));

  for (const b of initialBanners) {
    await db.insert(banners).values(b).onConflictDoNothing();
  }

  // 5. Seed Customer Reviews
  for (const r of reviewsData) {
    await db
      .insert(reviews)
      .values({
        id: r.id,
        name: r.name,
        role: r.role,
        workshop: r.workshop,
        equipment: r.equipment || "Commercial Equipment",
        comment: r.comment,
        title: r.title || null,
        rating: 5,
        isPublished: true,
      })
      .onConflictDoNothing();
  }

  // 6. Seed Site Settings
  const defaultSettings = [
    {
      key: "company_profile",
      value: {
        name: "PAGE International B2B",
        tagline: "Automotive Garage Machinery, Spare Parts & Workshop Engineering",
        phone: "+880 1755-502421",
        email: "pageon18@gmail.com",
        address: "Road #18, House # 100, Sector # 14, Uttara Model Town, Dhaka",
        districtsCovered: 64,
        establishedYear: 2018,
      },
      description: "Primary company profile and contact details",
    },
    {
      key: "commercial_policy",
      value: {
        currency: "BDT",
        vatPercent: 0,
        freeDeliveryMinimumBdt: 50000,
        standardDeliveryBdt: 1500,
        emergencyDispatchBdt: 5000,
        paymentMethods: ["cash_on_delivery", "bank_transfer", "cheque", "quotation_po"],
      },
      description: "Default commercial, delivery, and invoicing rules",
    },
  ];

  for (const s of defaultSettings) {
    await db.insert(settings).values(s).onConflictDoNothing();
  }

  // 7. Seed Sample RFQ Quotes
  const sampleQuotes = [
    {
      id: "quote-1001",
      quoteNumber: "RFQ-2026-1001",
      userId: "usr-01",
      companyName: "AutoFix Multi-Brand Workshop",
      contactName: "Engr. Tanvir Ahmed",
      phone: "+880 1711-234567",
      email: "tanvir@autofixbd.com",
      productSlug: "two-post-lift-4t",
      productName: "4.0 Ton Clear-Floor Two-Post Hydraulic Lift",
      qty: 2,
      businessType: "Workshop / Garage",
      city: "Dhaka",
      notes: "Need turnkey bay installation and 3-phase power line layout guidance.",
      status: "PENDING",
    },
    {
      id: "quote-1002",
      quoteNumber: "RFQ-2026-1002",
      userId: "usr-02",
      companyName: "Dhaka Tyre & Alignment Hub",
      contactName: "Rashidul Hassan Khan",
      phone: "+880 1819-345678",
      email: "rashid@dhakatyre.com",
      productSlug: "3d-wheel-aligner",
      productName: "High-Definition 3D Optical Wheel Alignment System",
      qty: 1,
      businessType: "Tyre Service Center",
      city: "Dhaka",
      notes: "Please quote with delivery to Mohakhali depot.",
      status: "CONTACTED",
    },
  ];

  for (const q of sampleQuotes) {
    await db.insert(quotes).values(q).onConflictDoNothing();
  }

  // 8. Seed Sample Bay Consultation Bookings
  const sampleBookings = [
    {
      id: "book-1001",
      bookingNumber: "BKG-2026-1001",
      userId: "usr-01",
      companyName: "AutoFix Multi-Brand Workshop",
      contactName: "Engr. Tanvir Ahmed",
      phone: "+880 1711-234567",
      email: "tanvir@autofixbd.com",
      serviceType: "Turnkey Workshop Bay Planning",
      bookingDate: "2026-11-20",
      timeSlot: "11:00 AM - 01:00 PM",
      city: "Dhaka (Tejgaon)",
      notes: "Bay architecture walkthrough for new 4-bay expansion.",
      status: "CONFIRMED",
    },
  ];

  for (const b of sampleBookings) {
    await db.insert(bookings).values(b).onConflictDoNothing();
  }

  // 9. Seed Sample Orders and Line Items
  const sampleOrder = {
    id: "ord-1001",
    orderNumber: "ORD-2026-1001",
    userId: "usr-01",
    customerName: "Engr. Tanvir Ahmed",
    customerEmail: "tanvir@autofixbd.com",
    customerPhone: "+880 1711-234567",
    companyName: "AutoFix Multi-Brand Workshop",
    shippingAddress: "Plot 42, Block C, Tejgaon Industrial Area",
    city: "Dhaka",
    district: "Dhaka",
    postalCode: "1208",
    subtotal: 185000,
    shippingFee: 0,
    total: 185000,
    currency: "BDT",
    status: "CONFIRMED",
    paymentMethod: "BANK_TRANSFER",
    paymentStatus: "PAID",
    notes: "Forklift unloading required on delivery site.",
  };

  await db.insert(orders).values(sampleOrder).onConflictDoNothing();

  const firstProd = products[0];
  const sampleOrderItem = {
    id: "item-ord-1001-1",
    orderId: "ord-1001",
    productId: firstProd ? `prod-${firstProd.slug}` : null,
    productSlug: firstProd ? firstProd.slug : "heavy-duty-2-post-lift-4t",
    productName: firstProd ? firstProd.name : "Heavy-Duty 2-Post Electro-Hydraulic Lift 4.0T",
    unitPrice: firstProd?.price || 285000,
    quantity: 1,
    subtotal: firstProd?.price || 285000,
  };

  await db.insert(orderItems).values(sampleOrderItem).onConflictDoNothing();

  // 10. Seed Technical Updates / Articles
  const sampleUpdates = [
    {
      id: "upd-01",
      title: "EV High-Voltage Workshop Safety Protocols (1,000V VDE Certification)",
      slug: "ev-high-voltage-workshop-safety-protocols",
      excerpt:
        "Essential safety equipment, insulated hand toolsets, and emergency battery discharge bays for Bangladeshi workshops servicing electric vehicles.",
      content:
        "As electric vehicles and hybrid fleets gain significant momentum across Dhaka and Chittagong, commercial garages must adapt infrastructure to safely handle high-voltage traction batteries (400V - 800V DC). Key safeguards include CAT III/IV 1000V insulated hand tools, rescue hooks, insulated floor matting, and digital insulation resistance testers.",
      category: "EV Infrastructure",
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      id: "upd-02",
      title: "Pneumatic vs Electric Motorcycle Lifts: Engineering Efficiency for 2W Service Bays",
      slug: "pneumatic-vs-electric-motorcycle-lifts",
      excerpt:
        "Comparing cycle times, maintenance overhead, and payload safety for high-turnover motorcycle service stations.",
      content:
        "High-density 2-wheeler workshops in Bangladesh handle up to 60 bikes daily. Pneumatic foot-pedal lifts provide instant cycle speeds, minimal electrical downtime, and foot-clear operator ergonomics, making them the standard choice for rapid turnaround service lanes.",
      category: "Workshop Engineering",
      isPublished: true,
      publishedAt: new Date(),
    },
  ];

  for (const u of sampleUpdates) {
    await db.insert(updates).values(u).onConflictDoNothing();
  }

  console.log("[db:seed] Complete! All tables seeded idempotently.");
}

// Auto-run if executed directly
initAndSeedDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("[db:seed] Seed execution error:", err);
    process.exit(1);
  });
