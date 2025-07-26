#!/bin/bash

echo "🔧 Village Digital Wallet - Fix and Start Script"
echo "================================================"

# Kill any existing Next.js processes
echo "📍 Stopping any running Next.js processes..."
pkill -f "next dev" 2>/dev/null || true

# Clear Next.js cache
echo "🧹 Clearing Next.js cache..."
rm -rf .next

# Install dependencies if needed
echo "📦 Checking dependencies..."
npm install

# Start the development server
echo "🚀 Starting development server..."
npm run dev
