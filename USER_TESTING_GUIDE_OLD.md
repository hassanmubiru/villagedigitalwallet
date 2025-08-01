# Village Digital Wallet - User Testing Guide

## 🧪 Testing Overview

This guide provides comprehensive test scenarios for the Village Digital Wallet system on Celo Alfajores testnet.

## 🌐 Test Environment

- **Network**: Celo Alfajores Testnet
- **Chain ID**: 44787
- **Frontend**: http://localhost:3000/test
- **Block Explorer**: https://alfajores.celoscan.io

## 📋 Pre-Testing Setup

### 1. Get Test Funds
```bash
# Get CELO from Alfajores faucet
https://faucet.celo.org/alfajores

# Or use CLI
celocli account:faucet --account [YOUR_ADDRESS] --network alfajores
```

### 2. Wallet Setup
- Install MetaMask or use WalletConnect
- Add Celo Alfajores network
- Import test account or create new one

### 3. Contract Addresses
```
VillageToken: 0xa7AE12fAf279a66A2802533f2C7139bB7f4Dfe28
VillageWallet: 0x823c8333E17a9A06096F996725673246538EAf40
SavingsGroups: 0x4b51C5a8b900D61b45a34d397e14a64b16D300C7
MicroloanSystem: 0x36032e35049038B0661D14DE92D4aBfBbD15A357
```

## 🧑‍💼 Test Agents
Pre-registered test agents for cash-in/out testing:

1. **Kampala Mobile Money Hub**
   - Address: `0x94975C47a93064bB8E1A4eA325361C59CDF8571B`
   - Location: Kampala Central, Uganda
   - Commission: 2%

2. **Nairobi Digital Services**
   - Address: `0x18F333EF44aC1c7e5a0858437DEd34ac548dE53a`
   - Location: Nairobi CBD, Kenya
   - Commission: 2.5%

3. **Lagos Fintech Center**
   - Address: `0xeDF0f04479Dd60e9d0C0FbeF2dF08875334a13b5`
   - Location: Lagos Island, Nigeria
   - Commission: 3%

## 🧪 Test Scenarios

### Scenario 1: User Registration & Wallet Setup

**Objective**: Test user onboarding flow

**Steps**:
1. Connect wallet to application
2. Register user with phone number and country
3. Verify user information is stored correctly
4. Check initial balances (should be 0)

**Expected Results**:
- User successfully registered
- User info displays correctly
- Initial balances are zero
- Registration event emitted

**Test Script**:
```javascript
// Frontend test
await contractInteraction.registerUser("+256701234567", "Uganda");
const userInfo = await contractInteraction.getUserInfo(userAddress);
console.log("User registered:", userInfo);
```

### Scenario 2: Token Transfer & Balance Management

**Objective**: Test basic token operations

**Steps**:
1. Check initial VILLAGE token balance
2. Request tokens from deployer (for testing)
3. Transfer tokens to another address
4. Verify balance updates

**Expected Results**:
- Balances update correctly
- Transfer events emitted
- Gas fees deducted appropriately

### Scenario 3: Savings Group Creation & Participation

**Objective**: Test ROSCA functionality

**Steps**:
1. Create a new savings group
   - Name: "Test Savings Group"
   - Contribution: 0.01 CELO
   - Duration: 30 days
   - Max Members: 5
2. Join the group with another account
3. Make contributions
4. Verify group state updates

**Expected Results**:
- Group created successfully
- Members can join and contribute
- Group balances update correctly
- Contribution schedule enforced

**Test Data**:
```javascript
const groupData = {
  name: "Village Test Group",
  contributionAmount: "0.01", // CELO
  duration: 30, // days
  maxMembers: 5
};
```

### Scenario 4: Microloan Request & Approval

**Objective**: Test lending functionality

**Steps**:
1. Request a microloan
   - Amount: 0.1 CELO
   - Duration: 60 days
   - Collateral: 0.05 CELO
2. Approve loan (as admin/lender)
3. Make partial repayment
4. Track interest calculations

**Expected Results**:
- Loan request created
- Approval process works
- Interest calculated correctly
- Repayment updates loan state

### Scenario 5: Agent Registration & Cash-In/Out

**Objective**: Test agent functionality

**Steps**:
1. Register as a new agent
2. Set up agent profile (location, commission)
3. Simulate cash-in transaction
4. Verify commission distribution
5. Test cash-out process

**Agent Test Data**:
```javascript
const agentData = {
  location: "Test City, Test Country",
  businessName: "Test Money Service",
  commissionRate: 200 // 2%
};
```

### Scenario 6: Multi-User Transaction Flow

**Objective**: Test complete user journey

**Steps**:
1. **User A**: Register and get initial balance
2. **User B**: Register as new user
3. **Agent**: Complete cash-in for User A
4. **User A**: Transfer funds to User B
5. **User B**: Join savings group
6. **User A**: Request microloan
7. Track all transactions and balances

### Scenario 7: Error Handling & Edge Cases

**Objective**: Test system robustness

**Test Cases**:
- Insufficient balance transfers
- Invalid agent registrations
- Duplicate user registrations
- Loan defaults and liquidations
- Network interruptions

## 🔍 Testing Checklist

### ✅ Functional Testing
- [ ] User registration works
- [ ] Token transfers execute correctly
- [ ] Savings groups function properly
- [ ] Microloans process correctly
- [ ] Agent operations work
- [ ] Balance calculations accurate

### ✅ UI/UX Testing
- [ ] Wallet connection smooth
- [ ] Forms validate input correctly
- [ ] Loading states display
- [ ] Error messages clear
- [ ] Transaction confirmations show
- [ ] Responsive design works

### ✅ Performance Testing
- [ ] Transaction speed acceptable
- [ ] Gas costs reasonable
- [ ] Page load times good
- [ ] Concurrent users supported
- [ ] Mobile performance adequate

### ✅ Security Testing
- [ ] Unauthorized access prevented
- [ ] Input validation working
- [ ] Transaction signatures required
- [ ] Admin functions protected
- [ ] Error information not leaked

## 📊 Test Metrics to Track

### User Metrics
- Registration completion rate
- Average session duration
- Feature adoption rates
- User retention rates

### Transaction Metrics
- Transaction success rate
- Average transaction value
- Gas cost per transaction
- Transaction confirmation time

### Agent Metrics
- Agent registration rate
- Cash-in/out volume
- Commission earnings
- Agent activity levels

### System Metrics
- Contract interaction success rate
- Error rates by function
- Network response times
- Contract event emission rates

## 🐛 Bug Reporting Template

When reporting bugs, include:

**Bug Title**: Clear, descriptive title

**Environment**:
- Network: Alfajores Testnet
- Browser: [Browser + Version]
- Wallet: [Wallet Type]
- Contract: [Contract Address]

**Steps to Reproduce**:
1. Step one
2. Step two
3. Step three

**Expected Behavior**: What should happen

**Actual Behavior**: What actually happened

**Screenshots**: If applicable

**Transaction Hash**: If transaction-related

**Console Errors**: Browser console output

**Additional Context**: Any other relevant information

## 🔄 Test Automation

### Automated Test Script Example
```javascript
// test-automation.js
const testScenarios = [
  {
    name: "User Registration",
    test: async () => {
      const result = await registerUser("+256701234567", "Uganda");
      assert(result.success, "User registration failed");
    }
  },
  {
    name: "Token Transfer",
    test: async () => {
      const result = await transferTokens(testAddress, "10");
      assert(result.success, "Token transfer failed");
    }
  }
  // Add more scenarios...
];

// Run all tests
for (const scenario of testScenarios) {
  console.log(`Running: ${scenario.name}`);
  await scenario.test();
  console.log(`✅ ${scenario.name} passed`);
}
```

## 📝 Test Results Documentation

Create test reports including:
- Test execution date/time
- Environment details
- Test case results (pass/fail)
- Performance metrics
- Issues discovered
- Recommendations

## 🚀 Next Testing Phase

After successful Alfajores testing:
1. **Stress Testing**: High-volume transactions
2. **Integration Testing**: Third-party services
3. **Security Testing**: Penetration testing
4. **User Acceptance Testing**: Real user feedback
5. **Pre-production Testing**: Final validation

---

**Happy Testing!** 🧪✨
