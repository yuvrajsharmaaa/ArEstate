// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IIdentityRegistry.sol";

/**
 * @title IdentityRegistry
 * @dev Manages user identities and KYC/AML compliance status
 * Integrates with Integra's identity modules and Soulbound Tokens
 */
contract IdentityRegistry is AccessControl, ReentrancyGuard, IIdentityRegistry {
    
    // Roles
    bytes32 public constant IDENTITY_REGISTRAR_ROLE = keccak256("IDENTITY_REGISTRAR_ROLE");
    bytes32 public constant COMPLIANCE_OFFICER_ROLE = keccak256("COMPLIANCE_OFFICER_ROLE");
    
    // Identity storage structure
    struct Identity {
        address onchainID;          // Soulbound Token or identity contract address
        uint16 country;             // ISO 3166-1 numeric country code
        bool isVerified;            // KYC/AML verification status
        uint256 verificationDate;   // Timestamp of verification
        string kycProvider;         // KYC provider identifier
        bytes32 documentHash;       // Hash of KYC documents
        uint8 riskLevel;           // Risk assessment level (1-5, 1 = low risk)
        bool isActive;             // Identity status
    }
    
    // Storage mappings
    mapping(address => Identity) private _identities;
    mapping(address => address[]) private _boundRegistries; // For registry binding
    mapping(address => bool) private _registryBound;
    
    // Supported countries for compliance
    mapping(uint16 => bool) public supportedCountries;
    mapping(uint16 => bool) public restrictedCountries;
    
    // KYC providers
    mapping(string => bool) public approvedKYCProviders;
    
    // Events
    event KYCProviderAdded(string provider);
    event KYCProviderRemoved(string provider);
    event CountrySupported(uint16 indexed country, bool supported);
    event CountryRestricted(uint16 indexed country, bool restricted);
    event RiskLevelUpdated(address indexed user, uint8 newRiskLevel);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(IDENTITY_REGISTRAR_ROLE, msg.sender);
        _grantRole(COMPLIANCE_OFFICER_ROLE, msg.sender);
        
        // Add initial supported countries (examples)
        supportedCountries[840] = true; // USA
        supportedCountries[826] = true; // UK  
        supportedCountries[124] = true; // Canada
        supportedCountries[276] = true; // Germany
        supportedCountries[702] = true; // Singapore
        
        // Add approved KYC providers
        approvedKYCProviders["jumio"] = true;
        approvedKYCProviders["onfido"] = true;
        approvedKYCProviders["sumsub"] = true;
    }
    
    // Modifiers
    modifier onlyRegistrar() {
        require(hasRole(IDENTITY_REGISTRAR_ROLE, msg.sender), "IdentityRegistry: not a registrar");
        _;
    }
    
    modifier onlyComplianceOfficer() {
        require(hasRole(COMPLIANCE_OFFICER_ROLE, msg.sender), "IdentityRegistry: not a compliance officer");
        _;
    }
    
    modifier validCountry(uint16 _country) {
        require(supportedCountries[_country], "IdentityRegistry: country not supported");
        require(!restrictedCountries[_country], "IdentityRegistry: country restricted");
        _;
    }
    
    // Core Identity Functions
    
    /**
     * @dev Register a new identity with KYC verification
     */
    function registerIdentity(
        address _userAddress,
        address _identity,
        uint16 _country
    ) external override onlyRegistrar validCountry(_country) nonReentrant {
        require(_userAddress != address(0), "IdentityRegistry: invalid user address");
        require(_identity != address(0), "IdentityRegistry: invalid identity address");
        require(!_identities[_userAddress].isActive, "IdentityRegistry: identity already exists");
        
        _identities[_userAddress] = Identity({
            onchainID: _identity,
            country: _country,
            isVerified: false, // Will be set to true after KYC completion
            verificationDate: 0,
            kycProvider: "",
            documentHash: bytes32(0),
            riskLevel: 3, // Default medium risk
            isActive: true
        });
        
        emit IdentityStored(_userAddress, _identity);
    }
    
    /**
     * @dev Complete KYC verification for a user
     */
    function completeKYCVerification(
        address _userAddress,
        string calldata _kycProvider,
        bytes32 _documentHash,
        uint8 _riskLevel
    ) external onlyComplianceOfficer {
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
        onlyRegistrar 
        nonReentrant 
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
        onlyRegistrar 
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
        onlyComplianceOfficer 
        validCountry(_country) 
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
        onlyComplianceOfficer 
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
    ) external override onlyRegistrar nonReentrant {
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
        onlyRole(DEFAULT_ADMIN_ROLE) 
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
        onlyRole(DEFAULT_ADMIN_ROLE) 
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
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        supportedCountries[_country] = _supported;
        emit CountrySupported(_country, _supported);
    }
    
    /**
     * @dev Set country restriction
     */
    function setRestrictedCountry(uint16 _country, bool _restricted) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        restrictedCountries[_country] = _restricted;
        emit CountryRestricted(_country, _restricted);
    }
    
    /**
     * @dev Add approved KYC provider
     */
    function addKYCProvider(string calldata _provider) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        approvedKYCProviders[_provider] = true;
        emit KYCProviderAdded(_provider);
    }
    
    /**
     * @dev Remove KYC provider
     */
    function removeKYCProvider(string calldata _provider) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        approvedKYCProviders[_provider] = false;
        emit KYCProviderRemoved(_provider);
    }
    
    /**
     * @dev Emergency suspend identity
     */
    function suspendIdentity(address _userAddress) 
        external 
        onlyComplianceOfficer 
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
        onlyComplianceOfficer 
    {
        require(_identities[_userAddress].isActive, "IdentityRegistry: identity not found");
        require(_identities[_userAddress].verificationDate > 0, "IdentityRegistry: never verified");
        
        _identities[_userAddress].isVerified = true;
        
        emit IdentityModified(address(0), _identities[_userAddress].onchainID);
    }
}