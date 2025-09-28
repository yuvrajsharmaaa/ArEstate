<?php
/**
 * NFT Data Manager - Handles JSON-based storage for marketplace
 * This replaces database functionality with JSON files for demo purposes
 */

require_once 'config.php';
require_once 'web3_integration.php';

class NFTDataManager {
    private $web3;
    
    public function __construct() {
        $this->web3 = new Web3Integration();
    }
    
    /**
     * Get all NFTs with optional filters
     */
    public function getAllNFTs($filters = []) {
        $nfts = loadJsonData(NFT_DATA_FILE);
        
        // Apply filters
        if (!empty($filters['collection_id'])) {
            $nfts = array_filter($nfts, function($nft) use ($filters) {
                return $nft['collection_id'] === $filters['collection_id'];
            });
        }
        
        if (!empty($filters['is_listed'])) {
            $nfts = array_filter($nfts, function($nft) {
                return $nft['is_listed'] === true;
            });
        }
        
        if (!empty($filters['price_min'])) {
            $nfts = array_filter($nfts, function($nft) use ($filters) {
                return floatval($nft['current_price']) >= floatval($filters['price_min']);
            });
        }
        
        if (!empty($filters['price_max'])) {
            $nfts = array_filter($nfts, function($nft) use ($filters) {
                return floatval($nft['current_price']) <= floatval($filters['price_max']);
            });
        }
        
        if (!empty($filters['search'])) {
            $searchTerm = strtolower($filters['search']);
            $nfts = array_filter($nfts, function($nft) use ($searchTerm) {
                return strpos(strtolower($nft['name']), $searchTerm) !== false ||
                       strpos(strtolower($nft['description']), $searchTerm) !== false ||
                       strpos(strtolower($nft['location']), $searchTerm) !== false;
            });
        }
        
        if (!empty($filters['property_type'])) {
            $nfts = array_filter($nfts, function($nft) use ($filters) {
                return $nft['property_type'] === $filters['property_type'];
            });
        }
        
        // Sort by date (newest first)
        usort($nfts, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });
        
        return array_values($nfts);
    }
    
    /**
     * Get NFT by ID
     */
    public function getNFTById($id) {
        $nfts = loadJsonData(NFT_DATA_FILE);
        
        foreach ($nfts as $nft) {
            if ($nft['id'] === $id) {
                return $nft;
            }
        }
        
        return null;
    }
    
    /**
     * Get NFTs by owner wallet
     */
    public function getNFTsByOwner($ownerWallet) {
        $nfts = loadJsonData(NFT_DATA_FILE);
        
        return array_filter($nfts, function($nft) use ($ownerWallet) {
            return strtolower($nft['owner_wallet']) === strtolower($ownerWallet);
        });
    }
    
    /**
     * Create new NFT listing
     */
    public function createNFT($data) {
        $nfts = loadJsonData(NFT_DATA_FILE);
        
        $nft = [
            'id' => generateId('nft'),
            'collection_id' => $data['collection_id'] ?? 'kraystate-properties',
            'token_id' => $data['token_id'] ?? count($nfts) + 1,
            'name' => $data['name'],
            'description' => $data['description'],
            'image_url' => $data['image_url'],
            'metadata_url' => $data['metadata_url'] ?? '',
            'owner_wallet' => $data['owner_wallet'],
            'creator_wallet' => $data['creator_wallet'],
            'current_price' => $data['current_price'] ?? '0',
            'last_sale_price' => null,
            'property_value' => $data['property_value'] ?? 0,
            'rental_yield' => $data['rental_yield'] ?? '0',
            'location' => $data['location'] ?? '',
            'property_type' => $data['property_type'] ?? 'residential',
            'rarity_rank' => $data['rarity_rank'] ?? rand(1, 1000),
            'is_listed' => $data['is_listed'] ?? false,
            'attributes' => $data['attributes'] ?? [],
            'created_at' => date('Y-m-d H:i:s')
        ];
        
        $nfts[] = $nft;
        saveJsonData(NFT_DATA_FILE, $nfts);
        
        return $nft;
    }
    
    /**
     * Update NFT ownership
     */
    public function transferNFT($nftId, $newOwnerWallet, $salePrice = null) {
        $nfts = loadJsonData(NFT_DATA_FILE);
        
        foreach ($nfts as &$nft) {
            if ($nft['id'] === $nftId) {
                $nft['owner_wallet'] = $newOwnerWallet;
                $nft['is_listed'] = false; // Remove from marketplace
                
                if ($salePrice) {
                    $nft['last_sale_price'] = $salePrice;
                }
                
                break;
            }
        }
        
        return saveJsonData(NFT_DATA_FILE, $nfts);
    }
    
    /**
     * List/Unlist NFT for sale
     */
    public function updateListingStatus($nftId, $isListed, $price = null) {
        $nfts = loadJsonData(NFT_DATA_FILE);
        
        foreach ($nfts as &$nft) {
            if ($nft['id'] === $nftId) {
                $nft['is_listed'] = $isListed;
                
                if ($isListed && $price) {
                    $nft['current_price'] = $price;
                }
                
                break;
            }
        }
        
        return saveJsonData(NFT_DATA_FILE, $nfts);
    }
    
    /**
     * Get marketplace statistics
     */
    public function getMarketplaceStats() {
        $nfts = loadJsonData(NFT_DATA_FILE);
        $transactions = loadJsonData(TRANSACTIONS_DATA_FILE);
        
        $totalNFTs = count($nfts);
        $listedNFTs = count(array_filter($nfts, function($nft) {
            return $nft['is_listed'];
        }));
        
        $totalVolume = array_sum(array_column($transactions, 'price_eth'));
        $floorPrice = null;
        
        $listedPrices = array_column(array_filter($nfts, function($nft) {
            return $nft['is_listed'] && floatval($nft['current_price']) > 0;
        }), 'current_price');
        
        if (!empty($listedPrices)) {
            $floorPrice = min(array_map('floatval', $listedPrices));
        }
        
        return [
            'total_nfts' => $totalNFTs,
            'listed_nfts' => $listedNFTs,
            'total_volume' => number_format($totalVolume, 2),
            'floor_price' => $floorPrice ? number_format($floorPrice, 4) : '0',
            'total_transactions' => count($transactions)
        ];
    }
    
    /**
     * Get recent transactions
     */
    public function getRecentTransactions($limit = 10) {
        $transactions = loadJsonData(TRANSACTIONS_DATA_FILE);
        
        // Sort by timestamp (newest first)
        usort($transactions, function($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });
        
        return array_slice($transactions, 0, $limit);
    }
    
    /**
     * Record a transaction
     */
    public function recordTransaction($data) {
        $transactions = loadJsonData(TRANSACTIONS_DATA_FILE);
        
        $transaction = [
            'id' => generateId('tx'),
            'nft_id' => $data['nft_id'],
            'from_wallet' => $data['from_wallet'] ?? null,
            'to_wallet' => $data['to_wallet'],
            'price_eth' => $data['price_eth'],
            'transaction_hash' => $data['transaction_hash'],
            'block_number' => $data['block_number'] ?? null,
            'status' => $data['status'] ?? 'pending',
            'gas_used' => $data['gas_used'] ?? null,
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        $transactions[] = $transaction;
        saveJsonData(TRANSACTIONS_DATA_FILE, $transactions);
        
        return $transaction;
    }
    
    /**
     * Get collection information
     */
    public function getCollections() {
        return DEFAULT_COLLECTIONS;
    }
    
    /**
     * Get collection by ID
     */
    public function getCollectionById($id) {
        $collections = $this->getCollections();
        
        foreach ($collections as $collection) {
            if ($collection['id'] === $id) {
                return $collection;
            }
        }
        
        return null;
    }
    
    /**
     * Sync NFT data with blockchain
     * Verifies ownership and updates data from smart contracts
     */
    public function syncWithBlockchain($nftId) {
        $nft = $this->getNFTById($nftId);
        if (!$nft) {
            return false;
        }
        
        $contractAddress = CONTRACTS['PropertyToken'];
        
        // Verify ownership
        $actualOwner = $this->web3->getTokenOwner($contractAddress, $nft['token_id']);
        if ($actualOwner && $actualOwner !== $nft['owner_wallet']) {
            // Update ownership in our data
            $this->transferNFT($nftId, $actualOwner);
        }
        
        // Get token URI and metadata
        $tokenURI = $this->web3->getTokenURI($contractAddress, $nft['token_id']);
        if ($tokenURI) {
            $metadata = $this->web3->fetchNFTMetadata($tokenURI);
            if ($metadata) {
                // Update metadata in our data
                $nfts = loadJsonData(NFT_DATA_FILE);
                foreach ($nfts as &$storedNFT) {
                    if ($storedNFT['id'] === $nftId) {
                        $storedNFT['metadata_url'] = $tokenURI;
                        if (isset($metadata['image'])) {
                            $storedNFT['image_url'] = $metadata['image'];
                        }
                        if (isset($metadata['attributes'])) {
                            $storedNFT['attributes'] = $metadata['attributes'];
                        }
                        break;
                    }
                }
                saveJsonData(NFT_DATA_FILE, $nfts);
            }
        }
        
        return true;
    }
    
    /**
     * Search NFTs by multiple criteria
     */
    public function searchNFTs($query, $filters = []) {
        $filters['search'] = $query;
        return $this->getAllNFTs($filters);
    }
    
    /**
     * Get trending NFTs (by recent activity)
     */
    public function getTrendingNFTs($limit = 8) {
        $transactions = loadJsonData(TRANSACTIONS_DATA_FILE);
        $nfts = loadJsonData(NFT_DATA_FILE);
        
        // Count transactions per NFT in last 7 days
        $weekAgo = date('Y-m-d H:i:s', strtotime('-7 days'));
        $nftActivity = [];
        
        foreach ($transactions as $tx) {
            if ($tx['timestamp'] > $weekAgo) {
                if (!isset($nftActivity[$tx['nft_id']])) {
                    $nftActivity[$tx['nft_id']] = 0;
                }
                $nftActivity[$tx['nft_id']]++;
            }
        }
        
        // Sort by activity
        arsort($nftActivity);
        
        $trending = [];
        foreach (array_keys($nftActivity) as $nftId) {
            $nft = $this->getNFTById($nftId);
            if ($nft) {
                $trending[] = $nft;
            }
            
            if (count($trending) >= $limit) {
                break;
            }
        }
        
        // Fill with random NFTs if not enough trending
        if (count($trending) < $limit) {
            $allNFTs = array_filter($nfts, function($nft) use ($trending) {
                return !in_array($nft['id'], array_column($trending, 'id'));
            });
            
            $needed = $limit - count($trending);
            $additional = array_slice($allNFTs, 0, $needed);
            $trending = array_merge($trending, $additional);
        }
        
        return $trending;
    }
}

?>