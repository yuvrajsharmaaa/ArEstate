// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/ICompliance.sol";
import "./interfaces/IIdentityRegistry.sol";

/**
 * @title Compliance
 * @dev Basic compliance module for transfer restrictions
 */
contract Compliance is ICompliance, AccessControl {
    bytes32 public constant COMPLIANCE_OFFICER_ROLE = keccak256("COMPLIANCE_OFFICER_ROLE");
    
    IIdentityRegistry public immutable identityRegistry;
    
    mapping(address => bool) private _tokenBound;
    mapping(address => bool) private _blacklisted;
    mapping(bytes32 => address) private _complianceRules;
    
    uint256 public constant MAX_SHAREHOLDERS = 2000;
    mapping(address => uint256) private _shareholderCount;
    
    constructor(address _identityRegistry) {
        require(_identityRegistry != address(0), "Invalid identity registry");
        identityRegistry = IIdentityRegistry(_identityRegistry);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(COMPLIANCE_OFFICER_ROLE, msg.sender);
    }
    
    function canTransfer(
        address from, 
        address to, 
        uint256 amount
    ) external view override returns (bool) {
        // Check blacklist
        if (_blacklisted[from] || _blacklisted[to]) {
            return false;
        }
        
        // For minting (from == address(0)), only check recipient
        if (from == address(0)) {
            return identityRegistry.isVerified(to);
        }
        
        // For burning (to == address(0)), allow if sender is verified
        if (to == address(0)) {
            return identityRegistry.isVerified(from);
        }
        
        // For transfers, both parties must be verified
        return identityRegistry.isVerified(from) && identityRegistry.isVerified(to);
    }
    
    function transferred(address from, address to, uint256 amount) external override {
        require(_tokenBound[msg.sender], "Token not bound to compliance");
        
        // Update shareholder count for minting
        if (from == address(0) && amount > 0) {
            _shareholderCount[msg.sender]++;
        }
        
        // Update shareholder count for burning
        if (to == address(0) && amount > 0) {
            if (_shareholderCount[msg.sender] > 0) {
                _shareholderCount[msg.sender]--;
            }
        }
        
        // Emit compliance interaction event if needed
        // emit ComplianceInteraction(from, to, amount);
    }
    
    function created(address to, uint256 amount) external override {
        require(_tokenBound[msg.sender], "Token not bound to compliance");
        // Handle token creation logic
    }
    
    function destroyed(address from, uint256 amount) external override {
        require(_tokenBound[msg.sender], "Token not bound to compliance");
        // Handle token destruction logic
    }
    
    function bindToken(address token) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(token != address(0), "Invalid token address");
        _tokenBound[token] = true;
        emit TokenBound(token);
    }
    
    function unbindToken(address token) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        _tokenBound[token] = false;
        emit TokenUnbound(token);
    }
    
    function isTokenBound(address token) external view override returns (bool) {
        return _tokenBound[token];
    }
    
    function addComplianceRule(
        bytes32 ruleType, 
        address ruleContract
    ) external override onlyRole(COMPLIANCE_OFFICER_ROLE) {
        require(ruleContract != address(0), "Invalid rule contract");
        _complianceRules[ruleType] = ruleContract;
        emit ComplianceRuleAdded(ruleType, ruleContract);
    }
    
    function removeComplianceRule(bytes32 ruleType) external override onlyRole(COMPLIANCE_OFFICER_ROLE) {
        delete _complianceRules[ruleType];
    }
    
    function getComplianceRule(bytes32 ruleType) external view override returns (address) {
        return _complianceRules[ruleType];
    }
    
    // Blacklist management
    function addToBlacklist(address _address) external onlyRole(COMPLIANCE_OFFICER_ROLE) {
        require(_address != address(0), "Invalid address");
        _blacklisted[_address] = true;
    }
    
    function removeFromBlacklist(address _address) external onlyRole(COMPLIANCE_OFFICER_ROLE) {
        _blacklisted[_address] = false;
    }
    
    function isBlacklisted(address _address) external view returns (bool) {
        return _blacklisted[_address];
    }
    
    // Utility functions
    function getShareholderCount(address token) external view returns (uint256) {
        return _shareholderCount[token];
    }
}