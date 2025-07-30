#!/bin/bash

# Village Digital Wallet - Quick Deploy to Vercel
# This script will deploy your project to Vercel with optimized settings

echo "🚀 Starting Village Digital Wallet deployment to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
fi

# Install dependencies
echo "📦 Installing dependencies with legacy peer deps support..."
npm install --legacy-peer-deps

# Run build to ensure everything works
echo "🔨 Testing build process..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful! Deploying to Vercel..."
    
    # Deploy to Vercel
    vercel --prod
    
    echo "🎉 Deployment completed!"
    echo ""
    echo "📱 Your Village Digital Wallet is now live!"
    echo "🌐 Features included:"
    echo "   ✓ Complete logo system (SVG assets)"
    echo "   ✓ Comprehensive README documentation" 
    echo "   ✓ Simplified Celo integration (Thirdweb-based)"
    echo "   ✓ No conflicting dependencies"
    echo "   ✓ Production-optimized build"
    echo ""
    echo "🔧 Next steps:"
    echo "   1. Add your Thirdweb Client ID to environment variables"
    echo "   2. Configure any additional Celo network settings"
    echo "   3. Test wallet connections on the live site"
    
else
    echo "❌ Build failed. Please check the errors above."
    echo "💡 Common issues:"
    echo "   - Missing dependencies: run 'npm install --legacy-peer-deps'"
    echo "   - TypeScript errors: check components and services"
    echo "   - Network timeouts: try running build again"
fi
