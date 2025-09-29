// Direct contract deployment using Web3 and compiled artifacts
const { Web3 } = require("web3");
const fs = require("fs");
const path = require("path");

// Initialize Web3 (using local Ganache or Hardhat node)
const web3 = new Web3("http://127.0.0.1:8545");

// Load contract artifacts
function loadContractArtifact(contractName) {
  const artifactPath = path.join(
    __dirname,
    "artifacts",
    "contracts",
    `${contractName}.sol`,
    `${contractName}.json`
  );
  if (fs.existsSync(artifactPath)) {
    return JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  } else {
    throw new Error(`Contract artifact not found: ${artifactPath}`);
  }
}

async function deployContract(contractName, args = [], deployer) {
  console.log(`\nDeploying ${contractName}...`);

  const artifact = loadContractArtifact(contractName);
  const contract = new web3.eth.Contract(artifact.abi);

  const deployTx = contract.deploy({
    data: artifact.bytecode,
    arguments: args,
  });

  const gas = await deployTx.estimateGas({ from: deployer });
  console.log(`Estimated gas: ${gas}`);

  const deployedContract = await deployTx.send({
    from: deployer,
    gas: Math.floor(gas * 1.2), // Add 20% buffer
  });

  console.log(
    `✅ ${contractName} deployed at: ${deployedContract.options.address}`
  );
  return deployedContract;
}

async function main() {
  try {
    console.log("🚀 Starting contract deployment...");

    // Get accounts
    const accounts = await web3.eth.getAccounts();
    const deployer = accounts[0];

    console.log(`Deployer account: ${deployer}`);
    const balance = await web3.eth.getBalance(deployer);
    console.log(`Account balance: ${web3.utils.fromWei(balance, "ether")} ETH`);

    // Deploy contracts in dependency order
    const deployedContracts = {};

    // 1. Deploy MockUSDC (no dependencies)
    deployedContracts.mockUSDC = await deployContract("MockUSDC", [], deployer);

    // 2. Deploy IdentityRegistry (no dependencies)
    deployedContracts.identityRegistry = await deployContract(
      "IdentityRegistry",
      [],
      deployer
    );

    // 3. Deploy Compliance (no dependencies)
    deployedContracts.compliance = await deployContract(
      "Compliance",
      [],
      deployer
    );

    // 4. Deploy PropertyToken (requires IdentityRegistry and Compliance)
    deployedContracts.propertyToken = await deployContract(
      "PropertyToken",
      [
        deployedContracts.identityRegistry.options.address,
        deployedContracts.compliance.options.address,
      ],
      deployer
    );

    // 5. Deploy LeaseAgreement (no dependencies)
    deployedContracts.leaseAgreement = await deployContract(
      "LeaseAgreement",
      [],
      deployer
    );

    // 6. Deploy EscrowPayment (requires MockUSDC)
    deployedContracts.escrowPayment = await deployContract(
      "EscrowPayment",
      [deployedContracts.mockUSDC.options.address],
      deployer
    );

    // Create contract addresses summary
    const contractAddresses = {
      mockUSDC: deployedContracts.mockUSDC.options.address,
      identityRegistry: deployedContracts.identityRegistry.options.address,
      compliance: deployedContracts.compliance.options.address,
      propertyToken: deployedContracts.propertyToken.options.address,
      leaseAgreement: deployedContracts.leaseAgreement.options.address,
      escrowPayment: deployedContracts.escrowPayment.options.address,
      deployer: deployer,
      timestamp: new Date().toISOString(),
    };

    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("=".repeat(50));
    console.log("Contract Addresses:");
    Object.entries(contractAddresses).forEach(([name, address]) => {
      if (name !== "timestamp") {
        console.log(`${name}: ${address}`);
      }
    });

    // Save addresses to file for frontend use
    const configContent = `// Auto-generated contract addresses
const CONTRACT_ADDRESSES = ${JSON.stringify(contractAddresses, null, 2)};

// Export for browser use
if (typeof window !== 'undefined') {
    window.CONTRACT_ADDRESSES = CONTRACT_ADDRESSES;
}

// Export for Node.js use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONTRACT_ADDRESSES;
}`;

    fs.writeFileSync("./project/js/contract-addresses.js", configContent);
    console.log(
      "\n📝 Contract addresses saved to project/js/contract-addresses.js"
    );

    // Also update the web3-config.js file
    const configPath = "./web3-config.js";
    if (fs.existsSync(configPath)) {
      let configContent = fs.readFileSync(configPath, "utf8");

      // Update the CONTRACTS section
      const contractsSection = `  CONTRACTS: {
    MOCK_USDC: "${contractAddresses.mockUSDC}",
    IDENTITY_REGISTRY: "${contractAddresses.identityRegistry}",
    COMPLIANCE: "${contractAddresses.compliance}",
    PROPERTY_TOKEN: "${contractAddresses.propertyToken}",
    LEASE_AGREEMENT: "${contractAddresses.leaseAgreement}",
    ESCROW_PAYMENT: "${contractAddresses.escrowPayment}",
  },`;

      // Replace the existing CONTRACTS section
      configContent = configContent.replace(
        /CONTRACTS:\s*{[^}]*}/,
        contractsSection.trim()
      );

      fs.writeFileSync(configPath, configContent);
      console.log("📝 Updated web3-config.js with deployed addresses");
    }

    console.log("\n✅ All contracts deployed successfully!");
    console.log(
      "You can now use these addresses in your frontend application."
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run deployment
main();
