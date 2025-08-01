const { ethers } = require("hardhat");

async function registerTestAgents() {
  console.log("🚀 Registering test agents with proper checksums...");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Using deployer account:", deployer.address);
  
  const villageWalletAddress = "0x823c8333E17a9A06096F996725673246538EAf40";
  
  // Connect to the deployed contract
  const VillageWallet = await ethers.getContractFactory("VillageWallet");
  const villageWallet = VillageWallet.attach(villageWalletAddress);
  
  // Generate proper checksum addresses
  const agents = [
    {
      address: ethers.getAddress("0x94975C47a93064bB8E1A4eE325361C59CDF8571B"),
      location: "Kampala Central Market",
      businessName: "Kampala Mobile Money Exchange",
      commissionRate: 200 // 2%
    },
    {
      address: ethers.getAddress("0x18F333EF44aC1c7e5a0858437DEd34ac548dE53a"),
      location: "Nairobi Kawangware",
      businessName: "Nairobi Village Banking Hub", 
      commissionRate: 250 // 2.5%
    },
    {
      address: ethers.getAddress("0x77D41c0fDa8D8e58Ff8c6C5a69B93ea1F3F7ef6E"),
      location: "Lagos Ikeja District",
      businessName: "Lagos Community Finance Center",
      commissionRate: 300 // 3%
    }
  ];
  
  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i];
    try {
      console.log(`\n${i + 1}. Registering agent: ${agent.address}`);
      console.log(`   Business: "${agent.businessName}"`);
      console.log(`   Location: "${agent.location}"`);
      console.log(`   Commission: ${agent.commissionRate / 100}%`);
      
      // Check if already registered
      const existingAgent = await villageWallet.agents(agent.address);
      if (existingAgent.isActive) {
        console.log(`   ✅ Already registered!`);
        continue;
      }
      
      // Register the agent
      const tx = await villageWallet.registerAgent(
        agent.location,
        agent.businessName,
        agent.commissionRate
      );
      
      console.log(`   📤 Transaction sent: ${tx.hash}`);
      await tx.wait();
      console.log(`   ✅ Agent registered successfully!`);
      
    } catch (error) {
      console.log(`   ❌ Error registering agent: ${error.message}`);
    }
  }
  
  console.log("\n🎉 Agent registration complete!");
  
  // Verify all registrations
  console.log("\n🔍 Verifying all agent registrations...");
  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i];
    try {
      const agentInfo = await villageWallet.agents(agent.address);
      console.log(`\n${i + 1}. ${agent.businessName}`);
      console.log(`   Address: ${agent.address}`);
      console.log(`   Location: "${agentInfo.location}"`);
      console.log(`   Business: "${agentInfo.businessName}"`);
      console.log(`   Commission: ${Number(agentInfo.commissionRate) / 100}%`);
      console.log(`   Active: ${agentInfo.isActive}`);
      console.log(`   Volume: ${ethers.formatEther(agentInfo.totalVolume)} VLG`);
      console.log(`   Transactions: ${Number(agentInfo.successfulTransactions)}`);
    } catch (error) {
      console.log(`\n${i + 1}. ${agent.businessName}`);
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

registerTestAgents()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
