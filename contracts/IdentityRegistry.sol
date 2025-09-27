// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract IdentityRegistry is Ownable {
    
    struct Identity {
        address onchainId;
        uint16 country;
        bool isVerified;
        uint256 timestamp;
    }
    
    mapping(address => Identity) private _identities;
    mapping(address => bool) private _registered;
    
    event IdentityRegistered(address indexed user, address indexed onchainId, uint16 country);
    event IdentityVerified(address indexed user, address indexed verifier);
    
    constructor() Ownable(msg.sender) {}
    
    function registerIdentity(address _onchainId) external {
        require(!_registered[msg.sender], "Already registered");
        require(_onchainId != address(0), "Invalid identity");
        
        _identities[msg.sender] = Identity({
            onchainId: _onchainId,
            country: 0,
            isVerified: false,
            timestamp: block.timestamp
        });
        
        _registered[msg.sender] = true;
        emit IdentityRegistered(msg.sender, _onchainId, 0);
    }
    
    function adminVerify(address _user, address _onchainId, uint16 _country) external onlyOwner {
        require(_registered[_user], "User not registered");
        require(_country > 0, "Invalid country");
        
        _identities[_user].onchainId = _onchainId;
        _identities[_user].country = _country;
        _identities[_user].isVerified = true;
        
        emit IdentityVerified(_user, msg.sender);
    }
    
    function isVerified(address _user) external view returns (bool) {
        return _identities[_user].isVerified;
    }
    
    function investorCountry(address _user) external view returns (uint16) {
        return _identities[_user].country;
    }
    
    function getIdentityDetails(address _user) external view returns (address, uint16, bool, uint256) {
        Identity memory identity = _identities[_user];
        return (identity.onchainId, identity.country, identity.isVerified, identity.timestamp);
    }
    
    function isRegistered(address _user) external view returns (bool) {
        return _registered[_user];
    }
}  
     * @param _amount The transfer amount
     * @return bool True if transfer is allowed
     * @notice This is called by RealEstateToken before every transfer
     */
    function canTransfer(address _from, address _to, uint256 _amount) 
        external 
        view 
        override 
        returns (bool) 
    {
        // Skip checks for minting (from zero address)
        if (_from == address(0)) {
            return _canReceive(_to, _amount);
        }
        
        // Skip checks for burning (to zero address)
        if (_to == address(0)) {
            return !_blacklisted[_from];
        }
        
        // Check sender can send
        if (_blacklisted[_from]) return false;
        
        // Check recipient can receive
        return _canReceive(_to, _amount);
    }
    
    /**
     * @dev Hook called after token transfer to update holder counts
     * @param _from The sender address
     * @param _to The recipient address
     * @param _amount The transfer amount
     * @notice Updates holder statistics for regulatory reporting
     */
    function transferred(address _from, address _to, uint256 _amount) external override {
        require(msg.sender == boundToken, "Compliance: only bound token");
        
        // Update holder balances for tracking
        if (_from != address(0)) {
            _holderBalances[_from] -= _amount;
            if (_holderBalances[_from] == 0) {
                _totalHolders--;
            }
        }
        
        if (_to != address(0)) {
            if (_holderBalances[_to] == 0) {
                _totalHolders++;
            }
            _holderBalances[_to] += _amount;
        }
    }
    
    /**
     * @dev Add address to blacklist
     * @param _address The address to blacklist
     * @notice Blacklisted addresses cannot send or receive tokens
     */
    function addToBlacklist(address _address) external override onlyOwner {
        require(_address != address(0), "Compliance: invalid address");
        _blacklisted[_address] = true;
        
        emit ComplianceRuleAdded("BLACKLIST_ADD", _address);
    }
    
    /**
     * @dev Remove address from blacklist  
     * @param _address The address to remove from blacklist
     */
    function removeFromBlacklist(address _address) external override onlyOwner {
        _blacklisted[_address] = false;
        
        emit ComplianceRuleAdded("BLACKLIST_REMOVE", _address);
    }
    
    /**
     * @dev Check if address is blacklisted
     * @param _address The address to check
     * @return bool True if blacklisted
     */
    function isBlacklisted(address _address) external view override returns (bool) {
        return _blacklisted[_address];
    }
    
    /**
     * @dev Add country to restricted list
     * @param _country ISO 3166-1 country code
     * @notice Addresses from restricted countries cannot participate
     */
    function addRestrictedCountry(uint16 _country) external onlyOwner {
        _restrictedCountries[_country] = true;
        
        emit ComplianceRuleAdded("COUNTRY_RESTRICT", address(uint160(_country)));
    }
    
    /**
     * @dev Remove country from restricted list
     * @param _country ISO 3166-1 country code
     */
    function removeRestrictedCountry(uint16 _country) external onlyOwner {
        _restrictedCountries[_country] = false;
        
        emit ComplianceRuleAdded("COUNTRY_UNRESTRICT", address(uint160(_country)));
    }
    
    /**
     * @dev Check if country is restricted
     * @param _country ISO 3166-1 country code
     * @return bool True if restricted
     */
    function isCountryRestricted(uint16 _country) external view returns (bool) {
        return _restrictedCountries[_country];
    }
    
    /**
     * @dev Set maximum balance per investor
     * @param _maxBalance The maximum balance allowed per investor
     * @notice Used for regulatory compliance (accredited investor limits)
     */
    function setMaxBalancePerInvestor(uint256 _maxBalance) external onlyOwner {
        maxBalancePerInvestor = _maxBalance;
        
        emit ComplianceRuleAdded("MAX_BALANCE_SET", address(uint160(_maxBalance)));
    }
    
    /**
     * @dev Get total number of token holders
     * @return uint256 Number of addresses with non-zero balance
     */
    function getTotalHolders() external view returns (uint256) {
        return _totalHolders;
    }
    
    /**
     * @dev Get holder balance (for tracking purposes)
     * @param _holder The holder address
     * @return uint256 The tracked balance
     */
    function getHolderBalance(address _holder) external view returns (uint256) {
        return _holderBalances[_holder];
    }
    
    /**
     * @dev Internal function to check if address can receive tokens
     * @param _to The recipient address
     * @param _amount The amount to receive
     * @return bool True if can receive
     */
    function _canReceive(address _to, uint256 _amount) internal view returns (bool) {
        // Cannot send to blacklisted address
        if (_blacklisted[_to]) return false;
        
        // Must be verified by identity registry
        if (!identityRegistry.isVerified(_to)) return false;
        
        // Check country restrictions
        uint16 country = identityRegistry.getCountry(_to);
        if (_restrictedCountries[country]) return false;
        
        // Check maximum balance limit
        uint256 newBalance = _holderBalances[_to] + _amount;
        if (newBalance > maxBalancePerInvestor) return false;
        
        return true;
    }
    
    // TODO: Add time-based restrictions (lock periods, vesting)
    // TODO: Add integration with Integra's compliance APIs
    // TODO: Add more sophisticated investor classification rules
}