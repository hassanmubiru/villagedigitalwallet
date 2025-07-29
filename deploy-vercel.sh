#!/bin/bash

# Village Digital Wallet - Vercel Deployment Script
echo "🚀 Deploying Village Digital Wallet to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
vercel whoami > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Please login to Vercel:"
    vercel login
fi

# Build the project locally first to check for errors
echo "🔧 Installing dependencies with legacy peer deps..."
npm install --legacy-peer-deps

echo "🔧 Building project locally..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors before deploying."
    exit 1
fi

echo "✅ Local build successful!"

# Deploy to Vercel
echo "📦 Deploying to Vercel..."
vercel --prod

echo "🎉 Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Go to your Vercel dashboard"
echo "2. Set up environment variables in Project Settings"
echo "3. Add the following required variables:"
echo "   - NEXT_PUBLIC_THIRDWEB_CLIENT_ID"
echo "   - THIRDWEB_SECRET_KEY"
echo "   - NEXT_PUBLIC_CELO_NETWORK"
echo ""
echo "💡 See VERCEL_DEPLOYMENT.md for detailed instructions"
