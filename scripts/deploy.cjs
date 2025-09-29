const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 Starting KrayState Platform Deployment on Integra Chain...");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    // Contract factories
    const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
    const Compliance = await ethers.getContractFactory("Compliance");
    const PropertyToken = await ethers.getContractFactory("PropertyToken");
    const LeaseAgreement = await ethers.getContractFactory("LeaseAgreement");
    const EscrowPayment = await ethers.getContractFactory("EscrowPayment");

    console.log("\n📋 Step 1: Deploying IdentityRegistry...");
    const identityRegistry = await IdentityRegistry.deploy();
    await identityRegistry.deployed();
    console.log("✅ IdentityRegistry deployed to:", identityRegistry.address);

    console.log("\n📋 Step 2: Deploying Compliance module...");
    const compliance = await Compliance.deploy(identityRegistry.address);
    await compliance.deployed();
    console.log("✅ Compliance deployed to:", compliance.address);

    console.log("\n📋 Step 3: Deploying PropertyToken...");
    // Sample property metadata for initial deployment
    const propertyMetadata = {
        assetPassportId: "INTEGRA-RWA-001",
        propertyAddress: "123 Blockchain Avenue, Crypto City, CC 12345",
        totalValue: ethers.utils.parseEther("1000000"), // $1M property
        tokenizedPercentage: 10000, // 100% tokenized
        jurisdiction: "US-NY",
        documentHash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("property_docs_hash")),
        isActive: true
    };

    const propertyToken = await PropertyToken.deploy(
        "KrayState Property Token", // name
        "KPT", // symbol
        18, // decimals
        identityRegistry.address,
        compliance.address,
        propertyMetadata
    );
    await propertyToken.deployed();
    console.log("✅ PropertyToken deployed to:", propertyToken.address);

    console.log("\n📋 Step 4: Deploying LeaseAgreement...");
    const leaseAgreement = await LeaseAgreement.deploy(
        identityRegistry.address,
        ethers.constants.AddressZero // Will set escrow contract address later
    );
    await leaseAgreement.deployed();
    console.log("✅ LeaseAgreement deployed to:", leaseAgreement.address);

    console.log("\n📋 Step 5: Deploying EscrowPayment...");
    const escrowPayment = await EscrowPayment.deploy(
        identityRegistry.address,
        leaseAgreement.address
    );
    await escrowPayment.deployed();
    console.log("✅ EscrowPayment deployed to:", escrowPayment.address);

    console.log("\n🔗 Step 6: Linking contracts together...");
    
    // Bind compliance to property token
    await compliance.bindToken(propertyToken.address);
    console.log("✅ Compliance bound to PropertyToken");

    // Update LeaseAgreement with EscrowPayment address
    await leaseAgreement.setEscrowContract(escrowPayment.address);
    console.log("✅ LeaseAgreement linked to EscrowPayment");

    // Set up some initial approved payment tokens (placeholder addresses)
    // In production, these would be actual stablecoin/IRL token addresses on Integra
    const MOCK_USDC = "0x1234567890123456789012345678901234567890";
    const MOCK_IRL = "0x0987654321098765432109876543210987654321";
    
    await leaseAgreement.setApprovedPaymentToken(MOCK_USDC, true);
    await leaseAgreement.setApprovedPaymentToken(MOCK_IRL, true);
    await escrowPayment.setApprovedToken(MOCK_USDC, true);
    await escrowPayment.setApprovedToken(MOCK_IRL, true);
    
    console.log("✅ Payment tokens approved");

    console.log("\n📊 Step 7: Setting up initial roles and permissions...");
    
    // Grant roles to deployer for testing
    const TOKEN_AGENT_ROLE = await propertyToken.TOKEN_AGENT_ROLE();
    const COMPLIANCE_ROLE = await propertyToken.COMPLIANCE_ROLE();
    const LEASE_MANAGER_ROLE = await leaseAgreement.LEASE_MANAGER_ROLE();
    const ESCROW_AGENT_ROLE = await escrowPayment.ESCROW_AGENT_ROLE();
    const PAYMENT_PROCESSOR_ROLE = await escrowPayment.PAYMENT_PROCESSOR_ROLE();

    await propertyToken.grantRole(TOKEN_AGENT_ROLE, deployer.address);
    await propertyToken.grantRole(COMPLIANCE_ROLE, deployer.address);
    await leaseAgreement.grantRole(LEASE_MANAGER_ROLE, deployer.address);
    await escrowPayment.grantRole(ESCROW_AGENT_ROLE, deployer.address);
    await escrowPayment.grantRole(PAYMENT_PROCESSOR_ROLE, deployer.address);

    console.log("✅ Initial roles configured");

    console.log("\n🎯 Step 8: Deployment Summary");
    console.log("================================");
    console.log("🏢 IdentityRegistry:  ", identityRegistry.address);
    console.log("📋 Compliance:        ", compliance.address);
    console.log("🏠 PropertyToken:     ", propertyToken.address);
    console.log("📝 LeaseAgreement:    ", leaseAgreement.address);
    console.log("💰 EscrowPayment:     ", escrowPayment.address);
    console.log("================================");

    // Save deployment addresses
    const deploymentInfo = {
        network: await ethers.provider.getNetwork(),
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            IdentityRegistry: identityRegistry.address,
            Compliance: compliance.address,
            PropertyToken: propertyToken.address,
            LeaseAgreement: leaseAgreement.address,
            EscrowPayment: escrowPayment.address
        },
        configuration: {
            propertyToken: {
                name: "KrayState Property Token",
                symbol: "KPT",
                decimals: 18
            },
            propertyMetadata: propertyMetadata,
            approvedTokens: {
                MOCK_USDC: MOCK_USDC,
                MOCK_IRL: MOCK_IRL
            }
        }
    };

    console.log("\n💾 Saving deployment info to deployments.json...");
    const fs = require('fs');
    const path = require('path');
    
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir);
    }
    
    fs.writeFileSync(
        path.join(deploymentsDir, `kraystate-deployment-${Date.now()}.json`),
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n🎉 KrayState Platform Successfully Deployed!");
    console.log("\n📋 Next Steps:");
    console.log("1. Verify contracts on block explorer");
    console.log("2. Set up KYC/AML providers in IdentityRegistry");
    console.log("3. Configure compliance rules in Compliance contract");
    console.log("4. Mint initial property tokens for testing");
    console.log("5. Create test lease agreements");
    console.log("6. Test escrow and payment functionality");
    console.log("\n🔗 Integration with Integra Chain:");
    console.log("- Connect to Integra RWA Asset Passport API");
    console.log("- Integrate with Integra Global Orderbook");
    console.log("- Set up fiat payment bridge integration");
    console.log("- Configure $IRL token addresses");
    
    return deploymentInfo;
}

// Handle deployment
main()
    .then((deploymentInfo) => {
        console.log("\n✅ Deployment completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Deployment failed:", error);
        process.exit(1);
    });