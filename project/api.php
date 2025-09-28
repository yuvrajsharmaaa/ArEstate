<?php
/**
 * KrayState NFT Marketplace API
 * Handles AJAX requests and smart contract interactions
 */

require_once 'config.php';
require_once 'nft_data_manager.php';
require_once 'web3_integration.php';

// Set JSON response headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Initialize managers
$nftManager = new NFTDataManager();
$web3 = new Web3Integration();

// Get request method and action
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    switch ($action) {
        
        case 'get_nfts':
            // Get NFTs with filters
            $filters = [
                'collection_id' => $_GET['collection_id'] ?? null,
                'is_listed' => isset($_GET['is_listed']) ? (bool)$_GET['is_listed'] : null,
                'price_min' => $_GET['price_min'] ?? null,
                'price_max' => $_GET['price_max'] ?? null,
                'search' => $_GET['search'] ?? null,
                'property_type' => $_GET['property_type'] ?? null
            ];
            
            $filters = array_filter($filters, function($value) {
                return $value !== null && $value !== '';
            });
            
            $nfts = $nftManager->getAllNFTs($filters);
            
            echo json_encode([
                'success' => true,
                'data' => $nfts,
                'count' => count($nfts)
            ]);
            break;
            
        case 'get_nft':
            // Get single NFT by ID
            $nftId = $_GET['id'] ?? '';
            if (empty($nftId)) {
                throw new Exception('NFT ID is required');
            }
            
            $nft = $nftManager->getNFTById($nftId);
            if (!$nft) {
                throw new Exception('NFT not found');
            }
            
            echo json_encode([
                'success' => true,
                'data' => $nft
            ]);
            break;
            
        case 'get_marketplace_stats':
            // Get marketplace statistics
            $stats = $nftManager->getMarketplaceStats();
            
            echo json_encode([
                'success' => true,
                'data' => $stats
            ]);
            break;
            
        case 'get_trending':
            // Get trending NFTs
            $limit = (int)($_GET['limit'] ?? 8);
            $trending = $nftManager->getTrendingNFTs($limit);
            
            echo json_encode([
                'success' => true,
                'data' => $trending
            ]);
            break;
            
        case 'get_contract_info':
            // Get smart contract information
            $contractName = $_GET['contract'] ?? '';
            if (empty($contractName) || !isset(CONTRACTS[$contractName])) {
                throw new Exception('Invalid contract name');
            }
            
            $contractAddress = CONTRACTS[$contractName];
            $contractInfo = $web3->getContractInfo($contractAddress);
            
            echo json_encode([
                'success' => true,
                'data' => $contractInfo
            ]);
            break;
            
        case 'get_token_owner':
            // Get token owner from blockchain
            $tokenId = $_GET['token_id'] ?? '';
            $contractAddress = CONTRACTS['PropertyToken'];
            
            if (empty($tokenId)) {
                throw new Exception('Token ID is required');
            }
            
            $owner = $web3->getTokenOwner($contractAddress, $tokenId);
            
            echo json_encode([
                'success' => true,
                'data' => [
                    'token_id' => $tokenId,
                    'owner' => $owner,
                    'contract' => $contractAddress
                ]
            ]);
            break;
            
        case 'get_wallet_balance':
            // Get ETH balance for wallet
            $walletAddress = $_GET['wallet'] ?? '';
            if (empty($walletAddress)) {
                throw new Exception('Wallet address is required');
            }
            
            if (!$web3->isValidAddress($walletAddress)) {
                throw new Exception('Invalid wallet address');
            }
            
            $balance = $web3->getBalance($walletAddress);
            
            echo json_encode([
                'success' => true,
                'data' => [
                    'wallet' => $walletAddress,
                    'balance_eth' => $balance
                ]
            ]);
            break;
            
        case 'simulate_purchase':
            // Simulate NFT purchase (for demo purposes)
            if ($method !== 'POST') {
                throw new Exception('POST method required');
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            $nftId = $input['nft_id'] ?? '';
            $buyerWallet = $input['buyer_wallet'] ?? '';
            $price = $input['price'] ?? 0;
            
            if (empty($nftId) || empty($buyerWallet) || $price <= 0) {
                throw new Exception('Invalid purchase parameters');
            }
            
            if (!$web3->isValidAddress($buyerWallet)) {
                throw new Exception('Invalid buyer wallet address');
            }
            
            // Get NFT data
            $nft = $nftManager->getNFTById($nftId);
            if (!$nft) {
                throw new Exception('NFT not found');
            }
            
            if (!$nft['is_listed']) {
                throw new Exception('NFT is not listed for sale');
            }
            
            // Simulate purchase transaction
            $result = $web3->simulatePurchase($nftId, $price, $buyerWallet);
            
            if ($result['success']) {
                // Update NFT ownership
                $nftManager->transferNFT($nftId, $buyerWallet, $price);
                
                // Record transaction
                $nftManager->recordTransaction([
                    'nft_id' => $nftId,
                    'from_wallet' => $nft['owner_wallet'],
                    'to_wallet' => $buyerWallet,
                    'price_eth' => $price,
                    'transaction_hash' => $result['transaction']['transaction_hash'],
                    'status' => 'confirmed'
                ]);
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'NFT purchase simulated successfully',
                'data' => $result['transaction']
            ]);
            break;
            
        case 'create_nft':
            // Create new NFT listing
            if ($method !== 'POST') {
                throw new Exception('POST method required');
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            $requiredFields = ['name', 'description', 'owner_wallet', 'creator_wallet'];
            foreach ($requiredFields as $field) {
                if (empty($input[$field])) {
                    throw new Exception("Field '$field' is required");
                }
            }
            
            if (!$web3->isValidAddress($input['owner_wallet']) || !$web3->isValidAddress($input['creator_wallet'])) {
                throw new Exception('Invalid wallet address');
            }
            
            $nft = $nftManager->createNFT($input);
            
            echo json_encode([
                'success' => true,
                'message' => 'NFT created successfully',
                'data' => $nft
            ]);
            break;
            
        case 'update_listing':
            // Update NFT listing status
            if ($method !== 'POST') {
                throw new Exception('POST method required');
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            $nftId = $input['nft_id'] ?? '';
            $isListed = $input['is_listed'] ?? false;
            $price = $input['price'] ?? null;
            
            if (empty($nftId)) {
                throw new Exception('NFT ID is required');
            }
            
            $result = $nftManager->updateListingStatus($nftId, $isListed, $price);
            
            echo json_encode([
                'success' => true,
                'message' => $isListed ? 'NFT listed for sale' : 'NFT removed from sale',
                'data' => ['nft_id' => $nftId, 'is_listed' => $isListed]
            ]);
            break;
            
        case 'sync_blockchain':
            // Sync NFT data with blockchain
            $nftId = $_GET['nft_id'] ?? '';
            if (empty($nftId)) {
                throw new Exception('NFT ID is required');
            }
            
            $result = $nftManager->syncWithBlockchain($nftId);
            
            echo json_encode([
                'success' => true,
                'message' => 'NFT data synced with blockchain',
                'data' => ['synced' => $result]
            ]);
            break;
            
        case 'get_network_info':
            // Get blockchain network information
            $networkInfo = $web3->getNetworkInfo();
            
            echo json_encode([
                'success' => true,
                'data' => $networkInfo
            ]);
            break;
            
        case 'get_contracts':
            // Get all contract addresses
            echo json_encode([
                'success' => true,
                'data' => [
                    'contracts' => CONTRACTS,
                    'network' => [
                        'name' => ETHEREUM_NETWORK,
                        'chain_id' => CHAIN_ID,
                        'rpc_url' => RPC_URL
                    ]
                ]
            ]);
            break;
            
        case 'get_recent_transactions':
            // Get recent marketplace transactions
            $limit = (int)($_GET['limit'] ?? 10);
            $transactions = $nftManager->getRecentTransactions($limit);
            
            echo json_encode([
                'success' => true,
                'data' => $transactions
            ]);
            break;
            
        case 'search':
            // Search NFTs
            $query = $_GET['q'] ?? '';
            $filters = [
                'property_type' => $_GET['property_type'] ?? null,
                'price_min' => $_GET['price_min'] ?? null,
                'price_max' => $_GET['price_max'] ?? null,
                'is_listed' => isset($_GET['is_listed']) ? (bool)$_GET['is_listed'] : null
            ];
            
            $filters = array_filter($filters);
            $results = $nftManager->searchNFTs($query, $filters);
            
            echo json_encode([
                'success' => true,
                'data' => $results,
                'query' => $query,
                'count' => count($results)
            ]);
            break;
            
        default:
            throw new Exception('Invalid API action');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} catch (Error $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error'
    ]);
}

?>