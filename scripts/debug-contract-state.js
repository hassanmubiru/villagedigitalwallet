const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Debugging VillageWallet contract state...");
    
    // Contract address and ABI
    const VILLAGE_WALLET_ADDRESS = "0x823c8333E17a9A06096F996725673246538EAf40";
    
    try {
        // Get the VillageWallet contract
        const VillageWallet = await ethers.getContractFactory("VillageWallet");
        const villageWallet = VillageWallet.attach(VILLAGE_WALLET_ADDRESS);
        
        console.log("📄 Contract address:", VILLAGE_WALLET_ADDRESS);
        
        // Get deployer address
        const [deployer] = await ethers.getSigners();
        console.log("👤 Deployer address:", deployer.address);
        
        // Check if deployer is registered as agent
        console.log("\n🔍 Checking agent registration...");
        try {
            const agentInfo = await villageWallet.agents(deployer.address);
            console.log("✅ Agent info retrieved:");
            console.log("   isActive:", agentInfo.isActive);
            console.log("   businessName:", agentInfo.businessName);
            console.log("   location:", agentInfo.location);
            console.log("   commissionRate:", Number(agentInfo.commissionRate));
            console.log("   totalVolume:", ethers.formatEther(agentInfo.totalVolume));
            console.log("   transactionCount:", agentInfo.transactionCount ? Number(agentInfo.transactionCount) : 0);
        } catch (error) {
            console.log("❌ Error retrieving agent info:", error.message);
        }
        
        // Try to get agent count
        console.log("\n📊 Checking agent count...");
        try {
            const agentCount = await villageWallet.getAgentCount();
            console.log("✅ Total agents registered:", Number(agentCount));
        } catch (error) {
            console.log("❌ Error getting agent count:", error.message);
        }
        
        // Try to get all agents if method exists
        console.log("\n📋 Attempting to get all agents...");
        try {
            const agents = await villageWallet.getAllAgents();
            console.log("✅ All agents:", agents);
        } catch (error) {
            console.log("❌ Error getting all agents:", error.message);
        }
        
        // Check contract deployment
        console.log("\n🏗️ Contract deployment verification...");
        const code = await ethers.provider.getCode(VILLAGE_WALLET_ADDRESS);
        if (code === "0x") {
            console.log("❌ No contract code found at address!");
        } else {
            console.log("✅ Contract code exists (", code.length, "characters)");
        }
        
    } catch (error) {
        console.error("💥 Error debugging contract state:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
