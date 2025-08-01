# Village Digital Wallet - Production Deployment Guide

## 🚀 Overview
This guide covers deploying the Village Digital Wallet system to Celo Mainnet for production use.

## ⚠️ Pre-Deployment Checklist

### 1. Security Audit
- [ ] Smart contracts audited by professional security firm
- [ ] Penetration testing completed
- [ ] Bug bounty program launched
- [ ] Emergency pause mechanisms tested

### 2. Code Review
- [ ] All smart contracts reviewed by multiple developers
- [ ] Frontend security best practices implemented
- [ ] API endpoints secured and rate-limited
- [ ] Environment variables properly configured

### 3. Testing
- [ ] Comprehensive unit tests (>95% coverage)
- [ ] Integration tests on Alfajores testnet
- [ ] User acceptance testing completed
- [ ] Load testing performed
- [ ] Agent onboarding process tested

### 4. Legal & Compliance
- [ ] Legal framework established
- [ ] Regulatory compliance verified
- [ ] Terms of service and privacy policy created
- [ ] KYC/AML procedures implemented
- [ ] Insurance coverage obtained

## 🔧 Mainnet Deployment Steps

### Step 1: Environment Setup

1. **Create Production Environment File**
```bash
# .env.production
NEXT_PUBLIC_NETWORK_NAME=celo
NEXT_PUBLIC_CHAIN_ID=42220
NEXT_PUBLIC_RPC_URL=https://forno.celo.org

# Database (Production)
DATABASE_URL=postgresql://[PRODUCTION_DB_URL]

# Security
JWT_SECRET=[SECURE_JWT_SECRET]
ENCRYPTION_KEY=[SECURE_ENCRYPTION_KEY]

# Monitoring
SENTRY_DSN=[SENTRY_DSN]
ANALYTICS_ID=[ANALYTICS_ID]
```

2. **Update Hardhat Configuration**
```javascript
// hardhat.config.js
networks: {
  celo: {
    url: "https://forno.celo.org",
    accounts: [process.env.MAINNET_PRIVATE_KEY],
    chainId: 42220,
    gas: 8000000,
    gasPrice: 50000000000, // 50 gwei initial, use dynamic pricing
  }
}
```

### Step 2: Deploy Smart Contracts

1. **Final Security Check**
```bash
# Run security analysis
npm run security-check
slither contracts/
```

2. **Deploy to Mainnet**
```bash
# Deploy contracts
npx hardhat run scripts/deploy-mainnet.js --network celo

# Verify contracts on Celoscan
npx hardhat verify --network celo [CONTRACT_ADDRESS] [CONSTRUCTOR_ARGS]
```

3. **Initialize Contracts**
```bash
# Set up initial configuration
npx hardhat run scripts/initialize-mainnet.js --network celo
```

### Step 3: Frontend Deployment

1. **Build Production App**
```bash
# Install dependencies
npm ci

# Build for production
npm run build

# Test production build locally
npm start
```

2. **Deploy to Vercel/Netlify**
```bash
# Deploy with environment variables
vercel --prod
# or
netlify deploy --prod
```

### Step 4: Infrastructure Setup

1. **Database Setup**
- Set up production PostgreSQL instance
- Configure connection pooling
- Set up automated backups
- Implement monitoring

2. **Monitoring Setup**
- Set up application monitoring (Sentry)
- Configure uptime monitoring
- Set up contract event monitoring
- Create alerting system

3. **CDN & Performance**
- Configure CDN for static assets
- Set up caching strategies
- Implement performance monitoring
- Configure auto-scaling

## 🛡️ Security Considerations

### Smart Contract Security
- Use multi-signature wallets for admin functions
- Implement timelock delays for critical changes
- Set up emergency pause mechanisms
- Monitor for unusual activity

### Frontend Security
- Implement Content Security Policy (CSP)
- Use HTTPS everywhere
- Secure API endpoints
- Implement rate limiting

### Operational Security
- Use hardware wallets for admin keys
- Implement secure key management
- Regular security audits
- Incident response plan

## 📊 Monitoring & Analytics

### Contract Monitoring
```javascript
// Monitor contract events
const monitorContracts = async () => {
  // Monitor user registrations
  villageWallet.on("UserRegistered", (user, phone, country) => {
    analytics.track("user_registered", { user, country });
  });
  
  // Monitor transactions
  villageWallet.on("TransferMade", (from, to, token, amount) => {
    analytics.track("transfer", { from, to, amount });
  });
  
  // Monitor agent activity
  villageWallet.on("AgentRegistered", (agent, location) => {
    analytics.track("agent_registered", { agent, location });
  });
};
```

### Performance Metrics
- Transaction throughput
- User acquisition rates
- Agent onboarding rates
- Average transaction sizes
- Geographic distribution

## 🚀 Launch Strategy

### Phase 1: Soft Launch
- Deploy to production infrastructure
- Limited user testing with invited participants
- Monitor system performance and stability
- Gather user feedback

### Phase 2: Regional Launch
- Launch in specific regions (e.g., Uganda, Kenya)
- Onboard local agents
- Marketing and user acquisition campaigns
- Partnership with local financial institutions

### Phase 3: Full Launch
- Expand to all supported regions
- Full marketing campaign
- Scale infrastructure based on demand
- Continuous feature development

## 📋 Post-Launch Checklist

### Week 1
- [ ] Monitor system stability
- [ ] Track user onboarding
- [ ] Support agent training
- [ ] Address any critical issues

### Month 1
- [ ] Analyze user behavior
- [ ] Optimize gas usage
- [ ] Scale infrastructure
- [ ] Gather user feedback

### Ongoing
- [ ] Regular security audits
- [ ] Feature development
- [ ] Partnership expansion
- [ ] Regulatory compliance updates

## 🔗 Useful Commands

### Contract Interaction
```bash
# Check contract balances
npx hardhat run scripts/check-balances.js --network celo

# Monitor contract events
npx hardhat run scripts/monitor-events.js --network celo

# Emergency pause (if needed)
npx hardhat run scripts/emergency-pause.js --network celo
```

### Database Management
```bash
# Run migrations
npm run db:migrate

# Backup database
npm run db:backup

# Monitor database performance
npm run db:monitor
```

## 📞 Emergency Contacts

- **Technical Lead**: [Contact Information]
- **Security Team**: [Contact Information]
- **Legal Team**: [Contact Information]
- **Infrastructure Team**: [Contact Information]

## 🔄 Rollback Plan

In case of critical issues:

1. **Immediate Response**
   - Pause affected contracts using emergency functions
   - Stop frontend deployments
   - Notify users via status page

2. **Assessment**
   - Identify root cause
   - Assess impact scope
   - Determine fix requirements

3. **Recovery**
   - Deploy fixes to testnet first
   - Test thoroughly
   - Deploy to production
   - Resume normal operations

## 📚 Additional Resources

- [Celo Documentation](https://docs.celo.org/)
- [Security Best Practices](https://github.com/ConsenSys/smart-contract-best-practices)
- [Production Deployment Guide](https://nextjs.org/docs/deployment)
- [Monitoring Guide](https://docs.sentry.io/)

---

**Note**: This is a comprehensive guide. Adapt based on your specific requirements and regulatory environment.
