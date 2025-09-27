// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IIdentityRegistry Interface
 * @dev Interface for Integra-compliant identity registry
 */
interface IIdentityRegistry {
    // Events
    event IdentityStored(address indexed investorAddress, address indexed identity);
    event IdentityUnstored(address indexed investorAddress, address indexed identity);
    event IdentityModified(address indexed oldIdentity, address indexed newIdentity);
    event CountryModified(address indexed investorAddress, uint16 indexed country);
    event IdentityRegistryBound(address indexed identityRegistry);
    event IdentityRegistryUnbound(address indexed identityRegistry);
    
    // Core functions
    function identity(address _userAddress) external view returns (address);
    function investorCountry(address _userAddress) external view returns (uint16);
    function isVerified(address _userAddress) external view returns (bool);
    function contains(address _userAddress) external view returns (bool);
    
    function registerIdentity(address _userAddress, address _identity, uint16 _country) external;
    function deleteIdentity(address _userAddress) external;
    function updateIdentity(address _userAddress, address _identity) external;
    function updateCountry(address _userAddress, uint16 _country) external;
    
    function batchRegisterIdentity(
        address[] calldata _userAddresses, 
        address[] calldata _identities, 
        uint16[] calldata _countries
    ) external;
    
    function bindIdentityRegistry(address _identityRegistry) external;
    function unbindIdentityRegistry(address _identityRegistry) external;
}
