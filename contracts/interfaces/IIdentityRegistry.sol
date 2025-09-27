// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IIdentityRegistry
 * @dev Interface for identity registry - maintains KYC/AML compliance
 */
interface IIdentityRegistry {
    // Events
    event IdentityRegistered(address indexed user, address indexed identity, uint16 country);
    event IdentityVerified(address indexed user, bool verified);
    event CountryUpdated(address indexed user, uint16 newCountry);
    
    // Core functions
    function registerIdentity(address _user, address _identity, uint16 _country) external;
    function verifyIdentity(address _user) external;
    function updateCountry(address _user, uint16 _country) external;
    
    // View functions
    function identity(address _user) external view returns (address);
    function investorCountry(address _user) external view returns (uint16);
    function isVerified(address _user) external view returns (bool);
    function contains(address _user) external view returns (bool);
}
