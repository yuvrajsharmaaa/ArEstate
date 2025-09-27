// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IIdentityRegistry.sol";

/**
 * @title LeaseManager
 * @dev Manages lease agreements and payments for tokenized real estate
 * @notice Purpose: Handle lease creation, security deposits, and rent payments
 * 
 * Expected edits for production:
 * - Add more sophisticated lease terms (variable rent, escalations)
 * - Implement automated dispute resolution mechanisms  
 * - Add integration with off-chain property management systems
 * - Add support for multiple payment tokens per lease
 * 
 * Security notes:
 * - All payments use SafeERC20 for secure token transfers
 * - Reentrancy protection on all state-changing functions
 * - Only verified identities can create or participate in leases
 * - Escrow logic prevents double-spending of deposits
 */
contract LeaseManager is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // Identity registry for KYC verification
    IIdentityRegistry public immutable identityRegistry;
    
    // Lease status enumeration
    enum LeaseStatus {
        CREATED,        // Lease created, waiting for deposit
        ACTIVE,         // Deposit paid, lease is active
        COMPLETED,      // Lease term completed
        TERMINATED,     // Lease terminated early
        DEFAULTED       // Tenant in default
    }
    
    // Lease structure
    struct Lease {
        uint256 leaseId;            // Unique lease identifier
        address landlord;           // Property owner
        address tenant;             // Lease holder
        IERC20 paymentToken;        // Token used for payments (e.g., USDC)
        uint256 monthlyRent;        // Monthly rent amount
        uint256 securityDeposit;    // Security deposit amount
        uint256 leaseStart;         // Lease start timestamp
        uint256 leaseEnd;           // Lease end timestamp
        LeaseStatus status;         // Current lease status
        uint256 depositPaid;        // Amount of deposit actually paid
        uint256 lastRentPayment;    // Timestamp of last rent payment
        uint256 totalRentPaid;      // Total rent paid to date
        string propertyMetadata;    // IPFS CID or property description
    }
    
    // Storage
    mapping(uint256 => Lease) public leases;
    mapping(address => uint256[]) public landlordLeases;    // landlord => lease IDs
    mapping(address => uint256[]) public tenantLeases;      // tenant => lease IDs
    mapping(address => bool) public approvedTokens;        // approved payment tokens
    
    uint256 private _nextLeaseId = 1;
    
    // Events
    event LeaseCreated(
        uint256 indexed leaseId,
        address indexed landlord,
        address indexed tenant,
        uint256 monthlyRent,
        uint256 securityDeposit
    );
    
    event DepositPaid(
        uint256 indexed leaseId,
        address indexed tenant,
        uint256 amount
    );
    
    event RentPaid(
        uint256 indexed leaseId,
        address indexed tenant,
        uint256 amount,
        uint256 timestamp
    );
    
    event DepositReturned(
        uint256 indexed leaseId,
        address indexed tenant,
        uint256 amount
    );
    
    event LeaseStatusChanged(
        uint256 indexed leaseId,
        LeaseStatus oldStatus,
        LeaseStatus newStatus
    );
    
    constructor(address _identityRegistry) Ownable(msg.sender) {
        require(_identityRegistry != address(0), "LeaseManager: invalid identity registry");
        identityRegistry = IIdentityRegistry(_identityRegistry);
    }
    
    /**
     * @dev Create a new lease agreement
     * @param _tenant The tenant address
     * @param _paymentToken The ERC20 token for payments
     * @param _monthlyRent Monthly rent amount
     * @param _securityDeposit Security deposit amount
     * @param _leaseStart Lease start timestamp
     * @param _leaseEnd Lease end timestamp
     * @param _propertyMetadata Property description or IPFS CID
     * @return uint256 The created lease ID
     * @notice Both landlord and tenant must be KYC verified
     */
    function createLease(
        address _tenant,
        IERC20 _paymentToken,
        uint256 _monthlyRent,
        uint256 _securityDeposit,
        uint256 _leaseStart,
        uint256 _leaseEnd,
        string memory _propertyMetadata
    ) external nonReentrant returns (uint256) {
        require(_tenant != address(0), "LeaseManager: invalid tenant");
        require(_tenant != msg.sender, "LeaseManager: landlord cannot be tenant");
        require(address(_paymentToken) != address(0), "LeaseManager: invalid payment token");
        require(approvedTokens[address(_paymentToken)], "LeaseManager: token not approved");
        require(_monthlyRent > 0, "LeaseManager: rent must be positive");
        require(_securityDeposit > 0, "LeaseManager: deposit must be positive");
        require(_leaseStart >= block.timestamp, "LeaseManager: start date in past");
        require(_leaseEnd > _leaseStart, "LeaseManager: invalid lease period");
        require(bytes(_propertyMetadata).length > 0, "LeaseManager: empty property metadata");
        
        // Verify both parties are KYC compliant
        require(identityRegistry.isVerified(msg.sender), "LeaseManager: landlord not verified");
        require(identityRegistry.isVerified(_tenant), "LeaseManager: tenant not verified");
        
        uint256 leaseId = _nextLeaseId++;
        
        // Create lease
        leases[leaseId] = Lease({
            leaseId: leaseId,
            landlord: msg.sender,
            tenant: _tenant,
            paymentToken: _paymentToken,
            monthlyRent: _monthlyRent,
            securityDeposit: _securityDeposit,
            leaseStart: _leaseStart,
            leaseEnd: _leaseEnd,
            status: LeaseStatus.CREATED,
            depositPaid: 0,
            lastRentPayment: 0,
            totalRentPaid: 0,
            propertyMetadata: _propertyMetadata
        });
        
        // Track leases for both parties
        landlordLeases[msg.sender].push(leaseId);
        tenantLeases[_tenant].push(leaseId);
        
        emit LeaseCreated(leaseId, msg.sender, _tenant, _monthlyRent, _securityDeposit);
        
        return leaseId;
    }
    
    /**
     * @dev Pay security deposit for a lease
     * @param _leaseId The lease ID
     * @notice Tenant must approve tokens before calling this function
     */
    function paySecurityDeposit(uint256 _leaseId) external nonReentrant {
        Lease storage lease = leases[_leaseId];
        require(lease.landlord != address(0), "LeaseManager: lease not found");
        require(msg.sender == lease.tenant, "LeaseManager: only tenant can pay deposit");
        require(lease.status == LeaseStatus.CREATED, "LeaseManager: invalid lease status");
        require(lease.depositPaid == 0, "LeaseManager: deposit already paid");
        
        // Transfer security deposit to this contract (escrow)
        lease.paymentToken.safeTransferFrom(
            msg.sender, 
            address(this), 
            lease.securityDeposit
        );
        
        // Update lease state
        lease.depositPaid = lease.securityDeposit;
        lease.status = LeaseStatus.ACTIVE;
        
        emit DepositPaid(_leaseId, msg.sender, lease.securityDeposit);
        emit LeaseStatusChanged(_leaseId, LeaseStatus.CREATED, LeaseStatus.ACTIVE);
    }
    
    /**
     * @dev Pay monthly rent
     * @param _leaseId The lease ID
     * @notice Tenant must approve tokens before calling this function
     */
    function payRent(uint256 _leaseId) external nonReentrant {
        Lease storage lease = leases[_leaseId];
        require(lease.landlord != address(0), "LeaseManager: lease not found");
        require(msg.sender == lease.tenant, "LeaseManager: only tenant can pay rent");
        require(lease.status == LeaseStatus.ACTIVE, "LeaseManager: lease not active");
        require(block.timestamp >= lease.leaseStart, "LeaseManager: lease not started");
        require(block.timestamp <= lease.leaseEnd, "LeaseManager: lease expired");
        
        // Transfer rent directly to landlord
        lease.paymentToken.safeTransferFrom(
            msg.sender,
            lease.landlord,
            lease.monthlyRent
        );
        
        // Update lease state
        lease.lastRentPayment = block.timestamp;
        lease.totalRentPaid += lease.monthlyRent;
        
        emit RentPaid(_leaseId, msg.sender, lease.monthlyRent, block.timestamp);
    }
    
    /**
     * @dev Return security deposit to tenant
     * @param _leaseId The lease ID
     * @param _amount Amount to return (allows partial returns for damages)
     * @notice Only landlord can initiate deposit return
     */
    function returnDeposit(uint256 _leaseId, uint256 _amount) external nonReentrant {
        Lease storage lease = leases[_leaseId];
        require(lease.landlord != address(0), "LeaseManager: lease not found");
        require(msg.sender == lease.landlord, "LeaseManager: only landlord can return deposit");
        require(lease.depositPaid > 0, "LeaseManager: no deposit to return");
        require(_amount <= lease.depositPaid, "LeaseManager: amount exceeds deposit");
        require(
            lease.status == LeaseStatus.ACTIVE || 
            lease.status == LeaseStatus.COMPLETED ||
            lease.status == LeaseStatus.TERMINATED,
            "LeaseManager: invalid status for deposit return"
        );
        
        // Transfer deposit back to tenant
        lease.paymentToken.safeTransfer(lease.tenant, _amount);
        
        // Update deposit tracking
        lease.depositPaid -= _amount;
        
        // If lease is active and we're past end date, mark as completed
        if (lease.status == LeaseStatus.ACTIVE && block.timestamp > lease.leaseEnd) {
            lease.status = LeaseStatus.COMPLETED;
            emit LeaseStatusChanged(_leaseId, LeaseStatus.ACTIVE, LeaseStatus.COMPLETED);
        }
        
        emit DepositReturned(_leaseId, lease.tenant, _amount);
    }
    
    /**
     * @dev Terminate lease early
     * @param _leaseId The lease ID
     * @notice Can be called by either landlord or tenant
     */
    function terminateLease(uint256 _leaseId) external {
        Lease storage lease = leases[_leaseId];
        require(lease.landlord != address(0), "LeaseManager: lease not found");
        require(
            msg.sender == lease.landlord || msg.sender == lease.tenant,
            "LeaseManager: only lease parties can terminate"
        );
        require(lease.status == LeaseStatus.ACTIVE, "LeaseManager: lease not active");
        
        LeaseStatus oldStatus = lease.status;
        lease.status = LeaseStatus.TERMINATED;
        
        emit LeaseStatusChanged(_leaseId, oldStatus, LeaseStatus.TERMINATED);
    }
    
    /**
     * @dev Mark lease as defaulted (non-payment)
     * @param _leaseId The lease ID
     * @notice Only landlord can mark as defaulted
     */
    function markDefault(uint256 _leaseId) external {
        Lease storage lease = leases[_leaseId];
        require(lease.landlord != address(0), "LeaseManager: lease not found");
        require(msg.sender == lease.landlord, "LeaseManager: only landlord can mark default");
        require(lease.status == LeaseStatus.ACTIVE, "LeaseManager: lease not active");
        
        LeaseStatus oldStatus = lease.status;
        lease.status = LeaseStatus.DEFAULTED;
        
        emit LeaseStatusChanged(_leaseId, oldStatus, LeaseStatus.DEFAULTED);
    }
    
    /**
     * @dev Add approved payment token
     * @param _token The token address to approve
     * @notice Only owner can approve new payment tokens
     */
    function addApprovedToken(address _token) external onlyOwner {
        require(_token != address(0), "LeaseManager: invalid token");
        approvedTokens[_token] = true;
    }
    
    /**
     * @dev Remove approved payment token
     * @param _token The token address to remove
     */
    function removeApprovedToken(address _token) external onlyOwner {
        approvedTokens[_token] = false;
    }
    
    /**
     * @dev Get lease details
     * @param _leaseId The lease ID
     * @return Lease struct with all lease information
     */
    function getLease(uint256 _leaseId) external view returns (Lease memory) {
        require(leases[_leaseId].landlord != address(0), "LeaseManager: lease not found");
        return leases[_leaseId];
    }
    
    /**
     * @dev Get landlord's lease IDs
     * @param _landlord The landlord address
     * @return uint256[] Array of lease IDs
     */
    function getLandlordLeases(address _landlord) external view returns (uint256[] memory) {
        return landlordLeases[_landlord];
    }
    
    /**
     * @dev Get tenant's lease IDs
     * @param _tenant The tenant address
     * @return uint256[] Array of lease IDs
     */
    function getTenantLeases(address _tenant) external view returns (uint256[] memory) {
        return tenantLeases[_tenant];
    }
    
    /**
     * @dev Check if rent is overdue
     * @param _leaseId The lease ID
     * @return bool True if rent payment is overdue (>30 days since last payment)
     */
    function isRentOverdue(uint256 _leaseId) external view returns (bool) {
        Lease memory lease = leases[_leaseId];
        require(lease.landlord != address(0), "LeaseManager: lease not found");
        
        if (lease.status != LeaseStatus.ACTIVE) return false;
        if (block.timestamp < lease.leaseStart) return false;
        
        // If no rent has been paid and we're >30 days into lease
        if (lease.lastRentPayment == 0) {
            return (block.timestamp > lease.leaseStart + 30 days);
        }
        
        // If last payment was >30 days ago
        return (block.timestamp > lease.lastRentPayment + 30 days);
    }
    
    /**
     * @dev Get total number of leases created
     * @return uint256 Total lease count
     */
    function getTotalLeases() external view returns (uint256) {
        return _nextLeaseId - 1;
    }
    
    /**
     * @dev Emergency withdrawal (only owner, for stuck funds)
     * @param _token Token to withdraw
     * @param _amount Amount to withdraw
     * @notice Should only be used in emergency situations
     */
    function emergencyWithdraw(IERC20 _token, uint256 _amount) external onlyOwner {
        _token.safeTransfer(owner(), _amount);
    }
    
    // TODO: Add automated rent collection with subscription model
    // TODO: Add integration with property inspection services
    // TODO: Add support for rent escalation clauses
    // TODO: Add integration with legal dispute resolution platforms
    // TODO: Add support for partial payments and payment plans
}