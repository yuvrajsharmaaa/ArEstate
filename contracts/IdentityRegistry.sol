// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IIdentityRegistry.sol";

/**
 * @title IdentityRegistry
 * @dev Simple on-chain identity registry for KYC/AML compliance
 * @notice Purpose: Track verified identities for ERC-3643 compliance
 * 
 * Expected edits for production:
 * - Add more sophisticated KYC provider integration
 * - Implement Soulbound Token support
 * - Add batch operations for gas efficiency
 * 
 * Security notes:
 * - Only owner can verify identities (admin role)
 * - Public registration allows demo usage
 * - Country codes use ISO 3166-1 numeric standard
 */
contract IdentityRegistry is Ownable, IIdentityRegistry {
    
    // Storage for identity data
    struct Identity {
        address onchainId;      // Identity contract address (or wallet for demo)
        uint16 country;         // ISO 3166-1 country code
        bool isVerified;        // KYC verification status
        uint256 timestamp;      // Verification timestamp
    }
    
    // Mapping from wallet address to identity
    mapping(address => Identity) private _identities;
    
    // Mapping to track registered identities (before verification)
    mapping(address => bool) private _registered;
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Register an identity (public for demo purposes)
     * @param _onchainId The on-chain identity contract address
     * @notice Anyone can register, but admin must verify for token operations
     */
    function registerIdentity(address _onchainId) external override {
        require(_onchainId != address(0), "IdentityRegistry: invalid onchain ID");
        require(!_registered[msg.sender], "IdentityRegistry: already registered");
        
        _registered[msg.sender] = true;
        _identities[msg.sender].onchainId = _onchainId;
        
        emit IdentityRegistered(msg.sender, _onchainId);
    }
    
    /**
     * @dev Admin verifies an identity after KYC process
     * @param _wallet The wallet address to verify
     * @param _onchainId The on-chain identity contract
     * @param _country ISO 3166-1 country code
     * @notice Only owner can verify - simulates admin KYC approval
     */
    function adminVerify(address _wallet, address _onchainId, uint16 _country) 
        external 
        override 
        onlyOwner 
    {
        require(_wallet != address(0), "IdentityRegistry: invalid wallet");
        require(_onchainId != address(0), "IdentityRegistry: invalid onchain ID");
        require(_registered[_wallet], "IdentityRegistry: not registered");
        
        // Update identity with verification
        _identities[_wallet] = Identity({
            onchainId: _onchainId,
            country: _country,
            isVerified: true,
            timestamp: block.timestamp
        });
        
        emit IdentityVerified(_wallet, _onchainId, _country);
    }
    
    /**
     * @dev Check if a wallet is verified
     * @param _wallet The wallet address to check
     * @return bool True if wallet is KYC verified
     * @notice Used by RealEstateToken before transfers
     */
    function isVerified(address _wallet) external view override returns (bool) {
        return _identities[_wallet].isVerified;
    }
    
    /**
     * @dev Get the country of a verified wallet
     * @param _wallet The wallet address
     * @return uint16 The country code (0 if not verified)
     */
    function getCountry(address _wallet) external view override returns (uint16) {
        return _identities[_wallet].country;
    }
    
    /**
     * @dev Get full identity data (view function for frontend)
     * @param _wallet The wallet address
     * @return Identity struct data
     */
    function getIdentity(address _wallet) 
        external 
        view 
        returns (address onchainId, uint16 country, bool isVerified, uint256 timestamp) 
    {
        Identity memory identity = _identities[_wallet];
        return (identity.onchainId, identity.country, identity.isVerified, identity.timestamp);
    }
    
    /**
     * @dev Check if wallet is registered (but not necessarily verified)
     * @param _wallet The wallet address
     * @return bool True if registered
     */
    function isRegistered(address _wallet) external view returns (bool) {
        return _registered[_wallet];
    }
    
    // TODO: Add integration with Integra's Soulbound Token system
    // TODO: Add batch verification for multiple identities
    // TODO: Add revocation/suspension functionality for compliance
    
    /**
     * @dev Complete KYC verification for a user
     */
    function completeKYCVerification(
        address _userAddress,
        string calldata _kycProvider,
        bytes32 _documentHash,
        uint8 _riskLevel
    ) external onlyOwner {
        require(_identities[_userAddress].isActive, "IdentityRegistry: identity not found");
        require(approvedKYCProviders[_kycProvider], "IdentityRegistry: KYC provider not approved");
        require(_riskLevel >= 1 && _riskLevel <= 5, "IdentityRegistry: invalid risk level");
        
        _identities[_userAddress].isVerified = true;
        _identities[_userAddress].verificationDate = block.timestamp;
        _identities[_userAddress].kycProvider = _kycProvider;
        _identities[_userAddress].documentHash = _documentHash;
        _identities[_userAddress].riskLevel = _riskLevel;
        
        emit IdentityModified(_identities[_userAddress].onchainID, _identities[_userAddress].onchainID);
    }
    
    /**
     * @dev Delete an identity
     */
    function deleteIdentity(address _userAddress) 
        external 
        override 
        onlyOwner 
        
    {
        require(_identities[_userAddress].isActive, "IdentityRegistry: identity not found");
        
        address oldIdentity = _identities[_userAddress].onchainID;
        delete _identities[_userAddress];
        
        emit IdentityUnstored(_userAddress, oldIdentity);
    }
    
    /**
     * @dev Update identity address (for recovery or migration)
     */
    function updateIdentity(address _userAddress, address _identity) 
        external 
        override 
        onlyOwner 
    {
        require(_identities[_userAddress].isActive, "IdentityRegistry: identity not found");
        require(_identity != address(0), "IdentityRegistry: invalid identity address");
        
        address oldIdentity = _identities[_userAddress].onchainID;
        _identities[_userAddress].onchainID = _identity;
        
        emit IdentityModified(oldIdentity, _identity);
    }
    
    /**
     * @dev Update user's country
     */
    function updateCountry(address _userAddress, uint16 _country) 
        external 
        override 
        onlyOwner 
    {
        require(_identities[_userAddress].isActive, "IdentityRegistry: identity not found");
        
        _identities[_userAddress].country = _country;
        emit CountryModified(_userAddress, _country);
    }
    
    /**
     * @dev Update user's risk level
     */
    function updateRiskLevel(address _userAddress, uint8 _riskLevel) 
        external 
        onlyOwner 
    {
        require(_identities[_userAddress].isActive, "IdentityRegistry: identity not found");
        require(_riskLevel >= 1 && _riskLevel <= 5, "IdentityRegistry: invalid risk level");
        
        _identities[_userAddress].riskLevel = _riskLevel;
        emit RiskLevelUpdated(_userAddress, _riskLevel);
    }
    
    // Getter Functions
    
    /**
     * @dev Get identity address for a user
     */
    function identity(address _userAddress) 
        external 
        view 
        override 
        returns (address) 
    {
        return _identities[_userAddress].onchainID;
    }
    
    /**
     * @dev Get investor country
     */
    function investorCountry(address _userAddress) 
        external 
        view 
        override 
        returns (uint16) 
    {
        return _identities[_userAddress].country;
    }
    
    /**
     * @dev Check if user is verified
     */
    function isVerified(address _userAddress) 
        external 
        view 
        override 
        returns (bool) 
    {
        return _identities[_userAddress].isVerified && _identities[_userAddress].isActive;
    }
    
    /**
     * @dev Check if identity exists
     */
    function contains(address _userAddress) 
        external 
        view 
        override 
        returns (bool) 
    {
        return _identities[_userAddress].isActive;
    }
    
    /**
     * @dev Get complete identity information
     */
    function getIdentityDetails(address _userAddress) 
        external 
        view 
        returns (
            address onchainID,
            uint16 country,
            bool isVerified,
            uint256 verificationDate,
            string memory kycProvider,
            uint8 riskLevel,
            bool isActive
        ) 
    {
        Identity memory userIdentity = _identities[_userAddress];
        return (
            userIdentity.onchainID,
            userIdentity.country,
            userIdentity.isVerified,
            userIdentity.verificationDate,
            userIdentity.kycProvider,
            userIdentity.riskLevel,
            userIdentity.isActive
        );
    }
    
    /**
     * @dev Get user's risk level
     */
    function getRiskLevel(address _userAddress) external view returns (uint8) {
        return _identities[_userAddress].riskLevel;
    }
    
    // Batch Operations
    
    /**
     * @dev Register multiple identities at once
     */
    function batchRegisterIdentity(
        address[] calldata _userAddresses,
        address[] calldata _identities,
        uint16[] calldata _countries
    ) external override onlyOwner {
        require(
            _userAddresses.length == _identities.length && 
            _identities.length == _countries.length,
            "IdentityRegistry: arrays length mismatch"
        );
        
        for (uint256 i = 0; i < _userAddresses.length; i++) {
            if (supportedCountries[_countries[i]] && !restrictedCountries[_countries[i]]) {
                registerIdentity(_userAddresses[i], _identities[i], _countries[i]);
            }
        }
    }
    
    // Registry Binding (for integration with other contracts)
    
    /**
     * @dev Bind to another identity registry
     */
    function bindIdentityRegistry(address _identityRegistry) 
        external 
        override 
        onlyOwner 
    {
        require(_identityRegistry != address(0), "IdentityRegistry: invalid registry address");
        require(!_registryBound[_identityRegistry], "IdentityRegistry: registry already bound");
        
        _boundRegistries[msg.sender].push(_identityRegistry);
        _registryBound[_identityRegistry] = true;
        
        emit IdentityRegistryBound(_identityRegistry);
    }
    
    /**
     * @dev Unbind from another identity registry
     */
    function unbindIdentityRegistry(address _identityRegistry) 
        external 
        override 
        onlyOwner 
    {
        require(_registryBound[_identityRegistry], "IdentityRegistry: registry not bound");
        
        _registryBound[_identityRegistry] = false;
        
        // Remove from array
        address[] storage registries = _boundRegistries[msg.sender];
        for (uint256 i = 0; i < registries.length; i++) {
            if (registries[i] == _identityRegistry) {
                registries[i] = registries[registries.length - 1];
                registries.pop();
                break;
            }
        }
        
        emit IdentityRegistryUnbound(_identityRegistry);
    }
    
    // Admin Functions
    
    /**
     * @dev Add supported country
     */
    function setSupportedCountry(uint16 _country, bool _supported) 
        external 
        onlyOwner 
    {
        supportedCountries[_country] = _supported;
        emit CountrySupported(_country, _supported);
    }
    
    /**
     * @dev Set country restriction
     */
    function setRestrictedCountry(uint16 _country, bool _restricted) 
        external 
        onlyOwner 
    {
        restrictedCountries[_country] = _restricted;
        emit CountryRestricted(_country, _restricted);
    }
    
    /**
     * @dev Add approved KYC provider
     */
    function addKYCProvider(string calldata _provider) 
        external 
        onlyOwner 
    {
        approvedKYCProviders[_provider] = true;
        emit KYCProviderAdded(_provider);
    }
    
    /**
     * @dev Remove KYC provider
     */
    function removeKYCProvider(string calldata _provider) 
        external 
        onlyOwner 
    {
        approvedKYCProviders[_provider] = false;
        emit KYCProviderRemoved(_provider);
    }
    
    /**
     * @dev Emergency suspend identity
     */
    function suspendIdentity(address _userAddress) 
        external 
        onlyOwner 
    {
        require(_identities[_userAddress].isActive, "IdentityRegistry: identity not found");
        _identities[_userAddress].isVerified = false;
        
        emit IdentityModified(_identities[_userAddress].onchainID, address(0));
    }
    
    /**
     * @dev Reactivate suspended identity
     */
    function reactivateIdentity(address _userAddress) 
        external 
        onlyOwner 
    {
        require(_identities[_userAddress].isActive, "IdentityRegistry: identity not found");
        require(_identities[_userAddress].verificationDate > 0, "IdentityRegistry: never verified");
        
        _identities[_userAddress].isVerified = true;
        
        emit IdentityModified(address(0), _identities[_userAddress].onchainID);
    }
}