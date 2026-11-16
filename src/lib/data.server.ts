import {
  db,
  quotes,
  bookings,
  orders,
  orderItems,
  productsTable,
  banners,
  updates,
  users,
  settings,
  auditLog,
  emailLog,
  reviews,
  type QuoteRow,
  type BookingRow,
  type OrderRow,
  type ProductRow,
  type BannerRow,
  type UpdateRow,
  type UserRow,
  type ReviewRow,
} from "@/db";
import { eq, desc, asc, and, or, sql, inArray } from "drizzle-orm";
import { getSessionUserCore, getClientIp } from "./auth.server";
import { checkRateLimit } from "./rate-limiter";
import crypto from "node:crypto";
import {
  sendTransactionalEmail,
  renderQuoteConfirmationEmail,
  renderAdminQuoteNotificationEmail,
  renderBookingConfirmationEmail,
  renderOrderConfirmationEmail,
  getEmailProvider,
  isEmailProviderReady,
  isResendSandboxFrom,
} from "./email.server";
import { ensureServerEnvLoaded } from "./env.server";
import { mapDbProductToProduct, products as staticProducts, type Product } from "./data";
import {
  getDefaultProductPresentation,
  inferIsEquipment,
  normalizeSpecsToTuples,
  sanitizeFeatureLines,
  sanitizeGuaranteeBadges,
  sanitizeHighlightTuples,
  sanitizeVariantGroups,
  type ProductGuaranteeBadge,
  type ProductVariantGroup,
  type SpecTuple,
  type SpecsInput,
} from "./product-utils";
import {
  normalizeShopBannerVideoConfig,
  sanitizeShopBannerVideoUrl,
  SHOP_BANNER_VIDEO_SETTING_KEY,
  type ShopBannerVideoConfig,
  type ShopBannerVideoItem,
} from "./shop-banner-video";
import { reviewsData, type Review } from "./reviews";

// -----------------------------------------------------------------------------
// HELPER: Require Admin Privileges
// -----------------------------------------------------------------------------
async function requireAdmin() {
  const user = await getSessionUserCore();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: Administrative privileges required.");
  }
  return user;
}

// =============================================================================
// 1. QUOTATIONS (RFQs)
// =============================================================================

export interface CreateQuoteInput {
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  productSlug: string;
  productName: string;
  qty: number;
  businessType?: string | undefined;
  city?: string | undefined;
  notes?: string | undefined;
  items?:
    { productSlug: string; productName: string; qty: number; unitPrice?: number }[] | undefined;
  honeypot?: string | undefined;
  verifiedViaOtp?: boolean | undefined;
}

export async function createQuoteCore(data: CreateQuoteInput) {
  const ip = getClientIp();

  if (data.honeypot && data.honeypot.trim().length > 0) {
    await new Promise((r) => setTimeout(r, 800));
    return { success: true, quoteNumber: `RFQ-${Math.floor(100000 + Math.random() * 900000)}` };
  }

  const companyName = (data.companyName || "").trim();
  const phone = (data.phone || "").trim();
  const normalizedEmail = (data.email || "").trim().toLowerCase();
  const contactName = (data.contactName || "").trim() || companyName;
  const productName = (data.productName || "").trim();
  const productSlug = (data.productSlug || "").trim() || "custom-rfq";

  if (!companyName || !phone || !productName) {
    throw new Error("Please provide company name, phone number, and product details.");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    throw new Error("Please provide a valid business email address.");
  }

  const rateCheck = checkRateLimit(`quote:${ip}`, 10, 60);
  if (!rateCheck.allowed) {
    throw new Error(
      `Too many quotation requests. Please wait ${rateCheck.resetInSeconds} seconds.`,
    );
  }

  const user = await getSessionUserCore();
  const id = `q-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const quoteNumber = `RFQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const normalizedQty = Math.max(1, Math.floor(Number(data.qty) || 1));

  const [row] = await db
    .insert(quotes)
    .values({
      id,
      quoteNumber,
      userId: user?.id || null,
      companyName,
      contactName,
      phone,
      email: normalizedEmail,
      productSlug,
      productName,
      qty: normalizedQty,
      businessType: data.businessType?.trim() || "Workshop / Garage",
      city: data.city?.trim() || "Dhaka",
      notes: data.notes?.trim() || null,
      status: "PENDING",
      itemsJson: data.items && data.items.length > 0 ? data.items : null,
    })
    .returning();

  // Log in Audit & Dispatch Emails (non-blocking)
  try {
    await db.insert(auditLog).values({
      id: `audit-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
      actorId: user?.id || null,
      actorEmail: normalizedEmail,
      action: "quote.create",
      entityType: "quote",
      entityId: id,
      metadata: {
        quoteNumber,
        product: productName,
        verifiedViaOtp: Boolean(data.verifiedViaOtp),
      },
      ipAddress: ip,
    });

    ensureServerEnvLoaded();
    const emailProvider = getEmailProvider();
    const isSandboxResend = isResendSandboxFrom();
    const canDispatchMail =
      emailProvider.name === "console" || isEmailProviderReady(emailProvider) || isSandboxResend;

    if (canDispatchMail && !isSandboxResend) {
      const emailData = renderQuoteConfirmationEmail({
        quoteNumber,
        contactName,
        companyName: companyName || undefined,
        productName,
        qty: normalizedQty,
      });
      sendTransactionalEmail({
        to: normalizedEmail,
        subject: `Quotation Request Received [${quoteNumber}] — PAGE International`,
        template: "QUOTE_CONFIRMATION",
        html: emailData.html,
        text: emailData.text,
      }).catch(() => {});
    }

    const adminNotifyEmail = (process.env["MAIL_ADMIN_NOTIFICATION"] || "").trim().toLowerCase();
    if (canDispatchMail && adminNotifyEmail && emailRegex.test(adminNotifyEmail)) {
      const adminEmailData = renderAdminQuoteNotificationEmail({
        quoteNumber,
        companyName,
        contactName,
        phone,
        email: normalizedEmail,
        productName,
        qty: normalizedQty,
        city: data.city?.trim() || undefined,
        notes: data.notes?.trim() || undefined,
        verifiedViaOtp: Boolean(data.verifiedViaOtp),
      });
      sendTransactionalEmail({
        to: adminNotifyEmail,
        subject: `New B2B Quotation [${quoteNumber}] — ${companyName}`,
        template: "ADMIN_QUOTE_NOTIFICATION",
        html: adminEmailData.html,
        text: adminEmailData.text,
        replyTo: normalizedEmail,
      }).catch(() => {});
    }
  } catch {
    // Non-blocking
  }

  return { success: true, quoteNumber, quote: row };
}

export async function listQuotesCore(filter?: {
  status?: string | undefined;
  search?: string | undefined;
}) {
  const user = await getSessionUserCore();
  if (!user || user.role !== "admin") {
    // If regular customer, show only their own quotes
    if (user) {
      return await db
        .select()
        .from(quotes)
        .where(eq(quotes.userId, user.id))
        .orderBy(desc(quotes.createdAt));
    }
    throw new Error("Unauthorized. Please log in.");
  }

  let rows = await db.select().from(quotes).orderBy(desc(quotes.createdAt));

  if (filter?.status && filter.status !== "all") {
    rows = rows.filter((r) => r.status.toLowerCase() === filter.status!.toLowerCase());
  }

  if (filter?.search && filter.search.trim().length > 0) {
    const q = filter.search.trim().toLowerCase();
    rows = rows.filter(
      (r) =>
        r.companyName.toLowerCase().includes(q) ||
        r.contactName.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        (r.quoteNumber || "").toLowerCase().includes(q),
    );
  }

  return rows;
}

export async function updateQuoteCore(data: {
  id: string;
  status?: string | undefined;
  reply?: string | undefined;
  quotedPrice?: number | undefined;
  notes?: string | undefined;
  itemsJson?:
    | { productSlug: string; productName: string; qty: number; unitPrice?: number }[]
    | undefined;
  companyName?: string | undefined;
  contactName?: string | undefined;
  phone?: string | undefined;
  email?: string | undefined;
  qty?: number | undefined;
  productName?: string | undefined;
  productSlug?: string | undefined;
}) {
  const admin = await requireAdmin();

  const [updated] = await db
    .update(quotes)
    .set({
      ...(data.status ? { status: data.status.toUpperCase() } : {}),
      ...(data.reply !== undefined ? { reply: data.reply } : {}),
      ...(data.quotedPrice !== undefined ? { quotedPrice: data.quotedPrice } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
      ...(data.itemsJson !== undefined ? { itemsJson: data.itemsJson } : {}),
      ...(data.companyName !== undefined ? { companyName: data.companyName.trim() } : {}),
      ...(data.contactName !== undefined ? { contactName: data.contactName.trim() } : {}),
      ...(data.phone !== undefined ? { phone: data.phone.trim() } : {}),
      ...(data.email !== undefined ? { email: data.email.trim().toLowerCase() } : {}),
      ...(data.qty !== undefined ? { qty: Math.max(1, Math.floor(Number(data.qty) || 1)) } : {}),
      ...(data.productName !== undefined ? { productName: data.productName.trim() } : {}),
      ...(data.productSlug !== undefined ? { productSlug: data.productSlug.trim() } : {}),
      updatedAt: new Date(),
    })
    .where(eq(quotes.id, data.id))
    .returning();

  if (updated) {
    try {
      await db.insert(auditLog).values({
        id: `audit-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
        actorId: admin.id,
        actorEmail: admin.email,
        action: "quote.update",
        entityType: "quote",
        entityId: data.id,
        metadata: { status: data.status, quotedPrice: data.quotedPrice },
        ipAddress: getClientIp(),
      });
    } catch {
      // Non-blocking
    }
  }

  return { success: true, quote: updated };
}

export async function deleteQuoteCore(id: string) {
  const admin = await requireAdmin();
  await db.delete(quotes).where(eq(quotes.id, id));

  try {
    await db.insert(auditLog).values({
      id: `audit-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
      actorId: admin.id,
      actorEmail: admin.email,
      action: "quote.delete",
      entityType: "quote",
      entityId: id,
      ipAddress: getClientIp(),
    });
  } catch {
    // Non-blocking
  }

  return { success: true };
}

// =============================================================================
// 2. CONSULTATION & DEMONSTRATION BOOKINGS
// =============================================================================

export interface CreateBookingInput {
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  serviceType: string;
  bookingDate: string;
  timeSlot: string;
  city?: string | undefined;
  centerId?: string | undefined;
  centerName?: string | undefined;
  businessType?: string | undefined;
  bays?: string | undefined;
  equipmentInterest?: string | undefined;
  locationType?: string | undefined;
  onsiteAddress?: string | undefined;
  notes?: string | undefined;
  honeypot?: string | undefined;
}

export async function createBookingCore(data: CreateBookingInput) {
  const ip = getClientIp();

  if (data.honeypot && data.honeypot.trim().length > 0) {
    await new Promise((r) => setTimeout(r, 800));
    return { success: true, bookingNumber: `BK-${Math.floor(100000 + Math.random() * 900000)}` };
  }

  const rateCheck = checkRateLimit(`booking:${ip}`, 10, 60);
  if (!rateCheck.allowed) {
    throw new Error(`Too many booking requests. Please wait ${rateCheck.resetInSeconds} seconds.`);
  }

  await ensureDatabaseColumns();
  const user = await getSessionUserCore();
  const id = `bk-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const bookingNumber = `BK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const [row] = await db
    .insert(bookings)
    .values({
      id,
      bookingNumber,
      userId: user?.id || null,
      companyName: data.companyName.trim(),
      contactName: data.contactName.trim() || data.companyName.trim(),
      phone: data.phone.trim(),
      email: data.email.trim().toLowerCase(),
      serviceType: data.serviceType,
      bookingDate: data.bookingDate,
      timeSlot: data.timeSlot,
      city: data.city || "Dhaka",
      centerId: data.centerId || null,
      centerName: data.centerName || null,
      businessType: data.businessType?.trim() || "Workshop / Garage",
      bays: data.bays?.trim() || null,
      equipmentInterest: data.equipmentInterest?.trim() || null,
      locationType: data.locationType?.trim() || "hub",
      onsiteAddress: data.onsiteAddress?.trim() || null,
      notes: data.notes || null,
      status: "PENDING",
    })
    .returning();

  // Audit & Email Log
  try {
    await db.insert(auditLog).values({
      id: `audit-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
      actorId: user?.id || null,
      actorEmail: data.email,
      action: "booking.create",
      entityType: "booking",
      entityId: id,
      metadata: { bookingNumber, serviceType: data.serviceType },
      ipAddress: ip,
    });

    const emailData = renderBookingConfirmationEmail({
      bookingNumber,
      contactName: data.contactName,
      companyName: data.companyName || undefined,
      serviceType: data.serviceType,
      centerName: data.centerName || data.city || "PAGE Equipment Hub — Uttara, Dhaka",
      bookingDate: data.bookingDate,
      timeSlot: data.timeSlot,
    });
    sendTransactionalEmail({
      to: data.email,
      subject: `Demonstration Booking Received [${bookingNumber}] — PAGE International`,
      template: "BOOKING_CONFIRMATION",
      html: emailData.html,
      text: emailData.text,
    }).catch(() => {});
  } catch {
    // Non-blocking
  }

  return { success: true, bookingNumber, booking: row };
}

export async function listBookingsCore(filter?: { status?: string | undefined }) {
  const user = await getSessionUserCore();
  if (!user || user.role !== "admin") {
    if (user) {
      return await db
        .select()
        .from(bookings)
        .where(eq(bookings.userId, user.id))
        .orderBy(desc(bookings.createdAt));
    }
    throw new Error("Unauthorized. Please log in.");
  }

  const rows = await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  if (filter?.status && filter.status !== "all") {
    return rows.filter((r) => r.status.toLowerCase() === filter.status!.toLowerCase());
  }
  return rows;
}

export async function updateBookingCore(data: {
  id: string;
  status?: string | undefined;
  adminNotes?: string | undefined;
  notes?: string | undefined;
  bookingDate?: string | undefined;
  timeSlot?: string | undefined;
  centerName?: string | undefined;
  serviceType?: string | undefined;
}) {
  const admin = await requireAdmin();

  const [updated] = await db
    .update(bookings)
    .set({
      ...(data.status ? { status: data.status.toUpperCase() } : {}),
      ...(data.adminNotes !== undefined ? { adminNotes: data.adminNotes } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
      ...(data.bookingDate !== undefined ? { bookingDate: data.bookingDate } : {}),
      ...(data.timeSlot !== undefined ? { timeSlot: data.timeSlot } : {}),
      ...(data.centerName !== undefined ? { centerName: data.centerName } : {}),
      ...(data.serviceType !== undefined ? { serviceType: data.serviceType } : {}),
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, data.id))
    .returning();

  if (updated) {
    try {
      await db.insert(auditLog).values({
        id: `audit-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
        actorId: admin.id,
        actorEmail: admin.email,
        action: "booking.update",
        entityType: "booking",
        entityId: data.id,
        metadata: { status: data.status },
        ipAddress: getClientIp(),
      });
    } catch {
      // Non-blocking
    }
  }

  return { success: true, booking: updated };
}

export async function deleteBookingCore(id: string) {
  const admin = await requireAdmin();
  await db.delete(bookings).where(eq(bookings.id, id));

  try {
    await db.insert(auditLog).values({
      id: `audit-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
      actorId: admin.id,
      actorEmail: admin.email,
      action: "booking.delete",
      entityType: "booking",
      entityId: id,
      ipAddress: getClientIp(),
    });
  } catch {
    // Non-blocking
  }

  return { success: true };
}

// =============================================================================
// 3. ORDERS & CHECKOUT (Zero-Trust Server Calculation)
// =============================================================================

export interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName?: string | undefined;
  vatBin?: string | undefined;
  shippingAddress: string;
  city: string;
  district?: string | undefined;
  postalCode?: string | undefined;
  paymentMethod: string;
  notes?: string | undefined;
  items: { productSlug: string; quantity: number }[];
  honeypot?: string | undefined;
}

export async function createOrderCore(data: CreateOrderInput) {
  const ip = getClientIp();

  if (data.honeypot && data.honeypot.trim().length > 0) {
    await new Promise((r) => setTimeout(r, 800));
    return {
      success: true,
      orderNumber: `PG-${Math.floor(100000 + Math.random() * 900000)}`,
      total: 0,
    };
  }

  if (!data.items || data.items.length === 0) {
    throw new Error("Cannot create order with an empty cart.");
  }

  const rateCheck = checkRateLimit(`order:${ip}`, 5, 60);
  if (!rateCheck.allowed) {
    throw new Error(`Too many order attempts. Please wait ${rateCheck.resetInSeconds} seconds.`);
  }

  await ensureDatabaseColumns();

  // 1. Fetch products from database to calculate real verified prices
  const slugs = data.items.map((i) => i.productSlug);
  const dbProducts = await db
    .select()
    .from(productsTable)
    .where(inArray(productsTable.slug, slugs));

  const productMap = new Map(dbProducts.map((p) => [p.slug, p]));

  let subtotal = 0;
  const verifiedItems: {
    productId: string;
    productSlug: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }[] = [];

  for (const item of data.items) {
    const prod = productMap.get(item.productSlug);
    if (!prod) {
      throw new Error(`Product "${item.productSlug}" not found in current catalog.`);
    }

    const qty = Math.max(1, Math.floor(item.quantity));
    const unitPrice = prod.priceBdt;
    const itemSubtotal = unitPrice * qty;
    subtotal += itemSubtotal;

    verifiedItems.push({
      productId: prod.id,
      productSlug: prod.slug,
      productName: prod.name,
      unitPrice,
      quantity: qty,
      subtotal: itemSubtotal,
    });
  }

  // B2B Shipping calculation (Free delivery above 50,000 BDT or commercial machinery)
  const shippingFee = subtotal >= 50000 ? 0 : 500;
  const total = subtotal + shippingFee;

  const user = await getSessionUserCore();
  const orderId = `ord-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const orderNumber = `PG-${Math.floor(100000 + Math.random() * 900000)}`;

  // 2. Insert order
  const [createdOrder] = await db
    .insert(orders)
    .values({
      id: orderId,
      orderNumber,
      userId: user?.id || null,
      customerName: data.customerName.trim(),
      customerEmail: data.customerEmail.trim().toLowerCase(),
      customerPhone: data.customerPhone.trim(),
      companyName: data.companyName?.trim() || null,
      vatBin: data.vatBin?.trim() || null,
      shippingAddress: data.shippingAddress.trim(),
      city: data.city.trim(),
      district: data.district?.trim() || null,
      postalCode: data.postalCode?.trim() || null,
      subtotal,
      shippingFee,
      total,
      currency: "BDT",
      status: "PENDING",
      paymentMethod: data.paymentMethod || "CASH_ON_DELIVERY",
      paymentStatus: "UNPAID",
      notes: data.notes?.trim() || null,
    })
    .returning();

  // 3. Insert line items
  for (const it of verifiedItems) {
    await db.insert(orderItems).values({
      id: `oit-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
      orderId,
      productId: it.productId,
      productSlug: it.productSlug,
      productName: it.productName,
      unitPrice: it.unitPrice,
      quantity: it.quantity,
      subtotal: it.subtotal,
    });

    // Reduce inventory warehouse count
    try {
      await db
        .update(productsTable)
        .set({
          warehouseQty: sql`GREATEST(0, ${productsTable.warehouseQty} - ${it.quantity})`,
          updatedAt: new Date(),
        })
        .where(eq(productsTable.id, it.productId));
    } catch {
      // Non-blocking inventory update
    }
  }

  // 4. Audit & Email Notification
  try {
    await db.insert(auditLog).values({
      id: `audit-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
      actorId: user?.id || null,
      actorEmail: data.customerEmail,
      action: "order.create",
      entityType: "order",
      entityId: orderId,
      metadata: { orderNumber, total, itemsCount: verifiedItems.length },
      ipAddress: ip,
    });

    const emailData = renderOrderConfirmationEmail({
      orderNumber,
      customerName: data.customerName,
      companyName: data.companyName || undefined,
      total,
      itemsCount: verifiedItems.length,
      paymentMethod: data.paymentMethod,
    });
    sendTransactionalEmail({
      to: data.customerEmail,
      subject: `Order Confirmation [${orderNumber}] — PAGE International`,
      template: "ORDER_CONFIRMATION",
      html: emailData.html,
      text: emailData.text,
    }).catch(() => {});
  } catch {
    // Non-blocking
  }

  return {
    success: true,
    orderId,
    orderNumber,
    subtotal,
    shippingFee,
    total,
    order: createdOrder,
  };
}

export async function listOrdersCore(filter?: { status?: string | undefined }) {
  const user = await getSessionUserCore();
  if (!user || user.role !== "admin") {
    if (user) {
      const userOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, user.id))
        .orderBy(desc(orders.createdAt));

      const orderIds = userOrders.map((o) => o.id);
      let itemsList: (typeof orderItems.$inferSelect)[] = [];
      if (orderIds.length > 0) {
        itemsList = await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds));
      }

      return userOrders.map((ord) => ({
        ...ord,
        items: itemsList.filter((it) => it.orderId === ord.id),
      }));
    }
    throw new Error("Unauthorized. Please log in.");
  }

  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
  const orderIds = allOrders.map((o) => o.id);

  let itemsList: (typeof orderItems.$inferSelect)[] = [];
  if (orderIds.length > 0) {
    itemsList = await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds));
  }

  const result = allOrders.map((ord) => ({
    ...ord,
    items: itemsList.filter((it) => it.orderId === ord.id),
  }));

  if (filter?.status && filter.status !== "all") {
    return result.filter((o) => o.status.toLowerCase() === filter.status!.toLowerCase());
  }
  return result;
}

export async function updateOrderStatusCore(data: {
  id: string;
  status?: string | undefined;
  paymentStatus?: string | undefined;
  notes?: string | undefined;
}) {
  const admin = await requireAdmin();

  const [updated] = await db
    .update(orders)
    .set({
      ...(data.status ? { status: data.status.toUpperCase() } : {}),
      ...(data.paymentStatus ? { paymentStatus: data.paymentStatus.toUpperCase() } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
      updatedAt: new Date(),
    })
    .where(eq(orders.id, data.id))
    .returning();

  if (updated) {
    try {
      await db.insert(auditLog).values({
        id: `audit-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
        actorId: admin.id,
        actorEmail: admin.email,
        action: "order.update",
        entityType: "order",
        entityId: data.id,
        metadata: { status: data.status, paymentStatus: data.paymentStatus },
        ipAddress: getClientIp(),
      });
    } catch {
      // Non-blocking
    }
  }

  return { success: true, order: updated };
}

// =============================================================================
// 4. INVENTORY & PRODUCT CATALOG
// =============================================================================

let hasEnsuredColumns = false;
export async function ensureDatabaseColumns() {
  if (hasEnsuredColumns) return;
  try {
    const executableDb = db as unknown as { execute?: (query: unknown) => Promise<unknown> };
    if (typeof executableDb.execute === "function") {
      await executableDb.execute(
        sql`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "cost_price_bdt" integer DEFAULT 0 NOT NULL`,
      );
      await executableDb.execute(
        sql`ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "business_type" text DEFAULT 'Workshop / Garage' NOT NULL`,
      );
      await executableDb.execute(
        sql`ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "bays" text`,
      );
      await executableDb.execute(
        sql`ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "equipment_interest" text`,
      );
      await executableDb.execute(
        sql`ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "location_type" text DEFAULT 'hub' NOT NULL`,
      );
      await executableDb.execute(
        sql`ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "onsite_address" text`,
      );
      await executableDb.execute(
        sql`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "vat_bin" text`,
      );
    }
    hasEnsuredColumns = true;
  } catch (err) {
    console.warn("Could not ensure database columns:", err);
  }
}
async function ensureCostPriceColumn() {
  await ensureDatabaseColumns();
}

const CATALOG_SYNC_VERSION = "20261116-v1";
let lastSyncedCatalogVersion: string | null = null;
async function ensureCatalogSynced() {
  await ensureCostPriceColumn();
  if (lastSyncedCatalogVersion === CATALOG_SYNC_VERSION) return;
  try {
    const existing = await db.select({ slug: productsTable.slug }).from(productsTable);
    const existingSlugs = new Set(existing.map((r) => r.slug));

    // Never delete admin-created or user-entered products, and never overwrite admin edits.
    // Only insert initial static catalog items that do not exist yet in the database.

    const missing = staticProducts.filter((p) => !existingSlugs.has(p.slug));
    if (missing.length > 0) {
      for (const p of missing) {
        const specsTuples = normalizeSpecsToTuples(p.specs);
        const presentation = getDefaultProductPresentation({
          slug: p.slug,
          category: p.category,
          isEquipment: Boolean(p.isEquipment),
          requiresQuote: Boolean(p.requiresQuote),
          specs: specsTuples,
        });

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
            costPriceBdt:
              p.costPrice || (p.price > 0 ? Math.round(((p.price || 0) * 0.72) / 500) * 500 : 0),
            inStock: p.stock !== "Out of stock",
            warehouseQty: p.warehouseQty ?? 10,
            reorderLevel: p.reorderLevel ?? 2,
            badge: p.badge || null,
            description: p.description || p.name,
            specs: specsTuples,
            highlights: p.highlights || presentation.highlights,
            variantOptions: presentation.variantOptions,
            guarantees: presentation.guarantees,
            dispatchHub: presentation.dispatchHub,
            priceLabel: presentation.priceLabel,
            features: p.features || [],
            images: p.images || [p.image],
            fits: p.fits || [],
          })
          .onConflictDoNothing();
      }
    }
    lastSyncedCatalogVersion = CATALOG_SYNC_VERSION;
  } catch (err) {
    console.warn("Could not sync catalog products:", err);
  }
}

export async function listInventoryCore() {
  await ensureCatalogSynced();
  return await db.select().from(productsTable).orderBy(asc(productsTable.name));
}

export async function listCatalogProductsCore(): Promise<Product[]> {
  await ensureCatalogSynced();
  const rows = await db.select().from(productsTable).orderBy(desc(productsTable.createdAt));
  if (rows.length === 0) {
    return staticProducts;
  }

  const staticIndexMap = new Map(staticProducts.map((p, idx) => [p.slug, idx]));
  const mapped = rows.map((row) => mapDbProductToProduct(row));
  return mapped.sort((a, b) => {
    const idxA = staticIndexMap.get(a.slug);
    const idxB = staticIndexMap.get(b.slug);
    if (idxA === undefined && idxB === undefined) return 0; // keep newest custom products first
    if (idxA === undefined) return -1;
    if (idxB === undefined) return 1;
    return idxA - idxB;
  });
}

export async function getProductBySlugCore(slug: string): Promise<Product | null> {
  await ensureCatalogSynced();
  const rows = await db.select().from(productsTable).where(eq(productsTable.slug, slug)).limit(1);
  if (rows[0]) {
    return mapDbProductToProduct(rows[0]);
  }
  const fallback = staticProducts.find((p) => p.slug === slug);
  return fallback || null;
}

export interface UpdateInventoryItemInput {
  slug: string;
  sku?: string | undefined;
  name?: string | undefined;
  brand?: string | undefined;
  category?: string | undefined;
  subcategory?: string | undefined;
  mobility?: string[] | undefined;
  isEquipment?: boolean | undefined;
  requiresQuote?: boolean | undefined;
  priceBdt?: number | undefined;
  costPriceBdt?: number | undefined;
  inStock?: boolean | undefined;
  warehouseQty?: number | undefined;
  reorderLevel?: number | undefined;
  badge?: string | undefined;
  description?: string | undefined;
  specs?: SpecsInput;
  highlights?: SpecTuple[] | undefined;
  variantOptions?: ProductVariantGroup[] | undefined;
  guarantees?: ProductGuaranteeBadge[] | undefined;
  dispatchHub?: string | undefined;
  priceLabel?: string | undefined;
  features?: string[] | undefined;
  images?: string[] | undefined;
  fits?: string[] | undefined;
}

export async function updateInventoryItemCore(data: UpdateInventoryItemInput) {
  const admin = await requireAdmin();
  await ensureCostPriceColumn();

  const normalizedSpecs = data.specs !== undefined ? normalizeSpecsToTuples(data.specs) : undefined;
  const normalizedHighlights =
    data.highlights !== undefined ? sanitizeHighlightTuples(data.highlights) : undefined;
  const normalizedVariantOptions =
    data.variantOptions !== undefined ? sanitizeVariantGroups(data.variantOptions) : undefined;
  const normalizedGuarantees =
    data.guarantees !== undefined ? sanitizeGuaranteeBadges(data.guarantees) : undefined;
  const normalizedFeatures =
    data.features !== undefined ? sanitizeFeatureLines(data.features) : undefined;
  const normalizedFits = data.fits !== undefined ? sanitizeFeatureLines(data.fits) : undefined;

  const [updated] = await db
    .update(productsTable)
    .set({
      ...(data.sku !== undefined ? { sku: data.sku.trim() || null } : {}),
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.brand !== undefined ? { brand: data.brand.trim() || "PAGE Genuine" } : {}),
      ...(data.category !== undefined ? { category: data.category.trim() } : {}),
      ...(data.subcategory !== undefined ? { subcategory: data.subcategory || null } : {}),
      ...(data.mobility !== undefined ? { mobility: data.mobility } : {}),
      ...(data.isEquipment !== undefined ? { isEquipment: data.isEquipment } : {}),
      ...(data.requiresQuote !== undefined ? { requiresQuote: data.requiresQuote } : {}),
      ...(data.priceBdt !== undefined ? { priceBdt: Math.max(0, Number(data.priceBdt) || 0) } : {}),
      ...(data.costPriceBdt !== undefined
        ? { costPriceBdt: Math.max(0, Number(data.costPriceBdt) || 0) }
        : {}),
      ...(data.inStock !== undefined ? { inStock: data.inStock } : {}),
      ...(data.warehouseQty !== undefined
        ? { warehouseQty: Math.max(0, Math.floor(Number(data.warehouseQty) || 0)) }
        : {}),
      ...(data.reorderLevel !== undefined
        ? { reorderLevel: Math.max(0, Math.floor(Number(data.reorderLevel) || 0)) }
        : {}),
      ...(data.badge !== undefined ? { badge: data.badge || null } : {}),
      ...(data.description !== undefined ? { description: data.description.trim() } : {}),
      ...(normalizedSpecs !== undefined ? { specs: normalizedSpecs } : {}),
      ...(normalizedHighlights !== undefined ? { highlights: normalizedHighlights } : {}),
      ...(normalizedVariantOptions !== undefined
        ? { variantOptions: normalizedVariantOptions }
        : {}),
      ...(normalizedGuarantees !== undefined ? { guarantees: normalizedGuarantees } : {}),
      ...(data.dispatchHub !== undefined ? { dispatchHub: data.dispatchHub.trim() } : {}),
      ...(data.priceLabel !== undefined ? { priceLabel: data.priceLabel.trim() } : {}),
      ...(normalizedFeatures !== undefined ? { features: normalizedFeatures } : {}),
      ...(data.images !== undefined ? { images: data.images } : {}),
      ...(normalizedFits !== undefined ? { fits: normalizedFits } : {}),
      updatedAt: new Date(),
    })
    .where(eq(productsTable.slug, data.slug))
    .returning();

  if (updated) {
    try {
      await db.insert(auditLog).values({
        id: `audit-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
        actorId: admin.id,
        actorEmail: admin.email,
        action: "inventory.update",
        entityType: "product",
        entityId: updated.id,
        metadata: {
          slug: data.slug,
          sku: data.sku,
          priceBdt: data.priceBdt,
          warehouseQty: data.warehouseQty,
          specsCount: normalizedSpecs?.length,
        },
        ipAddress: getClientIp(),
      });
    } catch {
      // Non-blocking
    }
  }

  return { success: true, product: updated };
}

export interface CreateInventoryItemInput {
  slug: string;
  sku?: string | undefined;
  name: string;
  brand: string;
  category: string;
  subcategory?: string | undefined;
  mobility?: string[] | undefined;
  isEquipment?: boolean | undefined;
  requiresQuote?: boolean | undefined;
  priceBdt: number;
  costPriceBdt?: number | undefined;
  inStock?: boolean | undefined;
  warehouseQty?: number | undefined;
  reorderLevel?: number | undefined;
  badge?: string | undefined;
  description: string;
  specs?: SpecsInput;
  highlights?: SpecTuple[] | undefined;
  variantOptions?: ProductVariantGroup[] | undefined;
  guarantees?: ProductGuaranteeBadge[] | undefined;
  dispatchHub?: string | undefined;
  priceLabel?: string | undefined;
  features?: string[] | undefined;
  images?: string[] | undefined;
  fits?: string[] | undefined;
}

export async function createInventoryItemCore(data: CreateInventoryItemInput) {
  const admin = await requireAdmin();
  await ensureCostPriceColumn();
  const slug = data.slug.trim();
  const id = `prod-${slug}`;
  const normalizedSpecs = normalizeSpecsToTuples(data.specs);
  const normalizedHighlights = sanitizeHighlightTuples(data.highlights || []);
  const normalizedVariantOptions = sanitizeVariantGroups(data.variantOptions || []);
  const normalizedGuarantees = sanitizeGuaranteeBadges(data.guarantees || []);
  const normalizedFeatures = sanitizeFeatureLines(data.features || []);
  const normalizedFits = sanitizeFeatureLines(data.fits || []);
  const isEquipment =
    data.isEquipment !== undefined ? data.isEquipment : inferIsEquipment(data.category);
  const priceBdt = Math.max(0, Number(data.priceBdt) || 0);
  const costPriceBdt = Math.max(0, Number(data.costPriceBdt) || 0);
  const warehouseQty =
    data.warehouseQty !== undefined ? Math.max(0, Math.floor(Number(data.warehouseQty) || 0)) : 10;
  const reorderLevel =
    data.reorderLevel !== undefined ? Math.max(0, Math.floor(Number(data.reorderLevel) || 0)) : 2;
  const sku = (data.sku || "").trim() || `PG-${slug.slice(0, 6).toUpperCase()}`;

  const [created] = await db
    .insert(productsTable)
    .values({
      id,
      slug,
      sku,
      name: data.name.trim(),
      brand: (data.brand || "").trim() || "PAGE Genuine",
      category: data.category.trim(),
      subcategory: data.subcategory || null,
      mobility: data.mobility && data.mobility.length > 0 ? data.mobility : ["4-Wheeler"],
      isEquipment,
      requiresQuote:
        data.requiresQuote !== undefined ? data.requiresQuote : isEquipment || priceBdt >= 50000,
      priceBdt,
      costPriceBdt,
      inStock: data.inStock !== undefined ? data.inStock : warehouseQty > 0,
      warehouseQty,
      reorderLevel,
      badge: data.badge || null,
      description: data.description.trim(),
      specs: normalizedSpecs,
      highlights: normalizedHighlights,
      variantOptions: normalizedVariantOptions,
      guarantees: normalizedGuarantees,
      dispatchHub: data.dispatchHub !== undefined ? data.dispatchHub.trim() : "",
      priceLabel: data.priceLabel !== undefined ? data.priceLabel.trim() : "",
      features: normalizedFeatures,
      images: data.images || [],
      fits: normalizedFits,
    })
    .returning();

  if (created) {
    try {
      await db.insert(auditLog).values({
        id: `audit-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
        actorId: admin.id,
        actorEmail: admin.email,
        action: "inventory.create",
        entityType: "product",
        entityId: created.id,
        metadata: { slug: created.slug, sku, name: created.name },
        ipAddress: getClientIp(),
      });
    } catch {
      // Non-blocking
    }
  }

  return { success: true, product: created };
}

export async function deleteInventoryItemCore(slug: string) {
  const admin = await requireAdmin();
  await db.delete(productsTable).where(eq(productsTable.slug, slug));

  try {
    await db.insert(auditLog).values({
      id: `audit-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
      actorId: admin.id,
      actorEmail: admin.email,
      action: "inventory.delete",
      entityType: "product",
      entityId: slug,
      ipAddress: getClientIp(),
    });
  } catch {
    // Non-blocking
  }

  return { success: true };
}

// =============================================================================
// 5. BANNERS
// =============================================================================

export async function listBannersCore(onlyActive = false) {
  if (onlyActive) {
    return await db
      .select()
      .from(banners)
      .where(eq(banners.isActive, true))
      .orderBy(asc(banners.sortOrder));
  }
  return await db.select().from(banners).orderBy(asc(banners.sortOrder));
}

export async function saveBannerCore(data: {
  id?: string | undefined;
  title: string;
  subtitle?: string | undefined;
  imageUrl: string;
  badge?: string | undefined;
  category?: string | undefined;
  link?: string | undefined;
  isActive?: boolean | undefined;
  sortOrder?: number | undefined;
}) {
  const admin = await requireAdmin();

  if (data.id) {
    const [updated] = await db
      .update(banners)
      .set({
        title: data.title,
        subtitle: data.subtitle || null,
        imageUrl: data.imageUrl,
        badge: data.badge || null,
        category: data.category || "Commercial Machinery",
        link: data.link || "/shop?cat=Garage+Equipment",
        isActive: data.isActive !== undefined ? data.isActive : true,
        sortOrder: data.sortOrder !== undefined ? data.sortOrder : 0,
        updatedAt: new Date(),
      })
      .where(eq(banners.id, data.id))
      .returning();
    return { success: true, banner: updated };
  } else {
    const id = `ban-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    const [created] = await db
      .insert(banners)
      .values({
        id,
        title: data.title,
        subtitle: data.subtitle || null,
        imageUrl: data.imageUrl,
        badge: data.badge || null,
        category: data.category || "Commercial Machinery",
        link: data.link || "/shop?cat=Garage+Equipment",
        isActive: data.isActive !== undefined ? data.isActive : true,
        sortOrder: data.sortOrder !== undefined ? data.sortOrder : 0,
      })
      .returning();
    return { success: true, banner: created };
  }
}

export async function deleteBannerCore(id: string) {
  const admin = await requireAdmin();
  await db.delete(banners).where(eq(banners.id, id));
  return { success: true };
}

export async function reorderBannersCore(orderedIds: string[]) {
  const admin = await requireAdmin();
  for (let i = 0; i < orderedIds.length; i++) {
    const id = orderedIds[i]!;
    await db.update(banners).set({ sortOrder: i }).where(eq(banners.id, id));
  }
  return { success: true };
}

// =============================================================================
// 6. TECHNICAL UPDATES & ARTICLES
// =============================================================================

export async function listUpdatesCore(onlyPublished = false) {
  if (onlyPublished) {
    return await db
      .select()
      .from(updates)
      .where(eq(updates.isPublished, true))
      .orderBy(desc(updates.publishedAt));
  }
  return await db.select().from(updates).orderBy(desc(updates.publishedAt));
}

export async function getUpdateBySlugCore(slug: string) {
  const rows = await db.select().from(updates).where(eq(updates.slug, slug)).limit(1);
  return rows[0] || null;
}

export async function saveUpdateCore(data: {
  id?: string | undefined;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | undefined;
  coverImage?: string | undefined;
  category?: string | undefined;
  isPublished?: boolean | undefined;
}) {
  const admin = await requireAdmin();

  if (data.id) {
    const [updated] = await db
      .update(updates)
      .set({
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt || null,
        coverImage: data.coverImage || null,
        category: data.category || "Industry News",
        isPublished: data.isPublished !== undefined ? data.isPublished : true,
        updatedAt: new Date(),
      })
      .where(eq(updates.id, data.id))
      .returning();
    return { success: true, update: updated };
  } else {
    const id = `upd-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    const [created] = await db
      .insert(updates)
      .values({
        id,
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt || null,
        coverImage: data.coverImage || null,
        category: data.category || "Industry News",
        isPublished: data.isPublished !== undefined ? data.isPublished : true,
        authorId: admin.id,
      })
      .returning();
    return { success: true, update: created };
  }
}

export async function deleteUpdateCore(id: string) {
  const admin = await requireAdmin();
  await db.delete(updates).where(eq(updates.id, id));
  return { success: true };
}

// =============================================================================
// 7. USER MANAGEMENT (Admin Control)
// =============================================================================

export async function listAdminUsersCore() {
  await requireAdmin();
  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      companyName: users.companyName,
      businessType: users.businessType,
      city: users.city,
      role: users.role,
      emailVerified: users.emailVerified,
      isActive: users.isActive,
      lastLogin: users.lastLogin,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  return allUsers;
}

export async function updateUserRoleCore(data: {
  id: string;
  role?: string | undefined;
  isActive?: boolean | undefined;
}) {
  const admin = await requireAdmin();

  await db
    .update(users)
    .set({
      ...(data.role ? { role: data.role } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      updatedAt: new Date(),
    })
    .where(eq(users.id, data.id));

  const [updated] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.id, data.id))
    .limit(1);

  return { success: true, user: updated };
}

export async function deleteUserCore(id: string) {
  const admin = await requireAdmin();
  if (id === admin.id) {
    throw new Error("Cannot delete your own active administrator account.");
  }

  await db.delete(users).where(eq(users.id, id));
  return { success: true };
}

// =============================================================================
// 8. SITE SETTINGS (Key-Value Config)
// =============================================================================

export async function getSettingsCore() {
  const rows = await db.select().from(settings);
  const result: Record<string, unknown> = {};
  for (const r of rows) {
    result[r.key] = r.value;
  }
  return result;
}

export async function updateSettingsCore(settingsMap: Record<string, unknown>) {
  const admin = await requireAdmin();

  for (const [key, value] of Object.entries(settingsMap)) {
    const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    if (existing.length > 0) {
      await db
        .update(settings)
        .set({
          value,
          updatedBy: admin.id,
          updatedAt: new Date(),
        })
        .where(eq(settings.key, key));
    } else {
      await db.insert(settings).values({
        key,
        value,
        updatedBy: admin.id,
      });
    }
  }

  return { success: true, settings: await getSettingsCore() };
}

export async function getShopBannerVideoPublicCore(): Promise<{ activeVideoUrl: string }> {
  const rows = await db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, SHOP_BANNER_VIDEO_SETTING_KEY))
    .limit(1);
  const config = normalizeShopBannerVideoConfig(rows[0]?.value);
  return { activeVideoUrl: config.activeVideoUrl };
}

export async function getShopBannerVideoAdminCore(): Promise<ShopBannerVideoConfig> {
  await requireAdmin();
  const rows = await db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, SHOP_BANNER_VIDEO_SETTING_KEY))
    .limit(1);
  return normalizeShopBannerVideoConfig(rows[0]?.value);
}

export async function saveShopBannerVideoCore(input: {
  activeVideoUrl: string;
  videos?: ShopBannerVideoItem[] | undefined;
}): Promise<{ success: true; config: ShopBannerVideoConfig }> {
  const admin = await requireAdmin();
  const safeActiveUrl = sanitizeShopBannerVideoUrl(input.activeVideoUrl);

  const sanitizedList: ShopBannerVideoItem[] = [];
  if (Array.isArray(input.videos)) {
    for (const item of input.videos) {
      if (!item || typeof item.url !== "string") continue;
      const safeItemUrl = sanitizeShopBannerVideoUrl(item.url);
      sanitizedList.push({
        id: String(item.id || `shop-vid-${Date.now().toString(36)}`).trim(),
        title: String(item.title || safeItemUrl.split("/").pop() || "Shop Banner Video").trim(),
        url: safeItemUrl,
        createdAt:
          typeof item.createdAt === "string" && item.createdAt.trim()
            ? item.createdAt
            : new Date().toISOString(),
      });
    }
  }

  const config = normalizeShopBannerVideoConfig({
    activeVideoUrl: safeActiveUrl,
    videos: sanitizedList,
  });

  const existing = await db
    .select({ key: settings.key })
    .from(settings)
    .where(eq(settings.key, SHOP_BANNER_VIDEO_SETTING_KEY))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(settings)
      .set({
        value: config,
        description: "Shop page hero banner video selection (single active video)",
        updatedBy: admin.id,
        updatedAt: new Date(),
      })
      .where(eq(settings.key, SHOP_BANNER_VIDEO_SETTING_KEY));
  } else {
    await db.insert(settings).values({
      key: SHOP_BANNER_VIDEO_SETTING_KEY,
      value: config,
      description: "Shop page hero banner video selection (single active video)",
      updatedBy: admin.id,
    });
  }

  try {
    await db.insert(auditLog).values({
      id: `audit-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
      actorId: admin.id,
      actorEmail: admin.email,
      action: "shop_banner_video.update",
      entityType: "setting",
      entityId: SHOP_BANNER_VIDEO_SETTING_KEY,
      metadata: {
        activeVideoUrl: config.activeVideoUrl,
        savedVideoCount: config.videos.length,
      },
      ipAddress: getClientIp(),
    });
  } catch {
    // Non-blocking
  }

  return { success: true, config };
}

// =============================================================================
// 9. ADMIN DASHBOARD METRICS & REAL-TIME STATS
// =============================================================================

export async function getAdminStatsCore() {
  await requireAdmin();

  const [allQuotes, allBookings, allOrders, allProducts, allUsersList, allBanners, allReviews] =
    await Promise.all([
      db.select().from(quotes).orderBy(desc(quotes.createdAt)),
      db.select().from(bookings).orderBy(desc(bookings.createdAt)),
      db.select().from(orders).orderBy(desc(orders.createdAt)),
      db.select().from(productsTable).orderBy(asc(productsTable.name)),
      db.select({ id: users.id, role: users.role }).from(users),
      db.select().from(banners),
      db.select().from(reviews).orderBy(desc(reviews.createdAt)),
    ]);

  const activeBanners = allBanners.filter((b) => b.isActive).length;

  const pendingQuotes = allQuotes.filter((q) => q.status.toUpperCase() === "PENDING").length;
  const pendingBookings = allBookings.filter((b) => b.status.toUpperCase() === "PENDING").length;
  const pendingOrders = allOrders.filter((o) => o.status.toUpperCase() === "PENDING").length;
  const pendingReviews = allReviews.filter((r) => !r.isPublished).length;

  const totalRevenue = allOrders.reduce((sum, o) => {
    return sum + (o.status !== "CANCELLED" ? o.total : 0);
  }, 0);

  const lowStockProducts = allProducts.filter((p) => p.warehouseQty <= p.reorderLevel);

  // Category counts
  const categoryCounts: Record<string, number> = {};
  for (const p of allProducts) {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  }

  const categoryDistribution = Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count,
  }));

  return {
    totalQuotes: allQuotes.length,
    pendingQuotes,
    totalBookings: allBookings.length,
    pendingBookings,
    totalOrders: allOrders.length,
    pendingOrders,
    totalRevenue,
    totalProducts: allProducts.length,
    lowStockCount: lowStockProducts.length,
    activeBanners,
    totalReviews: allReviews.length,
    pendingReviews,
    totalUsers: allUsersList.length,
    customerCount: allUsersList.filter((u) => u.role === "customer").length,
    recentQuotes: allQuotes.slice(0, 5),
    recentBookings: allBookings.slice(0, 5),
    recentOrders: allOrders.slice(0, 5),
    lowStockItems: lowStockProducts.slice(0, 5),
    categoryDistribution,
  };
}

// =============================================================================
// 10. REVIEWS & TESTIMONIALS (STOREFRONT & ADMIN MANAGEMENT)
// =============================================================================

export interface SubmitPublicReviewInput {
  name: string;
  role?: string | undefined;
  workshop: string;
  equipment?: string | undefined;
  comment: string;
  title?: string | undefined;
  rating?: number | undefined;
}

export interface SaveReviewAdminInput {
  id?: string | undefined;
  name: string;
  role: string;
  workshop: string;
  equipment: string;
  comment: string;
  title?: string | undefined;
  rating?: number | undefined;
  isPublished?: boolean | undefined;
}

export function mapDbReviewToReview(row: ReviewRow): Review {
  const fallback = reviewsData.find((r) => r.id === row.id);
  const initials =
    row.name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "VR";

  return {
    id: row.id,
    name: row.name,
    role: row.role,
    workshop: row.workshop,
    equipment: row.equipment,
    comment: row.comment,
    title:
      row.title || (row.equipment ? `Review on ${row.equipment}` : "Verified Workshop Experience"),
    rating: row.rating ?? 5,
    date: row.createdAt
      ? new Date(row.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
      : fallback?.date || "Recent",
    verifiedBuyer: fallback?.verifiedBuyer ?? true,
    location: fallback?.location || "Dhaka, Bangladesh",
    badge: fallback?.badge || "Verified Workshop",
    avatarInitials: fallback?.avatarInitials || initials,
    avatarColor: fallback?.avatarColor || "from-red-600 to-rose-700",
    highlights: fallback?.highlights || [row.equipment],
    installationTag: fallback?.installationTag || "Verified Installation",
    helpfulCount: fallback?.helpfulCount || 12,
    operationalMetric: fallback?.operationalMetric || "Verified Operation",
  };
}

let reviewsTableSynced = false;
async function ensureReviewsSeeded() {
  if (reviewsTableSynced) return;
  try {
    const existing = await db.select({ id: reviews.id }).from(reviews).limit(1);
    if (existing.length === 0) {
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
            rating: r.rating || 5,
            isPublished: true,
          })
          .onConflictDoNothing();
      }
    }
    reviewsTableSynced = true;
  } catch (err) {
    console.warn("Could not auto-seed reviews:", err);
  }
}

export async function listReviewsCore(onlyPublished = false): Promise<Review[]> {
  await ensureReviewsSeeded();
  const rows = onlyPublished
    ? await db
        .select()
        .from(reviews)
        .where(eq(reviews.isPublished, true))
        .orderBy(desc(reviews.createdAt))
    : await db.select().from(reviews).orderBy(desc(reviews.createdAt));

  return rows.map(mapDbReviewToReview);
}

export async function listAdminReviewsCore(): Promise<ReviewRow[]> {
  await requireAdmin();
  await ensureReviewsSeeded();
  return await db.select().from(reviews).orderBy(desc(reviews.createdAt));
}

export async function submitPublicReviewCore(data: SubmitPublicReviewInput): Promise<ReviewRow> {
  const name = (data.name || "").trim();
  const workshop = (data.workshop || "").trim();
  const comment = (data.comment || "").trim();
  if (!name) throw new Error("Full name is required");
  if (!workshop) throw new Error("Workshop or business name is required");
  if (!comment) throw new Error("Review comment is required");

  const rating = Math.max(1, Math.min(5, Math.round(Number(data.rating) || 5)));
  const role = (data.role || "").trim() || "Workshop Managing Director";
  const equipment = (data.equipment || "").trim() || "Commercial Workshop Equipment";
  const title = (data.title || "").trim() || `Review on ${equipment}`;

  const id = `rev-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
  const [created] = await db
    .insert(reviews)
    .values({
      id,
      name,
      role,
      workshop,
      equipment,
      comment,
      title,
      rating,
      isPublished: true,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create review");
  }

  return created;
}

export async function saveReviewAdminCore(data: SaveReviewAdminInput): Promise<ReviewRow> {
  await requireAdmin();
  const name = (data.name || "").trim();
  const workshop = (data.workshop || "").trim();
  const comment = (data.comment || "").trim();
  if (!name) throw new Error("Full name is required");
  if (!workshop) throw new Error("Workshop or business name is required");
  if (!comment) throw new Error("Review comment is required");

  const rating = Math.max(1, Math.min(5, Math.round(Number(data.rating) || 5)));
  const role = (data.role || "").trim() || "Workshop Managing Director";
  const equipment = (data.equipment || "").trim() || "Commercial Machinery";
  const title =
    (data.title || "").trim() || (equipment ? `Review on ${equipment}` : "Verified Review");
  const isPublished = data.isPublished !== undefined ? Boolean(data.isPublished) : true;

  if (data.id) {
    const [updated] = await db
      .update(reviews)
      .set({
        name,
        role,
        workshop,
        equipment,
        comment,
        title,
        rating,
        isPublished,
      })
      .where(eq(reviews.id, data.id))
      .returning();
    if (!updated) throw new Error(`Review ${data.id} not found`);
    return updated;
  }

  const id = `rev-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
  const [created] = await db
    .insert(reviews)
    .values({
      id,
      name,
      role,
      workshop,
      equipment,
      comment,
      title,
      rating,
      isPublished,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create review");
  }

  return created;
}

export async function toggleReviewPublishAdminCore(data: {
  id: string;
  isPublished: boolean;
}): Promise<ReviewRow> {
  await requireAdmin();
  const [updated] = await db
    .update(reviews)
    .set({ isPublished: data.isPublished })
    .where(eq(reviews.id, data.id))
    .returning();
  if (!updated) throw new Error(`Review ${data.id} not found`);
  return updated;
}

export async function deleteReviewAdminCore(id: string): Promise<{ success: boolean; id: string }> {
  await requireAdmin();
  await db.delete(reviews).where(eq(reviews.id, id));
  return { success: true, id };
}

export async function seedDefaultReviewsCore(): Promise<{ count: number }> {
  await requireAdmin();
  let count = 0;
  for (const r of reviewsData) {
    const res = await db
      .insert(reviews)
      .values({
        id: r.id,
        name: r.name,
        role: r.role,
        workshop: r.workshop,
        equipment: r.equipment || "Commercial Equipment",
        comment: r.comment,
        title: r.title || null,
        rating: r.rating || 5,
        isPublished: true,
      })
      .onConflictDoNothing()
      .returning();
    if (res.length > 0) count++;
  }
  return { count };
}
