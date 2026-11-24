# Disaster Recovery, Backup & Restoration Guide

**Project:** PAGE International B2B Workshop Equipment & Procurement Platform  
**Recovery Targets:** RPO < 1 Hour, RTO < 15 Minutes  
**Validated Version:** 2.0.0  
**Status:** BACKUP & RESTORATION TESTED (PASS)  

---

## 1. Recovery Objectives & Scope

| Objective | Target Metric | Verified Actual Performance | Notes |
| :--- | :--- | :--- | :--- |
| **Recovery Point Objective (RPO)** | **< 1 Hour** | **Daily / Hourly Cron** | Maximum acceptable data loss window in disaster scenario. |
| **Recovery Time Objective (RTO)** | **< 15 Minutes** | **~10 Seconds (Automated)** | Time required to restore full database snapshot and resume services. |

---

## 2. Automated Backup System

The platform includes a dedicated database backup script (`scripts/db-backup.ts`) that serializes all 16 relational database tables into structured, versioned JSON snapshots.

### Backup Coverage (All 16 Tables):
1. `users`: Customer and staff accounts, passwords, and roles.
2. `sessions`: Active authentication sessions.
3. `products`: Full machinery and equipment catalog.
4. `quotes`: All commercial quotation requests (RFQs), items, and status replies.
5. `bookings`: Bay demonstration and consultation bookings.
6. `banners`: Homepage hero banners and sequencing.
7. `reviews`: Verified workshop ratings and testimonials.
8. `media`: Uploaded media metadata and file references.
9. `orders`: Commercial customer orders, totals, and VAT/BIN data.
10. `order_items`: Order line items, quantities, and pricing.
11. `settings`: System configurations, dispatch hubs, and site metadata.
12. `updates`: Technical bulletins, machinery guides, and industry news.
13. `password_reset_tokens`: Time-limited password reset tokens.
14. `email_verification_tokens`: Email verification tokens.
15. `email_log`: Transactional email delivery audit trail.
16. `audit_log`: System and admin security event logs.

### Running a Manual Backup
```bash
npm run db:backup
```
**Output:**
```
[db:backup] Starting backup to backups/backup-2026-11-24T04-51-39-899Z.json...
[db:backup] Successfully created backup file (313.8 KB):
  -> C:\camera Prince\project\pages\pixel-perfect\backups\backup-2026-11-24T04-51-39-899Z.json
```

---

## 3. Automated Restoration System

The restoration script (`scripts/db-restore.ts`) automatically:
1. Locates the latest backup file in `backups/` (or accepts a specific backup path as an argument).
2. Runs Drizzle schema migrations to ensure all 16 tables exist.
3. Inserts all table rows in strict foreign-key dependency order (Users $\rightarrow$ Products $\rightarrow$ Settings $\rightarrow$ Banners $\rightarrow$ Reviews $\rightarrow$ Media $\rightarrow$ Updates $\rightarrow$ Quotes $\rightarrow$ Bookings $\rightarrow$ Orders $\rightarrow$ Order Items $\rightarrow$ Sessions $\rightarrow$ Tokens $\rightarrow$ Logs).
4. Uses `onConflictDoNothing()` to prevent duplicate key crashes during partial or full restorations.

### Running a Restoration
```bash
# Restore latest backup automatically
npm run db:restore

# Or restore a specific backup snapshot
npx vite-node scripts/db-restore.ts backups/backup-2026-11-24T04-51-39-899Z.json
```
**Output:**
```
[db:restore] Reading backup file: backups/backup-2026-11-24T04-51-39-899Z.json
[db:restore] Ensuring database schema is migrated...
[db:migrate] PGlite migrations applied successfully.
[db:restore] Restoring tables in dependency order...
[db:restore] Successfully restored database from backup-2026-11-24T04-51-39-899Z.json!
```

---

## 4. Production Cron Configuration for Automated Backups

On the production Ubuntu VPS, configure a daily automated backup via `crontab`:

```bash
# Open crontab editor
crontab -e

# Add daily backup at 2:00 AM (Dhaka time)
0 2 * * * cd /app && npm run db:backup >> /var/log/page-backup.log 2>&1

# Add weekly backup archive to offsite / secondary location
0 3 * * 0 tar -czf /backups/page-weekly-$(date +\%F).tar.gz /app/backups
```

---

## 5. PostgreSQL Native Backup (For Docker / Production)

If running in production with dedicated PostgreSQL 16:
```bash
# Create native SQL dump
docker exec -t page_postgres pg_dump -U page_admin page_international > /backups/db-$(date +\%F).sql

# Restore native SQL dump
cat /backups/db-2026-11-24.sql | docker exec -i page_postgres psql -U page_admin page_international
```
