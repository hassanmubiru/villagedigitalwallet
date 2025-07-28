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
  
  // Deploy the MicroloanSystem contract
  console.log("Deploying MicroloanSystem...");
  const platformFee = 250; // 2.5% as basis points
  const microloanSystem = await MicroloanSystem.deploy(
    deployer.address, // initial owner
    cUSDAddress,      // loan token address (cUSD)
    deployer.address, // fee collector
    platformFee       // platform fee percentage
  );

  await microloanSystem.waitForDeployment();
  const microloanAddress = await microloanSystem.getAddress();
  console.log(`MicroloanSystem deployed to: ${microloanAddress}`);

  // Deploy an example SavingsGroup
  console.log("Deploying example SavingsGroup...");
  const groupName = "Community Savings Group";
  const groupDescription = "Demo group for Village Digital Wallet";
  const contributionAmount = ethers.parseEther("10"); // 10 cUSD
  const payoutIntervalDays = 30; // Monthly payouts

  const savingsGroup = await SavingsGroup.deploy(
    deployer.address,    // initial owner
    groupName,
    groupDescription,
    contributionAmount,
    payoutIntervalDays,
    cUSDAddress          // payment token address (cUSD)
  );

  await savingsGroup.waitForDeployment();
  const savingsAddress = await savingsGroup.getAddress();
  console.log(`SavingsGroup deployed to: ${savingsAddress}`);

  // Log all contract addresses for easy reference
  console.log("\nContract Addresses:");
  console.log("====================");
  console.log(`MicroloanSystem: ${microloanAddress}`);
  console.log(`SavingsGroup: ${savingsAddress}`);
  console.log("\nDeployment complete!");
  
  // Verify contracts if not on a local network
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\nWaiting for block confirmations...");
    
    // Wait for 5 block confirmations to ensure the contracts are mined
    await microloanSystem.deployTransaction.wait(5);
    await savingsGroup.deployTransaction.wait(5);
    
    console.log("\nVerifying contracts on block explorer...");
    
    try {
      // Verify MicroloanSystem
      await hre.run("verify:verify", {
        address: microloanAddress,
        constructorArguments: [
          deployer.address,
          cUSDAddress,
          deployer.address,
          platformFee
        ],
      });
      
      // Verify SavingsGroup
      await hre.run("verify:verify", {
        address: savingsAddress,
        constructorArguments: [
          deployer.address,
          groupName,
          groupDescription,
          contributionAmount,
          payoutIntervalDays,
          cUSDAddress
        ],
      });
      
      console.log("Contract verification completed!");
    } catch (error) {
      console.error("Error verifying contracts:", error);
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
