# PAGE INTERNATIONAL B2B PLATFORM

# Comprehensive Production Readiness & Architectural Audit Report

**Date of Audit:** November 9, 2026  
**Auditor:** Senior Full-Stack Engineer, Security Reviewer & DevOps Architect  
**Repository Working Directory:** `c:\camera Prince\project\pages\pixel-perfect`  
**Verdict:** **NOT READY FOR PRODUCTION**  
**Feature Completeness Score:** **42 / 100**  
**Production Readiness Score:** **28 / 100**

---

## 1. Executive Summary

### 1.1 Project Overview

PAGE International is a specialized B2B digital catalog, Request For Quotation (RFQ), consultation booking, and workshop management platform catering to Bangladesh's automotive industry. It features commercial garage machinery (hydraulic vehicle lifts, 3D wheel aligners, tyre changers, industrial air compressors), diagnostics (LAUNCH, SmartSafe), electric vehicle (EV) workshop solutions, and motorcycle / 2-wheeler service tooling.

### 1.2 Technology Stack

| Layer                  | Technologies                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend Framework** | React 19 (`react` 19.2.4, `react-dom` 19.2.4)                                                                                               |
| **Routing & SSR**      | TanStack Start (`@tanstack/react-start` 1.164.21), TanStack Router 1.164.21                                                                 |
| **Server Engine**      | Nitro (`nitro` 3.0.0-alpha.6) via Vite integration                                                                                          |
| **Styling & UI**       | Tailwind CSS v4 (`@tailwindcss/vite` 4.0.0-alpha.35), Radix UI primitives, Lucide React                                                     |
| **Database & ORM**     | PostgreSQL 16 via Drizzle ORM (`drizzle-orm` 0.45.1), `postgres` 3.4.7 driver, `@electric-sql/pglite` 0.5.15 (local embedded WASM fallback) |
| **Build & Tooling**    | Vite 8.1.5, TypeScript 5.9.3, Vitest 4.1.11, ESLint 9.39.2, Prettier                                                                        |
| **Containerization**   | Docker (Alpine 3.21 / Node 22), Docker Compose                                                                                              |

### 1.3 Overall Verdict & Executive Summary

The user interface and design polish of the public-facing pages are high quality, interactive, responsive, and aesthetically modern. However, from an architectural, security, and backend engineering standpoint, **this project is currently an advanced frontend prototype / mock system and is NOT ready for production hosting**.

#### Key Reasons:

1. **Critical Authentication Bypass:** The admin login (`/admin/login`) does not verify passwords. Any user entering any email or the word `admin` is instantly authenticated. Admin session state is stored insecurely in client `localStorage` with zero server-side validation.
2. **Unauthenticated Arbitrary File Deletion & Upload:** Server functions in `src/lib/media.server.ts` lack authentication and suffer from path traversal vulnerabilities (`/uploads/../../...`), allowing unauthenticated external actors to delete arbitrary files on the host filesystem or upload malicious files up to 50MB.
3. **Split-Brain Data Architecture:** While a PostgreSQL database schema with 8 tables exists in `src/db/schema.ts`, the frontend routes (Cart, RFQ, Consultation Bookings, Inventory, Settings, Users) are completely disconnected from PostgreSQL and write to browser `localStorage`. Real customer quotes and bookings never reach the business.
4. **Checkout Orders Vanish:** The checkout form generates an order ID and clears the cart without storing the order record anywhere.
5. **Broken Production Build / Deployment:** The production Dockerfile and entrypoint script crash immediately upon launch because `vite.config.ts` hardcodes `nitro({ defaultPreset: "cloudflare-module" })`. This exports a Cloudflare Worker fetch handler rather than starting a Node.js HTTP server. `npm run preview` also crashes with HTTP 500.

---

## 2. Does It Run Locally?

| Mode                                       | Status      | Details                                                                                         |
| ------------------------------------------ | ----------- | ----------------------------------------------------------------------------------------------- |
| **Dev Server (`npm run dev`)**             | **YES**     | Starts cleanly on `http://localhost:8080/`. Public catalog, cart, and admin routes render.      |
| **Database (`npm run db:status`)**         | **YES**     | Connects to embedded PGlite WASM in `.data/postgres` (PostgreSQL 16 engine healthy).            |
| **Database Seed (`npm run db:seed`)**      | **YES**     | Creates tables and seeds initial products, banners, reviews, and test users.                    |
| **Type Check (`npx tsc --noEmit`)**        | **YES**     | Exits with code 0 (0 compilation errors).                                                       |
| **Test Suite (`npm run test`)**            | **PARTIAL** | Passes, but contains only 1 superficial route-matching test.                                    |
| **Linter (`npm run lint`)**                | **BROKEN**  | Fails with 12,574 errors due to Windows CRLF line-ending conflicts with ESLint Prettier plugin. |
| **Production Build (`npm run build`)**     | **PASSES**  | Client and SSR artifacts build to `.output/`.                                                   |
| **Production Preview (`npm run preview`)** | **BROKEN**  | Crashes with HTTP 500 (`Cannot find module dist/server/server.js`).                             |
| **Docker Container (`docker compose up`)** | **BROKEN**  | Crashes immediately on container startup.                                                       |

### Exact Working Commands to Run Locally

```bash
# 1. Clone & Enter Directory
cd pixel-perfect

# 2. Install Dependencies
npm install

# 3. Initialize & Seed Local Database (embedded PGlite engine)
npm run db:seed

# 4. Check Database Status
npm run db:status

# 5. Start Development Server
npm run dev
# Server ready at http://localhost:8080/
```

---

## 3. Feature Completeness Audit Table

| Feature / Route                                      | Location in Code                               | Status                | Evidence                                                                                                                                           | What is Needed                                                                                                                             |
| ---------------------------------------------------- | ---------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Homepage (`/`)**                                   | `src/routes/index.tsx`                         | **Complete (UI)**     | Dynamic banner carousels, target sectors, fan stacks, partner trust marks render smoothly.                                                         | Connect client reviews and featured banners to PostgreSQL rather than `localStorage`.                                                      |
| **About Us (`/about`)**                              | `src/routes/about.tsx`                         | **Complete**          | Swiss metrics, leadership profiles, 5 strategic pillars.                                                                                           | None; fully functional static page.                                                                                                        |
| **Shop Catalog (`/shop`)**                           | `src/routes/shop.index.tsx`                    | **Partial**           | Loads from `src/lib/data.ts` or `localStorage.getItem("admin_inventory")` via `getShopProducts()`.                                                 | Connect catalog to `productsTable` in PostgreSQL via TanStack Start `serverFn` with pagination and server search.                          |
| **Product Detail (`/shop/$slug`)**                   | `src/routes/shop.$slug.tsx`                    | **Partial**           | Reads static product by slug; RFQ quote modal triggers properly.                                                                                   | Fetch product details, dynamic specs, and live inventory count from database.                                                              |
| **Quotation Cart (`/cart`)**                         | `src/routes/cart.tsx`                          | **Partial**           | Persists across refreshes in `localStorage`. BUT submission calls `addQuote` in `src/lib/admin-data.ts`, saving to the customer's browser storage. | Implement server function `createQuoteServerFn` inserting into `quotes` table in PostgreSQL and dispatching email notifications.           |
| **Checkout (`/checkout`)**                           | `src/routes/checkout.tsx`                      | **Broken / Mock**     | `handleSubmit` generates `"PG-" + random`, clears cart, and sets `done = true`. Does not save the order anywhere.                                  | Create `orders` and `order_items` tables in PostgreSQL; persist customer billing/shipping details and ordered items; trigger notification. |
| **Consultation Booking (`/services/book`)**          | `src/routes/services.book.tsx`                 | **Partial**           | Multi-step interactive booking form works in UI, but saves booking via `addBooking()` to user's browser `localStorage`.                            | Persist bookings to `bookings` table in PostgreSQL via server function.                                                                    |
| **Operational Updates (`/updates`)**                 | `src/routes/updates.tsx`                       | **Partial**           | Filterable activity feed renders cleanly, but reads from `localStorage` (`page_field_updates`).                                                    | Query updates from PostgreSQL table with public pagination.                                                                                |
| **Customer Support (`/support`)**                    | `src/routes/support.tsx`                       | **Complete**          | 6-district support centers, FAQs, direct phone, WhatsApp links.                                                                                    | Fully functional.                                                                                                                          |
| **Service Centers (`/service-centers`)**             | `src/routes/service-centers.tsx`               | **Complete**          | Multi-city service hubs, map cards, equipment inspection tiers.                                                                                    | Fully functional.                                                                                                                          |
| **Turnkey Solutions (`/solutions`)**                 | `src/routes/solutions.tsx`                     | **Complete**          | Workshop setups (EV, 2W, Fleets) with RFQ modals.                                                                                                  | Fully functional.                                                                                                                          |
| **Admin Login (`/admin/login`)**                     | `src/routes/admin/login.tsx`                   | **Broken / Insecure** | `loginAdmin()` in `src/lib/admin-data.ts:808` accepts any email and never checks password.                                                         | Implement secure bcrypt password verification, HTTP-only JWT cookies, and rate limiting.                                                   |
| **Admin Dashboard (`/admin`)**                       | `src/routes/admin/index.tsx`                   | **Partial**           | Shows KPIs, charts, and activity, but computes them from `localStorage`.                                                                           | Compute stats via SQL aggregation queries from PostgreSQL.                                                                                 |
| **Admin Inventory Manager (`/admin/inventory`)**     | `src/routes/admin/inventory.tsx`               | **Partial**           | Product CRUD operations only modify `localStorage` (`admin_inventory`).                                                                            | Connect CRUD actions to `productsTable` in PostgreSQL.                                                                                     |
| **Admin Quotations (`/admin/quotes`)**               | `src/routes/admin/quotes.tsx`                  | **Partial**           | Reads quotes from `localStorage`. Real customer quotes never arrive here.                                                                          | Read from PostgreSQL `quotes` table; implement real status lifecycle.                                                                      |
| **Quotation Email Dispatch (`QuotationEmailModal`)** | `src/components/admin/QuotationEmailModal.tsx` | **Mock / Incomplete** | Copies HTML to clipboard and opens Gmail in browser.                                                                                               | Integrate real transactional email provider (Resend, SendGrid, Amazon SES, or Nodemailer).                                                 |
| **Admin Media Library (`/admin/media`)**             | `src/routes/admin/media.tsx`                   | **Broken (Security)** | Connected to PostgreSQL and writes to `public/uploads`, but has no authentication, path traversal, or cloud storage.                               | Add admin auth check, sanitize paths, and migrate to Cloudflare R2 / AWS S3.                                                               |
| **Admin Bookings (`/admin/bookings`)**               | `src/routes/admin/bookings.tsx`                | **Partial**           | Reads bookings from `localStorage`.                                                                                                                | Query `bookings` table in PostgreSQL.                                                                                                      |
| **Admin Banners (`/admin/banners`)**                 | `src/routes/admin/banners.tsx`                 | **Partial**           | Reads/writes banners in `localStorage`.                                                                                                            | Persist to `banners` table in PostgreSQL.                                                                                                  |
| **Admin Users (`/admin/users`)**                     | `src/routes/admin/users.tsx`                   | **Partial**           | Reads/writes users in `localStorage`.                                                                                                              | Connect to `users` table in PostgreSQL with secure password hashing.                                                                       |
| **Admin Settings (`/admin/settings`)**               | `src/routes/admin/settings.tsx`                | **Partial**           | Saves business settings in `localStorage`.                                                                                                         | Save business settings to a database key-value table.                                                                                      |

---

## 4. Issues List Grouped by Severity

### 4.1 CRITICAL SEVERITY (Blocks Production & Security Exploits)

#### [SEC-01] Complete Admin Authentication Bypass (Zero Password Verification)

- **Location:** [`src/lib/admin-data.ts#L808-L835`](file:///c:/camera%20Prince/project/pages/pixel-perfect/src/lib/admin-data.ts#L808-L835), [`src/routes/admin/login.tsx#L48-L57`](file:///c:/camera%20Prince/project/pages/pixel-perfect/src/routes/admin/login.tsx#L48-L57)
- **Why It Matters:** The function `loginAdmin(email, password)` accepts any password or no password at all. If the email matches any user in `getUsers()`, or if the user enters `admin`, `admin@page.com`, or `admin@pageinternational.com`, it immediately logs the user in. An attacker can access all administrative controls without knowing a password.
- **Recommended Fix:** Implement server-side authentication using `bcryptjs` password hashing against the `users` table in PostgreSQL. Issue a signed, HTTP-only, secure JWT session cookie upon valid password verification.

#### [SEC-02] Client-Side Role Check & Insecure Session Storage

- **Location:** [`src/components/admin/AdminLayout.tsx#L50-L58`](file:///c:/camera%20Prince/project/pages/pixel-perfect/src/components/admin/AdminLayout.tsx#L50-L58), [`src/lib/admin-data.ts#L838-L850`](file:///c:/camera%20Prince/project/pages/pixel-perfect/src/lib/admin-data.ts#L838-L850)
- **Why It Matters:** Protected admin routes check `getAuthAdminUser()`, which merely reads `localStorage.getItem("page_auth_admin")`. Anyone can open browser DevTools and execute `localStorage.setItem("page_auth_admin", JSON.stringify({ id: "u-1", email: "admin@page.com", role: "admin" }))` to gain unrestricted access to the admin dashboard.
- **Recommended Fix:** Enforce server-side session authentication in TanStack Start route loaders (`beforeLoad`) using HTTP-only cookies verified against the `sessions` table in PostgreSQL.

#### [SEC-03] Unauthenticated Arbitrary File Deletion via Path Traversal

- **Location:** [`src/lib/media.server.ts#L98-L109`](file:///c:/camera%20Prince/project/pages/pixel-perfect/src/lib/media.server.ts#L98-L109), [`src/lib/media.ts#L18-L23`](file:///c:/camera%20Prince/project/pages/pixel-perfect/src/lib/media.ts#L18-L23)
- **Why It Matters:** `deleteMediaServerFn` is an unauthenticated public RPC endpoint. Line 98 checks `if (data.url && data.url.startsWith("/uploads/"))`, extracts `relativePath`, and calls `path.resolve(process.cwd(), "public", relativePath)` followed by `fs.unlinkSync(fullPath)`. An attacker sending `{ url: "/uploads/../../package.json" }` or `/uploads/../../.env` can delete critical project files or system configurations.
- **Recommended Fix:**
  1. Restrict `deleteMediaServerFn` to authenticated admin sessions only.
  2. Normalize and verify that `fullPath.startsWith(path.resolve(process.cwd(), "public", "uploads"))`.
  3. Look up files strictly by database ID rather than arbitrary user-supplied file paths.

#### [SEC-04] Unauthenticated Arbitrary File Upload & Directory Traversal

- **Location:** [`src/lib/media.server.ts#L11-L43`](file:///c:/camera%20Prince/project/pages/pixel-perfect/src/lib/media.server.ts#L11-L43), [`src/lib/media.ts#L11-L16`](file:///c:/camera%20Prince/project/pages/pixel-perfect/src/lib/media.ts#L11-L16)
- **Why It Matters:** `uploadMediaServerFn` is public, accepts up to 50MB base64 payloads, and concatenates `category` without sanitization: `path.resolve(process.cwd(), "public", "uploads", category)`. An unauthenticated attacker can flood the server disk or upload `.html`/`.svg` files with executable scripts for Stored XSS.
- **Recommended Fix:**
  1. Protect the upload server function with admin session authentication.
  2. Validate `category` against a strict allowlist (`["products", "banners", "documents", "general"]`).
  3. Validate file magic bytes (MIME type) and file extensions.

#### [OPS-01] Docker Container & Production Server Crash on Startup

- **Location:** [`vite.config.ts#L39-L43`](file:///c:/camera%20Prince/project/pages/pixel-perfect/vite.config.ts#L39-L43), [`docker-entrypoint.sh#L27`](file:///c:/camera%20Prince/project/pages/pixel-perfect/docker-entrypoint.sh#L27)
- **Why It Matters:** `vite.config.ts` sets Nitro preset to `cloudflare-module` during `build`. This compiles `.output/server/index.mjs` into a Cloudflare Worker export (`export default { fetch: ... }`), NOT a standalone Node.js HTTP server. When `docker-entrypoint.sh` executes `exec node .output/server/index.mjs`, Node executes the file and exits immediately with code 0 because no HTTP listener is active. The Docker container immediately dies.
- **Recommended Fix:** Configure Nitro's preset dynamically based on the target deployment environment:
  ```ts
  nitro({
    defaultPreset: process.env.NITRO_PRESET || "node-server",
  });
  ```

#### [DATA-01] Split-Brain Data Architecture (Customer RFQs & Bookings Lost in LocalStorage)

- **Location:** [`src/lib/admin-data.ts#L568-L580`](file:///c:/camera%20Prince/project/pages/pixel-perfect/src/lib/admin-data.ts#L568-L580), [`src/routes/cart.tsx#L60-L101`](file:///c:/camera%20Prince/project/pages/pixel-perfect/src/routes/cart.tsx#L60-L101), [`src/routes/services.book.tsx#L617-L630`](file:///c:/camera%20Prince/project/pages/pixel-perfect/src/routes/services.book.tsx#L617-L630)
- **Why It Matters:** A real customer submitting a quote at `/cart` or booking at `/services/book` stores the data exclusively in their own browser's `localStorage`. An administrator logged into `/admin` on their machine will never see customer submissions.
- **Recommended Fix:** Replace `addQuote()` and `addBooking()` with server functions (`createQuoteServerFn`, `createBookingServerFn`) that insert rows directly into the PostgreSQL `quotes` and `bookings` tables.

#### [DATA-02] Checkout Orders Completely Discarded

- **Location:** [`src/routes/checkout.tsx#L37-L43`](file:///c:/camera%20Prince/project/pages/pixel-perfect/src/routes/checkout.tsx#L37-L43)
- **Why It Matters:** When a customer clicks "Place & Confirm Order", the handler generates an order ID string (`PG-XXXXXX`), clears the cart, and shows a success screen. The order details, line items, delivery address, and phone number are never saved to any database, file, or email. The order is permanently lost.
- **Recommended Fix:** Create an `orders` and `order_items` table schema in Drizzle ORM, persist orders via server function, and trigger confirmation notifications.

---

### 4.2 HIGH SEVERITY (Must Fix Before Hosting)

#### [OPS-02] Production Preview (`npm run preview`) Fails with HTTP 500

- **Location:** [`package.json#L10`](file:///c:/camera%20Prince/project/pages/pixel-perfect/package.json#L10), `node_modules/@tanstack/start-plugin-core`
- **Why It Matters:** Running `npm run preview` fails on every request with `[ERR_MODULE_NOT_FOUND]: Cannot find module 'dist\server\server.js'` because Nitro outputs to `.output/` while TanStack Start's default preview plugin expects `dist/server/server.js`.
- **Recommended Fix:** Update preview script in `package.json` to run the built Nitro server directly: `"preview": "node .output/server/index.mjs"` (once built with `node-server` preset) or `"preview": "nitro preview"`.

#### [SEC-05] Committed Secrets & Default Passwords in Version Control

- **Location:** [`.env.example#L7,L17,L20`](file:///c:/camera%20Prince/project/pages/pixel-perfect/.env.example#L7-L20), [`.env#L17`](file:///c:/camera%20Prince/project/pages/pixel-perfect/.env#L17)
- **Why It Matters:** `.env.example` contains hardcoded credentials (`page_secure_password_2026`, `page_international_super_secret_session_key_bangladesh_2026`). If developers deploy using `.env.example` defaults, attackers can access the database or forge session tokens.
- **Recommended Fix:** Replace real-looking passwords in `.env.example` with placeholders (`POSTGRES_PASSWORD=your_secure_password_here`, `AUTH_SECRET=generate_with_openssl_rand_base64_32`).

#### [SEC-06] Dockerfile Runs as Root User

- **Location:** [`Dockerfile#L23-L49`](file:///c:/camera%20Prince/project/pages/pixel-perfect/Dockerfile#L23-L49)
- **Why It Matters:** The container execution stage does not declare a non-root `USER`. If a container breakout or remote code execution vulnerability occurs, the attacker has root privileges on the container.
- **Recommended Fix:** Add `USER node` before the `ENTRYPOINT` in `Dockerfile`.

#### [SEC-07] 16 Known Dependency Vulnerabilities (2 High, 14 Moderate)

- **Location:** `package-lock.json`
- **Why It Matters:** `npm audit` reports High severity vulnerabilities in `vite` (arbitrary command execution / path traversal on Windows) and `zod` (memory exhaustion DoS), plus moderate vulnerabilities in `seroval`, `esbuild`, and `@vitest/mocker`.
- **Recommended Fix:** Upgrade `vite`, `zod`, and test tooling to their latest patched releases (`npm audit fix`).

#### [PERF-01] Ephemeral Local File Storage on Cloud / Serverless

- **Location:** [`src/lib/media.server.ts#L36-L43`](file:///c:/camera%20Prince/project/pages/pixel-perfect/src/lib/media.server.ts#L36-L43)
- **Why It Matters:** Writing uploaded media to `public/uploads` breaks on serverless platforms (Vercel, AWS Lambda, Cloudflare Workers) where the filesystem is read-only or ephemeral. On Docker, files are lost whenever the container is recreated without a mounted persistent volume.
- **Recommended Fix:** Implement an S3-compatible cloud storage adapter (AWS S3, Cloudflare R2, or Supabase Storage).

#### [PERF-02] Monolithic Client Bundle Chunks Exceeding 500kB

- **Location:** `.output/public/assets/index-BEwm1umu.js` (689.94 kB), `admin-VFFX99EN.js` (408.93 kB)
- **Why It Matters:** Large JavaScript bundles increase Time to Interactive (TTI) and First Contentful Paint (FCP), especially on mobile 3G/4G connections in Bangladesh.
- **Recommended Fix:** Lazy load large admin components (such as `Recharts`, `QuotationEmailModal`, and Lucide icon sets) using `React.lazy()` and dynamic imports.

---

### 4.3 MEDIUM SEVERITY (Should Fix Soon)

#### [TEST-01] Insufficient Automated Test Coverage

- **Location:** [`src/test/app-routing.test.tsx#L9-L17`](file:///c:/camera%20Prince/project/pages/pixel-perfect/src/test/app-routing.test.tsx#L9-L17)
- **Why It Matters:** The test suite contains only 1 test. Critical business logic (cart item calculations, quotation form validation, stock deduction, auth verification, and file uploads) has 0% automated test coverage.
- **Recommended Fix:** Add unit tests for `cart.tsx`, database queries, validation schemas, and server functions using Vitest and React Testing Library.

#### [CODE-01] 12,574 ESLint / Prettier Line-Ending Errors

- **Location:** Entire codebase (Windows CRLF vs Linux LF)
- **Why It Matters:** CI/CD pipelines running on Linux (e.g., GitHub Actions) will fail on `npm run lint` immediately.
- **Recommended Fix:** Add a `.gitattributes` file enforcing `* text=auto eol=lf` and run `npx prettier --write .`.

#### [CODE-02] Monolithic God Files

- **Location:** [`src/lib/data.ts`](file:///c:/camera%20Prince/project/pages/pixel-perfect/src/lib/data.ts) (1,375 lines), [`src/lib/admin-data.ts`](file:///c:/camera%20Prince/project/pages/pixel-perfect/src/lib/admin-data.ts) (1,029 lines)
- **Why It Matters:** High maintenance friction, tight coupling, and difficult code reviews.
- **Recommended Fix:** Split `src/lib/data.ts` into modular files (`products.ts`, `categories.ts`, `specs.ts`) and separate API client functions from mock data.

#### [EMAIL-01] Absence of Automated Transactional Email Dispatch

- **Location:** [`src/components/admin/QuotationEmailModal.tsx#L601-L603`](file:///c:/camera%20Prince/project/pages/pixel-perfect/src/components/admin/QuotationEmailModal.tsx#L601-L603)
- **Why It Matters:** Admins must manually copy quotation templates to their clipboard and paste into Gmail. This is error-prone and does not scale.
- **Recommended Fix:** Connect a transactional email API (Resend, Postmark, or SMTP) to send professional branded HTML quotation PDFs directly to customer inboxes.

---

### 4.4 LOW SEVERITY (Nice to Have)

#### [DOC-01] Minimal & Outdated README

- **Location:** [`README.md#L1-L21`](file:///c:/camera%20Prince/project/pages/pixel-perfect/README.md#L1-L21)
- **Recommended Fix:** Document environment variables, database setup commands, production build instructions, and Docker workflows.

#### [LOG-01] Missing Health Check Endpoint & Structured Logging

- **Location:** Root router / server entry
- **Recommended Fix:** Add a `/healthz` or `/api/health` endpoint returning database latency and system status for uptime monitoring.

#### [PAY-01] Mock Payment Radio Buttons in Checkout

- **Location:** [`src/routes/checkout.tsx#L210-L230`](file:///c:/camera%20Prince/project/pages/pixel-perfect/src/routes/checkout.tsx#L210-L230)
- **Recommended Fix:** Integrate SSLCommerz, bKash, or Stripe payment gateway SDKs if online digital payments are required.

---

## 5. Recommended Upgrades & Architectural Plan

```mermaid
flowchart TD
    subgraph Client["Browser (Customer & Admin)"]
        A[React 19 Frontend]
        B[Quotation Cart & RFQ]
        C[Admin Portal /admin]
    end

    subgraph Server["Server Layer (TanStack Start / Nitro Node Engine)"]
        D[Server Functions - serverFn]
        E[Auth Middleware - HTTP-Only JWT Cookie]
        F[Input Validation - Zod Schemas]
    end

    subgraph Data["Data & Infrastructure"]
        G[(PostgreSQL 16 Database)]
        H[Cloud Storage - S3 / Cloudflare R2]
        I[Email Service - Resend / SMTP]
    end

    A -->|RPC Requests| D
    B -->|Submit RFQ / Order| D
    C -->|Manage Inventory / Quotes| D
    D --> E
    E --> F
    F -->|Drizzle ORM Queries| G
    F -->|Upload / Delete Media| H
    F -->|Send Notification| I
```

### Specific Architecture Upgrades:

1. **Unify Database Operations with Drizzle ORM:** Delete the localStorage mocks in `src/lib/admin-data.ts`. All admin views and customer forms must query PostgreSQL tables (`products`, `quotes`, `bookings`, `orders`, `banners`, `users`).
2. **Session Security:** Implement HTTP-only cookie JWT tokens signed with `AUTH_SECRET`, verified on every server function.
3. **Storage Engine:** Replace local disk writes with an S3 / R2 SDK so media files persist reliably regardless of container rebuilds or serverless scaling.
4. **Environment Separation:** Maintain distinct `.env.development`, `.env.staging`, and `.env.production` configurations.

---

## 6. Hosting Roadmap & Deployment Recommendations

### Top 3 Hosting Options Evaluated

| Option                                                                  | Architecture                                                                  | Monthly Cost       | Pros                                                                               | Cons                                                                                          | Recommendation                                              |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Option 1: VPS with Docker Compose (Hetzner / DigitalOcean / Linode)** | Node.js Nitro Container + PostgreSQL 16 Container + Caddy Reverse Proxy (SSL) | **$6 – $12 / mo**  | 100% control, predictable cost, PGlite/Postgres runs natively, persistent volumes. | Requires basic Linux maintenance & security updates.                                          | **TOP RECOMMENDED** (Best fit for full-stack Node/Postgres) |
| **Option 2: Managed PaaS (Railway / Render)**                           | Container / Nixpacks build + Managed PostgreSQL                               | **$15 – $30 / mo** | Zero server maintenance, automated git push deploys, built-in SSL.                 | Higher cost, memory limits on lower tiers.                                                    | **Good Alternative** (Fastest setup)                        |
| **Option 3: Vercel + Neon Postgres + Vercel Blob**                      | Serverless Edge Functions + Serverless Postgres                               | **$0 – $25 / mo**  | Global CDN, instant deployments.                                                   | Requires splitting repo into serverless functions, vendor lock-in, connection pooling needed. | **Viable with code changes**                                |

### Step-by-Step Checklist to Go from Local to Live (VPS / Docker)

1. **Step 1: Code Hardening**
   - Fix Nitro preset in `vite.config.ts` (`node-server`).
   - Fix admin authentication with bcrypt and HTTP-only cookies.
   - Wire RFQ quotes and checkout orders to PostgreSQL.
   - Patch media upload path traversal vulnerabilities.
2. **Step 2: Database Preparation**
   - Provision a PostgreSQL 16 database.
   - Run `npm run db:push` or migrations to create all production tables.
   - Run initial seed: `npm run db:seed`.
3. **Step 3: Environment Configuration**
   - Set strong production environment variables on the host:
     ```env
     NODE_ENV=production
     PORT=8080
     DATABASE_URL=postgresql://db_user:strong_password@postgres:5432/page_prod
     AUTH_SECRET=random_64_character_hex_string
     STORAGE_BUCKET=page-media-prod
     ```
4. **Step 4: Reverse Proxy & SSL Setup**
   - Configure Caddy or Nginx with Let's Encrypt for automatic HTTPS:
     ```caddy
     pageinternational.com {
         reverse_proxy localhost:8080
     }
     ```
5. **Step 5: Automated Backups & Monitoring**
   - Set up daily `pg_dump` cron jobs backed up to off-site S3 storage.
   - Configure Uptime Kuma or BetterStack for 24/7 uptime monitoring.

---

## 7. Prioritized Action Plan

```
Phase 1: Security & Build Fixes (Urgent - 1-2 Days)
├── Fix Nitro preset in vite.config.ts to support Node.js & Docker runtime
├── Fix Dockerfile and docker-entrypoint.sh to start Node HTTP server as non-root user
├── Implement bcrypt password hashing & secure auth in admin login
└── Patch media upload & deletion path traversal vulnerabilities

Phase 2: Database & Business Flow Integration (2-3 Days)
├── Wire Cart RFQ submission to PostgreSQL quotes table
├── Create orders & order_items schema; save checkout submissions
├── Wire consultation bookings to PostgreSQL bookings table
└── Wire admin inventory, banners, and updates to PostgreSQL

Phase 3: Media Storage & Email Services (1-2 Days)
├── Integrate S3 / Cloudflare R2 for persistent media uploads
└── Connect Resend / SMTP for automated quotation emails & notifications

Phase 4: Production Polish & CI/CD (1 Day)
├── Add GitHub Actions CI workflow (lint, typecheck, test, build)
├── Add /healthz health check endpoint
└── Resolve ESLint Prettier line-ending formatting issues
```

---

## 8. Open Questions for Confirmation

Before proceeding with code changes, please clarify:

1. **Target Hosting Infrastructure:** Do you plan to deploy on a VPS (Hetzner / DigitalOcean with Docker Compose), a PaaS (Railway / Render), or Vercel?
2. **Online Payment Gateways:** Is Cash on Delivery & Pro-forma Invoice sufficient for B2B procurement, or do you need an online payment gateway (bKash, Nagad, SSLCommerz)?
3. **Email Provider:** Do you have an existing SMTP service or should we configure an API provider like Resend or SendGrid?
4. **Cloud Media Storage:** Would you prefer Cloudflare R2 (zero egress fees) or AWS S3 for product images and banner uploads?

---

_Report generated and verified on local testbed: Node v24.20.0 • Vite v8.1.5 • PostgreSQL 16 (PGlite)._
