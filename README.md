# Village Digital Wallet

## 🌍 Problem
**2.5 billion people lack access to basic financial services.** Rural communities face:
- Inaccessible bank branches
- High fees and complex requirements
- Limited technology support

Traditional systems (ROSCAs, mobile money) exist but lack transparency and growth opportunities.

## 💡 Solution
**Village Digital Wallet** enhances traditional community finance with blockchain technology:

- **Blockchain Transparency**: Immutable transaction records on Celo
- **Mobile-First**: Works on basic smartphones, multilingual (4 languages)
- **Social Finance**: Digital ROSCAs with automated tracking
- **Real-World Integration**: M-Pesa, Airtel Money, local agent networks

## 🎯 Mission
Democratize secure, transparent financial services for the unbanked using carbon-negative blockchain technology.

## 🚀 How It Works

### Users
- Create account with phone number
- Join/create savings groups  
- Automated contributions & payouts
- Access microloans & build credit

### Savings Groups
- Digital ROSCAs with smart contracts
- Transparent tracking & automated operations
- Emergency funds & group governance

### Local Agents
- Cash-in/out services for community
- Simple interface & commission earnings

## 🔧 Tech Stack
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Blockchain**: Celo (carbon-negative, mobile-optimized)  
- **Web3**: Thirdweb v5
- **Integration**: Mobile money APIs, smart contracts

## 🌟 Key Features

### 💰 **Community Savings Groups**
- Automated savings circles with smart contracts
- Transparent tracking & flexible schedules
- Round-based payouts & group management

### 🏦 **Microloan System**  
- Community lending with favorable terms
- Partner lenders & flexible repayment
- Credit building through payment history

### 🏆 **Rewards System**
- Payment rewards & participation bonuses
- Referral program & milestone achievements

### 🌍 **Accessibility**
- Multi-language (English, Kiswahili, French, Spanish)
- Mobile-first design for basic smartphones
- High contrast mode & voice assistance ready

### 📱 **Mobile Money Integration**
- M-Pesa, Airtel Money, Orange Money support
- Local agent network for cash transactions
- Real-time processing & transaction history

### 🔒 **Security**
- KYC integration & blockchain-secured transactions
- Privacy protection & audit trails

### 🌐 **Celo Integration**
- Native CELO, cUSD, cEUR support
- Carbon-negative transactions
- Low gas fees for rural communities

## 📋 Use Cases

### Maria's Vegetable Business (Kenya)
- Joins 20-person weekly savings group (chama)
- Contributes 500 KES weekly via M-Pesa
- Receives 10,000 KES payout every 20 weeks
- **Result**: Doubled inventory, 40% income increase

### James's Education Fund (Uganda)  
- Creates education-focused savings group
- Daily contributions of 2,000 UGX
- Emergency loans for motorbike repairs
- **Result**: University tuition saved + emergency fund

### Fatou's Agricultural Cooperative (Senegal)
- Manages cooperative savings transparently
- Seasonal microloans for equipment
- Smart contract profit distribution
- **Result**: 60% yield increase, better market prices

## 🎯 Competitive Advantages

| Feature | Traditional Banks | Other Fintech | Village Digital Wallet |
|---------|------------------|---------------|----------------------|
| **Access** | Limited branches | Urban-focused | Rural-optimized |
| **Requirements** | Complex KYC | Smartphone needed | Phone number only |
| **Group Finance** | Not supported | Individual only | Community-centered |
| **Currency** | Fiat only | Usually fiat | Crypto + Mobile Money |
| **Transparency** | Opaque | Limited | Blockchain-verified |

### Key Differentiators
- Community-first approach around existing social structures
- Hybrid technology combining blockchain with familiar mobile money
- Inclusive design for basic phones and limited digital literacy
- Carbon-negative blockchain with fair transaction fees

## 🌱 Impact Goals

### Targets by 2026
- **1M unbanked users** onboarded
- **10,000 active savings groups**  
- **$100M in community lending**
- **60% women participation**
- **Available in 10 countries**

### Environmental & Social Impact
- Carbon-negative blockchain transactions
- 80% rural user focus (>50km from banks)
- Financial literacy education integrated
- Strengthen existing community bonds

## 🚀 Quick Start

### Prerequisites
- Node.js 18+, npm/yarn
- Thirdweb account ([sign up](https://thirdweb.com/dashboard))

### Installation
```bash
git clone <repo-url>
cd village-digital-wallet
npm install

# Environment setup
cp .env.local.example .env.local
# Add NEXT_PUBLIC_THIRDWEB_CLIENT_ID to .env.local

npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📂 Development

### Project Structure
```
app/
├── components/     # React components (Dashboard, SavingsGroups, etc.)
├── providers/      # Context providers  
├── types/          # TypeScript interfaces
├── utils/          # Utilities & translations
└── globals.css     # Styles
```

### Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - ESLint

### Deployment
- **Vercel**: Connect GitHub repo, add env variables, auto-deploy
- **Other**: Netlify, AWS Amplify, Railway, DigitalOcean

## 🤝 Contributing
1. Fork repository
2. Create feature branch
3. Commit changes  
4. Push & open Pull Request

## 📄 License
MIT License - see [LICENSE](LICENSE) file

## 🆘 Support
- **Technical**: [Thirdweb docs](https://portal.thirdweb.com/), [Celo docs](https://docs.celo.org/)
- **Issues**: Open GitHub issue
- **Business**: business@villagewalletapp.com

---
Built with ❤️ for rural communities worldwide. Powered by [Celo](https://celo.org) blockchain.
