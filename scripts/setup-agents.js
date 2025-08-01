const { ethers } = require("hardhat");

async function main() {
  console.log("🏪 Setting up test agents for cash-in/out functionality...");
  console.log("=" .repeat(60));
  
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer address:", deployer.address);
  
  const villageWalletAddress = "0x823c8333E17a9A06096F996725673246538EAf40";
  const villageWallet = await ethers.getContractAt("VillageWallet", villageWalletAddress);
  
  // Get current gas price
  const feeData = await ethers.provider.getFeeData();
  const gasOptions = {
    gasPrice: feeData.gasPrice
  };
  
  try {
    // Test agent data
    const testAgents = [
      {
        address: "0x742d35Cc6aB33e7d8C03eb5aBFFF5a5e4e2f6C7d", // Random test address
        location: "Kampala Central, Uganda",
        businessName: "Kampala Mobile Money Hub",
        commissionRate: 200 // 2%
      },
      {
        address: "0x8ba1f109551bD432803012645Hac136c0cceC5844", // Another test address  
        location: "Nairobi CBD, Kenya",
        businessName: "Nairobi Digital Services",
        commissionRate: 250 // 2.5%
      },
      {
        address: "0x123e4567e89b12d3a456426614174000", // Another test address
        location: "Lagos Island, Nigeria", 
        businessName: "Lagos Fintech Center",
        commissionRate: 300 // 3%
      }
    ];
    
    console.log("\n📝 Registering test agents...");
    
    for (let i = 0; i < testAgents.length; i++) {
      const agent = testAgents[i];
      console.log(`\n${i + 1}. Registering agent: ${agent.businessName}`);
      console.log(`   Location: ${agent.location}`);
      console.log(`   Commission: ${agent.commissionRate / 100}%`);
      
      try {
        const tx = await villageWallet.registerAgent(
          agent.address,
          agent.location,
          agent.businessName,
          agent.commissionRate,
          gasOptions
        );
        
        console.log(`   📝 Transaction submitted: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`   ✅ Agent registered successfully! Gas used: ${receipt.gasUsed}`);
        
      } catch (error) {
        if (error.message.includes("Agent already registered")) {
          console.log(`   ⚠️  Agent already registered, skipping...`);
        } else {
          console.error(`   ❌ Failed to register agent: ${error.message}`);
        }
      }
      
      // Small delay between registrations
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log("\n" + "=" .repeat(60));
    console.log("🎊 Agent setup completed!");
    
    // Query and display all registered agents
    console.log("\n📋 Querying registered agents...");
    
    for (let i = 0; i < testAgents.length; i++) {
      const agent = testAgents[i];
      try {
        const agentInfo = await villageWallet.getAgentInfo(agent.address);
        console.log(`\n${i + 1}. ${agent.businessName}:`);
        console.log(`   Address: ${agent.address}`);
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
    
    console.log("\n🔧 Setting up agent permissions...");
    
    // Add agents as authorized for cash-in/out operations
    for (const agent of testAgents) {
      try {
        console.log(`Setting permissions for ${agent.businessName}...`);
        const tx = await villageWallet.setAgentPermissions(agent.address, true, gasOptions);
        await tx.wait();
        console.log(`✅ Permissions set for ${agent.businessName}`);
      } catch (error) {
        if (error.message.includes("function selector was not recognized")) {
          console.log(`⚠️  Permission function not available, agents may need manual activation`);
          break;
        } else {
          console.error(`❌ Error setting permissions: ${error.message}`);
        }
      }
    }
    
    console.log("\n📱 Next steps for testing:");
    console.log("1. Users can now perform cash-in operations with these agents");
    console.log("2. Test the cash-in/out flow in the frontend application");
    console.log("3. Agents will earn commissions on successful transactions");
    console.log("4. Monitor agent performance and adjust commission rates as needed");
    
    console.log("\n🔗 Frontend integration:");
    console.log("- Use getAgentInfo() to display agent details");
    console.log("- Use cashIn() and cashOut() functions for transactions");
    console.log("- Implement agent location search and filtering");
    console.log("- Add agent rating and review system");
    
  } catch (error) {
    console.error("❌ Agent setup failed:");
    console.error(error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
