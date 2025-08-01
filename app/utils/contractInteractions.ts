import { ethers } from 'ethers';
import { getContractAddress, CONTRACT_ABIS } from './contractAddresses';

// Contract interaction utilities
export class ContractInteraction {
  private provider: ethers.Provider;
  private signer?: ethers.Signer;

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
  }

  // Get contract instance
  private getContract(contractName: string, withSigner = false) {
    const address = getContractAddress(contractName);
    const abi = CONTRACT_ABIS[contractName as keyof typeof CONTRACT_ABIS];
    
    if (!address) {
      throw new Error(`Contract ${contractName} not deployed on current network`);
    }
    
    if (!abi) {
      throw new Error(`ABI not found for contract ${contractName}`);
    }

    const providerOrSigner = withSigner && this.signer ? this.signer : this.provider;
    return new ethers.Contract(address, abi, providerOrSigner);
  }

  // VillageToken interactions
  async getTokenBalance(userAddress: string): Promise<string> {
    const contract = this.getContract('VillageToken');
    const balance = await contract.balanceOf(userAddress);
    return ethers.formatEther(balance);
  }

  async getTokenInfo() {
    const contract = this.getContract('VillageToken');
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply()
    ]);
    
    return {
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply: ethers.formatEther(totalSupply)
    };
  }

  async transferTokens(to: string, amount: string): Promise<ethers.ContractTransactionResponse> {
    const contract = this.getContract('VillageToken', true);
    const amountWei = ethers.parseEther(amount);
    return await contract.transfer(to, amountWei);
  }

  async stakeTokens(amount: string): Promise<ethers.ContractTransactionResponse> {
    const contract = this.getContract('VillageToken', true);
    const amountWei = ethers.parseEther(amount);
    return await contract.stakeTokens(amountWei);
  }

  // VillageWallet interactions
  async registerUser(phoneNumber: string, country: string): Promise<ethers.ContractTransactionResponse> {
    const contract = this.getContract('VillageWallet', true);
    return await contract.registerUser(phoneNumber, country);
  }

  async getUserInfo(userAddress: string) {
    const contract = this.getContract('VillageWallet');
    const userInfo = await contract.getUserInfo(userAddress);
    return {
      phoneNumber: userInfo.phoneNumber,
      country: userInfo.country,
      isRegistered: userInfo.isRegistered,
      isVerified: userInfo.isVerified,
      registrationTime: Number(userInfo.registrationTime),
      totalTransactions: Number(userInfo.totalTransactions),
      creditScore: Number(userInfo.creditScore)
    };
  }

  async getWalletBalance(userAddress: string, tokenAddress: string): Promise<string> {
    const contract = this.getContract('VillageWallet');
    const balance = await contract.getBalance(userAddress, tokenAddress);
    return ethers.formatEther(balance);
  }

  async depositToWallet(tokenAddress: string, amount: string): Promise<ethers.ContractTransactionResponse> {
    const contract = this.getContract('VillageWallet', true);
    const amountWei = ethers.parseEther(amount);
    
    if (tokenAddress === ethers.ZeroAddress) {
      // Native CELO deposit
      return await contract.deposit(tokenAddress, amountWei, { value: amountWei });
    } else {
      // ERC20 token deposit (requires prior approval)
      return await contract.deposit(tokenAddress, amountWei);
    }
  }

  async withdrawFromWallet(tokenAddress: string, amount: string): Promise<ethers.ContractTransactionResponse> {
    const contract = this.getContract('VillageWallet', true);
    const amountWei = ethers.parseEther(amount);
    return await contract.withdraw(tokenAddress, amountWei);
  }

  async transferFromWallet(to: string, tokenAddress: string, amount: string): Promise<ethers.ContractTransactionResponse> {
    const contract = this.getContract('VillageWallet', true);
    const amountWei = ethers.parseEther(amount);
    return await contract.transfer(to, tokenAddress, amountWei);
  }

  // Agent interactions
  async registerAgent(location: string, businessName: string, commissionRate: number): Promise<ethers.ContractTransactionResponse> {
    const contract = this.getContract('VillageWallet', true);
    return await contract.registerAgent(location, businessName, commissionRate);
  }

  async getAgentInfo(agentAddress: string) {
    const contract = this.getContract('VillageWallet');
    const agentInfo = await contract.agents(agentAddress);
    return {
      location: agentInfo.location,
      businessName: agentInfo.businessName,
      commissionRate: Number(agentInfo.commissionRate), // Convert BigInt to number
      isActive: agentInfo.isActive,
      totalVolume: ethers.formatEther(agentInfo.totalVolume), // Handle BigInt properly
      successfulTransactions: Number(agentInfo.successfulTransactions), // Convert BigInt to number
      registrationTime: Number(agentInfo.registrationTime) // Convert BigInt to number
    };
  }

  async cashIn(userAddress: string, tokenAddress: string, amount: string): Promise<ethers.ContractTransactionResponse> {
    const contract = this.getContract('VillageWallet', true);
    const amountWei = ethers.parseEther(amount);
    return await contract.cashIn(userAddress, tokenAddress, amountWei);
  }

  async cashOut(userAddress: string, tokenAddress: string, amount: string): Promise<ethers.ContractTransactionResponse> {
    const contract = this.getContract('VillageWallet', true);
    const amountWei = ethers.parseEther(amount);
    return await contract.cashOut(userAddress, tokenAddress, amountWei);
  }

  // SavingsGroups interactions
  async createSavingsGroup(
    name: string, 
    contributionAmount: string, 
    duration: number, 
    maxMembers: number
  ): Promise<ethers.ContractTransactionResponse> {
    const contract = this.getContract('SavingsGroups', true);
    const amountWei = ethers.parseEther(contributionAmount);
    return await contract.createGroup(name, amountWei, duration, maxMembers);
  }

  async joinSavingsGroup(groupId: number): Promise<ethers.ContractTransactionResponse> {
    const contract = this.getContract('SavingsGroups', true);
    return await contract.joinGroup(groupId);
  }

  async contributeToGroup(groupId: number, amount: string): Promise<ethers.ContractTransactionResponse> {
    const contract = this.getContract('SavingsGroups', true);
    const amountWei = ethers.parseEther(amount);
    return await contract.contribute(groupId, { value: amountWei });
  }

  async getSavingsGroup(groupId: number) {
    const contract = this.getContract('SavingsGroups');
    const group = await contract.getGroup(groupId);
    return {
      name: group.name,
      creator: group.creator,
      contributionAmount: ethers.formatEther(group.contributionAmount),
      duration: Number(group.duration),
      maxMembers: Number(group.maxMembers),
      currentMembers: Number(group.currentMembers),
      totalContributions: ethers.formatEther(group.totalContributions),
      isActive: group.isActive,
      creationTime: Number(group.creationTime)
    };
  }

  async getUserSavingsGroups(userAddress: string): Promise<number[]> {
    const contract = this.getContract('SavingsGroups');
    const groupIds = await contract.getUserGroups(userAddress);
    return groupIds.map((id: bigint) => Number(id));
  }

  // MicroloanSystem interactions
  async requestLoan(
    amount: string, 
    duration: number, 
    collateralAmount: string
  ): Promise<ethers.ContractTransactionResponse> {
    const contract = this.getContract('MicroloanSystem', true);
    const amountWei = ethers.parseEther(amount);
    const collateralWei = ethers.parseEther(collateralAmount);
    return await contract.requestLoan(amountWei, duration, collateralWei);
  }

  async approveLoan(loanId: number): Promise<ethers.ContractTransactionResponse> {
    const contract = this.getContract('MicroloanSystem', true);
    return await contract.approveLoan(loanId);
  }

  async repayLoan(loanId: number, amount: string): Promise<ethers.ContractTransactionResponse> {
    const contract = this.getContract('MicroloanSystem', true);
    const amountWei = ethers.parseEther(amount);
    return await contract.repayLoan(loanId, amountWei, { value: amountWei });
  }

  async getLoan(loanId: number) {
    const contract = this.getContract('MicroloanSystem');
    const loan = await contract.getLoan(loanId);
    return {
      borrower: loan.borrower,
      amount: ethers.formatEther(loan.amount),
      interestRate: Number(loan.interestRate),
      duration: Number(loan.duration),
      collateralAmount: ethers.formatEther(loan.collateralAmount),
      repaidAmount: ethers.formatEther(loan.repaidAmount),
      startTime: Number(loan.startTime),
      isActive: loan.isActive,
      isApproved: loan.isApproved
    };
  }

  async getUserLoans(userAddress: string): Promise<number[]> {
    const contract = this.getContract('MicroloanSystem');
    const loanIds = await contract.getUserLoans(userAddress);
    return loanIds.map((id: bigint) => Number(id));
  }

  // Utility functions
  async estimateGas(contractName: string, methodName: string, params: any[] = []): Promise<string> {
    const contract = this.getContract(contractName, true);
    const gasEstimate = await contract[methodName].estimateGas(...params);
    return ethers.formatUnits(gasEstimate, 'gwei');
  }

  async waitForTransaction(tx: ethers.ContractTransactionResponse) {
    const receipt = await tx.wait();
    return {
      hash: tx.hash,
      blockNumber: receipt?.blockNumber,
      gasUsed: receipt?.gasUsed ? ethers.formatUnits(receipt.gasUsed, 'gwei') : '0',
      status: receipt?.status === 1 ? 'success' : 'failed'
    };
  }
}

// Factory function to create contract interaction instance
export const createContractInteraction = (provider: ethers.Provider, signer?: ethers.Signer) => {
  return new ContractInteraction(provider, signer);
};

// Error handling utilities
export const handleContractError = (error: any) => {
  if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
    return 'Transaction may fail. Please check your inputs and try again.';
  }
  if (error.code === 'INSUFFICIENT_FUNDS') {
    return 'Insufficient funds for this transaction.';
  }
  if (error.code === 'USER_REJECTED') {
    return 'Transaction was rejected by user.';
  }
  if (error.message.includes('revert')) {
    return `Contract error: ${error.reason || error.message}`;
  }
  return `Transaction failed: ${error.message}`;
};
