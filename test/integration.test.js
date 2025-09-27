const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Hackathon Platform Tests", function () {
    let identityRegistry;
    let compliance;
    let realEstateToken;
    let leaseManager;
    let mockUSDC;
    let owner, admin, landlord, tenant, investor, blacklisted;

    const MINTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE"));
    const AGENT_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("AGENT_ROLE"));
    
    // Property metadata for testing
    const propertyData = {
        name: "Luxury Downtown Apartment",
        symbol: "LDA001",
        propertyId: "PROP-001",
        location: "123 Main St, NYC",
        propertyType: "Residential",
        area: 1200,
        totalValue: ethers.utils.parseEther("500000"), // $500K
        country: 840 // US country code
    };

    beforeEach(async function () {
        [owner, admin, landlord, tenant, investor, blacklisted] = await ethers.getSigners();

        // Deploy IdentityRegistry
        const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
        identityRegistry = await IdentityRegistry.deploy();
        await identityRegistry.deployed();

        // Deploy Compliance
        const Compliance = await ethers.getContractFactory("Compliance");
        compliance = await Compliance.deploy(identityRegistry.address);
        await compliance.deployed();

        // Deploy RealEstateToken
        const RealEstateToken = await ethers.getContractFactory("RealEstateToken");
        realEstateToken = await RealEstateToken.deploy(
            propertyData.name,
            propertyData.symbol,
            identityRegistry.address,
            compliance.address,
            propertyData
        );
        await realEstateToken.deployed();

        // Deploy MockUSDC
        const MockUSDC = await ethers.getContractFactory("MockUSDC");
        mockUSDC = await MockUSDC.deploy();
        await mockUSDC.deployed();

        // Deploy LeaseManager
        const LeaseManager = await ethers.getContractFactory("LeaseManager");
        leaseManager = await LeaseManager.deploy(identityRegistry.address);
        await leaseManager.deployed();

        // Setup roles
        await realEstateToken.grantRole(MINTER_ROLE, admin.address);
        await realEstateToken.grantRole(AGENT_ROLE, admin.address);

    });

    describe("Identity Registry Tests", function () {
        it("Should allow public identity registration", async function () {
            // Anyone can register themselves
            await identityRegistry.connect(investor).registerIdentity(investor.address);
            
            // Verify registration but not yet verified
            expect(await identityRegistry.isVerified(investor.address)).to.be.false;
            
            // Admin verifies the identity
            await identityRegistry.adminVerify(investor.address, investor.address, 840);
            
            // Now should be verified
            expect(await identityRegistry.isVerified(investor.address)).to.be.true;
        });

        it("Should only allow owner to admin verify", async function () {
            await identityRegistry.connect(investor).registerIdentity(investor.address);
            
            // Non-owner cannot verify
            await expect(
                identityRegistry.connect(investor).adminVerify(investor.address, investor.address, 840)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should track country information", async function () {
            await identityRegistry.connect(investor).registerIdentity(investor.address);
            await identityRegistry.adminVerify(investor.address, investor.address, 840);
            
            expect(await identityRegistry.investorCountry(investor.address)).to.equal(840);
        });
    });

    describe("Compliance Engine Tests", function () {
        beforeEach(async function () {
            // Setup verified users
            await identityRegistry.connect(landlord).registerIdentity(landlord.address);
            await identityRegistry.adminVerify(landlord.address, landlord.address, 840);
            
            await identityRegistry.connect(tenant).registerIdentity(tenant.address);
            await identityRegistry.adminVerify(tenant.address, tenant.address, 840);
            
            await identityRegistry.connect(investor).registerIdentity(investor.address);
            await identityRegistry.adminVerify(investor.address, investor.address, 840);
        });

        it("Should validate transfers for verified addresses", async function () {
            expect(await compliance.canTransfer(
                landlord.address,
                tenant.address,
                ethers.utils.parseEther("100")
            )).to.be.true;
        });

        it("Should block transfers to blacklisted addresses", async function () {
            // Blacklist the receiver
            await compliance.addToBlacklist(tenant.address);
            
            expect(await compliance.canTransfer(
                landlord.address,
                tenant.address,
                ethers.utils.parseEther("100")
            )).to.be.false;
            
            expect(await compliance.isBlacklisted(tenant.address)).to.be.true;
        });

        it("Should block transfers to unverified addresses", async function () {
            expect(await compliance.canTransfer(
                landlord.address,
                blacklisted.address, // Not verified
                ethers.utils.parseEther("100")
            )).to.be.false;
        });

        it("Should enforce max balance restrictions", async function () {
            // Set very low max balance
            await compliance.setMaxBalancePerInvestor(ethers.utils.parseEther("50"));
            
            expect(await compliance.canTransfer(
                landlord.address,
                tenant.address,
                ethers.utils.parseEther("100") // Exceeds max balance
            )).to.be.false;
        });
    });

    describe("Real Estate Token Tests", function () {
        beforeEach(async function () {
            // Setup verified users for testing
            await identityRegistry.connect(landlord).registerIdentity(landlord.address);
            await identityRegistry.adminVerify(landlord.address, landlord.address, 840);
            
            await identityRegistry.connect(tenant).registerIdentity(tenant.address);
            await identityRegistry.adminVerify(tenant.address, tenant.address, 840);
            
            await identityRegistry.connect(investor).registerIdentity(investor.address);
            await identityRegistry.adminVerify(investor.address, investor.address, 840);
        });

        it("Should have correct initial configuration", async function () {
            expect(await realEstateToken.name()).to.equal(propertyData.name);
            expect(await realEstateToken.symbol()).to.equal(propertyData.symbol);
            expect(await realEstateToken.decimals()).to.equal(18);
            
            const asset = await realEstateToken.assetMetadata();
            expect(asset.propertyId).to.equal(propertyData.propertyId);
            expect(asset.location).to.equal(propertyData.location);
            expect(asset.totalValue).to.equal(propertyData.totalValue);
        });

        it("Should mint tokens to verified addresses only", async function () {
            const mintAmount = ethers.utils.parseEther("1000");
            
            // Should succeed for verified address
            await realEstateToken.connect(admin).mint(landlord.address, mintAmount);
            expect(await realEstateToken.balanceOf(landlord.address)).to.equal(mintAmount);
            
            // Should fail for unverified address
            await expect(
                realEstateToken.connect(admin).mint(blacklisted.address, mintAmount)
            ).to.be.revertedWith("RealEstateToken: recipient not verified");
        });

        it("Should enforce compliance on transfers", async function () {
            const mintAmount = ethers.utils.parseEther("1000");
            const transferAmount = ethers.utils.parseEther("100");
            
            await realEstateToken.connect(admin).mint(landlord.address, mintAmount);
            
            // Normal transfer should work
            await realEstateToken.connect(landlord).transfer(tenant.address, transferAmount);
            expect(await realEstateToken.balanceOf(tenant.address)).to.equal(transferAmount);
            
            // Transfer to blacklisted address should fail
            await compliance.addToBlacklist(investor.address);
            await expect(
                realEstateToken.connect(landlord).transfer(investor.address, transferAmount)
            ).to.be.revertedWith("RealEstateToken: transfer not compliant");
        });

        it("Should allow forced transfers by agents", async function () {
            const mintAmount = ethers.utils.parseEther("1000");
            const transferAmount = ethers.utils.parseEther("100");
            
            await realEstateToken.connect(admin).mint(landlord.address, mintAmount);
            
            // Blacklist the receiver to make normal transfer impossible
            await compliance.addToBlacklist(tenant.address);
            
            // Normal transfer should fail
            await expect(
                realEstateToken.connect(landlord).transfer(tenant.address, transferAmount)
            ).to.be.revertedWith("RealEstateToken: transfer not compliant");
            
            // But agent can force transfer
            await realEstateToken.connect(admin).forcedTransfer(
                landlord.address,
                tenant.address,
                transferAmount
            );
            expect(await realEstateToken.balanceOf(tenant.address)).to.equal(transferAmount);
        });

        it("Should burn tokens from verified addresses", async function () {
            const mintAmount = ethers.utils.parseEther("1000");
            const burnAmount = ethers.utils.parseEther("200");
            
            await realEstateToken.connect(admin).mint(landlord.address, mintAmount);
            await realEstateToken.connect(admin).burn(landlord.address, burnAmount);
            
            expect(await realEstateToken.balanceOf(landlord.address)).to.equal(
                mintAmount.sub(burnAmount)
            );
        });
    });

    describe("Lease Manager Tests", function () {
        let leaseId;
        const monthlyRent = ethers.utils.parseUnits("2000", 6); // $2000 USDC
        const securityDeposit = ethers.utils.parseUnits("4000", 6); // $4000 USDC
        const startDate = Math.floor(Date.now() / 1000) + 86400; // Tomorrow
        const endDate = startDate + (365 * 86400); // 1 year

        beforeEach(async function () {
            // Setup verified users
            await identityRegistry.connect(landlord).registerIdentity(landlord.address);
            await identityRegistry.adminVerify(landlord.address, landlord.address, 840);
            
            await identityRegistry.connect(tenant).registerIdentity(tenant.address);
            await identityRegistry.adminVerify(tenant.address, tenant.address, 840);
            
            // Give tenant some USDC for payments
            await mockUSDC.mint(tenant.address, ethers.utils.parseUnits("10000", 6));
        });

        it("Should create a lease agreement", async function () {
            const tx = await leaseManager.connect(landlord).createLease(
                tenant.address,
                mockUSDC.address,
                monthlyRent,
                securityDeposit,
                startDate,
                endDate,
                "Luxury Downtown Apartment - 1200 sq ft"
            );

            const receipt = await tx.wait();
            const event = receipt.events?.find(e => e.event === 'LeaseCreated');
            leaseId = event.args.leaseId;

            expect(leaseId).to.not.be.undefined;
            
            const lease = await leaseManager.getLease(leaseId);
            expect(lease.landlord).to.equal(landlord.address);
            expect(lease.tenant).to.equal(tenant.address);
            expect(lease.monthlyRent).to.equal(monthlyRent);
            expect(lease.status).to.equal(0); // CREATED
        });

        it("Should handle security deposit payment", async function () {
            // Create lease
            const tx = await leaseManager.connect(landlord).createLease(
                tenant.address,
                mockUSDC.address,
                monthlyRent,
                securityDeposit,
                startDate,
                endDate,
                "Test Property"
            );

            const receipt = await tx.wait();
            leaseId = receipt.events?.find(e => e.event === 'LeaseCreated').args.leaseId;

            // Tenant approves and pays deposit
            await mockUSDC.connect(tenant).approve(leaseManager.address, securityDeposit);
            await leaseManager.connect(tenant).paySecurityDeposit(leaseId);

            const lease = await leaseManager.getLease(leaseId);
            expect(lease.status).to.equal(1); // ACTIVE
            expect(lease.depositPaid).to.equal(securityDeposit);
        });

        it("Should handle rent payments", async function () {
            // Create and activate lease
            const tx = await leaseManager.connect(landlord).createLease(
                tenant.address,
                mockUSDC.address,
                monthlyRent,
                securityDeposit,
                startDate,
                endDate,
                "Test Property"
            );

            leaseId = (await tx.wait()).events?.find(e => e.event === 'LeaseCreated').args.leaseId;

            await mockUSDC.connect(tenant).approve(leaseManager.address, securityDeposit);
            await leaseManager.connect(tenant).paySecurityDeposit(leaseId);

            // Pay rent
            await mockUSDC.connect(tenant).approve(leaseManager.address, monthlyRent);
            
            const landlordBalanceBefore = await mockUSDC.balanceOf(landlord.address);
            await leaseManager.connect(tenant).payRent(leaseId);
            const landlordBalanceAfter = await mockUSDC.balanceOf(landlord.address);

            expect(landlordBalanceAfter.sub(landlordBalanceBefore)).to.equal(monthlyRent);
            
            const lease = await leaseManager.getLease(leaseId);
            expect(lease.totalRentPaid).to.equal(monthlyRent);
        });

        it("Should return security deposits", async function () {
            // Create and setup lease
            const tx = await leaseManager.connect(landlord).createLease(
                tenant.address,
                mockUSDC.address,
                monthlyRent,
                securityDeposit,
                startDate,
                endDate,
                "Test Property"
            );

            leaseId = (await tx.wait()).events?.find(e => e.event === 'LeaseCreated').args.leaseId;

            await mockUSDC.connect(tenant).approve(leaseManager.address, securityDeposit);
            await leaseManager.connect(tenant).paySecurityDeposit(leaseId);

            // Return full deposit
            const tenantBalanceBefore = await mockUSDC.balanceOf(tenant.address);
            await leaseManager.connect(landlord).returnDeposit(leaseId, securityDeposit);
            const tenantBalanceAfter = await mockUSDC.balanceOf(tenant.address);

            expect(tenantBalanceAfter.sub(tenantBalanceBefore)).to.equal(securityDeposit);
        });

        it("Should track landlord and tenant leases", async function () {
            const tx = await leaseManager.connect(landlord).createLease(
                tenant.address,
                mockUSDC.address,
                monthlyRent,
                securityDeposit,
                startDate,
                endDate,
                "Test Property"
            );

            const landlordLeases = await leaseManager.getLandlordLeases(landlord.address);
            const tenantLeases = await leaseManager.getTenantLeases(tenant.address);

            expect(landlordLeases.length).to.equal(1);
            expect(tenantLeases.length).to.equal(1);
        });
    });

    describe("MockUSDC Tests", function () {
        it("Should have correct configuration", async function () {
            expect(await mockUSDC.name()).to.equal("Mock USD Coin");
            expect(await mockUSDC.symbol()).to.equal("MockUSDC");
            expect(await mockUSDC.decimals()).to.equal(6);
        });

        it("Should allow faucet usage", async function () {
            const balanceBefore = await mockUSDC.balanceOf(investor.address);
            
            await mockUSDC.connect(investor).faucet();
            
            const balanceAfter = await mockUSDC.balanceOf(investor.address);
            const faucetAmount = ethers.utils.parseUnits("1000", 6);
            
            expect(balanceAfter.sub(balanceBefore)).to.equal(faucetAmount);
        });

        it("Should enforce faucet cooldown", async function () {
            await mockUSDC.connect(investor).faucet();
            
            await expect(
                mockUSDC.connect(investor).faucet()
            ).to.be.revertedWith("MockUSDC: faucet cooldown active");
        });

        it("Should allow owner minting", async function () {
            const mintAmount = ethers.utils.parseUnits("5000", 6);
            
            await mockUSDC.mint(investor.address, mintAmount);
            
            expect(await mockUSDC.balanceOf(investor.address)).to.equal(mintAmount);
        });
    });

    describe("End-to-End Integration Test", function () {
        it("Should complete full platform workflow", async function () {
            console.log("🚀 Starting full platform integration test...");

            // Step 1: Register and verify identities
            console.log("   Step 1: Identity registration and verification");
            await identityRegistry.connect(landlord).registerIdentity(landlord.address);
            await identityRegistry.adminVerify(landlord.address, landlord.address, 840);
            
            await identityRegistry.connect(tenant).registerIdentity(tenant.address);
            await identityRegistry.adminVerify(tenant.address, tenant.address, 840);
            
            expect(await identityRegistry.isVerified(landlord.address)).to.be.true;
            expect(await identityRegistry.isVerified(tenant.address)).to.be.true;

            // Step 2: Mint property tokens to landlord
            console.log("   Step 2: Property tokenization");
            const propertyTokens = ethers.utils.parseEther("1000"); // 1000 tokens representing property ownership
            await realEstateToken.connect(admin).mint(landlord.address, propertyTokens);
            expect(await realEstateToken.balanceOf(landlord.address)).to.equal(propertyTokens);

            // Step 3: Setup payment tokens
            console.log("   Step 3: Payment token setup");
            await mockUSDC.mint(tenant.address, ethers.utils.parseUnits("15000", 6)); // $15K for deposits and rent

            // Step 4: Create lease agreement
            console.log("   Step 4: Lease creation and activation");
            const monthlyRent = ethers.utils.parseUnits("2500", 6); // $2500/month
            const securityDeposit = ethers.utils.parseUnits("5000", 6); // $5000 deposit
            const startDate = Math.floor(Date.now() / 1000) + 86400;
            const endDate = startDate + (365 * 86400);

            const tx = await leaseManager.connect(landlord).createLease(
                tenant.address,
                mockUSDC.address,
                monthlyRent,
                securityDeposit,
                startDate,
                endDate,
                "Premium Downtown Apartment - 1200 sq ft, 2 bed/2 bath"
            );

            const receipt = await tx.wait();
            const leaseId = receipt.events?.find(e => e.event === 'LeaseCreated').args.leaseId;

            // Step 5: Activate lease with security deposit
            await mockUSDC.connect(tenant).approve(leaseManager.address, securityDeposit);
            await leaseManager.connect(tenant).paySecurityDeposit(leaseId);

            const lease = await leaseManager.getLease(leaseId);
            expect(lease.status).to.equal(1); // ACTIVE

            // Step 6: Make rent payment
            console.log("   Step 5: Rent payment processing");
            const landlordBalanceBefore = await mockUSDC.balanceOf(landlord.address);
            await mockUSDC.connect(tenant).approve(leaseManager.address, monthlyRent);
            await leaseManager.connect(tenant).payRent(leaseId);
            const landlordBalanceAfter = await mockUSDC.balanceOf(landlord.address);

            expect(landlordBalanceAfter.sub(landlordBalanceBefore)).to.equal(monthlyRent);

            // Step 7: Test compliance enforcement
            console.log("   Step 6: Compliance enforcement testing");
            await compliance.addToBlacklist(tenant.address);
            
            await expect(
                realEstateToken.connect(landlord).transfer(tenant.address, ethers.utils.parseEther("10"))
            ).to.be.revertedWith("RealEstateToken: transfer not compliant");

            // But agent can still force transfer if needed
            await realEstateToken.connect(admin).forcedTransfer(
                landlord.address,
                tenant.address,
                ethers.utils.parseEther("5")
            );

            console.log("✅ Full integration test completed successfully!");
            console.log(`   🏠 Property tokens minted: ${ethers.utils.formatEther(propertyTokens)}`);
            console.log(`   📋 Lease ID: ${leaseId.toString()}`);
            console.log(`   💰 Monthly rent: $${ethers.utils.formatUnits(monthlyRent, 6)}`);
            console.log(`   🔒 Security deposit: $${ethers.utils.formatUnits(securityDeposit, 6)}`);
            console.log(`   ✅ Rent payment processed successfully`);
            console.log(`   🚫 Compliance enforcement working`);
            console.log(`   🔧 Forced transfer capability confirmed`);
        });
    });
});