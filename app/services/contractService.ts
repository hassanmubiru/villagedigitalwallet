import { CeloService } from './celoService';
import SavingsGroupAbi from '../abis/SavingsGroup.json';
import MicroloanSystemAbi from '../abis/MicroloanSystem.json';
import { getContractAddress, CONTRACT_ADDRESSES } from '../utils/contractAddresses';

export class ContractService {
  private celoService: CeloService;
  private addresses: any;
  
  constructor(networkName: string = 'alfajores') {
    this.celoService = new CeloService(networkName as any);
    this.addresses = CONTRACT_ADDRESSES[networkName as keyof typeof CONTRACT_ADDRESSES] || CONTRACT_ADDRESSES.alfajores;
  }
  
  /**
   * Connect wallet to the service
   */
  public async connect(address: string, provider: any): Promise<void> {
    try {
      await this.celoService.connectWithWallet(provider);
    } catch (error) {
      console.error('Error connecting to Celo:', error);
      throw new Error('Failed to connect to Celo network');
    }
  }

  /**
   * Create a new savings group (mock implementation)
   */
  public async createSavingsGroup(
    name: string,
    description: string,
    contributionAmount: string,
    frequency: string
  ): Promise<any> {
    try {
      console.log('Creating savings group:', { name, description, contributionAmount, frequency });
      
      return {
        success: true,
        groupId: Math.floor(Math.random() * 1000000),
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
        message: 'Savings group created successfully (demo mode)'
      };
    } catch (error) {
      console.error('Error creating savings group:', error);
      throw new Error('Failed to create savings group');
    }
  }

  /**
   * Join a savings group (mock implementation)
   */
  public async joinSavingsGroup(groupId: string): Promise<any> {
    try {
      console.log('Joining savings group:', groupId);
      
      return {
        success: true,
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
        message: 'Successfully joined savings group (demo mode)'
      };
    } catch (error) {
      console.error('Error joining savings group:', error);
      throw new Error('Failed to join savings group');
    }
  }

  /**
   * Make contribution to savings group (mock implementation)
   */
  public async makeContribution(groupId: string, amount: string): Promise<any> {
    try {
      console.log('Making contribution:', { groupId, amount });
      
      return {
        success: true,
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
        message: 'Contribution made successfully (demo mode)'
      };
    } catch (error) {
      console.error('Error making contribution:', error);
      throw new Error('Failed to make contribution');
    }
  }

  /**
   * Request loan (mock implementation)
   */
  public async requestLoan(
    amount: string,
    purpose: string,
    termDays: number
  ): Promise<any> {
    try {
      console.log('Requesting loan:', { amount, purpose, termDays });
      
      return {
        success: true,
        loanId: Math.floor(Math.random() * 1000000),
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
        message: 'Loan request submitted successfully (demo mode)'
      };
    } catch (error) {
      console.error('Error requesting loan:', error);
      throw new Error('Failed to request loan');
    }
  }

  /**
   * Repay loan (mock implementation)
   */
  public async repayLoan(loanId: string, amount: string): Promise<any> {
    try {
      console.log('Repaying loan:', { loanId, amount });
      
      return {
        success: true,
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
        message: 'Loan repayment successful (demo mode)'
      };
    } catch (error) {
      console.error('Error repaying loan:', error);
      throw new Error('Failed to repay loan');
    }
  }

  /**
   * Get user's savings groups (mock implementation)
   */
  public async getUserSavingsGroups(address: string): Promise<any[]> {
    try {
      console.log('Getting user savings groups for:', address);
      
      return [
        {
          id: '1',
          name: 'Village Development Fund',
          description: 'Saving for community projects',
          totalContributions: '1250.00',
          memberCount: 25,
          contributionAmount: '50.00',
          frequency: 'monthly',
          nextContribution: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          balance: '500.00'
        },
        {
          id: '2',
          name: 'Emergency Fund',
          description: 'Emergency assistance for members',
          totalContributions: '800.00',
          memberCount: 16,
          contributionAmount: '25.00',
          frequency: 'weekly',
          nextContribution: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          balance: '200.00'
        }
      ];
    } catch (error) {
      console.error('Error getting user savings groups:', error);
      return [];
    }
  }

  /**
   * Get user's loans (mock implementation)
   */
  public async getUserLoans(address: string): Promise<any[]> {
    try {
      console.log('Getting user loans for:', address);
      
      return [
        {
          id: '1',
          amount: '500.00',
          purpose: 'Small business expansion',
          status: 'active',
          remainingAmount: '350.00',
          interestRate: '5%',
          termDays: 180,
          dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          nextPayment: '50.00',
          nextPaymentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        {
          id: '2',
          amount: '200.00',
          purpose: 'Education fees',
          status: 'completed',
          remainingAmount: '0.00',
          interestRate: '3%',
          termDays: 90,
          dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          nextPayment: '0.00',
          nextPaymentDate: null
        }
      ];
    } catch (error) {
      console.error('Error getting user loans:', error);
      return [];
    }
  }

  /**
   * Get contract addresses for current network
   */
  public getContractAddresses(): any {
    return this.addresses;
  }

  /**
   * Get network information
   */
  public async getNetworkInfo(): Promise<any> {
    return {
      networkId: await this.celoService.getNetworkId(),
      networkName: this.celoService.getNetworkName(),
      explorerUrl: this.celoService.getExplorerUrl()
    };
  }
}

// Create and export a default instance
const contractService = new ContractService();
export default contractService;
