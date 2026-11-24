# Production Deployment & Operations Runbook

**Project:** PAGE International B2B Workshop Equipment & Procurement Platform  
**Target Environment:** Ubuntu 22.04 / 24.04 LTS VPS (e.g. `SA-BD-VPS-24-40A`)  
**Deployment Method:** Docker Compose + Caddy 2 Reverse Proxy  
**Status:** PRODUCTION READY  

---

## 1. Production Prerequisites

- **Server:** 1x Ubuntu 22.04 or 24.04 LTS (64-bit) VPS (Minimum 2 GB RAM, Recommended 4 GB RAM).
- **Network:** 1 Dedicated Public IPv4 address. Ports `80` (HTTP), `443` (HTTPS), and `22` (SSH) open.
- **Domain DNS:** Bluehost / Cloudflare `A` Record pointing to the VPS IPv4 address:
  - `@` $\rightarrow$ `YOUR_VPS_IP`
  - `www` $\rightarrow$ `YOUR_VPS_IP`
- **Mail Server:** SMTP credentials from Bluehost cPanel (`mail.yourdomain.com`) or Resend API key.

---

## 2. Server Initialization (One-Time Setup)

SSH into your new VPS as root:
```bash
ssh root@YOUR_VPS_IP
```

Update system packages and install Docker:
```bash
apt-get update && apt-get upgrade -y
curl -fsSL https://get.docker.com | sh
apt-get install -y git curl
```

Verify Docker installation:
```bash
docker --version
docker compose version
```

---

## 3. Clone Repository & Environment Setup

Clone your repository to `/app`:
```bash
git clone https://github.com/your-org/pixel-perfect.git /app
cd /app
```

Create the production `.env` configuration file:
```bash
cp .env.example .env
nano .env
```

### Complete Production `.env` Template
```env
# ==============================================================================
# PAGE International Production Environment Configuration
# ==============================================================================

# Application & Domain
NODE_ENV=production
PORT=8080
NITRO_PORT=8080
APP_DOMAIN=yourdomain.com
ACME_EMAIL=admin@yourdomain.com
APP_URL=https://yourdomain.com

# PostgreSQL Database Configuration
POSTGRES_USER=page_admin
POSTGRES_PASSWORD=generate_a_strong_password_here_min_24_chars
POSTGRES_DB=page_international
DATABASE_URL=postgresql://page_admin:generate_a_strong_password_here_min_24_chars@postgres:5432/page_international

# Authentication & Session Security
AUTH_SECRET=generate_a_random_32_byte_secret_hex
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=strong_admin_portal_password

# Email Dispatch Configuration (Bluehost SMTP)
MAIL_PROVIDER=smtp
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=quotes@yourdomain.com
SMTP_PASS=your_bluehost_mailbox_password
EMAIL_FROM="PAGE International <quotes@yourdomain.com>"
MAIL_ADMIN_NOTIFICATION=sales@yourdomain.com

# Quotation Security
REQUIRE_QUOTE_EMAIL_OTP=auto
```

---

## 4. Launching the Production Application

Start all services in detached mode:
```bash
docker compose up -d --build
```

### What Happens Automatically:
1. `page_postgres`: Boots PostgreSQL 16 on persistent volume `postgres_data`.
2. `page_app`: Waits for PostgreSQL healthcheck, runs `drizzle/` migrations, executes initial idempotent database seed (`npx vite-node src/db/seed.ts`), and boots Nitro on port 8080.
3. `page_caddy`: Binds ports 80/443, provisions a free SSL certificate from Let's Encrypt for `yourdomain.com`, enables zstd/gzip compression, and proxies traffic to `page_app:8080`.

Verify running containers:
```bash
docker compose ps
```
You should see:
- `page_caddy` (Up, ports 80, 443)
- `page_app` (Up, healthy)
- `page_postgres` (Up, healthy)

---

## 5. Routine Maintenance Commands

### Viewing Real-Time Logs
```bash
# View combined logs
docker compose logs -f

# View application logs only
docker compose logs -f app

# View reverse proxy logs
docker compose logs -f caddy
```

### Deploying Application Updates
```bash
cd /app
git pull origin main
docker compose build app
docker compose up -d --no-deps app
```

### Restarting Services
```bash
docker compose restart app
```

### Rolling Back to Previous Version
```bash
cd /app
git checkout <PREVIOUS_COMMIT_OR_TAG>
docker compose build app
docker compose up -d --no-deps app
```
