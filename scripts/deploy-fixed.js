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
    // 1. Deploy VillageToken (ERC20 rewards token)
    console.log("\n1️⃣  Deploying VillageToken...");
    const VillageToken = await ethers.getContractFactory("VillageToken");
    const villageToken = await VillageToken.deploy(gasOptions);
    await villageToken.waitForDeployment();
    const villageTokenAddress = await villageToken.getAddress();
    deployedContracts.VillageToken = villageTokenAddress;
    console.log("✅ VillageToken deployed to:", villageTokenAddress);
    
    // 2. Deploy VillageWallet (Main wallet contract)
    console.log("\n2️⃣  Deploying VillageWallet...");
    const VillageWallet = await ethers.getContractFactory("VillageWallet");
    const villageWallet = await VillageWallet.deploy(gasOptions);
    await villageWallet.waitForDeployment();
    const villageWalletAddress = await villageWallet.getAddress();
    deployedContracts.VillageWallet = villageWalletAddress;
    console.log("✅ VillageWallet deployed to:", villageWalletAddress);
    
    // 3. Deploy SavingsGroups (ROSCA functionality)
    console.log("\n3️⃣  Deploying SavingsGroups...");
    const SavingsGroups = await ethers.getContractFactory("SavingsGroups");
    // For contracts with constructor parameters, pass them first, then options
    const savingsGroups = await SavingsGroups.deploy(villageTokenAddress, gasOptions);
    await savingsGroups.waitForDeployment();
    const savingsGroupsAddress = await savingsGroups.getAddress();
    deployedContracts.SavingsGroups = savingsGroupsAddress;
    console.log("✅ SavingsGroups deployed to:", savingsGroupsAddress);
    
    // 4. Deploy MicroloanSystem (Lending functionality)
    console.log("\n4️⃣  Deploying MicroloanSystem...");
    const MicroloanSystem = await ethers.getContractFactory("MicroloanSystem");
    const microloanSystem = await MicroloanSystem.deploy(villageTokenAddress, gasOptions);
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
      contracts: deployedContracts
    };
    
    const filename = `deployments/${network.name}-${Date.now()}.json`;
    fs.mkdirSync('deployments', { recursive: true });
    fs.writeFileSync(filename, JSON.stringify(deploymentData, null, 2));
    console.log(`\n💾 Deployment details saved to: ${filename}`);
    
    // Update environment file with contract addresses
    const envUpdates = Object.entries(deployedContracts)
      .map(([name, address]) => `${name.toUpperCase()}_ADDRESS=${address}`)
      .join('\n');
    
    console.log("\n📝 Add these to your .env file:");
    console.log(envUpdates);
    
    // Post-deployment setup
    console.log("\n🔧 Running post-deployment setup...");
    
    // Set up contract interactions
    const villageTokenContract = await ethers.getContractAt("VillageToken", villageTokenAddress);
    
    // Mint initial tokens to deployer for testing
    console.log("💎 Minting initial tokens...");
    const initialMint = ethers.parseEther("1000000"); // 1M tokens
    const mintTx = await villageTokenContract.mint(deployer.address, initialMint, gasOptions);
    await mintTx.wait();
    console.log(`✅ Minted ${ethers.formatEther(initialMint)} VWT tokens to deployer`);
    
    console.log("\n🎊 Deployment completed successfully!");
    console.log("Your Village Digital Wallet is ready for use!");
    
  } catch (error) {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
