# Village Digital Wallet - Vercel Deployment

## Environment Variables

Create these environment variables in your Vercel dashboard:

### Required Variables:
- `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`: Your Thirdweb client ID
- `THIRDWEB_SECRET_KEY`: Your Thirdweb secret key
- `NEXT_PUBLIC_CELO_NETWORK`: Set to "alfajores" for testnet or "celo" for mainnet

### Optional Variables:
- `PRIVATE_KEY`: Your wallet private key (for contract deployment)
- `ETHERSCAN_API_KEY`: CeloScan API key for contract verification

## Deployment Steps

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```

4. **Set Environment Variables**:
   Go to your Vercel dashboard → Project Settings → Environment Variables and add the required variables.

5. **Redeploy** (if needed):
   ```bash
   vercel --prod
   ```

## Build Configuration

The project is configured with:
- Next.js 15.4.4 (auto-detected by Vercel)
- TypeScript support
- Tailwind CSS for styling
- Webpack fallbacks for crypto libraries
- API routes for mobile money integration
- Optimized vercel.json configuration

## Deployment Process

### Automatic Detection
Vercel automatically detects Next.js projects and uses the appropriate build settings. The `vercel.json` file provides additional configuration for:
- Environment variable mapping
- Regional deployment preferences
- Custom build optimizations

### Build Command
Vercel will automatically run:
```bash
npm run build
```

### Output Directory
Next.js builds to `.next/` directory which Vercel handles automatically.

## Troubleshooting

### Common Issues:
1. **Build Errors**: Ensure all TypeScript errors are resolved
2. **Environment Variables**: Verify all required variables are set in Vercel dashboard
3. **Import Errors**: Check that all dependencies are properly installed

### Performance Optimization:
- Static assets are automatically optimized by Vercel
- Images are optimized with Next.js Image component
- Code splitting is handled automatically

## Notes

- The application will build and deploy as a static export
- Smart contracts are deployed separately to Celo network
- Frontend connects to pre-deployed contracts via ABI files
