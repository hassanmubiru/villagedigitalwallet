import { ContractKit, newKitFromWeb3 } from '@celo/contractkit';
import Web3 from 'web3';

/**
 * CeloService - A utility class for interacting with the Celo blockchain
 * This service integrates with the Village Digital Wallet project and 
 * provides an interface to interact with Celo tokens and contracts.
 */
class CeloService {
  private kit: ContractKit | null = null;
  private network: 'alfajores' | 'mainnet' = 'alfajores';
  
  /**
   * Initialize the ContractKit with the specified network
   * @param network - 'alfajores' for testnet or 'mainnet' for production
   * @returns {ContractKit} - The initialized ContractKit instance
   */
  async initialize(network: 'alfajores' | 'mainnet' = 'alfajores'): Promise<ContractKit> {
    this.network = network;
    
    const rpcUrl = network === 'mainnet' 
      ? 'https://forno.celo.org' 
      : 'https://alfajores-forno.celo-testnet.org';
    
    const web3 = new Web3(rpcUrl);
    this.kit = newKitFromWeb3(web3);
    
    return this.kit;
  }
  
  /**
   * Get the ContractKit instance
   * @returns {ContractKit} - The initialized ContractKit instance
   */
  getKit(): ContractKit {
    if (!this.kit) {
      throw new Error('CeloService not initialized. Call initialize() first.');
    }
    return this.kit;
  }
  
  /**
   * Get common token addresses for the current network
   * @returns {Object} - Object with token addresses
   */
  getTokenAddresses() {
    if (this.network === 'mainnet') {
      return {
        cUSD: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
        CELO: '0x471EcE3750Da237f93B8E339c536989b8978a438',
        cEUR: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
      };
    } else {
      // Alfajores testnet addresses
      return {
        cUSD: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
        CELO: '0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9',
        cEUR: '0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F',
      };
    }
  }
  
  /**
   * Add an account to the kit using a private key
   * @param privateKey - The private key to add (with or without 0x prefix)
   * @returns {string} - The address of the added account
   */
  addAccount(privateKey: string): string {
    if (!this.kit) {
      throw new Error('CeloService not initialized. Call initialize() first.');
    }
    
    // Ensure the private key has the 0x prefix
    const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    const account = this.kit.web3.eth.accounts.privateKeyToAccount(formattedKey);
    this.kit.connection.addAccount(formattedKey);
    
    // Set as default account
    this.kit.defaultAccount = account.address;
    return account.address;
  }
  
  /**
   * Get token balance for an address
   * @param address - Address to check balance for
   * @param tokenSymbol - Token symbol ('cUSD', 'CELO', or 'cEUR')
   * @returns {Promise<string>} - Balance as a string
   */
  async getTokenBalance(address: string, tokenSymbol: 'cUSD' | 'CELO' | 'cEUR' = 'cUSD'): Promise<string> {
    if (!this.kit) {
      throw new Error('CeloService not initialized. Call initialize() first.');
    }
    
    try {
      let token;
      
      switch (tokenSymbol) {
        case 'cUSD':
          token = await this.kit.contracts.getStableToken();
          break;
        case 'CELO':
          token = await this.kit.contracts.getGoldToken();
          break;
        case 'cEUR':
          token = await this.kit.contracts.getStableToken('cEUR');
          break;
        default:
          throw new Error(`Unsupported token: ${tokenSymbol}`);
      }
      
      const balance = await token.balanceOf(address);
      return this.kit.web3.utils.fromWei(balance.toString());
    } catch (error) {
      console.error(`Error fetching ${tokenSymbol} balance:`, error);
      return '0';
    }
  }
  
  /**
   * Send tokens from the connected account to another address
   * @param to - Recipient address
   * @param amount - Amount to send (in full tokens)
   * @param tokenSymbol - Token symbol ('cUSD', 'CELO', or 'cEUR')
   * @returns {Promise<string>} - Transaction hash
   */
  async sendToken(to: string, amount: string, tokenSymbol: 'cUSD' | 'CELO' | 'cEUR' = 'cUSD'): Promise<string> {
    if (!this.kit) {
      throw new Error('CeloService not initialized. Call initialize() first.');
    }
    
    try {
      let token;
      
      switch (tokenSymbol) {
        case 'cUSD':
          token = await this.kit.contracts.getStableToken();
          break;
        case 'CELO':
          token = await this.kit.contracts.getGoldToken();
          break;
        case 'cEUR':
          token = await this.kit.contracts.getStableToken('cEUR');
          break;
        default:
          throw new Error(`Unsupported token: ${tokenSymbol}`);
      }
      
      const amountInWei = this.kit.web3.utils.toWei(amount);
      const tx = await token.transfer(to, amountInWei).send();
      const receipt = await tx.waitReceipt();
      return receipt.transactionHash;
    } catch (error) {
      console.error(`Error sending ${tokenSymbol}:`, error);
      throw error;
    }
  }
  
  /**
   * Get information about a deployed contract
   * @param contractAddress - The address of the contract
   * @param abi - The ABI of the contract
   * @returns {any} - The contract instance
   */
  getContractInstance(contractAddress: string, abi: any): any {
    if (!this.kit) {
      throw new Error('CeloService not initialized. Call initialize() first.');
    }
    
    return new this.kit.web3.eth.Contract(abi, contractAddress);
  }
  
  /**
   * Get gas price in Gwei
   * @returns {Promise<string>} - Current gas price in Gwei
   */
  async getGasPrice(): Promise<string> {
    if (!this.kit) {
      throw new Error('CeloService not initialized. Call initialize() first.');
    }
    
    try {
      const gasPrice = await this.kit.web3.eth.getGasPrice();
      return this.kit.web3.utils.fromWei(gasPrice, 'gwei');
    } catch (error) {
      console.error('Error fetching gas price:', error);
      return this.network === 'mainnet' ? '5' : '0.5'; // Default gas prices
    }
  }
}

// Create a singleton instance
export const celoService = new CeloService();

export default celoService;
