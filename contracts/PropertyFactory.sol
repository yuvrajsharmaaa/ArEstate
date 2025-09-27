// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "./RealEstateToken.sol";
import "./interfaces/IIdentityRegistry.sol";
import "./interfaces/ICompliance.sol";

/**
 * @title PropertyFactory
 * @dev Factory contract for creating and managing multiple tokenized properties dynamically
 * @notice Purpose: Enable dynamic creation of real estate tokens with flexible parameters
 * 
 * Dynamic Features:
 * - Create unlimited properties with unique parameters
 * - Flexible token economics per property
 * - Dynamic metadata updates via IPFS
 * - Configurable compliance per property type
 * - Property lifecycle management
 */
contract PropertyFactory is AccessControl, ReentrancyGuard {
    
    // Role definitions
    bytes32 public constant PROPERTY_CREATOR_ROLE = keccak256("PROPERTY_CREATOR_ROLE");
    bytes32 public constant PROPERTY_MANAGER_ROLE = keccak256("PROPERTY_MANAGER_ROLE");
    bytes32 public constant COMPLIANCE_ADMIN_ROLE = keccak256("COMPLIANCE_ADMIN_ROLE");
    
    // Core contracts
    address public immutable identityRegistry;
    address public immutable complianceTemplate;
    address public immutable tokenImplementation;
    
    // Property categories for different compliance rules
    enum PropertyCategory {
        RESIDENTIAL,
        COMMERCIAL, 
        INDUSTRIAL,
        MIXED_USE,
        LUXURY,
        AFFORDABLE_HOUSING
    }
    
    // Dynamic property configuration
    struct PropertyConfig {
        string name;                    // Token name
        string symbol;                  // Token symbol  
        PropertyCategory category;      // Property type for compliance
        string location;                // Physical address/coordinates
        string description;             // Property description
        uint256 totalValue;            // Total property valuation (USD)
        uint256 totalSupply;           // Max tokens to mint
        uint256 minInvestment;         // Minimum investment amount
        uint256 maxInvestment;         // Maximum investment per investor
        bool fractionalOwnership;      // Allow fractional ownership
        string metadataCID;            // IPFS CID for detailed metadata
        address[] authorizedManagers;  // Property managers
        uint256 creationTime;          // Creation timestamp
        bool isActive;                 // Property status
    }
    
    // Token economics configuration  
    struct TokenEconomics {
        uint256 managementFee;         // Annual fee (basis points)
        uint256 performanceFee;        // Performance fee (basis points) 
        uint256 liquidityBuffer;       // Reserve for buybacks (basis points)
        bool enableDividends;          // Dividend distribution enabled
        bool enableBuyback;            // Token buyback enabled
        bool enableStaking;            // Staking rewards enabled
        uint256 stakingReward;         // Annual staking reward (basis points)
    }
    
    // Storage
    mapping(uint256 => address) public properties;           // propertyId => token contract
    mapping(uint256 => PropertyConfig) public propertyConfigs;
    mapping(uint256 => TokenEconomics) public tokenEconomics;
    mapping(PropertyCategory => address) public categoryCompliance; // Custom compliance per category
    mapping(address => uint256[]) public creatorProperties;   // creator => property IDs
    
    uint256 private _nextPropertyId = 1;
    uint256 public totalProperties;
    
    // Events
    event PropertyCreated(
        uint256 indexed propertyId,
        address indexed tokenContract,
        address indexed creator,
        string name,
        PropertyCategory category
    );
    
    event PropertyUpdated(
        uint256 indexed propertyId,
        string metadataCID,
        bool isActive
    );
    
    event TokenEconomicsUpdated(
        uint256 indexed propertyId,
        uint256 managementFee,
        uint256 performanceFee
    );
    
    event PropertyManagerAdded(
        uint256 indexed propertyId,
        address indexed manager
    );
    
    constructor(
        address _identityRegistry,
        address _complianceTemplate,
        address _tokenImplementation
    ) {
        require(_identityRegistry != address(0), "PropertyFactory: invalid identity registry");
        require(_complianceTemplate != address(0), "PropertyFactory: invalid compliance template");
        require(_tokenImplementation != address(0), "PropertyFactory: invalid token implementation");
        
        identityRegistry = _identityRegistry;
        complianceTemplate = _complianceTemplate;
        tokenImplementation = _tokenImplementation;
        
        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PROPERTY_CREATOR_ROLE, msg.sender);
        _grantRole(PROPERTY_MANAGER_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Create a new tokenized property with dynamic configuration
     * @param config Property configuration struct
     * @param economics Token economics struct
     * @return propertyId The ID of the created property
     */
    function createProperty(
        PropertyConfig memory config,
        TokenEconomics memory economics
    ) external nonReentrant onlyRole(PROPERTY_CREATOR_ROLE) returns (uint256) {
        require(bytes(config.name).length > 0, "PropertyFactory: invalid name");
        require(bytes(config.symbol).length > 0, "PropertyFactory: invalid symbol");
        require(config.totalValue > 0, "PropertyFactory: invalid total value");
        require(config.totalSupply > 0, "PropertyFactory: invalid total supply");
        require(config.minInvestment > 0, "PropertyFactory: invalid min investment");
        require(config.maxInvestment >= config.minInvestment, "PropertyFactory: invalid max investment");
        
        uint256 propertyId = _nextPropertyId++;
        
        // Set configuration
        config.creationTime = block.timestamp;
        config.isActive = true;
        propertyConfigs[propertyId] = config;
        tokenEconomics[propertyId] = economics;
        
        // Get compliance contract for this category
        address compliance = categoryCompliance[config.category];
        if (compliance == address(0)) {
            compliance = complianceTemplate; // Use default compliance
        }
        
        // Create token contract using minimal proxy (Clones)
        address tokenContract = Clones.clone(tokenImplementation);
        
        // Initialize the token
        RealEstateToken.AssetMetadata memory assetData = RealEstateToken.AssetMetadata({
            propertyAddress: config.location,
            assetPassportCID: config.metadataCID,
            totalValue: config.totalValue,
            tokenizedShares: config.totalSupply,
            isActive: true
        });
        
        RealEstateToken(tokenContract).initialize(
            config.name,
            config.symbol,
            identityRegistry,
            compliance,
            assetData,
            msg.sender
        );
        
        // Store references
        properties[propertyId] = tokenContract;
        creatorProperties[msg.sender].push(propertyId);
        totalProperties++;
        
        // Grant management roles to authorized managers
        for (uint i = 0; i < config.authorizedManagers.length; i++) {
            address manager = config.authorizedManagers[i];
            if (manager != address(0)) {
                RealEstateToken(tokenContract).grantRole(
                    RealEstateToken(tokenContract).MINTER_ROLE(),
                    manager
                );
                emit PropertyManagerAdded(propertyId, manager);
            }
        }
        
        emit PropertyCreated(propertyId, tokenContract, msg.sender, config.name, config.category);
        
        return propertyId;
    }
    
    /**
     * @dev Update property metadata dynamically
     * @param propertyId The property ID to update
     * @param newMetadataCID New IPFS CID for metadata
     * @param isActive New active status
     */
    function updateProperty(
        uint256 propertyId,
        string memory newMetadataCID,
        bool isActive
    ) external onlyRole(PROPERTY_MANAGER_ROLE) {
        require(properties[propertyId] != address(0), "PropertyFactory: property not found");
        
        propertyConfigs[propertyId].metadataCID = newMetadataCID;
        propertyConfigs[propertyId].isActive = isActive;
        
        emit PropertyUpdated(propertyId, newMetadataCID, isActive);
    }
    
    /**
     * @dev Update token economics dynamically
     * @param propertyId The property ID to update
     * @param newEconomics New token economics configuration
     */
    function updateTokenEconomics(
        uint256 propertyId,
        TokenEconomics memory newEconomics
    ) external onlyRole(PROPERTY_MANAGER_ROLE) {
        require(properties[propertyId] != address(0), "PropertyFactory: property not found");
        require(newEconomics.managementFee <= 1000, "PropertyFactory: management fee too high"); // Max 10%
        require(newEconomics.performanceFee <= 2000, "PropertyFactory: performance fee too high"); // Max 20%
        
        tokenEconomics[propertyId] = newEconomics;
        
        emit TokenEconomicsUpdated(propertyId, newEconomics.managementFee, newEconomics.performanceFee);
    }
    
    /**
     * @dev Set category-specific compliance contract
     * @param category Property category
     * @param complianceContract Compliance contract address
     */
    function setCategoryCompliance(
        PropertyCategory category,
        address complianceContract
    ) external onlyRole(COMPLIANCE_ADMIN_ROLE) {
        require(complianceContract != address(0), "PropertyFactory: invalid compliance contract");
        categoryCompliance[category] = complianceContract;
    }
    
    /**
     * @dev Add authorized manager to a property
     * @param propertyId The property ID
     * @param manager Manager address to add
     */
    function addPropertyManager(
        uint256 propertyId,
        address manager
    ) external onlyRole(PROPERTY_MANAGER_ROLE) {
        require(properties[propertyId] != address(0), "PropertyFactory: property not found");
        require(manager != address(0), "PropertyFactory: invalid manager");
        
        address tokenContract = properties[propertyId];
        RealEstateToken(tokenContract).grantRole(
            RealEstateToken(tokenContract).MINTER_ROLE(),
            manager
        );
        
        // Add to authorized managers list
        propertyConfigs[propertyId].authorizedManagers.push(manager);
        
        emit PropertyManagerAdded(propertyId, manager);
    }
    
    /**
     * @dev Get property token contract address
     * @param propertyId The property ID
     * @return address Token contract address
     */
    function getPropertyToken(uint256 propertyId) external view returns (address) {
        return properties[propertyId];
    }
    
    /**
     * @dev Get properties created by an address
     * @param creator Creator address
     * @return uint256[] Array of property IDs
     */
    function getCreatorProperties(address creator) external view returns (uint256[] memory) {
        return creatorProperties[creator];
    }
    
    /**
     * @dev Get property configuration
     * @param propertyId The property ID
     * @return PropertyConfig Property configuration struct
     */
    function getPropertyConfig(uint256 propertyId) external view returns (PropertyConfig memory) {
        return propertyConfigs[propertyId];
    }
    
    /**
     * @dev Get token economics configuration
     * @param propertyId The property ID
     * @return TokenEconomics Token economics struct
     */
    function getTokenEconomics(uint256 propertyId) external view returns (TokenEconomics memory) {
        return tokenEconomics[propertyId];
    }
    
    /**
     * @dev Get properties by category
     * @param category Property category
     * @return uint256[] Array of property IDs in the category
     */
    function getPropertiesByCategory(PropertyCategory category) external view returns (uint256[] memory) {
        uint256[] memory result = new uint256[](totalProperties);
        uint256 count = 0;
        
        for (uint256 i = 1; i < _nextPropertyId; i++) {
            if (propertyConfigs[i].category == category && propertyConfigs[i].isActive) {
                result[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory filteredResult = new uint256[](count);
        for (uint256 j = 0; j < count; j++) {
            filteredResult[j] = result[j];
        }
        
        return filteredResult;
    }
    
    /**
     * @dev Emergency pause/unpause a property
     * @param propertyId The property ID
     * @param paused Pause status
     */
    function emergencyPause(uint256 propertyId, bool paused) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(properties[propertyId] != address(0), "PropertyFactory: property not found");
        
        address tokenContract = properties[propertyId];
        if (paused) {
            // Pause functionality could be added to RealEstateToken
            propertyConfigs[propertyId].isActive = false;
        } else {
            propertyConfigs[propertyId].isActive = true;
        }
        
        emit PropertyUpdated(propertyId, propertyConfigs[propertyId].metadataCID, !paused);
    }
    
    /**
     * @dev Get total number of active properties
     * @return uint256 Number of active properties
     */
    function getActivePropertiesCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 1; i < _nextPropertyId; i++) {
            if (propertyConfigs[i].isActive) {
                count++;
            }
        }
        return count;
    }
}