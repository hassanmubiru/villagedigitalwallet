// Script for manual contract verification on the Celo Explorer
const hre = require("hardhat");
const { ethers } = require('hardhat');
const readline = require('readline');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify the question function
function question(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

async function main() {
  console.log("Manual Contract Verification Tool");
  console.log("================================\n");
  
  // Get contract addresses from user input
  const savingsAddress = await question("Enter SavingsGroup contract address: ");
  const microloanAddress = await question("Enter MicroloanSystem contract address: ");
  
  // Get the deployer address for constructor arguments
  const [deployer] = await ethers.getSigners();
  console.log(`\nUsing deployer address: ${deployer.address}`);
  
  // cUSD address on Alfajores testnet
  const cUSDAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";
  const platformFee = 250; // 2.5% as basis points
  const groupName = "Community Savings Group";
  const contributionAmount = ethers.parseEther("10"); // 10 cUSD
  
  console.log("\nStarting contract verification...\n");
  
  try {
    // First verify SavingsGroup
    if (savingsAddress && savingsAddress !== "") {
      console.log(`Verifying SavingsGroup at ${savingsAddress}...`);
      
      await hre.run("verify:verify", {
        address: savingsAddress,
        contract: "contracts/SavingsGroup.sol:SavingsGroup",
        constructorArguments: [
          groupName,
          cUSDAddress,
          contributionAmount,
          ethers.parseEther("100"), // maxLoanAmount
          250,                      // defaultInterestRate
          deployer.address          // group admin
        ],
      });
      
      console.log("\nSavingsGroup verification completed!\n");
    }
    
    // Then verify MicroloanSystem
    if (microloanAddress && microloanAddress !== "") {
      console.log(`Verifying MicroloanSystem at ${microloanAddress}...`);
      
      await hre.run("verify:verify", {
        address: microloanAddress,
        contract: "contracts/MicroloanSystem.sol:MicroloanSystem",
        constructorArguments: [
          deployer.address,
          cUSDAddress,
          deployer.address, // fee collector
          platformFee
        ],
      });
      
      console.log("\nMicroloanSystem verification completed!\n");
    }
    
    console.log("\nAll contracts verified successfully!");
  } catch (error) {
    console.error("Verification error:", error.message);
  }
  
  rl.close();
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
