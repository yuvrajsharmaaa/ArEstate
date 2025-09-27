// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IIdentityRegistry.sol";

/**
 * @title IdentityRegistry
 * @dev Simple identity registry for KYC/AML compliance
 */
contract IdentityRegistry is IIdentityRegistry, AccessControl, ReentrancyGuard {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    
    struct Identity {
        address identityContract;
        uint16 country;
        bool isVerified;
        bool exists;
        uint256 registrationTime;
    }
    
    mapping(address => Identity) private _identities;
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRAR_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ROLE, msg.sender);
    }
    
    function registerIdentity(
        address _user, 
        address _identity, 
        uint16 _country
    ) external override onlyRole(REGISTRAR_ROLE) {
        require(_user != address(0), "Invalid user address");
        require(_identity != address(0), "Invalid identity address");
        require(!_identities[_user].exists, "Identity already exists");
        
        _identities[_user] = Identity({
            identityContract: _identity,
            country: _country,
            isVerified: false,
            exists: true,
            registrationTime: block.timestamp
        });
        
        emit IdentityRegistered(_user, _identity, _country);
    }
    
    function verifyIdentity(address _user) external override onlyRole(COMPLIANCE_ROLE) {
        require(_identities[_user].exists, "Identity does not exist");
        
        _identities[_user].isVerified = true;
        emit IdentityVerified(_user, true);
    }
    
    function updateCountry(address _user, uint16 _country) external override onlyRole(COMPLIANCE_ROLE) {
        require(_identities[_user].exists, "Identity does not exist");
        
        _identities[_user].country = _country;
        emit CountryUpdated(_user, _country);
    }
    
    // View functions
    function identity(address _user) external view override returns (address) {
        return _identities[_user].identityContract;
    }
    
    function investorCountry(address _user) external view override returns (uint16) {
        return _identities[_user].country;
    }
    
    function isVerified(address _user) external view override returns (bool) {
        return _identities[_user].isVerified && _identities[_user].exists;
    }
    
    function contains(address _user) external view override returns (bool) {
        return _identities[_user].exists;
    }
    
    // Additional utility functions
    function getIdentityDetails(address _user) external view returns (
        address identityContract,
        uint16 country,
        bool verified,
        bool exists,
        uint256 registrationTime
    ) {
        Identity memory userIdentity = _identities[_user];
        return (
            userIdentity.identityContract,
            userIdentity.country,
            userIdentity.isVerified,
            userIdentity.exists,
            userIdentity.registrationTime
        );
    }
}