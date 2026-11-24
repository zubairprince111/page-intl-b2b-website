# System Architecture & Technical Inventory

**Project:** PAGE International B2B Workshop Equipment & Procurement Platform  
**Repository:** `pixel-perfect` (`tanstack_start_ts`)  
**Target Environment:** Production VPS / Cloud Container (Ubuntu Linux)  
**Date of Assessment:** November 2026  
**Status:** PRODUCTION HARDENED  

---

## 1. High-Level Architecture Overview

PAGE International operates as a full-stack, server-side rendered (SSR) commercial platform designed for automotive workshop equipment procurement, demonstration bookings, and quotation processing across Bangladesh.

```
                                  [ Public Internet / Clients ]
                                                │
                                                ▼
                     [ Caddy 2 Reverse Proxy (Port 80 / 443 — Auto ACME TLS) ]
                                                │
                          ┌─────────────────────┴─────────────────────┐
                          │                                           │
                          ▼ (HTTP Proxy)                              ▼ (Static Assets / Fast Cache)
       [ TanStack Start SSR Application (Port 8080) ]          [ Persistent Uploads Volume ]
       - Nitro 3 Server Engine (`node-server`)                 - `/app/public/uploads`
       - React 19 Client Hydration                             - Binary Media Files
       - Server Functions (RPC) & Rate Limiters
                          │
                          ▼ (PostgreSQL Connection Pool)
       [ PostgreSQL 16 Enterprise Database (Port 5432) ]
       - Persistent Volume `postgres_data`
       - Drizzle ORM Schema & Migrations (16 Normalized Tables)
```

---

## 2. Technology Stack Inventory

| Tier / Subsystem | Primary Technology | Version / Spec | Justification & Responsibility |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React 19 | `19.2.0` | Ultra-fast UI component tree with client hydration and transitions. |
| **Full-Stack Meta-Framework** | TanStack Start | `1.168.60` | Full-stack SSR, file-based routing, server functions (`createServerFn`). |
| **Routing & Querying** | TanStack Router / TanStack Query | Router `1.170.41`, Query `5.101.1` | Type-safe URL routing, caching, mutation state, prefetching. |
| **Server Engine** | Nitro / Node.js | Engine `Nitro 3`, Runtime `Node >=20 LTS` | High-throughput async HTTP server, request streaming, worker threads. |
| **Database Engine** | PostgreSQL 16 / Embedded PGlite | `postgres 16-alpine` / PGlite `0.5.15` | Dual-engine support: full PostgreSQL in production, PGlite WASM for dev/testing. |
| **ORM & Migrations** | Drizzle ORM & Drizzle Kit | `0.45.4` / `0.31.11` | Pure TypeScript SQL query builder, relational queries, zero overhead. |
| **Styling & Design System** | Tailwind CSS v4 | `@tailwindcss/vite 4.2.1` | Utility-first CSS, modern compiler, custom font & theme tokens. |
| **UI Primitives** | Radix UI Primitive Components | `1.1.x` - `2.x` | WAI-ARIA compliant accessible dialogs, accordions, popovers, dropdowns. |
| **Edge Reverse Proxy** | Caddy 2 | `caddy:2-alpine` | Automatic HTTPS via Let's Encrypt, zstd/gzip compression, security headers. |
| **Email & Notifications** | Nodemailer / Resend SDK | Nodemailer `10.4.0` | Multi-provider transactional dispatch (SMTP, Gmail, Resend, console fallback). |
| **Document Generation** | DOCX Library | `docx 9.15.3` | Dynamic server-side generation of official B2B Word/PDF quotation documents. |

---

## 3. Component & Routing Map

### 3.1 Public Routes
- `/`: Homepage with visual category cards, scroll stacks, and featured equipment hero.
- `/shop`: Full B2B equipment catalog with multi-facet filters, search, and category tabs.
- `/shop/$slug`: Dynamic product details page with adaptive aspect-ratio stage, spec sheet, and instant quote modal.
- `/services/book`: Workshop consultation and bay demonstration booking wizard.
- `/solutions`: Industry turnkey packages (Dealership, Multi-brand, EV, 2W/3W Hubs).
- `/service-centers`: Dhaka and regional hub locator with interactive map and technician directory.
- `/vehicles`: Vehicle compatibility matcher (4W, 3W, 2W, Heavy Commercial, EV).
- `/updates`: Technical articles, equipment operation guides, and industry news.
- `/about`: Corporate credentials, engineering team, and PAGE International heritage.
- `/support`: Customer service, warranty guidelines, and spare parts procurement.
- `/cart` & `/checkout`: RFQ cart batching, item aggregation, and order submission.
- `/login`: Secure B2B customer & workshop partner login.
- `/account`: Customer portal with quotation tracking and booking history.
- `/privacy`, `/terms`, `/warranty`: Legal, compliance, and warranty policies.

### 3.2 Protected Admin Routes (`/admin/*`)
*Guarded server-side and client-side via `requireAdminBeforeLoad` and `getSessionUserCore`.*
- `/admin`: Executive overview with KPI metrics, revenue charts, and operational alerts.
- `/admin/quotes`: Commercial quotation requests (RFQs), reply dispatch, status changes.
- `/admin/bookings`: Demonstration bookings, calendar scheduling, technician assignment.
- `/admin/inventory`: Catalog curation, product specs, pricing labels, stock levels, custom items.
- `/admin/media`: Visual asset management, binary uploads, categorization, thumbnail inspection.
- `/admin/database`: Live database health check, table record counts, system latency metrics.
- `/admin/banners`: Promotional hero banner management and carousel sequencing.
- `/admin/reviews`: Workshop testimonial moderation, publishing toggles, rating curation.
- `/admin/users`: User management, role elevation, account suspension, audit records.
- `/admin/updates`: Content management for technical bulletins and articles.
- `/admin/settings`: Key-value site settings, company details, dispatch hubs, VAT policies.

---

## 4. Complete 16-Table Relational Schema Architecture

```
[ users ] (PK: id, email UNIQUE, role: admin|staff|customer)
   ├──< [ sessions ] (PK: id, FK: user_id CASCADE, token UNIQUE)
   ├──< [ quotes ] (PK: id, FK: user_id SET NULL, quote_number)
   ├──< [ bookings ] (PK: id, FK: user_id SET NULL, booking_number)
   ├──< [ orders ] (PK: id, FK: user_id SET NULL, order_number UNIQUE)
   │       └──< [ order_items ] (PK: id, FK: order_id CASCADE, FK: product_id SET NULL)
   ├──< [ reviews ] (PK: id, FK: user_id SET NULL, rating, is_published)
   ├──< [ updates ] (PK: id, FK: author_id SET NULL, slug UNIQUE)
   ├──< [ password_reset_tokens ] (PK: id, FK: user_id CASCADE, token_hash UNIQUE)
   ├──< [ email_verification_tokens ] (PK: id, FK: user_id CASCADE, token_hash UNIQUE)
   └──< [ audit_log ] (PK: id, FK: actor_id SET NULL, action, entity_type)

[ products ] (PK: id, slug UNIQUE, sku, brand, category, specs JSONB, images JSONB)
[ media ] (PK: id, url UNIQUE, filename, mime_type, size_bytes, storage_data TEXT)
[ banners ] (PK: id, title, image_url, is_active, sort_order)
[ settings ] (PK: key, value JSONB, updated_by FK -> users.id)
[ email_log ] (PK: id, recipient, subject, template, status, sent_at)
```

---

## 5. Critical Business Data Flows

### 5.1 Commercial Quotation Request (RFQ) with Conditional Email OTP
```
[ Customer Submits RFQ Modal ] 
            │
            ▼
[ Input Sanitization & Honeypot Check ]
            │ (Passes bot filter)
            ▼
[ Rate Limiter Check (`quote:${ip}`: 10 req / 60s) ]
            │
            ├─► [ If OTP Required ]:
            │      1. Generate 6-digit cryptographic OTP (expires in 10 mins).
            │      2. Dispatch transactional verification email via Nodemailer/Resend.
            │      3. Prompt user for OTP modal input.
            │      4. On verification match, proceed to DB insert.
            │
            └─► [ If OTP Skipped or Verified ]:
                   1. Assign sequential RFQ number (`RFQ-YYYY-NNNN`).
                   2. Insert record into `quotes` table with status 'PENDING'.
                   3. Dispatch Customer Confirmation Email.
                   4. Dispatch Admin Commercial Alert Email.
                   5. Record event in `audit_log`.
                   6. Return confirmation payload to UI.
```

### 5.2 Zero-Trust Admin Authentication Flow
```
[ Admin Enters Credentials on /admin/login ]
            │
            ▼
[ Rate Limiter Check (`login:${ip}`: 5 attempts / 60s) ]
            │
            ▼
[ Query `users` by normalized email ]
            │
            ▼
[ Compare password with stored bcrypt hash (cost >= 12) ]
            │ (Match verified)
            ▼
[ Verify user.role === 'admin' and user.isActive === true ]
            │
            ▼
[ Generate 64-character cryptographic token: `crypto.randomBytes(32)` ]
            │
            ▼
[ Insert record into `sessions` table (expires in 12 hours) ]
            │
            ▼
[ Set HTTP-Only, Secure, SameSite=Lax Cookie `page_session` ]
            │
            ▼
[ Record login timestamp on user & log event in `audit_log` ]
            │
            ▼
[ Redirect to /admin dashboard ]
```
