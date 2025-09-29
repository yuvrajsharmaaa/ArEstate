require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    }
  },
  networks: {
    hardhat: {
      chainId: 1337,
      accounts: {
        count: 20,
        accountsBalance: "10000000000000000000000" // 10,000 ETH
      }
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337
    },
    // Integra Chain Networks
    "integra-testnet": {
      url: process.env.INTEGRA_TESTNET_RPC || "https://testnet-rpc.integra.com",
      chainId: 1122, // Replace with actual Integra testnet chain ID
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gas: 8000000,
      gasPrice: 20000000000, // 20 gwei
      timeout: 60000
    },
    "integra-mainnet": {
      url: process.env.INTEGRA_MAINNET_RPC || "https://mainnet-rpc.integra.com", 
      chainId: 1121, // Replace with actual Integra mainnet chain ID
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gas: 8000000,
      gasPrice: "auto",
      timeout: 60000
    },
    // Fallback networks for testing
    sepolia: {
      url: process.env.SEPOLIA_RPC || "https://sepolia.infura.io/v3/YOUR_KEY",
      chainId: 11155111,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY,
      // Add Integra block explorer API key when available
      "integra-testnet": process.env.INTEGRA_EXPLORER_API_KEY,
      "integra-mainnet": process.env.INTEGRA_EXPLORER_API_KEY
    },
    customChains: [
      {
        network: "integra-testnet",
        chainId: 1122,
        urls: {
          apiURL: "https://testnet-api.integra.com/api",
          browserURL: "https://testnet-explorer.integra.com"
        }
      },
      {
        network: "integra-mainnet", 
        chainId: 1121,
        urls: {
          apiURL: "https://api.integra.com/api",
          browserURL: "https://explorer.integra.com"
        }
      }
    ]
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    gasPrice: 20,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false
  },
  mocha: {
    timeout: 60000
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
