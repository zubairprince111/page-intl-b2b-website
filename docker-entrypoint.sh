#!/bin/sh
set -e

echo "=========================================================="
echo " Starting PAGE International B2B Platform (Production)..."
echo "=========================================================="

# 1. Wait for PostgreSQL if a database URL is provided
if [ -n "$DATABASE_URL" ]; then
  echo "Waiting for PostgreSQL database to be accessible..."
  until pg_isready -d "$DATABASE_URL" >/dev/null 2>&1; do
    echo "PostgreSQL is unavailable - sleeping 2 seconds..."
    sleep 2
  done
  echo "PostgreSQL is connected and healthy."
fi

# 2. Run Database Migrations & Idempotent Initial Seed
echo "Synchronizing database schema & initial seed data..."
npm run db:seed

# 3. Start Nitro Production Web Server
echo "Starting application server on port ${PORT:-8080}..."
exec node .output/server/index.mjs
