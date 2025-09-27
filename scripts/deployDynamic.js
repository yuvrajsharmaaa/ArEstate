const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting Dynamic Platform Deployment...");
  console.log("=".repeat(60));

  // Get deployment account
  const [deployer] = await ethers.getSigners();
  console.log("📋 Deploying with account:", deployer.address);
  console.log(
    "💰 Account balance:",
    ethers.utils.formatEther(await deployer.getBalance())
  );

  console.log("\n🏗️  Step 1: Deploying Core Infrastructure...");

  // Deploy IdentityRegistry
  console.log("   Deploying IdentityRegistry...");
  const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
  const identityRegistry = await IdentityRegistry.deploy();
  await identityRegistry.deployed();
  console.log("   ✅ IdentityRegistry deployed to:", identityRegistry.address);

  // Deploy basic Compliance for backward compatibility
  console.log("   Deploying Basic Compliance...");
  const Compliance = await ethers.getContractFactory("Compliance");
  const compliance = await Compliance.deploy(identityRegistry.address);
  await compliance.deployed();
  console.log("   ✅ Basic Compliance deployed to:", compliance.address);

  // Deploy DynamicCompliance
  console.log("   Deploying DynamicCompliance...");
  const DynamicCompliance =
    await ethers.getContractFactory("DynamicCompliance");
  const dynamicCompliance = await DynamicCompliance.deploy(
    identityRegistry.address
  );
  await dynamicCompliance.deployed();
  console.log(
    "   ✅ DynamicCompliance deployed to:",
    dynamicCompliance.address
  );

  console.log("\n🏠 Step 2: Deploying Token Infrastructure...");

  // Deploy RealEstateToken implementation (for cloning)
  console.log("   Deploying RealEstateToken Implementation...");
  const RealEstateToken = await ethers.getContractFactory("RealEstateToken");
  const realEstateTokenImpl = await RealEstateToken.deploy(
    "Implementation Token", // Placeholder name
    "IMPL", // Placeholder symbol
    identityRegistry.address,
    compliance.address,
    {
      propertyId: "IMPL-001",
      location: "Implementation Contract",
      propertyType: "Implementation",
      area: 0,
      totalValue: 0,
      country: 840,
    }
  );
  await realEstateTokenImpl.deployed();
  console.log(
    "   ✅ RealEstateToken Implementation:",
    realEstateTokenImpl.address
  );

  // Deploy PropertyFactory
  console.log("   Deploying PropertyFactory...");
  const PropertyFactory = await ethers.getContractFactory("PropertyFactory");
  const propertyFactory = await PropertyFactory.deploy(
    identityRegistry.address,
    compliance.address,
    realEstateTokenImpl.address
  );
  await propertyFactory.deployed();
  console.log("   ✅ PropertyFactory deployed to:", propertyFactory.address);

  console.log("\n💰 Step 3: Deploying Payment & Lease Infrastructure...");

  // Deploy MockUSDC
  console.log("   Deploying MockUSDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.deployed();
  console.log("   ✅ MockUSDC deployed to:", mockUSDC.address);

  // Deploy DynamicLeaseManager
  console.log("   Deploying DynamicLeaseManager...");
  const DynamicLeaseManager = await ethers.getContractFactory(
    "DynamicLeaseManager"
  );
  const dynamicLeaseManager = await DynamicLeaseManager.deploy(
    identityRegistry.address
  );
  await dynamicLeaseManager.deployed();
  console.log(
    "   ✅ DynamicLeaseManager deployed to:",
    dynamicLeaseManager.address
  );

  // Deploy Basic LeaseManager for backward compatibility
  console.log("   Deploying Basic LeaseManager...");
  const LeaseManager = await ethers.getContractFactory("LeaseManager");
  const leaseManager = await LeaseManager.deploy(identityRegistry.address);
  await leaseManager.deployed();
  console.log("   ✅ Basic LeaseManager deployed to:", leaseManager.address);

  console.log("\n⚙️  Step 4: Contract Configuration...");

  // Setup PropertyFactory roles
  const PROPERTY_CREATOR_ROLE = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("PROPERTY_CREATOR_ROLE")
  );
  const PROPERTY_MANAGER_ROLE = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("PROPERTY_MANAGER_ROLE")
  );

  console.log("   Setting up PropertyFactory roles...");
  await propertyFactory.grantRole(PROPERTY_CREATOR_ROLE, deployer.address);
  await propertyFactory.grantRole(PROPERTY_MANAGER_ROLE, deployer.address);
  console.log("   ✅ PropertyFactory roles configured");

  // Setup DynamicCompliance
  console.log("   Configuring DynamicCompliance...");
  await dynamicCompliance.bindToken(
    realEstateTokenImpl.address,
    10000, // maxInvestors
    ethers.utils.parseEther("100000"), // maxBalance (100K tokens)
    ethers.utils.parseEther("1000"), // minInvestment (1K tokens)
    false // accreditedOnly
  );
  console.log("   ✅ DynamicCompliance configured");

  // Setup basic compliance for backward compatibility
  await compliance.bindToken(realEstateTokenImpl.address);

  // Setup payment tokens
  console.log("   Approving payment tokens...");
  await dynamicLeaseManager.addApprovedToken(mockUSDC.address);
  await leaseManager.addApprovedToken(mockUSDC.address);
  console.log("   ✅ Payment tokens approved");

  console.log("\n🎯 Step 5: Demo Property Creation...");

  // Create a demo property using PropertyFactory
  const demoPropertyConfig = {
    name: "Dynamic Luxury Apartments",
    symbol: "DLA001",
    category: 0, // RESIDENTIAL
    location: "789 Dynamic Street, Smart City, SC 12345",
    description:
      "Modern luxury apartments with smart home features and dynamic lease terms",
    totalValue: ethers.utils.parseEther("3000000"), // $3M property
    totalSupply: ethers.utils.parseEther("10000"), // 10K tokens
    minInvestment: ethers.utils.parseEther("1000"), // $1K min
    maxInvestment: ethers.utils.parseEther("50000"), // $50K max per investor
    fractionalOwnership: true,
    metadataCID: "QmDynamicPropertyMetadata123456789",
    authorizedManagers: [deployer.address],
    creationTime: 0, // Will be set by contract
    isActive: true,
  };

  const demoTokenEconomics = {
    managementFee: 200, // 2%
    performanceFee: 1000, // 10%
    liquidityBuffer: 500, // 5%
    enableDividends: true,
    enableBuyback: true,
    enableStaking: false,
    stakingReward: 0,
  };

  console.log("   Creating demo property via PropertyFactory...");
  try {
    const createTx = await propertyFactory.createProperty(
      demoPropertyConfig,
      demoTokenEconomics
    );
    const createReceipt = await createTx.wait();
    const propertyCreatedEvent = createReceipt.events?.find(
      (e) => e.event === "PropertyCreated"
    );
    const propertyId = propertyCreatedEvent?.args?.propertyId;
    const demoPropertyToken = propertyCreatedEvent?.args?.tokenContract;

    console.log("   ✅ Demo property created:");
    console.log("      Property ID:", propertyId?.toString());
    console.log("      Token Contract:", demoPropertyToken);
  } catch (error) {
    console.log(
      "   ⚠️  PropertyFactory demo creation skipped (may need compatible RealEstateToken)"
    );
    console.log("      Error:", error.message);
  }

  console.log("\n🎯 Step 6: Demo Setup...");

  // Setup demo accounts
  const demoAccounts = await ethers.getSigners();
  const landlord = demoAccounts[1] || deployer;
  const tenant = demoAccounts[2] || deployer;

  console.log("   Setting up demo accounts...");
  console.log("   Landlord:", landlord.address);
  console.log("   Tenant:", tenant.address);

  // Register and verify demo identities
  if (demoAccounts.length > 2) {
    console.log("   Registering demo identities...");

    await identityRegistry.connect(landlord).registerIdentity(landlord.address);
    await identityRegistry.adminVerify(landlord.address, landlord.address, 840);

    await identityRegistry.connect(tenant).registerIdentity(tenant.address);
    await identityRegistry.adminVerify(tenant.address, tenant.address, 840);

    console.log("   ✅ Demo identities registered and verified");

    // Give accounts some MockUSDC for testing
    const usdcAmount = ethers.utils.parseUnits("25000", 6); // $25K each
    await mockUSDC.mint(landlord.address, usdcAmount);
    await mockUSDC.mint(tenant.address, usdcAmount);
    console.log(
      `   ✅ Minted $${ethers.utils.formatUnits(usdcAmount, 6)} MockUSDC to each demo account`
    );
  }

  console.log("\n📊 Step 7: Deployment Summary");
  console.log("=".repeat(60));

  const deploymentSummary = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    coreContracts: {
      IdentityRegistry: identityRegistry.address,
      DynamicCompliance: dynamicCompliance.address,
      BasicCompliance: compliance.address,
    },
    tokenContracts: {
      RealEstateTokenImplementation: realEstateTokenImpl.address,
      PropertyFactory: propertyFactory.address,
    },
    leaseContracts: {
      DynamicLeaseManager: dynamicLeaseManager.address,
      BasicLeaseManager: leaseManager.address,
    },
    paymentContracts: {
      MockUSDC: mockUSDC.address,
    },
    demoData: {
      landlord: landlord.address,
      tenant: tenant.address,
    },
    dynamicFeatures: {
      multipleProperties: "PropertyFactory enables unlimited property creation",
      flexibleCompliance:
        "DynamicCompliance supports configurable rules per token",
      advancedLeases:
        "DynamicLeaseManager supports rent escalations, rent-to-own, co-tenants",
      tokenEconomics:
        "Each property can have unique management fees, dividends, staking",
    },
  };

  console.log(JSON.stringify(deploymentSummary, null, 2));

  // Save deployment info
  const fs = require("fs");
  const path = require("path");

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(
    deploymentsDir,
    `${hre.network.name}-dynamic.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentSummary, null, 2));

  console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);

  console.log("\n🎉 Dynamic Platform Deployment Complete!");
  console.log("=".repeat(60));
  console.log("\n📋 Dynamic Features Enabled:");
  console.log("✅ Multi-Property Creation via PropertyFactory");
  console.log("✅ Flexible Compliance Rules per Token");
  console.log("✅ Advanced Lease Terms (escalations, rent-to-own, co-tenants)");
  console.log("✅ Dynamic Token Economics (fees, dividends, staking)");
  console.log("✅ Risk-Based Investor Assessments");
  console.log("✅ Configurable Country Restrictions");
  console.log("✅ Automated Compliance Monitoring");
  console.log("✅ Multiple Payment Frequencies");

  console.log("\n🔗 Integration Points:");
  console.log("- PropertyFactory: Create unlimited tokenized properties");
  console.log("- DynamicCompliance: Configure rules per property type");
  console.log("- DynamicLeaseManager: Advanced lease scenarios");
  console.log("- MockUSDC: Flexible payment infrastructure");

  console.log("\n🎯 Usage Examples:");
  console.log("1. Create multiple properties:");
  console.log("   propertyFactory.createProperty(config, economics)");
  console.log("2. Configure compliance per token:");
  console.log(
    "   dynamicCompliance.updateComplianceRule(token, ruleType, rule)"
  );
  console.log("3. Create dynamic lease with escalations:");
  console.log(
    "   dynamicLeaseManager.createDynamicLease(tenant, token, rent, deposit, terms)"
  );
  console.log("4. Activate rent-to-own:");
  console.log("   dynamicLeaseManager.activateRentToOwn(leaseId)");

  return deploymentSummary;
}

main()
  .then((summary) => {
    console.log("\n✅ Dynamic deployment completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Dynamic deployment failed:");
    console.error(error);
    process.exit(1);
  });
