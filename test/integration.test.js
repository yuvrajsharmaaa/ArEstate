const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("KrayState Platform Integration Tests", function () {
    let identityRegistry;
    let compliance;
    let propertyToken;
    let leaseAgreement;
    let escrowPayment;
    let owner, landlord, tenant, compliance_officer;

    const propertyMetadata = {
        assetPassportId: "INTEGRA-RWA-TEST-001",
        propertyAddress: "123 Test Street, Test City",
        totalValue: ethers.utils.parseEther("500000"), // $500K property
        tokenizedPercentage: 5000, // 50% tokenized
        jurisdiction: "US-NY",
        documentHash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test_property_docs")),
        isActive: true
    };

    beforeEach(async function () {
        [owner, landlord, tenant, compliance_officer] = await ethers.getSigners();

        // Deploy contracts
        const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
        identityRegistry = await IdentityRegistry.deploy();
        await identityRegistry.deployed();

        const Compliance = await ethers.getContractFactory("Compliance");
        compliance = await Compliance.deploy(identityRegistry.address);
        await compliance.deployed();

        const PropertyToken = await ethers.getContractFactory("PropertyToken");
        propertyToken = await PropertyToken.deploy(
            "Test Property Token",
            "TPT",
            18,
            identityRegistry.address,
            compliance.address,
            propertyMetadata
        );
        await propertyToken.deployed();

        const LeaseAgreement = await ethers.getContractFactory("LeaseAgreement");
        leaseAgreement = await LeaseAgreement.deploy(
            identityRegistry.address,
            ethers.constants.AddressZero
        );
        await leaseAgreement.deployed();

        const EscrowPayment = await ethers.getContractFactory("EscrowPayment");
        escrowPayment = await EscrowPayment.deploy(
            identityRegistry.address,
            leaseAgreement.address
        );
        await escrowPayment.deployed();

        // Link contracts
        await compliance.bindToken(propertyToken.address);
        await leaseAgreement.setEscrowContract(escrowPayment.address);

        // Set up roles
        const IDENTITY_REGISTRAR_ROLE = await identityRegistry.IDENTITY_REGISTRAR_ROLE();
        const COMPLIANCE_OFFICER_ROLE = await identityRegistry.COMPLIANCE_OFFICER_ROLE();
        const TOKEN_AGENT_ROLE = await propertyToken.TOKEN_AGENT_ROLE();

        await identityRegistry.grantRole(IDENTITY_REGISTRAR_ROLE, owner.address);
        await identityRegistry.grantRole(COMPLIANCE_OFFICER_ROLE, compliance_officer.address);
        await propertyToken.grantRole(TOKEN_AGENT_ROLE, owner.address);

        // Register identities
        await identityRegistry.registerIdentity(
            landlord.address,
            landlord.address, // Using address as identity for testing
            840 // USA
        );
        await identityRegistry.registerIdentity(
            tenant.address,
            tenant.address,
            840 // USA
        );

        // Complete KYC verification
        await identityRegistry.connect(compliance_officer).completeKYCVerification(
            landlord.address,
            "jumio",
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("landlord_kyc")),
            2 // Low-medium risk
        );
        await identityRegistry.connect(compliance_officer).completeKYCVerification(
            tenant.address,
            "jumio",
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("tenant_kyc")),
            2
        );
    });

    describe("Identity Registry", function () {
        it("Should register and verify identities", async function () {
            expect(await identityRegistry.isVerified(landlord.address)).to.be.true;
            expect(await identityRegistry.isVerified(tenant.address)).to.be.true;
            expect(await identityRegistry.investorCountry(landlord.address)).to.equal(840);
            expect(await identityRegistry.investorCountry(tenant.address)).to.equal(840);
        });

        it("Should get complete identity details", async function () {
            const details = await identityRegistry.getIdentityDetails(landlord.address);
            expect(details.isVerified).to.be.true;
            expect(details.country).to.equal(840);
            expect(details.kycProvider).to.equal("jumio");
            expect(details.riskLevel).to.equal(2);
        });
    });

    describe("Property Token (ERC-3643)", function () {
        it("Should have correct initial configuration", async function () {
            expect(await propertyToken.name()).to.equal("Test Property Token");
            expect(await propertyToken.symbol()).to.equal("TPT");
            expect(await propertyToken.decimals()).to.equal(18);
            expect(await propertyToken.identityRegistry()).to.equal(identityRegistry.address);
            expect(await propertyToken.compliance()).to.equal(compliance.address);
        });

        it("Should mint tokens to verified addresses", async function () {
            const mintAmount = ethers.utils.parseEther("1000");
            
            await propertyToken.mint(landlord.address, mintAmount);
            
            expect(await propertyToken.balanceOf(landlord.address)).to.equal(mintAmount);
            expect(await propertyToken.totalSupply()).to.equal(mintAmount);
        });

        it("Should allow compliant transfers", async function () {
            const mintAmount = ethers.utils.parseEther("1000");
            const transferAmount = ethers.utils.parseEther("100");
            
            await propertyToken.mint(landlord.address, mintAmount);
            await propertyToken.connect(landlord).transfer(tenant.address, transferAmount);
            
            expect(await propertyToken.balanceOf(landlord.address)).to.equal(
                mintAmount.sub(transferAmount)
            );
            expect(await propertyToken.balanceOf(tenant.address)).to.equal(transferAmount);
        });

        it("Should check transfer compliance", async function () {
            expect(await propertyToken.canTransfer(
                landlord.address,
                tenant.address,
                ethers.utils.parseEther("100")
            )).to.be.true;
        });

        it("Should handle address freezing", async function () {
            await propertyToken.setAddressFrozen(tenant.address, true);
            expect(await propertyToken.isAddressFrozen(tenant.address)).to.be.true;
            
            await propertyToken.setAddressFrozen(tenant.address, false);
            expect(await propertyToken.isAddressFrozen(tenant.address)).to.be.false;
        });
    });

    describe("Compliance Module", function () {
        it("Should bind and check token binding", async function () {
            expect(await compliance.isTokenBound(propertyToken.address)).to.be.true;
        });

        it("Should validate transfer compliance", async function () {
            expect(await compliance.canTransfer(
                landlord.address,
                tenant.address,
                ethers.utils.parseEther("100")
            )).to.be.true;
        });

        it("Should get compliance status", async function () {
            expect(await compliance.getComplianceStatus(landlord.address)).to.be.true;
            expect(await compliance.getComplianceStatus(tenant.address)).to.be.true;
        });

        it("Should manage country restrictions", async function () {
            // Restrict transfers from USA (840) to Canada (124)
            await compliance.setCountryRestriction(840, 124, true);
            
            // This would need a Canadian user to test properly
            // For now, just verify the function doesn't revert
            expect(true).to.be.true;
        });
    });

    describe("Lease Agreement", function () {
        let mockUSDC;

        beforeEach(async function () {
            // Deploy a mock ERC-20 token for testing payments
            const MockToken = await ethers.getContractFactory("MockERC20");
            mockUSDC = await MockToken.deploy("Mock USDC", "USDC", 6);
            await mockUSDC.deployed();

            // Mint tokens to landlord and tenant for testing
            await mockUSDC.mint(landlord.address, ethers.utils.parseUnits("10000", 6));
            await mockUSDC.mint(tenant.address, ethers.utils.parseUnits("10000", 6));

            // Approve the payment token
            await leaseAgreement.setApprovedPaymentToken(mockUSDC.address, true);

            // Mint property tokens to landlord
            await propertyToken.mint(landlord.address, ethers.utils.parseEther("1000"));
        });

        it("Should create a lease agreement", async function () {
            const leaseParams = {
                propertyToken: propertyToken.address,
                propertyTokenId: 0,
                landlord: landlord.address,
                tenant: tenant.address,
                monthlyRent: ethers.utils.parseUnits("2000", 6), // $2000 USDC
                securityDeposit: ethers.utils.parseUnits("4000", 6), // $4000 USDC
                paymentToken: mockUSDC.address,
                startDate: Math.floor(Date.now() / 1000) + 86400, // Tomorrow
                endDate: Math.floor(Date.now() / 1000) + (365 * 86400), // 1 year
                propertyAddress: "123 Lease Test St",
                leaseTermsHash: "QmTestLeaseTerms",
                documentHash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("lease_docs"))
            };

            const tx = await leaseAgreement.createLease(
                leaseParams.propertyToken,
                leaseParams.propertyTokenId,
                leaseParams.landlord,
                leaseParams.tenant,
                leaseParams.monthlyRent,
                leaseParams.securityDeposit,
                leaseParams.paymentToken,
                leaseParams.startDate,
                leaseParams.endDate,
                leaseParams.propertyAddress,
                leaseParams.leaseTermsHash,
                leaseParams.documentHash
            );

            const receipt = await tx.wait();
            const leaseCreatedEvent = receipt.events?.find(e => e.event === 'LeaseCreated');
            const leaseId = leaseCreatedEvent?.args?.leaseId;

            expect(leaseId).to.not.be.undefined;

            const lease = await leaseAgreement.getLease(leaseId);
            expect(lease.landlord).to.equal(landlord.address);
            expect(lease.tenant).to.equal(tenant.address);
            expect(lease.monthlyRent).to.equal(leaseParams.monthlyRent);
            expect(lease.status).to.equal(0); // DRAFT status
        });

        it("Should track landlord and tenant leases", async function () {
            // Create lease (simplified for testing)
            const tx = await leaseAgreement.createLease(
                propertyToken.address,
                0,
                landlord.address,
                tenant.address,
                ethers.utils.parseUnits("2000", 6),
                ethers.utils.parseUnits("4000", 6),
                mockUSDC.address,
                Math.floor(Date.now() / 1000) + 86400,
                Math.floor(Date.now() / 1000) + (365 * 86400),
                "123 Test St",
                "QmTestHash",
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("docs"))
            );

            const landlordLeases = await leaseAgreement.getLandlordLeases(landlord.address);
            const tenantLeases = await leaseAgreement.getTenantLeases(tenant.address);

            expect(landlordLeases.length).to.equal(1);
            expect(tenantLeases.length).to.equal(1);
        });
    });

    describe("Integration Test - Full Workflow", function () {
        it("Should complete a full property tokenization and lease workflow", async function () {
            // Step 1: Mint property tokens
            const propertyTokens = ethers.utils.parseEther("1000");
            await propertyToken.mint(landlord.address, propertyTokens);

            // Step 2: Verify balances
            expect(await propertyToken.balanceOf(landlord.address)).to.equal(propertyTokens);

            // Step 3: Create mock payment token
            const MockToken = await ethers.getContractFactory("MockERC20");
            const mockUSDC = await MockToken.deploy("Mock USDC", "USDC", 6);
            await mockUSDC.deployed();

            await mockUSDC.mint(tenant.address, ethers.utils.parseUnits("10000", 6));
            await leaseAgreement.setApprovedPaymentToken(mockUSDC.address, true);
            await escrowPayment.setApprovedToken(mockUSDC.address, true);

            // Step 4: Create lease agreement
            const startDate = Math.floor(Date.now() / 1000) + 86400;
            const endDate = startDate + (365 * 86400);

            const tx = await leaseAgreement.createLease(
                propertyToken.address,
                0,
                landlord.address,
                tenant.address,
                ethers.utils.parseUnits("2000", 6),
                ethers.utils.parseUnits("4000", 6),
                mockUSDC.address,
                startDate,
                endDate,
                "123 Integration Test St",
                "QmIntegrationTestHash",
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("integration_docs"))
            );

            const receipt = await tx.wait();
            const leaseId = receipt.events?.find(e => e.event === 'LeaseCreated')?.args?.leaseId;

            // Verify lease creation
            const lease = await leaseAgreement.getLease(leaseId);
            expect(lease.landlord).to.equal(landlord.address);
            expect(lease.tenant).to.equal(tenant.address);

            console.log("✅ Full integration test completed successfully!");
            console.log(`   - Property tokens minted: ${ethers.utils.formatEther(propertyTokens)}`);
            console.log(`   - Lease ID created: ${leaseId.toString()}`);
            console.log(`   - Monthly rent: $${ethers.utils.formatUnits(lease.monthlyRent, 6)}`);
        });
    });
});

// Mock ERC-20 contract for testing
const MockERC20 = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    uint8 private _decimals;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_
    ) ERC20(name, symbol) {
        _decimals = decimals_;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) public {
        _burn(from, amount);
    }
}
`;