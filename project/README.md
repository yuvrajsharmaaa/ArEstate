# KrayState NFT Marketplace - Complete Setup Guide

![KrayState Logo](images/eth.svg)

A complete Web3-integrated NFT marketplace for tokenized real estate properties built with PHP and smart contracts on Ethereum Sepolia testnet.

## 🏗️ **Project Overview**

KrayState combines traditional PHP web development with cutting-edge blockchain technology to create a full-featured NFT marketplace for real estate tokenization. The platform allows users to:

- **Browse and purchase** tokenized real estate properties as NFTs
- **Connect Web3 wallets** (MetaMask) for blockchain interactions
- **View property details** including rental yields, location, and value
- **Make offers** on properties not currently listed
- **Track transactions** and ownership on the blockchain

## 🔧 **Technical Stack**

- **Backend**: PHP 8+, JSON file storage (demo/temporary)
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Blockchain**: Ethereum Sepolia Testnet
- **Web3**: Web3.js, MetaMask integration
- **Smart Contracts**: Deployed PropertyToken, IdentityRegistry, LeaseAgreement, EscrowPayment
- **Styling**: Custom CSS preserving original design with Web3 enhancements

## 📋 **Prerequisites**

Before running the project, ensure you have:

1. **PHP 8.0 or higher** with the following extensions:
   - `curl` (for Web3 RPC calls)
   - `json` (for data storage)
   - `mbstring` (for string handling)

2. **Web server** (choose one):
   - XAMPP (Windows/Mac/Linux)
   - WAMP (Windows)
   - LAMP (Linux)
   - Built-in PHP server (development)

3. **Web3 wallet** for testing:
   - [MetaMask](https://metamask.io/download/) browser extension
   - Some Sepolia testnet ETH ([get free testnet ETH](https://sepoliafaucet.com/))

## 🚀 **Quick Start Installation**

### **Step 1: Download and Setup**

1. **Clone or download** the project files to your web server directory:

   ```bash
   # If using XAMPP, place in: C:\xampp\htdocs\kraystate
   # If using built-in server, any directory works
   ```

2. **Ensure directory structure** looks like this:
   ```
   kraystate/
   ├── config.php                 # Main configuration
   ├── web3_integration.php       # Web3 functionality
   ├── nft_data_manager.php      # Data management
   ├── api.php                    # API endpoints
   ├── nft_marketplace.php        # Main marketplace page
   ├── data/                      # JSON data storage (auto-created)
   ├── images/                    # Assets and NFT images
   ├── js/
   │   └── marketplace.js         # Web3 JavaScript
   └── css/
       └── style.css              # Existing styles
   ```

### **Step 2: Configuration**

The project is **pre-configured** with your deployed smart contracts:

```php
// Contract addresses already set in config.php
define('CONTRACTS', [
    'IdentityRegistry' => '0xD4b19AB3f4e22557b32aD8d88E0C0737c5f8B933',
    'Compliance' => '0x3982a23b37d0e82040B8Ae9Cef4274094fD5a6f9',
    'PropertyToken' => '0xc601F6352300Af039FA9E4F63545cC52c33D44D8',
    'LeaseAgreement' => '0x987C8053eb163bb63bb4EEB85cAaDF3041d2D922',
    'EscrowPayment' => '0x4722813a0d172B8e13fB092f032dd84341aE8515'
]);
```

**No additional configuration needed!** The project will automatically:

- Create JSON data files
- Initialize demo NFT data
- Set up Web3 connections to Sepolia testnet

### **Step 3: Run the Project**

#### **Option A: Using XAMPP/WAMP/LAMP**

1. **Start your web server** (Apache)
2. **Place project files** in your web root directory
3. **Open browser** and navigate to: `http://localhost/kraystate/nft_marketplace.php`

#### **Option B: Using PHP Built-in Server**

1. **Open terminal/command prompt** in the project directory
2. **Start PHP server**:
   ```bash
   php -S localhost:8000
   ```
3. **Open browser** and navigate to: `http://localhost:8000/nft_marketplace.php`

### **Step 4: Connect Your Wallet**

1. **Install MetaMask** if you haven't already
2. **Switch to Sepolia testnet** in MetaMask:
   - Network Name: `Sepolia Testnet`
   - RPC URL: `https://rpc.sepolia.org`
   - Chain ID: `11155111`
   - Currency Symbol: `ETH`

3. **Get test ETH**:
   - Visit [Sepolia Faucet](https://sepoliafaucet.com/)
   - Enter your wallet address
   - Receive free test ETH (required for transactions)

4. **Connect wallet** by clicking "Connect Wallet" button on the marketplace

## 🎯 **How to Test the Marketplace**

### **1. Browse Properties**

- Visit the main marketplace page
- View tokenized real estate properties
- Use filters to search by price, location, property type
- Click on properties to see details

### **2. Connect Web3 Wallet**

- Click "Connect Wallet" button
- Approve MetaMask connection
- Ensure you're on Sepolia testnet
- Your wallet address will appear in the top-right

### **3. Purchase NFTs (Demo)**

- Click "Buy Now" on any listed property
- Confirm the transaction (simulated for demo)
- The property ownership will update
- Transaction will be recorded in the system

### **4. Make Offers**

- Click "Make Offer" on unlisted properties
- Enter your offer amount in ETH
- Offer will be submitted (demo functionality)

### **5. View Contract Information**

- Open browser developer tools (F12)
- Check console for smart contract addresses
- Verify connection to Sepolia testnet

## 🔗 **Smart Contract Integration**

### **Live Contract Addresses (Sepolia)**

Your deployed contracts are already live and integrated:

| Contract             | Address                                      | Purpose                           |
| -------------------- | -------------------------------------------- | --------------------------------- |
| **PropertyToken**    | `0xc601F6352300Af039FA9E4F63545cC52c33D44D8` | ERC-721 NFT tokens for properties |
| **IdentityRegistry** | `0xD4b19AB3f4e22557b32aD8d88E0C0737c5f8B933` | KYC/AML user verification         |
| **LeaseAgreement**   | `0x987C8053eb163bb63bb4EEB85cAaDF3041d2D922` | Property lease management         |
| **EscrowPayment**    | `0x4722813a0d172B8e13fB092f032dd84341aE8515` | Payment escrow system             |

### **Blockchain Verification**

You can verify these contracts on Etherscan:

- [PropertyToken on Sepolia](https://sepolia.etherscan.io/address/0xc601F6352300Af039FA9E4F63545cC52c33D44D8)
- [IdentityRegistry on Sepolia](https://sepolia.etherscan.io/address/0xD4b19AB3f4e22557b32aD8d88E0C0737c5f8B933)

### **Web3 Integration Features**

The platform includes:

- **Real-time contract calls** to verify token ownership
- **Balance checking** for connected wallets
- **Network validation** (ensures Sepolia testnet)
- **Transaction simulation** for demo purchases
- **Metadata fetching** from IPFS/HTTP sources

## 📊 **Data Storage System**

The project uses **JSON files for temporary storage** (no database required):

### **Data Files Created Automatically**

```
data/
├── nfts.json          # NFT property data
├── users.json         # User wallet information
├── listings.json      # Marketplace listings
└── transactions.json  # Transaction history
```

### **Sample NFT Data Structure**

```json
{
  "id": "nft_1",
  "collection_id": "kraystate-properties",
  "token_id": "1",
  "name": "Luxury Downtown Condo #001",
  "description": "Prime downtown condominium...",
  "image_url": "images/nft/property-1.jpg",
  "owner_wallet": "0x742d35Cc6634C0532925a3b8D0c8f8dd8E8a6f8",
  "current_price": "1.5",
  "property_value": 250000,
  "rental_yield": "8.5",
  "location": "Downtown Manhattan, NY",
  "property_type": "residential",
  "is_listed": true,
  "attributes": [
    { "trait_type": "Location", "value": "Downtown Manhattan" },
    { "trait_type": "Bedrooms", "value": "2" },
    { "trait_type": "Rental Yield", "value": "8.5%" }
  ],
  "created_at": "2024-01-15 10:30:00"
}
```

## 🔧 **API Endpoints**

The project includes a complete API (`api.php`) for:

### **NFT Operations**

- `GET api.php?action=get_nfts` - Get all NFTs with filters
- `GET api.php?action=get_nft&id=nft_1` - Get specific NFT
- `POST api.php` with `action=create_nft` - Create new NFT
- `POST api.php` with `action=simulate_purchase` - Simulate purchase

### **Blockchain Integration**

- `GET api.php?action=get_contract_info&contract=PropertyToken` - Contract details
- `GET api.php?action=get_token_owner&token_id=1` - Get token owner from blockchain
- `GET api.php?action=get_wallet_balance&wallet=0x...` - Get ETH balance
- `GET api.php?action=get_network_info` - Network status

### **Marketplace Data**

- `GET api.php?action=get_marketplace_stats` - Overall statistics
- `GET api.php?action=get_trending` - Trending NFTs
- `GET api.php?action=search&q=downtown` - Search properties

## 🎨 **UI/UX Features**

### **Preserved Original Design**

- Maintains your existing CSS styling and layout
- Responsive design for mobile/tablet devices
- Original color scheme and typography

### **Enhanced Web3 Features**

- **Wallet Connection**: MetaMask integration with status indicators
- **Property Grid**: Beautiful NFT card layouts with property details
- **Advanced Filters**: Search by location, price, property type
- **Real-time Updates**: Balance checking and network status
- **Transaction Feedback**: Success/error notifications

### **Interactive Elements**

- **Buy Now Buttons**: Direct purchase functionality
- **Make Offer**: Submit offers on unlisted properties
- **Property Details**: Rental yields, location, attributes
- **Ownership Badges**: "Owned" indicators for user's NFTs

## 🧪 **Testing Guide**

### **1. Local Testing**

```bash
# Start PHP server
php -S localhost:8000

# Test API endpoints
curl http://localhost:8000/api.php?action=get_nfts
curl http://localhost:8000/api.php?action=get_marketplace_stats
```

### **2. Web3 Testing**

1. Open browser developer console (F12)
2. Connect MetaMask wallet
3. Check console for Web3 connection logs
4. Test buy/offer functionality

### **3. Smart Contract Testing**

1. Visit [Sepolia Etherscan](https://sepolia.etherscan.io/)
2. Search for contract addresses from `config.php`
3. Verify contracts are deployed and accessible
4. Check transaction history

### **4. API Testing**

```bash
# Test marketplace stats
curl "http://localhost:8000/api.php?action=get_marketplace_stats"

# Test NFT search
curl "http://localhost:8000/api.php?action=search&q=downtown"

# Test contract info
curl "http://localhost:8000/api.php?action=get_contract_info&contract=PropertyToken"
```

## 🚨 **Troubleshooting**

### **Common Issues & Solutions**

#### **"No Web3 wallet detected"**

- **Solution**: Install MetaMask browser extension
- **Alternative**: Use Brave browser with built-in Web3

#### **"Wrong network" warning**

- **Solution**: Switch MetaMask to Sepolia testnet
- **Chain ID**: 11155111
- **RPC URL**: https://rpc.sepolia.org

#### **"Permission denied" errors**

- **Solution**: Ensure write permissions on `data/` directory
- **Windows**: Right-click folder → Properties → Security
- **Linux/Mac**: `chmod 755 data/`

#### **"Contract call failed"**

- **Solution**: Check Sepolia testnet connectivity
- **Alternative**: Use different RPC URL in `config.php`

#### **"Transaction failed"**

- **Solution**: Ensure you have Sepolia ETH for gas fees
- **Get test ETH**: [Sepolia Faucet](https://sepoliafaucet.com/)

### **Debug Mode**

Enable detailed logging by adding to `config.php`:

```php
// Enable debug mode
ini_set('error_reporting', E_ALL);
ini_set('display_errors', 1);
error_log('Debug: KrayState marketplace loaded');
```

## 🔄 **Upgrading to Full Database**

To upgrade from JSON storage to full database:

1. **Import the original SQL schema**:

   ```sql
   -- Use your existing home_db.sql file
   -- Add new tables for NFT data
   ```

2. **Update configuration**:

   ```php
   // Replace JSON functions with PDO database calls
   $conn = new PDO("mysql:host=localhost;dbname=home_db", $user, $pass);
   ```

3. **Modify data manager**:
   - Replace `loadJsonData()` with database queries
   - Update `saveJsonData()` with INSERT/UPDATE statements

## 🚀 **Production Deployment**

For production deployment:

1. **Use a real database** (MySQL/PostgreSQL)
2. **Add authentication** and user management
3. **Implement proper security** measures
4. **Use environment variables** for sensitive config
5. **Enable HTTPS** for Web3 security
6. **Deploy to mainnet** or production testnet

## 📞 **Support & Resources**

### **Smart Contract Resources**

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Ethereum Development](https://ethereum.org/developers/)

### **Web3 Integration**

- [Web3.js Documentation](https://web3js.readthedocs.io/)
- [MetaMask Developer Docs](https://docs.metamask.io/)
- [Ethereum JSON-RPC](https://ethereum.org/en/developers/docs/apis/json-rpc/)

### **Testing Resources**

- [Sepolia Testnet Faucet](https://sepoliafaucet.com/)
- [Sepolia Etherscan](https://sepolia.etherscan.io/)
- [MetaMask Test Networks](https://metamask.zendesk.com/hc/en-us/articles/13946422437147-How-to-view-testnets-in-MetaMask)

---

## 🎉 **You're Ready to Go!**

Your KrayState NFT Marketplace is now fully functional with:

- ✅ **Smart contract integration** with your deployed contracts
- ✅ **Web3 wallet connectivity** via MetaMask
- ✅ **Complete marketplace UI** with property listings
- ✅ **Real-time blockchain data** from Sepolia testnet
- ✅ **Demo purchase functionality** for testing
- ✅ **API endpoints** for all marketplace operations

**Start exploring tokenized real estate today! 🏠⛓️**
