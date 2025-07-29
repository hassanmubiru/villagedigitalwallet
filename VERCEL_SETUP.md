# Vercel Environment Variables Setup

## Required Environment Variables

Add these variables in your Vercel dashboard under Settings → Environment Variables:

### Production Environment Variables

```bash
# Required Thirdweb Configuration
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=11cd270615f1968861313dbd6d968954
THIRDWEB_SECRET_KEY=RIwRQuhofZYW9yfaUV_XTCZdtKElpcKDSRlpjjgxxSiiHI1ykC1h2rINjlEYNNshqOt81fzeuNfpfu_PuSaLZg

# Required Celo Network Configuration
NEXT_PUBLIC_CELO_NETWORK=alfajores
NEXT_PUBLIC_CELO_RPC_URL=https://alfajores-forno.celo-testnet.org
NEXT_PUBLIC_CELO_TOKEN_ADDRESS=0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1
```

## Setup Steps

1. Go to https://vercel.com/dashboard
2. Select your villagedigitalwallet project
3. Navigate to Settings → Environment Variables
4. Add each variable above (one by one)
5. Set Environment: Production, Preview, Development (check all)
6. Click "Save" for each variable
7. Redeploy your project (Vercel will automatically redeploy when you save environment variables)

## Notes

- The project is currently using Celo Alfajores testnet
- For production, you can change NEXT_PUBLIC_CELO_NETWORK to "celo" and NEXT_PUBLIC_CELO_RPC_URL to "https://forno.celo.org"
- THIRDWEB_SECRET_KEY should be kept secure and not exposed in client-side code
