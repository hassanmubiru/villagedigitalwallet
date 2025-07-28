// Script to update contract ABIs from artifacts
const fs = require('fs');
const path = require('path');

/**
 * Update contract ABI files in the frontend
 * @param {string} contractName Name of the contract
 */
async function updateContractAbi(contractName) {
  try {
    console.log(`\nUpdating ABI for ${contractName}...`);
    
    // Path to the contract artifact JSON (compiled by Hardhat)
    const artifactPath = path.join(__dirname, `../artifacts/contracts/${contractName}.sol/${contractName}.json`);
    
    // Path to the ABI file in the frontend
    const abiPath = path.join(__dirname, `../app/abis/${contractName}.json`);
    
    // Read the artifact file
    const artifactJson = require(artifactPath);
    
    // Write only the ABI to the frontend file
    fs.writeFileSync(abiPath, JSON.stringify(artifactJson.abi, null, 2));
    console.log(`✅ Updated ABI for ${contractName} successfully`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error updating ABI for ${contractName}:`, error.message);
    return false;
  }
}

// Export the function for use in deploy.js
module.exports = {
  updateContractAbi
};

// Allow direct execution of script
if (require.main === module) {
  // If called directly, update both contract ABIs
  Promise.all([
    updateContractAbi('SavingsGroup'),
    updateContractAbi('MicroloanSystem')
  ])
  .then(() => {
    console.log('✅ All ABIs updated successfully');
  })
  .catch((error) => {
    console.error('❌ Error updating ABIs:', error);
    process.exit(1);
  });
}
