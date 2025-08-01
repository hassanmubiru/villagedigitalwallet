const { ethers } = require("hardhat");

async function main() {
  console.log("Testing network connection...");
  
  // Get network information
  const network = await ethers.provider.getNetwork();
  console.log("Connected to network:", {
    name: network.name,
    chainId: network.chainId.toString(),
    ensAddress: network.ensAddress || "N/A"
  });
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  
  // Get balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "CELO");
  
  // Get block number
  const blockNumber = await ethers.provider.getBlockNumber();
  console.log("Current block number:", blockNumber);
  
  console.log("✅ Network connection test successful!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Network connection test failed:");
    console.error(error);
    process.exit(1);
  });
