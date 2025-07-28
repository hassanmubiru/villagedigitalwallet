// Script for manual contract verification on the Celo Explorer
const hre = require("hardhat");
const { ethers } = require('hardhat');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

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

// Function to check if API key is set
function checkApiKey() {
  const apiKey = process.env.ETHERSCAN_API_KEY;
  if (!apiKey || apiKey === "") {
    console.log("\n⚠️  WARNING: No ETHERSCAN_API_KEY found in .env file");
    console.log("You'll need to register for an API key at https://celoscan.io/register");
    console.log("Then add it to your .env file as ETHERSCAN_API_KEY=your_api_key_here\n");
    return false;
  }
  return true;
}

async function main() {
  console.log("Manual Contract Verification Tool");
  console.log("================================\n");
  
  // Check if API key is set
  const hasApiKey = checkApiKey();
  if (!hasApiKey) {
    const proceed = await question("Do you want to proceed anyway? (y/n): ");
    if (proceed.toLowerCase() !== 'y') {
      console.log("Verification cancelled. Please set up your API key and try again.");
      rl.close();
      return;
    }
  }
  
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
