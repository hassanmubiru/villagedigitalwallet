#!/bin/bash

echo "🏗️  Setting up Village Digital Wallet Project"
echo "============================================="

# Create the main project directory
PROJECT_DIR="/home/error51/Project/villagedigitalwallet"
echo "📁 Creating project directory: $PROJECT_DIR"
mkdir -p "$PROJECT_DIR"

# Navigate to the project directory
cd "$PROJECT_DIR"

# Create the basic Next.js structure
echo "📦 Creating Next.js project structure..."
mkdir -p app/{components,providers,types,utils}
mkdir -p public

# Create package.json
echo "📄 Creating package.json..."
cat > package.json << 'EOF'
{
  "name": "villagedigitalwallet",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@tailwindcss/postcss": "^4.1.11",
    "@types/node": "^24.1.0",
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "@types/uuid": "^10.0.0",
    "date-fns": "^4.1.0",
    "framer-motion": "^12.23.9",
    "lucide-react": "^0.526.0",
    "next": "^15.4.4",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-icons": "^5.5.0",
    "thirdweb": "^5.105.21",
    "typescript": "^5.8.3",
    "uuid": "^11.1.0"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.21",
    "eslint": "^8.57.1",
    "eslint-config-next": "^15.4.4",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.11"
  }
}
EOF

# Create Next.js config
echo "⚙️  Creating next.config.js..."
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
EOF

# Create PostCSS config
echo "🎨 Creating postcss.config.js..."
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
EOF

# Create Tailwind config
echo "🎨 Creating tailwind.config.js..."
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
    },
  },
  plugins: [],
}
EOF

# Create TypeScript config
echo "🔧 Creating tsconfig.json..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./app/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# Create environment file template
echo "🔐 Creating .env.local.example..."
cat > .env.local.example << 'EOF'
# Thirdweb Configuration
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your-actual-client-id-here

# Optional: Custom RPC endpoints
NEXT_PUBLIC_CELO_RPC_URL=https://forno.celo.org
NEXT_PUBLIC_CELO_ALFAJORES_RPC_URL=https://alfajores-forno.celo-testnet.org
EOF

# Create .gitignore
echo "📝 Creating .gitignore..."
cat > .gitignore << 'EOF'
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
EOF

echo "✅ Project structure created successfully!"
echo "📍 Project location: $PROJECT_DIR"
echo ""
echo "🚀 Next steps:"
echo "1. Open VS Code in the villagedigitalwallet folder"
echo "2. Run: npm install"
echo "3. Copy your .env.local file or create one from .env.local.example"
echo "4. Run: npm run dev"
echo ""
echo "📂 To open in VS Code:"
echo "code $PROJECT_DIR"
