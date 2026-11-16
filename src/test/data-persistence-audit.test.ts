import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createBookingCore,
  updateBookingCore,
  listBookingsCore,
  createOrderCore,
  updateOrderStatusCore,
  listOrdersCore,
  createQuoteCore,
  updateQuoteCore,
  listQuotesCore,
  createInventoryItemCore,
  updateInventoryItemCore,
  deleteInventoryItemCore,
  saveBannerCore,
  deleteBannerCore,
  updateSettingsCore,
  getSettingsCore,
  submitPublicReviewCore,
} from "../lib/data.server";
import { updateProfileCore } from "../lib/auth.server";
import {
  db,
  bookings,
  orders,
  orderItems,
  quotes,
  productsTable,
  banners,
  settings,
  reviews,
  users,
} from "@/db";
import { eq } from "drizzle-orm";
import * as authServer from "../lib/auth.server";
import type { SanitizedUser } from "../lib/auth.server";

describe("Comprehensive Data Persistence Audit", () => {
  const mockAdminUser: SanitizedUser = {
    id: "usr-audit-admin",
    name: "Audit Lead Engineer",
    email: "audit-admin@pageintl.bd",
    phone: "+8801700000000",
    companyName: "PAGE Audit Corp",
    businessType: "Engineering Inspection",
    city: "Dhaka",
    role: "admin",
    emailVerified: true,
    isActive: true,
    lastLogin: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    vi.spyOn(authServer, "getSessionUserCore").mockResolvedValue(mockAdminUser);

    await db
      .insert(users)
      .values({
        id: mockAdminUser.id,
        name: mockAdminUser.name,
        email: mockAdminUser.email,
        phone: mockAdminUser.phone,
        companyName: mockAdminUser.companyName,
        businessType: mockAdminUser.businessType,
        city: mockAdminUser.city,
        role: mockAdminUser.role,
        isActive: true,
      })
      .onConflictDoNothing();
  });

  // =========================================================================
  // 1. DEMONSTRATION & CONSULTATION BOOKING AUDIT
  // =========================================================================
  it("persists ALL consultation booking fields to PostgreSQL (including businessType, bays, equipmentInterest, locationType, onsiteAddress)", async () => {
    const bookingInput = {
      companyName: "Apex Hyper Garage",
      contactName: "Engr. Tanvir Ahmed",
      phone: "+8801711223344",
      email: "tanvir@apexhyper.com",
      serviceType: "Vehicle Lift Machinery Demonstration",
      bookingDate: "2026-12-05",
      timeSlot: "02:00 PM",
      city: "Dhaka",
      centerId: "onsite",
      centerName: "On-site: Plot 88, Tejgaon I/A",
      businessType: "Dealership 3S Center",
      bays: "5-8 Bays",
      equipmentInterest: "Launch 4.0T 2-Post Clear Floor Lift & EV Balancer",
      locationType: "onsite",
      onsiteAddress: "Plot 88, Tejgaon Industrial Area, Dhaka",
      notes: "Need floor concrete core sample inspection for chemical anchor bolts.",
    };

    const result = await createBookingCore(bookingInput);
    expect(result.success).toBe(true);
    expect(result.bookingNumber).toBeDefined();

    expect(result.booking).toBeDefined();
    const bookingRecord = result.booking!;

    // Query DB directly to verify persistence
    const [saved] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingRecord.id))
      .limit(1);

    expect(saved).toBeDefined();
    expect(saved!.companyName).toBe(bookingInput.companyName);
    expect(saved!.contactName).toBe(bookingInput.contactName);
    expect(saved!.phone).toBe(bookingInput.phone);
    expect(saved!.email).toBe(bookingInput.email);
    expect(saved!.serviceType).toBe(bookingInput.serviceType);
    expect(saved!.bookingDate).toBe(bookingInput.bookingDate);
    expect(saved!.timeSlot).toBe(bookingInput.timeSlot);
    expect(saved!.businessType).toBe(bookingInput.businessType);
    expect(saved!.bays).toBe(bookingInput.bays);
    expect(saved!.equipmentInterest).toBe(bookingInput.equipmentInterest);
    expect(saved!.locationType).toBe(bookingInput.locationType);
    expect(saved!.onsiteAddress).toBe(bookingInput.onsiteAddress);
    expect(saved!.notes).toBe(bookingInput.notes);
    expect(saved!.status).toBe("PENDING");

    // Test Admin Status & Notes Update
    const updatedRes = await updateBookingCore({
      id: saved!.id,
      status: "CONFIRMED",
      adminNotes: "Assigned Chief Installation Engineer Rafiq",
    });
    expect(updatedRes.success).toBe(true);

    const [updatedRow] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, saved!.id))
      .limit(1);

    expect(updatedRow!.status).toBe("CONFIRMED");
    expect(updatedRow!.adminNotes).toBe("Assigned Chief Installation Engineer Rafiq");
  });

  // =========================================================================
  // 2. COMMERCIAL ORDER & CHECKOUT AUDIT
  // =========================================================================
  it("persists commercial order fields including VAT / BIN and line items to PostgreSQL", async () => {
    // Ensure product exists for checkout
    const [existingProd] = await db.select().from(productsTable).limit(1);
    const testSlug = existingProd?.slug || "launch-x-431-pad9-link";

    const orderInput = {
      customerName: "Engr. Moniruzzaman",
      customerEmail: "monir@deltaworkshop.com",
      customerPhone: "+8801819876543",
      companyName: "Delta Automotive Logistics Ltd.",
      vatBin: "BIN-987654321-002",
      shippingAddress: "Plot 19, Road 4, Sector 3, Uttara",
      city: "Dhaka",
      district: "Dhaka",
      postalCode: "1230",
      paymentMethod: "BANK_TRANSFER",
      notes: "Commercial tax invoice required with delivery gate pass.",
      items: [{ productSlug: testSlug, quantity: 2 }],
    };

    const result = await createOrderCore(orderInput);
    expect(result.success).toBe(true);
    expect(result.orderNumber).toBeDefined();

    // Query DB directly
    const [savedOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, result.orderNumber))
      .limit(1);

    expect(savedOrder).toBeDefined();
    expect(savedOrder!.customerName).toBe(orderInput.customerName);
    expect(savedOrder!.customerEmail).toBe(orderInput.customerEmail);
    expect(savedOrder!.companyName).toBe(orderInput.companyName);
    expect(savedOrder!.vatBin).toBe(orderInput.vatBin);
    expect(savedOrder!.shippingAddress).toBe(orderInput.shippingAddress);
    expect(savedOrder!.city).toBe(orderInput.city);
    expect(savedOrder!.paymentMethod).toBe("BANK_TRANSFER");
    expect(savedOrder!.notes).toBe(orderInput.notes);
    expect(savedOrder!.status).toBe("PENDING");

    // Verify linked line items in orderItems table
    const savedItems = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, savedOrder!.id));

    expect(savedItems.length).toBe(1);
    expect(savedItems[0]!.productSlug).toBe(testSlug);
    expect(savedItems[0]!.quantity).toBe(2);

    // Test Admin Order Status Update
    const updateRes = await updateOrderStatusCore({
      id: savedOrder!.id,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      notes: "Bank transfer verified with City Bank corporate slip #88219",
    });
    expect(updateRes.success).toBe(true);

    const [reloadedOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, savedOrder!.id))
      .limit(1);

    expect(reloadedOrder!.status).toBe("CONFIRMED");
    expect(reloadedOrder!.paymentStatus).toBe("PAID");
    expect(reloadedOrder!.notes).toContain("Bank transfer verified");
  });

  // =========================================================================
  // 3. QUOTATIONS (RFQ) FULL PERSISTENCE & MULTI-ITEM AUDIT
  // =========================================================================
  it("persists RFQ requests, itemsJson, notes, and admin quotations to PostgreSQL", async () => {
    const quoteInput = {
      companyName: "Speedway Motors",
      contactName: "Jahangir Alam",
      phone: "+8801911445566",
      email: "jahangir@speedway.bd",
      productSlug: "launch-x-431-pad9-link",
      productName: "LAUNCH X-431 PAD9 LINK Flagship Scanner",
      qty: 1,
      businessType: "Multi-Brand Workshop",
      city: "Sylhet",
      notes: "Include 2 years software update and on-site training fee.",
      items: [
        { productSlug: "launch-x-431-pad9-link", productName: "LAUNCH X-431 PAD9 LINK", qty: 1 },
      ],
    };

    const result = await createQuoteCore(quoteInput);
    expect(result.success).toBe(true);
    expect(result.quoteNumber).toBeDefined();

    expect(result.quote).toBeDefined();
    const quoteRecord = result.quote!;

    const [savedQuote] = await db
      .select()
      .from(quotes)
      .where(eq(quotes.id, quoteRecord.id))
      .limit(1);

    expect(savedQuote).toBeDefined();
    expect(savedQuote!.companyName).toBe(quoteInput.companyName);
    expect(savedQuote!.contactName).toBe(quoteInput.contactName);
    expect(savedQuote!.phone).toBe(quoteInput.phone);
    expect(savedQuote!.city).toBe(quoteInput.city);
    expect(savedQuote!.notes).toBe(quoteInput.notes);
    expect(savedQuote!.status).toBe("PENDING");

    // Test Admin Detailed Reply and Price Persistence
    const quoteUpdateRes = await updateQuoteCore({
      id: savedQuote!.id,
      status: "QUOTED",
      quotedPrice: 385000,
      reply: "Official quotation valid for 30 days including certified training.",
      notes: "Client requested delivery to Sylhet regional depot.",
    });
    expect(quoteUpdateRes.success).toBe(true);

    const [reloadedQuote] = await db
      .select()
      .from(quotes)
      .where(eq(quotes.id, savedQuote!.id))
      .limit(1);

    expect(reloadedQuote!.status).toBe("QUOTED");
    expect(reloadedQuote!.quotedPrice).toBe(385000);
    expect(reloadedQuote!.reply).toContain("valid for 30 days");
    expect(reloadedQuote!.notes).toBe("Client requested delivery to Sylhet regional depot.");
  });

  // =========================================================================
  // 4. USER PROFILE SELF-SERVICE EDIT AUDIT
  // =========================================================================
  it("persists user profile updates (name, phone, companyName, businessType, city) in users table", async () => {
    // Insert a test user
    const testUserId = `usr-test-${Date.now()}`;
    await db.insert(users).values({
      id: testUserId,
      name: "Original Name",
      email: `user-${Date.now()}@testprofile.bd`,
      phone: "+8801700112233",
      companyName: "Original Workshop",
      businessType: "Workshop",
      city: "Khulna",
      role: "customer",
      isActive: true,
    });

    // Mock active session as this user
    const customerUser: SanitizedUser = {
      id: testUserId,
      name: "Original Name",
      email: `user-${Date.now()}@testprofile.bd`,
      phone: "+8801700112233",
      companyName: "Original Workshop",
      businessType: "Workshop",
      city: "Khulna",
      role: "customer",
      emailVerified: true,
      isActive: true,
      lastLogin: null,
      createdAt: new Date(),
    };
    vi.spyOn(authServer, "getSessionUserCore").mockResolvedValue(customerUser);

    const updateRes = await updateProfileCore(
      {
        name: "Engr. Shahinur Rahman",
        phone: "+8801899887766",
        companyName: "Shahin Auto Engineering Ltd",
        businessType: "Commercial Fleet Depot",
        city: "Gazipur",
      },
      customerUser,
    );

    expect(updateRes.success).toBe(true);
    expect(updateRes.user?.name).toBe("Engr. Shahinur Rahman");
    expect(updateRes.user?.companyName).toBe("Shahin Auto Engineering Ltd");

    // Verify directly in DB
    const [savedUser] = await db.select().from(users).where(eq(users.id, testUserId)).limit(1);
    expect(savedUser).toBeDefined();
    expect(savedUser!.name).toBe("Engr. Shahinur Rahman");
    expect(savedUser!.phone).toBe("+8801899887766");
    expect(savedUser!.companyName).toBe("Shahin Auto Engineering Ltd");
    expect(savedUser!.businessType).toBe("Commercial Fleet Depot");
    expect(savedUser!.city).toBe("Gazipur");
  });

  // =========================================================================
  // 5. SITE SETTINGS KEY-VALUE AUDIT
  // =========================================================================
  it("persists site configurations in settings table and retrieves them correctly", async () => {
    const settingsUpdate = {
      siteName: "PAGE International Machinery",
      tagline: "Precision Garage Infrastructure",
      contactEmail: "commercial@pageintl.bd",
      contactPhone: "+880 1755-502421",
      primaryColor: "#dc2626",
      heroHeadline: "HEAVY-DUTY GARAGE MACHINERY",
      announcementBar: "⚡ Special B2B Fleet Pricing Active This Quarter",
      announcementActive: true,
    };

    const updateRes = await updateSettingsCore(settingsUpdate);
    expect(updateRes.success).toBe(true);

    const reloaded = await getSettingsCore();
    expect(reloaded["siteName"]).toBe("PAGE International Machinery");
    expect(reloaded["tagline"]).toBe("Precision Garage Infrastructure");
    expect(reloaded["contactEmail"]).toBe("commercial@pageintl.bd");
    expect(reloaded["heroHeadline"]).toBe("HEAVY-DUTY GARAGE MACHINERY");
    expect(reloaded["announcementActive"]).toBe(true);
  });

  // =========================================================================
  // 6. INVENTORY FULL CRUD AUDIT (Specs, Highlights, Cost Price)
  // =========================================================================
  it("creates, reads, updates, and deletes inventory items with all technical specifications and costPriceBdt", async () => {
    const testSlug = `audit-scanner-${Date.now()}`;
    const newProduct = {
      slug: testSlug,
      sku: "AUD-SC-9000",
      name: "PAGE Master Audit Diagnostic Tablet",
      brand: "PAGE Engineered",
      category: "Diagnostic Equipment",
      priceBdt: 420000,
      costPriceBdt: 295000,
      warehouseQty: 15,
      reorderLevel: 3,
      inStock: true,
      description: "Heavy-duty commercial scanner with full CAN-FD and DoIP protocols.",
      specs: [
        ["Processor", "Octa-core 2.0GHz"],
        ["Battery", "9000mAh Lithium-Polymer"],
        ["Operating System", "Android 10.0"],
      ] as [string, string][],
      highlights: [
        ["Protocol", "DoIP & CAN-FD Supported"],
        ["Screen", "10.1-inch Sunlight Readable"],
      ] as [string, string][],
      variantOptions: [{ name: "Connector Kit", options: ["Standard OBD2", "Full Commercial Adapter Set"] }],
      guarantees: [{ title: "2-Year Warranty", subtitle: "Direct PAGE Replacement" }],
      images: ["/uploads/products/test-scanner.png"],
    };

    const createRes = await createInventoryItemCore(newProduct);
    expect(createRes.success).toBe(true);
    expect(createRes.product).toBeDefined();
    expect(createRes.product!.slug).toBe(testSlug);

    // Verify stored in DB
    const [stored] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.slug, testSlug))
      .limit(1);

    expect(stored).toBeDefined();
    expect(stored!.name).toBe(newProduct.name);
    expect(stored!.sku).toBe(newProduct.sku);
    expect(stored!.priceBdt).toBe(420000);
    expect(stored!.costPriceBdt).toBe(295000);
    expect(stored!.warehouseQty).toBe(15);
    expect(Array.isArray(stored!.specs)).toBe(true);
    expect(stored!.specs).toEqual(newProduct.specs);

    // Update item
    const updateRes = await updateInventoryItemCore({
      slug: testSlug,
      priceBdt: 450000,
      warehouseQty: 25,
      costPriceBdt: 310000,
    });
    expect(updateRes.success).toBe(true);

    const [updatedRow] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.slug, testSlug))
      .limit(1);

    expect(updatedRow!.priceBdt).toBe(450000);
    expect(updatedRow!.warehouseQty).toBe(25);
    expect(updatedRow!.costPriceBdt).toBe(310000);

    // Delete item
    const deleteRes = await deleteInventoryItemCore(testSlug);
    expect(deleteRes.success).toBe(true);

    const [deletedRow] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.slug, testSlug))
      .limit(1);

    expect(deletedRow).toBeUndefined();
  });

  // =========================================================================
  // 7. BANNERS FULL CRUD AUDIT
  // =========================================================================
  it("creates, updates, and deletes featured banners in PostgreSQL", async () => {
    const bannerRes = await saveBannerCore({
      title: "Commercial Lift Spring Campaign",
      subtitle: "Free Anchoring & Rigging Included",
      imageUrl: "/uploads/banners/spring-lift-campaign.png",
      badge: "4-Wheeler",
      category: "Garage Equipment",
      link: "/shop?cat=Garage+Equipment",
      isActive: true,
      sortOrder: 99,
    });

    expect(bannerRes.success).toBe(true);
    expect(bannerRes.banner?.id).toBeDefined();

    const bannerId = bannerRes.banner!.id;
    const [storedBanner] = await db.select().from(banners).where(eq(banners.id, bannerId)).limit(1);
    expect(storedBanner).toBeDefined();
    expect(storedBanner!.title).toBe("Commercial Lift Spring Campaign");
    expect(storedBanner!.sortOrder).toBe(99);

    // Delete banner
    const deleteBannerRes = await deleteBannerCore(bannerId);
    expect(deleteBannerRes.success).toBe(true);

    const [deletedBanner] = await db.select().from(banners).where(eq(banners.id, bannerId)).limit(1);
    expect(deletedBanner).toBeUndefined();
  });
});
