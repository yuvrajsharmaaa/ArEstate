// Simple deployment script without ES module dependencies
const { ethers } = require("hardhat");

async function main() {
  console.log("Starting contract deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy MockUSDC
  console.log("\nDeploying MockUSDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.deployed();
  console.log("MockUSDC deployed to:", mockUSDC.address);

  // Deploy IdentityRegistry
  console.log("\nDeploying IdentityRegistry...");
  const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
  const identityRegistry = await IdentityRegistry.deploy();
  await identityRegistry.deployed();
  console.log("IdentityRegistry deployed to:", identityRegistry.address);

  // Deploy Compliance
  console.log("\nDeploying Compliance...");
  const Compliance = await ethers.getContractFactory("Compliance");
  const compliance = await Compliance.deploy();
  await compliance.deployed();
  console.log("Compliance deployed to:", compliance.address);

  // Deploy PropertyToken
  console.log("\nDeploying PropertyToken...");
  const PropertyToken = await ethers.getContractFactory("PropertyToken");
  const propertyToken = await PropertyToken.deploy(
    identityRegistry.address,
    compliance.address
  );
  await propertyToken.deployed();
  console.log("PropertyToken deployed to:", propertyToken.address);

  // Deploy LeaseAgreement
  console.log("\nDeploying LeaseAgreement...");
  const LeaseAgreement = await ethers.getContractFactory("LeaseAgreement");
  const leaseAgreement = await LeaseAgreement.deploy();
  await leaseAgreement.deployed();
  console.log("LeaseAgreement deployed to:", leaseAgreement.address);

  // Deploy EscrowPayment
  console.log("\nDeploying EscrowPayment...");
  const EscrowPayment = await ethers.getContractFactory("EscrowPayment");
  const escrowPayment = await EscrowPayment.deploy(mockUSDC.address);
  await escrowPayment.deployed();
  console.log("EscrowPayment deployed to:", escrowPayment.address);

  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log("MockUSDC:", mockUSDC.address);
  console.log("IdentityRegistry:", identityRegistry.address);
  console.log("Compliance:", compliance.address);
  console.log("PropertyToken:", propertyToken.address);
  console.log("LeaseAgreement:", leaseAgreement.address);
  console.log("EscrowPayment:", escrowPayment.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
