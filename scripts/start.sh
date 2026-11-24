#!/usr/bin/env bash
set -e

cd /DATA/Dockerload/Page-Asia

echo "=== Starting PAGE Asia from /DATA/Dockerload/Page-Asia ==="

# 1. Ensure upload and backup folders exist
mkdir -p .deploy/uploads .deploy/backups
chmod 755 .deploy/uploads 2>/dev/null || true
chmod 700 .deploy/backups 2>/dev/null || true

# 2. Ensure database directory exists
mkdir -p /DATA/Database/Page-Asia 2>/dev/null || sudo mkdir -p /DATA/Database/Page-Asia

# 3. Ensure Docker network exists
docker network create npm_default 2>/dev/null || true

# 4. Build and start containers
docker compose up -d --build

echo ""
echo "=== Containers Started Successfully ==="
docker compose ps
echo ""
echo "To view live logs, run: docker compose logs -f app"
