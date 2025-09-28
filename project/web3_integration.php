<?php
/**
 * Web3 Integration Class for KrayState NFT Marketplace  
 * Handles smart contract interactions and blockchain operations
 */

require_once 'config.php';

class Web3Integration {
    private $rpcUrl;
    private $chainId;
    private $contracts;
    
    public function __construct() {
        $this->rpcUrl = RPC_URL;
        $this->chainId = CHAIN_ID;
        $this->contracts = CONTRACTS;
    }
    
    /**
     * Make HTTP request to Ethereum RPC endpoint
     */
    private function makeRPCCall($method, $params = []) {
        $payload = [
            'jsonrpc' => '2.0',
            'id' => time(),
            'method' => $method,
            'params' => $params
        ];
        
        $ch = curl_init($this->rpcUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Content-Length: ' . strlen(json_encode($payload))
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_TIMEOUT, WEB3_TIMEOUT);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        if (curl_error($ch)) {
            error_log('Web3 RPC Error: ' . curl_error($ch));
            return false;
        }
        
        curl_close($ch);
        
        if ($httpCode !== 200) {
            error_log('Web3 HTTP Error: ' . $httpCode);
            return false;
        }
        
        $decoded = json_decode($response, true);
        
        if (isset($decoded['error'])) {
            error_log('Web3 JSON-RPC Error: ' . json_encode($decoded['error']));
            return false;
        }
        
        return $decoded['result'] ?? false;
    }
    
    /**
     * Get latest block number
     */
    public function getLatestBlock() {
        $result = $this->makeRPCCall('eth_blockNumber');
        return $result ? hexdec($result) : false;
    }
    
    /**
     * Get ETH balance for an address
     */
    public function getBalance($address) {
        $result = $this->makeRPCCall('eth_getBalance', [$address, 'latest']);
        if ($result) {
            // Convert from wei to ether
            return bcdiv($result, '1000000000000000000', 18);
        }
        return '0';
    }
    
    /**
     * Get transaction details
     */
    public function getTransaction($txHash) {
        return $this->makeRPCCall('eth_getTransactionByHash', [$txHash]);
    }
    
    /**
     * Get transaction receipt
     */
    public function getTransactionReceipt($txHash) {
        return $this->makeRPCCall('eth_getTransactionReceipt', [$txHash]);
    }
    
    /**
     * Call a contract method (read-only)
     */
    public function callContract($contractAddress, $data, $from = null) {
        $params = [
            'to' => $contractAddress,
            'data' => $data
        ];
        
        if ($from) {
            $params['from'] = $from;
        }
        
        return $this->makeRPCCall('eth_call', [$params, 'latest']);
    }
    
    /**
     * Get ERC-20/ERC-721 token name
     */
    public function getTokenName($contractAddress) {
        // ERC-20/ERC-721 name() function signature: 0x06fdde03
        $data = '0x06fdde03';
        $result = $this->callContract($contractAddress, $data);
        
        if ($result && $result !== '0x') {
            // Decode hex string response
            return $this->decodeString($result);
        }
        
        return null;
    }
    
    /**
     * Get ERC-20/ERC-721 token symbol
     */
    public function getTokenSymbol($contractAddress) {
        // ERC-20/ERC-721 symbol() function signature: 0x95d89b41
        $data = '0x95d89b41';
        $result = $this->callContract($contractAddress, $data);
        
        if ($result && $result !== '0x') {
            return $this->decodeString($result);
        }
        
        return null;
    }
    
    /**
     * Get ERC-721 token URI
     */
    public function getTokenURI($contractAddress, $tokenId) {
        // ERC-721 tokenURI() function signature: 0xc87b56dd
        $data = '0xc87b56dd' . str_pad(dechex($tokenId), 64, '0', STR_PAD_LEFT);
        $result = $this->callContract($contractAddress, $data);
        
        if ($result && $result !== '0x') {
            return $this->decodeString($result);
        }
        
        return null;
    }
    
    /**
     * Get ERC-721 owner of token
     */
    public function getTokenOwner($contractAddress, $tokenId) {
        // ERC-721 ownerOf() function signature: 0x6352211e
        $data = '0x6352211e' . str_pad(dechex($tokenId), 64, '0', STR_PAD_LEFT);
        $result = $this->callContract($contractAddress, $data);
        
        if ($result && $result !== '0x') {
            // Extract address from result (last 40 characters)
            return '0x' . substr($result, -40);
        }
        
        return null;
    }
    
    /**
     * Get ERC-721 total supply
     */
    public function getTotalSupply($contractAddress) {
        // totalSupply() function signature: 0x18160ddd
        $data = '0x18160ddd';
        $result = $this->callContract($contractAddress, $data);
        
        if ($result && $result !== '0x') {
            return hexdec($result);
        }
        
        return 0;
    }
    
    /**
     * Decode hex string response from contract call
     */
    private function decodeString($hex) {
        // Remove 0x prefix
        $hex = substr($hex, 2);
        
        // Get offset (first 64 chars represent offset)
        $offset = hexdec(substr($hex, 0, 64)) * 2;
        
        // Get length (next 64 chars represent length)
        $length = hexdec(substr($hex, $offset, 64)) * 2;
        
        // Get actual string data
        $stringHex = substr($hex, $offset + 64, $length);
        
        // Convert hex to string
        return hex2bin($stringHex);
    }
    
    /**
     * Get contract information including token details
     */
    public function getContractInfo($contractAddress) {
        return [
            'address' => $contractAddress,
            'name' => $this->getTokenName($contractAddress),
            'symbol' => $this->getTokenSymbol($contractAddress),
            'total_supply' => $this->getTotalSupply($contractAddress)
        ];
    }
    
    /**
     * Get all contract addresses
     */
    public function getContractAddresses() {
        return $this->contracts;
    }
    
    /**
     * Check if address is valid Ethereum address
     */
    public function isValidAddress($address) {
        return preg_match('/^0x[a-fA-F0-9]{40}$/', $address);
    }
    
    /**
     * Get network information
     */
    public function getNetworkInfo() {
        $blockNumber = $this->getLatestBlock();
        return [
            'chain_id' => $this->chainId,
            'rpc_url' => $this->rpcUrl,
            'latest_block' => $blockNumber,
            'is_connected' => $blockNumber !== false
        ];
    }
    
    /**
     * Simulate NFT purchase (for demo purposes)
     * In production, this would be handled by frontend with MetaMask
     */
    public function simulatePurchase($nftId, $price, $buyerWallet) {
        // This is a simulation for demo purposes
        // Real purchases would be executed through MetaMask/Web3 wallet
        
        $transactionData = [
            'id' => generateId('tx'),
            'nft_id' => $nftId,
            'buyer_wallet' => $buyerWallet,
            'price_eth' => $price,
            'transaction_hash' => '0x' . bin2hex(random_bytes(32)), // Simulated hash
            'block_number' => $this->getLatestBlock(),
            'status' => 'confirmed',
            'gas_used' => rand(21000, 100000),
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        // Save transaction to JSON file
        $transactions = loadJsonData(TRANSACTIONS_DATA_FILE);
        $transactions[] = $transactionData;
        saveJsonData(TRANSACTIONS_DATA_FILE, $transactions);
        
        return [
            'success' => true,
            'transaction' => $transactionData
        ];
    }
    
    /**
     * Get NFT metadata from IPFS or HTTP URL
     */
    public function fetchNFTMetadata($metadataUrl) {
        if (empty($metadataUrl)) {
            return null;
        }
        
        // Handle IPFS URLs
        if (strpos($metadataUrl, 'ipfs://') === 0) {
            $metadataUrl = str_replace('ipfs://', 'https://ipfs.io/ipfs/', $metadataUrl);
        }
        
        $ch = curl_init($metadataUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200 && $response) {
            return json_decode($response, true);
        }
        
        return null;
    }
    
    /**
     * Verify NFT ownership on blockchain
     */
    public function verifyNFTOwnership($contractAddress, $tokenId, $ownerAddress) {
        $actualOwner = $this->getTokenOwner($contractAddress, $tokenId);
        return strtolower($actualOwner) === strtolower($ownerAddress);
    }
}

?>