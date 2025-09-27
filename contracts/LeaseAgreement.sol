// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/IERC3643.sol";
import "./interfaces/IIdentityRegistry.sol";

/**
 * @title LeaseAgreement
 * @dev Smart contract for managing lease agreements with tokenized properties
 * Handles lease terms, rent tracking, payments, and dispute resolution
 */
contract LeaseAgreement is AccessControl, ReentrancyGuard, Pausable {
    
    // Roles
    bytes32 public constant LEASE_MANAGER_ROLE = keccak256("LEASE_MANAGER_ROLE");
    bytes32 public constant DISPUTE_RESOLVER_ROLE = keccak256("DISPUTE_RESOLVER_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    
    // Lease status enumeration
    enum LeaseStatus {
        DRAFT,          // Lease terms being negotiated
        ACTIVE,         // Lease is active and rent due
        DEFAULTED,      // Tenant in default (missed payments)
        TERMINATED,     // Lease terminated by either party
        EXPIRED,        // Lease term naturally expired
        DISPUTED        // Lease under dispute resolution
    }
    
    // Payment status
    enum PaymentStatus {
        PENDING,        // Payment due but not made
        PAID,           // Payment completed on time
        LATE,           // Payment made after due date
        PARTIAL,        // Partial payment made
        DEFAULTED       // Payment not made within grace period
    }
    
    // Dispute status
    enum DisputeStatus {
        NONE,           // No dispute
        RAISED,         // Dispute raised by party
        UNDER_REVIEW,   // Dispute being reviewed
        RESOLVED,       // Dispute resolved
        ARBITRATED      // Dispute sent to arbitration
    }
    
    // Lease agreement structure
    struct Lease {
        uint256 leaseId;
        address propertyToken;      // ERC-3643 property token contract
        uint256 propertyTokenId;    // Specific token ID if fractional
        address landlord;           // Property owner
        address tenant;             // Lease holder
        
        // Financial terms
        uint256 monthlyRent;        // Monthly rent in wei (or stablecoin)
        uint256 securityDeposit;    // Security deposit amount
        uint256 totalRentPaid;      // Total rent paid to date
        address paymentToken;       // ERC-20 token for payments (USDC, IRL, etc.)
        
        // Time terms
        uint256 startDate;          // Lease start timestamp
        uint256 endDate;            // Lease end timestamp
        uint256 nextPaymentDue;     // Next rent payment due date
        uint32 gracePeriodDays;     // Grace period for late payment
        
        // Lease terms
        string propertyAddress;     // Physical property address
        string leaseTermsHash;      // IPFS hash of detailed lease terms
        bytes32 documentHash;       // Hash of signed documents
        
        // Status tracking
        LeaseStatus status;
        uint256 createdAt;
        uint256 lastModified;
        
        // Dispute handling
        DisputeStatus disputeStatus;
        string disputeDetails;      // IPFS hash of dispute details
        address disputeRaisedBy;
        uint256 disputeRaisedAt;
    }
    
    // Payment record structure
    struct PaymentRecord {
        uint256 paymentId;
        uint256 leaseId;
        uint256 amount;
        uint256 dueDate;
        uint256 paidDate;
        PaymentStatus status;
        address paidBy;
        string paymentReference;    // Off-chain payment reference
    }
    
    // Storage
    mapping(uint256 => Lease) public leases;
    mapping(uint256 => PaymentRecord[]) public leasePayments;
    mapping(address => uint256[]) public landlordLeases;
    mapping(address => uint256[]) public tenantLeases;
    mapping(address => bool) public approvedPaymentTokens;
    
    uint256 private _leaseCounter;
    uint256 private _paymentCounter;
    
    // Contract references
    IIdentityRegistry public identityRegistry;
    address public escrowContract;
    
    // Configuration
    uint256 public defaultGracePeriod = 5 days;
    uint256 public maxLeaseDuration = 10 * 365 days; // 10 years
    uint256 public minLeaseDuration = 30 days;
    
    // Events
    event LeaseCreated(
        uint256 indexed leaseId,
        address indexed landlord,
        address indexed tenant,
        address propertyToken,
        uint256 monthlyRent
    );
    
    event LeaseStatusChanged(
        uint256 indexed leaseId,
        LeaseStatus oldStatus,
        LeaseStatus newStatus
    );
    
    event RentPaymentMade(
        uint256 indexed leaseId,
        uint256 indexed paymentId,
        uint256 amount,
        address paidBy,
        PaymentStatus status
    );
    
    event DisputeRaised(
        uint256 indexed leaseId,
        address indexed raisedBy,
        string disputeDetails
    );
    
    event DisputeResolved(
        uint256 indexed leaseId,
        address indexed resolvedBy,
        string resolution
    );
    
    event LeaseTermsUpdated(
        uint256 indexed leaseId,
        string newTermsHash
    );
    
    constructor(
        address _identityRegistry,
        address _escrowContract
    ) {
        require(_identityRegistry != address(0), "LeaseAgreement: invalid identity registry");
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(LEASE_MANAGER_ROLE, msg.sender);
        _grantRole(DISPUTE_RESOLVER_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ROLE, msg.sender);
        
        identityRegistry = IIdentityRegistry(_identityRegistry);
        escrowContract = _escrowContract;
        
        // Approve common payment tokens
        // Note: These should be set after deployment based on available tokens
        // approvedPaymentTokens[USDC_ADDRESS] = true;
        // approvedPaymentTokens[IRL_TOKEN_ADDRESS] = true;
    }
    
    // Modifiers
    modifier onlyLeaseManager() {
        require(hasRole(LEASE_MANAGER_ROLE, msg.sender), "LeaseAgreement: not a lease manager");
        _;
    }
    
    modifier onlyDisputeResolver() {
        require(hasRole(DISPUTE_RESOLVER_ROLE, msg.sender), "LeaseAgreement: not dispute resolver");
        _;
    }
    
    modifier onlyLeaseParties(uint256 _leaseId) {
        require(
            msg.sender == leases[_leaseId].landlord || 
            msg.sender == leases[_leaseId].tenant,
            "LeaseAgreement: not a lease party"
        );
        _;
    }
    
    modifier validLease(uint256 _leaseId) {
        require(_leaseId > 0 && _leaseId <= _leaseCounter, "LeaseAgreement: invalid lease ID");
        require(leases[_leaseId].landlord != address(0), "LeaseAgreement: lease not found");
        _;
    }
    
    modifier verifiedParties(address _landlord, address _tenant) {
        require(identityRegistry.isVerified(_landlord), "LeaseAgreement: landlord not verified");
        require(identityRegistry.isVerified(_tenant), "LeaseAgreement: tenant not verified");
        _;
    }
    
    // Core Lease Functions
    
    /**
     * @dev Create a new lease agreement
     */
    function createLease(
        address _propertyToken,
        uint256 _propertyTokenId,
        address _landlord,
        address _tenant,
        uint256 _monthlyRent,
        uint256 _securityDeposit,
        address _paymentToken,
        uint256 _startDate,
        uint256 _endDate,
        string calldata _propertyAddress,
        string calldata _leaseTermsHash,
        bytes32 _documentHash
    ) external 
        whenNotPaused 
        verifiedParties(_landlord, _tenant)
        returns (uint256) 
    {
        require(_propertyToken != address(0), "LeaseAgreement: invalid property token");
        require(_landlord != _tenant, "LeaseAgreement: landlord cannot be tenant");
        require(_monthlyRent > 0, "LeaseAgreement: invalid rent amount");
        require(approvedPaymentTokens[_paymentToken], "LeaseAgreement: payment token not approved");
        require(_startDate >= block.timestamp, "LeaseAgreement: start date in past");
        require(_endDate > _startDate, "LeaseAgreement: invalid lease duration");
        require(_endDate - _startDate >= minLeaseDuration, "LeaseAgreement: lease too short");
        require(_endDate - _startDate <= maxLeaseDuration, "LeaseAgreement: lease too long");
        require(bytes(_leaseTermsHash).length > 0, "LeaseAgreement: missing lease terms");
        
        // Verify landlord owns the property token
        IERC3643 propertyTokenContract = IERC3643(_propertyToken);
        require(propertyTokenContract.balanceOf(_landlord) > 0, "LeaseAgreement: landlord doesn't own property");
        
        _leaseCounter++;
        uint256 leaseId = _leaseCounter;
        
        leases[leaseId] = Lease({
            leaseId: leaseId,
            propertyToken: _propertyToken,
            propertyTokenId: _propertyTokenId,
            landlord: _landlord,
            tenant: _tenant,
            monthlyRent: _monthlyRent,
            securityDeposit: _securityDeposit,
            totalRentPaid: 0,
            paymentToken: _paymentToken,
            startDate: _startDate,
            endDate: _endDate,
            nextPaymentDue: _startDate + 30 days, // First payment due 30 days after start
            gracePeriodDays: uint32(defaultGracePeriod / 1 days),
            propertyAddress: _propertyAddress,
            leaseTermsHash: _leaseTermsHash,
            documentHash: _documentHash,
            status: LeaseStatus.DRAFT,
            createdAt: block.timestamp,
            lastModified: block.timestamp,
            disputeStatus: DisputeStatus.NONE,
            disputeDetails: "",
            disputeRaisedBy: address(0),
            disputeRaisedAt: 0
        });
        
        // Add to landlord and tenant tracking
        landlordLeases[_landlord].push(leaseId);
        tenantLeases[_tenant].push(leaseId);
        
        emit LeaseCreated(leaseId, _landlord, _tenant, _propertyToken, _monthlyRent);
        
        return leaseId;
    }
    
    /**
     * @dev Activate a lease (after security deposit paid)
     */
    function activateLease(uint256 _leaseId) 
        external 
        validLease(_leaseId) 
        onlyLeaseParties(_leaseId) 
    {
        Lease storage lease = leases[_leaseId];
        require(lease.status == LeaseStatus.DRAFT, "LeaseAgreement: lease not in draft");
        require(block.timestamp >= lease.startDate, "LeaseAgreement: lease not started");
        require(block.timestamp <= lease.endDate, "LeaseAgreement: lease expired");
        
        // Note: Security deposit handling should be done through EscrowPayment contract
        // This is a simplified version
        
        LeaseStatus oldStatus = lease.status;
        lease.status = LeaseStatus.ACTIVE;
        lease.lastModified = block.timestamp;
        
        emit LeaseStatusChanged(_leaseId, oldStatus, LeaseStatus.ACTIVE);
    }
    
    /**
     * @dev Record rent payment
     */
    function recordRentPayment(
        uint256 _leaseId,
        uint256 _amount,
        string calldata _paymentReference
    ) external validLease(_leaseId) nonReentrant returns (uint256) {
        Lease storage lease = leases[_leaseId];
        require(lease.status == LeaseStatus.ACTIVE, "LeaseAgreement: lease not active");
        require(_amount > 0, "LeaseAgreement: invalid payment amount");
        
        _paymentCounter++;
        uint256 paymentId = _paymentCounter;
        
        PaymentStatus status;
        uint256 currentTime = block.timestamp;
        
        if (currentTime <= lease.nextPaymentDue) {
            status = _amount >= lease.monthlyRent ? PaymentStatus.PAID : PaymentStatus.PARTIAL;
        } else if (currentTime <= lease.nextPaymentDue + (lease.gracePeriodDays * 1 days)) {
            status = _amount >= lease.monthlyRent ? PaymentStatus.LATE : PaymentStatus.PARTIAL;
        } else {
            status = PaymentStatus.DEFAULTED;
        }
        
        PaymentRecord memory payment = PaymentRecord({
            paymentId: paymentId,
            leaseId: _leaseId,
            amount: _amount,
            dueDate: lease.nextPaymentDue,
            paidDate: currentTime,
            status: status,
            paidBy: msg.sender,
            paymentReference: _paymentReference
        });
        
        leasePayments[_leaseId].push(payment);
        lease.totalRentPaid += _amount;
        
        // Update next payment due if full payment made
        if (_amount >= lease.monthlyRent) {
            lease.nextPaymentDue += 30 days;
        }
        
        // Update lease status if in default
        if (lease.status == LeaseStatus.DEFAULTED && status != PaymentStatus.DEFAULTED) {
            LeaseStatus oldStatus = lease.status;
            lease.status = LeaseStatus.ACTIVE;
            emit LeaseStatusChanged(_leaseId, oldStatus, LeaseStatus.ACTIVE);
        }
        
        lease.lastModified = block.timestamp;
        
        emit RentPaymentMade(_leaseId, paymentId, _amount, msg.sender, status);
        
        return paymentId;
    }
    
    /**
     * @dev Terminate lease
     */
    function terminateLease(uint256 _leaseId, string calldata _reason) 
        external 
        validLease(_leaseId) 
        onlyLeaseParties(_leaseId) 
    {
        Lease storage lease = leases[_leaseId];
        require(
            lease.status == LeaseStatus.ACTIVE || lease.status == LeaseStatus.DEFAULTED,
            "LeaseAgreement: cannot terminate lease in current status"
        );
        
        LeaseStatus oldStatus = lease.status;
        lease.status = LeaseStatus.TERMINATED;
        lease.lastModified = block.timestamp;
        
        emit LeaseStatusChanged(_leaseId, oldStatus, LeaseStatus.TERMINATED);
    }
    
    /**
     * @dev Check for expired leases and update status
     */
    function checkLeaseExpiry(uint256 _leaseId) external validLease(_leaseId) {
        Lease storage lease = leases[_leaseId];
        
        if (block.timestamp > lease.endDate && lease.status == LeaseStatus.ACTIVE) {
            LeaseStatus oldStatus = lease.status;
            lease.status = LeaseStatus.EXPIRED;
            lease.lastModified = block.timestamp;
            
            emit LeaseStatusChanged(_leaseId, oldStatus, LeaseStatus.EXPIRED);
        }
        
        // Check for payment defaults
        if (lease.status == LeaseStatus.ACTIVE && 
            block.timestamp > lease.nextPaymentDue + (lease.gracePeriodDays * 1 days)) {
            
            LeaseStatus oldStatus = lease.status;
            lease.status = LeaseStatus.DEFAULTED;
            lease.lastModified = block.timestamp;
            
            emit LeaseStatusChanged(_leaseId, oldStatus, LeaseStatus.DEFAULTED);
        }
    }
    
    // Dispute Resolution Functions
    
    /**
     * @dev Raise a dispute
     */
    function raiseDispute(uint256 _leaseId, string calldata _disputeDetails) 
        external 
        validLease(_leaseId) 
        onlyLeaseParties(_leaseId) 
    {
        Lease storage lease = leases[_leaseId];
        require(lease.disputeStatus == DisputeStatus.NONE, "LeaseAgreement: dispute already exists");
        require(bytes(_disputeDetails).length > 0, "LeaseAgreement: missing dispute details");
        
        lease.disputeStatus = DisputeStatus.RAISED;
        lease.disputeDetails = _disputeDetails;
        lease.disputeRaisedBy = msg.sender;
        lease.disputeRaisedAt = block.timestamp;
        
        LeaseStatus oldStatus = lease.status;
        lease.status = LeaseStatus.DISPUTED;
        lease.lastModified = block.timestamp;
        
        emit DisputeRaised(_leaseId, msg.sender, _disputeDetails);
        emit LeaseStatusChanged(_leaseId, oldStatus, LeaseStatus.DISPUTED);
    }
    
    /**
     * @dev Resolve a dispute
     */
    function resolveDispute(uint256 _leaseId, string calldata _resolution) 
        external 
        validLease(_leaseId) 
        onlyDisputeResolver 
    {
        Lease storage lease = leases[_leaseId];
        require(lease.disputeStatus == DisputeStatus.RAISED || 
                lease.disputeStatus == DisputeStatus.UNDER_REVIEW, 
                "LeaseAgreement: no dispute to resolve");
        
        lease.disputeStatus = DisputeStatus.RESOLVED;
        lease.lastModified = block.timestamp;
        
        // Revert to active status if lease is still valid
        LeaseStatus oldStatus = lease.status;
        if (block.timestamp <= lease.endDate) {
            lease.status = LeaseStatus.ACTIVE;
        } else {
            lease.status = LeaseStatus.EXPIRED;
        }
        
        emit DisputeResolved(_leaseId, msg.sender, _resolution);
        emit LeaseStatusChanged(_leaseId, oldStatus, lease.status);
    }
    
    // View Functions
    
    /**
     * @dev Get lease details
     */
    function getLease(uint256 _leaseId) 
        external 
        view 
        validLease(_leaseId) 
        returns (Lease memory) 
    {
        return leases[_leaseId];
    }
    
    /**
     * @dev Get lease payment history
     */
    function getLeasePayments(uint256 _leaseId) 
        external 
        view 
        validLease(_leaseId) 
        returns (PaymentRecord[] memory) 
    {
        return leasePayments[_leaseId];
    }
    
    /**
     * @dev Get landlord's leases
     */
    function getLandlordLeases(address _landlord) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return landlordLeases[_landlord];
    }
    
    /**
     * @dev Get tenant's leases
     */
    function getTenantLeases(address _tenant) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return tenantLeases[_tenant];
    }
    
    /**
     * @dev Check if rent is overdue
     */
    function isRentOverdue(uint256 _leaseId) 
        external 
        view 
        validLease(_leaseId) 
        returns (bool) 
    {
        Lease memory lease = leases[_leaseId];
        return (lease.status == LeaseStatus.ACTIVE && 
                block.timestamp > lease.nextPaymentDue);
    }
    
    /**
     * @dev Get next payment due amount and date
     */
    function getNextPaymentInfo(uint256 _leaseId) 
        external 
        view 
        validLease(_leaseId) 
        returns (uint256 amount, uint256 dueDate, bool overdue) 
    {
        Lease memory lease = leases[_leaseId];
        return (
            lease.monthlyRent,
            lease.nextPaymentDue,
            block.timestamp > lease.nextPaymentDue
        );
    }
    
    // Administrative Functions
    
    /**
     * @dev Set approved payment token
     */
    function setApprovedPaymentToken(address _token, bool _approved) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        approvedPaymentTokens[_token] = _approved;
    }
    
    /**
     * @dev Update default grace period
     */
    function setDefaultGracePeriod(uint256 _gracePeriod) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        defaultGracePeriod = _gracePeriod;
    }
    
    /**
     * @dev Update lease duration limits
     */
    function setLeaseDurationLimits(uint256 _minDuration, uint256 _maxDuration) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(_minDuration < _maxDuration, "LeaseAgreement: invalid duration limits");
        minLeaseDuration = _minDuration;
        maxLeaseDuration = _maxDuration;
    }
    
    /**
     * @dev Update escrow contract address
     */
    function setEscrowContract(address _escrowContract) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        escrowContract = _escrowContract;
    }
    
    /**
     * @dev Emergency pause
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Batch check lease expiries (gas-efficient)
     */
    function batchCheckLeaseExpiry(uint256[] calldata _leaseIds) external {
        for (uint256 i = 0; i < _leaseIds.length; i++) {
            if (_leaseIds[i] > 0 && _leaseIds[i] <= _leaseCounter) {
                this.checkLeaseExpiry(_leaseIds[i]);
            }
        }
    }
}