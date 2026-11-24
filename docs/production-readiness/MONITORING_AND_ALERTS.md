# Production Monitoring, Logging & Observability Guide

**Project:** PAGE International B2B Workshop Equipment & Procurement Platform  
**Target Environment:** Production VPS / Cloud Container (Ubuntu Linux)  
**Status:** MONITORING SPECIFICATION DEFINED  

---

## 1. Observability Architecture

Production visibility is structured across three core observability pillars:
1. **Application Health & Readiness Checks**: Endpoint `/api/health` reports status, database connectivity, and uptime.
2. **Structured Transactional Logging**: Clean JSON / formatted log records for all quotation submissions, authentication sessions, and email dispatches.
3. **Audit Trail**: Relational database table `audit_log` tracking all administrative entity modifications, actor IPs, and actions.

---

## 2. Health & Readiness Endpoint (`/api/health`)

The application exposes a production health check at:
```http
GET /api/health
```

### Expected Response:
```json
{
  "status": "ok",
  "timestamp": "2026-11-24T10:45:00.000Z",
  "database": "connected",
  "latencyMs": 4.2,
  "version": "2.0.0",
  "uptimeSeconds": 86400
}
```

### Monitoring via Uptime Monitoring Services
Configure a free monitoring check (e.g. UptimeRobot, Better Uptime, or Cronitor):
- **URL:** `https://yourdomain.com/api/health`
- **Check Interval:** 60 seconds
- **Alert Channel:** Email (`admin@yourdomain.com`) or Telegram / SMS
- **Expected Status:** `200 OK`
- **Keyword Match:** `"status":"ok"`

---

## 3. Database Status & CLI Diagnostics

You can inspect database health and table counts at any time from the server CLI:
```bash
npm run db:status
```
**Output:**
```
=================================================
       PAGE INTERNATIONAL — DATABASE STATUS      
=================================================
Status:              ONLINE (Healthy)
Engine:              PostgreSQL 16 / PGlite
Query Latency:       4 ms
Users:               7 records
Products:            75 records
Banners:             4 records
Reviews:             9 records
Media Files:         93 records
Quotes (RFQs):       3 records
Bookings:            2 records
Orders:              2 records
Articles / Updates:  2 records
Settings Config:     10 records
=================================================
```

---

## 4. Key Metrics & Alert Thresholds

| Metric | Normal Range | Warning Threshold | Critical Alert Action |
| :--- | :--- | :--- | :--- |
| **HTTP Response Time (p95)** | 100 ms – 350 ms | > 600 ms for 5 mins | Investigate database query latency or CPU spike. |
| **HTTP 5xx Error Rate** | < 0.05% | > 1.0% | Check application logs (`docker compose logs app`). |
| **Server CPU Utilization** | 5% – 25% | > 75% for 10 mins | Check for high-volume bot traffic or infinite loops. |
| **Server Memory (RSS)** | 200 MB – 600 MB | > 3.0 GB | Restart application container (`docker compose restart app`). |
| **Disk Space Remaining** | > 20 GB free | < 5 GB free | Clear old Docker images (`docker image prune -a`) & archives. |
| **Email Failure Rate** | 0% | > 2 failures in 1 hour | Check SMTP credentials, mailbox quota, or SPF/DKIM records. |

---

## 5. Security Event & Incident Investigation Runbook

### Scenario A: Repeated Failed Login Attempts
1. Check `audit_log` records:
   ```sql
   SELECT actor_email, ip_address, created_at FROM audit_log WHERE action = 'user.login.failed' ORDER BY created_at DESC LIMIT 50;
   ```
2. The built-in rate limiter automatically throttles excessive attempts to 5 per minute per IP.
3. If necessary, block the malicious IP at the server firewall level:
   ```bash
   ufw deny from MALICIOUS_IP
   ```

### Scenario B: Quotation Email Not Received by Customer
1. Check `email_log` table:
   ```sql
   SELECT recipient, subject, status, error, created_at FROM email_log ORDER BY created_at DESC LIMIT 10;
   ```
2. Verify SMTP connection:
   ```bash
   node scripts/test-smtp.mjs
   ```
3. Check Bluehost mailbox quota or verify customer spam folder.
