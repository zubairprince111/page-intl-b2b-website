# PAGE International — Production VPS Deployment Runbook

This guide covers deploying the PAGE International digital platform onto a production Linux Virtual Private Server (Ubuntu 22.04 / 24.04 LTS) using Docker Compose and Caddy.

---

## 1. VPS Provisioning & Host Preparation

### Minimum Recommended Specs
- **CPU:** 2 vCPUs
- **RAM:** 4 GB (2 GB minimum with swap)
- **Disk:** 40 GB NVMe SSD
- **OS:** Ubuntu 22.04 LTS or 24.04 LTS x64

### Initial Server Hardening

```bash
# Update base system
sudo apt update && sudo apt upgrade -y

# Install essential utilities
sudo apt install -y curl git ufw fail2ban htop unzip

# Configure Uncomplicated Firewall (UFW)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (Caddy ACME)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Install Docker Engine & Compose Plugin

```bash
# Install Docker official repository
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Allow non-root deploy user
sudo usermod -aG docker $USER
```

---

## 2. Repository Deployment

```bash
# Clone repository
sudo mkdir -p /var/www/page-platform
sudo chown -R $USER:$USER /var/www/page-platform
cd /var/www/page-platform
git clone <repository-url> .
git checkout production-hardening

# Configure production environment variables
cp .env.example .env
nano .env
```

### Essential `.env` Variables for VPS

```ini
NODE_ENV=production
PORT=8080
DOMAIN=page-bd.com
APP_URL=https://page-bd.com

# PostgreSQL Container Credentials
POSTGRES_USER=page_admin
POSTGRES_PASSWORD=GENERATE_A_64_CHAR_RANDOM_PASSWORD_HERE
POSTGRES_DB=page_production
DATABASE_URL=postgres://page_admin:GENERATE_A_64_CHAR_RANDOM_PASSWORD_HERE@postgres:5432/page_production

# Bootstrap Administrator
DEFAULT_ADMIN_EMAIL=admin@page-bd.com
DEFAULT_ADMIN_PASSWORD=GENERATE_A_SECURE_ADMIN_PASSWORD_HERE

# Production Email (SMTP or Resend)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=YOUR_SENDGRID_OR_POSTMARK_KEY
EMAIL_FROM="PAGE International" <procurement@page-bd.com>
```

---

## 3. Launching Containers & Running Migrations

```bash
# Build images and start all services
docker compose up -d --build

# Run database migrations
docker compose exec app npm run db:migrate

# Seed database with initial catalog & bootstrap admin account
docker compose exec app npm run db:seed

# Verify container health
docker compose ps
curl -f http://localhost/api/health
```

---

## 4. Automated Daily Database Backup

Create an automated cron job to backup the PostgreSQL database daily:

```bash
sudo mkdir -p /var/backups/page-platform
sudo chmod 700 /var/backups/page-platform

# Add backup script to crontab
crontab -e
```

Add the following entry to backup every morning at 03:00 AM:

```cron
0 3 * * * docker compose -f /var/www/page-platform/docker-compose.yml exec -T app npm run db:backup > /dev/null 2>&1
```

### Manual Backup & Restore Procedures

```bash
# To run a manual backup:
docker compose exec app npm run db:backup

# To restore from a specific backup file:
docker compose exec app npx vite-node scripts/db-restore.ts backups/page-backup-2026-11-09T10-00-00.json
```

---

## 5. Zero-Downtime Application Updates

When updating to a new version:

```bash
cd /var/www/page-platform
git pull origin production-hardening

# Rebuild and reload app service
docker compose build app
docker compose up -d --no-deps app

# Apply any pending database schema migrations
docker compose exec app npm run db:migrate

# Check health endpoint
curl -f https://page-bd.com/api/health
```

---

## 6. Troubleshooting & Diagnostics

```bash
# View real-time logs across all services
docker compose logs -f

# Check application service logs specifically
docker compose logs -f app

# Inspect Caddy edge proxy TLS handshake & access logs
docker compose logs -f caddy

# Verify database connection and table counts
docker compose exec app npm run db:status
```
