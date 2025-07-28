#!/usr/bin/env node

/**
 * Celo Composer deployment script for Village Digital Wallet
 * This script is used to deploy the smart contracts to the Celo network using Celo Composer
 */
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Default to Alfajores testnet
const NETWORK = process.argv.includes('--network=celo') ? 'celo' : 'alfajores';
const IS_MAINNET = NETWORK === 'celo';

console.log(`\n🌟 Deploying Village Digital Wallet to ${IS_MAINNET ? 'Celo Mainnet' : 'Celo Alfajores Testnet'}\n`);

// Check for required environment variables
if (!process.env.PRIVATE_KEY) {
  console.error('❌ Error: Missing PRIVATE_KEY environment variable');
  console.log('Please set your private key in the .env file');
  process.exit(1);
}

// Payment token (cUSD) address based on network
const cUSD_ADDRESS = IS_MAINNET
  ? '0x765DE816845861e75A25fCA122bb6898B8B1282a'
  : '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1';

// Prepare the deployment
console.log('📝 Preparing deployment...');

// Deploy using Hardhat
console.log('🚀 Deploying contracts using Hardhat...');

const deployCommand = `npx hardhat run scripts/deploy.js --network ${NETWORK}`;

exec(deployCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Error during deployment: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`⚠️ Warning: ${stderr}`);
  }
  
  console.log(stdout);
  console.log('✅ Deployment completed successfully!');
  
  // Update Celo Composer deployment tracking
  try {
    const deploymentPath = path.join(__dirname, 'celo-composer-deployments.json');
    let deployments = {};
    
    if (fs.existsSync(deploymentPath)) {
      const content = fs.readFileSync(deploymentPath, 'utf8');
      deployments = JSON.parse(content);
    }
    
    // Update deployment info with timestamp
    deployments[NETWORK] = {
      timestamp: new Date().toISOString(),
      deployer: process.env.DEPLOYER_ADDRESS || '',
      network: NETWORK
    };
    
    fs.writeFileSync(deploymentPath, JSON.stringify(deployments, null, 2));
    console.log(`✅ Updated Celo Composer deployment tracking`);
    
  } catch (err) {
    console.error(`❌ Error updating deployment tracking: ${err.message}`);
  }
  
  // Optionally run verification
  if (process.env.ETHERSCAN_API_KEY) {
    console.log('\n🔍 Verifying contracts...');
    const verifyCommand = `npx hardhat run scripts/manual-verify.js --network ${NETWORK}`;
    
    exec(verifyCommand, (verifyError, verifyStdout, verifyStderr) => {
      if (verifyError) {
        console.error(`❌ Error during verification: ${verifyError.message}`);
        return;
      }
      
      console.log(verifyStdout);
      console.log('✅ Verification completed!');
    });
  } else {
    console.log('\n⚠️ Skipping verification: No ETHERSCAN_API_KEY provided');
  }
});
