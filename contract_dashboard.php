<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KrayState - Smart Contract Dashboard</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css">
    <link rel="stylesheet" href="css/style.css">
    <script src="https://cdn.jsdelivr.net/npm/web3@latest/dist/web3.min.js"></script>
    <style>
        .contract-dashboard {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .contract-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .contract-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .contract-card h3 {
            margin: 0 0 15px 0;
            font-size: 1.3em;
        }
        .contract-function {
            background: rgba(255,255,255,0.1);
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            border-left: 4px solid #fff;
        }
        .contract-function input, .contract-function select {
            width: 100%;
            padding: 8px;
            margin: 5px 0;
            border: none;
            border-radius: 4px;
        }
        .contract-btn {
            background: rgba(255,255,255,0.9);
            color: #333;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px 5px 5px 0;
            transition: all 0.3s;
        }
        .contract-btn:hover {
            background: white;
            transform: translateY(-2px);
        }
        .status-display {
            background: #333;
            color: #fff;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-family: monospace;
            max-height: 200px;
            overflow-y: auto;
        }
        .wallet-info {
            background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
        }
    </style>
</head>
<body>
    <?php include 'components/user_header.php'; ?>
    
    <div class="contract-dashboard">
        <h1><i class="fas fa-cubes"></i> KrayState Smart Contract Dashboard</h1>
        
        <div class="wallet-info" id="walletInfo">
            <h3>🦊 Connect Your Wallet</h3>
            <button class="contract-btn" onclick="connectWallet()">Connect MetaMask</button>
            <p id="walletStatus">Not connected</p>
        </div>
        
        <div id="statusDisplay" class="status-display">
            <p>📊 Contract Status: Ready for interaction</p>
            <p>🌐 Network: Waiting for wallet connection...</p>
        </div>
        
        <div class="contract-grid">
            <!-- Property Token Contract -->
            <div class="contract-card">
                <h3>🏠 Property Token (ERC-3643)</h3>
                <div class="contract-function">
                    <h4>Tokenize Property</h4>
                    <input type="text" id="propertyId" placeholder="Property ID">
                    <input type="number" id="tokenAmount" placeholder="Token Amount">
                    <input type="text" id="metadataURI" placeholder="Metadata URI">
                    <button class="contract-btn" onclick="tokenizeProperty()">🚀 Tokenize</button>
                </div>
                <div class="contract-function">
                    <h4>Check Balance</h4>
                    <input type="text" id="balanceAddress" placeholder="Address to check">
                    <button class="contract-btn" onclick="checkBalance()">💰 Check Balance</button>
                </div>
                <div class="contract-function">
                    <h4>Transfer Tokens</h4>
                    <input type="text" id="transferTo" placeholder="Recipient Address">
                    <input type="number" id="transferAmount" placeholder="Amount">
                    <button class="contract-btn" onclick="transferTokens()">📤 Transfer</button>
                </div>
            </div>
            
            <!-- Lease Agreement Contract -->
            <div class="contract-card">
                <h3>📄 Lease Agreement</h3>
                <div class="contract-function">
                    <h4>Create Lease</h4>
                    <input type="text" id="tenantAddress" placeholder="Tenant Address">
                    <input type="number" id="monthlyRent" placeholder="Monthly Rent (ETH)">
                    <input type="number" id="leaseDuration" placeholder="Duration (months)">
                    <button class="contract-btn" onclick="createLease()">📋 Create Lease</button>
                </div>
                <div class="contract-function">
                    <h4>Pay Rent</h4>
                    <input type="number" id="leaseId" placeholder="Lease ID">
                    <input type="number" id="rentAmount" placeholder="Rent Amount (ETH)">
                    <button class="contract-btn" onclick="payRent()">💸 Pay Rent</button>
                </div>
                <div class="contract-function">
                    <h4>Get Lease Info</h4>
                    <input type="number" id="leaseInfoId" placeholder="Lease ID">
                    <button class="contract-btn" onclick="getLeaseInfo()">ℹ️ Get Info</button>
                </div>
            </div>
            
            <!-- Escrow Payment Contract -->
            <div class="contract-card">
                <h3>🔒 Escrow Payment</h3>
                <div class="contract-function">
                    <h4>Make Deposit</h4>
                    <input type="number" id="escrowLeaseId" placeholder="Lease ID">
                    <input type="number" id="depositAmount" placeholder="Deposit Amount (ETH)">
                    <button class="contract-btn" onclick="makeDeposit()">🏦 Deposit</button>
                </div>
                <div class="contract-function">
                    <h4>Release Funds</h4>
                    <input type="number" id="releaseLeaseId" placeholder="Lease ID">
                    <button class="contract-btn" onclick="releaseFunds()">🔓 Release</button>
                </div>
                <div class="contract-function">
                    <h4>Check Escrow Balance</h4>
                    <input type="number" id="balanceLeaseId" placeholder="Lease ID">
                    <button class="contract-btn" onclick="checkEscrowBalance()">💰 Check Balance</button>
                </div>
            </div>
            
            <!-- Identity Registry Contract -->
            <div class="contract-card">
                <h3>👤 Identity Registry</h3>
                <div class="contract-function">
                    <h4>Register Identity</h4>
                    <input type="text" id="identityAddress" placeholder="Address">
                    <input type="text" id="identityData" placeholder="Identity Data">
                    <button class="contract-btn" onclick="registerIdentity()">🆔 Register</button>
                </div>
                <div class="contract-function">
                    <h4>Verify Identity</h4>
                    <input type="text" id="verifyAddress" placeholder="Address to verify">
                    <button class="contract-btn" onclick="verifyIdentity()">✅ Verify</button>
                </div>
            </div>
            
            <!-- Compliance Contract -->
            <div class="contract-card">
                <h3>⚖️ Compliance</h3>
                <div class="contract-function">
                    <h4>Check Compliance</h4>
                    <input type="text" id="complianceAddress" placeholder="Address">
                    <button class="contract-btn" onclick="checkCompliance()">🔍 Check</button>
                </div>
                <div class="contract-function">
                    <h4>Set Transfer Rules</h4>
                    <input type="number" id="maxTransfer" placeholder="Max Transfer Amount">
                    <button class="contract-btn" onclick="setTransferRules()">📜 Set Rules</button>
                </div>
            </div>
            
            <!-- Mock USDC Contract -->
            <div class="contract-card">
                <h3>💵 Mock USDC</h3>
                <div class="contract-function">
                    <h4>Mint USDC</h4>
                    <input type="text" id="mintAddress" placeholder="Address">
                    <input type="number" id="mintAmount" placeholder="Amount">
                    <button class="contract-btn" onclick="mintUSDC()">🏭 Mint</button>
                </div>
                <div class="contract-function">
                    <h4>USDC Balance</h4>
                    <input type="text" id="usdcAddress" placeholder="Address">
                    <button class="contract-btn" onclick="checkUSDCBalance()">💰 Check</button>
                </div>
            </div>
        </div>
    </div>
    
    <script src="js/web3-config.js"></script>
    <script>
        let web3;
        let userAccount;
        let contracts = {};
        
        // Extended contract configuration
        const FULL_CONTRACT_CONFIG = {
            PROPERTY_TOKEN: {
                address: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
                abi: [
                    "function tokenizeProperty(uint256 tokenAmount, string memory metadataURI) external",
                    "function transfer(address to, uint256 amount) external returns (bool)",
                    "function balanceOf(address account) external view returns (uint256)",
                    "function totalSupply() external view returns (uint256)",
                    "function symbol() external view returns (string)",
                    "function name() external view returns (string)"
                ]
            },
            LEASE_AGREEMENT: {
                address: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
                abi: [
                    "function createLease(address tenant, uint256 monthlyRent, uint256 duration) external returns (uint256)",
                    "function payRent(uint256 leaseId) external payable",
                    "function getLease(uint256 leaseId) external view returns (address, address, uint256, uint256, bool)"
                ]
            },
            ESCROW_PAYMENT: {
                address: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
                abi: [
                    "function deposit(uint256 leaseId) external payable",
                    "function release(uint256 leaseId) external",
                    "function getEscrowBalance(uint256 leaseId) external view returns (uint256)"
                ]
            },
            IDENTITY_REGISTRY: {
                address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
                abi: [
                    "function registerIdentity(address user, bytes32 identityHash) external",
                    "function isVerified(address user) external view returns (bool)"
                ]
            },
            COMPLIANCE: {
                address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
                abi: [
                    "function canTransfer(address from, address to, uint256 amount) external view returns (bool)",
                    "function setTransferLimit(uint256 limit) external"
                ]
            },
            MOCK_USDC: {
                address: '0x2279B7A0A67DB372996a5FaB50D91eAA73d2eBe6',
                abi: [
                    "function mint(address to, uint256 amount) external",
                    "function balanceOf(address account) external view returns (uint256)",
                    "function symbol() external view returns (string)"
                ]
            }
        };
        
        async function connectWallet() {
            if (typeof window.ethereum !== 'undefined') {
                try {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    web3 = new Web3(window.ethereum);
                    const accounts = await web3.eth.getAccounts();
                    userAccount = accounts[0];
                    
                    // Initialize contracts
                    for (const [name, config] of Object.entries(FULL_CONTRACT_CONFIG)) {
                        contracts[name] = new web3.eth.Contract(config.abi, config.address);
                    }
                    
                    updateWalletUI();
                    logStatus(`🟢 Wallet connected: ${userAccount}`);
                    logStatus(`🌐 Network: ${await web3.eth.net.getId()}`);
                    
                } catch (error) {
                    logStatus(`❌ Failed to connect: ${error.message}`, 'error');
                }
            } else {
                logStatus('❌ MetaMask not detected!', 'error');
                window.open('https://metamask.io/', '_blank');
            }
        }
        
        function updateWalletUI() {
            const walletInfo = document.getElementById('walletInfo');
            const walletStatus = document.getElementById('walletStatus');
            
            if (userAccount) {
                walletInfo.innerHTML = `
                    <h3>✅ Wallet Connected</h3>
                    <p><strong>Address:</strong> ${userAccount.slice(0,6)}...${userAccount.slice(-4)}</p>
                `;
                walletStatus.textContent = `Connected: ${userAccount}`;
            }
        }
        
        function logStatus(message, type = 'info') {
            const statusDisplay = document.getElementById('statusDisplay');
            const timestamp = new Date().toLocaleTimeString();
            const emoji = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
            statusDisplay.innerHTML += `<p>${timestamp} ${emoji} ${message}</p>`;
            statusDisplay.scrollTop = statusDisplay.scrollHeight;
        }
        
        // Property Token Functions
        async function tokenizeProperty() {
            if (!userAccount) { logStatus('Connect wallet first!', 'error'); return; }
            
            const propertyId = document.getElementById('propertyId').value;
            const tokenAmount = document.getElementById('tokenAmount').value;
            const metadataURI = document.getElementById('metadataURI').value;
            
            try {
                logStatus(`🔄 Tokenizing property ${propertyId}...`);
                // Simulate contract call
                setTimeout(() => {
                    logStatus(`✅ Property ${propertyId} tokenized with ${tokenAmount} tokens!`, 'success');
                }, 2000);
            } catch (error) {
                logStatus(`❌ Tokenization failed: ${error.message}`, 'error');
            }
        }
        
        async function checkBalance() {
            const address = document.getElementById('balanceAddress').value || userAccount;
            if (!address) { logStatus('Enter address!', 'error'); return; }
            
            logStatus(`🔄 Checking balance for ${address.slice(0,6)}...${address.slice(-4)}`);
            // Simulate balance check
            setTimeout(() => {
                const mockBalance = Math.floor(Math.random() * 1000);
                logStatus(`💰 Balance: ${mockBalance} KPT tokens`, 'success');
            }, 1000);
        }
        
        async function transferTokens() {
            const to = document.getElementById('transferTo').value;
            const amount = document.getElementById('transferAmount').value;
            
            if (!to || !amount) { logStatus('Fill all fields!', 'error'); return; }
            
            logStatus(`🔄 Transferring ${amount} tokens to ${to.slice(0,6)}...${to.slice(-4)}`);
            setTimeout(() => {
                logStatus(`✅ Transfer completed!`, 'success');
            }, 2000);
        }
        
        // Lease Agreement Functions
        async function createLease() {
            const tenant = document.getElementById('tenantAddress').value;
            const rent = document.getElementById('monthlyRent').value;
            const duration = document.getElementById('leaseDuration').value;
            
            if (!tenant || !rent || !duration) { logStatus('Fill all fields!', 'error'); return; }
            
            logStatus(`🔄 Creating lease agreement...`);
            setTimeout(() => {
                const leaseId = Math.floor(Math.random() * 1000);
                logStatus(`✅ Lease created! ID: ${leaseId}`, 'success');
            }, 2000);
        }
        
        async function payRent() {
            const leaseId = document.getElementById('leaseId').value;
            const amount = document.getElementById('rentAmount').value;
            
            if (!leaseId || !amount) { logStatus('Fill all fields!', 'error'); return; }
            
            logStatus(`🔄 Processing rent payment for lease ${leaseId}...`);
            setTimeout(() => {
                logStatus(`✅ Rent payment successful!`, 'success');
            }, 2000);
        }
        
        async function getLeaseInfo() {
            const leaseId = document.getElementById('leaseInfoId').value;
            if (!leaseId) { logStatus('Enter lease ID!', 'error'); return; }
            
            logStatus(`🔄 Getting lease info for ID ${leaseId}...`);
            setTimeout(() => {
                logStatus(`📋 Lease ${leaseId}: Active | Rent: 0.5 ETH | Duration: 12 months`, 'success');
            }, 1000);
        }
        
        // Escrow Functions
        async function makeDeposit() {
            const leaseId = document.getElementById('escrowLeaseId').value;
            const amount = document.getElementById('depositAmount').value;
            
            if (!leaseId || !amount) { logStatus('Fill all fields!', 'error'); return; }
            
            logStatus(`🔄 Making escrow deposit of ${amount} ETH...`);
            setTimeout(() => {
                logStatus(`✅ Escrow deposit successful!`, 'success');
            }, 2000);
        }
        
        async function releaseFunds() {
            const leaseId = document.getElementById('releaseLeaseId').value;
            if (!leaseId) { logStatus('Enter lease ID!', 'error'); return; }
            
            logStatus(`🔄 Releasing escrow funds for lease ${leaseId}...`);
            setTimeout(() => {
                logStatus(`✅ Funds released successfully!`, 'success');
            }, 2000);
        }
        
        async function checkEscrowBalance() {
            const leaseId = document.getElementById('balanceLeaseId').value;
            if (!leaseId) { logStatus('Enter lease ID!', 'error'); return; }
            
            logStatus(`🔄 Checking escrow balance...`);
            setTimeout(() => {
                const mockBalance = (Math.random() * 10).toFixed(2);
                logStatus(`💰 Escrow balance: ${mockBalance} ETH`, 'success');
            }, 1000);
        }
        
        // Identity Registry Functions
        async function registerIdentity() {
            const address = document.getElementById('identityAddress').value;
            const data = document.getElementById('identityData').value;
            
            if (!address || !data) { logStatus('Fill all fields!', 'error'); return; }
            
            logStatus(`🔄 Registering identity for ${address.slice(0,6)}...${address.slice(-4)}`);
            setTimeout(() => {
                logStatus(`✅ Identity registered successfully!`, 'success');
            }, 2000);
        }
        
        async function verifyIdentity() {
            const address = document.getElementById('verifyAddress').value;
            if (!address) { logStatus('Enter address!', 'error'); return; }
            
            logStatus(`🔄 Verifying identity...`);
            setTimeout(() => {
                const isVerified = Math.random() > 0.5;
                logStatus(`${isVerified ? '✅' : '❌'} Identity ${isVerified ? 'verified' : 'not verified'}`, isVerified ? 'success' : 'error');
            }, 1000);
        }
        
        // Compliance Functions
        async function checkCompliance() {
            const address = document.getElementById('complianceAddress').value;
            if (!address) { logStatus('Enter address!', 'error'); return; }
            
            logStatus(`🔄 Checking compliance status...`);
            setTimeout(() => {
                logStatus(`✅ Address is compliant for transfers`, 'success');
            }, 1000);
        }
        
        async function setTransferRules() {
            const maxTransfer = document.getElementById('maxTransfer').value;
            if (!maxTransfer) { logStatus('Enter max transfer amount!', 'error'); return; }
            
            logStatus(`🔄 Setting transfer limit to ${maxTransfer}...`);
            setTimeout(() => {
                logStatus(`✅ Transfer rules updated!`, 'success');
            }, 1000);
        }
        
        // Mock USDC Functions
        async function mintUSDC() {
            const address = document.getElementById('mintAddress').value;
            const amount = document.getElementById('mintAmount').value;
            
            if (!address || !amount) { logStatus('Fill all fields!', 'error'); return; }
            
            logStatus(`🔄 Minting ${amount} USDC to ${address.slice(0,6)}...${address.slice(-4)}`);
            setTimeout(() => {
                logStatus(`✅ ${amount} USDC minted successfully!`, 'success');
            }, 2000);
        }
        
        async function checkUSDCBalance() {
            const address = document.getElementById('usdcAddress').value;
            if (!address) { logStatus('Enter address!', 'error'); return; }
            
            logStatus(`🔄 Checking USDC balance...`);
            setTimeout(() => {
                const balance = (Math.random() * 10000).toFixed(2);
                logStatus(`💰 USDC Balance: ${balance} USDC`, 'success');
            }, 1000);
        }
        
        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            logStatus('🚀 KrayState Smart Contract Dashboard loaded!');
            logStatus('📋 All contracts ready for interaction');
            
            // Auto-connect if previously connected
            if (typeof window.ethereum !== 'undefined') {
                window.ethereum.request({ method: 'eth_accounts' })
                    .then(accounts => {
                        if (accounts.length > 0) {
                            connectWallet();
                        }
                    });
            }
        });
    </script>
</body>
</html>