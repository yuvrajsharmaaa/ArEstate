const { ethers } = require("hardhat");

async function main() {
  console.log("Starting contract deployment...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");
  
  // Deploy MockUSDC first (for testing)
  console.log("\n1. Deploying MockUSDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.deployed();
  console.log("MockUSDC deployed to:", mockUSDC.address);
  
  // Deploy IdentityRegistry
  console.log("\n2. Deploying IdentityRegistry...");
  const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
  const identityRegistry = await IdentityRegistry.deploy();
  await identityRegistry.deployed();
  console.log("IdentityRegistry deployed to:", identityRegistry.address);
  
  // Deploy Compliance
  console.log("\n3. Deploying Compliance...");
  const Compliance = await ethers.getContractFactory("Compliance");
  const compliance = await Compliance.deploy();
  await compliance.deployed();
  console.log("Compliance deployed to:", compliance.address);
  
  // Deploy RealEstateToken
  console.log("\n4. Deploying RealEstateToken...");
  const RealEstateToken = await ethers.getContractFactory("RealEstateToken");
  const realEstateToken = await RealEstateToken.deploy(
    identityRegistry.address,
    compliance.address
  );
  await realEstateToken.deployed();
  console.log("RealEstateToken deployed to:", realEstateToken.address);
  
  // Deploy PropertyToken
  console.log("\n5. Deploying PropertyToken...");
  const PropertyToken = await ethers.getContractFactory("PropertyToken");
  const propertyToken = await PropertyToken.deploy(
    identityRegistry.address,
    compliance.address
  );
  await propertyToken.deployed();
  console.log("PropertyToken deployed to:", propertyToken.address);
  
  // Deploy EscrowPayment
  console.log("\n6. Deploying EscrowPayment...");
  const EscrowPayment = await ethers.getContractFactory("EscrowPayment");
  const escrowPayment = await EscrowPayment.deploy(mockUSDC.address);
  await escrowPayment.deployed();
  console.log("EscrowPayment deployed to:", escrowPayment.address);
  
  // Deploy LeaseAgreement
  console.log("\n7. Deploying LeaseAgreement...");
  const LeaseAgreement = await ethers.getContractFactory("LeaseAgreement");
  const leaseAgreement = await LeaseAgreement.deploy();
  await leaseAgreement.deployed();
  console.log("LeaseAgreement deployed to:", leaseAgreement.address);
  
  // Deploy LeaseManager
  console.log("\n8. Deploying LeaseManager...");
  const LeaseManager = await ethers.getContractFactory("LeaseManager");
  const leaseManager = await LeaseManager.deploy(
    leaseAgreement.address,
    escrowPayment.address
  );
  await leaseManager.deployed();
  console.log("LeaseManager deployed to:", leaseManager.address);
  
  // Create contract addresses configuration
  const contractAddresses = {
    mockUSDC: mockUSDC.address,
    identityRegistry: identityRegistry.address,
    compliance: compliance.address,
    realEstateToken: realEstateToken.address,
    propertyToken: propertyToken.address,
    escrowPayment: escrowPayment.address,
    leaseAgreement: leaseAgreement.address,
    leaseManager: leaseManager.address,
    deployer: deployer.address,
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId
  };
  
  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log("Network:", contractAddresses.network);
  console.log("Chain ID:", contractAddresses.chainId);
  console.log("Deployer:", contractAddresses.deployer);
  console.log("\nContract Addresses:");
  console.log("MockUSDC:", contractAddresses.mockUSDC);
  console.log("IdentityRegistry:", contractAddresses.identityRegistry);
  console.log("Compliance:", contractAddresses.compliance);
  console.log("RealEstateToken:", contractAddresses.realEstateToken);
  console.log("PropertyToken:", contractAddresses.propertyToken);
  console.log("EscrowPayment:", contractAddresses.escrowPayment);
  console.log("LeaseAgreement:", contractAddresses.leaseAgreement);
  console.log("LeaseManager:", contractAddresses.leaseManager);
  
  // Save contract addresses to file
  const fs = require('fs');
  const contractConfig = `// Auto-generated contract addresses from deployment
const CONTRACT_ADDRESSES = ${JSON.stringify(contractAddresses, null, 2)};

// Export for frontend use
if (typeof window !== 'undefined') {
    window.CONTRACT_ADDRESSES = CONTRACT_ADDRESSES;
}

// Export for Node.js use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONTRACT_ADDRESSES;
}
`;
  
  fs.writeFileSync('./project/js/contract-addresses.js', contractConfig);
  console.log("\n✅ Contract addresses saved to project/js/contract-addresses.js");
  
  console.log("\n🎉 All contracts deployed successfully!");
  console.log("You can now use these addresses in your frontend application.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });