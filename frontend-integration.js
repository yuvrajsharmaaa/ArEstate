// KrayState ArEstate - Web3 Integration Helper
// Use this file as a reference for connecting your frontend to the smart contracts

import { ethers } from 'ethers';

// Contract addresses on Sepolia testnet
export const CONTRACT_ADDRESSES = {
  IdentityRegistry: "0xD4b19AB3f4e22557b32aD8d88E0C0737c5f8B933",
  Compliance: "0x3982a23b37d0e82040B8Ae9Cef4274094fD5a6f9", 
  PropertyToken: "0xc601F6352300Af039FA9E4F63545cC52c33D44D8",
  LeaseAgreement: "0x987C8053eb163bb63bb4EEB85cAaDF3041d2D922",
  EscrowPayment: "0x4722813a0d172B8e13fB092f032dd84341aE8515"
};

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 11155111,
  name: "Sepolia",
  rpcUrl: "https://sepolia.gateway.tenderly.co",
  blockExplorer: "https://sepolia.etherscan.io"
};

// Web3 Provider Setup
export class KrayStateWeb3 {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
  }

  // Connect to MetaMask or other wallet
  async connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
        
        // Switch to Sepolia if not already
        await this.switchToSepolia();
        
        return await this.signer.getAddress();
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        throw error;
      }
    } else {
      throw new Error("MetaMask not installed");
    }
  }

  // Switch to Sepolia testnet
  async switchToSepolia() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chainId in hex
      });
    } catch (switchError) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xaa36a7',
            chainName: 'Sepolia Testnet',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18
            },
            rpcUrls: ['https://sepolia.gateway.tenderly.co'],
            blockExplorerUrls: ['https://sepolia.etherscan.io']
          }]
        });
      }
    }
  }

  // Initialize contracts (you'll need to import the ABIs)
  initializeContracts(ABIs) {
    this.contracts = {
      identityRegistry: new ethers.Contract(
        CONTRACT_ADDRESSES.IdentityRegistry, 
        ABIs.IdentityRegistry, 
        this.signer
      ),
      compliance: new ethers.Contract(
        CONTRACT_ADDRESSES.Compliance, 
        ABIs.Compliance, 
        this.signer
      ),
      propertyToken: new ethers.Contract(
        CONTRACT_ADDRESSES.PropertyToken, 
        ABIs.PropertyToken, 
        this.signer
      ),
      leaseAgreement: new ethers.Contract(
        CONTRACT_ADDRESSES.LeaseAgreement, 
        ABIs.LeaseAgreement, 
        this.signer
      ),
      escrowPayment: new ethers.Contract(
        CONTRACT_ADDRESSES.EscrowPayment, 
        ABIs.EscrowPayment, 
        this.signer
      )
    };
  }

  // User Management Functions
  async isUserVerified(address) {
    return await this.contracts.identityRegistry.isVerified(address);
  }

  async registerUser(identityAddress, country = 840) { // 840 = USA
    const tx = await this.contracts.identityRegistry.registerIdentity(
      this.signer.getAddress(),
      identityAddress,
      country
    );
    return await tx.wait();
  }

  // Property Token Functions
  async getPropertyBalance(address) {
    return await this.contracts.propertyToken.balanceOf(address);
  }

  async transferProperty(to, amount) {
    const tx = await this.contracts.propertyToken.transfer(to, amount);
    return await tx.wait();
  }

  // Lease Management Functions
  async createLease(landlord, tenant, monthlyRent, startDate, endDate, propertyAddress) {
    const tx = await this.contracts.leaseAgreement.createLease(
      landlord,
      tenant,
      monthlyRent,
      startDate,
      endDate,
      propertyAddress,
      ethers.keccak256(ethers.toUtf8Bytes("lease_document_hash"))
    );
    return await tx.wait();
  }

  async getLease(leaseId) {
    return await this.contracts.leaseAgreement.getLease(leaseId);
  }

  // Escrow & Payment Functions
  async createRentPayment(leaseId, amount, dueDate, token) {
    const tx = await this.contracts.escrowPayment.createRentPayment(
      leaseId,
      amount,
      dueDate,
      token
    );
    return await tx.wait();
  }

  async payRent(paymentId) {
    const tx = await this.contracts.escrowPayment.payRent(paymentId);
    return await tx.wait();
  }

  // Utility Functions
  formatEther(amount) {
    return ethers.formatEther(amount);
  }

  parseEther(amount) {
    return ethers.parseEther(amount.toString());
  }
}

// Example usage:
/*
const krayState = new KrayStateWeb3();

// Connect wallet and initialize
const userAddress = await krayState.connectWallet();
krayState.initializeContracts(YourImportedABIs);

// Check if user is verified
const isVerified = await krayState.isUserVerified(userAddress);

// Get property token balance
const balance = await krayState.getPropertyBalance(userAddress);
console.log("Property tokens:", krayState.formatEther(balance));
*/

export default KrayStateWeb3;