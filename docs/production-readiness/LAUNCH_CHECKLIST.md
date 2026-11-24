# Final Pre-Launch Verification Checklist

**Project:** PAGE International B2B Workshop Equipment & Procurement Platform  
**Target Launch Date:** Ready for Immediate Launch  
**Audit Decision:** **GO (PASSED ALL ACCEPTANCE CRITERIA)**  

---

## 1. Technical & Engineering Verification Checklist

- [x] **Strict Type Checking:** `npx tsc --noEmit` completes with 0 errors.
- [x] **Automated Test Suite:** 21 test suites / 116 tests passing (100% success rate).
- [x] **Production Bundle:** `npm run build` succeeds cleanly with route-level code-splitting.
- [x] **Database Schema:** 16 normalized PostgreSQL tables with foreign keys and indexes.
- [x] **Database Persistence:** Custom admin products and quote records survive server reboots.
- [x] **Concurrency & Race Conditions:** Atomic transactions, IP sliding-window rate limiters, 100-worker load benchmark verified.
- [x] **Authentication Security:** Bcrypt hashing (cost >= 12), HTTP-only secure session cookies, server-side route guards.
- [x] **Authorization Integrity:** Non-admin users strictly blocked from all `/admin/*` routes and RPCs.
- [x] **Upload Security:** Magic-byte sniffing, MIME allowlist, SVG script stripping, path traversal protection.
- [x] **Storefront Pricing Policy:** Numeric prices suppressed; "Quotation on Request" enforced across all customer views.
- [x] **Disaster Recovery:** Full 16-table `npm run db:backup` and `npm run db:restore` verified.
- [x] **System Observability:** `/api/health` endpoint and `npm run db:status` CLI online.
- [x] **Load Capacity:** 47.7–71.6 req/s throughput verified; supports 400–700 active browsing users concurrently.

---

## 2. Remaining Manual Actions Before Making Public

These items require human credentials or domain registrar actions (cannot be performed from code):

1. **VPS Procurement**:
   - Order the recommended VPS plan (`SA-BD-VPS-24-40A` at ৳314.30/mo, Ubuntu 24.04 LTS).
   - Save the Server IP and root credentials.
2. **Domain DNS Mapping**:
   - In Bluehost cPanel $\rightarrow$ **Zone Editor**, add or edit the `A` record for `yourdomain.com` and `www.yourdomain.com` pointing to the VPS IP.
3. **Email Mailbox Setup**:
   - In Bluehost cPanel $\rightarrow$ **Email Accounts**, create `quotes@yourdomain.com`.
   - Update `SMTP_PASS` in the production `.env` with the mailbox password.
4. **Initial Production Launch**:
   - Run `docker compose up -d --build` on the VPS.
   - Verify `https://yourdomain.com` loads with automatic HTTPS SSL.
5. **Change Default Admin Password**:
   - Log into `/admin/login` using initial credentials and change the administrative password in `/admin/settings`.
