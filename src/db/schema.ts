import { pgTable, text, integer, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";

// ----------------------------------------------------
// 1. USERS & B2B WORKSHOP ACCOUNTS
// ----------------------------------------------------
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    phone: text("phone").notNull(),
    passwordHash: text("password_hash"),
    companyName: text("company_name").notNull(),
    businessType: text("business_type").notNull().default("Workshop / Garage"),
    city: text("city").notNull().default("Dhaka"),
    role: text("role").notNull().default("customer"), // "admin" | "staff" | "customer"
    emailVerified: boolean("email_verified").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    lastLogin: timestamp("last_login", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_users_email").on(table.email), index("idx_users_role").on(table.role)],
);

// ----------------------------------------------------
// 2. ACTIVE USER SESSIONS (HTTP-Only Cookie Auth)
// ----------------------------------------------------
export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_sessions_token").on(table.token),
    index("idx_sessions_user_id").on(table.userId),
  ],
);

// ----------------------------------------------------
// 3. PRODUCTS & MACHINERY CATALOG
// ----------------------------------------------------
export const productsTable = pgTable(
  "products",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    sku: text("sku"),
    name: text("name").notNull(),
    brand: text("brand").notNull(),
    category: text("category").notNull(),
    subcategory: text("subcategory"),
    mobility: jsonb("mobility").$type<string[]>(),
    isEquipment: boolean("is_equipment").notNull().default(true),
    requiresQuote: boolean("requires_quote").notNull().default(false),
    priceBdt: integer("price_bdt").notNull().default(0),
    inStock: boolean("in_stock").notNull().default(true),
    warehouseQty: integer("warehouse_qty").notNull().default(10),
    reorderLevel: integer("reorder_level").notNull().default(2),
    badge: text("badge"),
    description: text("description").notNull(),
    specs: jsonb("specs").$type<Record<string, string> | [string, string][]>(),
    highlights: jsonb("highlights").$type<[string, string][]>(),
    variantOptions: jsonb("variant_options").$type<{ name: string; options: string[] }[]>(),
    guarantees: jsonb("guarantees").$type<{ title: string; subtitle: string }[]>(),
    dispatchHub: text("dispatch_hub"),
    priceLabel: text("price_label"),
    features: jsonb("features").$type<string[]>(),
    images: jsonb("images").$type<string[]>(),
    fits: jsonb("fits").$type<string[]>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_products_slug").on(table.slug),
    index("idx_products_category").on(table.category),
    index("idx_products_brand").on(table.brand),
  ],
);

// ----------------------------------------------------
// 4. QUOTATION REQUESTS (RFQs)
// ----------------------------------------------------
export const quotes = pgTable(
  "quotes",
  {
    id: text("id").primaryKey(),
    quoteNumber: text("quote_number"),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    companyName: text("company_name").notNull(),
    contactName: text("contact_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull(),
    productSlug: text("product_slug").notNull(),
    productName: text("product_name").notNull(),
    qty: integer("qty").notNull().default(1),
    businessType: text("business_type").notNull().default("Workshop / Garage"),
    city: text("city").notNull().default("Dhaka"),
    notes: text("notes"),
    status: text("status").notNull().default("PENDING"), // "PENDING" | "CONTACTED" | "QUOTED" | "COMPLETED" | "CANCELLED"
    reply: text("reply"),
    quotedPrice: integer("quoted_price"),
    itemsJson:
      jsonb("items_json").$type<
        { productSlug: string; productName: string; qty: number; unitPrice?: number }[]
      >(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_quotes_status").on(table.status),
    index("idx_quotes_user_id").on(table.userId),
    index("idx_quotes_created_at").on(table.createdAt),
  ],
);

// ----------------------------------------------------
// 5. CONSULTATION & BAY DEMONSTRATION BOOKINGS
// ----------------------------------------------------
export const bookings = pgTable(
  "bookings",
  {
    id: text("id").primaryKey(),
    bookingNumber: text("booking_number"),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    companyName: text("company_name").notNull(),
    contactName: text("contact_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull(),
    serviceType: text("service_type").notNull(),
    bookingDate: text("booking_date").notNull(),
    timeSlot: text("time_slot").notNull(),
    city: text("city"),
    centerId: text("center_id"),
    centerName: text("center_name"),
    notes: text("notes"),
    adminNotes: text("admin_notes"),
    status: text("status").notNull().default("PENDING"), // "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_bookings_status").on(table.status),
    index("idx_bookings_user_id").on(table.userId),
    index("idx_bookings_booking_date").on(table.bookingDate),
  ],
);

// ----------------------------------------------------
// 6. HOMEPAGE & FEATURED BANNERS
// ----------------------------------------------------
export const banners = pgTable(
  "banners",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    imageUrl: text("image_url").notNull(),
    badge: text("badge"),
    category: text("category").default("Commercial Machinery"),
    link: text("link").default("/shop?cat=Garage+Equipment"),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_banners_is_active").on(table.isActive),
    index("idx_banners_sort_order").on(table.sortOrder),
  ],
);

// ----------------------------------------------------
// 7. VERIFIED WORKSHOP REVIEWS & TESTIMONIALS
// ----------------------------------------------------
export const reviews = pgTable(
  "reviews",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    role: text("role").notNull(),
    workshop: text("workshop").notNull(),
    equipment: text("equipment").notNull(),
    comment: text("comment").notNull(),
    title: text("title"),
    rating: integer("rating").notNull().default(5),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_reviews_is_published").on(table.isPublished)],
);

// ----------------------------------------------------
// 8. UPLOADED MEDIA FILES (Products, Banners, Specs)
// ----------------------------------------------------
export const media = pgTable(
  "media",
  {
    id: text("id").primaryKey(),
    filename: text("filename").notNull(),
    originalName: text("original_name").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    url: text("url").notNull().unique(),
    category: text("category").notNull().default("products"), // "products" | "banners" | "documents" | "general"
    storageData: text("storage_data"), // Optional base64 payload for ephemeral containers (e.g. Render Free)
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_media_category").on(table.category)],
);

// ----------------------------------------------------
// 9. B2B ORDERS & TRANSACTIONS
// ----------------------------------------------------
export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
    orderNumber: text("order_number").notNull().unique(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone").notNull(),
    companyName: text("company_name"),
    shippingAddress: text("shipping_address").notNull(),
    city: text("city").notNull(),
    district: text("district"),
    postalCode: text("postal_code"),
    subtotal: integer("subtotal").notNull(),
    shippingFee: integer("shipping_fee").notNull().default(0),
    total: integer("total").notNull(),
    currency: text("currency").notNull().default("BDT"),
    status: text("status").notNull().default("PENDING"), // "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
    paymentMethod: text("payment_method").notNull().default("CASH_ON_DELIVERY"), // "CASH_ON_DELIVERY" | "BANK_TRANSFER" | "CHEQUE" | "QUOTATION_PO"
    paymentStatus: text("payment_status").notNull().default("UNPAID"), // "UNPAID" | "PAID"
    notes: text("notes"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_orders_order_number").on(table.orderNumber),
    index("idx_orders_user_id").on(table.userId),
    index("idx_orders_status").on(table.status),
    index("idx_orders_created_at").on(table.createdAt),
  ],
);

// ----------------------------------------------------
// 10. ORDER LINE ITEMS
// ----------------------------------------------------
export const orderItems = pgTable(
  "order_items",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id").references(() => productsTable.id, { onDelete: "set null" }),
    productSlug: text("product_slug").notNull(),
    productName: text("product_name").notNull(),
    productSku: text("product_sku"),
    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull().default(1),
    subtotal: integer("subtotal").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_order_items_order_id").on(table.orderId),
    index("idx_order_items_product_id").on(table.productId),
  ],
);

// ----------------------------------------------------
// 11. SITE & BUSINESS SETTINGS (Key-Value Config)
// ----------------------------------------------------
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  description: text("description"),
  updatedBy: text("updated_by").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ----------------------------------------------------
// 12. TECHNICAL UPDATES & INDUSTRY ARTICLES
// ----------------------------------------------------
export const updates = pgTable(
  "updates",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    content: text("content").notNull(),
    excerpt: text("excerpt"),
    coverImage: text("cover_image"),
    category: text("category").notNull().default("Industry News"),
    isPublished: boolean("is_published").notNull().default(true),
    authorId: text("author_id").references(() => users.id, { onDelete: "set null" }),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_updates_slug").on(table.slug),
    index("idx_updates_is_published").on(table.isPublished),
  ],
);

// ----------------------------------------------------
// 13. PASSWORD RESET TOKENS (Single-Use, Time-Limited)
// ----------------------------------------------------
export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_pw_reset_hash").on(table.tokenHash),
    index("idx_pw_reset_user").on(table.userId),
  ],
);

// ----------------------------------------------------
// 14. EMAIL VERIFICATION TOKENS
// ----------------------------------------------------
export const emailVerificationTokens = pgTable(
  "email_verification_tokens",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_email_verif_hash").on(table.tokenHash),
    index("idx_email_verif_user").on(table.userId),
  ],
);

// ----------------------------------------------------
// 15. TRANSACTIONAL EMAIL QUEUE & AUDIT LOG
// ----------------------------------------------------
export const emailLog = pgTable(
  "email_log",
  {
    id: text("id").primaryKey(),
    recipient: text("recipient").notNull(),
    subject: text("subject").notNull(),
    template: text("template").notNull(),
    status: text("status").notNull().default("QUEUED"), // "QUEUED" | "SENT" | "FAILED"
    error: text("error"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_email_log_status").on(table.status),
    index("idx_email_log_created_at").on(table.createdAt),
  ],
);

// ----------------------------------------------------
// 16. SYSTEM & ADMIN AUDIT LOG
// ----------------------------------------------------
export const auditLog = pgTable(
  "audit_log",
  {
    id: text("id").primaryKey(),
    actorId: text("actor_id").references(() => users.id, { onDelete: "set null" }),
    actorEmail: text("actor_email"),
    action: text("action").notNull(), // e.g. "order.create", "user.login", "quote.update", "settings.save"
    entityType: text("entity_type").notNull(), // "order" | "quote" | "booking" | "product" | "user" | "setting"
    entityId: text("entity_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_audit_log_action").on(table.action),
    index("idx_audit_log_entity").on(table.entityType, table.entityId),
    index("idx_audit_log_created_at").on(table.createdAt),
  ],
);

// ----------------------------------------------------
// INFERRED TYPES
// ----------------------------------------------------
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type ProductRow = typeof productsTable.$inferSelect;
export type Quote = typeof quotes.$inferSelect;
export type NewQuote = typeof quotes.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type Banner = typeof banners.$inferSelect;
export type NewBanner = typeof banners.$inferInsert;
export type ReviewRow = typeof reviews.$inferSelect;
export type NewReviewRow = typeof reviews.$inferInsert;
export type MediaRow = typeof media.$inferSelect;
export type NewMediaRow = typeof media.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type Setting = typeof settings.$inferSelect;
export type Update = typeof updates.$inferSelect;
export type NewUpdate = typeof updates.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
export type EmailLogEntry = typeof emailLog.$inferSelect;
export type AuditLogEntry = typeof auditLog.$inferSelect;

export type UserRow = User;
export type QuoteRow = Quote;
export type BookingRow = Booking;
export type BannerRow = Banner;
export type OrderRow = Order;
export type UpdateRow = Update;
