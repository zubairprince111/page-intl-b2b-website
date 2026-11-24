#!/usr/bin/env bash
set -e

echo "=== PAGE International Production Deployment ==="

# 1. Create production folder and fix permissions
echo "[1/5] Setting up /opt/page-asia..."
sudo mkdir -p /opt/page-asia
sudo chown -R "$USER:$USER" /opt/page-asia

# 2. Sync all files from staging (/DATA/Dockerload/Page-Asia) to /opt/page-asia
echo "[2/5] Copying files from /DATA/Dockerload/Page-Asia to /opt/page-asia..."
cp -rT /DATA/Dockerload/Page-Asia /opt/page-asia

cd /opt/page-asia

# 3. Ensure database, uploads and backups directories exist
echo "[3/5] Checking host volume directories..."
sudo mkdir -p /DATA/Database/Page-Asia 2>/dev/null || true
sudo chmod 700 /DATA/Database/Page-Asia 2>/dev/null || true
mkdir -p .deploy/uploads .deploy/backups
chmod 755 .deploy/uploads
chmod 700 .deploy/backups

# 4. Ensure Docker network npm_default exists
echo "[4/5] Checking Docker network..."
docker network create npm_default 2>/dev/null || true

# 5. Build and launch containers
echo "[5/5] Building and launching Docker stack..."
docker compose up -d --build

echo ""
echo "=== DEPLOYMENT SUCCESSFUL ==="
docker compose ps
echo ""
echo "To view live logs, run: docker compose logs -f app"
