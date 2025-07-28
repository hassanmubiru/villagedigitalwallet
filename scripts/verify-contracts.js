// Script to verify deployed contracts
const hre = require("hardhat");
const { contractAddresses } = require('../app/lib/contractAddresses');
const { ethers } = require('hardhat');

async function verifyContracts() {
  if (!contractAddresses || !contractAddresses.savingsGroup || !contractAddresses.microloanSystem) {
    console.error('No contract addresses found. Please deploy contracts first.');
    return;
  }

  console.log('Starting contract verification...');
  
  // Get the deployer address for constructor arguments
  const [deployer] = await ethers.getSigners();
  console.log(`Using deployer address: ${deployer.address}`);
  
  // cUSD address on Alfajores testnet
  const cUSDAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";
  const platformFee = 250; // 2.5% as basis points

  try {
    // Verify MicroloanSystem
    console.log(`\nVerifying MicroloanSystem at ${contractAddresses.microloanSystem}`);
    await hre.run("verify:verify", {
      address: contractAddresses.microloanSystem,
      constructorArguments: [
        deployer.address,
        cUSDAddress,
        deployer.address, // fee collector
        platformFee
      ],
    });
    
    // Verify SavingsGroup
    console.log(`\nVerifying SavingsGroup at ${contractAddresses.savingsGroup}`);
    await hre.run("verify:verify", {
      address: contractAddresses.savingsGroup,
      constructorArguments: [
        "Community Savings Group",
        cUSDAddress,
        ethers.parseEther("10"), // contributionAmount
        ethers.parseEther("100"), // maxLoanAmount
        250,                      // defaultInterestRate
        deployer.address          // group admin
      ],
    });
    
    console.log('\nContract verification completed successfully!');
  } catch (error) {
    console.error('Error during verification:', error);
  }
}

// If this file is run directly
if (require.main === module) {
  verifyContracts()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { verifyContracts };
