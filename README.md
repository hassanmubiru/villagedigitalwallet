# Village Digital Wallet - Mobile-First DeFi for Rural Communities

A comprehensive, mobile-first blockchain-powered digital wallet tailored specifically for rural communities that depend on traditional savings and credit associations (ROSCAs, chamas, table banking). Built with Next.js and Thirdweb on the carbon-negative Celo blockchain.

## 🌟 Key Features

### 💰 **Community Savings Groups (ROSCAs)**
- **Automated Savings Circles**: Create and join traditional savings groups with smart contract automation
- **Transparent Tracking**: Real-time contribution and payout tracking with blockchain transparency
- **Flexible Schedules**: Daily, weekly, or monthly contribution frequencies
- **Group Management**: Admin controls for group creation and member management
- **Round-based Payouts**: Automated fair distribution based on contribution history

### 🏦 **Microloan System**
- **Community Lending**: Borrow from your savings groups with favorable terms
- **Partner Lenders**: Access to verified microfinance institutions
- **Flexible Terms**: Customizable loan duration and interest rates
- **Smart Repayment**: Automated payment tracking and reminders
- **Credit Building**: Build reputation through on-time payments

### 🏆 **Incentive & Rewards System**
- **On-time Payment Rewards**: Earn CELO tokens for timely loan repayments
- **Participation Bonuses**: Get rewards for active group participation
- **Referral Program**: Earn tokens for bringing new users to the platform
- **Milestone Achievements**: Unlock rewards for reaching savings goals
- **Reputation System**: Build trust through consistent financial behavior

### 🌍 **Accessibility Features**
- **Multi-language Support**: English, Kiswahili, French, Spanish
- **Simple Navigation**: Intuitive interface designed for low-literacy users
- **Mobile-First Design**: Optimized for smartphones and basic devices
- **High Contrast Mode**: Better visibility for users with visual impairments
- **Voice Assistance Ready**: Prepared for audio navigation features

### 📱 **Mobile Money Integration**
- **Seamless Cash-In/Out**: Connect with M-Pesa, Airtel Money, Orange Money
- **Local Agent Network**: Find nearby agents for cash transactions
- **Real-time Processing**: Quick conversion between cash and crypto
- **Transaction History**: Complete record of all cash flow activities
- **Multi-provider Support**: Works with major mobile money providers

### 🔒 **Security & Compliance**
- **Identity Verification**: KYC integration for regulatory compliance
- **Secure Transactions**: All transactions secured by Celo blockchain
- **Privacy Protection**: Personal data encrypted and protected
- **Audit Trail**: Complete transaction history for transparency
- **Regulatory Compliance**: Built to meet local financial regulations

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- A Thirdweb account ([sign up here](https://thirdweb.com/dashboard))
- Mobile wallet (MetaMask, Coinbase Wallet, etc.)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd village-digital-wallet
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   ```bash
   cp .env.local.example .env.local
   cp .env.example .env
   ```
   
   Edit `.env.local` and add your Thirdweb client ID:
   ```
   NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your-actual-client-id-here
   ```
   
   Edit `.env` and add your private key for smart contract deployment:
   ```
   PRIVATE_KEY=your-private-key-here
   ```
   
   For contract verification, get a free API key from [CeloScan](https://celoscan.io/register) and add it to your `.env` file:
   ```
   ETHERSCAN_API_KEY=your-celoscan-api-key-here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Getting a Thirdweb Client ID

1. Visit [https://thirdweb.com/dashboard](https://thirdweb.com/dashboard)
2. Sign up or log in to your account
3. Create a new project
4. Copy the Client ID from your project dashboard
5. Add it to your `.env.local` file

## � Smart Contract Deployment

### Deploying to Celo Networks

1. **Setup environment variables:**
   Make sure you have set up your `.env` file with your wallet's private key:
   ```
   PRIVATE_KEY=your-private-key-here
   ```

2. **Run the deployment script:**
   ```bash
   ./deploy.sh --network alfajores
   ```
   This will:
   - Compile your contracts
   - Deploy them to the Celo Alfajores testnet
   - Wait for confirmation
   - Verify contracts on the block explorer
   - Update the contract addresses in your app

3. **Verify deployment:**
   After deployment, you'll see the contract addresses in the terminal output and they will be automatically updated in `app/lib/contractAddresses.js`.

### Available Networks

- `hardhat`: Local development network
- `alfajores`: Celo Alfajores testnet
- `celo`: Celo mainnet (use with caution - real funds!)

### Manual Verification

If contract verification fails during deployment, you can use the interactive manual verification script:
```bash
npx hardhat run scripts/manual-verify.js --network alfajores
```

This script will prompt you for the contract addresses and handle the verification process.

### Getting CELO and cUSD for Testing

For testing on Alfajores testnet, you can get free testnet CELO and cUSD:
1. Visit the [Celo Faucet](https://faucet.celo.org/)
2. Enter your wallet address
3. Request both CELO and cUSD tokens

## �📱 Mobile-First Design

The application is specifically designed for mobile devices commonly used in rural areas:

- **Responsive Layout**: Works on screens from 320px to desktop
- **Touch-Optimized**: Large buttons and touch targets
- **Offline Capability**: Core features work with limited connectivity
- **Low Bandwidth**: Optimized for slow internet connections
- **Progressive Web App**: Can be installed on mobile devices

## 🏘️ Community Features

### Savings Groups (ROSCAs)

Traditional rotating savings and credit associations digitized on the blockchain:

1. **Create Groups**: Set up savings circles with your community
2. **Join Existing Groups**: Find and join established groups
3. **Make Contributions**: Regular automated contributions via smart contracts
4. **Receive Payouts**: Fair, transparent distribution of collected funds
5. **Track Progress**: Real-time visibility into group finances

### Microloan Marketplace

Access to fair, transparent lending:

1. **Group Loans**: Borrow from your savings groups at low interest
2. **Individual Loans**: Access partner lenders for larger amounts
3. **Flexible Terms**: Choose repayment schedules that work for you
4. **Credit History**: Build a reputation for future borrowing
5. **Automated Payments**: Smart contract-based repayment system

## 💳 Financial Services Integration

### Mobile Money Support

Seamless integration with popular mobile money services:

- **M-Pesa (Safaricom)**: Kenya's leading mobile money service
- **Airtel Money**: Cross-border mobile money platform
- **Orange Money**: Popular in West and Central Africa
- **T-Kash (Telkom)**: Alternative Kenya mobile money service

### Local Agent Network

Physical cash-in/cash-out locations:

- **Verified Agents**: Trusted local businesses and individuals
- **Real-time Availability**: See which agents are currently active
- **Ratings System**: Community-driven agent quality assessment
- **Location Services**: Find the nearest agent to your location

## 🛠️ Technical Architecture

### Frontend
- **Next.js 15**: React framework with App Router
- **Thirdweb v5**: Web3 development platform
- **TypeScript**: Type safety and better development experience
- **Tailwind CSS**: Utility-first CSS framework
- **React Icons**: Comprehensive icon library
- **Framer Motion**: Smooth animations and transitions

### Blockchain
- **Celo Mainnet**: Carbon-negative, mobile-first blockchain
- **Celo Alfajores**: Testnet for development and testing
- **Smart Contracts**: Automated savings and lending logic
- **Multi-sig Wallets**: Enhanced security for group funds

### Mobile Integration
- **Progressive Web App**: Installable on mobile devices
- **Mobile Money APIs**: Integration with payment providers
- **Geolocation**: Find nearby agents and services
- **Push Notifications**: Important updates and reminders

## 🌍 Localization

The application supports multiple languages commonly spoken in rural Africa:

- **English**: Global business language
- **Kiswahili**: Widely spoken in East Africa
- **French**: Common in West and Central Africa
- **Spanish**: For Latin American markets

Additional languages can be easily added by extending the translation files.

## 📊 Usage Analytics

Track important metrics for community impact:

- **User Engagement**: Active users and session duration
- **Financial Flow**: Total savings and loan volumes
- **Group Health**: Success rates of savings groups
- **Agent Performance**: Cash-in/out success rates
- **Geographic Distribution**: Service coverage areas

## 🔧 Development

### Project Structure

```
/
├── app/
│   ├── components/           # React components
│   │   ├── Dashboard.tsx     # Main dashboard
│   │   ├── SavingsGroups.tsx # Savings group management
│   │   ├── Loans.tsx         # Microloan interface
│   │   ├── CashInOut.tsx     # Mobile money integration
│   │   ├── WalletConnect.tsx # Wallet connection
│   │   └── ...
│   ├── providers/            # Context providers
│   │   ├── ThirdwebProvider.tsx
│   │   └── LanguageProvider.tsx
│   ├── types/                # TypeScript interfaces
│   ├── utils/                # Utility functions and translations
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── .env.local.example        # Environment variables template
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── package.json              # Dependencies and scripts
└── tsconfig.json             # TypeScript configuration
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Languages

1. Add translations to `app/utils/translations.ts`
2. Update the language selector in components
3. Test all UI elements with new language

### Extending Mobile Money Support

1. Add new provider configurations
2. Implement provider-specific API integrations
3. Update the cash-in/out UI with new options

## 🚢 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed on any platform supporting Next.js:

- Netlify
- AWS Amplify
- Railway
- Digital Ocean App Platform

## 🤝 Contributing

We welcome contributions from the community!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write responsive, mobile-first CSS
- Include proper error handling
- Add internationalization for user-facing text
- Test on multiple screen sizes and devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Community Support
- Join our Discord community
- Follow updates on Twitter
- Check GitHub Discussions for Q&A

### Technical Support
1. Check the [Thirdweb documentation](https://portal.thirdweb.com/)
2. Visit the [Celo documentation](https://docs.celo.org/)
3. Open an issue in this repository

### Business Inquiries
For partnerships, integrations, or business development:
- Email: business@villagewalletapp.com
- LinkedIn: Village Wallet App

## � Smart Contract Deployment

### Prerequisites

- Private key of a wallet with CELO/cUSD funds
- Node.js 18.x or later
- NPM or Yarn

### Setting up for Deployment

1. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your private key:
   ```
   PRIVATE_KEY=your_wallet_private_key_here
   ```

2. **Install deployment dependencies**:
   ```bash
   npm install --save-dev hardhat @nomiclabs/hardhat-ethers @nomiclabs/hardhat-waffle ethereum-waffle ethers solidity-coverage @openzeppelin/hardhat-upgrades dotenv
   ```

3. **Get testnet funds**:
   - For Alfajores (testnet): Use the [Celo Faucet](https://faucet.celo.org)
   - Request both CELO and cUSD tokens

### Deploying Contracts

1. **Deploy to Alfajores testnet**:
   ```bash
   npx hardhat run scripts/deploy.js --network alfajores
   ```

2. **Deploy to Celo mainnet**:
   ```bash
   npx hardhat run scripts/deploy.js --network celo
   ```

### After Deployment

1. **Save contract addresses**:
   - Copy the contract addresses from the deployment console output
   - Store them securely for use in your frontend

2. **Verify contracts on Celoscan**:
   - Contracts are automatically verified during deployment
   - You can manually verify using:
     ```bash
     npx hardhat verify --network alfajores CONTRACT_ADDRESS CONSTRUCTOR_ARGS
     ```

3. **Update frontend configuration**:
   - Add contract addresses to your frontend environment variables

### Contract Interaction

Once deployed, you can interact with your contracts through:

1. **Thirdweb SDK**: Already integrated in your application
2. **Hardhat Console**: 
   ```bash
   npx hardhat console --network alfajores
   ```
3. **Celoscan**: Through the contract read/write interface

## �🗺️ Roadmap

### Phase 1: Core Features ✅
- [x] Wallet connection and management
- [x] Basic savings groups
- [x] Simple microloan system
- [x] Mobile money integration
- [x] Multi-language support

### Phase 2: Advanced Features (Q2 2025)
- [ ] Smart contract deployment for groups
- [ ] Advanced loan approval algorithms
- [ ] Integration with more mobile money providers
- [ ] Enhanced security features
- [ ] Comprehensive analytics dashboard

### Phase 3: Scale & Partnerships (Q3 2025)
- [ ] Partnership with microfinance institutions
- [ ] Integration with government ID systems
- [ ] Cross-border money transfer capabilities
- [ ] Insurance product integration
- [ ] Agricultural loan products

### Phase 4: Ecosystem Expansion (Q4 2025)
- [ ] Merchant payment solutions
- [ ] Supply chain financing
- [ ] Educational savings accounts
- [ ] Community governance features
- [ ] Carbon credit integration

## 🌱 Impact Goals

Our mission is to democratize access to financial services:

- **Financial Inclusion**: Bring 1 million unbanked users into the DeFi ecosystem
- **Community Empowerment**: Support 10,000 active savings groups
- **Economic Growth**: Facilitate $100M in community lending
- **Technology Adoption**: Bridge the gap between traditional and digital finance
- **Sustainability**: Leverage Celo's carbon-negative blockchain for environmental impact

---

Built with ❤️ for rural communities worldwide. Powered by [Celo](https://celo.org) blockchain.
