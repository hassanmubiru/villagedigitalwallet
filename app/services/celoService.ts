// Simplified Celo Service for browser compatibility

export type CeloNetwork = 'alfajores' | 'celo';

// Network configuration for Celo Composer
export const NETWORKS = {
  alfajores: {
    chainId: 44787,
    name: "Celo Alfajores",
    rpc: "https://alfajores-forno.celo-testnet.org",
    explorerUrl: "https://explorer.celo.org/alfajores",
    gasTokens: ["CELO"],
    nativeCurrency: {
      decimals: 18,
      name: "CELO",
      symbol: "CELO",
    }
  },
  celo: {
    chainId: 42220,
    name: "Celo",
    rpc: "https://forno.celo.org", 
    explorerUrl: "https://explorer.celo.org/mainnet",
    gasTokens: ["CELO"],
    nativeCurrency: {
      decimals: 18,
      name: "CELO",
      symbol: "CELO",
    }
  }
};

export class CeloService {
  private network: CeloNetwork;
  
  constructor(network: CeloNetwork = 'alfajores') {
    this.network = network;
  }
  
  /**
   * Format transaction value from wei to a readable format
   */
  public formatWeiToEther(value: string): string {
    try {
      // Use parseFloat for browser compatibility
      const etherValue = parseFloat(value) / Math.pow(10, 18);
      return etherValue.toFixed(6);
    } catch (error) {
      console.error("Error formatting wei to ether:", error);
      return value;
    }
  }

  /**
   * Get current network configuration
   */
  public getCurrentNetwork(): CeloNetwork {
    return this.network;
  }

  /**
   * Set current network
   */
  public setNetwork(network: CeloNetwork): void {
    this.network = network;
  }

  /**
   * Get network ID
   */
  public async getNetworkId(): Promise<number> {
    return NETWORKS[this.network].chainId;
  }

  /**
   * Get explorer URL
   */
  public getExplorerUrl(txHash?: string): string {
    const baseUrl = NETWORKS[this.network].explorerUrl;
    return txHash ? `${baseUrl}/tx/${txHash}` : baseUrl;
  }

  /**
   * Get network name
   */
  public getNetworkName(): string {
    return NETWORKS[this.network].name;
  }

  /**
   * Mock connection method for compatibility
   */
  public async connectWithWallet(provider: any): Promise<void> {
    // This is handled by Thirdweb's wallet connection
    console.log('Wallet connection handled by Thirdweb');
  }

  /**
   * Get mock account balance (replaced by Thirdweb hooks)
   */
  public async getAccountBalance(address: string): Promise<string> {
    // This should be handled by useBalance hook from Thirdweb
    return '0';
  }

  /**
   * Get token addresses for current network
   */
  public getTokenAddresses() {
    if (this.network === 'alfajores') {
      return {
        CELO: '0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9',
        cUSD: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
        cEUR: '0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F',
      };
    } else {
      return {
        CELO: '0x471EcE3750Da237f93B8E339c536989b8978a438',
        cUSD: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
        cEUR: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
      };
    }
  }

  /**
   * Check if connected (mock implementation)
   */
  public isConnected(): boolean {
    return true; // Handled by Thirdweb
  }

  /**
   * Get mock recent transactions for compatibility
   */
  public async getRecentTransactions(): Promise<any[]> {
    // Mock data for now - real implementation would use Thirdweb or API
    return [
      {
        hash: '0x1234567890abcdef1234567890abcdef12345678',
        from: '0xabc123...',
        to: '0xdef456...',
        value: '10.5',
        timestamp: Date.now() - 3600000,
        type: 'received',
        token: 'cUSD'
      },
      {
        hash: '0xfedcba0987654321fedcba0987654321fedcba09',
        from: '0xdef456...',
        to: '0xabc123...',
        value: '5.0',
        timestamp: Date.now() - 7200000,
        type: 'sent',
        token: 'CELO'
      }
    ];
  }
}

// Export singleton instance
const celoService = new CeloService();

// Set network from environment variable
const network = (typeof window !== 'undefined' && (window as any).NEXT_PUBLIC_CELO_NETWORK) || 'alfajores';
celoService.setNetwork(network as CeloNetwork);

export default celoService;
