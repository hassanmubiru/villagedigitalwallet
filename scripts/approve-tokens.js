// Token approval script for Village Digital Wallet
const hre = require("hardhat");
const readline = require('readline');

// Create readline interface for interactive prompts
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt user input
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log("Village Digital Wallet - Token Approval Script");
  console.log("===========================================\n");

  try {
    const [signer] = await hre.ethers.getSigners();
    console.log(`Connected wallet address: ${signer.address}`);

    // Ask for token contract address
    const tokenAddress = await question(
      "\nEnter token address (cUSD on Alfajores: 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1): "
    );

    // Ask for spender contract address
    const spenderAddress = await question("\nEnter contract address to approve (SavingsGroup or MicroloanSystem): ");

    // Ask for amount to approve
    const amount = await question("\nEnter amount to approve (in tokens): ");
    
    // Create ERC20 interface
    const erc20Abi = [
      "function approve(address spender, uint256 amount) public returns (bool)",
      "function allowance(address owner, address spender) public view returns (uint256)"
    ];
    
    const tokenContract = new hre.ethers.Contract(tokenAddress, erc20Abi, signer);

    // Approve tokens
    const amountWei = hre.ethers.parseEther(amount);
    console.log(`\nApproving ${amount} tokens to be spent by ${spenderAddress}...`);
    
    const tx = await tokenContract.approve(spenderAddress, amountWei);
    console.log(`Transaction hash: ${tx.hash}`);
    await tx.wait();
    
    // Check allowance
    const allowance = await tokenContract.allowance(signer.address, spenderAddress);
    console.log(`\nSuccess! Current allowance: ${hre.ethers.formatEther(allowance)} tokens`);

  } catch (error) {
    console.error("Error approving tokens:", error);
  } finally {
    rl.close();
  }
}

// Execute the main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
