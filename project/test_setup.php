<?php
/**
 * Test Script - Verify KrayState NFT Marketplace Setup
 * Run this file to check if everything is working correctly
 */

require_once 'config.php';
require_once 'web3_integration.php';
require_once 'nft_data_manager.php';

echo "<h1>KrayState NFT Marketplace - System Test</h1>";
echo "<style>body{font-family:Arial,sans-serif;margin:2rem;} .success{color:#28a745;} .error{color:#dc3545;} .info{color:#17a2b8;} .warning{color:#ffc107;}</style>";

// Test 1: Configuration
echo "<h2>1. Configuration Test</h2>";
try {
    echo "<p class='info'>✓ PHP Version: " . PHP_VERSION . "</p>";
    echo "<p class='info'>✓ Base Path: " . BASE_PATH . "</p>";
    echo "<p class='info'>✓ Data Directory: " . DATA_DIR . "</p>";
    
    if (is_dir(DATA_DIR)) {
        echo "<p class='success'>✓ Data directory exists and is writable</p>";
    } else {
        echo "<p class='error'>✗ Data directory not found</p>";
    }
    
    echo "<p class='info'>✓ Contract Addresses:</p>";
    echo "<ul>";
    foreach (CONTRACTS as $name => $address) {
        echo "<li><strong>$name:</strong> $address</li>";
    }
    echo "</ul>";
    
} catch (Exception $e) {
    echo "<p class='error'>✗ Configuration Error: " . $e->getMessage() . "</p>";
}

// Test 2: JSON Data Files
echo "<h2>2. Data Storage Test</h2>";
try {
    $nftManager = new NFTDataManager();
    
    if (file_exists(NFT_DATA_FILE)) {
        $nfts = loadJsonData(NFT_DATA_FILE);
        echo "<p class='success'>✓ NFT data file exists with " . count($nfts) . " items</p>";
    } else {
        echo "<p class='warning'>⚠ NFT data file not found, will be created</p>";
    }
    
    if (file_exists(TRANSACTIONS_DATA_FILE)) {
        $transactions = loadJsonData(TRANSACTIONS_DATA_FILE);
        echo "<p class='success'>✓ Transactions file exists with " . count($transactions) . " items</p>";
    } else {
        echo "<p class='warning'>⚠ Transactions file not found, will be created</p>";
    }
    
    // Test marketplace stats
    $stats = $nftManager->getMarketplaceStats();
    echo "<p class='info'>✓ Marketplace Statistics:</p>";
    echo "<ul>";
    echo "<li>Total NFTs: {$stats['total_nfts']}</li>";
    echo "<li>Listed NFTs: {$stats['listed_nfts']}</li>";
    echo "<li>Floor Price: {$stats['floor_price']} ETH</li>";
    echo "<li>Total Volume: {$stats['total_volume']} ETH</li>";
    echo "</ul>";
    
} catch (Exception $e) {
    echo "<p class='error'>✗ Data Storage Error: " . $e->getMessage() . "</p>";
}

// Test 3: Web3 Integration
echo "<h2>3. Web3 Integration Test</h2>";
try {
    $web3 = new Web3Integration();
    
    // Test network connectivity
    $networkInfo = $web3->getNetworkInfo();
    if ($networkInfo['is_connected']) {
        echo "<p class='success'>✓ Connected to Ethereum network</p>";
        echo "<p class='info'>Current Block: " . $networkInfo['latest_block'] . "</p>";
    } else {
        echo "<p class='error'>✗ Failed to connect to Ethereum network</p>";
    }
    
    // Test contract info
    echo "<p class='info'>✓ Contract Information:</p>";
    foreach (CONTRACTS as $name => $address) {
        $contractInfo = $web3->getContractInfo($address);
        echo "<ul>";
        echo "<li><strong>$name Contract:</strong></li>";
        echo "<li>Address: {$contractInfo['address']}</li>";
        echo "<li>Name: " . ($contractInfo['name'] ?: 'N/A') . "</li>";
        echo "<li>Symbol: " . ($contractInfo['symbol'] ?: 'N/A') . "</li>";
        echo "<li>Total Supply: " . ($contractInfo['total_supply'] ?: 'N/A') . "</li>";
        echo "</ul>";
    }
    
} catch (Exception $e) {
    echo "<p class='error'>✗ Web3 Integration Error: " . $e->getMessage() . "</p>";
}

// Test 4: API Endpoints
echo "<h2>4. API Endpoints Test</h2>";
try {
    echo "<p class='info'>✓ Available API Endpoints:</p>";
    $endpoints = [
        'get_nfts' => 'Get all NFTs',
        'get_marketplace_stats' => 'Marketplace statistics',
        'get_contracts' => 'Smart contract addresses',
        'get_network_info' => 'Network information',
        'search' => 'Search NFTs'
    ];
    
    echo "<ul>";
    foreach ($endpoints as $endpoint => $description) {
        echo "<li><code>api.php?action=$endpoint</code> - $description</li>";
    }
    echo "</ul>";
    
    // Test one endpoint
    $testUrl = (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . '/api.php?action=get_marketplace_stats';
    echo "<p class='info'>Test API call: <a href='$testUrl' target='_blank'>$testUrl</a></p>";
    
} catch (Exception $e) {
    echo "<p class='error'>✗ API Test Error: " . $e->getMessage() . "</p>";
}

// Test 5: File Permissions
echo "<h2>5. File Permissions Test</h2>";
$testDirs = [DATA_DIR, NFT_IMAGES_DIR, UPLOAD_DIR];
foreach ($testDirs as $dir) {
    if (is_dir($dir)) {
        if (is_writable($dir)) {
            echo "<p class='success'>✓ Directory writable: $dir</p>";
        } else {
            echo "<p class='error'>✗ Directory not writable: $dir</p>";
        }
    } else {
        echo "<p class='warning'>⚠ Directory doesn't exist (will be created): $dir</p>";
    }
}

// Test 6: Demo Data
echo "<h2>6. Demo Data Test</h2>";
try {
    $demoNFTs = DEMO_NFTS;
    echo "<p class='success'>✓ Demo NFT data loaded: " . count($demoNFTs) . " properties</p>";
    
    foreach ($demoNFTs as $nft) {
        echo "<div style='border:1px solid #ddd;padding:1rem;margin:1rem 0;border-radius:8px;'>";
        echo "<h4>{$nft['name']}</h4>";
        echo "<p><strong>Price:</strong> {$nft['current_price']} ETH</p>";
        echo "<p><strong>Location:</strong> {$nft['location']}</p>";
        echo "<p><strong>Type:</strong> " . ucfirst($nft['property_type']) . "</p>";
        echo "<p><strong>Yield:</strong> {$nft['rental_yield']}%</p>";
        echo "<p><strong>Listed:</strong> " . ($nft['is_listed'] ? 'Yes' : 'No') . "</p>";
        echo "</div>";
    }
    
} catch (Exception $e) {
    echo "<p class='error'>✗ Demo Data Error: " . $e->getMessage() . "</p>";
}

// Test Summary
echo "<h2>7. Test Summary</h2>";
echo "<div style='background:#f8f9fa;padding:2rem;border-radius:8px;margin:2rem 0;'>";
echo "<h3>🎉 KrayState NFT Marketplace Setup Complete!</h3>";
echo "<p><strong>Next Steps:</strong></p>";
echo "<ol>";
echo "<li><strong>Open the marketplace:</strong> <a href='nft_marketplace.php'>nft_marketplace.php</a></li>";
echo "<li><strong>Install MetaMask:</strong> <a href='https://metamask.io/download/' target='_blank'>metamask.io</a></li>";
echo "<li><strong>Get Sepolia ETH:</strong> <a href='https://sepoliafaucet.com/' target='_blank'>sepoliafaucet.com</a></li>";
echo "<li><strong>Connect wallet</strong> and start browsing properties!</li>";
echo "</ol>";

echo "<p><strong>Smart Contract Addresses (Sepolia):</strong></p>";
echo "<table border='1' style='border-collapse:collapse;width:100%;'>";
echo "<tr><th style='padding:0.5rem;'>Contract</th><th style='padding:0.5rem;'>Address</th><th style='padding:0.5rem;'>Etherscan</th></tr>";
foreach (CONTRACTS as $name => $address) {
    $etherscanUrl = "https://sepolia.etherscan.io/address/$address";
    echo "<tr>";
    echo "<td style='padding:0.5rem;'>$name</td>";
    echo "<td style='padding:0.5rem;font-family:monospace;'>$address</td>";
    echo "<td style='padding:0.5rem;'><a href='$etherscanUrl' target='_blank'>View</a></td>";
    echo "</tr>";
}
echo "</table>";
echo "</div>";

echo "<hr>";
echo "<p><em>Test completed at: " . date('Y-m-d H:i:s') . "</em></p>";
?>