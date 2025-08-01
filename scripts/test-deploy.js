const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing simple contract deployment...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);
    
    // Try to deploy the simplest contract first
    console.log("Deploying VillageToken...");
    const VillageToken = await ethers.getContractFactory("VillageToken");
    
    // Get deployment parameters
    const deploymentTx = await VillageToken.getDeployTransaction();
    console.log("Deployment transaction data prepared");
    
    // Estimate gas
    const gasEstimate = await ethers.provider.estimateGas(deploymentTx);
    console.log("Gas estimate:", gasEstimate.toString());
    
    // Get current gas price
    const feeData = await ethers.provider.getFeeData();
    console.log("Current gas price:", ethers.formatUnits(feeData.gasPrice, "gwei"), "gwei");
    
    // Deploy with manual gas settings
    const villageToken = await VillageToken.deploy({
      gasLimit: gasEstimate + 100000n, // Add some buffer
      gasPrice: feeData.gasPrice
    });
    
    console.log("Deployment transaction sent, waiting for confirmation...");
    await villageToken.waitForDeployment();
    
    const address = await villageToken.getAddress();
    console.log("✅ VillageToken deployed to:", address);
    
  } catch (error) {
    console.error("❌ Deployment failed:");
    console.error(error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
