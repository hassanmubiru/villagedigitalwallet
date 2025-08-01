const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking current network gas price...");
  
  const feeData = await ethers.provider.getFeeData();
  console.log("Current fee data:", {
    gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, "gwei") + " gwei" : "N/A",
    maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, "gwei") + " gwei" : "N/A",
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, "gwei") + " gwei" : "N/A"
  });

  const baseFee = await ethers.provider.send("eth_gasPrice", []);
  console.log("Current base fee:", ethers.formatUnits(baseFee, "gwei"), "gwei");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
