/**
 * KrayState NFT Marketplace - Advanced Web3 Integration
 * Handles wallet connections, smart contract interactions, and UI updates
 */

class KrayStateWeb3Marketplace {
  constructor() {
    this.web3 = null;
    this.account = null;
    this.chainId = null;
    this.isConnecting = false;

    // Configuration from PHP
    this.config = {
      chainId: 11155111, // Sepolia testnet
      rpcUrl: "https://rpc.sepolia.org",
      etherscanUrl: "https://sepolia.etherscan.io",
      contracts: {
        PropertyToken: "0xc601F6352300Af039FA9E4F63545cC52c33D44D8",
        IdentityRegistry: "0xD4b19AB3f4e22557b32aD8d88E0C0737c5f8B933",
        LeaseAgreement: "0x987C8053eb163bb63bb4EEB85cAaDF3041d2D922",
        EscrowPayment: "0x4722813a0d172B8e13fB092f032dd84341aE8515",
      },
    };

    this.contractABIs = {}; // Will be loaded dynamically
    this.contractInstances = {};

    this.init();
  }

  async init() {
    console.log("🚀 Initializing KrayState NFT Marketplace...");

    // Check for Web3 wallet
    if (typeof window.ethereum !== "undefined") {
      this.web3 = new Web3(window.ethereum);

      // Check if already connected
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          await this.setAccount(accounts[0]);
        }
      } catch (error) {
        console.warn("Failed to check existing accounts:", error);
      }

      // Event listeners
      window.ethereum.on(
        "accountsChanged",
        this.handleAccountsChanged.bind(this)
      );
      window.ethereum.on("chainChanged", this.handleChainChanged.bind(this));
      window.ethereum.on("disconnect", this.handleDisconnect.bind(this));
    } else {
      console.warn("⚠️ No Web3 wallet detected. Please install MetaMask.");
      this.showInstallWalletPrompt();
    }

    this.setupEventListeners();
    this.loadNetworkInfo();
  }

  setupEventListeners() {
    // Wallet connection button
    const connectBtn = document.getElementById("connectWallet");
    if (connectBtn) {
      connectBtn.addEventListener("click", () => {
        if (this.account) {
          this.showWalletMenu();
        } else {
          this.connectWallet();
        }
      });
    }

    // NFT action buttons (delegated event handling)
    document.addEventListener("click", (e) => {
      if (e.target.matches('[onclick*="buyNFT"]')) {
        e.preventDefault();
        const match = e.target
          .getAttribute("onclick")
          .match(/buyNFT\('([^']+)',\s*([^\)]+)\)/);
        if (match) {
          this.buyNFT(match[1], parseFloat(match[2]));
        }
      } else if (e.target.matches('[onclick*="makeOffer"]')) {
        e.preventDefault();
        const match = e.target
          .getAttribute("onclick")
          .match(/makeOffer\('([^']+)'\)/);
        if (match) {
          this.makeOffer(match[1]);
        }
      }
    });

    // Search functionality
    this.setupSearch();
  }

  setupSearch() {
    const searchForm = document.querySelector("form");
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.performSearch();
      });
    }
  }

  async connectWallet() {
    if (this.isConnecting) return;

    this.isConnecting = true;
    this.updateConnectButton("Connecting...");

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        await this.setAccount(accounts[0]);
        await this.checkAndSwitchNetwork();
        this.showNotification("Wallet connected successfully!", "success");

        // Load user's NFTs
        this.loadUserNFTs();
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);

      if (error.code === 4001) {
        this.showNotification("Wallet connection rejected", "warning");
      } else {
        this.showNotification("Failed to connect wallet", "error");
      }
    } finally {
      this.isConnecting = false;
      this.updateWalletUI();
    }
  }

  async setAccount(account) {
    this.account = account;

    // Get network info
    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      this.chainId = parseInt(chainId, 16);
    } catch (error) {
      console.error("Failed to get chain ID:", error);
    }

    // Update UI
    this.updateWalletUI();

    // Load contract instances
    await this.loadContractInstances();

    // Get balance
    this.updateBalance();

    console.log(`✅ Connected to wallet: ${account}`);
  }

  async checkAndSwitchNetwork() {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    const currentChainId = parseInt(chainId, 16);

    if (currentChainId !== this.config.chainId) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x" + this.config.chainId.toString(16) }],
        });

        this.chainId = this.config.chainId;
        this.showNotification("Network switched to Sepolia testnet", "success");
      } catch (error) {
        console.error("Failed to switch network:", error);
        this.showNotification(
          "Please manually switch to Sepolia testnet",
          "warning"
        );
        return false;
      }
    }

    return true;
  }

  async loadContractInstances() {
    // Load basic ERC-721 ABI (simplified for demo)
    const basicERC721ABI = [
      {
        inputs: [{ type: "address", name: "owner" }],
        name: "balanceOf",
        outputs: [{ type: "uint256", name: "" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ type: "uint256", name: "tokenId" }],
        name: "ownerOf",
        outputs: [{ type: "address", name: "" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "name",
        outputs: [{ type: "string", name: "" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "symbol",
        outputs: [{ type: "string", name: "" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ type: "uint256", name: "tokenId" }],
        name: "tokenURI",
        outputs: [{ type: "string", name: "" }],
        stateMutability: "view",
        type: "function",
      },
    ];

    try {
      this.contractInstances.PropertyToken = new this.web3.eth.Contract(
        basicERC721ABI,
        this.config.contracts.PropertyToken
      );

      console.log("📄 Contract instances loaded");
    } catch (error) {
      console.error("Failed to load contract instances:", error);
    }
  }

  async updateBalance() {
    if (!this.account || !this.web3) return;

    try {
      const balance = await this.web3.eth.getBalance(this.account);
      const ethBalance = this.web3.utils.fromWei(balance, "ether");

      // Update balance display if element exists
      const balanceElement = document.getElementById("walletBalance");
      if (balanceElement) {
        balanceElement.textContent = `${parseFloat(ethBalance).toFixed(4)} ETH`;
      }
    } catch (error) {
      console.error("Failed to get balance:", error);
    }
  }

  updateWalletUI() {
    const walletBtn = document.getElementById("connectWallet");
    const walletText = document.getElementById("walletText");

    if (!walletBtn) return;

    if (this.account) {
      walletBtn.classList.add("wallet-connected");
      const shortAddress = `${this.account.substring(0, 6)}...${this.account.substring(38)}`;

      if (walletText) {
        walletText.textContent = shortAddress;
      } else {
        walletBtn.innerHTML = `<i class="fas fa-check-circle"></i> ${shortAddress}`;
      }

      // Add network indicator if wrong network
      if (this.chainId && this.chainId !== this.config.chainId) {
        walletBtn.style.background = "#ffc107";
        walletBtn.title = "Wrong network - Click to switch";
      }
    } else {
      walletBtn.classList.remove("wallet-connected");
      walletBtn.innerHTML =
        '<i class="fas fa-wallet"></i> <span id="walletText">Connect Wallet</span>';
      walletBtn.style.background = "";
      walletBtn.title = "";
    }
  }

  updateConnectButton(text) {
    const walletBtn = document.getElementById("connectWallet");
    const walletText = document.getElementById("walletText");

    if (walletText) {
      walletText.textContent = text;
    } else if (walletBtn) {
      walletBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
    }
  }

  showWalletMenu() {
    // Create wallet menu dropdown
    const menu = document.createElement("div");
    menu.className = "wallet-menu";
    menu.style.cssText = `
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            z-index: 1000;
            min-width: 200px;
        `;

    menu.innerHTML = `
            <div style="padding: 1rem; border-bottom: 1px solid #eee;">
                <strong>${this.account.substring(0, 6)}...${this.account.substring(38)}</strong>
                <div style="font-size: 0.8rem; color: #666;" id="walletBalance">Loading...</div>
            </div>
            <div style="padding: 0.5rem 0;">
                <a href="#" onclick="marketplace.viewOnEtherscan(); return false;" style="display: block; padding: 0.5rem 1rem; color: #333; text-decoration: none;">
                    <i class="fas fa-external-link-alt"></i> View on Etherscan
                </a>
                <a href="#" onclick="marketplace.copyAddress(); return false;" style="display: block; padding: 0.5rem 1rem; color: #333; text-decoration: none;">
                    <i class="fas fa-copy"></i> Copy Address
                </a>
                <a href="#" onclick="marketplace.disconnect(); return false;" style="display: block; padding: 0.5rem 1rem; color: #dc3545; text-decoration: none;">
                    <i class="fas fa-sign-out-alt"></i> Disconnect
                </a>
            </div>
        `;

    // Position menu
    const walletBtn = document.getElementById("connectWallet");
    walletBtn.style.position = "relative";
    walletBtn.appendChild(menu);

    // Update balance
    this.updateBalance();

    // Close menu when clicking outside
    setTimeout(() => {
      document.addEventListener("click", function closeMenu(e) {
        if (!walletBtn.contains(e.target)) {
          if (menu.parentNode) {
            menu.parentNode.removeChild(menu);
          }
          document.removeEventListener("click", closeMenu);
        }
      });
    }, 100);
  }

  viewOnEtherscan() {
    window.open(
      `${this.config.etherscanUrl}/address/${this.account}`,
      "_blank"
    );
  }

  copyAddress() {
    navigator.clipboard.writeText(this.account).then(() => {
      this.showNotification("Address copied to clipboard", "success");
    });
  }

  disconnect() {
    this.account = null;
    this.chainId = null;
    this.contractInstances = {};
    this.updateWalletUI();
    this.showNotification("Wallet disconnected", "info");
  }

  // NFT Marketplace Functions
  async buyNFT(nftId, price) {
    if (!this.account) {
      this.showNotification("Please connect your wallet first", "warning");
      return;
    }

    if (!(await this.checkAndSwitchNetwork())) {
      return;
    }

    try {
      // Show loading state
      this.showNotification(`Processing purchase of ${price} ETH...`, "info");

      // For demo: simulate the purchase via API
      const response = await fetch("api.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "simulate_purchase",
          nft_id: nftId,
          buyer_wallet: this.account,
          price: price,
        }),
      });

      const result = await response.json();

      if (result.success) {
        this.showNotification("NFT purchased successfully!", "success");

        // Refresh page to show updated ownership
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(result.error || "Purchase failed");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      this.showNotification(`Purchase failed: ${error.message}`, "error");
    }
  }

  async makeOffer(nftId) {
    if (!this.account) {
      this.showNotification("Please connect your wallet first", "warning");
      return;
    }

    const offerAmount = prompt("Enter your offer amount in ETH:");
    if (!offerAmount || isNaN(offerAmount) || parseFloat(offerAmount) <= 0) {
      return;
    }

    try {
      this.showNotification(
        `Submitting offer of ${offerAmount} ETH...`,
        "info"
      );

      // For demo: just show success message
      setTimeout(() => {
        this.showNotification(
          `Offer of ${offerAmount} ETH submitted successfully! (Demo)`,
          "success"
        );
      }, 1000);
    } catch (error) {
      console.error("Offer error:", error);
      this.showNotification(
        `Failed to submit offer: ${error.message}`,
        "error"
      );
    }
  }

  async loadUserNFTs() {
    if (!this.account) return;

    try {
      // Get user's NFTs from API
      const response = await fetch(
        `api.php?action=get_nfts&owner_wallet=${this.account}`
      );
      const result = await response.json();

      if (result.success) {
        console.log(`📊 User owns ${result.data.length} NFTs`);

        // Update UI to highlight owned NFTs
        this.highlightOwnedNFTs(result.data);
      }
    } catch (error) {
      console.error("Failed to load user NFTs:", error);
    }
  }

  highlightOwnedNFTs(userNFTs) {
    const userNFTIds = userNFTs.map((nft) => nft.id);

    // Add "Owned" badge to user's NFTs
    document.querySelectorAll(".nft-card").forEach((card) => {
      const buyButton = card.querySelector(".btn-buy");
      if (buyButton) {
        const nftId = buyButton.getAttribute("onclick").match(/'([^']+)'/)[1];

        if (userNFTIds.includes(nftId)) {
          // Add owned badge
          const badge = document.createElement("div");
          badge.className = "owned-badge";
          badge.style.cssText = `
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        background: #28a745;
                        color: white;
                        padding: 0.25rem 0.5rem;
                        border-radius: 20px;
                        font-size: 0.75rem;
                        font-weight: 600;
                    `;
          badge.innerHTML = '<i class="fas fa-check"></i> Owned';

          card.style.position = "relative";
          card.appendChild(badge);

          // Replace buy button with manage button
          buyButton.textContent = "Manage";
          buyButton.className = "btn-offer";
          buyButton.setAttribute("onclick", `manageNFT('${nftId}')`);
        }
      }
    });
  }

  async performSearch() {
    const formData = new FormData(document.querySelector("form"));
    const params = new URLSearchParams();

    for (let [key, value] of formData.entries()) {
      if (value.trim()) {
        params.append(key, value);
      }
    }

    // Add API action
    params.append("action", "search");

    try {
      const response = await fetch(`api.php?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        this.updateSearchResults(result.data);
        this.showNotification(`Found ${result.count} properties`, "info");
      }
    } catch (error) {
      console.error("Search error:", error);
      this.showNotification("Search failed", "error");
    }
  }

  updateSearchResults(nfts) {
    const grid = document.querySelector(".nft-grid");
    if (!grid) return;

    if (nfts.length === 0) {
      grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-search fa-4x" style="color: #ccc; margin-bottom: 1rem;"></i>
                    <h3>No Properties Found</h3>
                    <p>Try adjusting your search criteria.</p>
                </div>
            `;
      return;
    }

    // This would require server-side rendering or client-side templating
    // For now, just reload the page with search params
    window.location.href =
      "?" +
      new URLSearchParams(
        new FormData(document.querySelector("form"))
      ).toString();
  }

  async loadNetworkInfo() {
    try {
      const response = await fetch("api.php?action=get_network_info");
      const result = await response.json();

      if (result.success) {
        console.log("🌐 Network Info:", result.data);

        // Update network status in UI if element exists
        const networkStatus = document.getElementById("networkStatus");
        if (networkStatus) {
          networkStatus.innerHTML = `
                        <span style="color: ${result.data.is_connected ? "#28a745" : "#dc3545"};">
                            <i class="fas fa-circle"></i>
                            ${result.data.is_connected ? "Connected" : "Disconnected"}
                        </span>
                        <small>Block: ${result.data.latest_block || "Unknown"}</small>
                    `;
        }
      }
    } catch (error) {
      console.error("Failed to load network info:", error);
    }
  }

  showInstallWalletPrompt() {
    const prompt = document.createElement("div");
    prompt.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #ffc107;
            color: #333;
            padding: 1rem;
            text-align: center;
            z-index: 10000;
            font-weight: 600;
        `;
    prompt.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            No Web3 wallet detected. 
            <a href="https://metamask.io/download/" target="_blank" style="color: #333; text-decoration: underline;">
                Install MetaMask
            </a>
            to interact with NFTs.
            <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; font-size: 1.2rem;">&times;</button>
        `;

    document.body.prepend(prompt);

    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (prompt.parentNode) {
        prompt.parentNode.removeChild(prompt);
      }
    }, 10000);
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            font-weight: 600;
            max-width: 400px;
            text-align: center;
        `;
    notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            ${message}
        `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = "0";
        notification.style.transition = "opacity 0.3s ease";

        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 5000);
  }

  getNotificationColor(type) {
    const colors = {
      success: "#28a745",
      error: "#dc3545",
      warning: "#ffc107",
      info: "#17a2b8",
    };
    return colors[type] || colors.info;
  }

  getNotificationIcon(type) {
    const icons = {
      success: "check-circle",
      error: "exclamation-circle",
      warning: "exclamation-triangle",
      info: "info-circle",
    };
    return icons[type] || icons.info;
  }

  // Event handlers
  handleAccountsChanged(accounts) {
    console.log("Accounts changed:", accounts);

    if (accounts.length > 0) {
      this.setAccount(accounts[0]);
    } else {
      this.disconnect();
    }
  }

  handleChainChanged(chainId) {
    console.log("Chain changed:", chainId);
    this.chainId = parseInt(chainId, 16);

    if (this.chainId !== this.config.chainId) {
      this.showNotification(
        `Wrong network. Please switch to Sepolia testnet.`,
        "warning"
      );
    }

    this.updateWalletUI();
  }

  handleDisconnect() {
    console.log("Wallet disconnected");
    this.disconnect();
  }
}

// Global functions for backward compatibility
function buyNFT(nftId, price) {
  if (window.marketplace) {
    window.marketplace.buyNFT(nftId, price);
  }
}

function makeOffer(nftId) {
  if (window.marketplace) {
    window.marketplace.makeOffer(nftId);
  }
}

function manageNFT(nftId) {
  alert(`Manage NFT ${nftId} - Feature coming soon!`);
}

// Initialize marketplace when page loads
document.addEventListener("DOMContentLoaded", function () {
  console.log("🏠 KrayState NFT Marketplace initialized");

  // Create global marketplace instance
  window.marketplace = new KrayStateWeb3Marketplace();

  // Load marketplace stats periodically
  setInterval(() => {
    if (window.marketplace.account) {
      window.marketplace.updateBalance();
    }
    window.marketplace.loadNetworkInfo();
  }, 30000); // Every 30 seconds
});
