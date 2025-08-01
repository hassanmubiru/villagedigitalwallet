const { ethers } = require("hardhat");

async function checkAgents() {
  console.log("🔍 Checking actual agent registrations...");
  
  const villageWalletAddress = "0x823c8333E17a9A06096F996725673246538EAf40";
  
  // Connect to the deployed contract
  const VillageWallet = await ethers.getContractFactory("VillageWallet");
  const villageWallet = VillageWallet.attach(villageWalletAddress);
  
  // Test addresses we tried to register
  const testAddresses = [
    "0x94975C47a93064bB8E1A4eE325361C59CDF8571B",
    "0x18F333EF44aC1c7e5a0858437DEd34ac548dE53a",
    "0x77D41c0fDa8D8e58Ff8c6C5a69B93ea1F3F7ef6E"
  ];
  
  console.log("📋 Checking agent registrations...");
  
  for (let i = 0; i < testAddresses.length; i++) {
    const address = testAddresses[i];
    try {
      const agentInfo = await villageWallet.agents(address);
      console.log(`\n${i + 1}. Agent: ${address}`);
      console.log(`   Location: "${agentInfo.location}"`);
      console.log(`   Business: "${agentInfo.businessName}"`);
      console.log(`   Commission: ${agentInfo.commissionRate}`);
      console.log(`   Active: ${agentInfo.isActive}`);
      console.log(`   Volume: ${ethers.formatEther(agentInfo.totalVolume)}`);
      console.log(`   Transactions: ${agentInfo.successfulTransactions}`);
    } catch (error) {
      console.log(`\n${i + 1}. Agent: ${address}`);
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log("\n✅ Agent check complete!");
}

checkAgents()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
