const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Starting KrayState ArEstate Platform Deployment...");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

    // Step 1: Deploy IdentityRegistry
    console.log("\n📋 Step 1: Deploying IdentityRegistry...");
    const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
    const identityRegistry = await IdentityRegistry.deploy();
    await identityRegistry.waitForDeployment();
    console.log("✅ IdentityRegistry deployed to:", await identityRegistry.getAddress());

    // Step 2: Deploy Compliance
    console.log("\n📋 Step 2: Deploying Compliance module...");
    const Compliance = await ethers.getContractFactory("Compliance");
    const compliance = await Compliance.deploy(await identityRegistry.getAddress());
    await compliance.waitForDeployment();
    console.log("✅ Compliance deployed to:", await compliance.getAddress());

    // Step 3: Deploy PropertyToken
    console.log("\n📋 Step 3: Deploying PropertyToken...");
    const PropertyToken = await ethers.getContractFactory("PropertyToken");
    const propertyInfo = {
        propertyAddress: "Sample Property, Downtown NYC",
        description: "Luxury residential property for tokenization",
        totalValue: ethers.parseEther("1000000"), // $1M
        tokenSupply: ethers.parseEther("1000"), // 1000 tokens
        metadataURI: "ipfs://QmSamplePropertyMetadata"
    };
    
    const propertyToken = await PropertyToken.deploy(
        "NYC Property Token",
        "NYCPT",
        await identityRegistry.getAddress(),
        await compliance.getAddress(),
        propertyInfo
    );
    await propertyToken.waitForDeployment();
    console.log("✅ PropertyToken deployed to:", await propertyToken.getAddress());

    // Step 4: Deploy LeaseAgreement
    console.log("\n📋 Step 4: Deploying LeaseAgreement...");
    const LeaseAgreement = await ethers.getContractFactory("LeaseAgreement");
    const leaseAgreement = await LeaseAgreement.deploy(await identityRegistry.getAddress());
    await leaseAgreement.waitForDeployment();
    console.log("✅ LeaseAgreement deployed to:", await leaseAgreement.getAddress());

    // Step 5: Deploy EscrowPayment
    console.log("\n📋 Step 5: Deploying EscrowPayment...");
    const EscrowPayment = await ethers.getContractFactory("EscrowPayment");
    const escrowPayment = await EscrowPayment.deploy(await leaseAgreement.getAddress());
    await escrowPayment.waitForDeployment();
    console.log("✅ EscrowPayment deployed to:", await escrowPayment.getAddress());

    // Step 6: Setup initial configuration
    console.log("\n⚙️  Step 6: Setting up initial configuration...");
    
    // Bind compliance to token
    await compliance.bindToken(await propertyToken.getAddress());
    console.log("✅ PropertyToken bound to compliance module");

    // Grant necessary roles
    const REGISTRAR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("REGISTRAR_ROLE"));
    const COMPLIANCE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("COMPLIANCE_ROLE"));
    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    const LEASE_MANAGER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("LEASE_MANAGER_ROLE"));

    await identityRegistry.grantRole(REGISTRAR_ROLE, deployer.address);
    await identityRegistry.grantRole(COMPLIANCE_ROLE, deployer.address);
    await propertyToken.grantRole(MINTER_ROLE, deployer.address);
    await leaseAgreement.grantRole(LEASE_MANAGER_ROLE, deployer.address);
    console.log("✅ Initial roles granted to deployer");

    // Summary
    console.log("\n🎉 Deployment completed successfully!");
    console.log("📊 Contract Addresses:");
    console.log("   IdentityRegistry:", await identityRegistry.getAddress());
    console.log("   Compliance:", await compliance.getAddress());
    console.log("   PropertyToken:", await propertyToken.getAddress());
    console.log("   LeaseAgreement:", await leaseAgreement.getAddress());
    console.log("   EscrowPayment:", await escrowPayment.getAddress());
    
    console.log("\n📝 Next Steps:");
    console.log("   1. Register and verify user identities through IdentityRegistry");
    console.log("   2. Mint property tokens to verified addresses");
    console.log("   3. Create lease agreements for property rentals");
    console.log("   4. Use escrow for secure rent payments");
    
    // Create verification file
    const deploymentInfo = {
        network: await ethers.provider.getNetwork(),
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            IdentityRegistry: await identityRegistry.getAddress(),
            Compliance: await compliance.getAddress(),
            PropertyToken: await propertyToken.getAddress(),
            LeaseAgreement: await leaseAgreement.getAddress(),
            EscrowPayment: await escrowPayment.getAddress()
        }
    };
    
    console.log("\n📄 Deployment Info:", JSON.stringify(deploymentInfo, null, 2));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });