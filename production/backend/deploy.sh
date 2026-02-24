#!/bin/bash
# VPS deployment script - Good Home Backend
set -e

echo "=== Good Home Backend Deployment ==="

# Install dependencies
echo "[1/5] Installing dependencies..."
npm install --production

# Generate Prisma client
echo "[2/5] Generating Prisma client..."
npx prisma generate

# Run migrations (or db push)
echo "[3/5] Applying database schema..."
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  npx prisma migrate deploy
else
  npx prisma db push
fi

# Seed if needed
echo "[4/5] Seeding database..."
npx prisma db seed 2>/dev/null || true

# Create logs dir for PM2
mkdir -p logs

echo "[5/5] Restarting PM2..."
pm2 reload ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production

echo "=== Deployment complete ==="
pm2 status
