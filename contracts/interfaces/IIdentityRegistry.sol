// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IIdentityRegistry
 * @dev Interface for identity registry - maintains KYC/AML compliance
 * @notice This interface defines the core functions for managing investor identities
 */
interface IIdentityRegistry {
    /**
     * @dev Emitted when a new identity is registered
     */
    event IdentityRegistered(address indexed wallet, address indexed onchainId);
    
    /**
     * @dev Emitted when an identity is verified by admin
     */
    event IdentityVerified(address indexed wallet, address indexed onchainId, uint16 country);
    
    /**
     * @dev Register an identity (public for demo purposes)
     * @param _onchainId The on-chain identity contract address
     */
    function registerIdentity(address _onchainId) external;
    
    /**
     * @dev Admin verifies an identity after KYC process
     * @param _wallet The wallet address to verify
     * @param _onchainId The on-chain identity contract
     * @param _country ISO 3166-1 country code
     */
    function adminVerify(address _wallet, address _onchainId, uint16 _country) external;
    
    /**
     * @dev Check if a wallet is verified
     * @param _wallet The wallet address to check
     * @return bool True if wallet is KYC verified
     */
    function isVerified(address _wallet) external view returns (bool);
    
    /**
     * @dev Get the country of a verified wallet
     * @param _wallet The wallet address
     * @return uint16 The country code
     */
    function getCountry(address _wallet) external view returns (uint16);
}
