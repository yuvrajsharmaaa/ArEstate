// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ICompliance
 * @dev Interface for compliance module that checks transfer restrictions
 */
interface ICompliance {
    // Events
    event TokenBound(address indexed token);
    event TokenUnbound(address indexed token);
    event ComplianceRuleAdded(bytes32 indexed ruleType, address indexed ruleContract);
    
    // Core functions
    function canTransfer(address from, address to, uint256 amount) external view returns (bool);
    function transferred(address from, address to, uint256 amount) external;
    function created(address to, uint256 amount) external;
    function destroyed(address from, uint256 amount) external;
    
    // Token binding
    function bindToken(address token) external;
    function unbindToken(address token) external;
    function isTokenBound(address token) external view returns (bool);
    
    // Rule management
    function addComplianceRule(bytes32 ruleType, address ruleContract) external;
    function removeComplianceRule(bytes32 ruleType) external;
    function getComplianceRule(bytes32 ruleType) external view returns (address);
}
