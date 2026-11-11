export interface ReportSectionNavItem {
  id: string;
  number: string;
  title: string;
  shortTitle: string;
}

export interface MetadataEntry {
  field: string;
  value: string;
}

export interface StakeholderRow {
  actor: string;
  scope: string;
  responsibilities: string;
}

export interface RequirementRow {
  id: string;
  kind: "FR" | "NFR";
  summary: string;
  module: string;
}

export interface TechStackRow {
  tier: string;
  technology: string;
  role: string;
}

export interface DiagramWalkthroughBullet {
  label: string;
  detail: string;
}

export interface ArchitectureDiagramItem {
  id: string;
  code: string;
  anchorId: string;
  title: string;
  standard: string;
  src: string;
  summary: string;
  bullets: DiagramWalkthroughBullet[];
}

export interface DatabaseTableSpec {
  index: number;
  name: string;
  domain: "Identity & Security" | "Procurement & Orders" | "Catalog & Content" | "CMS & Operations";
  primaryKey: string;
  foreignKeys: string;
  purpose: string;
}

export interface SubsystemAlgorithmSpec {
  id: string;
  title: string;
  filePaths: string;
  highlights: string[];
}

export interface SecurityControlRow {
  vector: string;
  countermeasure: string;
  verification: string;
}

export interface TestSuiteRow {
  file: string;
  count: number;
  guarantees: string;
}

export interface OperationsCommandRow {
  operation: string;
  command: string;
  effect: string;
}

export const REPORT_TOC: ReportSectionNavItem[] = [
  {
    id: "sec-1",
    number: "01",
    title: "Document Control & Executive Summary",
    shortTitle: "Executive Summary",
  },
  {
    id: "sec-2",
    number: "02",
    title: "Business Domain & No-Price Storefront",
    shortTitle: "Business & No-Price Policy",
  },
  {
    id: "sec-3",
    number: "03",
    title: "Stakeholders & System Boundaries",
    shortTitle: "Stakeholders & Personas",
  },
  {
    id: "sec-4",
    number: "04",
    title: "Requirements Traceability (FR & NFR)",
    shortTitle: "Requirements Matrix",
  },
  {
    id: "sec-5",
    number: "05",
    title: "System Architecture & Tech Stack",
    shortTitle: "Architecture & Stack",
  },
  {
    id: "sec-6",
    number: "06",
    title: "System Design & UML Diagrams (10 Views)",
    shortTitle: "UML / ERD / DFD Diagrams",
  },
  {
    id: "sec-7",
    number: "07",
    title: "Database Schema (16 PostgreSQL Tables)",
    shortTitle: "16-Table Schema Dictionary",
  },
  {
    id: "sec-8",
    number: "08",
    title: "Routing & Engineered Subsystems",
    shortTitle: "Routing & Algorithms",
  },
  {
    id: "sec-9",
    number: "09",
    title: "Security & Defense-in-Depth Controls",
    shortTitle: "Security Matrix",
  },
  {
    id: "sec-10",
    number: "10",
    title: "Quality Assurance & Testing Matrix",
    shortTitle: "QA & Test Coverage",
  },
  {
    id: "sec-11",
    number: "11",
    title: "Deployment, Backup & Operations Runbook",
    shortTitle: "Ops & Deployment",
  },
  { id: "sec-12", number: "12", title: "Known Boundaries & Future Roadmap", shortTitle: "Roadmap" },
];

export const REPORT_METADATA: MetadataEntry[] = [
  {
    field: "System Name",
    value: "PAGE International B2B Workshop Equipment & Procurement Platform",
  },
  {
    field: "Application Architecture",
    value:
      "Full-Stack Server-Side Rendered (SSR) React 19 + TanStack Start + Nitro 3 (node-server)",
  },
  {
    field: "Database Dual-Engine",
    value:
      "PostgreSQL 16 (postgres-js, pool max: 10) in production; Embedded @electric-sql/pglite (.data/postgres) when DATABASE_URL is unset",
  },
  {
    field: "ORM & Migration Layer",
    value: "Drizzle ORM 0.45.4 + Drizzle Kit 0.31.11 (16 normalized PostgreSQL tables)",
  },
  {
    field: "Edge Reverse Proxy",
    value:
      "Caddy 2 (caddy:2-alpine) with automated ACME TLS, zstd/gzip, security headers & /uploads/* caching",
  },
  {
    field: "Diagram Standards",
    value:
      "UML 2.5 (Use Case, Class, Activity, Sequence, State Machine, Component/Deployment), Crow's Foot ERD, Yourdon/Gane-Sarson DFD (Levels 0 & 1)",
  },
  {
    field: "Automated Test Coverage",
    value:
      "Vitest unit/integration suite, Playwright Chromium E2E specs, ESLint & Prettier formatting",
  },
];

export const NO_PRICE_INVARIANTS: Array<{ area: string; enforcement: string }> = [
  {
    area: "UI Presentation",
    enforcement:
      "Public catalog cards (ProductCard.tsx), hero showcase (EquipmentFanStack.tsx), and detail pages (/shop/$slug) display commercial availability (In stock / Low stock / Out of stock), dispatch hub (Dhaka Central Hub), ordered technical highlights, variants, and 'Request Official Quote' CTAs rather than monetary figures.",
  },
  {
    area: "Label Sanitization",
    enforcement:
      "normalizeStorefrontPriceLabel() intercepts legacy placeholder strings such as 'B2B Unit Price' and normalizes them to 'Pro-Forma B2B'.",
  },
  {
    area: "SEO Schema.org Hardening",
    enforcement:
      "buildProductJsonLdOffers() emits valid Offer JSON-LD metadata (url, availability, seller) while strictly omitting price and priceCurrency fields so search engines never index stale prices.",
  },
];

export const STAKEHOLDERS: StakeholderRow[] = [
  {
    actor: "Public Visitor / Workshop Buyer",
    scope: "Unauthenticated (role: guest)",
    responsibilities:
      "Browses catalog & articles, queries prefix-first autocomplete search, filters by mobility & category, inspects interactive product zoom, views specs/variants/guarantees, manages local Quotation Cart (CartProvider), submits single-product or multi-item RFQs (with optional Email OTP), and books live bay demonstrations.",
  },
  {
    actor: "Registered B2B Client",
    scope: "Authenticated (role: customer)",
    responsibilities:
      "Inherits all Workshop Buyer capabilities (UML Actor Generalization); logs in via page_session HTTP-only cookie, manages saved garage vehicle context, places zero-trust B2B checkout orders (/checkout), and tracks personal quotes, demo bookings, and order statuses in /account.",
  },
  {
    actor: "Platform Administrator",
    scope: "Authenticated (role: admin or staff)",
    responsibilities:
      "Manages all workspaces under /admin/*: live dashboard telemetry (15s poll), CRUD inventory with ordered specs/highlights/variants/guarantees, commercial RFQ pricing & Pro-Forma draft generation, consultation slot confirmations, homepage banners, single-active Shop Banner Video configuration, /api/media/upload binary asset curation, technical updates CMS, customer activation toggles, and platform settings.",
  },
  {
    actor: "Email Gateway (External System)",
    scope: "Outbound Infrastructure",
    responsibilities:
      "Dual-provider SMTP (Nodemailer supporting Gmail App Passwords on port 587/465) or Resend HTTPS REST API (api.resend.com/emails) selected automatically by getEmailProvider(), logging terminal delivery states (QUEUED -> SENT / FAILED) to email_log.",
  },
];

export const REQUIREMENTS: RequirementRow[] = [
  {
    id: "FR-01",
    kind: "FR",
    summary: "Dual-mode Catalog Browsing & No-Price Storefront",
    module: "src/routes/shop.index.tsx, src/routes/shop.$slug.tsx, src/lib/product-utils.ts",
  },
  {
    id: "FR-02",
    kind: "FR",
    summary:
      "Prefix-First Live Autocomplete Shop Search (1-char prefix -> 2+ char spec expansion, grouped categories/brands/keywords/products + match highlights)",
    module: "src/lib/shop-search.ts, src/test/shop-search.test.ts",
  },
  {
    id: "FR-03",
    kind: "FR",
    summary:
      "Interactive Product Image Zoom Modal (1x-4x cursor-anchored wheel zoom, pinch-to-zoom, click-toggle 100% <-> 200%, bounded pan drag, gallery thumbnails) & Desktop Hover-Lens",
    module:
      "src/lib/image-zoom.ts, src/components/site/ProductImageZoomModal.tsx, src/test/image-zoom.test.tsx",
  },
  {
    id: "FR-04",
    kind: "FR",
    summary:
      "Multi-Attribute Variant Groups, Highlights & Guarantee Badges with ordered spec tuple normalization & bulk spec paste parser",
    module: "src/lib/product-utils.ts, src/test/product-specs.test.ts",
  },
  {
    id: "FR-05",
    kind: "FR",
    summary: "Single-Item & Multi-Item Cart Quotation Request (RFQ) Workflow (QuoteModal & /cart)",
    module: "src/components/QuoteModal.tsx, src/routes/cart.tsx, src/lib/cart.tsx",
  },
  {
    id: "FR-06",
    kind: "FR",
    summary:
      "Conditional 6-Digit Email OTP Challenge (REQUIRE_QUOTE_EMAIL_OTP=auto|true|false) with 10-minute TTL, 5-attempt lockout, and OTP slot rollback if email dispatch fails",
    module: "src/lib/otp.server.ts, src/test/quote-otp.test.ts",
  },
  {
    id: "FR-07",
    kind: "FR",
    summary:
      "Admin Pro-Forma Commercial Quote Response & Automated Gmail/Mailto Draft Report Builder",
    module: "src/routes/admin/quotes.tsx, src/lib/quotation-email.ts",
  },
  {
    id: "FR-08",
    kind: "FR",
    summary:
      "Workshop Bay & Engineering Consultation Scheduling (/services/book, /consultation) with center assignment & status transitions",
    module: "src/routes/services.book.tsx, src/routes/admin/bookings.tsx",
  },
  {
    id: "FR-09",
    kind: "FR",
    summary:
      "Zero-Trust Server-Side Order Pricing & Inventory Deduction (subtotal >= 50,000 BDT free shipping, otherwise 500 BDT)",
    module: "src/lib/data.server.ts, src/test/order-pricing.test.ts",
  },
  {
    id: "FR-10",
    kind: "FR",
    summary:
      "B2B Authentication Portal (bcrypt cost 12, 256-bit page_session HTTP-only cookie, registration, SHA-256 single-use 1-hour password reset, /account dashboard)",
    module: "src/lib/auth.server.ts, src/routes/login.tsx, src/routes/account.tsx",
  },
  {
    id: "FR-11",
    kind: "FR",
    summary:
      "Admin Single-Active Shop Banner Video Switcher (settings.shop_banner_video, preset & custom gallery, clean zero-clutter looping player)",
    module:
      "src/lib/shop-banner-video.ts, src/routes/admin/banners.tsx, src/test/shop-banner-video.test.ts",
  },
  {
    id: "FR-12",
    kind: "FR",
    summary:
      "Binary Multipart Media Upload Pipeline (POST /api/media/upload + GET /uploads/* RFC 9110 byte-range/ETag server) verifying JPEG/PNG/WEBP/GIF/PDF/MP4/WebM magic bytes",
    module: "src/lib/media-http.server.ts, src/lib/media-magic.ts, src/lib/uploads.server.ts",
  },
  {
    id: "NFR-01",
    kind: "NFR",
    summary:
      "Security & Zero-Trust Integrity: bcrypt cost >= 12, SHA-256 hashed reset tokens (+1h TTL), HTTP-only SameSite=Lax cookies, requireAdmin() guards & audit_log IP trails",
    module: "src/lib/auth.server.ts, src/lib/audit.server.ts",
  },
  {
    id: "NFR-02",
    kind: "NFR",
    summary:
      "Upload & File Safety: Magic-byte inspection rejects spoofed SVG/script payloads; canonical path checks enforce containment in public/uploads/; caps 50 MB / 100 MB",
    module: "src/lib/media-magic.ts, src/test/media-security.test.ts",
  },
  {
    id: "NFR-03",
    kind: "NFR",
    summary:
      "Resilience & Anti-Abuse: Sliding-window IP/email rate limiting (5/60s login, 3/300s register/reset, 8/60s IP & 4/300s email OTP) + silent honeypot delay trapping",
    module: "src/lib/rate-limiter.ts, src/test/rate-limiter.test.ts",
  },
  {
    id: "NFR-04",
    kind: "NFR",
    summary:
      "Portability & Developer Ergonomics: Dual-driver Drizzle abstraction connects to PostgreSQL 16 (DATABASE_URL) or seamlessly runs embedded PGlite (.data/postgres)",
    module: "src/db/index.ts, src/db/schema.ts",
  },
  {
    id: "NFR-05",
    kind: "NFR",
    summary:
      "Media Delivery Performance: Caddy serves /assets/* and /uploads/* with max-age=31536000, immutable + zstd/gzip; Nitro handles HTTP 206 Partial Content byte ranges",
    module: "Caddyfile, src/lib/uploads.server.ts",
  },
  {
    id: "NFR-06",
    kind: "NFR",
    summary:
      "Resilient Error Handling: Custom Nitro wrapper (src/server.ts) normalizes swallowed h3 JSON 500s into branded HTML diagnostics and serves GET /api/health",
    module: "src/server.ts, src/lib/error-page.ts",
  },
];

export const TECH_STACK: TechStackRow[] = [
  {
    tier: "Frontend Framework",
    technology:
      "React 19.2.0, TypeScript 5.8.3, Tailwind CSS v4.2.1, Radix UI, Lucide Icons 0.575.0",
    role: "Component rendering, accessible dialogs/drawers/accordions, responsive mobile-first workshop UI",
  },
  {
    tier: "Routing & Data Fetching",
    technology: "TanStack Start 1.168.60, TanStack Router 1.170.41, TanStack Query 5.101.1",
    role: "Type-safe file routing, SSR loaders, typed URL search params (q, cat, brand, mobility), RPC server functions, 15s admin sync",
  },
  {
    tier: "Validation & Forms",
    technology: "Zod 3.25.76, React Hook Form 7.71.2, input-otp",
    role: "Runtime schema validation contracts across UI forms and server RPC boundaries",
  },
  {
    tier: "SSR Runtime Server",
    technology: "Vite 8.1.5 + Nitro 3.0.260603-beta (node-server on :8080)",
    role: "Production Node 22 Alpine SSR engine handling /api/health, /api/media/upload, and /uploads/* RFC 9110 byte ranges",
  },
  {
    tier: "Persistence & ORM",
    technology:
      "PostgreSQL 16-alpine (postgres 4.1.0), @electric-sql/pglite 0.5.15, Drizzle ORM 0.45.4",
    role: "16 normalized tables + typed JSONB structures (specs, highlights, variantOptions, guarantees, itemsJson)",
  },
  {
    tier: "Messaging & Documents",
    technology: "Nodemailer 10.4.0, Resend HTTPS API, docx 9.15.3",
    role: "Transactional RFQ/OTP/booking emails with failure redaction + client commercial document export",
  },
  {
    tier: "Edge Proxy & Containers",
    technology: "Docker Compose, Caddy 2-alpine (Caddyfile), postgresql-client",
    role: "Automated TLS ACME proxy on :80/:443, immutable media caching, security headers, isolated internal network",
  },
  {
    tier: "Verification Tooling",
    technology:
      "Vitest 4.1.10, Testing Library React 16.0.0, Playwright 1.65.0, ESLint 9.32.0, Prettier 3.7.3",
    role: "Unit/integration suites, DOM interaction tests, Chromium/Edge E2E browser journeys",
  },
];

export const ARCHITECTURE_DIAGRAMS: ArchitectureDiagramItem[] = [
  {
    id: "diag-01",
    code: "Figure 6.1",
    anchorId: "diagram-use-case",
    title: "Figure 6.1 — UML 2.5 Use Case Diagram",
    standard: "IEEE / OMG UML 2.5",
    src: "/docs/diagrams/01-use-case-diagram.svg",
    summary:
      "Models external human & machine actors against the PAGE system boundary across Storefront, Admin Operations, and Security Infrastructure subsystems.",
    bullets: [
      {
        label: "Actors & Generalization",
        detail:
          "A hollow generalization triangle connects Registered B2B Client --|> Public Visitor / Workshop Buyer, formalizing inheritance of browsing, search, zoom inspection, cart staging, RFQ submission, and booking workflows while gating zero-trust order checkout behind auth.",
      },
      {
        label: "Subsystem Packaging",
        detail:
          "Dashed boundaries partition Storefront & Procurement, Administrative Operations & CMS, and Security, Verification & Infrastructure Services.",
      },
      {
        label: "«extend» vs «include»",
        detail:
          "Inspect Interactive Image Zoom View optionally extends Browse Catalog, whereas Submit Single / Cart Commercial RFQ strictly includes Verify 6-Digit Email OTP & Rate Limit and Write Immutable Audit.",
      },
    ],
  },
  {
    id: "diag-02",
    code: "Figure 6.2",
    anchorId: "diagram-class",
    title: "Figure 6.2 — UML 2.5 Class & Domain Model Diagram",
    standard: "IEEE / OMG UML 2.5",
    src: "/docs/diagrams/02-class-diagram.svg",
    summary:
      "Three-compartment classes, typed visibility modifiers, service interfaces, and composition/aggregation multiplicities grouped into 4 UML packages.",
    bullets: [
      {
        label: "Four UML Packages",
        detail:
          "Partitions domain types across pkg::Identity & Auth, pkg::Catalog, Search & Zoom, pkg::Procurement, RFQ & Orders, and pkg::CMS, Email & Observability.",
      },
      {
        label: "Composition & Aggregation",
        detail:
          "User 1 ◆-> 0..* Session, Product 1 ◆-> 0..* ProductVariantGroup / ProductGuaranteeBadge, Order 1 ◆-> 1..* OrderItem, and CartProvider ◇-> 0..* Product aggregation.",
      },
      {
        label: "Interface Realization",
        detail:
          "SmtpEmailProvider and ResendEmailProvider both realize «interface» EmailProvider (+ send(p: EmailPayload)), decoupling email transport from domain workflows.",
      },
    ],
  },
  {
    id: "diag-03",
    code: "Figure 6.3",
    anchorId: "diagram-activity-rfq",
    title: "Figure 6.3 — UML 2.5 Activity Diagram: RFQ Submission & Conditional OTP",
    standard: "IEEE / OMG UML 2.5",
    src: "/docs/diagrams/03-activity-diagram-rfq-otp.svg",
    summary:
      "Three-swimlane activity trace detailing honeypot detection, rate limiting, conditional 6-digit OTP verification with dispatch rollback, and parallel fork/join DB & email commit.",
    bullets: [
      {
        label: "Validation & Honeypot Guards",
        detail:
          "Bot traps return simulated confirmation references and terminate cleanly via a UML Flow Final node (⊗) with zero database writes.",
      },
      {
        label: "Conditional OTP & Rollback",
        detail:
          "Evaluates [REQUIRE_QUOTE_EMAIL_OTP = on?]; if enabled and mail transport fails, deletes the stored OTP slot immediately so buyers are never falsely rate-locked.",
      },
      {
        label: "Concurrent Fork / Join",
        detail:
          "Executes INSERT quotes (PENDING), INSERT audit_log, and client/admin email alerts concurrently before joining to display RFQ-YYYY-XXXX.",
      },
    ],
  },
  {
    id: "diag-04",
    code: "Figure 6.4",
    anchorId: "diagram-activity-media",
    title: "Figure 6.4 — UML 2.5 Activity Diagram: Inventory Curation & Binary Media Upload",
    standard: "IEEE / OMG UML 2.5",
    src: "/docs/diagrams/04-activity-diagram-inventory-media.svg",
    summary:
      "End-to-end admin inventory and banner video workflow combining multipart streaming uploads, raw magic-byte validation, canonical containment, and query invalidation.",
    bullets: [
      {
        label: "Preset vs Multipart File Drop",
        detail:
          "Files up to 50 MB (images/PDF) or 100 MB (MP4/WebM) stream via multipart/form-data to POST /api/media/upload without Base64 RPC bloat.",
      },
      {
        label: "Zero-Trust Server Media Guard",
        detail:
          "Validates admin RBAC, inspects raw binary headers via validateMediaMagicBytes() (blocking SVGs/executables), asserts containment in public/uploads/<cat>/, and writes random hex filenames.",
      },
      {
        label: "Catalog Cache Convergence",
        detail:
          "Product mutations normalize specs/variants/guarantees and sanitize priceLabel before invalidating ['inventory', 'catalog', 'shop-banner-video'].",
      },
    ],
  },
  {
    id: "diag-05",
    code: "Figure 6.5",
    anchorId: "diagram-sequence-rfq",
    title: "Figure 6.5 — UML 2.5 Sequence Diagram: Commercial RFQ, OTP & Pro-Forma Reply",
    standard: "IEEE / OMG UML 2.5",
    src: "/docs/diagrams/05-sequence-diagram-rfq-otp.svg",
    summary:
      "Chronological interaction across 7 lifelines using alt/par combined fragments from initial RFQ modal open through OTP challenge and admin 15s live poll Pro-Forma quoting.",
    bullets: [
      {
        label: "alt Combined Fragment",
        detail:
          "Queries getQuoteSubmissionConfigServerFn() to branch cleanly between verified Email OTP verification (steps 3-8) and direct RFQ submission (step 9b).",
      },
      {
        label: "par Combined Fragment",
        detail:
          "Executes atomic quote/audit DB insertion in parallel with SMTP/Resend client confirmation and admin desk alert emails.",
      },
      {
        label: "Admin 15s Poll & Draft Generation",
        detail:
          "Reflects real-time quote synchronization in /admin/quotes (15s interval) and Pro-Forma pricing reply + Gmail/Mailto commercial composer.",
      },
    ],
  },
  {
    id: "diag-06",
    code: "Figure 6.6",
    anchorId: "diagram-sequence-auth",
    title: "Figure 6.6 — UML 2.5 Sequence Diagram: Auth, SSR Hydration & Zero-Trust Order Engine",
    standard: "IEEE / OMG UML 2.5",
    src: "/docs/diagrams/06-sequence-diagram-auth-catalog.svg",
    summary:
      "Three ref/seq interaction blocks covering login cookie issuance, SSR catalog no-price redaction, and server-recalculated B2B order placement.",
    bullets: [
      {
        label: "seq Authentication & RBAC",
        detail:
          "Enforces login rate limits (5/60s), bcrypt cost 12 comparison, 256-bit sessions token creation (30d TTL), audit_log write, and HTTP-only SameSite=Lax cookies.",
      },
      {
        label: "seq SSR Catalog & No-Price UI",
        detail:
          "Hydrates catalog products and settings.shop_banner_video during SSR while stripping public priceBdt values across UI components and JSON-LD.",
      },
      {
        label: "seq Zero-Trust Server Order Pricing",
        detail:
          "Checkout submits only SKU slugs and quantities; createOrderCore loads authoritative DB priceBdt rows, applies 50,000 BDT free-shipping threshold, deducts warehouseQty, and clears CartContext.",
      },
    ],
  },
  {
    id: "diag-07",
    code: "Figure 6.7",
    anchorId: "diagram-erd",
    title: "Figure 6.7 — Crow's Foot Entity-Relationship Diagram (All 16 Tables)",
    standard: "Crow's Foot ERD",
    src: "/docs/diagrams/07-erd-database-schema.svg",
    summary:
      "Complete physical schema covering all 16 Drizzle ORM tables grouped into four domains with PK, FK, UK indicators, delete behaviors, and authentic Crow's Foot cardinality.",
    bullets: [
      {
        label: "All 16 Tables Accounted For",
        detail:
          "Covers users, sessions, password_reset_tokens, email_verification_tokens, audit_log, settings, quotes, bookings, orders, order_items, products, reviews, updates, banners, media, and email_log.",
      },
      {
        label: "Referential Delete Policies",
        detail:
          "Applies ON DELETE CASCADE for owned sessions, auth tokens, and order_items, while using ON DELETE SET NULL on historical commercial quotes, orders, bookings, and forensic audit logs.",
      },
      {
        label: "Authentic Crow's Foot Notation",
        detail:
          "Mandatory one (||), optional zero/one (|o), mandatory many (|<), and optional zero/many (o<) relationship terminators.",
      },
    ],
  },
  {
    id: "diag-08",
    code: "Figure 6.8",
    anchorId: "diagram-state",
    title: "Figure 6.8 — UML 2.5 State Machine Diagrams: Lifecycle Transitions",
    standard: "IEEE / OMG UML 2.5",
    src: "/docs/diagrams/08-state-machine-diagrams.svg",
    summary:
      "Models formal state lifecycles for Quote, Booking, Composite/Orthogonal Order + Payment, EmailLog, and ephemeral QuoteOtpSlot buckets.",
    bullets: [
      {
        label: "Quote & Booking Workflows",
        detail:
          "Quote transitions PENDING -> CONTACTED -> QUOTED -> COMPLETED (or CANCELLED); Booking follows PENDING -> CONFIRMED -> COMPLETED (or CANCELLED).",
      },
      {
        label: "Orthogonal Order Composite Region",
        detail:
          "Primary fulfillment states (PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED) operate concurrently above a dashed orthogonal partition managing Order::paymentStatus (UNPAID -> PAID).",
      },
      {
        label: "EmailLog & Ephemeral OTP",
        detail:
          "Tracks durable transactional mail queue states (QUEUED -> SENT | FAILED) alongside bounded 10m / 5-attempt in-memory OTP slots.",
      },
    ],
  },
  {
    id: "diag-09",
    code: "Figure 6.9",
    anchorId: "diagram-dfd",
    title: "Figure 6.9 — Data Flow Diagrams (Level 0 Context & Level 1 Decomposition)",
    standard: "Yourdon / Gane-Sarson DFD",
    src: "/docs/diagrams/09-dfd-level-0-and-1.svg",
    summary:
      "Context boundary (Process 0.0) and balanced Level 1 logical breakdown (Processes 1.0–6.0) connected to four numbered Gane-Sarson open-ended data stores.",
    bullets: [
      {
        label: "Level 0 Context Diagram",
        detail:
          "Captures macro flows between External Entities (Workshop Buyer, Registered Client, Platform Admin, Email Gateway) and the holistic B2B Procurement Platform.",
      },
      {
        label: "Level 1 Logical Decomposition",
        detail:
          "Expands into 1.0 Catalog & Prefix Search, 2.0 RFQ & OTP, 3.0 Bay Booking, 4.0 Zero-Trust Order Engine, 5.0 Auth & Password Reset, and 6.0 Inventory/Video/Media CMS.",
      },
      {
        label: "Balanced Data Stores",
        detail:
          "Maps strictly across D1 (Products, Banners & Media), D2 (Users, Sessions & Auth Tokens), D3 (Quotes, Bookings & Orders), and D4 (Settings, Updates & Audit/Mail Logs).",
      },
    ],
  },
  {
    id: "diag-10",
    code: "Figure 6.10",
    anchorId: "diagram-deployment",
    title: "Figure 6.10 — UML 2.5 Component & 3D Deployment Architecture",
    standard: "IEEE / OMG UML 2.5",
    src: "/docs/diagrams/10-component-deployment-architecture.svg",
    summary:
      "Physical container topology modeling Client Browser, Caddy 2 ACME Edge Proxy, Nitro SSR Container, PostgreSQL 16 Container, Persistent Volumes, and External Mail Providers.",
    bullets: [
      {
        label: "3D Deployment Nodes",
        detail:
          "Client Web Browser -> «container: page_caddy» (:80/:443 TLS) -> «container: page_app» (Nitro Node 22 on :8080) -> «container: page_postgres» (:5432).",
      },
      {
        label: "Internal Docker Bridge & Volumes",
        detail:
          "Mounted persistent volumes cover caddy_data / config, postgres_data, and shared uploads_data (/app/public/uploads read-write on page_app, read-only on page_caddy).",
      },
      {
        label: "Healthcheck & Failover Mode",
        detail:
          "Exposes GET /api/health every 20s and falls back transparently to embedded @electric-sql/pglite in zero-config development environments.",
      },
    ],
  },
];

export const DATABASE_TABLES: DatabaseTableSpec[] = [
  {
    index: 1,
    name: "users",
    domain: "Identity & Security",
    primaryKey: "id (text)",
    foreignKeys: "—",
    purpose:
      "Workshop buyer & admin credentials: unique email, password_hash (bcrypt cost 12), role (admin|staff|customer), company_name, business_type, city, email_verified, is_active, last_login.",
  },
  {
    index: 2,
    name: "sessions",
    domain: "Identity & Security",
    primaryKey: "id (text)",
    foreignKeys: "user_id -> users.id (cascade)",
    purpose:
      "256-bit cryptographically random session token (unique) backing HTTP-only page_session cookies with 30-day expires_at.",
  },
  {
    index: 3,
    name: "products",
    domain: "Catalog & Content",
    primaryKey: "id (text)",
    foreignKeys: "—",
    purpose:
      "Master catalog: unique slug, sku, name, brand, category, subcategory, JSONB mobility[], is_equipment, requires_quote, price_bdt (server-only), warehouse_qty, reorder_level, specs/highlights, variant_options, guarantees, dispatch_hub, price_label, features[], images[], fits[].",
  },
  {
    index: 4,
    name: "quotes",
    domain: "Procurement & Orders",
    primaryKey: "id (text)",
    foreignKeys: "user_id -> users.id (set null)",
    purpose:
      "Captures B2B RFQs (quote_number e.g. RFQ-2026-...), buyer metadata, single SKU fallback (product_slug, qty), multi-item JSONB items_json, lifecycle status, admin quoted_price, and commercial reply.",
  },
  {
    index: 5,
    name: "bookings",
    domain: "Procurement & Orders",
    primaryKey: "id (text)",
    foreignKeys: "user_id -> users.id (set null)",
    purpose:
      "Workshop bay consultation & machinery live demo appointments: booking_number, service_type, booking_date, time_slot, center_id, center_name, status, admin_notes.",
  },
  {
    index: 6,
    name: "banners",
    domain: "CMS & Operations",
    primaryKey: "id (text)",
    foreignKeys: "—",
    purpose:
      "Homepage hero & promotional slide CMS (title, subtitle, image_url, badge, category, link, is_active, sort_order).",
  },
  {
    index: 7,
    name: "reviews",
    domain: "Catalog & Content",
    primaryKey: "id (text)",
    foreignKeys: "user_id -> users.id (set null)",
    purpose:
      "Verified workshop testimonials (name, role, workshop, equipment, comment, rating, is_published).",
  },
  {
    index: 8,
    name: "media",
    domain: "CMS & Operations",
    primaryKey: "id (text)",
    foreignKeys: "—",
    purpose:
      "Registry of binary uploads stored on disk: filename, original_name, mime_type, size_bytes, unique url (/uploads/...), category (products|banners|documents|general).",
  },
  {
    index: 9,
    name: "orders",
    domain: "Procurement & Orders",
    primaryKey: "id (text)",
    foreignKeys: "user_id -> users.id (set null)",
    purpose:
      "Server-validated B2B checkout transactions: unique order_number, shipping address, authoritative subtotal, shipping_fee, total (BDT), status, payment_method, payment_status, JSONB metadata.",
  },
  {
    index: 10,
    name: "order_items",
    domain: "Procurement & Orders",
    primaryKey: "id (text)",
    foreignKeys: "order_id -> orders.id (cascade); product_id -> products.id (set null)",
    purpose:
      "Immutable purchase line snapshots preserving product_slug, product_name, product_sku, server-verified unit_price, quantity, and line subtotal.",
  },
  {
    index: 11,
    name: "settings",
    domain: "CMS & Operations",
    primaryKey: "key (text)",
    foreignKeys: "updated_by -> users.id (set null)",
    purpose:
      "Key-value JSONB configuration store; notably powers shop_banner_video (ShopBannerVideoConfig: activeVideoUrl + gallery list) and corporate config.",
  },
  {
    index: 12,
    name: "updates",
    domain: "Catalog & Content",
    primaryKey: "id (text)",
    foreignKeys: "author_id -> users.id (set null)",
    purpose:
      "Technical newsroom & field dispatch articles (title, unique slug, content, excerpt, cover_image, category, is_published, published_at).",
  },
  {
    index: 13,
    name: "password_reset_tokens",
    domain: "Identity & Security",
    primaryKey: "id (text)",
    foreignKeys: "user_id -> users.id (cascade)",
    purpose:
      "SHA-256 token_hash (never plaintext), 1-hour expires_at, single-use used_at guard (invalidates active sessions on password reset).",
  },
  {
    index: 14,
    name: "email_verification_tokens",
    domain: "Identity & Security",
    primaryKey: "id (text)",
    foreignKeys: "user_id -> users.id (cascade)",
    purpose:
      "Schema support for email ownership verification hashes (token_hash, expires_at, used_at).",
  },
  {
    index: 15,
    name: "email_log",
    domain: "CMS & Operations",
    primaryKey: "id (text)",
    foreignKeys: "—",
    purpose:
      "Persistent transactional dispatch journal recording recipient, subject, template, status (QUEUED|SENT|FAILED), redacted error, and sent_at.",
  },
  {
    index: 16,
    name: "audit_log",
    domain: "Identity & Security",
    primaryKey: "id (text)",
    foreignKeys: "actor_id -> users.id (set null)",
    purpose:
      "Forensic security & admin mutation ledger logging actor_email, action, entity_type, entity_id, JSONB metadata, ip_address, and user_agent.",
  },
];

export const ROUTE_GROUPS: Array<{ title: string; badge: string; routes: string[] }> = [
  {
    title: "Public Storefront & Corporate Pages",
    badge: "Guest Accessible",
    routes: [
      "/ (index.tsx)",
      "/shop (shop.index.tsx)",
      "/shop/$slug (shop.$slug.tsx)",
      "/cart (cart.tsx)",
      "/checkout (checkout.tsx)",
      "/solutions (solutions.tsx)",
      "/vehicles (vehicles.tsx)",
      "/services/book (services.book.tsx)",
      "/consultation (consultation.tsx)",
      "/service-centers (service-centers.tsx)",
      "/updates (updates.tsx)",
      "/support (support.tsx)",
      "/warranty (warranty.tsx)",
      "/about (about.tsx)",
      "/privacy (privacy.tsx)",
      "/terms (terms.tsx)",
      "/docs (docs.tsx)",
    ],
  },
  {
    title: "Client Portal & Authentication",
    badge: "page_session Cookie",
    routes: ["/login (login.tsx)", "/account (account.tsx)"],
  },
  {
    title: "Protected Admin Console",
    badge: "requireAdmin() RBAC",
    routes: [
      "/admin/login (admin/login.tsx)",
      "/admin (admin/index.tsx)",
      "/admin/inventory (admin/inventory.tsx)",
      "/admin/quotes (admin/quotes.tsx)",
      "/admin/bookings (admin/bookings.tsx)",
      "/admin/banners (admin/banners.tsx)",
      "/admin/media (admin/media.tsx)",
      "/admin/updates (admin/updates.tsx)",
      "/admin/users (admin/users.tsx)",
      "/admin/database (admin/database.tsx)",
      "/admin/settings (admin/settings.tsx)",
    ],
  },
];

export const SUBSYSTEM_ALGORITHMS: SubsystemAlgorithmSpec[] = [
  {
    id: "alg-search",
    title: "A. Prefix-First Autocomplete Shop Search",
    filePaths: "src/lib/shop-search.ts · src/test/shop-search.test.ts",
    highlights: [
      "buildProductSearchIndex(catalog) pre-extracts normalized lowercase fields per SKU across name, brand, category, subcategory, mobility, fits, specs, highlights, and features.",
      "Single-Character Mode (q.length === 1, e.g. 'h'): matches strictly on word prefixes, SKU/brand/category prefixes, and vehicle-fit tokens without mid-word spec noise.",
      "Multi-Character Mode (q.length >= 2, e.g. 'he'): expands into spec/description relevance, scoring prefix hits higher than boundary hits and generating XSS-safe splitHighlightSegments() spans.",
    ],
  },
  {
    id: "alg-zoom",
    title: "B. Interactive Product Image Zoom & Pointer Math",
    filePaths: "src/lib/image-zoom.ts · src/components/site/ProductImageZoomModal.tsx",
    highlights: [
      "Dual Experience: Desktop cursors trigger live bounded hover magnification (computeHoverOriginPercent), while click/trigger launches ProductImageZoomModal.",
      "Pointer-Anchored Wheel Zoom (1.0x-4.0x): computeZoomAroundPoint() holds the inspected pixel locked beneath the cursor instead of snapping to frame center.",
      "Clamped Pan & Pinch: clampPanOffset() bounds drag translation inside magnified viewport dimensions; supports pinch distance scaling, click 100%<->200% toggle, Escape focus restore, and keyboard shortcuts.",
    ],
  },
  {
    id: "alg-video",
    title: "C. Single-Active Shop Banner Video CMS",
    filePaths: "src/lib/shop-banner-video.ts · src/routes/admin/banners.tsx",
    highlights: [
      "Persisted in PostgreSQL settings (key = 'shop_banner_video') with strict URL sanitization rejecting control chars, javascript:, backslashes, and protocol-relative // URLs.",
      "Admin Curation: Allows choosing pre-bundled workshop loops (PRESET_SHOP_BANNER_VIDEOS), custom URLs, or uploading binary MP4/WebM files via POST /api/media/upload (<= 100 MB).",
      "Storefront Discipline: Guarantees strictly one active silent looping showcase video at a time on /shop with zero overlaid play/pause button clutter.",
    ],
  },
  {
    id: "alg-specs",
    title: "D. Spec Tuples, Variants & Pro-Forma Commercial Helpers",
    filePaths: "src/lib/product-utils.ts · src/lib/quotation-email.ts",
    highlights: [
      "Normalizes both legacy Record<string, string> JSONB specs and ordered [string, string][] tuples while preserving canonical fallback spec ordering (resolveOrderedSpecs).",
      "Bulk multi-delimiter specification parser (Key: Value, Key = Value, tab, dash delimiters) alongside highlight, variant group, and guarantee sanitizers.",
      "openGmailQuotationDraft() generates itemized commercial quotation emails with Uttara corporate details, 15-day validity terms, installation scope, and automatic mailto: fallback.",
    ],
  },
];

export const SECURITY_MATRIX: SecurityControlRow[] = [
  {
    vector: "Credential Cracking / Weak Passwords",
    countermeasure: "bcryptjs adaptive hashing enforced at work factor cost = 12.",
    verification: "src/lib/auth.server.ts · auth-security.test.ts",
  },
  {
    vector: "Session Hijacking / XSS Cookie Theft",
    countermeasure:
      "256-bit crypto.randomBytes(32) tokens stored in sessions and issued via httpOnly: true, sameSite: 'lax', secure: production cookies (page_session).",
    verification: "src/lib/auth.server.ts",
  },
  {
    vector: "Brute Force & Automated Bot Spam",
    countermeasure:
      "In-memory sliding-window IP/email rate limiting (login: 5/60s, register/reset: 3/300s, OTP IP: 8/60s, OTP Email: 4/300s) + silent honeypot form traps.",
    verification: "src/lib/rate-limiter.ts · src/lib/otp.server.ts",
  },
  {
    vector: "Client-Side Price Tampering",
    countermeasure:
      "Checkout (createOrderCore) ignores client amounts, reads authoritative priceBdt rows in PostgreSQL, recomputes shipping/totals, and wraps writes atomically.",
    verification: "src/lib/data.server.ts · order-pricing.test.ts",
  },
  {
    vector: "Malicious File Upload / SVG XSS / Path Traversal",
    countermeasure:
      "Binary magic-byte validation (JPEG, PNG, WEBP, GIF, PDF, MP4 ftyp, WebM EBML) rejects SVGs/executables; random hex filenames; canonical path containment.",
    verification: "src/lib/media-magic.ts · media-security.test.ts",
  },
  {
    vector: "Credential / API Secret Leakage in Logs",
    countermeasure:
      "sanitizeErrorMessage() in email.server.ts strips leaked Resend keys (re_...) and SMTP credentials before inserting email_log or writing stderr.",
    verification: "src/lib/email.server.ts · email-provider.test.ts",
  },
  {
    vector: "Orphaned Failed OTP Slots",
    countermeasure:
      "sendQuoteOtpCore() automatically deletes the active OTP slot if SMTP/Resend transport fails so buyers can retry without false cooldown lockouts.",
    verification: "src/lib/otp.server.ts · quote-otp.test.ts",
  },
  {
    vector: "Edge HTTP Hardening",
    countermeasure:
      "Caddy enforces X-Frame-Options: SAMEORIGIN, X-Content-Type-Options: nosniff, Permissions-Policy, strips Server banner, and proxies internally over page_network.",
    verification: "Caddyfile · docker-compose.yml",
  },
];

export const TEST_SUITES: TestSuiteRow[] = [
  {
    file: "src/test/auth-security.test.ts",
    count: 2,
    guarantees: "bcrypt cost factor >= 12, password hash verification & non-plaintext storage",
  },
  {
    file: "src/test/media-security.test.ts",
    count: 10,
    guarantees:
      "Magic-byte acceptance (JPEG, PNG, WEBP, GIF, PDF, MP4, WebM), SVG/HTML/exe rejection, traversal denial",
  },
  {
    file: "src/test/rate-limiter.test.ts",
    count: 3,
    guarantees: "Sliding-window request enforcement, boundary counts, bucket reset verification",
  },
  {
    file: "src/test/shop-banner-video.test.ts",
    count: 3,
    guarantees:
      "URL sanitization, preset/custom video gallery normalization, clean removal fallback",
  },
  {
    file: "src/test/order-pricing.test.ts",
    count: 4,
    guarantees:
      "Zero-trust server pricing, free shipping threshold (>= 50,000 BDT), client-tamper immunity",
  },
  {
    file: "src/test/shop-search.test.ts",
    count: 4,
    guarantees:
      "1-char 'h' prefix priority, 2-char 'he' refinement, grouped suggestions, highlight segments",
  },
  {
    file: "src/test/image-zoom.test.tsx",
    count: 7,
    guarantees:
      "Wheel pointer-anchored zoom, click-toggle, bounded pan drag clamp, slide switch, Escape focus restore",
  },
  {
    file: "src/test/storefront-pricing.test.tsx",
    count: 3,
    guarantees:
      "Zero numeric pricing rendered on storefront cards/UI, JSON-LD offer price omission, label normalization",
  },
  {
    file: "src/test/product-specs.test.ts",
    count: 14,
    guarantees:
      "Tuple vs object spec normalization, bulk spec parser, stock status derivation, variant/guarantee cleanup",
  },
  {
    file: "src/test/email-provider.test.ts",
    count: 15,
    guarantees:
      "Auto/Resend/SMTP provider detection, Gmail App Password readiness checks, API key & password redaction",
  },
  {
    file: "src/test/quote-otp.test.ts",
    count: 8,
    guarantees:
      "6-digit OTP generation, TTL expiry, 5-attempt lockout, mail failure rollback, REQUIRE_QUOTE_EMAIL_OTP toggles",
  },
  {
    file: "src/test/quote-submission.test.ts",
    count: 3,
    guarantees: "Direct vs OTP quote creation, silent honeypot rejection without DB side effects",
  },
  {
    file: "src/test/admin-dashboard.test.tsx",
    count: 1,
    guarantees:
      "Ensures Admin Dashboard omits fake revenue charts/cards while rendering real DB KPIs and Low Stock Watchlist",
  },
  {
    file: "src/test/admin-database.test.ts",
    count: 6,
    guarantees:
      "Table identifier allowlist enforcement, SQL injection denial, password/token redaction, PGlite/postgres-js row extraction",
  },
  {
    file: "src/test/docs-route.test.tsx",
    count: 3,
    guarantees:
      "Verifies /docs renders all 12 sections, 10 UML/ERD/DFD SVGs, 16-table schema search filters, and zoom modal",
  },
  {
    file: "src/test/app-routing.test.tsx",
    count: 2,
    guarantees: "Root and /docs TanStack Router tree & route resolution integrity",
  },
];

export const OPERATIONS_COMMANDS: OperationsCommandRow[] = [
  {
    operation: "Health Endpoint",
    command: "GET /api/health",
    effect:
      "Executes live SELECT 1 against PostgreSQL; returns HTTP 200 { status: 'ok', database: 'connected', uptime } or HTTP 503.",
  },
  {
    operation: "Schema Push / Migrate",
    command: "npm run db:migrate / npm run db:push",
    effect: "Applies Drizzle schema definitions cleanly to local PGlite or remote PostgreSQL.",
  },
  {
    operation: "Database Seed / Status",
    command: "npm run db:seed / npm run db:status",
    effect:
      "Seeds initial admin user, workshop products, banners, settings, and prints table row diagnostics.",
  },
  {
    operation: "JSON Logical Backup",
    command: "npm run db:backup",
    effect:
      "Snapshots 12 operational tables (users, sessions, products, quotes, bookings, banners, reviews, media, orders, order_items, settings, updates) to backups/backup-<ISO>.json.",
  },
  {
    operation: "Dependency-Ordered Restore",
    command: "npm run db:restore [file]",
    effect:
      "Re-applies migrations, parses ISO timestamps, and restores tables in strict parent-to-child FK order using idempotent conflict handling.",
  },
];

export const ROADMAP_ITEMS: Array<{ title: string; detail: string }> = [
  {
    title: "1. Distributed Multi-Replica Rate Limit & OTP State",
    detail:
      "Currently checkRateLimit (src/lib/rate-limiter.ts) and quoteOtpStore (src/lib/otp.server.ts) reside in Node process memory (globalThis), which is ideal and zero-dependency for single-instance VPS deployments (page_app). Horizontal multi-container scaling behind a load balancer should back both maps with Redis (ioredis) or PostgreSQL advisory tables.",
  },
  {
    title: "2. S3-Compatible Object Storage Hook",
    detail:
      "STORAGE_DRIVER defaults to local (uploads_data Docker volume). High-traffic multi-region CDN deployments can implement an S3/R2 adapter behind src/lib/media-http.server.ts without modifying frontend upload consumers.",
  },
  {
    title: "3. Full Accounting & Mushak-6.3 Invoice PDF Export",
    detail:
      "Extending /admin/quotes to export digitally signed Mushak-6.3 VAT Pro-Forma PDFs directly alongside the Gmail Draft builder (openGmailQuotationDraft).",
  },
];
