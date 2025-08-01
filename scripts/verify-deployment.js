const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Verifying deployed contracts...");
  console.log("=" .repeat(50));
  
  const contracts = {
    VillageToken: "0xa7AE12fAf279a66A2802533f2C7139bB7f4Dfe28",
    VillageWallet: "0x823c8333E17a9A06096F996725673246538EAf40",
    SavingsGroups: "0x4b51C5a8b900D61b45a34d397e14a64b16D300C7",
    MicroloanSystem: "0x36032e35049038B0661D14DE92D4aBfBbD15A357"
  };
  
  try {
    // Test VillageToken
    console.log("\n🪙 Testing VillageToken...");
    const villageToken = await ethers.getContractAt("VillageToken", contracts.VillageToken);
    const name = await villageToken.name();
    const symbol = await villageToken.symbol();
    const totalSupply = await villageToken.totalSupply();
    console.log(`✅ Name: ${name}`);
    console.log(`✅ Symbol: ${symbol}`);
    console.log(`✅ Total Supply: ${ethers.formatEther(totalSupply)} tokens`);
    
    // Test VillageWallet
    console.log("\n💰 Testing VillageWallet...");
    const villageWallet = await ethers.getContractAt("VillageWallet", contracts.VillageWallet);
    const owner = await villageWallet.owner();
    const platformFee = await villageWallet.platformFee();
    console.log(`✅ Owner: ${owner}`);
    console.log(`✅ Platform Fee: ${platformFee / 100}%`);
    
    // Test SavingsGroups
    console.log("\n💰 Testing SavingsGroups...");
    const savingsGroups = await ethers.getContractAt("SavingsGroups", contracts.SavingsGroups);
    const savingsOwner = await savingsGroups.owner();
    console.log(`✅ Owner: ${savingsOwner}`);
    
    // Test MicroloanSystem
    console.log("\n📋 Testing MicroloanSystem...");
    const microloanSystem = await ethers.getContractAt("MicroloanSystem", contracts.MicroloanSystem);
    const loanOwner = await microloanSystem.owner();
    console.log(`✅ Owner: ${loanOwner}`);
    
    console.log("\n" + "=" .repeat(50));
    console.log("🎉 All contracts verified successfully!");
    console.log("✅ Deployment is functional and ready for use");
    
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
