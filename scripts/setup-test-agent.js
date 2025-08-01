const { ethers } = require("hardhat");

async function registerDeployerAsAgents() {
  console.log("🚀 Setting up test agent network using deployer address...");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Using deployer account:", deployer.address);
  
  const villageWalletAddress = "0x823c8333E17a9A06096F996725673246538EAf40";
  
  // Connect to the deployed contract
  const VillageWallet = await ethers.getContractFactory("VillageWallet");
  const villageWallet = VillageWallet.attach(villageWalletAddress);
  
  // Check if deployer is already registered as agent
  try {
    const existingAgent = await villageWallet.agents(deployer.address);
    if (existingAgent.isActive) {
      console.log("✅ Deployer is already registered as an agent!");
      console.log(`   Business: "${existingAgent.businessName}"`);
      console.log(`   Location: "${existingAgent.location}"`);
      console.log(`   Commission: ${Number(existingAgent.commissionRate) / 100}%`);
      return;
    }
  } catch (error) {
    console.log("⚠️ Error checking existing agent:", error.message);
  }
  
  // Register deployer as test agent
  try {
    console.log("\n📤 Registering deployer as test agent...");
    const tx = await villageWallet.registerAgent(
      "Test Village Centre",
      "Village Digital Wallet Test Hub",
      250 // 2.5% commission
    );
    
    console.log(`📤 Transaction sent: ${tx.hash}`);
    await tx.wait();
    console.log("✅ Deployer registered as agent successfully!");
    
    // Verify registration
    const agentInfo = await villageWallet.agents(deployer.address);
    console.log("\n🔍 Agent Registration Details:");
    console.log(`   Address: ${deployer.address}`);
    console.log(`   Business: "${agentInfo.businessName}"`);
    console.log(`   Location: "${agentInfo.location}"`);
    console.log(`   Commission: ${Number(agentInfo.commissionRate) / 100}%`);
    console.log(`   Active: ${agentInfo.isActive}`);
    console.log(`   Volume: ${ethers.formatEther(agentInfo.totalVolume)} VLG`);
    console.log(`   Transactions: ${Number(agentInfo.successfulTransactions)}`);
    
  } catch (error) {
    console.log("❌ Error registering agent:", error.message);
  }
  
  console.log("\n🎯 Test agent is ready for frontend testing!");
}

registerDeployerAsAgents()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
