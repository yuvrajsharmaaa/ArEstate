<?php  
/**
 * Enhanced KrayState NFT Marketplace Homepage
 * Preserves original UI design while adding Web3 NFT functionality
 */

require_once 'config.php';
require_once 'nft_data_manager.php';
require_once 'web3_integration.php';

// Initialize managers
$nftManager = new NFTDataManager();
$web3 = new Web3Integration();

// Get filters from URL parameters
$filters = [
    'collection_id' => $_GET['collection'] ?? null,
    'is_listed' => isset($_GET['listed']) ? true : null,
    'price_min' => $_GET['price_min'] ?? null,
    'price_max' => $_GET['price_max'] ?? null,
    'search' => $_GET['search'] ?? null,
    'property_type' => $_GET['property_type'] ?? null
];

// Remove empty filters
$filters = array_filter($filters, function($value) {
    return $value !== null && $value !== '';
});

// Pagination
$page = (int)($_GET['page'] ?? 1);
$itemsPerPage = 12;
$allNFTs = $nftManager->getAllNFTs($filters);
$totalItems = count($allNFTs);
$totalPages = ceil($totalItems / $itemsPerPage);
$offset = ($page - 1) * $itemsPerPage;
$nfts = array_slice($allNFTs, $offset, $itemsPerPage);

// Get marketplace stats
$stats = $nftManager->getMarketplaceStats();
$collections = $nftManager->getCollections();
$trendingNFTs = $nftManager->getTrendingNFTs(8);

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KrayState NFT Marketplace - Tokenized Real Estate</title>

    <!-- Font Awesome CDN -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css">
    
    <!-- Original CSS (preserving your design) -->
    <link rel="stylesheet" href="css/style.css">
    
    <!-- Web3 and Additional Styles -->
    <style>
        /* NFT Marketplace enhancements while preserving original design */
        .nft-hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 4rem 0;
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .nft-hero h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            font-weight: bold;
        }
        
        .nft-hero .eth-logo {
            width: 48px;
            height: 48px;
            display: inline-block;
            margin-right: 1rem;
            vertical-align: middle;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 2rem 0;
        }
        
        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
            border: 1px solid #eee;
        }
        
        .stat-card h3 {
            font-size: 2rem;
            margin-bottom: 0.5rem;
            color: var(--main-color);
        }
        
        .stat-card p {
            color: #666;
            font-size: 0.9rem;
        }
        
        .nft-filters {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        
        .filter-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            align-items: end;
        }
        
        .nft-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 2rem;
            margin: 2rem 0;
        }
        
        .nft-card {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            position: relative;
        }
        
        .nft-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        }
        
        .nft-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 15px 15px 0 0;
        }
        
        .nft-content {
            padding: 1.5rem;
        }
        
        .nft-collection {
            color: var(--main-color);
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 0.5rem;
        }
        
        .nft-title {
            font-size: 1.1rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
            color: #333;
        }
        
        .nft-location {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
        }
        
        .nft-location i {
            margin-right: 0.5rem;
        }
        
        .nft-price {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
        }
        
        .current-price {
            font-weight: bold;
            color: #333;
        }
        
        .eth-price {
            display: flex;
            align-items: center;
            font-size: 1.1rem;
            color: var(--main-color);
        }
        
        .eth-price img {
            width: 16px;
            height: 16px;
            margin-right: 0.25rem;
        }
        
        .nft-attributes {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;
            flex-wrap: wrap;
        }
        
        .attribute-badge {
            background: #e9ecef;
            padding: 0.25rem 0.5rem;
            border-radius: 20px;
            font-size: 0.75rem;
            color: #6c757d;
        }
        
        .nft-actions {
            display: flex;
            gap: 0.5rem;
        }
        
        .btn-buy {
            flex: 1;
            background: var(--main-color);
            color: white;
            border: none;
            padding: 0.75rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .btn-buy:hover {
            background: var(--dark-color);
            transform: translateY(-1px);
        }
        
        .btn-offer {
            background: transparent;
            color: var(--main-color);
            border: 2px solid var(--main-color);
            padding: 0.75rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .btn-offer:hover {
            background: var(--main-color);
            color: white;
        }
        
        .wallet-connection {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
        }
        
        .wallet-btn {
            background: var(--main-color);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
        }
        
        .wallet-btn:hover {
            background: var(--dark-color);
            transform: translateY(-2px);
        }
        
        .wallet-connected {
            background: #28a745;
        }
        
        .pagination {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            margin: 2rem 0;
        }
        
        .pagination a, .pagination span {
            padding: 0.75rem 1rem;
            border: 1px solid #ddd;
            color: var(--main-color);
            text-decoration: none;
            border-radius: 5px;
            transition: all 0.3s ease;
        }
        
        .pagination a:hover {
            background: var(--main-color);
            color: white;
        }
        
        .pagination .current {
            background: var(--main-color);
            color: white;
            border-color: var(--main-color);
        }
        
        .empty-state {
            text-align: center;
            padding: 4rem 2rem;
            color: #666;
        }
        
        .empty-state i {
            font-size: 4rem;
            margin-bottom: 1rem;
            color: #ccc;
        }
        
        @media (max-width: 768px) {
            .nft-hero h1 {
                font-size: 2rem;
            }
            
            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .filter-grid {
                grid-template-columns: 1fr;
            }
            
            .nft-grid {
                grid-template-columns: 1fr;
            }
            
            .wallet-connection {
                position: relative;
                top: auto;
                right: auto;
                margin-bottom: 1rem;
                text-align: center;
            }
        }
    </style>
    
    <!-- Web3.js Library -->
    <script src="https://cdn.jsdelivr.net/npm/web3@4.1.1/dist/web3.min.js"></script>
</head>
<body>

<!-- Wallet Connection Button -->
<div class="wallet-connection">
    <button id="connectWallet" class="wallet-btn">
        <i class="fas fa-wallet"></i>
        <span id="walletText">Connect Wallet</span>
    </button>
</div>

<!-- Include original header (preserved) -->
<?php 
// Check if original header exists, otherwise create minimal header
if (file_exists('components/user_header.php')) {
    include 'components/user_header.php';
} else {
    echo '<header style="background: var(--main-color); padding: 1rem 0; margin-bottom: 2rem;">
            <div class="container" style="text-align: center;">
                <h2 style="color: white; margin: 0;">KrayState ArEstate</h2>
            </div>
          </header>';
}
?>

<!-- Hero Section -->
<div class="nft-hero">
    <div class="container">
        <h1>
            <img src="images/eth.png" alt="ETH" class="eth-logo" onerror="this.style.display='none'">
            Discover Tokenized Real Estate
        </h1>
        <p style="font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9;">
            Own fractions of premium properties through blockchain technology.<br>
            Trade, invest, and earn with complete transparency.
        </p>
        
        <!-- Marketplace Stats -->
        <div class="stats-grid">
            <div class="stat-card">
                <h3><?= $stats['total_nfts'] ?></h3>
                <p>Total Properties</p>
            </div>
            <div class="stat-card">
                <h3><?= $stats['listed_nfts'] ?></h3>
                <p>Available Now</p>
            </div>
            <div class="stat-card">
                <h3><?= $stats['floor_price'] ?> ETH</h3>
                <p>Floor Price</p>
            </div>
            <div class="stat-card">
                <h3><?= $stats['total_volume'] ?> ETH</h3>
                <p>Total Volume</p>
            </div>
        </div>
    </div>
</div>

<!-- Filters Section -->
<div class="container">
    <div class="nft-filters">
        <h3 style="margin-bottom: 1.5rem; color: #333;">
            <i class="fas fa-filter"></i> Find Your Perfect Property
        </h3>
        
        <form method="GET" class="filter-grid">
            <!-- Search -->
            <div class="form-group">
                <label>Search Properties</label>
                <input type="text" name="search" placeholder="Search by name, location..." 
                       value="<?= htmlspecialchars($filters['search'] ?? '') ?>" class="form-control">
            </div>
            
            <!-- Property Type -->
            <div class="form-group">
                <label>Property Type</label>
                <select name="property_type" class="form-control">
                    <option value="">All Types</option>
                    <option value="residential" <?= ($filters['property_type'] ?? '') === 'residential' ? 'selected' : '' ?>>Residential</option>
                    <option value="commercial" <?= ($filters['property_type'] ?? '') === 'commercial' ? 'selected' : '' ?>>Commercial</option>
                    <option value="industrial" <?= ($filters['property_type'] ?? '') === 'industrial' ? 'selected' : '' ?>>Industrial</option>
                </select>
            </div>
            
            <!-- Price Range -->
            <div class="form-group">
                <label>Min Price (ETH)</label>
                <input type="number" name="price_min" step="0.01" placeholder="0.00" 
                       value="<?= $filters['price_min'] ?? '' ?>" class="form-control">
            </div>
            
            <div class="form-group">
                <label>Max Price (ETH)</label>
                <input type="number" name="price_max" step="0.01" placeholder="∞" 
                       value="<?= $filters['price_max'] ?? '' ?>" class="form-control">
            </div>
            
            <!-- Status -->
            <div class="form-group">
                <label>Status</label>
                <select name="listed" class="form-control">
                    <option value="">All Items</option>
                    <option value="1" <?= isset($filters['is_listed']) ? 'selected' : '' ?>>Available for Sale</option>
                </select>
            </div>
            
            <!-- Filter Button -->
            <div class="form-group">
                <button type="submit" class="btn" style="width: 100%; background: var(--main-color); color: white;">
                    <i class="fas fa-search"></i> Search
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Results Header -->
<div class="container">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div>
            <h3 style="margin: 0; color: #333;">
                <?= number_format($totalItems) ?> Properties Found
                <?php if (!empty(array_filter($filters))): ?>
                    <small style="color: #666; font-weight: normal;">with applied filters</small>
                <?php endif; ?>
            </h3>
        </div>
        <div>
            <a href="?" style="color: var(--main-color); text-decoration: none;">
                <i class="fas fa-times"></i> Clear Filters
            </a>
        </div>
    </div>
</div>

<!-- NFT Grid -->
<div class="container">
    <?php if (empty($nfts)): ?>
        <div class="empty-state">
            <i class="fas fa-home"></i>
            <h3>No Properties Found</h3>
            <p>Try adjusting your search criteria or browse our featured collections.</p>
            <a href="?" class="btn" style="background: var(--main-color); color: white; padding: 0.75rem 2rem; border-radius: 25px; text-decoration: none;">
                Browse All Properties
            </a>
        </div>
    <?php else: ?>
        <div class="nft-grid">
            <?php foreach ($nfts as $nft): ?>
                <div class="nft-card">
                    <!-- NFT Image -->
                    <img src="<?= $nft['image_url'] ?: 'images/placeholder-property.jpg' ?>" 
                         alt="<?= htmlspecialchars($nft['name']) ?>" 
                         class="nft-image"
                         onerror="this.src='images/placeholder-property.jpg'">
                    
                    <div class="nft-content">
                        <!-- Collection Badge -->
                        <div class="nft-collection">
                            KrayState Properties
                            <?php if ($nft['rarity_rank'] <= 50): ?>
                                <i class="fas fa-crown" style="color: gold; margin-left: 0.5rem;"></i>
                            <?php endif; ?>
                        </div>
                        
                        <!-- NFT Title -->
                        <h4 class="nft-title"><?= htmlspecialchars($nft['name']) ?></h4>
                        
                        <!-- Location -->
                        <?php if ($nft['location']): ?>
                            <div class="nft-location">
                                <i class="fas fa-map-marker-alt"></i>
                                <?= htmlspecialchars($nft['location']) ?>
                            </div>
                        <?php endif; ?>
                        
                        <!-- Key Attributes -->
                        <div class="nft-attributes">
                            <span class="attribute-badge">
                                <i class="fas fa-building"></i>
                                <?= ucfirst($nft['property_type']) ?>
                            </span>
                            
                            <?php if ($nft['rental_yield'] && floatval($nft['rental_yield']) > 0): ?>
                                <span class="attribute-badge">
                                    <i class="fas fa-percentage"></i>
                                    <?= $nft['rental_yield'] ?>% Yield
                                </span>
                            <?php endif; ?>
                            
                            <?php if ($nft['property_value']): ?>
                                <span class="attribute-badge">
                                    <i class="fas fa-dollar-sign"></i>
                                    $<?= number_format($nft['property_value']) ?>
                                </span>
                            <?php endif; ?>
                        </div>
                        
                        <!-- Price Section -->
                        <?php if ($nft['is_listed'] && floatval($nft['current_price']) > 0): ?>
                            <div class="nft-price">
                                <div>
                                    <div style="font-size: 0.8rem; color: #666;">Current Price</div>
                                    <div class="eth-price">
                                        <img src="images/eth.png" alt="ETH" onerror="this.style.display='none'">
                                        <?= number_format($nft['current_price'], 4) ?> ETH
                                    </div>
                                </div>
                                
                                <?php if ($nft['last_sale_price']): ?>
                                    <div style="text-align: right;">
                                        <div style="font-size: 0.8rem; color: #666;">Last Sale</div>
                                        <div style="color: #28a745; font-size: 0.9rem;">
                                            <?= number_format($nft['last_sale_price'], 4) ?> ETH
                                        </div>
                                    </div>
                                <?php endif; ?>
                            </div>
                            
                            <!-- Action Buttons -->
                            <div class="nft-actions">
                                <button class="btn-buy" onclick="buyNFT('<?= $nft['id'] ?>', <?= $nft['current_price'] ?>)">
                                    <i class="fas fa-shopping-cart"></i> Buy Now
                                </button>
                                <button class="btn-offer" onclick="makeOffer('<?= $nft['id'] ?>')">
                                    <i class="fas fa-hand-holding-usd"></i>
                                </button>
                            </div>
                        <?php else: ?>
                            <div style="text-align: center; padding: 1rem; background: #f8f9fa; border-radius: 8px; margin-bottom: 1rem;">
                                <span style="color: #666;">Not Currently Listed</span>
                            </div>
                            
                            <div class="nft-actions">
                                <button class="btn-offer" onclick="makeOffer('<?= $nft['id'] ?>')" style="flex: 1;">
                                    <i class="fas fa-hand-holding-usd"></i> Make Offer
                                </button>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</div>

<!-- Pagination -->
<?php if ($totalPages > 1): ?>
    <div class="pagination">
        <?php if ($page > 1): ?>
            <a href="?<?= http_build_query(array_merge($_GET, ['page' => $page - 1])) ?>">
                <i class="fas fa-chevron-left"></i>
            </a>
        <?php endif; ?>
        
        <?php
        $startPage = max(1, $page - 2);
        $endPage = min($totalPages, $page + 2);
        
        for ($i = $startPage; $i <= $endPage; $i++):
        ?>
            <?php if ($i == $page): ?>
                <span class="current"><?= $i ?></span>
            <?php else: ?>
                <a href="?<?= http_build_query(array_merge($_GET, ['page' => $i])) ?>"><?= $i ?></a>
            <?php endif; ?>
        <?php endfor; ?>
        
        <?php if ($page < $totalPages): ?>
            <a href="?<?= http_build_query(array_merge($_GET, ['page' => $page + 1])) ?>">
                <i class="fas fa-chevron-right"></i>
            </a>
        <?php endif; ?>
    </div>
<?php endif; ?>

<!-- Web3 Integration Script -->
<script>
// KrayState Web3 Integration
class KrayStateNFTMarketplace {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.chainId = <?= CHAIN_ID ?>;
        this.contracts = <?= json_encode(CONTRACTS) ?>;
        
        this.init();
    }
    
    async init() {
        // Check for Web3 wallet
        if (typeof window.ethereum !== 'undefined') {
            this.web3 = new Web3(window.ethereum);
            
            // Check if already connected
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                this.setAccount(accounts[0]);
            }
            
            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    this.setAccount(accounts[0]);
                } else {
                    this.disconnect();
                }
            });
            
            // Listen for chain changes
            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
            
        } else {
            console.warn('No Web3 wallet detected');
        }
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.getElementById('connectWallet').addEventListener('click', () => {
            if (this.account) {
                this.disconnect();
            } else {
                this.connectWallet();
            }
        });
    }
    
    async connectWallet() {
        try {
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            if (accounts.length > 0) {
                this.setAccount(accounts[0]);
                await this.checkNetwork();
                this.showNotification('Wallet connected successfully!', 'success');
            }
        } catch (error) {
            console.error('Wallet connection failed:', error);
            this.showNotification('Failed to connect wallet', 'error');
        }
    }
    
    setAccount(account) {
        this.account = account;
        this.updateWalletUI();
    }
    
    disconnect() {
        this.account = null;
        this.updateWalletUI();
    }
    
    updateWalletUI() {
        const walletBtn = document.getElementById('connectWallet');
        const walletText = document.getElementById('walletText');
        
        if (this.account) {
            walletBtn.classList.add('wallet-connected');
            walletText.textContent = this.account.substring(0, 6) + '...' + this.account.substring(38);
            walletBtn.innerHTML = `<i class="fas fa-check-circle"></i><span id="walletText">${walletText.textContent}</span>`;
        } else {
            walletBtn.classList.remove('wallet-connected');
            walletBtn.innerHTML = `<i class="fas fa-wallet"></i><span id="walletText">Connect Wallet</span>`;
        }
    }
    
    async checkNetwork() {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const currentChainId = parseInt(chainId, 16);
        
        if (currentChainId !== this.chainId) {
            this.showNotification(`Please switch to Sepolia testnet (Chain ID: ${this.chainId})`, 'warning');
            return false;
        }
        
        return true;
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#17a2b8'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
}

// Global functions for NFT interactions
function buyNFT(nftId, price) {
    if (!marketplace.account) {
        marketplace.showNotification('Please connect your wallet first', 'warning');
        return;
    }
    
    // Simulate purchase process
    marketplace.showNotification(`Processing purchase of NFT ${nftId} for ${price} ETH...`, 'info');
    
    // In production, this would interact with smart contracts
    setTimeout(() => {
        marketplace.showNotification('NFT purchased successfully! (Demo)', 'success');
    }, 2000);
}

function makeOffer(nftId) {
    if (!marketplace.account) {
        marketplace.showNotification('Please connect your wallet first', 'warning');
        return;
    }
    
    const offerAmount = prompt('Enter your offer amount in ETH:');
    if (offerAmount && parseFloat(offerAmount) > 0) {
        marketplace.showNotification(`Offer of ${offerAmount} ETH submitted for NFT ${nftId} (Demo)`, 'info');
    }
}

// Initialize marketplace
const marketplace = new KrayStateNFTMarketplace();

// Page load events
document.addEventListener('DOMContentLoaded', function() {
    console.log('KrayState NFT Marketplace loaded');
    console.log('Connected to contracts:', <?= json_encode(CONTRACTS) ?>);
});
</script>

<!-- Include original footer if exists -->
<?php 
if (file_exists('components/footer.php')) {
    include 'components/footer.php';
}
?>

</body>
</html>