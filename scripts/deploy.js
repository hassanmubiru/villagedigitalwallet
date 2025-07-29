// Deployment script for Village Digital Wallet smart contracts
const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying Village Digital Wallet contracts...");

  // Get the Contract Factories
  const SavingsGroup = await ethers.getContractFactory("SavingsGroup");
  const MicroloanSystem = await ethers.getContractFactory("MicroloanSystem");
  const VillageGovernanceToken = await ethers.getContractFactory("VillageGovernanceToken");
  const VillageGovernor = await ethers.getContractFactory("VillageGovernor");
  const VillageGovernance = await ethers.getContractFactory("VillageGovernance");
  const VillageAutomation = await ethers.getContractFactory("VillageAutomation");
  const TimelockController = await ethers.getContractFactory("TimelockController");

  // For deployment we'll need to get the deployer address
  const [deployer] = await ethers.getSigners();
  console.log(`📋 Deploying contracts with the account: ${deployer.address}`);
  
  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Deployer balance: ${ethers.formatEther(balance)} CELO`);

  // We'll use cUSD as the payment token on Celo
  // cUSD address on Alfajores testnet
  const cUSDAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";
  
  
  // Platform fee constant
  const platformFee = 250; // 2.5% as basis points
  
  // Get current gas price from the network and add a buffer
  const feeData = await ethers.provider.getFeeData();
  
  // Extract and calculate gas prices
  const maxFeePerGas = feeData.maxFeePerGas || feeData.gasPrice;
  const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || 
    (feeData.maxFeePerGas ? feeData.maxFeePerGas / BigInt(2) : BigInt("1000000000")); // 1 gwei default
  
  // Add 50% buffer to maxFeePerGas
  const bufferedMaxFeePerGas = maxFeePerGas * BigInt(150) / BigInt(100);
  
  console.log(`⛽ Current network base fee: ${ethers.formatUnits(feeData.gasPrice || maxFeePerGas, 'gwei')} gwei`);
  console.log(`⛽ Using maxFeePerGas: ${ethers.formatUnits(bufferedMaxFeePerGas, 'gwei')} gwei`);
  console.log(`⛽ Using maxPriorityFeePerGas: ${ethers.formatUnits(maxPriorityFeePerGas, 'gwei')} gwei`);

  // Store deployed contract addresses
  const deployedContracts = {};
  
  console.log("\n🏛️ Step 1: Deploying Governance System...");
  
  // Deploy Governance Token
  console.log("📜 Deploying VillageGovernance...");
  const governance = await VillageGovernance.deploy(
    deployer.address,
    "Village Governance Token",
    "VGT",
    ethers.parseEther("1000000"), // 1M initial supply
    { 
      gasLimit: 8000000,
      maxFeePerGas: bufferedMaxFeePerGas,
      maxPriorityFeePerGas: maxPriorityFeePerGas
    }
  );
  await governance.waitForDeployment();
  deployedContracts.governance = await governance.getAddress();
  console.log(`✅ VillageGovernance deployed to: ${deployedContracts.governance}`);

  // Deploy Automation System
  console.log("🤖 Deploying VillageAutomation...");
  const automation = await VillageAutomation.deploy(
    cUSDAddress,
    deployer.address,
    { 
      gasLimit: 8000000,
      maxFeePerGas: bufferedMaxFeePerGas,
      maxPriorityFeePerGas: maxPriorityFeePerGas
    }
  );
  await automation.waitForDeployment();
  deployedContracts.automation = await automation.getAddress();
  console.log(`✅ VillageAutomation deployed to: ${deployedContracts.automation}`);

  console.log("\n💰 Step 2: Deploying Core Financial Contracts...");
  
  // Deploy an example SavingsGroup first
  console.log("🏦 Deploying SavingsGroup...");
  const groupName = "Community Savings Group";
  const contributionAmount = ethers.parseEther("10"); // 10 cUSD

  const savingsGroup = await SavingsGroup.deploy(
    groupName,
    cUSDAddress,         // payment token address (cUSD)
    contributionAmount,  // minimum contribution
    ethers.parseEther("100"), // maxLoanAmount - 100 cUSD
    250,                 // defaultInterestRate - 2.5% in basis points
    deployer.address,    // group admin
    { 
      gasLimit: 8000000,
      maxFeePerGas: bufferedMaxFeePerGas,
      maxPriorityFeePerGas: maxPriorityFeePerGas
    }
  );

  await savingsGroup.waitForDeployment();
  deployedContracts.savingsGroup = await savingsGroup.getAddress();
  console.log(`✅ SavingsGroup deployed to: ${deployedContracts.savingsGroup}`);

  // Now deploy the MicroloanSystem with the savings group address
  console.log("🏧 Deploying MicroloanSystem...");
  
  const microloanSystem = await MicroloanSystem.deploy(
    deployer.address,    // initial owner
    cUSDAddress,         // payment token address (cUSD)
    deployer.address,    // fee collector (same as owner for simplicity)
    platformFee,         // platform fee in basis points
    { 
      gasLimit: 8000000,
      maxFeePerGas: bufferedMaxFeePerGas,
      maxPriorityFeePerGas: maxPriorityFeePerGas
    }
  );

  await microloanSystem.waitForDeployment();
  deployedContracts.microloanSystem = await microloanSystem.getAddress();
  console.log(`✅ MicroloanSystem deployed to: ${deployedContracts.microloanSystem}`);

  console.log("\n🎉 Deployment Summary:");
  console.log("========================");
  console.log(`🏛️  VillageGovernance: ${deployedContracts.governance}`);
  console.log(`🤖 VillageAutomation: ${deployedContracts.automation}`);
  console.log(`🏦 SavingsGroup: ${deployedContracts.savingsGroup}`);
  console.log(`🏧 MicroloanSystem: ${deployedContracts.microloanSystem}`);
  console.log(`💰 Payment Token (cUSD): ${cUSDAddress}`);
  
  // Save deployment information
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: deployedContracts,
    tokenAddresses: {
      cUSD: cUSDAddress
    }
  };
  
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log(`📁 Deployment info saved to: deployments/${hre.network.name}.json`);
  
  // Update the contract addresses file and ABIs
  try {
    // Update contract addresses
    const contractAddressesPath = path.join(__dirname, '..', 'app', 'utils', 'contractAddresses.ts');
    const addressesContent = `// Contract addresses for deployed Village Digital Wallet contracts
export const CONTRACT_ADDRESSES = {
  alfajores: {
    VillageGovernance: '${hre.network.name === 'alfajores' ? deployedContracts.governance : ''}',
    VillageAutomation: '${hre.network.name === 'alfajores' ? deployedContracts.automation : ''}',
    SavingsGroup: '${hre.network.name === 'alfajores' ? deployedContracts.savingsGroup : ''}',
    MicroloanSystem: '${hre.network.name === 'alfajores' ? deployedContracts.microloanSystem : ''}',
    cUSD: '${hre.network.name === 'alfajores' ? cUSDAddress : ''}',
  },
  celo: {
    VillageGovernance: '${hre.network.name === 'celo' ? deployedContracts.governance : ''}',
    VillageAutomation: '${hre.network.name === 'celo' ? deployedContracts.automation : ''}',
    SavingsGroup: '${hre.network.name === 'celo' ? deployedContracts.savingsGroup : ''}',
    MicroloanSystem: '${hre.network.name === 'celo' ? deployedContracts.microloanSystem : ''}',
    cUSD: '${hre.network.name === 'celo' ? '0x765DE816845861e75A25fCA122bb6898B8B1282a' : ''}',
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
  return CONTRACT_ADDRESSES[network as keyof typeof CONTRACT_ADDRESSES]?.[contractName as keyof typeof CONTRACT_ADDRESSES.alfajores];
};`;

    fs.writeFileSync(contractAddressesPath, addressesContent);
    console.log("✅ Contract addresses file updated successfully");
    
  } catch (error) {
    console.error("❌ Failed to update contract files:", error.message);
  }
  
  // Verify contracts if not on a local network
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 Waiting for block confirmations...");
    
    // Check for API key
    if (!process.env.ETHERSCAN_API_KEY || process.env.ETHERSCAN_API_KEY === "") {
      console.log("\n⚠️  WARNING: Missing ETHERSCAN_API_KEY in your .env file");
      console.log("Contract verification will likely fail without an API key");
      console.log("Register for a free API key at https://celoscan.io/register");
      console.log("Then add it to your .env file as: ETHERSCAN_API_KEY=your_api_key_here");
      console.log("\nSkipping automatic verification...");
      
      console.log("\n📋 Deployed Contract Addresses (SAVE THESE):");
      console.log(`🏛️  VillageGovernance: ${deployedContracts.governance}`);
      console.log(`🤖 VillageAutomation: ${deployedContracts.automation}`);
      console.log(`🏦 SavingsGroup: ${deployedContracts.savingsGroup}`);
      console.log(`🏧 MicroloanSystem: ${deployedContracts.microloanSystem}`);
      console.log("\nYou can manually verify later using:");
      console.log(`npx hardhat run scripts/manual-verify.js --network ${hre.network.name}`);
      return;
    }
    
    // Wait for some time to ensure the contracts are mined
    console.log("⏳ Waiting for 30 seconds before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
    
    console.log("\n🔍 Verifying contracts on Celo Explorer...");
    
    try {
      // Verify VillageGovernance
      console.log(`📜 Verifying VillageGovernance at ${deployedContracts.governance}...`);
      await hre.run("verify:verify", {
        address: deployedContracts.governance,
        constructorArguments: [
          deployer.address,
          "Village Governance Token",
          "VGT",
          ethers.parseEther("1000000")
        ],
      });
      
      // Verify VillageAutomation
      console.log(`🤖 Verifying VillageAutomation at ${deployedContracts.automation}...`);
      await hre.run("verify:verify", {
        address: deployedContracts.automation,
        constructorArguments: [
          cUSDAddress,
          deployer.address
        ],
      });
      
      // Verify SavingsGroup
      console.log(`🏦 Verifying SavingsGroup at ${deployedContracts.savingsGroup}...`);
      await hre.run("verify:verify", {
        address: deployedContracts.savingsGroup,
        constructorArguments: [
          groupName,
          cUSDAddress,
          contributionAmount,
          ethers.parseEther("100"), // maxLoanAmount
          250,                      // defaultInterestRate
          deployer.address          // group admin
        ],
      });
      
      // Verify MicroloanSystem
      console.log(`🏧 Verifying MicroloanSystem at ${deployedContracts.microloanSystem}...`);
      await hre.run("verify:verify", {
        address: deployedContracts.microloanSystem,
        constructorArguments: [
          deployer.address,
          cUSDAddress,
          deployer.address, // fee collector
          platformFee
        ],
      });
      
      console.log("\n✅ Contract verification completed successfully!");
    } catch (error) {
      console.log("\n⚠️  Verification failed or contracts might already be verified");
      console.log("Error details:", error.message);
      console.log("\nYou can try manual verification with:");
      console.log(`npx hardhat run scripts/manual-verify.js --network ${hre.network.name}`);
    }
  }
}

// Execute the deployment function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
