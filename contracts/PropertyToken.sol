// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IIdentityRegistry.sol";
import "./interfaces/ICompliance.sol";

/**
 * @title PropertyToken
 * @dev ERC-3643 compliant security token for real estate tokenization
 */
contract PropertyToken is ERC20, AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    
    IIdentityRegistry public identityRegistry;
    ICompliance public compliance;
    
    // Token state mappings
    mapping(address => bool) private _frozen;
    mapping(address => uint256) private _frozenTokens;
    
    // Property metadata
    struct PropertyInfo {
        string propertyAddress;
        string description;
        uint256 totalValue;
        uint256 tokenSupply;
        string metadataURI;
    }
    
    PropertyInfo public propertyInfo;
    
    // Events
    event AddressFrozen(address indexed account, bool frozen);
    event TokensFrozen(address indexed account, uint256 amount);
    event TokensUnfrozen(address indexed account, uint256 amount);
    event ForcedTransfer(address indexed from, address indexed to, uint256 amount);
    event ComplianceUpdated(address indexed oldCompliance, address indexed newCompliance);
    event IdentityRegistryUpdated(address indexed oldRegistry, address indexed newRegistry);
    
    constructor(
        string memory name,
        string memory symbol,
        address _identityRegistry,
        address _compliance,
        PropertyInfo memory _propertyInfo
    ) ERC20(name, symbol) {
        require(_identityRegistry != address(0), "Invalid identity registry");
        require(_compliance != address(0), "Invalid compliance");
        
        identityRegistry = IIdentityRegistry(_identityRegistry);
        compliance = ICompliance(_compliance);
        propertyInfo = _propertyInfo;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(AGENT_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ROLE, msg.sender);
    }
    
    // Override transfer functions to include compliance checks
    function transfer(address to, uint256 amount) public override whenNotPaused nonReentrant returns (bool) {
        address owner = _msgSender();
        require(!_frozen[owner], "Sender is frozen");
        require(!_frozen[to], "Recipient is frozen");
        require(_canTransfer(owner, to, amount), "Transfer not compliant");
        
        bool success = super.transfer(to, amount);
        if (success) {
            compliance.transferred(owner, to, amount);
        }
        return success;
    }
    
    function transferFrom(address from, address to, uint256 amount) public override whenNotPaused nonReentrant returns (bool) {
        require(!_frozen[from], "Sender is frozen");
        require(!_frozen[to], "Recipient is frozen");
        require(_canTransfer(from, to, amount), "Transfer not compliant");
        
        bool success = super.transferFrom(from, to, amount);
        if (success) {
            compliance.transferred(from, to, amount);
        }
        return success;
    }
    
    // Minting function
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(to != address(0), "Cannot mint to zero address");
        require(!_frozen[to], "Recipient is frozen");
        require(_canTransfer(address(0), to, amount), "Mint not compliant");
        
        _mint(to, amount);
        compliance.created(to, amount);
    }
    
    // Burning function
    function burn(address from, uint256 amount) external onlyRole(AGENT_ROLE) whenNotPaused {
        require(from != address(0), "Cannot burn from zero address");
        require(_canTransfer(from, address(0), amount), "Burn not compliant");
        
        _burn(from, amount);
        compliance.destroyed(from, amount);
    }
    
    // Forced transfer (for compliance/court orders)
    function forcedTransfer(
        address from,
        address to,
        uint256 amount
    ) external onlyRole(AGENT_ROLE) whenNotPaused returns (bool) {
        require(from != address(0), "Invalid from address");
        require(to != address(0), "Invalid to address");
        require(balanceOf(from) >= amount, "Insufficient balance");
        
        _transfer(from, to, amount);
        compliance.transferred(from, to, amount);
        
        emit ForcedTransfer(from, to, amount);
        return true;
    }
    
    // Address freezing functions
    function setAddressFrozen(address account, bool frozen) external onlyRole(AGENT_ROLE) {
        require(account != address(0), "Invalid account");
        _frozen[account] = frozen;
        emit AddressFrozen(account, frozen);
    }
    
    function freezePartialTokens(address account, uint256 amount) external onlyRole(AGENT_ROLE) {
        require(account != address(0), "Invalid account");
        require(balanceOf(account) >= amount, "Insufficient balance");
        
        _frozenTokens[account] += amount;
        emit TokensFrozen(account, amount);
    }
    
    function unfreezePartialTokens(address account, uint256 amount) external onlyRole(AGENT_ROLE) {
        require(account != address(0), "Invalid account");
        require(_frozenTokens[account] >= amount, "Insufficient frozen tokens");
        
        _frozenTokens[account] -= amount;
        emit TokensUnfrozen(account, amount);
    }
    
    // View functions
    function isAddressFrozen(address account) external view returns (bool) {
        return _frozen[account];
    }
    
    function getFrozenTokens(address account) external view returns (uint256) {
        return _frozenTokens[account];
    }
    
    function canTransfer(address from, address to, uint256 amount) external view returns (bool) {
        return _canTransfer(from, to, amount);
    }
    
    // Administrative functions
    function setIdentityRegistry(address newRegistry) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newRegistry != address(0), "Invalid registry");
        address oldRegistry = address(identityRegistry);
        identityRegistry = IIdentityRegistry(newRegistry);
        emit IdentityRegistryUpdated(oldRegistry, newRegistry);
    }
    
    function setCompliance(address newCompliance) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newCompliance != address(0), "Invalid compliance");
        address oldCompliance = address(compliance);
        compliance = ICompliance(newCompliance);
        emit ComplianceUpdated(oldCompliance, newCompliance);
    }
    
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    function updatePropertyInfo(PropertyInfo memory newInfo) external onlyRole(DEFAULT_ADMIN_ROLE) {
        propertyInfo = newInfo;
    }
    
    // Internal functions
    function _canTransfer(address from, address to, uint256 amount) internal view returns (bool) {
        return compliance.canTransfer(from, to, amount);
    }
    
    // Override decimals to use 18 decimals
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}