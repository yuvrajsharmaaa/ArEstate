// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IIdentityRegistry.sol";
import "./interfaces/ICompliance.sol";

/**
 * @title RealEstateToken
 * @dev ERC-3643-like permissioned ERC20 token for real estate tokenization
 * @notice Purpose: Tokenize real estate assets with compliance and identity verification
 * 
 * Expected edits for production:
 * - Add more sophisticated metadata storage (IPFS integration)
 * - Implement dividend distribution mechanisms
 * - Add integration with Integra's RWA Asset Passport
 * - Add support for fractional ownership tracking
 * 
 * Security notes:
 * - All transfers must pass compliance checks
 * - Only verified addresses can receive tokens
 * - AGENT_ROLE can force transfers for compliance
 * - Minting requires MINTER_ROLE
 */
contract RealEstateToken is ERC20, AccessControl, ReentrancyGuard {
    
    // Role definitions
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    
    // Contract references
    IIdentityRegistry public immutable identityRegistry;
    ICompliance public immutable compliance;
    
    // Token metadata for real estate asset
    struct AssetMetadata {
        string propertyAddress;     // Physical property address
        string assetPassportCID;    // IPFS CID for Integra Asset Passport
        uint256 totalValue;         // Total property valuation in USD
        uint256 tokenizedShares;    // Total shares tokenized
        bool isActive;              // Asset status
    }
    
    AssetMetadata public assetMetadata;
    
    // Events for ERC-3643 compatibility
    event ForcedTransfer(
        address indexed controller,
        address indexed from,
        address indexed to,
        uint256 amount
    );
    
    event AssetPassportUpdated(string indexed cid);
    
    constructor(
        string memory _name,
        string memory _symbol,
        address _identityRegistry,
        address _compliance,
        AssetMetadata memory _assetData
    ) ERC20(_name, _symbol) {
        require(_identityRegistry != address(0), "RealEstateToken: invalid identity registry");
        require(_compliance != address(0), "RealEstateToken: invalid compliance");
        require(bytes(_assetData.propertyAddress).length > 0, "RealEstateToken: invalid property address");
        
        // Set up roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(AGENT_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ROLE, msg.sender);
        
        // Set contract references (immutable)
        identityRegistry = IIdentityRegistry(_identityRegistry);
        compliance = ICompliance(_compliance);
        
        // Set asset metadata
        assetMetadata = _assetData;
        
        emit AssetPassportUpdated(_assetData.assetPassportCID);
    }
    
    /**
     * @dev Override transfer to include compliance checks
     * @param to The recipient address
     * @param amount The amount to transfer
     * @return bool Success status
     * @notice Ensures recipient is verified and transfer is compliant
     */
    function transfer(address to, uint256 amount) 
        public 
        virtual 
        override 
        returns (bool) 
    {
        address owner = _msgSender();
        
        // Check compliance before transfer
        require(compliance.canTransfer(owner, to, amount), "RealEstateToken: transfer not compliant");
        
        // Execute transfer
        _transfer(owner, to, amount);
        return true;
    }
    
    /**
     * @dev Override transferFrom to include compliance checks
     * @param from The sender address
     * @param to The recipient address
     * @param amount The amount to transfer
     * @return bool Success status
     */
    function transferFrom(address from, address to, uint256 amount) 
        public 
        virtual 
        override 
        returns (bool) 
    {
        address spender = _msgSender();
        
        // Check compliance before transfer
        require(compliance.canTransfer(from, to, amount), "RealEstateToken: transfer not compliant");
        
        // Update allowance and execute transfer
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }
    
    /**
     * @dev Forced transfer by compliance agent (ERC-3643 requirement)
     * @param from The sender address
     * @param to The recipient address
     * @param amount The amount to force transfer
     * @return bool Success status
     * @notice Only AGENT_ROLE can force transfers for compliance/legal reasons
     */
    function forcedTransfer(address from, address to, uint256 amount) 
        external 
        onlyRole(AGENT_ROLE) 
        nonReentrant
        returns (bool) 
    {
        require(from != address(0), "RealEstateToken: transfer from zero address");
        require(to != address(0), "RealEstateToken: transfer to zero address");
        require(balanceOf(from) >= amount, "RealEstateToken: insufficient balance");
        
        // Must have valid recipient identity (even for forced transfers)
        require(identityRegistry.isVerified(to), "RealEstateToken: recipient not verified");
        
        // Execute forced transfer without compliance check
        _transfer(from, to, amount);
        
        emit ForcedTransfer(_msgSender(), from, to, amount);
        return true;
    }
    
    /**
     * @dev Mint new tokens to verified address
     * @param to The recipient address
     * @param amount The amount to mint
     * @notice Only MINTER_ROLE can mint, recipient must be verified
     */
    function mint(address to, uint256 amount) 
        external 
        onlyRole(MINTER_ROLE) 
        nonReentrant 
    {
        require(to != address(0), "RealEstateToken: mint to zero address");
        require(amount > 0, "RealEstateToken: mint amount must be positive");
        
        // Check compliance for minting (from zero address)
        require(compliance.canTransfer(address(0), to, amount), "RealEstateToken: mint not compliant");
        
        _mint(to, amount);
    }
    
    /**
     * @dev Burn tokens from address
     * @param from The address to burn from
     * @param amount The amount to burn
     * @notice Only MINTER_ROLE can burn tokens
     */
    function burn(address from, uint256 amount) 
        external 
        onlyRole(MINTER_ROLE) 
        nonReentrant 
    {
        require(from != address(0), "RealEstateToken: burn from zero address");
        require(balanceOf(from) >= amount, "RealEstateToken: insufficient balance to burn");
        
        _burn(from, amount);
    }
    
    /**
     * @dev Update asset passport CID
     * @param _cid New IPFS CID for asset passport
     * @notice Only admin can update asset passport reference
     */    /**
     * @dev Update asset passport CID
     * @param _cid New IPFS CID for asset passport
     * @notice Only admin can update asset passport reference
     */
    function updateAssetPassport(string memory _cid) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(bytes(_cid).length > 0, "RealEstateToken: invalid CID");
        
        assetMetadata.assetPassportCID = _cid;
        emit AssetPassportUpdated(_cid);
    }
    
    /**
     * @dev Update asset metadata
     * @param _propertyAddress New property address
     * @param _totalValue New total valuation
     * @param _tokenizedShares New tokenized shares amount
     * @param _isActive Asset active status
     * @notice Only admin can update asset metadata
     */
    function updateAssetMetadata(
        string memory _propertyAddress,
        uint256 _totalValue,
        uint256 _tokenizedShares,
        bool _isActive
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(bytes(_propertyAddress).length > 0, "RealEstateToken: invalid property address");
        
        assetMetadata.propertyAddress = _propertyAddress;
        assetMetadata.totalValue = _totalValue;
        assetMetadata.tokenizedShares = _tokenizedShares;
        assetMetadata.isActive = _isActive;
    }
    
    /**
     * @dev Get asset metadata
     * @return AssetMetadata struct with all asset information
     */
    function getAssetMetadata() 
        external 
        view 
        returns (AssetMetadata memory) 
    {
        return assetMetadata;
    }
    
    /**
     * @dev Check if address can receive tokens
     * @param account The address to check
     * @return bool True if address can receive tokens
     */
    function canReceive(address account) external view returns (bool) {
        if (account == address(0)) return false;
        return compliance.canTransfer(address(0), account, 1);
    }
    
    /**
     * @dev Get token holder count (placeholder)
     * @return uint256 Number of token holders
     */
    function getHolderCount() external view returns (uint256) {
        // Placeholder implementation - would need to track holders separately
        return 0;
    }
    
    /**
     * @dev Check if transfer is allowed between addresses
     * @param from Sender address
     * @param to Recipient address
     * @param amount Transfer amount
     * @return bool True if transfer is allowed
     */
    function canTransfer(address from, address to, uint256 amount) 
        external 
        view 
        returns (bool) 
    {
        return compliance.canTransfer(from, to, amount);
    }
    
    /**
     * @dev Returns true if account has been granted role
     * @param role The role to check
     * @param account The account to check
     * @return bool True if account has role
     */
    function hasRole(bytes32 role, address account) 
        public 
        view 
        virtual 
        override 
        returns (bool) 
    {
        return super.hasRole(role, account);
    }
    
    // TODO: Add dividend distribution functionality
    // TODO: Add integration with Integra's Global Orderbook for secondary trading
    // TODO: Add support for partial ownership transfers and fractional management
    // TODO: Add integration with property valuation oracles
    // TODO: Add emergency pause functionality for compliance requirements
}