// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ICompliance Interface  
 * @dev Interface for compliance rules and validation
 */
interface ICompliance {
    // Events
    event TokenBound(address indexed token);
    event TokenUnbound(address indexed token);
    event RuleAdded(bytes32 indexed ruleType, address indexed ruleAddress);
    event RuleRemoved(bytes32 indexed ruleType, address indexed ruleAddress);
    
    // Core compliance functions
    function canTransfer(address _from, address _to, uint256 _amount) external view returns (bool);
    function transferred(address _from, address _to, uint256 _amount) external;
    function created(address _to, uint256 _amount) external;
    function destroyed(address _from, uint256 _amount) external;
    
    // Token binding
    function bindToken(address _token) external;
    function unbindToken(address _token) external;
    function isTokenBound(address _token) external view returns (bool);
    
    // Rule management
    function addRule(bytes32 _ruleType, address _ruleAddress) external;
    function removeRule(bytes32 _ruleType, address _ruleAddress) external;
    function getRules(bytes32 _ruleType) external view returns (address[] memory);
    
    // Compliance status
    function getComplianceStatus(address _user) external view returns (bool);
    function getTransferRestrictions(address _from, address _to) external view returns (string[] memory);
}
