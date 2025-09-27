// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDC
 * @dev Mock USDC token for testing lease payments and property transactions
 * @notice Purpose: Provide a testnet ERC20 token that mimics USDC behavior
 * 
 * Expected edits for production:
 * - Replace with actual USDC contract address
 * - Remove minting functions (USDC is centrally controlled)
 * - Add proper upgradeability if needed for mainnet deployment
 * 
 * Features for testing:
 * - Standard ERC20 functionality
 * - Public minting for easy testing
 * - 6 decimal places to match real USDC
 * - Faucet functionality for demo purposes
 */
contract MockUSDC is ERC20, Ownable {
    
    // USDC has 6 decimal places
    uint8 private constant DECIMALS = 6;
    
    // Maximum tokens per faucet request (1000 USDC)
    uint256 public constant FAUCET_AMOUNT = 1000 * 10**DECIMALS;
    
    // Cooldown between faucet requests (24 hours)
    uint256 public constant FAUCET_COOLDOWN = 24 hours;
    
    // Track last faucet usage per address
    mapping(address => uint256) public lastFaucetUsage;
    
    event FaucetUsed(address indexed user, uint256 amount);
    event TokensMinted(address indexed to, uint256 amount);
    
    constructor() ERC20("Mock USD Coin", "MockUSDC") Ownable(msg.sender) {
        // Mint initial supply to deployer for setup (1M USDC)
        _mint(msg.sender, 1_000_000 * 10**DECIMALS);
    }
    
    /**
     * @dev Override decimals to match USDC (6 decimals)
     * @return uint8 Number of decimals (6)
     */
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }
    
    /**
     * @dev Public faucet for testing - gives users free tokens
     * @notice Can be called once per day per address
     */
    function faucet() external {
        require(
            block.timestamp >= lastFaucetUsage[msg.sender] + FAUCET_COOLDOWN,
            "MockUSDC: faucet cooldown active"
        );
        
        lastFaucetUsage[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
        
        emit FaucetUsed(msg.sender, FAUCET_AMOUNT);
    }
    
    /**
     * @dev Admin mint function for testing scenarios
     * @param to Address to mint tokens to
     * @param amount Amount to mint
     * @notice Only owner can call this function
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "MockUSDC: mint to zero address");
        require(amount > 0, "MockUSDC: mint amount must be positive");
        
        _mint(to, amount);
        
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev Batch mint for multiple addresses (useful for demo setup)
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to mint to each recipient
     * @notice Arrays must be same length, only owner can call
     */
    function batchMint(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        require(recipients.length == amounts.length, "MockUSDC: arrays length mismatch");
        require(recipients.length > 0, "MockUSDC: empty arrays");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "MockUSDC: mint to zero address");
            require(amounts[i] > 0, "MockUSDC: mint amount must be positive");
            
            _mint(recipients[i], amounts[i]);
            emit TokensMinted(recipients[i], amounts[i]);
        }
    }
    
    /**
     * @dev Burn tokens from caller's account
     * @param amount Amount to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    /**
     * @dev Burn tokens from specified account (requires approval)
     * @param from Address to burn tokens from
     * @param amount Amount to burn
     */
    function burnFrom(address from, uint256 amount) external {
        _spendAllowance(from, msg.sender, amount);
        _burn(from, amount);
    }
    
    /**
     * @dev Get faucet cooldown remaining for an address
     * @param user Address to check
     * @return uint256 Seconds until faucet can be used again (0 if ready)
     */
    function getFaucetCooldownRemaining(address user) external view returns (uint256) {
        uint256 nextUsage = lastFaucetUsage[user] + FAUCET_COOLDOWN;
        if (block.timestamp >= nextUsage) {
            return 0;
        }
        return nextUsage - block.timestamp;
    }
    
    /**
     * @dev Check if address can use faucet
     * @param user Address to check
     * @return bool True if faucet is available for the user
     */
    function canUseFaucet(address user) external view returns (bool) {
        return block.timestamp >= lastFaucetUsage[user] + FAUCET_COOLDOWN;
    }
    
    /**
     * @dev Emergency withdrawal for owner (shouldn't be needed in normal operation)
     * @param to Address to send tokens to
     * @param amount Amount to transfer
     */
    function emergencyWithdraw(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "MockUSDC: transfer to zero address");
        require(amount <= balanceOf(address(this)), "MockUSDC: insufficient contract balance");
        
        _transfer(address(this), to, amount);
    }
}