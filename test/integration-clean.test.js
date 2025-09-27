const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("KrayState ArEstate Platform Tests", function () {
    let identityRegistry;
    let compliance;
    let propertyToken;
    let leaseAgreement;
    let escrowPayment;
    let owner, admin, landlord, tenant, investor;

    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    const AGENT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("AGENT_ROLE"));
    const REGISTRAR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("REGISTRAR_ROLE"));
    const COMPLIANCE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("COMPLIANCE_ROLE"));
    const LEASE_MANAGER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("LEASE_MANAGER_ROLE"));
    
    // Property metadata for testing
    const propertyInfo = {
        propertyAddress: "123 Main St, New York",
        description: "Luxury downtown apartment",
        totalValue: ethers.parseEther("1000000"), // $1M
        tokenSupply: ethers.parseEther("1000"), // 1000 tokens
        metadataURI: "ipfs://QmTestHash"
    };

    beforeEach(async function () {
        [owner, admin, landlord, tenant, investor] = await ethers.getSigners();

        // Deploy IdentityRegistry
        const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
        identityRegistry = await IdentityRegistry.deploy();
        await identityRegistry.waitForDeployment();

        // Deploy Compliance
        const Compliance = await ethers.getContractFactory("Compliance");
        compliance = await Compliance.deploy(await identityRegistry.getAddress());
        await compliance.waitForDeployment();

        // Deploy PropertyToken
        const PropertyToken = await ethers.getContractFactory("PropertyToken");
        propertyToken = await PropertyToken.deploy(
            "Test Property Token",
            "TPT",
            await identityRegistry.getAddress(),
            await compliance.getAddress(),
            propertyInfo
        );
        await propertyToken.waitForDeployment();

        // Deploy LeaseAgreement
        const LeaseAgreement = await ethers.getContractFactory("LeaseAgreement");
        leaseAgreement = await LeaseAgreement.deploy(await identityRegistry.getAddress());
        await leaseAgreement.waitForDeployment();

        // Deploy EscrowPayment
        const EscrowPayment = await ethers.getContractFactory("EscrowPayment");
        escrowPayment = await EscrowPayment.deploy(await leaseAgreement.getAddress());
        await escrowPayment.waitForDeployment();

        // Set up roles and permissions
        await identityRegistry.grantRole(REGISTRAR_ROLE, admin.address);
        await identityRegistry.grantRole(COMPLIANCE_ROLE, admin.address);
        await propertyToken.grantRole(MINTER_ROLE, admin.address);
        await leaseAgreement.grantRole(LEASE_MANAGER_ROLE, admin.address);
        
        // Bind compliance to token
        await compliance.bindToken(await propertyToken.getAddress());

        // Register and verify identities
        await identityRegistry.connect(admin).registerIdentity(landlord.address, landlord.address, 840); // US
        await identityRegistry.connect(admin).registerIdentity(tenant.address, tenant.address, 840); // US
        await identityRegistry.connect(admin).registerIdentity(investor.address, investor.address, 840); // US
        
        await identityRegistry.connect(admin).verifyIdentity(landlord.address);
        await identityRegistry.connect(admin).verifyIdentity(tenant.address);
        await identityRegistry.connect(admin).verifyIdentity(investor.address);
    });

    describe("Identity Registry", function () {
        it("Should register and verify identities", async function () {
            expect(await identityRegistry.isVerified(landlord.address)).to.be.true;
            expect(await identityRegistry.isVerified(tenant.address)).to.be.true;
            expect(await identityRegistry.investorCountry(landlord.address)).to.equal(840);
        });

        it("Should get identity details", async function () {
            const details = await identityRegistry.getIdentityDetails(landlord.address);
            expect(details.identityContract).to.equal(landlord.address);
            expect(details.country).to.equal(840);
            expect(details.verified).to.be.true;
            expect(details.exists).to.be.true;
        });
    });

    describe("Compliance Module", function () {
        it("Should check transfer compliance", async function () {
            // Should allow transfer between verified addresses
            expect(await compliance.canTransfer(landlord.address, tenant.address, 100)).to.be.true;
            
            // Should allow minting to verified address
            expect(await compliance.canTransfer(ethers.ZeroAddress, landlord.address, 100)).to.be.true;
        });

        it("Should handle token binding", async function () {
            expect(await compliance.isTokenBound(await propertyToken.getAddress())).to.be.true;
        });
    });

    describe("Property Token", function () {
        it("Should have correct initial configuration", async function () {
            expect(await propertyToken.name()).to.equal("Test Property Token");
            expect(await propertyToken.symbol()).to.equal("TPT");
            expect(await propertyToken.decimals()).to.equal(18);
        });

        it("Should mint tokens to verified addresses", async function () {
            const mintAmount = ethers.parseEther("100");
            
            await propertyToken.connect(admin).mint(landlord.address, mintAmount);
            expect(await propertyToken.balanceOf(landlord.address)).to.equal(mintAmount);
        });

        it("Should allow compliant transfers", async function () {
            const mintAmount = ethers.parseEther("100");
            const transferAmount = ethers.parseEther("50");
            
            await propertyToken.connect(admin).mint(landlord.address, mintAmount);
            await propertyToken.connect(landlord).transfer(tenant.address, transferAmount);
            
            expect(await propertyToken.balanceOf(landlord.address)).to.equal(mintAmount - transferAmount);
            expect(await propertyToken.balanceOf(tenant.address)).to.equal(transferAmount);
        });

        it("Should check transfer compliance", async function () {
            expect(await propertyToken.canTransfer(landlord.address, tenant.address, 100)).to.be.true;
        });
    });

    describe("Lease Agreement", function () {
        it("Should create a lease agreement", async function () {
            const rentAmount = ethers.parseUnits("2000", 6); // $2000 USDC
            const depositAmount = ethers.parseUnits("4000", 6); // $4000 USDC
            
            const tx = await leaseAgreement.connect(admin).createLease(
                await propertyToken.getAddress(),
                1, // property token ID
                landlord.address,
                tenant.address,
                rentAmount,
                depositAmount,
                await propertyToken.getAddress(), // using property token as payment token for simplicity
                Math.floor(Date.now() / 1000), // start date (now)
                Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // end date (1 year later)
                "123 Test Street, NYC",
                "QmTestLeaseTerms",
                ethers.keccak256(ethers.toUtf8Bytes("lease_document"))
            );

            const receipt = await tx.wait();
            
            // Check if lease was created (lease ID 1)
            const lease = await leaseAgreement.getLease(1);
            expect(lease.landlord).to.equal(landlord.address);
            expect(lease.tenant).to.equal(tenant.address);
            expect(lease.monthlyRent).to.equal(rentAmount);
        });

        it("Should track landlord and tenant leases", async function () {
            const rentAmount = ethers.parseUnits("2000", 6);
            const depositAmount = ethers.parseUnits("4000", 6);
            
            await leaseAgreement.connect(admin).createLease(
                await propertyToken.getAddress(),
                1,
                landlord.address,
                tenant.address,
                rentAmount,
                depositAmount,
                await propertyToken.getAddress(),
                Math.floor(Date.now() / 1000),
                Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60),
                "123 Test Street, NYC",
                "QmTestLeaseTerms",
                ethers.keccak256(ethers.toUtf8Bytes("lease_document"))
            );

            const landlordLeases = await leaseAgreement.getLandlordLeases(landlord.address);
            const tenantLeases = await leaseAgreement.getTenantLeases(tenant.address);
            
            expect(landlordLeases.length).to.equal(1);
            expect(tenantLeases.length).to.equal(1);
            expect(landlordLeases[0]).to.equal(1n);
            expect(tenantLeases[0]).to.equal(1n);
        });
    });

    describe("Integration Test - Full Workflow", function () {
        it("Should complete a full property tokenization and lease workflow", async function () {
            console.log("🏗️  Starting full integration test...");
            
            // Step 1: Mint property tokens to landlord
            const propertyTokens = ethers.parseEther("100");
            await propertyToken.connect(admin).mint(landlord.address, propertyTokens);
            console.log(`✅ Minted ${ethers.formatEther(propertyTokens)} property tokens to landlord`);
            
            // Step 2: Create lease agreement
            const rentAmount = ethers.parseUnits("2000", 6);
            const depositAmount = ethers.parseUnits("4000", 6);
            
            const tx = await leaseAgreement.connect(admin).createLease(
                await propertyToken.getAddress(),
                1,
                landlord.address,
                tenant.address,
                rentAmount,
                depositAmount,
                await propertyToken.getAddress(),
                Math.floor(Date.now() / 1000),
                Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60),
                "123 Integration Test St, NYC",
                "QmTestLeaseTermsIntegration",
                ethers.keccak256(ethers.toUtf8Bytes("integration_lease_document"))
            );
            
            await tx.wait();
            const lease = await leaseAgreement.getLease(1);
            console.log(`✅ Created lease agreement with ID: 1`);
            
            // Step 3: Verify lease details
            expect(lease.landlord).to.equal(landlord.address);
            expect(lease.tenant).to.equal(tenant.address);
            
            console.log("✅ Full integration test completed successfully!");
            console.log(`   - Property tokens minted: ${ethers.formatEther(propertyTokens)}`);
            console.log(`   - Lease ID created: ${lease.leaseId.toString()}`);
            console.log(`   - Monthly rent: $${ethers.formatUnits(lease.monthlyRent, 6)}`);
        });
    });
});