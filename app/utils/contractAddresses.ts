// Contract addresses for deployed Village Digital Wallet contracts
export const CONTRACT_ADDRESSES = {
  alfajores: {
    VillageToken: '0xa7AE12fAf279a66A2802533f2C7139bB7f4Dfe28',
    VillageWallet: '0x823c8333E17a9A06096F996725673246538EAf40',
    SavingsGroups: '0x4b51C5a8b900D61b45a34d397e14a64b16D300C7',
    MicroloanSystem: '0x36032e35049038B0661D14DE92D4aBfBbD15A357',
    // Legacy alias for backwards compatibility
    SavingsGroup: '0x4b51C5a8b900D61b45a34d397e14a64b16D300C7',
  },
  celo: {
    VillageToken: '', // For mainnet deployment
    VillageWallet: '', // For mainnet deployment
    SavingsGroups: '', // For mainnet deployment
    MicroloanSystem: '', // For mainnet deployment
    // Legacy alias for backwards compatibility
    SavingsGroup: '', // For mainnet deployment
  }
};

// Network configurations
export const NETWORK_CONFIG = {
  alfajores: {
    chainId: 44787,
    name: 'Celo Alfajores Testnet',
    rpcUrl: 'https://alfajores-forno.celo-testnet.org',
    explorerUrl: 'https://alfajores.celoscan.io',
    nativeCurrency: {
      name: 'Celo',
      symbol: 'CELO',
      decimals: 18,
    },
  },
  celo: {
    chainId: 42220,
    name: 'Celo Mainnet',
    rpcUrl: 'https://forno.celo.org',
    explorerUrl: 'https://celoscan.io',
    nativeCurrency: {
      name: 'Celo',
      symbol: 'CELO',
      decimals: 18,
    },
  },
};

// Get current network
export const getCurrentNetwork = () => {
  return process.env.NODE_ENV === 'production' ? 'celo' : 'alfajores';
};

// Get contract address for current network
export const getContractAddress = (contractName: string) => {
  const network = getCurrentNetwork();
  const networkContracts = CONTRACT_ADDRESSES[network as keyof typeof CONTRACT_ADDRESSES];
  return networkContracts?.[contractName as keyof typeof networkContracts];
};

// Get all contract addresses for current network
export const getAllContractAddresses = () => {
  const network = getCurrentNetwork();
  return CONTRACT_ADDRESSES[network as keyof typeof CONTRACT_ADDRESSES];
};

// Contract ABIs (simplified for key functions)
export const CONTRACT_ABIS = {
  VillageToken: [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function distributeReward(address recipient, string rewardType) external',
    'function stakeTokens(uint256 amount) external',
    'function unstakeTokens(uint256 amount) external',
    'function claimStakingReward() external'
  ],
  VillageWallet: [
    'function registerUser(string phoneNumber, string country) external',
    'function deposit(address token, uint256 amount) external payable',
    'function withdraw(address token, uint256 amount) external',
    'function transfer(address to, address token, uint256 amount) external',
    'function getBalance(address user, address token) view returns (uint256)',
    'function isUserRegistered(address user) view returns (bool)',
    'function getUserInfo(address user) view returns (tuple(string phoneNumber, string country, bool isRegistered, bool isVerified, uint256 registrationTime, uint256 totalTransactions, uint256 creditScore))',
    'function addSupportedToken(address token) external',
    'function isSupportedToken(address token) view returns (bool)',
    'function registerAgent(string location, string businessName, uint256 commissionRate) external',
    'function agents(address agent) view returns (tuple(string location, string businessName, uint256 commissionRate, bool isActive, uint256 totalVolume, uint256 successfulTransactions, uint256 registrationTime))',
    'function cashIn(address user, address token, uint256 amount) external',
    'function cashOut(address user, address token, uint256 amount) external'
  ],
  SavingsGroups: [
    'function createGroup(string name, uint256 contributionAmount, uint256 duration, uint256 maxMembers) external',
    'function joinGroup(uint256 groupId) external',
    'function contribute(uint256 groupId) external payable',
    'function withdraw(uint256 groupId) external',
    'function getGroup(uint256 groupId) view returns (tuple(string name, address creator, uint256 contributionAmount, uint256 duration, uint256 maxMembers, uint256 currentMembers, uint256 totalContributions, bool isActive, uint256 creationTime))',
    'function getUserGroups(address user) view returns (uint256[])',
    'function getGroupMembers(uint256 groupId) view returns (address[])'
  ],
  MicroloanSystem: [
    'function requestLoan(uint256 amount, uint256 duration, uint256 collateralAmount) external',
    'function approveLoan(uint256 loanId) external',
    'function repayLoan(uint256 loanId, uint256 amount) external payable',
    'function liquidateCollateral(uint256 loanId) external',
    'function getLoan(uint256 loanId) view returns (tuple(address borrower, uint256 amount, uint256 interestRate, uint256 duration, uint256 collateralAmount, uint256 repaidAmount, uint256 startTime, bool isActive, bool isApproved))',
    'function getUserLoans(address user) view returns (uint256[])',
    'function calculateInterest(uint256 loanId) view returns (uint256)'
  ]
};
