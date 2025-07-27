/**
 * Smart Contract Deployment and Management
 * Handles deployment and interaction with savings group smart contracts
 */

import { ethers } from 'ethers';

interface DeploymentConfig {
  groupName: string;
  celoTokenAddress: string;
  minimumContribution: number;
  maxLoanAmount: number;
  defaultInterestRate: number;
  groupAdmin: string;
}

interface SmartContractDeployment {
  contractAddress: string;
  transactionHash: string;
  blockNumber: number;
  gasUsed: number;
  deploymentDate: Date;
}

export class SmartContractManager {
  private provider: ethers.Provider;
  private signer: ethers.Signer;
  private celoTokenAddress: string;

  constructor(providerUrl: string, privateKey: string, celoTokenAddress: string) {
    this.provider = new ethers.JsonRpcProvider(providerUrl);
    this.signer = new ethers.Wallet(privateKey, this.provider);
    this.celoTokenAddress = celoTokenAddress;
  }

  /**
   * Deploy a new savings group smart contract
   */
  async deploySavingsGroup(config: DeploymentConfig): Promise<SmartContractDeployment> {
    try {
      // Contract ABI (simplified for demo)
      const contractABI = [
        "constructor(string memory _groupName, address _celoToken, uint256 _minimumContribution, uint256 _maxLoanAmount, uint256 _defaultInterestRate, address _groupAdmin)",
        "function addMember(address _member) external",
        "function makeContribution(uint256 _amount) external",
        "function requestLoan(uint256 _amount, uint256 _duration, uint256 _collateralAmount) external returns (uint256)",
        "function approveLoan(uint256 _loanId) external",
        "function repayLoan(uint256 _loanId, uint256 _amount) external",
        "function getMemberInfo(address _member) external view returns (tuple)",
        "function getCurrentCycleInfo() external view returns (uint256, uint256, uint256, uint256, uint256, bool)",
        "event MemberAdded(address indexed member, uint256 timestamp)",
        "event ContributionMade(address indexed member, uint256 amount, uint256 cycleId)",
        "event LoanRequested(uint256 indexed loanId, address indexed borrower, uint256 amount)"
      ];

      // Contract bytecode (in production, compile from Solidity source)
      const contractBytecode = "0x608060405234801561001057600080fd5b50..."; // Truncated for brevity

      // Create contract factory
      const contractFactory = new ethers.ContractFactory(contractABI, contractBytecode, this.signer);

      // Deploy contract with constructor parameters
      const contract = await contractFactory.deploy(
        config.groupName,
        config.celoTokenAddress,
        ethers.parseEther(config.minimumContribution.toString()),
        ethers.parseEther(config.maxLoanAmount.toString()),
        config.defaultInterestRate * 100, // Convert to basis points
        config.groupAdmin
      );

      // Wait for deployment to be mined
      const deploymentReceipt = await contract.deploymentTransaction()?.wait();

      if (!deploymentReceipt) {
        throw new Error('Deployment transaction failed');
      }

      return {
        contractAddress: await contract.getAddress(),
        transactionHash: deploymentReceipt.hash,
        blockNumber: deploymentReceipt.blockNumber,
        gasUsed: Number(deploymentReceipt.gasUsed),
        deploymentDate: new Date()
      };

    } catch (error) {
      console.error('Smart contract deployment failed:', error);
      throw new Error(`Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Interact with an existing savings group contract
   */
  async interactWithSavingsGroup(contractAddress: string) {
    const contractABI = [
      "function addMember(address _member) external",
      "function makeContribution(uint256 _amount) external",
      "function requestLoan(uint256 _amount, uint256 _duration, uint256 _collateralAmount) external returns (uint256)",
      "function approveLoan(uint256 _loanId) external",
      "function repayLoan(uint256 _loanId, uint256 _amount) external",
      "function getMemberInfo(address _member) external view returns (tuple)",
      "function getCurrentCycleInfo() external view returns (uint256, uint256, uint256, uint256, uint256, bool)"
    ];

    const contract = new ethers.Contract(contractAddress, contractABI, this.signer);

    return {
      // Add a new member to the group
      addMember: async (memberAddress: string) => {
        const tx = await contract.addMember(memberAddress);
        return await tx.wait();
      },

      // Make a contribution to the current cycle
      makeContribution: async (amount: number) => {
        const tx = await contract.makeContribution(ethers.parseEther(amount.toString()));
        return await tx.wait();
      },

      // Request a loan from group funds
      requestLoan: async (amount: number, duration: number, collateral: number = 0) => {
        const tx = await contract.requestLoan(
          ethers.parseEther(amount.toString()),
          duration,
          ethers.parseEther(collateral.toString())
        );
        const receipt = await tx.wait();
        
        // Parse loan ID from events
        const event = receipt.logs.find((log: any) => 
          log.topics[0] === ethers.id("LoanRequested(uint256,address,uint256)")
        );
        
        if (event) {
          const loanId = ethers.AbiCoder.defaultAbiCoder().decode(['uint256'], event.topics[1])[0];
          return { receipt, loanId: Number(loanId) };
        }
        
        return { receipt, loanId: null };
      },

      // Approve a loan (admin only)
      approveLoan: async (loanId: number) => {
        const tx = await contract.approveLoan(loanId);
        return await tx.wait();
      },

      // Repay a loan
      repayLoan: async (loanId: number, amount: number) => {
        const tx = await contract.repayLoan(loanId, ethers.parseEther(amount.toString()));
        return await tx.wait();
      },

      // Get member information
      getMemberInfo: async (memberAddress: string) => {
        return await contract.getMemberInfo(memberAddress);
      },

      // Get current contribution cycle information
      getCurrentCycleInfo: async () => {
        return await contract.getCurrentCycleInfo();
      }
    };
  }

  /**
   * Monitor contract events
   */
  async monitorContractEvents(contractAddress: string, eventName: string, callback: (event: any) => void) {
    const contractABI = [
      "event MemberAdded(address indexed member, uint256 timestamp)",
      "event ContributionMade(address indexed member, uint256 amount, uint256 cycleId)",
      "event LoanRequested(uint256 indexed loanId, address indexed borrower, uint256 amount)",
      "event LoanApproved(uint256 indexed loanId, address indexed borrower, uint256 amount)",
      "event LoanRepayment(uint256 indexed loanId, address indexed borrower, uint256 amount)"
    ];

    const contract = new ethers.Contract(contractAddress, contractABI, this.provider);

    contract.on(eventName, callback);

    return () => {
      contract.removeAllListeners(eventName);
    };
  }

  /**
   * Get contract deployment status and health
   */
  async getContractStatus(contractAddress: string) {
    try {
      const code = await this.provider.getCode(contractAddress);
      const isDeployed = code !== '0x';

      if (!isDeployed) {
        return { status: 'not_deployed', healthy: false };
      }

      // Try to call a view function to test contract health
      const contractABI = ["function getCurrentCycleInfo() external view returns (uint256, uint256, uint256, uint256, uint256, bool)"];
      const contract = new ethers.Contract(contractAddress, contractABI, this.provider);

      try {
        await contract.getCurrentCycleInfo();
        return { status: 'deployed', healthy: true };
      } catch (error) {
        return { status: 'deployed', healthy: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }

    } catch (error) {
      return { status: 'error', healthy: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Estimate gas costs for contract operations
   */
  async estimateGasCosts(contractAddress: string) {
    const contractABI = [
      "function addMember(address _member) external",
      "function makeContribution(uint256 _amount) external",
      "function requestLoan(uint256 _amount, uint256 _duration, uint256 _collateralAmount) external returns (uint256)"
    ];

    const contract = new ethers.Contract(contractAddress, contractABI, this.signer);
    const gasPrice = await this.provider.getFeeData();

    const estimates = {
      addMember: await contract.addMember.estimateGas("0x0000000000000000000000000000000000000000"),
      makeContribution: await contract.makeContribution.estimateGas(ethers.parseEther("100")),
      requestLoan: await contract.requestLoan.estimateGas(ethers.parseEther("500"), 30, 0)
    };

    return {
      gasPrice: gasPrice.gasPrice,
      estimates: {
        addMember: {
          gasUnits: Number(estimates.addMember),
          costInWei: estimates.addMember * (gasPrice.gasPrice || 0n),
          costInCelo: ethers.formatEther(estimates.addMember * (gasPrice.gasPrice || 0n))
        },
        makeContribution: {
          gasUnits: Number(estimates.makeContribution),
          costInWei: estimates.makeContribution * (gasPrice.gasPrice || 0n),
          costInCelo: ethers.formatEther(estimates.makeContribution * (gasPrice.gasPrice || 0n))
        },
        requestLoan: {
          gasUnits: Number(estimates.requestLoan),
          costInWei: estimates.requestLoan * (gasPrice.gasPrice || 0n),
          costInCelo: ethers.formatEther(estimates.requestLoan * (gasPrice.gasPrice || 0n))
        }
      }
    };
  }
}

// Example usage and deployment script
export async function deployNewSavingsGroup(
  groupName: string,
  adminAddress: string,
  minimumContribution: number = 50,
  maxLoanAmount: number = 5000
): Promise<SmartContractDeployment> {
  
  const providerUrl = process.env.CELO_RPC_URL || "https://alfajores-forno.celo-testnet.org";
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY || "";
  const celoTokenAddress = process.env.CELO_TOKEN_ADDRESS || "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"; // Testnet CELO

  if (!privateKey) {
    throw new Error("DEPLOYER_PRIVATE_KEY environment variable is required");
  }

  const manager = new SmartContractManager(providerUrl, privateKey, celoTokenAddress);

  const deployment = await manager.deploySavingsGroup({
    groupName,
    celoTokenAddress,
    minimumContribution,
    maxLoanAmount,
    defaultInterestRate: 12, // 12% annual interest
    groupAdmin: adminAddress
  });

  console.log(`Savings group "${groupName}" deployed successfully!`);
  console.log(`Contract Address: ${deployment.contractAddress}`);
  console.log(`Transaction Hash: ${deployment.transactionHash}`);
  console.log(`Gas Used: ${deployment.gasUsed}`);

  return deployment;
}

// Export for use in other parts of the application
export default SmartContractManager;
