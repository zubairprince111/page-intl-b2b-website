# Post-Launch Operational & Maintenance Plan

**Project:** PAGE International B2B Workshop Equipment & Procurement Platform  
**Target Environment:** Production Ubuntu VPS  
**Monitoring Cadence:** First Hour $\rightarrow$ First Day $\rightarrow$ First Week $\rightarrow$ Monthly  

---

## 1. First-Hour Post-Launch Runbook

Immediately after pointing the domain DNS and running `docker compose up -d --build`:
1. **Verify SSL Provisioning:**
   - Open browser and navigate to `https://yourdomain.com`.
   - Confirm padlock icon is present and valid Let's Encrypt certificate is active.
2. **Execute End-to-End Smoke Test:**
   - Browse `/shop` and open 3 different products.
   - Click **Get Quote**, submit an RFQ with your test email, and verify that the confirmation email is delivered.
   - Log into `/admin/login` with your admin credentials.
   - Verify the newly created quote appears in `/admin/quotes`.
3. **Inspect Server Logs:**
   ```bash
   docker compose logs -f --tail=100
   ```
   Confirm zero unhandled exceptions or 500 status codes.

---

## 2. First-Day Operational Review

1. **Check System Health:**
   - Query `https://yourdomain.com/api/health` or run `npm run db:status` on the server.
2. **Review Database Growth:**
   - Verify table counts for `quotes`, `bookings`, `orders`, and `sessions`.
3. **Verify Automated Backup:**
   - Execute a test backup: `npm run db:backup`.
   - Confirm a new JSON snapshot is saved in `backups/`.

---

## 3. First-Week Post-Launch Review

1. **Traffic & Latency Analysis:**
   - Review server metrics: average CPU utilization should remain below 20%, RAM below 1.5 GB.
2. **Email Deliverability Audit:**
   - Inspect `email_log` table to ensure 100% of quote and booking notification emails have status `'SENT'`.
3. **Uptime Verification:**
   - Verify external uptime monitor reports > 99.9% availability.

---

## 4. Ongoing Monthly Maintenance Schedule

- **First Monday of Every Month:**
  1. Run OS security updates: `apt-get update && apt-get upgrade -y`.
  2. Prune dangling Docker images: `docker image prune -f`.
  3. Archive monthly backups to an offsite location or local machine.
  4. Review `audit_log` for any suspicious failed authentication spikes.
