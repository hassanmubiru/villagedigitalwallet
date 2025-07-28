// Celo Utilities - Helper functions for interacting with the Celo blockchain
import { ContractKit, newKitFromWeb3 } from '@celo/contractkit';
import Web3 from 'web3';

/**
 * Create a ContractKit instance connected to the specified Celo network
 * @param {string} network - Network to connect to ('alfajores' or 'mainnet')
 * @returns {ContractKit} - Connected ContractKit instance
 */
export function getCeloKit(network = 'alfajores'): ContractKit {
  const url = network === 'mainnet' 
    ? 'https://forno.celo.org' 
    : 'https://alfajores-forno.celo-testnet.org';
  
  const web3 = new Web3(url);
  return newKitFromWeb3(web3);
}

/**
 * Get common Celo token addresses based on the network
 * @param {string} network - Network to get addresses for ('alfajores' or 'mainnet')
 * @returns {Object} - Object containing token addresses
 */
export function getCeloTokenAddresses(network = 'alfajores') {
  if (network === 'mainnet') {
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
 * Get balance of a Celo stable token for an address
 * @param {ContractKit} kit - Connected ContractKit instance
 * @param {string} address - Address to check balance for
 * @param {string} tokenSymbol - Token symbol ('cUSD', 'CELO', or 'cEUR')
 * @returns {Promise<string>} - Balance formatted as a string
 */
export async function getTokenBalance(
  kit: ContractKit, 
  address: string, 
  tokenSymbol: 'cUSD' | 'CELO' | 'cEUR' = 'cUSD'
): Promise<string> {
  try {
    let token;
    
    switch (tokenSymbol) {
      case 'cUSD':
        token = await kit.contracts.getStableToken();
        break;
      case 'CELO':
        token = await kit.contracts.getGoldToken();
        break;
      case 'cEUR':
        token = await kit.contracts.getStableToken('cEUR');
        break;
      default:
        throw new Error(`Unsupported token: ${tokenSymbol}`);
    }
    
    const balance = await token.balanceOf(address);
    return kit.web3.utils.fromWei(balance.toString());
  } catch (error) {
    console.error(`Error fetching ${tokenSymbol} balance:`, error);
    return '0';
  }
}

/**
 * Transfer Celo stable tokens
 * @param {ContractKit} kit - Connected ContractKit instance with added account
 * @param {string} to - Recipient address
 * @param {string} amount - Amount to send (in full tokens)
 * @param {string} tokenSymbol - Token symbol ('cUSD', 'CELO', or 'cEUR')
 * @returns {Promise<string>} - Transaction hash
 */
export async function transferToken(
  kit: ContractKit, 
  to: string, 
  amount: string, 
  tokenSymbol: 'cUSD' | 'CELO' | 'cEUR' = 'cUSD'
): Promise<string> {
  try {
    let token;
    
    switch (tokenSymbol) {
      case 'cUSD':
        token = await kit.contracts.getStableToken();
        break;
      case 'CELO':
        token = await kit.contracts.getGoldToken();
        break;
      case 'cEUR':
        token = await kit.contracts.getStableToken('cEUR');
        break;
      default:
        throw new Error(`Unsupported token: ${tokenSymbol}`);
    }
    
    const amountInWei = kit.web3.utils.toWei(amount);
    const tx = await token.transfer(to, amountInWei).send();
    const receipt = await tx.waitReceipt();
    return receipt.transactionHash;
  } catch (error) {
    console.error(`Error transferring ${tokenSymbol}:`, error);
    throw error;
  }
}

/**
 * Add an account to the ContractKit instance using a private key
 * @param {ContractKit} kit - ContractKit instance to add the account to
 * @param {string} privateKey - Private key (with or without 0x prefix)
 * @returns {string} - Address of the added account
 */
export function addAccountToKit(kit: ContractKit, privateKey: string): string {
  // Ensure the private key has the 0x prefix
  const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
  const account = kit.web3.eth.accounts.privateKeyToAccount(formattedKey);
  kit.connection.addAccount(formattedKey);
  
  // Set as default account
  kit.defaultAccount = account.address;
  return account.address;
}

/**
 * Get the latest block information
 * @param {ContractKit} kit - Connected ContractKit instance
 * @returns {Promise<Object>} - Latest block information
 */
export async function getLatestBlockInfo(kit: ContractKit) {
  try {
    const latestBlock = await kit.web3.eth.getBlock('latest');
    return latestBlock;
  } catch (error) {
    console.error('Error fetching latest block:', error);
    throw error;
  }
}

/**
 * Get gas price estimation
 * @param {ContractKit} kit - Connected ContractKit instance
 * @returns {Promise<string>} - Gas price in Gwei
 */
export async function getGasPrice(kit: ContractKit): Promise<string> {
  try {
    const gasPrice = await kit.web3.eth.getGasPrice();
    return kit.web3.utils.fromWei(gasPrice, 'gwei');
  } catch (error) {
    console.error('Error fetching gas price:', error);
    return '5'; // Default 5 Gwei
  }
}
