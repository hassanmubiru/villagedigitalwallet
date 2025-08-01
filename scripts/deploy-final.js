const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting Village Digital Wallet deployment...");
  console.log("=" .repeat(50));
  
  // Get network information
  const network = await ethers.provider.getNetwork();
  console.log("📡 Network:", {
    name: network.name,
    chainId: network.chainId.toString()
  });
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer address:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(balance), "CELO");
  console.log("=" .repeat(50));
  
  // Get current gas price for dynamic pricing
  const feeData = await ethers.provider.getFeeData();
  const gasOptions = {
    gasPrice: feeData.gasPrice
  };
  console.log("⛽ Using gas price:", ethers.formatUnits(feeData.gasPrice, "gwei"), "gwei");
  
  // Deploy contracts in order
  const deployedContracts = {};
  
  try {
    // 1. Deploy VillageToken (ERC20 rewards token) - No constructor parameters
    console.log("\n1️⃣  Deploying VillageToken...");
    const VillageToken = await ethers.getContractFactory("VillageToken");
    const villageToken = await VillageToken.deploy(gasOptions);
    await villageToken.waitForDeployment();
    const villageTokenAddress = await villageToken.getAddress();
    deployedContracts.VillageToken = villageTokenAddress;
    console.log("✅ VillageToken deployed to:", villageTokenAddress);
    
    // 2. Deploy VillageWallet (Main wallet contract) - Requires _feeReceiver
    console.log("\n2️⃣  Deploying VillageWallet...");
    const VillageWallet = await ethers.getContractFactory("VillageWallet");
    const villageWallet = await VillageWallet.deploy(deployer.address, gasOptions);
    await villageWallet.waitForDeployment();
    const villageWalletAddress = await villageWallet.getAddress();
    deployedContracts.VillageWallet = villageWalletAddress;
    console.log("✅ VillageWallet deployed to:", villageWalletAddress);
    
    // 3. Deploy SavingsGroups (ROSCA functionality) - Requires _feeReceiver
    console.log("\n3️⃣  Deploying SavingsGroups...");
    const SavingsGroups = await ethers.getContractFactory("SavingsGroups");
    const savingsGroups = await SavingsGroups.deploy(deployer.address, gasOptions);
    await savingsGroups.waitForDeployment();
    const savingsGroupsAddress = await savingsGroups.getAddress();
    deployedContracts.SavingsGroups = savingsGroupsAddress;
    console.log("✅ SavingsGroups deployed to:", savingsGroupsAddress);
    
    // 4. Deploy MicroloanSystem (Lending functionality) - Requires _feeReceiver and _creditScoringOracle
    console.log("\n4️⃣  Deploying MicroloanSystem...");
    const MicroloanSystem = await ethers.getContractFactory("MicroloanSystem");
    // Use deployer as both fee receiver and credit scoring oracle for initial deployment
    const microloanSystem = await MicroloanSystem.deploy(deployer.address, deployer.address, gasOptions);
    await microloanSystem.waitForDeployment();
    const microloanSystemAddress = await microloanSystem.getAddress();
    deployedContracts.MicroloanSystem = microloanSystemAddress;
    console.log("✅ MicroloanSystem deployed to:", microloanSystemAddress);
    
    console.log("\n" + "=" .repeat(50));
    console.log("🎉 All contracts deployed successfully!");
    console.log("=" .repeat(50));
    
    // Summary
    console.log("\n📋 Deployment Summary:");
    Object.entries(deployedContracts).forEach(([name, address]) => {
      console.log(`   ${name}: ${address}`);
    });
    
    // Save deployment addresses to a file
    const fs = require('fs');
    const deploymentData = {
      network: network.name,
      chainId: network.chainId.toString(),
      deployer: deployer.address,
      deployedAt: new Date().toISOString(),
      gasPrice: ethers.formatUnits(feeData.gasPrice, "gwei") + " gwei",
      contracts: deployedContracts
    };
    
    const filename = `deployments/${network.name}-${Date.now()}.json`;
    fs.mkdirSync('deployments', { recursive: true });
    fs.writeFileSync(filename, JSON.stringify(deploymentData, null, 2));
    console.log(`\n💾 Deployment details saved to: ${filename}`);
    
    // Create .env format for easy copy-paste
    const envUpdates = Object.entries(deployedContracts)
      .map(([name, address]) => `NEXT_PUBLIC_${name.toUpperCase()}_ADDRESS=${address}`)
      .join('\n');
    
    console.log("\n📝 Add these to your .env.local file:");
    console.log("# Contract Addresses - Celo Alfajores Testnet");
    console.log(envUpdates);
    console.log(`NEXT_PUBLIC_NETWORK_NAME=${network.name}`);
    console.log(`NEXT_PUBLIC_CHAIN_ID=${network.chainId}`);
    
    // Post-deployment setup
    console.log("\n🔧 Running post-deployment setup...");
    
    // Set up contract interactions
    const villageTokenContract = await ethers.getContractAt("VillageToken", villageTokenAddress);
    
    // Mint initial tokens to deployer for testing
    console.log("💎 Minting initial tokens for testing...");
    const initialMint = ethers.parseEther("1000000"); // 1M tokens
    const mintTx = await villageTokenContract.mint(deployer.address, initialMint, gasOptions);
    await mintTx.wait();
    console.log(`✅ Minted ${ethers.formatEther(initialMint)} VWT tokens to deployer`);
    
    // Set up village wallet with supported tokens
    console.log("🔧 Configuring VillageWallet...");
    const villageWalletContract = await ethers.getContractAt("VillageWallet", villageWalletAddress);
    
    // Add VillageToken as supported token
    const addTokenTx = await villageWalletContract.addSupportedToken(villageTokenAddress, gasOptions);
    await addTokenTx.wait();
    console.log("✅ Added VillageToken as supported token in VillageWallet");
    
    // Add CELO (native token) as supported - using zero address for native token
    const celoAddress = "0x0000000000000000000000000000000000000000";
    const addCeloTx = await villageWalletContract.addSupportedToken(celoAddress, gasOptions);
    await addCeloTx.wait();
    console.log("✅ Added CELO as supported token in VillageWallet");
    
    console.log("\n🎊 Deployment and setup completed successfully!");
    console.log("Your Village Digital Wallet system is ready for use!");
    console.log("\n🔗 Next steps:");
    console.log("1. Update your frontend .env.local with the contract addresses above");
    console.log("2. Fund the deployer account with test tokens for demonstrations");
    console.log("3. Test the integration with the frontend application");
    console.log("4. Set up additional agents and configure credit scoring oracles");
    
  } catch (error) {
    console.error("❌ Deployment failed:");
    console.error(error.message);
    console.error("\n🔍 Troubleshooting:");
    console.error("- Check gas prices are sufficient for network conditions");
    console.error("- Verify account has enough CELO for deployment");
    console.error("- Ensure all contract dependencies are available");
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
