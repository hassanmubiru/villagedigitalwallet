// Deployment script for Village Digital Wallet smart contracts
const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Village Digital Wallet contracts...");

  // Get the Contract Factory
  const SavingsGroup = await ethers.getContractFactory("SavingsGroup");
  const MicroloanSystem = await ethers.getContractFactory("MicroloanSystem");

  // For deployment we'll need to get the deployer address
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

  // We'll use cUSD as the payment token on Celo
  // cUSD address on Alfajores testnet
  const cUSDAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";
  
  // Platform fee constant
  const platformFee = 250; // 2.5% as basis points
  
  // Get current gas price from the network and add a buffer
  const feeData = await ethers.provider.getFeeData();
  
  // Extract and calculate gas prices
  const maxFeePerGas = feeData.maxFeePerGas || feeData.gasPrice;
  const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || 
    (feeData.maxFeePerGas ? feeData.maxFeePerGas / BigInt(2) : BigInt("1000000000")); // 1 gwei default
  
  // Add 50% buffer to maxFeePerGas
  const bufferedMaxFeePerGas = maxFeePerGas * BigInt(150) / BigInt(100);
  
  console.log(`Current network base fee: ${ethers.formatUnits(feeData.gasPrice || maxFeePerGas, 'gwei')} gwei`);
  console.log(`Using maxFeePerGas: ${ethers.formatUnits(bufferedMaxFeePerGas, 'gwei')} gwei`);
  console.log(`Using maxPriorityFeePerGas: ${ethers.formatUnits(maxPriorityFeePerGas, 'gwei')} gwei`);
  
  // Deploy an example SavingsGroup first
  console.log("Deploying example SavingsGroup...");
  const groupName = "Community Savings Group";
  const contributionAmount = ethers.parseEther("10"); // 10 cUSD

  const savingsGroup = await SavingsGroup.deploy(
    groupName,
    cUSDAddress,         // payment token address (cUSD)
    contributionAmount,  // minimum contribution
    ethers.parseEther("100"), // maxLoanAmount - 100 cUSD
    250,                 // defaultInterestRate - 2.5% in basis points
    deployer.address,    // group admin
    { 
      gasLimit: 8000000,
      maxFeePerGas: bufferedMaxFeePerGas,
      maxPriorityFeePerGas: maxPriorityFeePerGas
    }
  );

  await savingsGroup.waitForDeployment();
  const savingsAddress = await savingsGroup.getAddress();
  console.log(`SavingsGroup deployed to: ${savingsAddress}`);

  // Now deploy the MicroloanSystem with the savings group address
  console.log("Deploying MicroloanSystem...");
  
  const microloanSystem = await MicroloanSystem.deploy(
    deployer.address,    // initial owner
    cUSDAddress,         // payment token address (cUSD)
    deployer.address,    // fee collector (same as owner for simplicity)
    platformFee,         // platform fee in basis points
    { 
      gasLimit: 8000000,
      maxFeePerGas: bufferedMaxFeePerGas,
      maxPriorityFeePerGas: maxPriorityFeePerGas
    }
  );

  await microloanSystem.waitForDeployment();
  const microloanAddress = await microloanSystem.getAddress();
  console.log(`MicroloanSystem deployed to: ${microloanAddress}`);

  // Log all contract addresses for easy reference
  console.log("\nContract Addresses:");
  console.log("====================");
  console.log(`MicroloanSystem: ${microloanAddress}`);
  console.log(`SavingsGroup: ${savingsAddress}`);
  console.log("\nDeployment complete!");
  
  // Update the contract addresses file
  try {
    const { updateContractAddresses } = require('./update-contract-addresses');
    await updateContractAddresses(savingsAddress, microloanAddress);
    console.log("Contract addresses file updated successfully");
  } catch (error) {
    console.error("Failed to update contract addresses file:", error.message);
  }
  
  // Verify contracts if not on a local network
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nWaiting for block confirmations...");
    
    // Check for API key
    if (!process.env.ETHERSCAN_API_KEY || process.env.ETHERSCAN_API_KEY === "") {
      console.log("\n⚠️  WARNING: Missing ETHERSCAN_API_KEY in your .env file");
      console.log("Contract verification will likely fail without an API key");
      console.log("Register for a free API key at https://celoscan.io/register");
      console.log("Then add it to your .env file as: ETHERSCAN_API_KEY=your_api_key_here");
      console.log("\nSkipping automatic verification...");
      
      console.log("\nDeployed Contract Addresses (SAVE THESE):");
      console.log(`SavingsGroup: ${savingsAddress}`);
      console.log(`MicroloanSystem: ${microloanAddress}`);
      console.log("\nYou can manually verify later using:");
      console.log(`npx hardhat run scripts/manual-verify.js --network ${hre.network.name}`);
      return;
    }
    
    // Wait for some time to ensure the contracts are mined
    console.log("Waiting for 30 seconds before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
    
    console.log("\nVerifying contracts on Celo Explorer...");
    
    try {
      // Verify SavingsGroup first
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
      
      // Verify MicroloanSystem next
      console.log(`\nVerifying MicroloanSystem at ${microloanAddress}...`);
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
      
      console.log("\nContract verification completed successfully!");
    } catch (error) {
      console.log("\nVerification failed or contracts might already be verified");
      console.log("Error details:", error.message);
      console.log("\nYou can try manual verification with:");
      console.log(`npx hardhat run scripts/manual-verify.js --network ${hre.network.name}`);
    }
  }
}

// Execute the deployment function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
