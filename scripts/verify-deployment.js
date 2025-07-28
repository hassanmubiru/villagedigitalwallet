// Script to verify contract deployment
const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  // Get the contract address from command line arguments
  const contractAddress = process.argv[2];
  
  if (!contractAddress) {
    console.error("Please provide the contract address as an argument");
    console.log("Usage: npx hardhat run scripts/verify-deployment.js --network alfajores 0xYourContractAddress");
    return;
  }
  
  console.log(`Verifying contract at address: ${contractAddress}`);
  
  try {
    // Try to determine if it's a SavingsGroup
    const SavingsGroup = await ethers.getContractFactory("SavingsGroup");
    const savingsGroup = await SavingsGroup.attach(contractAddress);
    
    console.log("Attempting to read SavingsGroup details...");
    
    try {
      const owner = await savingsGroup.owner();
      console.log(`Owner address: ${owner}`);
      
      // Try to get group name
      const groupDetails = await savingsGroup.getGroupDetails();
      console.log("Contract verified! This is a SavingsGroup contract");
      console.log(`Group Name: ${groupDetails.name}`);
      console.log(`Group Description: ${groupDetails.description}`);
      console.log(`Contribution Amount: ${ethers.formatEther(groupDetails.contributionAmount)} tokens`);
      console.log(`Total Members: ${groupDetails.memberCount}`);
      return;
    } catch (error) {
      console.log("Not a SavingsGroup or error reading details");
    }
    
    // Try to determine if it's a MicroloanSystem
    const MicroloanSystem = await ethers.getContractFactory("MicroloanSystem");
    const microloanSystem = await MicroloanSystem.attach(contractAddress);
    
    console.log("Attempting to read MicroloanSystem details...");
    
    try {
      const owner = await microloanSystem.owner();
      console.log(`Owner address: ${owner}`);
      
      // Try to get platform fee
      const platformFee = await microloanSystem.platformFeePercentage();
      console.log("Contract verified! This is a MicroloanSystem contract");
      console.log(`Platform Fee: ${platformFee / 100}%`);
      console.log(`Fee Collector: ${await microloanSystem.feeCollector()}`);
      return;
    } catch (error) {
      console.log("Not a MicroloanSystem or error reading details");
    }
    
    console.log("Could not verify contract. It might not be a Village Digital Wallet contract or there might be an error.");
    
  } catch (error) {
    console.error("Error verifying contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
