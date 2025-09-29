// Web3 Integration for KrayState Real Estate Platform
// This file handles all blockchain interactions

// Import contract addresses
document.addEventListener("DOMContentLoaded", function () {
  // Load contract addresses script if not already loaded
  if (typeof CONTRACT_ADDRESSES === "undefined") {
    const script = document.createElement("script");
    script.src = "js/contract-addresses.js";
    document.head.appendChild(script);
  }
});

// Web3 Connection Manager
const KrayStateWeb3 = {
  web3: null,
  account: null,
  contracts: {},

  // Initialize Web3 connection
  async init() {
    console.log("🚀 Initializing KrayState Web3 connection...");

    if (typeof window.ethereum !== "undefined") {
      this.web3 = new Web3(window.ethereum);
      console.log("✅ MetaMask detected");
      return true;
    } else {
      console.log("❌ MetaMask not found");
      this.showWeb3Warning();
      return false;
    }
  },

  // Connect wallet
  async connectWallet() {
    try {
      if (!this.web3) {
        await this.init();
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      this.account = accounts[0];
      console.log("✅ Wallet connected:", this.account);

      // Update UI
      this.updateConnectionStatus(true);
      return this.account;
    } catch (error) {
      console.error("❌ Wallet connection failed:", error);
      this.showError("Failed to connect wallet: " + error.message);
      return null;
    }
  },

  // Disconnect wallet
  async disconnectWallet() {
    this.account = null;
    this.contracts = {};
    this.updateConnectionStatus(false);
    console.log("🔌 Wallet disconnected");
  },

  // Check if wallet is connected
  isConnected() {
    return this.account !== null;
  },

  // Get current account
  getCurrentAccount() {
    return this.account;
  },

  // Update connection status in UI
  updateConnectionStatus(connected) {
    const statusElement = document.getElementById("wallet-status");
    const connectBtn = document.getElementById("connect-wallet-btn");
    const accountElement = document.getElementById("current-account");

    if (statusElement) {
      statusElement.textContent = connected ? "Connected" : "Disconnected";
      statusElement.className = connected
        ? "status-connected"
        : "status-disconnected";
    }

    if (connectBtn) {
      connectBtn.textContent = connected ? "Disconnect" : "Connect Wallet";
      connectBtn.onclick = connected
        ? () => this.disconnectWallet()
        : () => this.connectWallet();
    }

    if (accountElement && this.account) {
      accountElement.textContent =
        this.account.substring(0, 6) + "..." + this.account.substring(38);
    }
  },

  // Show Web3 warning
  showWeb3Warning() {
    const warning = `
            <div class="web3-warning" style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 10px 0; border-radius: 5px;">
                <strong>⚠️ Web3 Required</strong><br>
                Please install MetaMask or another Web3 wallet to use blockchain features.
                <a href="https://metamask.io" target="_blank" style="color: #007bff;">Install MetaMask</a>
            </div>
        `;

    const container = document.getElementById("web3-messages") || document.body;
    container.insertAdjacentHTML("afterbegin", warning);
  },

  // Show error message
  showError(message) {
    const error = `
            <div class="web3-error" style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; margin: 10px 0; border-radius: 5px; color: #721c24;">
                <strong>❌ Error</strong><br>
                ${message}
            </div>
        `;

    const container = document.getElementById("web3-messages") || document.body;
    container.insertAdjacentHTML("afterbegin", error);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      const errorElement = document.querySelector(".web3-error");
      if (errorElement) errorElement.remove();
    }, 5000);
  },

  // Show success message
  showSuccess(message) {
    const success = `
            <div class="web3-success" style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; margin: 10px 0; border-radius: 5px; color: #155724;">
                <strong>✅ Success</strong><br>
                ${message}
            </div>
        `;

    const container = document.getElementById("web3-messages") || document.body;
    container.insertAdjacentHTML("afterbegin", success);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      const successElement = document.querySelector(".web3-success");
      if (successElement) successElement.remove();
    }, 5000);
  },

  // Simulate property tokenization (for demo)
  async tokenizeProperty(propertyId, price) {
    if (!this.isConnected()) {
      this.showError("Please connect your wallet first");
      return false;
    }

    try {
      console.log(`🏠 Tokenizing property ${propertyId} for ${price} ETH`);

      // Simulate transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));

      this.showSuccess(
        `Property ${propertyId} has been tokenized! Token ID: PT${propertyId}`
      );
      return true;
    } catch (error) {
      console.error("❌ Tokenization failed:", error);
      this.showError("Tokenization failed: " + error.message);
      return false;
    }
  },

  // Simulate lease creation (for demo)
  async createLease(propertyId, tenant, monthlyRent) {
    if (!this.isConnected()) {
      this.showError("Please connect your wallet first");
      return false;
    }

    try {
      console.log(`📄 Creating lease for property ${propertyId}`);

      // Simulate transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));

      this.showSuccess(
        `Lease agreement created! Tenant: ${tenant}, Monthly Rent: ${monthlyRent} ETH`
      );
      return true;
    } catch (error) {
      console.error("❌ Lease creation failed:", error);
      this.showError("Lease creation failed: " + error.message);
      return false;
    }
  },
};

// Initialize Web3 when page loads
document.addEventListener("DOMContentLoaded", async function () {
  console.log("📱 KrayState Web3 Integration loaded");
  await KrayStateWeb3.init();

  // Auto-connect if previously connected
  if (window.ethereum && window.ethereum.selectedAddress) {
    await KrayStateWeb3.connectWallet();
  }
});

// Make it globally available
window.KrayStateWeb3 = KrayStateWeb3;
