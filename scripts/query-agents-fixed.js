const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Querying registered agents with proper BigInt handling...");
  console.log("=" .repeat(60));
  
  const villageWalletAddress = "0x823c8333E17a9A06096F996725673246538EAf40";
  const villageWallet = await ethers.getContractAt("VillageWallet", villageWalletAddress);
  
    // Test agent addresses - updated with actual registered agents
  const testAgentAddresses = [
    "0x50625608E728cad827066dD78F5B4e8d203619F3", // Deployer (Test Hub)
    "0x18F333EF44aC1c7e5a0858437DEd34ac548dE53a", // Nairobi Digital Services
  ];
  
  console.log("\n📋 Querying registered agents...");
  
  for (let i = 0; i < testAgentAddresses.length; i++) {
    const agentAddress = testAgentAddresses[i];
    console.log(`\n${i + 1}. Querying agent: ${agentAddress}`);
    
    try {
      const agentInfo = await villageWallet.agents(agentAddress);
      
      // Properly handle BigInt conversions - with safety checks
      const commissionRate = agentInfo.commissionRate ? Number(agentInfo.commissionRate) : 0;
      const totalVolume = agentInfo.totalVolume ? ethers.formatEther(agentInfo.totalVolume) : "0.0";
      const successfulTransactions = agentInfo.successfulTransactions ? Number(agentInfo.successfulTransactions) : 0;
      const registrationTime = agentInfo.registrationTime ? Number(agentInfo.registrationTime) : 0;
      
      // Convert timestamp to readable date
      const registrationDate = registrationTime > 0 ? new Date(registrationTime * 1000).toLocaleString() : 'Unknown';
      
      console.log(`   ✅ Agent Details:`);
      console.log(`   📍 Location: ${agentInfo.location}`);
      console.log(`   🏢 Business: ${agentInfo.businessName}`);
      console.log(`   💰 Commission: ${commissionRate / 100}%`);
      console.log(`   🟢 Active: ${agentInfo.isActive ? 'Yes' : 'No'}`);
      console.log(`   📊 Total Volume: ${totalVolume} CELO`);
      console.log(`   🔄 Transactions: ${successfulTransactions}`);
      console.log(`   📅 Registered: ${registrationDate}`);
      
    } catch (error) {
      console.log(`   ❌ Error querying agent: ${error.message}`);
    }
  }
  
  console.log("\n" + "=" .repeat(60));
  console.log("🎯 Agent Network Summary:");
  
  let totalActiveAgents = 0;
  let totalVolume = 0;
  let totalTransactions = 0;
  
  for (const agentAddress of testAgentAddresses) {
    try {
      const agentInfo = await villageWallet.agents(agentAddress);
      if (agentInfo.isActive) {
        totalActiveAgents++;
        totalVolume += parseFloat(ethers.formatEther(agentInfo.totalVolume));
        totalTransactions += Number(agentInfo.successfulTransactions);
      }
    } catch (error) {
      // Skip failed queries
    }
  }
  
  console.log(`📊 Active Agents: ${totalActiveAgents}`);
  console.log(`💰 Total Volume: ${totalVolume.toFixed(4)} CELO`);
  console.log(`🔄 Total Transactions: ${totalTransactions}`);
  
  console.log("\n🧪 Testing agent queries in frontend format...");
  
  // Test the format we'll use in the frontend
  for (let i = 0; i < testAgentAddresses.length; i++) {
    const agentAddress = testAgentAddresses[i];
    try {
      const agentInfo = await villageWallet.agents(agentAddress);
      
      // Format as we would in the frontend
      const formattedAgent = {
        address: agentAddress,
        location: agentInfo.location,
        businessName: agentInfo.businessName,
        commissionRate: Number(agentInfo.commissionRate),
        isActive: agentInfo.isActive,
        totalVolume: ethers.formatEther(agentInfo.totalVolume),
        successfulTransactions: Number(agentInfo.successfulTransactions),
        registrationTime: Number(agentInfo.registrationTime)
      };
      
      console.log(`\n${i + 1}. Frontend Format:`, JSON.stringify(formattedAgent, null, 2));
      
    } catch (error) {
      console.log(`   ❌ Frontend format error: ${error.message}`);
    }
  }
  
  console.log("\n✅ All BigInt conversions handled properly!");
  console.log("🚀 Agents are ready for frontend integration!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
