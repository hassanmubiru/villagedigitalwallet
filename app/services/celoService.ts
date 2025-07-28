import { ContractKit, newKit } from '@celo/contractkit';
import { ERC20 } from '@celo/contractkit/lib/generated/IERC20';
import { getContractAddresses } from '../utils/contractAddresses';
import { Alfajores, Celo } from '@celo/react-celo';

// ABI imports (make sure to create these files)
import SavingsGroupAbi from '../abis/SavingsGroup.json';
import MicroloanSystemAbi from '../abis/MicroloanSystem.json';

export type CeloNetwork = 'alfajores' | 'celo';

// Network configuration for Celo Composer
export const NETWORKS = {
  alfajores: Alfajores,
  celo: Celo
};

export class CeloService {
  private kit: ContractKit;
  private network: CeloNetwork;
  
  constructor(network: CeloNetwork = 'alfajores') {
    // Initialize with the correct network endpoint
    const rpcUrl = network === 'alfajores' 
      ? 'https://alfajores-forno.celo-testnet.org'
      : 'https://forno.celo.org';
    
    this.kit = newKit(rpcUrl);
    this.network = network;
  }
  
  /**
   * Format transaction value from wei to a readable format
   * @param value Value in wei
   * @returns Formatted value in ether
   */
  public formatWeiToEther(value: string): string {
    try {
      return this.kit.web3.utils.fromWei(value, 'ether');
    } catch (error) {
      console.error("Error formatting wei to ether:", error);
      return value;
    }
  }
  
  /**
   * Get the ContractKit instance
   * @returns The current ContractKit instance
   */
  public async getKit(): Promise<ContractKit> {
    return this.kit;
  }

  /**
   * Connect to Celo with user's wallet
   * @param address User's wallet address 
   * @param provider Web3 provider from wallet
   */
  public async connectWithWallet(address: string, provider: any): Promise<void> {
    try {
      this.kit = newKit(provider);
      
      // Set default account for transactions
      this.kit.defaultAccount = address;
      console.log('Connected to Celo network with address:', address);
    } catch (error) {
      console.error('Error connecting to Celo network:', error);
      throw new Error('Failed to connect to Celo network');
    }
  }
  
  /**
   * Get CELO balance
   * @param address Wallet address
   * @returns Balance in CELO with decimals
   */
  public async getCeloBalance(address: string): Promise<string> {
    try {
      const goldtoken = await this.kit.contracts.getGoldToken();
      const balance = await goldtoken.balanceOf(address);
      return this.kit.web3.utils.fromWei(balance.toString(), 'ether');
    } catch (error) {
      console.error('Error fetching CELO balance:', error);
      throw new Error('Failed to get CELO balance');
    }
  }
  
  /**
   * Get cUSD balance
   * @param address Wallet address
   * @returns Balance in cUSD with decimals
   */
  public async getcUSDBalance(address: string): Promise<string> {
    try {
      const stabletoken = await this.kit.contracts.getStableToken();
      const balance = await stabletoken.balanceOf(address);
      return this.kit.web3.utils.fromWei(balance.toString(), 'ether');
    } catch (error) {
      console.error('Error fetching cUSD balance:', error);
      throw new Error('Failed to get cUSD balance');
    }
  }

  /**
   * Get an instance of the SavingsGroup contract
   * @returns Contract instance
   */
  public async getSavingsGroupContract() {
    try {
      const addresses = getContractAddresses(this.network);
      return new this.kit.web3.eth.Contract(
        SavingsGroupAbi as any,
        addresses.savingsGroup
      );
    } catch (error) {
      console.error('Error getting SavingsGroup contract:', error);
      throw new Error('Failed to initialize SavingsGroup contract');
    }
  }

  /**
   * Get an instance of the MicroloanSystem contract
   * @returns Contract instance
   */
  public async getMicroloanSystemContract() {
    try {
      const addresses = getContractAddresses(this.network);
      return new this.kit.web3.eth.Contract(
        MicroloanSystemAbi as any,
        addresses.microloanSystem
      );
    } catch (error) {
      console.error('Error getting MicroloanSystem contract:', error);
      throw new Error('Failed to initialize MicroloanSystem contract');
    }
  }

  /**
   * Transfer CELO to another address
   * @param toAddress Recipient address
   * @param amount Amount to send in CELO
   * @returns Transaction receipt
   */
  public async transferCELO(toAddress: string, amount: string): Promise<any> {
    try {
      const goldtoken = await this.kit.contracts.getGoldToken();
      const weiAmount = this.kit.web3.utils.toWei(amount, 'ether');
      
      const tx = await goldtoken.transfer(toAddress, weiAmount).send({
        from: this.kit.defaultAccount,
        gasPrice: this.kit.web3.utils.toWei('0.5', 'gwei'),
      });
      
      return await tx.waitReceipt();
    } catch (error) {
      console.error('Error transferring CELO:', error);
      throw new Error('Failed to transfer CELO');
    }
  }

  /**
   * Transfer cUSD to another address
   * @param toAddress Recipient address
   * @param amount Amount to send in cUSD
   * @returns Transaction receipt
   */
  public async transfercUSD(toAddress: string, amount: string): Promise<any> {
    try {
      const stabletoken = await this.kit.contracts.getStableToken();
      const weiAmount = this.kit.web3.utils.toWei(amount, 'ether');
      
      const tx = await stabletoken.transfer(toAddress, weiAmount).send({
        from: this.kit.defaultAccount,
        gasPrice: this.kit.web3.utils.toWei('0.5', 'gwei'),
      });
      
      return await tx.waitReceipt();
    } catch (error) {
      console.error('Error transferring cUSD:', error);
      throw new Error('Failed to transfer cUSD');
    }
  }

  /**
   * Get transaction history for an address
   * @param address Wallet address
   * @param limit Number of transactions to fetch
   * @returns Array of transactions
   */
  public async getTransactionHistory(address: string, limit = 10): Promise<any[]> {
    try {
      // Get the latest block number
      const latestBlock = await this.kit.web3.eth.getBlockNumber();
      const transactions = [];
      
      // Fetch transactions (simplified - in production use a block explorer API)
      for (let i = 0; i < limit; i++) {
        const blockNumber = latestBlock - i;
        if (blockNumber < 0) break;
        
        const block = await this.kit.web3.eth.getBlock(blockNumber, true);
        if (block && block.transactions) {
          const relevantTxs = block.transactions.filter(
            (tx: any) => 
              tx.from.toLowerCase() === address.toLowerCase() || 
              tx.to?.toLowerCase() === address.toLowerCase()
          );
          
          // Format values to be more readable
          const formattedTxs = relevantTxs.map(tx => ({
            ...tx,
            formattedValue: tx.value ? this.formatWeiToEther(tx.value) : '0'
          }));
          
          transactions.push(...formattedTxs);
          if (transactions.length >= limit) break;
        }
      }
      
      return transactions.slice(0, limit);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw new Error('Failed to get transaction history');
    }
  }

  /**
   * Get the current gas price on the Celo network
   * @returns Gas price in wei
   */
  public async getGasPrice(): Promise<string> {
    try {
      const gasPrice = await this.kit.web3.eth.getGasPrice();
      return gasPrice;
    } catch (error) {
      console.error('Error getting gas price:', error);
      throw new Error('Failed to get gas price');
    }
  }

  /**
   * Get all token balances for an address (CELO, cUSD, cEUR)
   * @param address Wallet address
   * @returns Object with all token balances
   */
  public async getAllTokenBalances(address: string): Promise<{
    CELO: string;
    cUSD: string;
    cEUR: string;
  }> {
    try {
      const goldtoken = await this.kit.contracts.getGoldToken();
      const stabletoken = await this.kit.contracts.getStableToken();
      // Note: Different versions of ContractKit may have different ways to access cEUR
      // This approach works for the current version
      const ceurotoken = await this.kit.contracts.getStableToken('cEUR');

      const [celoBalance, cusdBalance, ceurBalance] = await Promise.all([
        goldtoken.balanceOf(address),
        stabletoken.balanceOf(address),
        ceurotoken.balanceOf(address)
      ]);

      return {
        CELO: this.kit.web3.utils.fromWei(celoBalance.toString(), 'ether'),
        cUSD: this.kit.web3.utils.fromWei(cusdBalance.toString(), 'ether'),
        cEUR: this.kit.web3.utils.fromWei(ceurBalance.toString(), 'ether')
      };
    } catch (error) {
      console.error('Error fetching token balances:', error);
      throw new Error('Failed to get token balances');
    }
  }

  /**
   * Get the current network ID
   * @returns Network ID (44787 for Alfajores, 42220 for Celo mainnet)
   */
  public async getNetworkId(): Promise<number> {
    try {
      return await this.kit.web3.eth.net.getId();
    } catch (error) {
      console.error('Error getting network ID:', error);
      throw new Error('Failed to get network ID');
    }
  }
  
  /**
   * Get the explorer URL for the current network
   * @param txHash Optional transaction hash to get transaction URL
   * @returns Explorer URL
   */
  public getExplorerUrl(txHash?: string): string {
    const baseUrl = this.network === 'alfajores' 
      ? 'https://alfajores.celoscan.io' 
      : 'https://celoscan.io';
      
    if (txHash) {
      return `${baseUrl}/tx/${txHash}`;
    }
    return baseUrl;
  }

  /**
   * Get Celo Composer network configuration
   * @returns Network configuration for Celo Composer
   */
  public getComposerNetworkConfig() {
    return NETWORKS[this.network];
  }
}

// Create and export a default instance for convenience
export default new CeloService('alfajores');
