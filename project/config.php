<?php
/**
 * KrayState NFT Marketplace Configuration
 * Enhanced real estate platform with Web3 and smart contract integration
 */

// Application Settings
define('APP_NAME', 'KrayState ArEstate NFT Marketplace');
define('APP_VERSION', '2.0.0');
define('BASE_URL', 'http://localhost/Kraystate/project');
define('BASE_PATH', __DIR__);

// Blockchain Configuration - Your Deployed Smart Contracts on Sepolia
define('ETHEREUM_NETWORK', 'sepolia');
define('RPC_URL', 'https://rpc.sepolia.org');
define('ETHERSCAN_API_URL', 'https://api-sepolia.etherscan.io/api');
define('CHAIN_ID', 11155111);

// Smart Contract Addresses (Your deployed contracts)
define('CONTRACTS', [
    'IdentityRegistry' => '0xD4b19AB3f4e22557b32aD8d88E0C0737c5f8B933',
    'Compliance' => '0x3982a23b37d0e82040B8Ae9Cef4274094fD5a6f9', 
    'PropertyToken' => '0xc601F6352300Af039FA9E4F63545cC52c33D44D8',
    'LeaseAgreement' => '0x987C8053eb163bb63bb4EEB85cAaDF3041d2D922',
    'EscrowPayment' => '0x4722813a0d172B8e13fB092f032dd84341aE8515'
]);

// JSON Data Storage Paths (for demo/temporary storage)
define('DATA_DIR', BASE_PATH . '/data');
define('NFT_DATA_FILE', DATA_DIR . '/nfts.json');
define('USER_DATA_FILE', DATA_DIR . '/users.json');
define('LISTINGS_DATA_FILE', DATA_DIR . '/listings.json');
define('TRANSACTIONS_DATA_FILE', DATA_DIR . '/transactions.json');

// File Upload Settings
define('UPLOAD_DIR', BASE_PATH . '/uploaded_files');
define('NFT_IMAGES_DIR', BASE_PATH . '/images/nft');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_IMAGE_TYPES', ['jpg', 'jpeg', 'png', 'gif', 'webp']);

// Create data directory if it doesn't exist
if (!is_dir(DATA_DIR)) {
    mkdir(DATA_DIR, 0755, true);
}

// Create NFT images directory if it doesn't exist  
if (!is_dir(NFT_IMAGES_DIR)) {
    mkdir(NFT_IMAGES_DIR, 0755, true);
}

// Initialize JSON data files if they don't exist
$dataFiles = [
    NFT_DATA_FILE => [],
    USER_DATA_FILE => [],
    LISTINGS_DATA_FILE => [],
    TRANSACTIONS_DATA_FILE => []
];

foreach ($dataFiles as $file => $defaultData) {
    if (!file_exists($file)) {
        file_put_contents($file, json_encode($defaultData, JSON_PRETTY_PRINT));
    }
}

// Web3 Settings
define('WEB3_TIMEOUT', 30); // seconds
define('GAS_LIMIT', 300000);
define('GAS_PRICE', '20000000000'); // 20 Gwei

// Demo/Default Data
define('DEFAULT_COLLECTIONS', [
    [
        'id' => 'kraystate-properties',
        'name' => 'KrayState Properties',
        'symbol' => 'KPROP', 
        'description' => 'Tokenized real estate properties on KrayState platform',
        'contract_address' => CONTRACTS['PropertyToken'],
        'banner_image' => 'images/collections/kraystate-banner.jpg',
        'featured_image' => 'images/collections/kraystate-featured.jpg',
        'floor_price' => '0.5',
        'total_volume' => '125.7',
        'total_supply' => 1000,
        'is_verified' => true
    ]
]);

// Demo NFTs (will be loaded into JSON storage)
define('DEMO_NFTS', [
    [
        'id' => 'nft_1',
        'collection_id' => 'kraystate-properties',
        'token_id' => '1',
        'name' => 'Luxury Downtown Condo #001',
        'description' => 'Prime downtown condominium with city views. Tokenized ownership allows fractional investment.',
        'image_url' => 'images/nft/property-1.jpg',
        'metadata_url' => '',
        'owner_wallet' => '0x0000000000000000000000000000000000000000',
        'creator_wallet' => '0x742d35Cc6634C0532925a3b8D0c8f8dd8E8a6f8',
        'current_price' => '1.5',
        'last_sale_price' => '1.2',
        'property_value' => 250000,
        'rental_yield' => '8.5',
        'location' => 'Downtown Manhattan, NY',
        'property_type' => 'residential',
        'rarity_rank' => 45,
        'is_listed' => true,
        'attributes' => [
            ['trait_type' => 'Location', 'value' => 'Downtown Manhattan'],
            ['trait_type' => 'Property Type', 'value' => 'Condominium'],
            ['trait_type' => 'Bedrooms', 'value' => '2'],
            ['trait_type' => 'Bathrooms', 'value' => '2'],
            ['trait_type' => 'Square Feet', 'value' => '1200'],
            ['trait_type' => 'Rental Yield', 'value' => '8.5%']
        ],
        'created_at' => '2024-01-15 10:30:00'
    ],
    [
        'id' => 'nft_2', 
        'collection_id' => 'kraystate-properties',
        'token_id' => '2',
        'name' => 'Suburban Villa #002',
        'description' => 'Beautiful suburban villa with garden. Perfect for family living and investment.',
        'image_url' => 'images/nft/property-2.jpg',
        'metadata_url' => '',
        'owner_wallet' => '0x8ba1f109551bD432803012645Hac136c7068e12e',
        'creator_wallet' => '0x742d35Cc6634C0532925a3b8D0c8f8dd8E8a6f8',
        'current_price' => '2.8',
        'last_sale_price' => '2.5',
        'property_value' => 450000,
        'rental_yield' => '6.2',
        'location' => 'Westfield, NJ',
        'property_type' => 'residential',
        'rarity_rank' => 12,
        'is_listed' => true,
        'attributes' => [
            ['trait_type' => 'Location', 'value' => 'Westfield, NJ'],
            ['trait_type' => 'Property Type', 'value' => 'Villa'],
            ['trait_type' => 'Bedrooms', 'value' => '4'],
            ['trait_type' => 'Bathrooms', 'value' => '3'],
            ['trait_type' => 'Square Feet', 'value' => '2800'],
            ['trait_type' => 'Garden', 'value' => 'Yes'],
            ['trait_type' => 'Rental Yield', 'value' => '6.2%']
        ],
        'created_at' => '2024-01-16 14:15:00'
    ],
    [
        'id' => 'nft_3',
        'collection_id' => 'kraystate-properties', 
        'token_id' => '3',
        'name' => 'Commercial Office Space #003',
        'description' => 'Premium office space in business district. High rental yield guaranteed.',
        'image_url' => 'images/nft/property-3.jpg',
        'metadata_url' => '',
        'owner_wallet' => '0x0000000000000000000000000000000000000000',
        'creator_wallet' => '0x742d35Cc6634C0532925a3b8D0c8f8dd8E8a6f8',
        'current_price' => '5.2',
        'last_sale_price' => null,
        'property_value' => 850000,
        'rental_yield' => '12.3',
        'location' => 'Financial District, NYC',
        'property_type' => 'commercial',
        'rarity_rank' => 3,
        'is_listed' => true,
        'attributes' => [
            ['trait_type' => 'Location', 'value' => 'Financial District, NYC'],
            ['trait_type' => 'Property Type', 'value' => 'Office'],
            ['trait_type' => 'Floor', 'value' => '25th'],
            ['trait_type' => 'Square Feet', 'value' => '4500'],
            ['trait_type' => 'Parking', 'value' => 'Yes'],
            ['trait_type' => 'Rental Yield', 'value' => '12.3%']
        ],
        'created_at' => '2024-01-17 09:45:00'
    ]
]);

// Utility functions for JSON data management
function loadJsonData($file) {
    if (!file_exists($file)) {
        return [];
    }
    $content = file_get_contents($file);
    return json_decode($content, true) ?: [];
}

function saveJsonData($file, $data) {
    return file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

function generateId($prefix = 'id') {
    return $prefix . '_' . bin2hex(random_bytes(8)) . '_' . time();
}

// Initialize demo data on first run
function initializeDemoData() {
    $nfts = loadJsonData(NFT_DATA_FILE);
    if (empty($nfts)) {
        saveJsonData(NFT_DATA_FILE, DEMO_NFTS);
    }
}

// Call initialization
initializeDemoData();

// Error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Timezone
date_default_timezone_set('UTC');

?>