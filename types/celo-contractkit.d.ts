declare module '@celo/contractkit' {
  import Web3 from 'web3';
  
  export interface ContractKit {
    web3: Web3;
    connection: {
      addAccount: (privateKey: string) => void;
    };
    defaultAccount: string;
    contracts: {
      getStableToken: (token?: string) => Promise<any>;
      getGoldToken: () => Promise<any>;
    };
  }
  
  export function newKitFromWeb3(web3: Web3): ContractKit;
}
