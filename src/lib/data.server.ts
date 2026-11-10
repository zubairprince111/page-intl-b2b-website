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
  type QuoteRow,
  type BookingRow,
  type OrderRow,
  type ProductRow,
  type BannerRow,
  type UpdateRow,
  type UserRow,
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
}) {
  const admin = await requireAdmin();

  const [updated] = await db
    .update(quotes)
    .set({
      ...(data.status ? { status: data.status.toUpperCase() } : {}),
      ...(data.reply !== undefined ? { reply: data.reply } : {}),
      ...(data.quotedPrice !== undefined ? { quotedPrice: data.quotedPrice } : {}),
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
}) {
  const admin = await requireAdmin();

  const [updated] = await db
    .update(bookings)
    .set({
      ...(data.status ? { status: data.status.toUpperCase() } : {}),
      ...(data.adminNotes !== undefined ? { adminNotes: data.adminNotes } : {}),
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

export async function listInventoryCore() {
  return await db.select().from(productsTable).orderBy(asc(productsTable.name));
}

export async function updateInventoryItemCore(data: {
  slug: string;
  name?: string | undefined;
  priceBdt?: number | undefined;
  inStock?: boolean | undefined;
  warehouseQty?: number | undefined;
  reorderLevel?: number | undefined;
  badge?: string | undefined;
  category?: string | undefined;
  description?: string | undefined;
}) {
  const admin = await requireAdmin();

  const [updated] = await db
    .update(productsTable)
    .set({
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.priceBdt !== undefined ? { priceBdt: data.priceBdt } : {}),
      ...(data.inStock !== undefined ? { inStock: data.inStock } : {}),
      ...(data.warehouseQty !== undefined ? { warehouseQty: data.warehouseQty } : {}),
      ...(data.reorderLevel !== undefined ? { reorderLevel: data.reorderLevel } : {}),
      ...(data.badge !== undefined ? { badge: data.badge } : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
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
        metadata: { slug: data.slug, priceBdt: data.priceBdt, warehouseQty: data.warehouseQty },
        ipAddress: getClientIp(),
      });
    } catch {
      // Non-blocking
    }
  }

  return { success: true, product: updated };
}

export async function createInventoryItemCore(data: {
  slug: string;
  name: string;
  brand: string;
  category: string;
  subcategory?: string | undefined;
  priceBdt: number;
  inStock?: boolean | undefined;
  warehouseQty?: number | undefined;
  reorderLevel?: number | undefined;
  badge?: string | undefined;
  description: string;
  specs?: Record<string, string> | undefined;
  features?: string[] | undefined;
  images?: string[] | undefined;
  fits?: string[] | undefined;
}) {
  const admin = await requireAdmin();
  const id = `prod-${data.slug}`;

  const [created] = await db
    .insert(productsTable)
    .values({
      id,
      slug: data.slug,
      name: data.name,
      brand: data.brand,
      category: data.category,
      subcategory: data.subcategory || null,
      priceBdt: data.priceBdt,
      inStock: data.inStock !== undefined ? data.inStock : true,
      warehouseQty: data.warehouseQty !== undefined ? data.warehouseQty : 10,
      reorderLevel: data.reorderLevel !== undefined ? data.reorderLevel : 2,
      badge: data.badge || null,
      description: data.description,
      specs: data.specs || {},
      features: data.features || [],
      images: data.images || [],
      fits: data.fits || [],
    })
    .returning();

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

// =============================================================================
// 9. ADMIN DASHBOARD METRICS & REAL-TIME STATS
// =============================================================================

export async function getAdminStatsCore() {
  await requireAdmin();

  const [allQuotes, allBookings, allOrders, allProducts, allUsersList, allBanners] =
    await Promise.all([
      db.select().from(quotes).orderBy(desc(quotes.createdAt)),
      db.select().from(bookings).orderBy(desc(bookings.createdAt)),
      db.select().from(orders).orderBy(desc(orders.createdAt)),
      db.select().from(productsTable).orderBy(asc(productsTable.name)),
      db.select({ id: users.id, role: users.role }).from(users),
      db.select().from(banners),
    ]);

  const activeBanners = allBanners.filter((b) => b.isActive).length;

  const pendingQuotes = allQuotes.filter((q) => q.status.toUpperCase() === "PENDING").length;
  const pendingBookings = allBookings.filter((b) => b.status.toUpperCase() === "PENDING").length;
  const pendingOrders = allOrders.filter((o) => o.status.toUpperCase() === "PENDING").length;

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
    totalUsers: allUsersList.length,
    customerCount: allUsersList.filter((u) => u.role === "customer").length,
    recentQuotes: allQuotes.slice(0, 5),
    recentBookings: allBookings.slice(0, 5),
    recentOrders: allOrders.slice(0, 5),
    lowStockItems: lowStockProducts.slice(0, 5),
    categoryDistribution,
  };
}
