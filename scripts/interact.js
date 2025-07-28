// Test interaction script for deployed Village Digital Wallet contracts
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
  console.log("Village Digital Wallet - Contract Interaction Script");
  console.log("==================================================\n");

  // Ask user which contract to interact with
  const contractChoice = await question(
    "Which contract would you like to interact with?\n" +
    "1. SavingsGroup\n" +
    "2. MicroloanSystem\n" +
    "Enter number: "
  );

  // Get contract address
  const contractAddress = await question("Enter the deployed contract address: ");

  try {
    const [signer] = await hre.ethers.getSigners();
    console.log(`\nConnected wallet address: ${signer.address}`);
    
    if (contractChoice === "1") {
      await interactWithSavingsGroup(contractAddress, signer);
    } else if (contractChoice === "2") {
      await interactWithMicroloanSystem(contractAddress, signer);
    } else {
      console.log("Invalid choice. Please restart and try again.");
    }
  } catch (error) {
    console.error("Error interacting with contract:", error);
  } finally {
    rl.close();
  }
}

async function interactWithSavingsGroup(address, signer) {
  console.log("\nLoading SavingsGroup contract...");
  
  // Get the contract
  const SavingsGroup = await hre.ethers.getContractFactory("SavingsGroup");
  const savingsGroup = await SavingsGroup.attach(address);
  
  console.log("SavingsGroup loaded successfully!");
  
  // Display basic contract info
  const name = await savingsGroup.groupName();
  const desc = await savingsGroup.groupDescription();
  const contribution = await savingsGroup.contributionAmount();
  const isActive = await savingsGroup.isActive();
  const totalBalance = await savingsGroup.totalBalance();
  
  console.log("\nSavingsGroup Details:");
  console.log(`Name: ${name}`);
  console.log(`Description: ${desc}`);
  console.log(`Contribution Amount: ${hre.ethers.formatEther(contribution)} tokens`);
  console.log(`Active: ${isActive}`);
  console.log(`Total Balance: ${hre.ethers.formatEther(totalBalance)} tokens`);
  
  // Get member count
  const memberCount = await savingsGroup.getActiveMemberCount();
  console.log(`\nActive Members: ${memberCount}`);
  
  // Ask user what action to perform
  const action = await question(
    "\nWhat would you like to do?\n" +
    "1. Add a member\n" +
    "2. Make a contribution\n" +
    "3. Process a payout\n" +
    "4. Get member details\n" +
    "5. Exit\n" +
    "Enter number: "
  );
  
  switch (action) {
    case "1":
      const memberToAdd = await question("Enter address to add as member: ");
      try {
        const tx = await savingsGroup.addMember(memberToAdd);
        console.log(`Transaction hash: ${tx.hash}`);
        await tx.wait();
        console.log(`Successfully added member: ${memberToAdd}`);
      } catch (error) {
        console.error("Failed to add member:", error.message);
      }
      break;
      
    case "2":
      // For contribution, we need to approve token transfer first
      console.log("\nTo contribute, you need to approve the token transfer first.");
      console.log("Please run the approveTokens script first.");
      break;
      
    case "3":
      try {
        const tx = await savingsGroup.processPayout();
        console.log(`Transaction hash: ${tx.hash}`);
        await tx.wait();
        console.log("Successfully processed payout!");
      } catch (error) {
        console.error("Failed to process payout:", error.message);
      }
      break;
      
    case "4":
      const memberAddress = await question("Enter member address: ");
      try {
        const member = await savingsGroup.members(memberAddress);
        console.log("\nMember Details:");
        console.log(`Active: ${member.isActive}`);
        console.log(`Total Contributed: ${hre.ethers.formatEther(member.totalContributed)} tokens`);
        console.log(`Last Contribution: ${new Date(member.lastContributionTime * 1000).toLocaleString()}`);
        console.log(`Received Payout: ${member.hasReceivedPayout}`);
        console.log(`Payout Priority: ${member.payoutPriority}`);
      } catch (error) {
        console.error("Failed to get member details:", error.message);
      }
      break;
      
    case "5":
    default:
      console.log("Exiting...");
      break;
  }
}

async function interactWithMicroloanSystem(address, signer) {
  console.log("\nLoading MicroloanSystem contract...");
  
  // Get the contract
  const MicroloanSystem = await hre.ethers.getContractFactory("MicroloanSystem");
  const microloanSystem = await MicroloanSystem.attach(address);
  
  console.log("MicroloanSystem loaded successfully!");
  
  // Display basic contract info
  const minLoanAmount = await microloanSystem.minLoanAmount();
  const maxLoanAmount = await microloanSystem.maxLoanAmount();
  const minTermDays = await microloanSystem.minTermDays();
  const maxTermDays = await microloanSystem.maxTermDays();
  const platformFeePercent = await microloanSystem.platformFeePercent();
  
  console.log("\nMicroloanSystem Details:");
  console.log(`Min Loan Amount: ${hre.ethers.formatEther(minLoanAmount)} tokens`);
  console.log(`Max Loan Amount: ${hre.ethers.formatEther(maxLoanAmount)} tokens`);
  console.log(`Min Term: ${minTermDays} days`);
  console.log(`Max Term: ${maxTermDays} days`);
  console.log(`Platform Fee: ${platformFeePercent / 100}%`);
  
  // Get borrower profile
  const borrowerProfile = await microloanSystem.borrowerProfiles(signer.address);
  console.log("\nYour Borrower Profile:");
  console.log(`Total Borrowed: ${hre.ethers.formatEther(borrowerProfile.totalBorrowed)} tokens`);
  console.log(`Total Repaid: ${hre.ethers.formatEther(borrowerProfile.totalRepaid)} tokens`);
  console.log(`Loans Completed: ${borrowerProfile.loansCompleted}`);
  console.log(`Loans Defaulted: ${borrowerProfile.loansDefaulted}`);
  console.log(`Credit Score: ${borrowerProfile.creditScore}`);
  
  // Ask user what action to perform
  const action = await question(
    "\nWhat would you like to do?\n" +
    "1. Request a loan\n" +
    "2. Repay a loan\n" +
    "3. View loan details\n" +
    "4. Add a lender (admin only)\n" +
    "5. Exit\n" +
    "Enter number: "
  );
  
  switch (action) {
    case "1":
      const lenderAddress = await question("Enter lender address: ");
      const loanAmount = await question("Enter loan amount (in tokens): ");
      const termDays = await question("Enter loan term (in days): ");
      const purpose = await question("Enter loan purpose: ");
      
      try {
        const amountInWei = hre.ethers.parseEther(loanAmount);
        const tx = await microloanSystem.requestLoan(
          lenderAddress,
          amountInWei,
          parseInt(termDays),
          purpose
        );
        console.log(`Transaction hash: ${tx.hash}`);
        await tx.wait();
        console.log("Successfully requested loan!");
      } catch (error) {
        console.error("Failed to request loan:", error.message);
      }
      break;
      
    case "2":
      const loanId = await question("Enter loan ID to repay: ");
      const repayAmount = await question("Enter repayment amount (in tokens): ");
      
      try {
        const amountInWei = hre.ethers.parseEther(repayAmount);
        const tx = await microloanSystem.repayLoan(parseInt(loanId), amountInWei);
        console.log(`Transaction hash: ${tx.hash}`);
        await tx.wait();
        console.log("Successfully repaid loan!");
      } catch (error) {
        console.error("Failed to repay loan:", error.message);
      }
      break;
      
    case "3":
      const loanIdToView = await question("Enter loan ID to view: ");
      
      try {
        const loanDetails = await microloanSystem.getLoanDetails(parseInt(loanIdToView));
        console.log("\nLoan Details:");
        console.log(`Borrower: ${loanDetails.borrower}`);
        console.log(`Amount: ${hre.ethers.formatEther(loanDetails.amount)} tokens`);
        console.log(`Interest Rate: ${loanDetails.interestRate / 100}%`);
        console.log(`Term: ${loanDetails.termDays} days`);
        console.log(`Issued: ${new Date(loanDetails.issuedTime * 1000).toLocaleString()}`);
        console.log(`Due: ${new Date(loanDetails.dueTime * 1000).toLocaleString()}`);
        console.log(`Repaid Amount: ${hre.ethers.formatEther(loanDetails.repaidAmount)} tokens`);
        console.log(`Status: ${getLoanStatusString(loanDetails.status)}`);
        console.log(`Group Loan: ${loanDetails.isGroupLoan}`);
        if (loanDetails.isGroupLoan) {
          console.log(`Group Address: ${loanDetails.groupAddress}`);
        }
        console.log(`Purpose: ${loanDetails.purpose}`);
      } catch (error) {
        console.error("Failed to get loan details:", error.message);
      }
      break;
      
    case "4":
      const newLenderAddress = await question("Enter new lender address: ");
      const lenderName = await question("Enter lender name: ");
      const maxLoanAmount = await question("Enter max loan amount (in tokens): ");
      const baseInterestRate = await question("Enter base interest rate (in % x 100, e.g. 500 for 5%): ");
      
      try {
        const maxAmountInWei = hre.ethers.parseEther(maxLoanAmount);
        const tx = await microloanSystem.addLender(
          newLenderAddress,
          lenderName,
          maxAmountInWei,
          parseInt(baseInterestRate)
        );
        console.log(`Transaction hash: ${tx.hash}`);
        await tx.wait();
        console.log("Successfully added lender!");
      } catch (error) {
        console.error("Failed to add lender:", error.message);
      }
      break;
      
    case "5":
    default:
      console.log("Exiting...");
      break;
  }
}

// Helper function to convert loan status number to string
function getLoanStatusString(statusCode) {
  const statuses = ["Pending", "Active", "Repaid", "Defaulted", "Rejected"];
  return statuses[statusCode] || "Unknown";
}

// Execute the main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
