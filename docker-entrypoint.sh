#!/bin/sh
set -e

echo "=========================================================="
echo " Starting PAGE International B2B Platform (Production)..."
echo "=========================================================="

# 1. Wait for PostgreSQL if a database URL is provided
if [ -n "$DATABASE_URL" ]; then
  echo "Waiting for PostgreSQL database to be accessible..."
  until node -e "
  const postgres = require('postgres');
  const sql = postgres(process.env.DATABASE_URL, { connect_timeout: 3, max: 1 });
  sql\`SELECT 1\`.then(() => { process.exit(0); }).catch(() => { process.exit(1); });
  " 2>/dev/null; do
    echo "PostgreSQL is unavailable - sleeping 2 seconds..."
    sleep 2
  done
  echo "PostgreSQL is connected and healthy."
fi

# 2. Run Database Migrations & Idempotent Initial Seed
echo "Synchronizing database schema & initial seed data..."
npx vite-node src/db/seed.ts

# 3. Start Nitro Production Web Server
echo "Starting application server on port ${PORT:-8080}..."
exec node .output/server/index.mjs
