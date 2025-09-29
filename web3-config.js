const CONTRACT_CONFIG = {
  // Network Configuration
  NETWORKS: {
    HARDHAT: {
      chainId: "0x539", // 1337 in hex
      name: "Hardhat Local",
      rpc: "http://127.0.0.1:8545",
      symbol: "ETH",
      explorer: "http://localhost:8545",
    },
    INTEGRA_TESTNET: {
      chainId: "0x462", // 1122 in hex
      name: "Integra Testnet",
      rpc: "https://testnet-rpc.integra.com",
      symbol: "INTEGRA",
      explorer: "https://testnet-explorer.integra.com",
    },
  },

  // Contract Addresses (deployed addresses for KrayState Platform)
  CONTRACTS: {
    MOCK_USDC: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    IDENTITY_REGISTRY: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    COMPLIANCE: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    PROPERTY_TOKEN: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    LEASE_AGREEMENT: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
    ESCROW_PAYMENT: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
  },

  // Contract ABIs (simplified for demo)
  ABIS: {
    PROPERTY_TOKEN: [
      "function tokenizeProperty(uint256 tokenAmount, string memory metadataURI) external",
      "function transfer(address to, uint256 amount) external returns (bool)",
      "function balanceOf(address account) external view returns (uint256)",
      "function totalSupply() external view returns (uint256)",
      "function symbol() external view returns (string)",
      "function name() external view returns (string)",
      "event Transfer(address indexed from, address indexed to, uint256 value)",
    ],
    LEASE_AGREEMENT: [
      "function createLease(address tenant, uint256 monthlyRent, uint256 duration) external returns (uint256)",
      "function payRent(uint256 leaseId) external payable",
      "function getLease(uint256 leaseId) external view returns (address, address, uint256, uint256, bool)",
      "event LeaseCreated(uint256 indexed leaseId, address indexed landlord, address indexed tenant)",
    ],
    ESCROW_PAYMENT: [
      "function deposit(uint256 leaseId) external payable",
      "function release(uint256 leaseId) external",
      "function getEscrowBalance(uint256 leaseId) external view returns (uint256)",
      "event DepositMade(uint256 indexed leaseId, address indexed depositor, uint256 amount)",
    ],
  },
};

// Web3 Configuration for Real Estate DApp
const WEB3_CONFIG = {
    // Contract addresses (will be updated after deployment)
    contracts: {
        mockUSDC: "0x0000000000000000000000000000000000000000", // Placeholder
        identityRegistry: "0x0000000000000000000000000000000000000000", // Placeholder
        compliance: "0x0000000000000000000000000000000000000000", // Placeholder
        realEstateToken: "0x0000000000000000000000000000000000000000", // Placeholder
        propertyToken: "0x0000000000000000000000000000000000000000", // Placeholder
        escrowPayment: "0x0000000000000000000000000000000000000000", // Placeholder
        leaseAgreement: "0x0000000000000000000000000000000000000000", // Placeholder
        leaseManager: "0x0000000000000000000000000000000000000000" // Placeholder
    },
class Web3Manager {
  constructor() {
    this.web3 = null;
    this.account = null;
    this.contracts = {};
  }

  async connectWallet() {
    if (typeof window.ethereum !== "undefined") {
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });

        // Initialize Web3
        this.web3 = new Web3(window.ethereum);

        // Get account
        const accounts = await this.web3.eth.getAccounts();
        this.account = accounts[0];

        // Check network
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        console.log("Connected to chain:", chainId);

        return { success: true, account: this.account };
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        return { success: false, error: error.message };
      }
    } else {
      return { success: false, error: "MetaMask not detected" };
    }
  }

  async switchToNetwork(network) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: network.chainId }],
      });
      return true;
    } catch (switchError) {
      // Network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: network.chainId,
                chainName: network.name,
                rpcUrls: [network.rpc],
                nativeCurrency: {
                  name: network.symbol,
                  symbol: network.symbol,
                  decimals: 18,
                },
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error("Failed to add network:", addError);
          return false;
        }
      }
      console.error("Failed to switch network:", switchError);
      return false;
    }
  }

  initContract(contractName, address, abi) {
    if (this.web3) {
      this.contracts[contractName] = new this.web3.eth.Contract(abi, address);
      return this.contracts[contractName];
    }
    return null;
  }

  async tokenizeProperty(propertyId, tokenAmount, price) {
    try {
      const contract = this.contracts.PROPERTY_TOKEN;
      const metadataURI = `https://kraystate.com/api/property/${propertyId}`;

      const tx = await contract.methods
        .tokenizeProperty(
          this.web3.utils.toWei(tokenAmount.toString(), "ether"),
          metadataURI
        )
        .send({ from: this.account });

      return { success: true, txHash: tx.transactionHash };
    } catch (error) {
      console.error("Tokenization failed:", error);
      return { success: false, error: error.message };
    }
  }

  async createLease(tenant, monthlyRent, duration) {
    try {
      const contract = this.contracts.LEASE_AGREEMENT;

      const tx = await contract.methods
        .createLease(
          tenant,
          this.web3.utils.toWei(monthlyRent.toString(), "ether"),
          duration
        )
        .send({ from: this.account });

      return { success: true, txHash: tx.transactionHash };
    } catch (error) {
      console.error("Lease creation failed:", error);
      return { success: false, error: error.message };
    }
  }
}

// Global Web3 Manager Instance
window.web3Manager = new Web3Manager();

// Utility Functions
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === "success" ? "#4CAF50" : type === "error" ? "#f44336" : "#2196F3"};
        color: white;
        border-radius: 5px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

function formatAddress(address) {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
}

function formatEther(wei) {
  return window.web3Manager.web3
    ? window.web3Manager.web3.utils.fromWei(wei.toString(), "ether")
    : "0";
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", function () {
  // Add Web3 connection button to all pages
  const connectBtn = document.getElementById("connect-wallet");
  if (connectBtn) {
    connectBtn.addEventListener("click", async function () {
      const result = await window.web3Manager.connectWallet();
      if (result.success) {
        showToast(`Connected: ${formatAddress(result.account)}`, "success");
        updateWalletUI(result.account);
      } else {
        showToast(`Connection failed: ${result.error}`, "error");
      }
    });
  }

  // Initialize contracts if Web3 is available
  if (typeof window.ethereum !== "undefined") {
    // Auto-connect if previously connected
    window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
      if (accounts.length > 0) {
        window.web3Manager.connectWallet();
      }
    });
  }
});

function updateWalletUI(account) {
  const walletStatus = document.getElementById("wallet-status");
  if (walletStatus) {
    walletStatus.innerHTML = `
            <span class="wallet-connected">
                🟢 ${formatAddress(account)}
            </span>
        `;
  }
}

console.log("🚀 KrayState Web3 Integration Loaded");
