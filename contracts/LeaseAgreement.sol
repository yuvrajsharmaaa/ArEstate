// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IIdentityRegistry.sol";

/**
 * @title LeaseAgreement
 * @dev Manages lease agreements for tokenized properties
 */
contract LeaseAgreement is AccessControl, ReentrancyGuard {
    bytes32 public constant LEASE_MANAGER_ROLE = keccak256("LEASE_MANAGER_ROLE");
    
    enum LeaseStatus { DRAFT, ACTIVE, EXPIRED, TERMINATED }
    
    struct Lease {
        uint256 leaseId;
        address propertyToken;
        uint256 propertyTokenId;
        address landlord;
        address tenant;
        uint256 monthlyRent;
        uint256 securityDeposit;
        address paymentToken;
        uint256 startDate;
        uint256 endDate;
        string propertyAddress;
        string leaseTermsHash;
        bytes32 documentHash;
        LeaseStatus status;
        uint256 createdAt;
    }
    
    IIdentityRegistry public immutable identityRegistry;
    
    uint256 private _leaseCounter;
    mapping(uint256 => Lease) private _leases;
    mapping(address => uint256[]) private _landlordLeases;
    mapping(address => uint256[]) private _tenantLeases;
    
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
    
    event LeaseTerminated(
        uint256 indexed leaseId,
        address indexed terminatedBy,
        string reason
    );
    
    constructor(address _identityRegistry) {
        require(_identityRegistry != address(0), "Invalid identity registry");
        identityRegistry = IIdentityRegistry(_identityRegistry);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(LEASE_MANAGER_ROLE, msg.sender);
    }
    
    function createLease(
        address propertyToken,
        uint256 propertyTokenId,
        address landlord,
        address tenant,
        uint256 monthlyRent,
        uint256 securityDeposit,
        address paymentToken,
        uint256 startDate,
        uint256 endDate,
        string memory propertyAddress,
        string memory leaseTermsHash,
        bytes32 documentHash
    ) external onlyRole(LEASE_MANAGER_ROLE) returns (uint256) {
        require(landlord != address(0), "Invalid landlord address");
        require(tenant != address(0), "Invalid tenant address");
        require(propertyToken != address(0), "Invalid property token");
        require(paymentToken != address(0), "Invalid payment token");
        require(startDate < endDate, "Invalid lease dates");
        require(monthlyRent > 0, "Rent must be greater than 0");
        
        // Verify identities
        require(identityRegistry.isVerified(landlord), "Landlord not verified");
        require(identityRegistry.isVerified(tenant), "Tenant not verified");
        
        _leaseCounter++;
        uint256 leaseId = _leaseCounter;
        
        _leases[leaseId] = Lease({
            leaseId: leaseId,
            propertyToken: propertyToken,
            propertyTokenId: propertyTokenId,
            landlord: landlord,
            tenant: tenant,
            monthlyRent: monthlyRent,
            securityDeposit: securityDeposit,
            paymentToken: paymentToken,
            startDate: startDate,
            endDate: endDate,
            propertyAddress: propertyAddress,
            leaseTermsHash: leaseTermsHash,
            documentHash: documentHash,
            status: LeaseStatus.DRAFT,
            createdAt: block.timestamp
        });
        
        _landlordLeases[landlord].push(leaseId);
        _tenantLeases[tenant].push(leaseId);
        
        emit LeaseCreated(leaseId, landlord, tenant, propertyToken, monthlyRent);
        
        return leaseId;
    }
    
    function activateLease(uint256 leaseId) external onlyRole(LEASE_MANAGER_ROLE) {
        require(_leases[leaseId].leaseId != 0, "Lease does not exist");
        require(_leases[leaseId].status == LeaseStatus.DRAFT, "Lease cannot be activated");
        
        _updateLeaseStatus(leaseId, LeaseStatus.ACTIVE);
    }
    
    function terminateLease(
        uint256 leaseId, 
        string memory reason
    ) external onlyRole(LEASE_MANAGER_ROLE) {
        require(_leases[leaseId].leaseId != 0, "Lease does not exist");
        require(_leases[leaseId].status == LeaseStatus.ACTIVE, "Lease is not active");
        
        _updateLeaseStatus(leaseId, LeaseStatus.TERMINATED);
        emit LeaseTerminated(leaseId, msg.sender, reason);
    }
    
    function expireLease(uint256 leaseId) external onlyRole(LEASE_MANAGER_ROLE) {
        require(_leases[leaseId].leaseId != 0, "Lease does not exist");
        require(_leases[leaseId].status == LeaseStatus.ACTIVE, "Lease is not active");
        require(block.timestamp >= _leases[leaseId].endDate, "Lease has not expired yet");
        
        _updateLeaseStatus(leaseId, LeaseStatus.EXPIRED);
    }
    
    function updateLeaseRent(
        uint256 leaseId, 
        uint256 newRent
    ) external onlyRole(LEASE_MANAGER_ROLE) {
        require(_leases[leaseId].leaseId != 0, "Lease does not exist");
        require(newRent > 0, "Rent must be greater than 0");
        
        _leases[leaseId].monthlyRent = newRent;
    }
    
    // View functions
    function getLease(uint256 leaseId) external view returns (Lease memory) {
        require(_leases[leaseId].leaseId != 0, "Lease does not exist");
        return _leases[leaseId];
    }
    
    function getLeaseStatus(uint256 leaseId) external view returns (LeaseStatus) {
        require(_leases[leaseId].leaseId != 0, "Lease does not exist");
        return _leases[leaseId].status;
    }
    
    function getLandlordLeases(address landlord) external view returns (uint256[] memory) {
        return _landlordLeases[landlord];
    }
    
    function getTenantLeases(address tenant) external view returns (uint256[] memory) {
        return _tenantLeases[tenant];
    }
    
    function getTotalLeases() external view returns (uint256) {
        return _leaseCounter;
    }
    
    function isLeaseActive(uint256 leaseId) external view returns (bool) {
        return _leases[leaseId].status == LeaseStatus.ACTIVE;
    }
    
    function getLeaseBasicInfo(uint256 leaseId) external view returns (
        address landlord,
        address tenant,
        uint256 monthlyRent,
        LeaseStatus status
    ) {
        require(_leases[leaseId].leaseId != 0, "Lease does not exist");
        Lease memory lease = _leases[leaseId];
        return (lease.landlord, lease.tenant, lease.monthlyRent, lease.status);
    }
    
    // Internal functions
    function _updateLeaseStatus(uint256 leaseId, LeaseStatus newStatus) internal {
        LeaseStatus oldStatus = _leases[leaseId].status;
        _leases[leaseId].status = newStatus;
        emit LeaseStatusChanged(leaseId, oldStatus, newStatus);
    }
    
    // Emergency functions
    function emergencyTerminateLease(
        uint256 leaseId
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_leases[leaseId].leaseId != 0, "Lease does not exist");
        _updateLeaseStatus(leaseId, LeaseStatus.TERMINATED);
        emit LeaseTerminated(leaseId, msg.sender, "Emergency termination");
    }
}