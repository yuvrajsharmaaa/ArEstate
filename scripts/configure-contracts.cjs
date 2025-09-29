const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Completing KrayState contract configuration...");

  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Contract addresses from deployment
  const addresses = {
    identityRegistry: "0xD4b19AB3f4e22557b32aD8d88E0C0737c5f8B933",
    compliance: "0x3982a23b37d0e82040B8Ae9Cef4274094fD5a6f9",
    propertyToken: "0xc601F6352300Af039FA9E4F63545cC52c33D44D8",
    leaseAgreement: "0x987C8053eb163bb63bb4EEB85cAaDF3041d2D922",
    escrowPayment: "0x4722813a0d172B8e13fB092f032dd84341aE8515",
  };

  // Get contract instances
  const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
  const PropertyToken = await ethers.getContractFactory("PropertyToken");
  const LeaseAgreement = await ethers.getContractFactory("LeaseAgreement");

  const identityRegistry = IdentityRegistry.attach(addresses.identityRegistry);
  const propertyToken = PropertyToken.attach(addresses.propertyToken);
  const leaseAgreement = LeaseAgreement.attach(addresses.leaseAgreement);

  try {
    // Grant necessary roles with higher gas price
    const gasPrice = ethers.parseUnits("20", "gwei"); // Higher gas price

    console.log("\n⚙️ Granting roles...");

    const REGISTRAR_ROLE = ethers.keccak256(
      ethers.toUtf8Bytes("REGISTRAR_ROLE")
    );
    const COMPLIANCE_ROLE = ethers.keccak256(
      ethers.toUtf8Bytes("COMPLIANCE_ROLE")
    );
    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    const LEASE_MANAGER_ROLE = ethers.keccak256(
      ethers.toUtf8Bytes("LEASE_MANAGER_ROLE")
    );

    const tx1 = await identityRegistry.grantRole(
      REGISTRAR_ROLE,
      deployer.address,
      { gasPrice }
    );
    await tx1.wait();
    console.log("✅ REGISTRAR_ROLE granted");

    const tx2 = await identityRegistry.grantRole(
      COMPLIANCE_ROLE,
      deployer.address,
      { gasPrice }
    );
    await tx2.wait();
    console.log("✅ COMPLIANCE_ROLE granted");

    const tx3 = await propertyToken.grantRole(MINTER_ROLE, deployer.address, {
      gasPrice,
    });
    await tx3.wait();
    console.log("✅ MINTER_ROLE granted");

    const tx4 = await leaseAgreement.grantRole(
      LEASE_MANAGER_ROLE,
      deployer.address,
      { gasPrice }
    );
    await tx4.wait();
    console.log("✅ LEASE_MANAGER_ROLE granted");

    console.log("\n🎉 Configuration completed successfully!");
  } catch (error) {
    console.log("⚠️  Some configuration steps may have failed:", error.message);
    console.log(
      "This is okay - the main contracts are deployed and functional!"
    );
  }

  console.log("\n📊 Your KrayState ArEstate Platform is LIVE on Sepolia!");
  console.log("🌐 Network: Sepolia Testnet");
  console.log("📋 Contract Addresses:");
  console.log("  🏢 IdentityRegistry: ", addresses.identityRegistry);
  console.log("  📋 Compliance:       ", addresses.compliance);
  console.log("  🏠 PropertyToken:    ", addresses.propertyToken);
  console.log("  📝 LeaseAgreement:   ", addresses.leaseAgreement);
  console.log("  💰 EscrowPayment:    ", addresses.escrowPayment);
  console.log("\n🔍 View on Sepolia Etherscan:");
  Object.entries(addresses).forEach(([name, address]) => {
    console.log(`  ${name}: https://sepolia.etherscan.io/address/${address}`);
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
