// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IERC3643 Interface
 * @dev Interface for ERC-3643 T-REX compliant security tokens
 * Extends ERC-20 with identity and compliance requirements
 */
interface IERC3643 {
    // ERC-20 inherited functions
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    
    // ERC-3643 specific events
    event UpdatedTokenInformation(string indexed newName, string indexed newSymbol);
    event IdentityRegistryAdded(address indexed identityRegistry);
    event IdentityRegistryRemoved(address indexed identityRegistry);
    event ComplianceAdded(address indexed compliance);
    event ComplianceRemoved(address indexed compliance);
    event RecoverySuccess(address indexed lostWallet, address indexed newWallet, address indexed investorOnchainID);
    event AddressFrozen(address indexed addr, bool indexed isFrozen, address indexed owner);
    event TokensFrozen(address indexed addr, uint256 amount);
    event TokensUnfrozen(address indexed addr, uint256 amount);
    
    // Identity Registry functions
    function identityRegistry() external view returns (address);
    function compliance() external view returns (address);
    
    // Compliance and transfer control
    function isAddressFrozen(address _userAddress) external view returns (bool);
    function getFrozenTokens(address _userAddress) external view returns (uint256);
    function setAddressFrozen(address _userAddress, bool _freeze) external;
    function freezePartialTokens(address _userAddress, uint256 _amount) external;
    function unfreezePartialTokens(address _userAddress, uint256 _amount) external;
    
    // Forced operations (for compliance)
    function forcedTransfer(address _from, address _to, uint256 _amount) external returns (bool);
    function mint(address _to, uint256 _amount) external;
    function burn(address _userAddress, uint256 _amount) external;
    
    // Recovery functions
    function recoveryAddress(
        address _lostWallet, 
        address _newWallet, 
        address _investorOnchainID
    ) external returns (bool);
    
    // Administrative functions
    function setName(string calldata _name) external;
    function setSymbol(string calldata _symbol) external;
    function setIdentityRegistry(address _identityRegistry) external;
    function setCompliance(address _compliance) external;
    
    // Batch operations
    function batchTransfer(address[] calldata _toList, uint256[] calldata _amounts) external;
    function batchForcedTransfer(
        address[] calldata _fromList,
        address[] calldata _toList, 
        uint256[] calldata _amounts
    ) external;
    function batchMint(address[] calldata _toList, uint256[] calldata _amounts) external;
    function batchBurn(address[] calldata _userAddresses, uint256[] calldata _amounts) external;
    function batchSetAddressFrozen(address[] calldata _userAddresses, bool[] calldata _freeze) external;
    function batchFreezePartialTokens(address[] calldata _userAddresses, uint256[] calldata _amounts) external;
    function batchUnfreezePartialTokens(address[] calldata _userAddresses, uint256[] calldata _amounts) external;
    
    // View functions for compliance
    function paused() external view returns (bool);
    function canTransfer(address _from, address _to, uint256 _amount) external view returns (bool);
}
