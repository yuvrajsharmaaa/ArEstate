// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IIdentityRegistry.sol";

/**
 * @title DynamicLeaseManager
 * @dev Advanced lease management with dynamic terms and flexible configurations
 * @notice Purpose: Handle complex lease scenarios with variable terms, escalations, and automated features
 * 
 * Dynamic Features:
 * - Variable rent schedules with automatic escalations
 * - Flexible payment frequencies (monthly, quarterly, annually)
 * - Dynamic security deposit calculations
 * - Rent-to-own conversions
 * - Automated lease renewals
 * - Performance-based rent adjustments
 * - Multi-party lease agreements
 */
contract DynamicLeaseManager is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // Role definitions
    bytes32 public constant LEASE_MANAGER_ROLE = keccak256("LEASE_MANAGER_ROLE");
    bytes32 public constant PROPERTY_MANAGER_ROLE = keccak256("PROPERTY_MANAGER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    
    // Identity registry for KYC verification
    IIdentityRegistry public immutable identityRegistry;
    
    // Lease status enumeration
    enum LeaseStatus {
        DRAFT,          // Lease created but not active
        ACTIVE,         // Lease is active and running
        PAUSED,         // Lease temporarily paused
        RENEWAL,        // In renewal process
        COMPLETED,      // Lease completed normally
        TERMINATED,     // Early termination
        DEFAULTED,      // Tenant in default
        CONVERTING      // Converting to ownership
    }
    
    // Payment frequency options
    enum PaymentFrequency {
        MONTHLY,
        QUARTERLY,
        SEMI_ANNUALLY,
        ANNUALLY,
        CUSTOM
    }
    
    // Rent adjustment types
    enum RentAdjustmentType {
        FIXED,              // Fixed rent amount
        PERCENTAGE,         // Percentage increase
        MARKET_RATE,        // Based on market data
        PERFORMANCE,        // Based on property performance
        CPI_INDEXED        // Consumer Price Index linked
    }
    
    // Dynamic lease terms
    struct LeaseTerms {
        PaymentFrequency paymentFrequency;      // How often rent is paid
        uint256 customPaymentDays;              // Days for custom frequency
        RentAdjustmentType adjustmentType;      // Type of rent adjustment
        uint256 adjustmentRate;                 // Rate for adjustments (basis points)
        uint256 adjustmentInterval;             // How often adjustments happen (seconds)
        bool autoRenewal;                       // Automatic lease renewal
        uint256 renewalTerms;                   // Length of renewal period
        bool rentToOwnOption;                   // Rent-to-own conversion available
        uint256 ownershipConversionRate;        // Conversion rate (basis points)
        uint256 maxRentIncrease;               // Max rent increase per adjustment (basis points)
        uint256 gracePeriod;                   // Grace period for late payments
        bool earlyTerminationAllowed;          // Early termination permitted
        uint256 earlyTerminationPenalty;       // Penalty for early termination
    }
    
    // Lease structure with dynamic features
    struct DynamicLease {
        uint256 leaseId;                    // Unique identifier
        address landlord;                   // Property owner
        address tenant;                     // Primary tenant
        address[] coTenants;                // Additional tenants
        IERC20 paymentToken;               // Payment token
        uint256 baseRent;                  // Base rent amount
        uint256 currentRent;               // Current rent (may differ from base due to adjustments)
        uint256 securityDeposit;           // Security deposit amount
        uint256 startDate;                 // Lease start
        uint256 endDate;                   // Lease end
        uint256 nextPaymentDue;            // Next payment due date
        uint256 nextAdjustmentDate;        // Next rent adjustment date
        LeaseStatus status;                // Current status
        LeaseTerms terms;                  // Dynamic terms
        string propertyMetadata;           // Property details/IPFS CID
        uint256 totalPaid;                 // Total amount paid
        uint256 paymentsMissed;            // Number of missed payments
        uint256 ownershipPercentage;       // Percentage owned (for rent-to-own)
        bool isRentToOwn;                  // Currently in rent-to-own mode
    }
    
    // Payment schedule entry
    struct PaymentSchedule {
        uint256 dueDate;
        uint256 amount;
        bool isPaid;
        uint256 paidDate;
        uint256 paidAmount;
    }
    
    // Storage
    mapping(uint256 => DynamicLease) public leases;
    mapping(uint256 => PaymentSchedule[]) public paymentSchedules;
    mapping(address => uint256[]) public landlordLeases;
    mapping(address => uint256[]) public tenantLeases;
    mapping(address => bool) public approvedTokens;
    mapping(uint256 => mapping(address => bool)) public authorizedManagers; // leaseId => manager => authorized
    
    // Market data for dynamic pricing (could be updated by oracles)
    mapping(string => uint256) public marketRates; // location => rate per sqft
    mapping(string => uint256) public cpiIndex;    // region => CPI value
    
    uint256 private _nextLeaseId = 1;
    
    // Events
    event DynamicLeaseCreated(
        uint256 indexed leaseId,
        address indexed landlord,
        address indexed tenant,
        uint256 baseRent,
        PaymentFrequency frequency
    );
    
    event RentAdjusted(
        uint256 indexed leaseId,
        uint256 oldRent,
        uint256 newRent,
        RentAdjustmentType adjustmentType
    );
    
    event PaymentScheduleGenerated(
        uint256 indexed leaseId,
        uint256 numberOfPayments
    );
    
    event RentToOwnActivated(
        uint256 indexed leaseId,
        uint256 ownershipPercentage
    );
    
    event LeaseRenewed(
        uint256 indexed leaseId,
        uint256 newEndDate,
        uint256 newRent
    );
    
    event CoTenantAdded(
        uint256 indexed leaseId,
        address indexed coTenant
    );
    
    event MarketRateUpdated(
        string indexed location,
        uint256 newRate
    );
    
    constructor(address _identityRegistry) {
        require(_identityRegistry != address(0), "DynamicLeaseManager: invalid identity registry");
        
        identityRegistry = IIdentityRegistry(_identityRegistry);
        
        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(LEASE_MANAGER_ROLE, msg.sender);
        _grantRole(PROPERTY_MANAGER_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
    }
    
    /**
     * @dev Create a dynamic lease with flexible terms
     * @param _tenant Primary tenant address
     * @param _paymentToken Payment token contract
     * @param _baseRent Base rent amount
     * @param _securityDeposit Security deposit
     * @param _startDate Lease start date
     * @param _endDate Lease end date
     * @param _terms Dynamic lease terms
     * @param _propertyMetadata Property metadata
     * @return uint256 Lease ID
     */
    function createDynamicLease(
        address _tenant,
        IERC20 _paymentToken,
        uint256 _baseRent,
        uint256 _securityDeposit,
        uint256 _startDate,
        uint256 _endDate,
        LeaseTerms memory _terms,
        string memory _propertyMetadata
    ) external nonReentrant onlyRole(LEASE_MANAGER_ROLE) returns (uint256) {
        require(_tenant != address(0), "DynamicLeaseManager: invalid tenant");
        require(_tenant != msg.sender, "DynamicLeaseManager: landlord cannot be tenant");
        require(approvedTokens[address(_paymentToken)], "DynamicLeaseManager: token not approved");
        require(_baseRent > 0, "DynamicLeaseManager: rent must be positive");
        require(_startDate >= block.timestamp, "DynamicLeaseManager: start date in past");
        require(_endDate > _startDate, "DynamicLeaseManager: invalid lease period");
        
        // Verify identity compliance
        require(identityRegistry.isVerified(msg.sender), "DynamicLeaseManager: landlord not verified");
        require(identityRegistry.isVerified(_tenant), "DynamicLeaseManager: tenant not verified");
        
        uint256 leaseId = _nextLeaseId++;
        
        // Calculate first payment due date based on frequency
        uint256 nextPayment = _calculateNextPaymentDate(_startDate, _terms.paymentFrequency, _terms.customPaymentDays);
        uint256 nextAdjustment = _terms.adjustmentInterval > 0 ? _startDate + _terms.adjustmentInterval : 0;
        
        // Create lease
        DynamicLease storage lease = leases[leaseId];
        lease.leaseId = leaseId;
        lease.landlord = msg.sender;
        lease.tenant = _tenant;
        lease.paymentToken = _paymentToken;
        lease.baseRent = _baseRent;
        lease.currentRent = _baseRent;
        lease.securityDeposit = _securityDeposit;
        lease.startDate = _startDate;
        lease.endDate = _endDate;
        lease.nextPaymentDue = nextPayment;
        lease.nextAdjustmentDate = nextAdjustment;
        lease.status = LeaseStatus.DRAFT;
        lease.terms = _terms;
        lease.propertyMetadata = _propertyMetadata;
        lease.totalPaid = 0;
        lease.paymentsMissed = 0;
        lease.ownershipPercentage = 0;
        lease.isRentToOwn = false;
        
        // Track leases
        landlordLeases[msg.sender].push(leaseId);
        tenantLeases[_tenant].push(leaseId);
        
        // Generate initial payment schedule
        _generatePaymentSchedule(leaseId);
        
        emit DynamicLeaseCreated(leaseId, msg.sender, _tenant, _baseRent, _terms.paymentFrequency);
        
        return leaseId;
    }
    
    /**
     * @dev Activate lease after security deposit is paid
     * @param leaseId The lease ID
     */
    function activateLease(uint256 leaseId) external nonReentrant {
        DynamicLease storage lease = leases[leaseId];
        require(lease.landlord != address(0), "DynamicLeaseManager: lease not found");
        require(msg.sender == lease.tenant, "DynamicLeaseManager: only tenant can activate");
        require(lease.status == LeaseStatus.DRAFT, "DynamicLeaseManager: invalid status");
        
        // Transfer security deposit
        lease.paymentToken.safeTransferFrom(msg.sender, address(this), lease.securityDeposit);
        
        lease.status = LeaseStatus.ACTIVE;
        emit LeaseStatusChanged(leaseId, LeaseStatus.DRAFT, LeaseStatus.ACTIVE);
    }
    
    /**
     * @dev Pay rent with automatic rent-to-own conversion tracking
     * @param leaseId The lease ID
     */
    function payRent(uint256 leaseId) external nonReentrant {
        DynamicLease storage lease = leases[leaseId];
        require(lease.landlord != address(0), "DynamicLeaseManager: lease not found");
        require(msg.sender == lease.tenant || _isCoTenant(leaseId, msg.sender), "DynamicLeaseManager: unauthorized");
        require(lease.status == LeaseStatus.ACTIVE, "DynamicLeaseManager: lease not active");
        
        uint256 rentAmount = lease.currentRent;
        
        // Transfer rent to landlord
        lease.paymentToken.safeTransferFrom(msg.sender, lease.landlord, rentAmount);
        
        // Update lease state
        lease.totalPaid += rentAmount;
        lease.nextPaymentDue = _calculateNextPaymentDate(
            lease.nextPaymentDue, 
            lease.terms.paymentFrequency, 
            lease.terms.customPaymentDays
        );
        
        // Handle rent-to-own conversion
        if (lease.terms.rentToOwnOption && lease.isRentToOwn) {
            uint256 ownershipIncrease = (rentAmount * lease.terms.ownershipConversionRate) / 10000;
            lease.ownershipPercentage += ownershipIncrease;
            
            // Check if full ownership achieved
            if (lease.ownershipPercentage >= 10000) { // 100% in basis points
                lease.status = LeaseStatus.CONVERTING;
                emit RentToOwnActivated(leaseId, lease.ownershipPercentage);
            }
        }
        
        emit RentPaid(leaseId, msg.sender, rentAmount, block.timestamp);
    }
    
    /**
     * @dev Adjust rent based on dynamic terms
     * @param leaseId The lease ID
     */
    function adjustRent(uint256 leaseId) external {
        DynamicLease storage lease = leases[leaseId];
        require(lease.landlord != address(0), "DynamicLeaseManager: lease not found");
        require(lease.status == LeaseStatus.ACTIVE, "DynamicLeaseManager: lease not active");
        require(block.timestamp >= lease.nextAdjustmentDate, "DynamicLeaseManager: adjustment not due");
        
        uint256 oldRent = lease.currentRent;
        uint256 newRent = _calculateRentAdjustment(leaseId);
        
        // Ensure adjustment doesn't exceed maximum
        uint256 maxIncrease = (oldRent * lease.terms.maxRentIncrease) / 10000;
        if (newRent > oldRent + maxIncrease) {
            newRent = oldRent + maxIncrease;
        }
        
        lease.currentRent = newRent;
        lease.nextAdjustmentDate = block.timestamp + lease.terms.adjustmentInterval;
        
        // Regenerate payment schedule with new rent
        _generatePaymentSchedule(leaseId);
        
        emit RentAdjusted(leaseId, oldRent, newRent, lease.terms.adjustmentType);
    }
    
    /**
     * @dev Activate rent-to-own option
     * @param leaseId The lease ID
     */
    function activateRentToOwn(uint256 leaseId) external {
        DynamicLease storage lease = leases[leaseId];
        require(lease.landlord != address(0), "DynamicLeaseManager: lease not found");
        require(msg.sender == lease.tenant, "DynamicLeaseManager: only tenant can activate");
        require(lease.terms.rentToOwnOption, "DynamicLeaseManager: rent-to-own not available");
        require(!lease.isRentToOwn, "DynamicLeaseManager: already activated");
        
        lease.isRentToOwn = true;
        emit RentToOwnActivated(leaseId, 0);
    }
    
    /**
     * @dev Add co-tenant to lease
     * @param leaseId The lease ID
     * @param coTenant Co-tenant address
     */
    function addCoTenant(uint256 leaseId, address coTenant) external {
        DynamicLease storage lease = leases[leaseId];
        require(lease.landlord != address(0), "DynamicLeaseManager: lease not found");
        require(msg.sender == lease.landlord, "DynamicLeaseManager: only landlord can add");
        require(identityRegistry.isVerified(coTenant), "DynamicLeaseManager: co-tenant not verified");
        
        lease.coTenants.push(coTenant);
        tenantLeases[coTenant].push(leaseId);
        
        emit CoTenantAdded(leaseId, coTenant);
    }
    
    /**
     * @dev Update market rates (Oracle function)
     * @param location Location identifier
     * @param newRate New market rate
     */
    function updateMarketRate(string memory location, uint256 newRate) external onlyRole(ORACLE_ROLE) {
        marketRates[location] = newRate;
        emit MarketRateUpdated(location, newRate);
    }
    
    /**
     * @dev Auto-renew lease if enabled
     * @param leaseId The lease ID
     */
    function autoRenewLease(uint256 leaseId) external {
        DynamicLease storage lease = leases[leaseId];
        require(lease.landlord != address(0), "DynamicLeaseManager: lease not found");
        require(lease.terms.autoRenewal, "DynamicLeaseManager: auto-renewal not enabled");
        require(block.timestamp >= lease.endDate, "DynamicLeaseManager: lease not expired");
        require(lease.status == LeaseStatus.ACTIVE, "DynamicLeaseManager: lease not active");
        
        // Renew lease
        lease.endDate = lease.endDate + lease.terms.renewalTerms;
        lease.status = LeaseStatus.RENEWAL;
        
        // Regenerate payment schedule for renewal period
        _generatePaymentSchedule(leaseId);
        
        emit LeaseRenewed(leaseId, lease.endDate, lease.currentRent);
    }
    
    // Internal functions
    function _calculateNextPaymentDate(uint256 currentDate, PaymentFrequency frequency, uint256 customDays) internal pure returns (uint256) {
        if (frequency == PaymentFrequency.MONTHLY) {
            return currentDate + 30 days;
        } else if (frequency == PaymentFrequency.QUARTERLY) {
            return currentDate + 90 days;
        } else if (frequency == PaymentFrequency.SEMI_ANNUALLY) {
            return currentDate + 180 days;
        } else if (frequency == PaymentFrequency.ANNUALLY) {
            return currentDate + 365 days;
        } else {
            return currentDate + (customDays * 1 days);
        }
    }
    
    function _calculateRentAdjustment(uint256 leaseId) internal view returns (uint256) {
        DynamicLease memory lease = leases[leaseId];
        
        if (lease.terms.adjustmentType == RentAdjustmentType.FIXED) {
            return lease.currentRent; // No change
        } else if (lease.terms.adjustmentType == RentAdjustmentType.PERCENTAGE) {
            return lease.currentRent + (lease.currentRent * lease.terms.adjustmentRate) / 10000;
        } else if (lease.terms.adjustmentType == RentAdjustmentType.MARKET_RATE) {
            // Simplified market rate adjustment
            return lease.currentRent + (lease.currentRent * lease.terms.adjustmentRate) / 10000;
        } else if (lease.terms.adjustmentType == RentAdjustmentType.PERFORMANCE) {
            // Performance-based adjustment (simplified)
            return lease.currentRent + (lease.currentRent * lease.terms.adjustmentRate) / 10000;
        } else {
            // CPI_INDEXED or default
            return lease.currentRent + (lease.currentRent * lease.terms.adjustmentRate) / 10000;
        }
    }
    
    function _generatePaymentSchedule(uint256 leaseId) internal {
        DynamicLease memory lease = leases[leaseId];
        
        // Clear existing schedule
        delete paymentSchedules[leaseId];
        
        uint256 currentDate = lease.nextPaymentDue;
        uint256 paymentCount = 0;
        
        while (currentDate <= lease.endDate && paymentCount < 120) { // Max 120 payments (10 years monthly)
            PaymentSchedule memory payment = PaymentSchedule({
                dueDate: currentDate,
                amount: lease.currentRent,
                isPaid: false,
                paidDate: 0,
                paidAmount: 0
            });
            
            paymentSchedules[leaseId].push(payment);
            
            currentDate = _calculateNextPaymentDate(currentDate, lease.terms.paymentFrequency, lease.terms.customPaymentDays);
            paymentCount++;
        }
        
        emit PaymentScheduleGenerated(leaseId, paymentCount);
    }
    
    function _isCoTenant(uint256 leaseId, address user) internal view returns (bool) {
        DynamicLease memory lease = leases[leaseId];
        for (uint256 i = 0; i < lease.coTenants.length; i++) {
            if (lease.coTenants[i] == user) {
                return true;
            }
        }
        return false;
    }
    
    // View functions
    function getDynamicLease(uint256 leaseId) external view returns (DynamicLease memory) {
        return leases[leaseId];
    }
    
    function getPaymentSchedule(uint256 leaseId) external view returns (PaymentSchedule[] memory) {
        return paymentSchedules[leaseId];
    }
    
    function isPaymentDue(uint256 leaseId) external view returns (bool) {
        DynamicLease memory lease = leases[leaseId];
        return block.timestamp >= lease.nextPaymentDue && lease.status == LeaseStatus.ACTIVE;
    }
    
    // Events (additional)
    event LeaseStatusChanged(uint256 indexed leaseId, LeaseStatus oldStatus, LeaseStatus newStatus);
    event RentPaid(uint256 indexed leaseId, address indexed payer, uint256 amount, uint256 timestamp);
    
    // Admin functions
    function addApprovedToken(address token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        approvedTokens[token] = true;
    }
    
    function removeApprovedToken(address token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        approvedTokens[token] = false;
    }
}