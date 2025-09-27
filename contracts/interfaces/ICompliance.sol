// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ICompliance
 * @dev Interface for compliance engine - handles transfer restrictions and validation
 * @notice This interface defines compliance rules for token transfers
 */
interface ICompliance {
    /**
     * @dev Emitted when compliance rules are updated
     */
    event ComplianceRuleAdded(string indexed ruleType, address indexed target);
    
    /**
     * @dev Emitted when a forced transfer occurs
     */
    event ForcedTransfer(address indexed from, address indexed to, uint256 amount);
    
    /**
     * @dev Check if a transfer is compliant
     * @param _from The sender address
     * @param _to The recipient address  
     * @param _amount The transfer amount
     * @return bool True if transfer is allowed
     */
    function canTransfer(address _from, address _to, uint256 _amount) external view returns (bool);
    
    /**
     * @dev Hook called after token transfer to update holder counts
     * @param _from The sender address
     * @param _to The recipient address
     * @param _amount The transfer amount
     */
    function transferred(address _from, address _to, uint256 _amount) external;

    /**
     * @dev Hook called when tokens are created (minted)
     * @param _to The recipient address
     * @param _amount The amount minted
     */
    function created(address _to, uint256 _amount) external;

    /**
     * @dev Hook called when tokens are destroyed (burned)
     * @param _from The address from which tokens are burned
     * @param _amount The amount burned
     */
    function destroyed(address _from, uint256 _amount) external;
    
    /**
     * @dev Add address to blacklist
     * @param _address The address to blacklist
     */
    function addToBlacklist(address _address) external;
    
    /**
     * @dev Remove address from blacklist  
     * @param _address The address to remove from blacklist
     */
    function removeFromBlacklist(address _address) external;
    
    /**
     * @dev Check if address is blacklisted
     * @param _address The address to check
     * @return bool True if blacklisted
     */
    function isBlacklisted(address _address) external view returns (bool);
    
    /**
     * @dev Get total number of token holders
     * @return uint256 Number of holders
     */
    function getTotalHolders() external view returns (uint256);
}
