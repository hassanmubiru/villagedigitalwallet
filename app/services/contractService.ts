import { CeloService } from './celoService';
import SavingsGroupAbi from '../abis/SavingsGroup.json';
import MicroloanSystemAbi from '../abis/MicroloanSystem.json';
import { getContractAddresses } from '../utils/contractAddresses';

export class ContractService {
  private celoService: CeloService;
  private addresses: any;
  
  constructor(networkName: string = 'alfajores') {
    this.celoService = new CeloService(networkName as any);
    this.addresses = getContractAddresses(networkName);
  }
  
  /**
   * Connect wallet to the service
   * @param address User wallet address
   * @param provider Web3 provider
   */
  public async connect(address: string, provider: any): Promise<void> {
    await this.celoService.connectWithWallet(address, provider);
  }

  /**
   * Get SavingsGroup contract instance
   * @returns Contract instance
   */
  private async getSavingsGroupContract() {
    try {
      const kit = await this.celoService.getKit();
      return new kit.web3.eth.Contract(
        SavingsGroupAbi as any,
        this.addresses.savingsGroup
      );
    } catch (error) {
      console.error('Error getting SavingsGroup contract:', error);
      throw new Error('Failed to initialize SavingsGroup contract');
    }
  }

  /**
   * Get MicroloanSystem contract instance
   * @returns Contract instance
   */
  private async getMicroloanSystemContract() {
    try {
      const kit = await this.celoService.getKit();
      return new kit.web3.eth.Contract(
        MicroloanSystemAbi as any,
        this.addresses.microloanSystem
      );
    } catch (error) {
      console.error('Error getting MicroloanSystem contract:', error);
      throw new Error('Failed to initialize MicroloanSystem contract');
    }
  }

  /**
   * Get SavingsGroup name
   * @returns Name of the group
   */
  public async getSavingsGroupName(): Promise<string> {
    const contract = await this.getSavingsGroupContract();
    return await contract.methods.name().call();
  }

  /**
   * Get SavingsGroup balance
   * @returns Balance in wei
   */
  public async getSavingsGroupBalance(): Promise<string> {
    const contract = await this.getSavingsGroupContract();
    return await contract.methods.getBalance().call();
  }

  /**
   * Get SavingsGroup members
   * @returns Array of member addresses
   */
  public async getSavingsGroupMembers(): Promise<string[]> {
    const contract = await this.getSavingsGroupContract();
    return await contract.methods.getMembers().call();
  }

  /**
   * Check if an address is a member of the SavingsGroup
   * @param address User address
   * @returns True if the address is a member
   */
  public async isMember(address: string): Promise<boolean> {
    const contract = await this.getSavingsGroupContract();
    return await contract.methods.isMember(address).call();
  }

  /**
   * Join the SavingsGroup
   * @returns Transaction receipt
   */
  public async joinSavingsGroup(): Promise<any> {
    try {
      const contract = await this.getSavingsGroupContract();
      const kit = await this.celoService.getKit();
      
      // Get contribution amount
      const contributionAmount = await contract.methods.contributionAmount().call();
      
      // First approve the token transfer
      const cUSDContract = await kit.contracts.getStableToken();
      const approveTx = await cUSDContract.approve(
        this.addresses.savingsGroup,
        contributionAmount
      ).send({ from: kit.defaultAccount });
      await approveTx.waitReceipt();
      
      // Then join the group
      const tx = await contract.methods.joinGroup().send({ 
        from: kit.defaultAccount
      });
      
      return await tx;
    } catch (error) {
      console.error('Error joining savings group:', error);
      throw new Error('Failed to join savings group');
    }
  }

  /**
   * Make a contribution to the SavingsGroup
   * @returns Transaction receipt
   */
  public async makeContribution(): Promise<any> {
    try {
      const contract = await this.getSavingsGroupContract();
      const kit = await this.celoService.getKit();
      
      // Get contribution amount
      const contributionAmount = await contract.methods.contributionAmount().call();
      
      // First approve the token transfer
      const cUSDContract = await kit.contracts.getStableToken();
      const approveTx = await cUSDContract.approve(
        this.addresses.savingsGroup,
        contributionAmount
      ).send({ from: kit.defaultAccount });
      await approveTx.waitReceipt();
      
      // Then make the contribution
      const tx = await contract.methods.contribute().send({ 
        from: kit.defaultAccount
      });
      
      return await tx;
    } catch (error) {
      console.error('Error making contribution:', error);
      throw new Error('Failed to make contribution');
    }
  }

  /**
   * Request a loan from the MicroloanSystem
   * @param amount Loan amount in wei
   * @param duration Loan duration in seconds
   * @returns Transaction receipt
   */
  public async requestLoan(amount: string, duration: number): Promise<any> {
    try {
      const contract = await this.getMicroloanSystemContract();
      const kit = await this.celoService.getKit();
      
      const tx = await contract.methods.requestLoan(amount, duration).send({ 
        from: kit.defaultAccount
      });
      
      return await tx;
    } catch (error) {
      console.error('Error requesting loan:', error);
      throw new Error('Failed to request loan');
    }
  }

  /**
   * Get loan details from the MicroloanSystem
   * @param loanId Loan ID
   * @returns Loan details object
   */
  public async getLoanDetails(loanId: number): Promise<any> {
    const contract = await this.getMicroloanSystemContract();
    const loanDetails = await contract.methods.getLoan(loanId).call();
    
    // Convert status number to string for better readability
    const statusMap = ['Pending', 'Approved', 'Repaid', 'Defaulted', 'Denied'];
    const statusString = statusMap[parseInt(loanDetails.status)] || 'Unknown';
    
    return {
      ...loanDetails,
      statusString
    };
  }

  /**
   * Get all loans for the current user
   * @returns Array of loan IDs
   */
  public async getUserLoans(): Promise<number[]> {
    try {
      const contract = await this.getMicroloanSystemContract();
      const kit = await this.celoService.getKit();
      
      return await contract.methods.getUserLoans(kit.defaultAccount).call();
    } catch (error) {
      console.error('Error fetching user loans:', error);
      throw new Error('Failed to fetch user loans');
    }
  }

  /**
   * Repay a loan
   * @param loanId Loan ID
   * @returns Transaction receipt
   */
  public async repayLoan(loanId: number): Promise<any> {
    try {
      const contract = await this.getMicroloanSystemContract();
      const kit = await this.celoService.getKit();
      
      // Get loan details to determine repayment amount
      const loanDetails = await this.getLoanDetails(loanId);
      const repaymentAmount = (BigInt(loanDetails.amount) + BigInt(loanDetails.interestAmount)).toString();
      
      // First approve the token transfer
      const cUSDContract = await kit.contracts.getStableToken();
      const approveTx = await cUSDContract.approve(
        this.addresses.microloanSystem,
        repaymentAmount
      ).send({ from: kit.defaultAccount });
      await approveTx.waitReceipt();
      
      // Then repay the loan
      const tx = await contract.methods.repayLoan(loanId).send({ 
        from: kit.defaultAccount
      });
      
      return await tx;
    } catch (error) {
      console.error('Error repaying loan:', error);
      throw new Error('Failed to repay loan');
    }
  }

  /**
   * Get the MicroloanSystem interest rate
   * @returns Interest rate in basis points
   */
  public async getInterestRate(): Promise<string> {
    const contract = await this.getMicroloanSystemContract();
    return await contract.methods.interestRate().call();
  }
}

// Export a default instance
export default new ContractService('alfajores');
