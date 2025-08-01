const { ethers } = require("hardhat");

async function main() {
  console.log("🏪 Setting up test agents for cash-in/out functionality...");
  console.log("=" .repeat(60));
  
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer address:", deployer.address);
  
  const villageWalletAddress = "0x823c8333E17a9A06096F996725673246538EAf40";
  
  // Get current gas price
  const feeData = await ethers.provider.getFeeData();
  const gasOptions = {
    gasPrice: feeData.gasPrice
  };
  
  try {
    // Create test wallets for agents
    const testAgents = [
      {
        wallet: ethers.Wallet.createRandom().connect(ethers.provider),
        location: "Kampala Central, Uganda",
        businessName: "Kampala Mobile Money Hub",
        commissionRate: 200 // 2%
      },
      {
        wallet: ethers.Wallet.createRandom().connect(ethers.provider),
        location: "Nairobi CBD, Kenya",
        businessName: "Nairobi Digital Services",
        commissionRate: 250 // 2.5%
      },
      {
        wallet: ethers.Wallet.createRandom().connect(ethers.provider),
        location: "Lagos Island, Nigeria", 
        businessName: "Lagos Fintech Center",
        commissionRate: 300 // 3%
      }
    ];
    
    console.log("\n💰 Funding test agent wallets...");
    
    // Fund each agent wallet with some CELO for gas
    for (let i = 0; i < testAgents.length; i++) {
      const agent = testAgents[i];
      console.log(`\n${i + 1}. Funding ${agent.businessName}`);
      console.log(`   Address: ${agent.wallet.address}`);
      
      // Send 0.1 CELO to each agent for gas fees
      const fundingAmount = ethers.parseEther("0.1");
      const tx = await deployer.sendTransaction({
        to: agent.wallet.address,
        value: fundingAmount,
        gasPrice: gasOptions.gasPrice
      });
      
      console.log(`   📝 Funding transaction: ${tx.hash}`);
      await tx.wait();
      console.log(`   ✅ Funded with 0.1 CELO for gas fees`);
    }
    
    console.log("\n📝 Registering agents...");
    
    // Register each agent
    for (let i = 0; i < testAgents.length; i++) {
      const agent = testAgents[i];
      console.log(`\n${i + 1}. Registering agent: ${agent.businessName}`);
      
      try {
        // Connect to contract with agent's wallet
        const villageWallet = await ethers.getContractAt("VillageWallet", villageWalletAddress, agent.wallet);
        
        const tx = await villageWallet.registerAgent(
          agent.location,
          agent.businessName,
          agent.commissionRate,
          gasOptions
        );
        
        console.log(`   📝 Transaction submitted: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`   ✅ Agent registered successfully! Gas used: ${receipt.gasUsed}`);
        
      } catch (error) {
        console.error(`   ❌ Failed to register agent: ${error.message}`);
      }
      
      // Small delay between registrations
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log("\n" + "=" .repeat(60));
    console.log("🎊 Agent setup completed!");
    
    // Query and display all registered agents
    console.log("\n📋 Querying registered agents...");
    const villageWallet = await ethers.getContractAt("VillageWallet", villageWalletAddress);
    
    for (let i = 0; i < testAgents.length; i++) {
      const agent = testAgents[i];
      try {
        const agentInfo = await villageWallet.agents(agent.wallet.address);
        console.log(`\n${i + 1}. ${agent.businessName}:`);
        console.log(`   Address: ${agent.wallet.address}`);
        console.log(`   Location: ${agentInfo.location}`);
        console.log(`   Business: ${agentInfo.businessName}`);
        console.log(`   Commission: ${agentInfo.commissionRate / 100}%`);
        console.log(`   Active: ${agentInfo.isActive ? 'Yes' : 'No'}`);
        console.log(`   Total Volume: ${ethers.formatEther(agentInfo.totalVolume)} CELO`);
        console.log(`   Successful Transactions: ${agentInfo.successfulTransactions}`);
      } catch (error) {
        console.log(`   ❌ Error querying agent: ${error.message}`);
      }
    }
    
    // Save agent information for frontend
    const agentData = testAgents.map(agent => ({
      address: agent.wallet.address,
      privateKey: agent.wallet.privateKey, // For testing only!
      location: agent.location,
      businessName: agent.businessName,
      commissionRate: agent.commissionRate
    }));
    
    const fs = require('fs');
    const filename = `deployments/test-agents-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify({
      network: "alfajores",
      createdAt: new Date().toISOString(),
      agents: agentData
    }, null, 2));
    
    console.log(`\n💾 Agent details saved to: ${filename}`);
    console.log("⚠️  WARNING: Private keys are included for testing purposes only!");
    
    console.log("\n📱 Next steps for testing:");
    console.log("1. Users can now find these agents for cash-in/out operations");
    console.log("2. Test the agent discovery in the frontend application");
    console.log("3. Simulate cash-in/out transactions with these test agents");
    console.log("4. Monitor agent commissions and transaction volumes");
    
    console.log("\n🔗 Frontend integration:");
    console.log("- Use agents() mapping to query agent details");
    console.log("- Implement agent search by location");
    console.log("- Add agent rating and review system");
    console.log("- Create agent dashboard for transaction history");
    
    console.log("\n🎯 Test scenarios:");
    console.log("1. User searches for nearby agents");
    console.log("2. User initiates cash-in with an agent");
    console.log("3. Agent completes cash-in transaction");
    console.log("4. User withdraws digital balance as cash-out");
    console.log("5. Track agent commissions and user transaction history");
    
  } catch (error) {
    console.error("❌ Agent setup failed:");
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
