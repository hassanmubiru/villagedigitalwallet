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
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps || npm install --force

# Install Celo specific packages
echo "🌐 Installing Celo Composer packages..."
npm install @celo/react-celo@5.0.4 @celo-tools/use-contractkit@3.1.0 @celo/contractkit@3.2.0 --force

# Fix any potential issues
echo "🔍 Fixing potential issues..."
npm audit fix --force || true

# Build the project
echo "📦 Building the project..."
npm run build

# Start the development server
echo "🚀 Starting development server..."
echo "📱 Access the app at http://localhost:3000"
npm run dev
