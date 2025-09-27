const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting Hackathon Platform Deployment...");
  console.log("=".repeat(50));

  // Get deployment account
  const [deployer] = await ethers.getSigners();
  console.log("📋 Deploying with account:", deployer.address);
  console.log(
    "💰 Account balance:",
    ethers.utils.formatEther(await deployer.getBalance())
  );

  // Property metadata for the demo property
  const propertyData = {
    name: "Integra Downtown Office",
    symbol: "IDO001",
    propertyId: "INTEGRA-PROP-001",
    location: "456 Blockchain Ave, Crypto City",
    propertyType: "Commercial",
    area: 5000,
    totalValue: ethers.utils.parseEther("2000000"), // $2M property
    country: 840, // US country code
  };

  console.log("\n🏗️  Step 1: Deploying Core Infrastructure...");

  // Deploy IdentityRegistry
  console.log("   Deploying IdentityRegistry...");
  const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
  const identityRegistry = await IdentityRegistry.deploy();
  await identityRegistry.deployed();
  console.log("   ✅ IdentityRegistry deployed to:", identityRegistry.address);

  // Deploy Compliance
  console.log("   Deploying Compliance...");
  const Compliance = await ethers.getContractFactory("Compliance");
  const compliance = await Compliance.deploy(identityRegistry.address);
  await compliance.deployed();
  console.log("   ✅ Compliance deployed to:", compliance.address);

  console.log("\n🏠 Step 2: Deploying Property Token...");
  const RealEstateToken = await ethers.getContractFactory("RealEstateToken");
  const realEstateToken = await RealEstateToken.deploy(
    propertyData.name,
    propertyData.symbol,
    identityRegistry.address,
    compliance.address,
    propertyData
  );
  await realEstateToken.deployed();
  console.log("   ✅ RealEstateToken deployed to:", realEstateToken.address);

  console.log("\n� Step 3: Deploying Payment Infrastructure...");

  // Deploy MockUSDC
  console.log("   Deploying MockUSDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.deployed();
  console.log("   ✅ MockUSDC deployed to:", mockUSDC.address);

  // Deploy LeaseManager
  console.log("   Deploying LeaseManager...");
  const LeaseManager = await ethers.getContractFactory("LeaseManager");
  const leaseManager = await LeaseManager.deploy(identityRegistry.address);
  await leaseManager.deployed();
  console.log("   ✅ LeaseManager deployed to:", leaseManager.address);

  console.log("\n⚙️  Step 4: Contract Configuration...");

  // Setup roles and permissions
  const MINTER_ROLE = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("MINTER_ROLE")
  );
  const AGENT_ROLE = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("AGENT_ROLE")
  );

  console.log("   Setting up RealEstateToken roles...");
  await realEstateToken.grantRole(MINTER_ROLE, deployer.address);
  await realEstateToken.grantRole(AGENT_ROLE, deployer.address);
  console.log("   ✅ Granted MINTER_ROLE and AGENT_ROLE to deployer");

  console.log("   Binding compliance to token...");
  await compliance.bindToken(realEstateToken.address);
  console.log("   ✅ Compliance bound to RealEstateToken");

  console.log("   Approving MockUSDC for lease payments...");
  await leaseManager.addApprovedToken(mockUSDC.address);
  console.log("   ✅ MockUSDC approved for lease payments");

  console.log("\n🎯 Step 5: Demo Setup...");

  // Create some demo accounts for testing
  const demoAccounts = await ethers.getSigners();
  const landlord = demoAccounts[1] || deployer;
  const tenant = demoAccounts[2] || deployer;

  console.log("   Setting up demo landlord:", landlord.address);
  console.log("   Setting up demo tenant:", tenant.address);

  // Setup demo identities (if we have multiple accounts)
  if (demoAccounts.length > 2) {
    console.log("   Registering demo identities...");

    // Register landlord
    await identityRegistry.connect(landlord).registerIdentity(landlord.address);
    await identityRegistry.adminVerify(landlord.address, landlord.address, 840);

    // Register tenant
    await identityRegistry.connect(tenant).registerIdentity(tenant.address);
    await identityRegistry.adminVerify(tenant.address, tenant.address, 840);

    console.log("   ✅ Demo identities registered and verified");

    // Mint some property tokens to landlord
    const propertyTokenAmount = ethers.utils.parseEther("1000");
    await realEstateToken.mint(landlord.address, propertyTokenAmount);
    console.log(
      `   ✅ Minted ${ethers.utils.formatEther(propertyTokenAmount)} property tokens to landlord`
    );

    // Give tenant some MockUSDC for testing
    const usdcAmount = ethers.utils.parseUnits("10000", 6); // $10K USDC
    await mockUSDC.mint(tenant.address, usdcAmount);
    console.log(
      `   ✅ Minted $${ethers.utils.formatUnits(usdcAmount, 6)} MockUSDC to tenant`
    );
  }

  console.log("\n� Step 6: Deployment Summary");
  console.log("=".repeat(50));

  const deploymentSummary = {
    network: hre.network.name,
    deployer: deployer.address,
    contracts: {
      IdentityRegistry: identityRegistry.address,
      Compliance: compliance.address,
      RealEstateToken: realEstateToken.address,
      MockUSDC: mockUSDC.address,
      LeaseManager: leaseManager.address,
    },
    propertyData: {
      name: propertyData.name,
      symbol: propertyData.symbol,
      propertyId: propertyData.propertyId,
      location: propertyData.location,
      totalValue: `$${ethers.utils.formatEther(propertyData.totalValue)}`,
    },
  };

  console.log(JSON.stringify(deploymentSummary, null, 2));

  // Save deployment info to file
  const fs = require("fs");
  const path = require("path");

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentSummary, null, 2));

  console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);

  // Verification instructions
  console.log("\n� Contract Verification:");
  console.log("To verify contracts on Etherscan, run:");
  console.log(
    `npx hardhat verify --network ${hre.network.name} ${identityRegistry.address}`
  );
  console.log(
    `npx hardhat verify --network ${hre.network.name} ${compliance.address} ${identityRegistry.address}`
  );
  console.log(
    `npx hardhat verify --network ${hre.network.name} ${realEstateToken.address} "${propertyData.name}" "${propertyData.symbol}" ${identityRegistry.address} ${compliance.address} '${JSON.stringify(propertyData)}'`
  );
  console.log(
    `npx hardhat verify --network ${hre.network.name} ${mockUSDC.address}`
  );
  console.log(
    `npx hardhat verify --network ${hre.network.name} ${leaseManager.address} ${identityRegistry.address}`
  );

  console.log("\n🎉 Deployment Complete!");
  console.log("=".repeat(50));
  console.log("\n📋 Next Steps:");
  console.log("1. Update frontend with deployed contract addresses");
  console.log("2. Test the platform with the demo accounts");
  console.log("3. Create property listings and lease agreements");
  console.log("4. Demonstrate compliance and forced transfer features");
  console.log("\n🔗 Integration with Integra Chain:");
  console.log(
    "- Property tokens are ERC-3643 compliant for RWA Asset Passport"
  );
  console.log("- Ready for Global Orderbook integration");
  console.log("- MockUSDC simulates fiat rails for real USDC");
  console.log("- Compliance engine enforces KYC/AML requirements");

  return deploymentSummary;
}

// Error handling wrapper
main()
  .then((summary) => {
    console.log("\n✅ Deployment script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
