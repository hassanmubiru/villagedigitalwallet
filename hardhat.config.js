require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");
require("@openzeppelin/hardhat-upgrades");
require("solidity-coverage");
require("dotenv").config();

// Get private key from environment variable
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

// Validate private key format
function validateAndFormatPrivateKey(key) {
  if (!key || key === "your_private_key_here") {
    console.error("\x1b[31m%s\x1b[0m", "ERROR: You need to set your actual private key in the .env file!");
    console.log("Please replace 'your_private_key_here' with your actual wallet private key");
    return null;
  }
  
  // Remove '0x' prefix if present
  if (key.startsWith("0x")) {
    return key.substring(2);
  }
  return key;
}

const formattedPrivateKey = validateAndFormatPrivateKey(PRIVATE_KEY);
const ALFAJORES_RPC_URL = "https://alfajores-forno.celo-testnet.org";
const CELO_MAINNET_RPC_URL = "https://forno.celo.org";

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  // Configure custom verification for Celo networks - using updated Etherscan v2 API format
  etherscan: {
    // Use a single API key for all networks as per new standard
    apiKey: process.env.ETHERSCAN_API_KEY || "",
    customChains: [
      {
        network: "alfajores",
        chainId: 44787,
        urls: {
          apiURL: "https://api-alfajores.celoscan.io/api",
          browserURL: "https://alfajores.celoscan.io"
        }
      },
      {
        network: "celo",
        chainId: 42220,
        urls: {
          apiURL: "https://api.celoscan.io/api",
          browserURL: "https://celoscan.io"
        }
      }
    ]
  },
  networks: {
    // Local development network
    hardhat: {
      chainId: 31337
    },
    // Celo Alfajores testnet
    alfajores: {
      url: ALFAJORES_RPC_URL,
      accounts: formattedPrivateKey ? [formattedPrivateKey] : [],
      chainId: 44787,
      // Using EIP-1559 gas parameters
      maxFeePerGas: 50000000000, // 50 gwei max fee
      maxPriorityFeePerGas: 1000000000, // 1 gwei priority fee
      gasLimit: 8000000 // Explicitly set gas limit to avoid estimation issues
    },
    // Celo mainnet
    celo: {
      url: CELO_MAINNET_RPC_URL,
      accounts: formattedPrivateKey ? [formattedPrivateKey] : [],
      chainId: 42220,
      gasPrice: 5000000000 // 5 gwei
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
};
