// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/ICompliance.sol";
import "./interfaces/IIdentityRegistry.sol";

/**
 * @title Compliance
 * @dev Manages jurisdictional compliance rules, transfer restrictions, and audit reporting
 * Integrates with Integra's policy-based privacy and regulatory frameworks
 */
contract Compliance is AccessControl, ReentrancyGuard, ICompliance {
    
    // Roles
    bytes32 public constant COMPLIANCE_OFFICER_ROLE = keccak256("COMPLIANCE_OFFICER_ROLE");
    bytes32 public constant RULE_MANAGER_ROLE = keccak256("RULE_MANAGER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    
    // Compliance rule types
    bytes32 public constant TRANSFER_LIMIT_RULE = keccak256("TRANSFER_LIMIT_RULE");
    bytes32 public constant COUNTRY_RESTRICTION_RULE = keccak256("COUNTRY_RESTRICTION_RULE");
    bytes32 public constant INVESTOR_TYPE_RULE = keccak256("INVESTOR_TYPE_RULE");
    bytes32 public constant TIME_LOCK_RULE = keccak256("TIME_LOCK_RULE");
    bytes32 public constant KYC_REQUIREMENT_RULE = keccak256("KYC_REQUIREMENT_RULE");
    bytes32 public constant HOLDING_PERIOD_RULE = keccak256("HOLDING_PERIOD_RULE");
    
    // Investor types for compliance
    enum InvestorType {
        RETAIL,
        ACCREDITED,
        INSTITUTIONAL,
        QUALIFIED
    }
    
    // Compliance rule structure
    struct ComplianceRule {
        bytes32 ruleType;
        address ruleAddress;        // External rule contract
        bool isActive;
        uint256 priority;          // Higher number = higher priority
        string description;
        bytes32 configHash;        // Hash of rule configuration
        uint256 createdAt;
        uint256 lastModified;
    }
    
    // Transfer restriction structure
    struct TransferRestriction {
        uint16 fromCountry;        // Source country (0 = any)
        uint16 toCountry;          // Destination country (0 = any)
        InvestorType fromType;     // Source investor type
        InvestorType toType;       // Destination investor type
        uint256 minAmount;         // Minimum transfer amount
        uint256 maxAmount;         // Maximum transfer amount
        uint256 dailyLimit;        // Daily transfer limit
        uint256 monthlyLimit;      // Monthly transfer limit
        bool isBlocked;            // Complete block
        string reason;             // Restriction reason
    }
    
    // Holding period requirement
    struct HoldingPeriod {
        address investor;
        uint256 amount;
        uint256 acquisitionDate;
        uint256 minimumHoldPeriod;
        bool isLocked;
    }
    
    // Audit trail entry
    struct AuditEntry {
        uint256 timestamp;
        address user;
        string action;
        bytes32 dataHash;
        bool isCompliant;
        string details;
    }
    
    // Storage mappings
    mapping(address => bool) private _boundTokens;
    mapping(bytes32 => ComplianceRule[]) private _rules;
    mapping(address => mapping(address => uint256)) private _dailyTransfers;   // user => token => amount
    mapping(address => mapping(address => uint256)) private _monthlyTransfers; // user => token => amount
    mapping(address => mapping(address => uint256)) private _lastTransferDate; // user => token => date
    mapping(address => InvestorType) public investorTypes;
    mapping(bytes32 => bool) public restrictedCountryPairs; // hash(fromCountry, toCountry) => blocked
    mapping(address => HoldingPeriod[]) public investorHoldings;
    mapping(uint256 => TransferRestriction) public transferRestrictions;
    
    // Audit trail
    AuditEntry[] public auditTrail;
    mapping(address => uint256[]) public userAuditHistory; // user => audit indices
    
    // Contract references
    IIdentityRegistry public identityRegistry;
    
    // Configuration
    uint256 public defaultHoldingPeriod = 365 days;
    uint256 public maxTransferAmount = 1000000 * 10**18; // 1M tokens
    uint256 public maxDailyTransfers = 10;
    bool public globalTransfersPaused = false;
    
    // Counters
    uint256 private _restrictionCounter;
    
    constructor(address _identityRegistry) {
        require(_identityRegistry != address(0), "Compliance: invalid identity registry");
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(COMPLIANCE_OFFICER_ROLE, msg.sender);
        _grantRole(RULE_MANAGER_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
        
        identityRegistry = IIdentityRegistry(_identityRegistry);
        
        _addAuditEntry(msg.sender, "CONTRACT_DEPLOYED", bytes32(0), true, "Compliance contract deployed");
    }
    
    // Modifiers
    modifier onlyComplianceOfficer() {
        require(hasRole(COMPLIANCE_OFFICER_ROLE, msg.sender), "Compliance: not compliance officer");
        _;
    }
    
    modifier onlyRuleManager() {
        require(hasRole(RULE_MANAGER_ROLE, msg.sender), "Compliance: not rule manager");
        _;
    }
    
    modifier onlyAuditor() {
        require(hasRole(AUDITOR_ROLE, msg.sender), "Compliance: not auditor");
        _;
    }
    
    modifier onlyBoundToken() {
        require(_boundTokens[msg.sender], "Compliance: token not bound");
        _;
    }
    
    // Core Compliance Functions (ICompliance implementation)
    
    /**
     * @dev Check if transfer is compliant with all rules
     */
    function canTransfer(address _from, address _to, uint256 _amount) 
        external 
        view 
        override 
        returns (bool) 
    {
        if (globalTransfersPaused) return false;
        
        // Basic identity verification
        if (!identityRegistry.isVerified(_from) || !identityRegistry.isVerified(_to)) {
            return false;
        }
        
        // Check country restrictions
        uint16 fromCountry = identityRegistry.investorCountry(_from);
        uint16 toCountry = identityRegistry.investorCountry(_to);
        bytes32 countryPairHash = keccak256(abi.encodePacked(fromCountry, toCountry));
        if (restrictedCountryPairs[countryPairHash]) {
            return false;
        }
        
        // Check investor type restrictions
        InvestorType fromType = investorTypes[_from];
        InvestorType toType = investorTypes[_to];
        
        // Check amount limits
        if (_amount > maxTransferAmount) return false;
        
        // Check daily transfer limits
        uint256 dailyTotal = _dailyTransfers[_from][msg.sender];
        if (dailyTotal + _amount > maxTransferAmount) return false;
        
        // Check holding periods
        if (!_checkHoldingPeriod(_from, _amount)) return false;
        
        // Execute rule-based checks
        return _executeRuleChecks(_from, _to, _amount);
    }
    
    /**
     * @dev Called after successful transfer to update state
     */
    function transferred(address _from, address _to, uint256 _amount) 
        external 
        override 
        onlyBoundToken 
    {
        // Update transfer counters
        _updateTransferCounters(_from, _amount);
        
        // Update holding periods
        _updateHoldingPeriods(_from, _to, _amount);
        
        // Log audit entry
        _addAuditEntry(
            _from, 
            "TRANSFER_EXECUTED", 
            keccak256(abi.encodePacked(_from, _to, _amount)), 
            true, 
            string(abi.encodePacked("Transferred ", _uint2str(_amount), " to ", _addressToString(_to)))
        );
    }
    
    /**
     * @dev Called after token creation/minting
     */
    function created(address _to, uint256 _amount) 
        external 
        override 
        onlyBoundToken 
    {
        // Add new holding period for minted tokens
        investorHoldings[_to].push(HoldingPeriod({
            investor: _to,
            amount: _amount,
            acquisitionDate: block.timestamp,
            minimumHoldPeriod: defaultHoldingPeriod,
            isLocked: true
        }));
        
        _addAuditEntry(
            _to, 
            "TOKENS_CREATED", 
            keccak256(abi.encodePacked(_to, _amount)), 
            true, 
            string(abi.encodePacked("Created ", _uint2str(_amount), " tokens"))
        );
    }
    
    /**
     * @dev Called after token destruction/burning
     */
    function destroyed(address _from, uint256 _amount) 
        external 
        override 
        onlyBoundToken 
    {
        // Remove holding periods for burned tokens
        _removeHoldingPeriods(_from, _amount);
        
        _addAuditEntry(
            _from, 
            "TOKENS_DESTROYED", 
            keccak256(abi.encodePacked(_from, _amount)), 
            true, 
            string(abi.encodePacked("Destroyed ", _uint2str(_amount), " tokens"))
        );
    }
    
    // Token Binding Functions
    
    /**
     * @dev Bind compliance to token contract
     */
    function bindToken(address _token) 
        external 
        override 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(_token != address(0), "Compliance: invalid token address");
        _boundTokens[_token] = true;
        
        emit TokenBound(_token);
        _addAuditEntry(msg.sender, "TOKEN_BOUND", bytes32(uint256(uint160(_token))), true, "Token bound to compliance");
    }
    
    /**
     * @dev Unbind compliance from token contract
     */
    function unbindToken(address _token) 
        external 
        override 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        _boundTokens[_token] = false;
        
        emit TokenUnbound(_token);
        _addAuditEntry(msg.sender, "TOKEN_UNBOUND", bytes32(uint256(uint160(_token))), true, "Token unbound from compliance");
    }
    
    /**
     * @dev Check if token is bound
     */
    function isTokenBound(address _token) 
        external 
        view 
        override 
        returns (bool) 
    {
        return _boundTokens[_token];
    }
    
    // Rule Management Functions
    
    /**
     * @dev Add compliance rule
     */
    function addRule(bytes32 _ruleType, address _ruleAddress) 
        external 
        override 
        onlyRuleManager 
    {
        require(_ruleAddress != address(0), "Compliance: invalid rule address");
        
        _rules[_ruleType].push(ComplianceRule({
            ruleType: _ruleType,
            ruleAddress: _ruleAddress,
            isActive: true,
            priority: 100, // Default priority
            description: "",
            configHash: bytes32(0),
            createdAt: block.timestamp,
            lastModified: block.timestamp
        }));
        
        emit RuleAdded(_ruleType, _ruleAddress);
        _addAuditEntry(msg.sender, "RULE_ADDED", _ruleType, true, "New compliance rule added");
    }
    
    /**
     * @dev Remove compliance rule
     */
    function removeRule(bytes32 _ruleType, address _ruleAddress) 
        external 
        override 
        onlyRuleManager 
    {
        ComplianceRule[] storage rules = _rules[_ruleType];
        
        for (uint256 i = 0; i < rules.length; i++) {
            if (rules[i].ruleAddress == _ruleAddress) {
                rules[i] = rules[rules.length - 1];
                rules.pop();
                break;
            }
        }
        
        emit RuleRemoved(_ruleType, _ruleAddress);
        _addAuditEntry(msg.sender, "RULE_REMOVED", _ruleType, true, "Compliance rule removed");
    }
    
    /**
     * @dev Get rules for type
     */
    function getRules(bytes32 _ruleType) 
        external 
        view 
        override 
        returns (address[] memory) 
    {
        ComplianceRule[] memory rules = _rules[_ruleType];
        address[] memory ruleAddresses = new address[](rules.length);
        
        for (uint256 i = 0; i < rules.length; i++) {
            ruleAddresses[i] = rules[i].ruleAddress;
        }
        
        return ruleAddresses;
    }
    
    // Compliance Status Functions
    
    /**
     * @dev Get compliance status for user
     */
    function getComplianceStatus(address _user) 
        external 
        view 
        override 
        returns (bool) 
    {
        if (!identityRegistry.isVerified(_user)) return false;
        
        // Check if user has any active restrictions
        uint16 userCountry = identityRegistry.investorCountry(_user);
        InvestorType userType = investorTypes[_user];
        
        // Additional compliance checks can be added here
        return true;
    }
    
    /**
     * @dev Get transfer restrictions for user pair
     */
    function getTransferRestrictions(address _from, address _to) 
        external 
        view 
        override 
        returns (string[] memory) 
    {
        string[] memory restrictions = new string[](5);
        uint256 count = 0;
        
        if (!identityRegistry.isVerified(_from)) {
            restrictions[count++] = "Sender not verified";
        }
        
        if (!identityRegistry.isVerified(_to)) {
            restrictions[count++] = "Recipient not verified";
        }
        
        if (globalTransfersPaused) {
            restrictions[count++] = "Global transfers paused";
        }
        
        uint16 fromCountry = identityRegistry.investorCountry(_from);
        uint16 toCountry = identityRegistry.investorCountry(_to);
        bytes32 countryPairHash = keccak256(abi.encodePacked(fromCountry, toCountry));
        
        if (restrictedCountryPairs[countryPairHash]) {
            restrictions[count++] = "Country pair restricted";
        }
        
        if (!_checkHoldingPeriod(_from, 0)) {
            restrictions[count++] = "Holding period not met";
        }
        
        // Resize array to actual count
        string[] memory result = new string[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = restrictions[i];
        }
        
        return result;
    }
    
    // Administrative Functions
    
    /**
     * @dev Set investor type
     */
    function setInvestorType(address _investor, InvestorType _type) 
        external 
        onlyComplianceOfficer 
    {
        investorTypes[_investor] = _type;
        
        _addAuditEntry(
            _investor, 
            "INVESTOR_TYPE_SET", 
            bytes32(uint256(_type)), 
            true, 
            "Investor type updated"
        );
    }
    
    /**
     * @dev Set country pair restriction
     */
    function setCountryRestriction(uint16 _fromCountry, uint16 _toCountry, bool _restricted) 
        external 
        onlyComplianceOfficer 
    {
        bytes32 countryPairHash = keccak256(abi.encodePacked(_fromCountry, _toCountry));
        restrictedCountryPairs[countryPairHash] = _restricted;
        
        _addAuditEntry(
            msg.sender, 
            "COUNTRY_RESTRICTION_SET", 
            countryPairHash, 
            true, 
            _restricted ? "Country pair restricted" : "Country pair unrestricted"
        );
    }
    
    /**
     * @dev Update configuration
     */
    function updateConfiguration(
        uint256 _defaultHoldingPeriod,
        uint256 _maxTransferAmount,
        uint256 _maxDailyTransfers
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        defaultHoldingPeriod = _defaultHoldingPeriod;
        maxTransferAmount = _maxTransferAmount;
        maxDailyTransfers = _maxDailyTransfers;
        
        _addAuditEntry(msg.sender, "CONFIG_UPDATED", bytes32(0), true, "Configuration updated");
    }
    
    /**
     * @dev Pause/unpause global transfers
     */
    function setGlobalTransfersPaused(bool _paused) 
        external 
        onlyComplianceOfficer 
    {
        globalTransfersPaused = _paused;
        
        _addAuditEntry(
            msg.sender, 
            "GLOBAL_TRANSFERS_PAUSED", 
            bytes32(uint256(_paused ? 1 : 0)), 
            true, 
            _paused ? "Global transfers paused" : "Global transfers resumed"
        );
    }
    
    // Audit Functions
    
    /**
     * @dev Get audit trail
     */
    function getAuditTrail(uint256 _start, uint256 _limit) 
        external 
        view 
        onlyAuditor 
        returns (AuditEntry[] memory) 
    {
        require(_start < auditTrail.length, "Compliance: invalid start index");
        
        uint256 end = _start + _limit;
        if (end > auditTrail.length) {
            end = auditTrail.length;
        }
        
        AuditEntry[] memory entries = new AuditEntry[](end - _start);
        for (uint256 i = _start; i < end; i++) {
            entries[i - _start] = auditTrail[i];
        }
        
        return entries;
    }
    
    /**
     * @dev Get user audit history
     */
    function getUserAuditHistory(address _user) 
        external 
        view 
        onlyAuditor 
        returns (AuditEntry[] memory) 
    {
        uint256[] memory indices = userAuditHistory[_user];
        AuditEntry[] memory entries = new AuditEntry[](indices.length);
        
        for (uint256 i = 0; i < indices.length; i++) {
            entries[i] = auditTrail[indices[i]];
        }
        
        return entries;
    }
    
    /**
     * @dev Generate compliance report
     */
    function generateComplianceReport() 
        external 
        view 
        onlyAuditor 
        returns (
            uint256 totalAuditEntries,
            uint256 complianceViolations,
            uint256 boundTokens,
            uint256 activeRules,
            bool globalPaused
        ) 
    {
        uint256 violations = 0;
        for (uint256 i = 0; i < auditTrail.length; i++) {
            if (!auditTrail[i].isCompliant) violations++;
        }
        
        uint256 totalRules = 0;
        bytes32[6] memory ruleTypes = [
            TRANSFER_LIMIT_RULE,
            COUNTRY_RESTRICTION_RULE,
            INVESTOR_TYPE_RULE,
            TIME_LOCK_RULE,
            KYC_REQUIREMENT_RULE,
            HOLDING_PERIOD_RULE
        ];
        
        for (uint256 i = 0; i < ruleTypes.length; i++) {
            totalRules += _rules[ruleTypes[i]].length;
        }
        
        return (
            auditTrail.length,
            violations,
            0, // Would need to track this separately
            totalRules,
            globalTransfersPaused
        );
    }
    
    // Internal Functions
    
    /**
     * @dev Execute all rule checks
     */
    function _executeRuleChecks(address _from, address _to, uint256 _amount) 
        internal 
        view 
        returns (bool) 
    {
        // This would execute external rule contracts
        // For now, return true (implement rule contract calling logic)
        return true;
    }
    
    /**
     * @dev Check holding period compliance
     */
    function _checkHoldingPeriod(address _investor, uint256 _amount) 
        internal 
        view 
        returns (bool) 
    {
        HoldingPeriod[] memory holdings = investorHoldings[_investor];
        uint256 availableAmount = 0;
        
        for (uint256 i = 0; i < holdings.length; i++) {
            if (!holdings[i].isLocked || 
                block.timestamp >= holdings[i].acquisitionDate + holdings[i].minimumHoldPeriod) {
                availableAmount += holdings[i].amount;
            }
        }
        
        return availableAmount >= _amount;
    }
    
    /**
     * @dev Update transfer counters for limits
     */
    function _updateTransferCounters(address _from, uint256 _amount) internal {
        uint256 today = block.timestamp / 1 days;
        
        if (_lastTransferDate[_from][msg.sender] != today) {
            _dailyTransfers[_from][msg.sender] = 0;
            _lastTransferDate[_from][msg.sender] = today;
        }
        
        _dailyTransfers[_from][msg.sender] += _amount;
        
        uint256 thisMonth = block.timestamp / 30 days;
        _monthlyTransfers[_from][msg.sender] += _amount;
    }
    
    /**
     * @dev Update holding periods after transfer
     */
    function _updateHoldingPeriods(address _from, address _to, uint256 _amount) internal {
        // Remove from sender's holdings (FIFO)
        _removeHoldingPeriods(_from, _amount);
        
        // Add to recipient's holdings
        investorHoldings[_to].push(HoldingPeriod({
            investor: _to,
            amount: _amount,
            acquisitionDate: block.timestamp,
            minimumHoldPeriod: defaultHoldingPeriod,
            isLocked: true
        }));
    }
    
    /**
     * @dev Remove holding periods (FIFO basis)
     */
    function _removeHoldingPeriods(address _investor, uint256 _amount) internal {
        HoldingPeriod[] storage holdings = investorHoldings[_investor];
        uint256 remainingAmount = _amount;
        
        for (uint256 i = 0; i < holdings.length && remainingAmount > 0; i++) {
            if (holdings[i].amount <= remainingAmount) {
                remainingAmount -= holdings[i].amount;
                holdings[i] = holdings[holdings.length - 1];
                holdings.pop();
                i--; // Adjust index after removal
            } else {
                holdings[i].amount -= remainingAmount;
                remainingAmount = 0;
            }
        }
    }
    
    /**
     * @dev Add audit trail entry
     */
    function _addAuditEntry(
        address _user, 
        string memory _action, 
        bytes32 _dataHash, 
        bool _isCompliant, 
        string memory _details
    ) internal {
        auditTrail.push(AuditEntry({
            timestamp: block.timestamp,
            user: _user,
            action: _action,
            dataHash: _dataHash,
            isCompliant: _isCompliant,
            details: _details
        }));
        
        userAuditHistory[_user].push(auditTrail.length - 1);
    }
    
    // Utility functions
    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
    
    function _addressToString(address _addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }
}