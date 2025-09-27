// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/IERC3643.sol";
import "./interfaces/IIdentityRegistry.sol";
import "./interfaces/ICompliance.sol";

/**
 * @title PropertyToken
 * @dev ERC-3643 compliant security token for real estate tokenization
 * Integrates with Integra's RWA Asset Passport and compliance modules
 */
contract PropertyToken is ERC20, AccessControl, ReentrancyGuard, Pausable, IERC3643 {
    
    // Roles
    bytes32 public constant TOKEN_AGENT_ROLE = keccak256("TOKEN_AGENT_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    bytes32 public constant RECOVERY_ROLE = keccak256("RECOVERY_ROLE");
    
    // Core compliance contracts
    IIdentityRegistry private _identityRegistry;
    ICompliance private _compliance;
    
    // Property metadata (linked to Integra RWA Asset Passport)
    struct PropertyMetadata {
        string assetPassportId;     // Integra RWA Asset Passport ID
        string propertyAddress;     // Physical property address
        uint256 totalValue;         // Total property valuation in USD
        uint256 tokenizedPercentage; // Percentage of property tokenized (1-10000 = 0.01%-100%)
        string jurisdiction;        // Legal jurisdiction
        bytes32 documentHash;       // Hash of property documents
        bool isActive;              // Property status
    }
    
    PropertyMetadata public propertyMetadata;
    
    // Token freezing
    mapping(address => bool) private _frozen;
    mapping(address => uint256) private _frozenTokens;
    
    // Events specific to property tokenization
    event PropertyMetadataUpdated(
        string indexed assetPassportId,
        string propertyAddress,
        uint256 totalValue
    );
    event PropertyDocumentsUpdated(bytes32 indexed documentHash);
    
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        address _identityRegistry,
        address _compliance,
        PropertyMetadata memory _propertyData
    ) ERC20(_name, _symbol) {
        require(_identityRegistry != address(0), "PropertyToken: invalid identity registry");
        require(_compliance != address(0), "PropertyToken: invalid compliance");
        require(bytes(_propertyData.assetPassportId).length > 0, "PropertyToken: invalid asset passport");
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(TOKEN_AGENT_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ROLE, msg.sender);
        _grantRole(RECOVERY_ROLE, msg.sender);
        
        _identityRegistry = IIdentityRegistry(_identityRegistry);
        _compliance = ICompliance(_compliance);
        propertyMetadata = _propertyData;
        
        emit IdentityRegistryAdded(_identityRegistry);
        emit ComplianceAdded(_compliance);
        emit PropertyMetadataUpdated(
            _propertyData.assetPassportId,
            _propertyData.propertyAddress,
            _propertyData.totalValue
        );
    }
    
    // Modifiers
    modifier onlyTokenAgent() {
        require(hasRole(TOKEN_AGENT_ROLE, msg.sender), "PropertyToken: not a token agent");
        _;
    }
    
    modifier onlyCompliance() {
        require(hasRole(COMPLIANCE_ROLE, msg.sender), "PropertyToken: not compliance officer");
        _;
    }
    
    modifier onlyRecoveryAgent() {
        require(hasRole(RECOVERY_ROLE, msg.sender), "PropertyToken: not recovery agent");
        _;
    }
    
    modifier notFrozen(address _userAddress) {
        require(!_frozen[_userAddress], "PropertyToken: address is frozen");
        _;
    }
    
    modifier complianceCheck(address _from, address _to, uint256 _amount) {
        require(canTransfer(_from, _to, _amount), "PropertyToken: transfer not compliant");
        _;
    }
    
    // Core ERC-20 overrides with compliance
    
    /**
     * @dev Override transfer with compliance checks
     */
    function transfer(address _to, uint256 _amount) 
        public 
        override(ERC20, IERC3643) 
        whenNotPaused 
        notFrozen(msg.sender) 
        notFrozen(_to)
        complianceCheck(msg.sender, _to, _amount)
        returns (bool) 
    {
        require(balanceOf(msg.sender) - _frozenTokens[msg.sender] >= _amount, 
                "PropertyToken: insufficient unfrozen balance");
        
        bool success = super.transfer(_to, _amount);
        if (success) {
            _compliance.transferred(msg.sender, _to, _amount);
        }
        return success;
    }
    
    /**
     * @dev Override transferFrom with compliance checks
     */
    function transferFrom(address _from, address _to, uint256 _amount) 
        public 
        override(ERC20, IERC3643) 
        whenNotPaused 
        notFrozen(_from) 
        notFrozen(_to)
        complianceCheck(_from, _to, _amount)
        returns (bool) 
    {
        require(balanceOf(_from) - _frozenTokens[_from] >= _amount, 
                "PropertyToken: insufficient unfrozen balance");
        
        bool success = super.transferFrom(_from, _to, _amount);
        if (success) {
            _compliance.transferred(_from, _to, _amount);
        }
        return success;
    }
    
    // ERC-3643 Compliance Functions
    
    /**
     * @dev Check if transfer is compliant
     */
    function canTransfer(address _from, address _to, uint256 _amount) 
        public 
        view 
        override 
        returns (bool) 
    {
        if (paused()) return false;
        if (_frozen[_from] || _frozen[_to]) return false;
        if (balanceOf(_from) - _frozenTokens[_from] < _amount) return false;
        if (!_identityRegistry.isVerified(_from) || !_identityRegistry.isVerified(_to)) return false;
        
        return _compliance.canTransfer(_from, _to, _amount);
    }
    
    /**
     * @dev Get identity registry address
     */
    function identityRegistry() external view override returns (address) {
        return address(_identityRegistry);
    }
    
    /**
     * @dev Get compliance contract address
     */
    function compliance() external view override returns (address) {
        return address(_compliance);
    }
    
    // Freezing Functions
    
    /**
     * @dev Check if address is frozen
     */
    function isAddressFrozen(address _userAddress) external view override returns (bool) {
        return _frozen[_userAddress];
    }
    
    /**
     * @dev Get frozen token amount for address
     */
    function getFrozenTokens(address _userAddress) external view override returns (uint256) {
        return _frozenTokens[_userAddress];
    }
    
    /**
     * @dev Freeze/unfreeze an address
     */
    function setAddressFrozen(address _userAddress, bool _freeze) 
        external 
        override 
        onlyCompliance 
    {
        _frozen[_userAddress] = _freeze;
        emit AddressFrozen(_userAddress, _freeze, msg.sender);
    }
    
    /**
     * @dev Freeze partial tokens
     */
    function freezePartialTokens(address _userAddress, uint256 _amount) 
        external 
        override 
        onlyCompliance 
    {
        require(_amount <= balanceOf(_userAddress), "PropertyToken: insufficient balance");
        require(_frozenTokens[_userAddress] + _amount <= balanceOf(_userAddress), 
                "PropertyToken: freeze amount exceeds balance");
        
        _frozenTokens[_userAddress] += _amount;
        emit TokensFrozen(_userAddress, _amount);
    }
    
    /**
     * @dev Unfreeze partial tokens
     */
    function unfreezePartialTokens(address _userAddress, uint256 _amount) 
        external 
        override 
        onlyCompliance 
    {
        require(_amount <= _frozenTokens[_userAddress], "PropertyToken: insufficient frozen tokens");
        
        _frozenTokens[_userAddress] -= _amount;
        emit TokensUnfrozen(_userAddress, _amount);
    }
    
    // Forced Operations (Compliance)
    
    /**
     * @dev Forced transfer for compliance
     */
    function forcedTransfer(address _from, address _to, uint256 _amount) 
        external 
        override 
        onlyCompliance 
        nonReentrant
        returns (bool) 
    {
        require(_identityRegistry.isVerified(_to), "PropertyToken: recipient not verified");
        require(balanceOf(_from) >= _amount, "PropertyToken: insufficient balance");
        
        // Temporarily unfreeze tokens if needed for forced transfer
        if (_frozenTokens[_from] > 0) {
            uint256 availableBalance = balanceOf(_from) - _frozenTokens[_from];
            if (_amount > availableBalance) {
                uint256 unfreezeAmount = _amount - availableBalance;
                _frozenTokens[_from] -= unfreezeAmount;
            }
        }
        
        _transfer(_from, _to, _amount);
        _compliance.transferred(_from, _to, _amount);
        
        return true;
    }
    
    /**
     * @dev Mint new tokens
     */
    function mint(address _to, uint256 _amount) 
        external 
        override 
        onlyTokenAgent 
        nonReentrant 
    {
        require(_identityRegistry.isVerified(_to), "PropertyToken: recipient not verified");
        require(_amount > 0, "PropertyToken: invalid amount");
        
        _mint(_to, _amount);
        _compliance.created(_to, _amount);
    }
    
    /**
     * @dev Burn tokens
     */
    function burn(address _userAddress, uint256 _amount) 
        external 
        override 
        onlyTokenAgent 
        nonReentrant 
    {
        require(balanceOf(_userAddress) >= _amount, "PropertyToken: insufficient balance");
        
        // Reduce frozen tokens if necessary
        if (_frozenTokens[_userAddress] > 0) {
            uint256 reduceAmount = _amount > _frozenTokens[_userAddress] ? _frozenTokens[_userAddress] : _amount;
            _frozenTokens[_userAddress] -= reduceAmount;
        }
        
        _burn(_userAddress, _amount);
        _compliance.destroyed(_userAddress, _amount);
    }
    
    // Recovery Functions
    
    /**
     * @dev Recovery mechanism for lost wallets
     */
    function recoveryAddress(
        address _lostWallet, 
        address _newWallet, 
        address _investorOnchainID
    ) external override onlyRecoveryAgent returns (bool) {
        require(_identityRegistry.identity(_lostWallet) == _investorOnchainID, 
                "PropertyToken: invalid identity");
        require(_identityRegistry.isVerified(_newWallet), 
                "PropertyToken: new wallet not verified");
        
        uint256 balance = balanceOf(_lostWallet);
        if (balance > 0) {
            _transfer(_lostWallet, _newWallet, balance);
        }
        
        // Transfer frozen tokens
        if (_frozenTokens[_lostWallet] > 0) {
            _frozenTokens[_newWallet] = _frozenTokens[_lostWallet];
            _frozenTokens[_lostWallet] = 0;
        }
        
        // Transfer frozen status
        if (_frozen[_lostWallet]) {
            _frozen[_newWallet] = true;
            _frozen[_lostWallet] = false;
        }
        
        emit RecoverySuccess(_lostWallet, _newWallet, _investorOnchainID);
        return true;
    }
    
    // Administrative Functions
    
    /**
     * @dev Update token name
     */
    function setName(string calldata _name) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        // Note: ERC20 doesn't allow name changes, this would require upgradeable contract
        emit UpdatedTokenInformation(_name, symbol());
    }
    
    /**
     * @dev Update token symbol  
     */
    function setSymbol(string calldata _symbol) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        // Note: ERC20 doesn't allow symbol changes, this would require upgradeable contract
        emit UpdatedTokenInformation(name(), _symbol);
    }
    
    /**
     * @dev Set identity registry
     */
    function setIdentityRegistry(address _identityRegistry) 
        external 
        override 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(_identityRegistry != address(0), "PropertyToken: invalid registry");
        
        address oldRegistry = address(_identityRegistry);
        _identityRegistry = IIdentityRegistry(_identityRegistry);
        
        emit IdentityRegistryRemoved(oldRegistry);
        emit IdentityRegistryAdded(_identityRegistry);
    }
    
    /**
     * @dev Set compliance contract
     */
    function setCompliance(address _compliance) 
        external 
        override 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(_compliance != address(0), "PropertyToken: invalid compliance");
        
        address oldCompliance = address(_compliance);
        _compliance = ICompliance(_compliance);
        
        emit ComplianceRemoved(oldCompliance);
        emit ComplianceAdded(_compliance);
    }
    
    // Property-specific functions
    
    /**
     * @dev Update property metadata
     */
    function updatePropertyMetadata(PropertyMetadata calldata _metadata) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(bytes(_metadata.assetPassportId).length > 0, "PropertyToken: invalid asset passport");
        
        propertyMetadata = _metadata;
        emit PropertyMetadataUpdated(
            _metadata.assetPassportId,
            _metadata.propertyAddress,
            _metadata.totalValue
        );
    }
    
    /**
     * @dev Update property documents hash
     */
    function updatePropertyDocuments(bytes32 _documentHash) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        propertyMetadata.documentHash = _documentHash;
        emit PropertyDocumentsUpdated(_documentHash);
    }
    
    // Pause functionality
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    // Batch Operations (implement remaining IERC3643 functions)
    function batchTransfer(address[] calldata _toList, uint256[] calldata _amounts) external override {
        require(_toList.length == _amounts.length, "PropertyToken: arrays length mismatch");
        
        for (uint256 i = 0; i < _toList.length; i++) {
            transfer(_toList[i], _amounts[i]);
        }
    }
    
    function batchForcedTransfer(
        address[] calldata _fromList,
        address[] calldata _toList,
        uint256[] calldata _amounts
    ) external override onlyCompliance {
        require(_fromList.length == _toList.length && _toList.length == _amounts.length, 
                "PropertyToken: arrays length mismatch");
        
        for (uint256 i = 0; i < _fromList.length; i++) {
            this.forcedTransfer(_fromList[i], _toList[i], _amounts[i]);
        }
    }
    
    function batchMint(address[] calldata _toList, uint256[] calldata _amounts) external override {
        require(_toList.length == _amounts.length, "PropertyToken: arrays length mismatch");
        
        for (uint256 i = 0; i < _toList.length; i++) {
            this.mint(_toList[i], _amounts[i]);
        }
    }
    
    function batchBurn(address[] calldata _userAddresses, uint256[] calldata _amounts) external override {
        require(_userAddresses.length == _amounts.length, "PropertyToken: arrays length mismatch");
        
        for (uint256 i = 0; i < _userAddresses.length; i++) {
            this.burn(_userAddresses[i], _amounts[i]);
        }
    }
    
    function batchSetAddressFrozen(address[] calldata _userAddresses, bool[] calldata _freeze) external override {
        require(_userAddresses.length == _freeze.length, "PropertyToken: arrays length mismatch");
        
        for (uint256 i = 0; i < _userAddresses.length; i++) {
            setAddressFrozen(_userAddresses[i], _freeze[i]);
        }
    }
    
    function batchFreezePartialTokens(address[] calldata _userAddresses, uint256[] calldata _amounts) external override {
        require(_userAddresses.length == _amounts.length, "PropertyToken: arrays length mismatch");
        
        for (uint256 i = 0; i < _userAddresses.length; i++) {
            freezePartialTokens(_userAddresses[i], _amounts[i]);
        }
    }
    
    function batchUnfreezePartialTokens(address[] calldata _userAddresses, uint256[] calldata _amounts) external override {
        require(_userAddresses.length == _amounts.length, "PropertyToken: arrays length mismatch");
        
        for (uint256 i = 0; i < _userAddresses.length; i++) {
            unfreezePartialTokens(_userAddresses[i], _amounts[i]);
        }
    }
}
