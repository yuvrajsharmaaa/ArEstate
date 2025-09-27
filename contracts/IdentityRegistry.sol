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
    
    function getCountry(address _user) external view returns (uint16) {
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

