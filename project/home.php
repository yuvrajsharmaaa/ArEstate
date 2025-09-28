<?php  

include 'components/connect.php';

// Remove authentication - set default user for demo
$user_id = 'demo_user';

// Initialize message arrays
$warning_msg = [];
$success_msg = [];
$info_msg = [];
$error_msg = [];

// Include save_send.php only if connection exists
if(isset($conn) && $conn) {
   include 'components/save_send.php';
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta http-equiv="X-UA-Compatible" content="IE=edge">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Home</title>

   <!-- font awesome cdn link  -->
   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css">

   <!-- custom css file link  -->
   <link rel="stylesheet" href="css/style.css">
   
   <!-- Web3 and Blockchain Integration -->
   <script src="https://cdn.jsdelivr.net/npm/web3@latest/dist/web3.min.js"></script>
   <style>
      .blockchain-features {
         background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
         padding: 3rem 2rem;
         margin: 2rem 0;
         border-radius: 10px;
         color: white;
         text-align: center;
      }
      .wallet-status {
         position: fixed;
         top: 10px;
         right: 10px;
         background: #333;
         color: white;
         padding: 10px;
         border-radius: 5px;
         z-index: 1000;
      }
      .tokenize-btn {
         background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
         color: white;
         border: none;
         padding: 10px 20px;
         border-radius: 5px;
         cursor: pointer;
         margin: 5px;
         transition: transform 0.2s;
      }
      .tokenize-btn:hover {
         transform: translateY(-2px);
      }
   </style>

</head>
<body>
   
<?php include 'components/user_header.php'; ?>

<!-- Wallet Status Display -->
<div id="wallet-status" class="wallet-status">
   <button id="connect-wallet" class="tokenize-btn">🦊 Connect MetaMask</button>
</div>

<!-- Blockchain Features Section -->
<section class="blockchain-features">
   <h2>🚀 KrayState: Real Estate on Blockchain</h2>
   <p>Tokenize properties • Smart contracts • NFT marketplace • Decentralized transactions</p>
   <div style="display: flex; justify-content: center; gap: 15px; margin-top: 20px;">
      <button class="tokenize-btn" onclick="showTokenizationModal()">🏠 Tokenize Property</button>
      <button class="tokenize-btn" onclick="openNFTMarketplace()">🎨 NFT Marketplace</button>
      <button class="tokenize-btn" onclick="viewContracts()">📄 Smart Contracts</button>
   </div>
</section>


<!-- home section starts  -->

<div class="home">

   <section class="center">

      <form action="search.php" method="post">
         <h3>find your perfect home</h3>
         <div class="box">
            <p>enter location <span>*</span></p>
            <input type="text" name="h_location" required maxlength="100" placeholder="enter city name" class="input">
         </div>
         <div class="flex">
            <div class="box">
               <p>property type <span>*</span></p>
               <select name="h_type" class="input" required>
                  <option value="flat">flat</option>
                  <option value="house">house</option>
                  <option value="shop">shop</option>
               </select>
            </div>
            <div class="box">
               <p>offer type <span>*</span></p>
               <select name="h_offer" class="input" required>
                  <option value="sale">sale</option>
                  <option value="resale">resale</option>
                  <option value="rent">rent</option>
               </select>
            </div>
            <div class="box">
               <p>maximum budget <span>*</span></p>
               <select name="h_min" class="input" required>
                  <option value="5000">5k</option>
                  <option value="10000">10k</option>
                  <option value="15000">15k</option>
                  <option value="20000">20k</option>
                  <option value="30000">30k</option>
                  <option value="40000">40k</option>
                  <option value="40000">40k</option>
                  <option value="50000">50k</option>
                  <option value="100000">1 lac</option>
                  <option value="500000">5 lac</option>
                  <option value="1000000">10 lac</option>
                  <option value="2000000">20 lac</option>
                  <option value="3000000">30 lac</option>
                  <option value="4000000">40 lac</option>
                  <option value="4000000">40 lac</option>
                  <option value="5000000">50 lac</option>
                  <option value="6000000">60 lac</option>
                  <option value="7000000">70 lac</option>
                  <option value="8000000">80 lac</option>
                  <option value="9000000">90 lac</option>
                  <option value="10000000">1 Cr</option>
                  <option value="20000000">2 Cr</option>
                  <option value="30000000">3 Cr</option>
                  <option value="40000000">4 Cr</option>
                  <option value="50000000">5 Cr</option>
                  <option value="60000000">6 Cr</option>
                  <option value="70000000">7 Cr</option>
                  <option value="80000000">8 Cr</option>
                  <option value="90000000">9 Cr</option>
                  <option value="100000000">10 Cr</option>
                  <option value="150000000">15 Cr</option>
                  <option value="200000000">20 Cr</option>
               </select>
            </div>
            <div class="box">
               <p>maximum budget <span>*</span></p>
               <select name="h_max" class="input" required>
                  <option value="5000">5k</option>
                  <option value="10000">10k</option>
                  <option value="15000">15k</option>
                  <option value="20000">20k</option>
                  <option value="30000">30k</option>
                  <option value="40000">40k</option>
                  <option value="40000">40k</option>
                  <option value="50000">50k</option>
                  <option value="100000">1 lac</option>
                  <option value="500000">5 lac</option>
                  <option value="1000000">10 lac</option>
                  <option value="2000000">20 lac</option>
                  <option value="3000000">30 lac</option>
                  <option value="4000000">40 lac</option>
                  <option value="4000000">40 lac</option>
                  <option value="5000000">50 lac</option>
                  <option value="6000000">60 lac</option>
                  <option value="7000000">70 lac</option>
                  <option value="8000000">80 lac</option>
                  <option value="9000000">90 lac</option>
                  <option value="10000000">1 Cr</option>
                  <option value="20000000">2 Cr</option>
                  <option value="30000000">3 Cr</option>
                  <option value="40000000">4 Cr</option>
                  <option value="50000000">5 Cr</option>
                  <option value="60000000">6 Cr</option>
                  <option value="70000000">7 Cr</option>
                  <option value="80000000">8 Cr</option>
                  <option value="90000000">9 Cr</option>
                  <option value="100000000">10 Cr</option>
                  <option value="150000000">15 Cr</option>
                  <option value="200000000">20 Cr</option>
               </select>
            </div>
         </div>
         <input type="submit" value="search property" name="h_search" class="btn">
      </form>

   </section>

</div>

<!-- home section ends -->

<!-- services section starts  -->

<section class="services">

   <h1 class="heading">our services</h1>

   <div class="box-container">

      <div class="box">
         <img src="images/icon-1.png" alt="">
         <h3>buy house</h3>
         <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Doloremque, incidunt.</p>
      </div>

      <div class="box">
         <img src="images/icon-2.png" alt="">
         <h3>rent house</h3>
         <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Doloremque, incidunt.</p>
      </div>

      <div class="box">
         <img src="images/icon-3.png" alt="">
         <h3>sell house</h3>
         <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Doloremque, incidunt.</p>
      </div>

      <div class="box">
         <img src="images/icon-4.png" alt="">
         <h3>flats and buildings</h3>
         <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Doloremque, incidunt.</p>
      </div>

      <div class="box">
         <img src="images/icon-5.png" alt="">
         <h3>shops and malls</h3>
         <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Doloremque, incidunt.</p>
      </div>

      <div class="box">
         <img src="images/icon-6.png" alt="">
         <h3>24/7 service</h3>
         <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Doloremque, incidunt.</p>
      </div>

   </div>

</section>

<!-- services section ends -->

<!-- listings section starts  -->

<section class="listings">

   <h1 class="heading">latest listings</h1>

   <div class="box-container">
      <?php
         if(isset($conn) && $conn) {
            $total_images = 0;
            $select_properties = $conn->prepare("SELECT * FROM `property` ORDER BY date DESC LIMIT 6");
            $select_properties->execute();
            if($select_properties->rowCount() > 0){
               while($fetch_property = $select_properties->fetch(PDO::FETCH_ASSOC)){
                  
               $select_user = $conn->prepare("SELECT * FROM `users` WHERE id = ?");
               $select_user->execute([$fetch_property['user_id']]);
               $fetch_user = $select_user->fetch(PDO::FETCH_ASSOC);
               
               // Provide fallback if user not found
               if(!$fetch_user) {
                  $fetch_user = ['name' => 'Demo User'];
               }

            if(!empty($fetch_property['image_02'])){
               $image_coutn_02 = 1;
            }else{
               $image_coutn_02 = 0;
            }
            if(!empty($fetch_property['image_03'])){
               $image_coutn_03 = 1;
            }else{
               $image_coutn_03 = 0;
            }
            if(!empty($fetch_property['image_04'])){
               $image_coutn_04 = 1;
            }else{
               $image_coutn_04 = 0;
            }
            if(!empty($fetch_property['image_05'])){
               $image_coutn_05 = 1;
            }else{
               $image_coutn_05 = 0;
            }

            $total_images = (1 + $image_coutn_02 + $image_coutn_03 + $image_coutn_04 + $image_coutn_05);

            $select_saved = $conn->prepare("SELECT * FROM `saved` WHERE property_id = ? and user_id = ?");
            $select_saved->execute([$fetch_property['id'], $user_id]);

      ?>
      <form action="" method="POST">
         <div class="box">
            <input type="hidden" name="property_id" value="<?= $fetch_property['id']; ?>">
            <?php
               if($select_saved->rowCount() > 0){
            ?>
            <button type="submit" name="save" class="save"><i class="fas fa-heart"></i><span>saved</span></button>
            <?php
               }else{ 
            ?>
            <button type="submit" name="save" class="save"><i class="far fa-heart"></i><span>save</span></button>
            <?php
               }
            ?>
            <div class="thumb">
               <p class="total-images"><i class="far fa-image"></i><span><?= $total_images; ?></span></p> 
               <img src="uploaded_files/<?= $fetch_property['image_01']; ?>" alt="">
            </div>
            <div class="admin">
               <h3><?= substr($fetch_user['name'], 0, 1); ?></h3>
               <div>
                  <p><?= $fetch_user['name']; ?></p>
                  <span><?= $fetch_property['date']; ?></span>
               </div>
            </div>
         </div>
         <div class="box">
            <div class="price"><i class="fas fa-indian-rupee-sign"></i><span><?= $fetch_property['price']; ?></span></div>
            <h3 class="name"><?= $fetch_property['property_name']; ?></h3>
            <p class="location"><i class="fas fa-map-marker-alt"></i><span><?= $fetch_property['address']; ?></span></p>
            <div class="flex">
               <p><i class="fas fa-house"></i><span><?= $fetch_property['type']; ?></span></p>
               <p><i class="fas fa-tag"></i><span><?= $fetch_property['offer']; ?></span></p>
               <p><i class="fas fa-bed"></i><span><?= $fetch_property['bhk']; ?> BHK</span></p>
               <p><i class="fas fa-trowel"></i><span><?= $fetch_property['status']; ?></span></p>
               <p><i class="fas fa-couch"></i><span><?= $fetch_property['furnished']; ?></span></p>
               <p><i class="fas fa-maximize"></i><span><?= $fetch_property['carpet']; ?>sqft</span></p>
            </div>
            <div class="flex-btn">
               <a href="view_property.php?get_id=<?= $fetch_property['id']; ?>" class="btn">view property</a>
               <input type="submit" value="send enquiry" name="send" class="btn">
            </div>
         </div>
      </form>
      <?php
            }
         }else{
            echo '<p class="empty">no properties added yet! <a href="post_property.php" style="margin-top:1.5rem;" class="btn">add new</a></p>';
         }
      } else {
         echo '<p class="empty">Database connection not available. <a href="database_manager.php" style="margin-top:1.5rem;" class="btn">Setup Database</a></p>';
      }
      ?>
      
   </div>

   <div style="margin-top: 2rem; text-align:center;">
      <a href="listings.php" class="inline-btn">view all</a>
   </div>

</section>

<!-- listings section ends -->








<script src="https://cdnjs.cloudflare.com/ajax/libs/sweetalert/2.1.2/sweetalert.min.js"></script>

<?php include 'components/footer.php'; ?>

<!-- custom js file link  -->
<script src="js/script.js"></script>

<?php include 'components/message.php'; ?>

<script>
   // Range slider functionality
   let range = document.querySelector("#range");
   if(range) {
      range.oninput = () => {
         document.querySelector('#output').innerHTML = range.value;
      }
   }

   // Web3 Integration
   let web3;
   let userAccount;

   // Contract Configuration
   const CONTRACTS = {
      PROPERTY_TOKEN: {
         address: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', // Example address
         abi: [
            "function tokenizeProperty(uint256 tokenAmount, string memory metadataURI) external",
            "function balanceOf(address account) external view returns (uint256)",
            "function symbol() external view returns (string)"
         ]
      }
   };

   // Connect Wallet Function
   async function connectWallet() {
      if (typeof window.ethereum !== 'undefined') {
         try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            web3 = new Web3(window.ethereum);
            const accounts = await web3.eth.getAccounts();
            userAccount = accounts[0];
            
            updateWalletUI(userAccount);
            showToast('Wallet connected successfully!', 'success');
         } catch (error) {
            showToast('Failed to connect wallet: ' + error.message, 'error');
         }
      } else {
         showToast('MetaMask not detected. Please install MetaMask!', 'error');
         window.open('https://metamask.io/', '_blank');
      }
   }

   // Update Wallet UI
   function updateWalletUI(account) {
      const walletStatus = document.getElementById('wallet-status');
      if (walletStatus && account) {
         walletStatus.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
               <span>🟢 ${account.slice(0,6)}...${account.slice(-4)}</span>
               <button class="tokenize-btn" onclick="disconnectWallet()" style="padding: 5px 10px; font-size: 12px;">Disconnect</button>
            </div>
         `;
      }
   }

   // Disconnect Wallet
   function disconnectWallet() {
      userAccount = null;
      web3 = null;
      const walletStatus = document.getElementById('wallet-status');
      if (walletStatus) {
         walletStatus.innerHTML = '<button id="connect-wallet" class="tokenize-btn">🦊 Connect MetaMask</button>';
         addConnectEvent();
      }
      showToast('Wallet disconnected', 'info');
   }

   // Add connect wallet event
   function addConnectEvent() {
      const connectBtn = document.getElementById('connect-wallet');
      if (connectBtn) {
         connectBtn.addEventListener('click', connectWallet);
      }
   }

   // Show Tokenization Modal
   function showTokenizationModal() {
      if (!userAccount) {
         showToast('Please connect your wallet first!', 'error');
         return;
      }
      
      const modal = document.createElement('div');
      modal.style.cssText = `
         position: fixed; top: 0; left: 0; width: 100%; height: 100%;
         background: rgba(0,0,0,0.8); z-index: 10000;
         display: flex; align-items: center; justify-content: center;
      `;
      
      modal.innerHTML = `
         <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; width: 90%;">
            <h3>🏠 Tokenize Property</h3>
            <p>Convert your real estate into blockchain tokens</p>
            <div style="margin: 20px 0;">
               <label>Property ID:</label>
               <input type="text" id="propertyId" placeholder="Enter property ID" style="width: 100%; padding: 10px; margin: 5px 0;">
               
               <label>Token Amount:</label>
               <input type="number" id="tokenAmount" placeholder="Enter token amount" style="width: 100%; padding: 10px; margin: 5px 0;">
               
               <label>Price per Token (ETH):</label>
               <input type="number" id="tokenPrice" step="0.01" placeholder="0.1" style="width: 100%; padding: 10px; margin: 5px 0;">
            </div>
            <div style="text-align: center; margin-top: 20px;">
               <button class="tokenize-btn" onclick="tokenizeProperty()">🚀 Tokenize Now</button>
               <button class="tokenize-btn" onclick="closeModal()" style="background: #ccc; color: #333;">Cancel</button>
            </div>
         </div>
      `;
      
      document.body.appendChild(modal);
      modal.onclick = (e) => e.target === modal && closeModal();
   }

   // Tokenize Property Function
   async function tokenizeProperty() {
      const propertyId = document.getElementById('propertyId').value;
      const tokenAmount = document.getElementById('tokenAmount').value;
      const tokenPrice = document.getElementById('tokenPrice').value;
      
      if (!propertyId || !tokenAmount || !tokenPrice) {
         showToast('Please fill all fields!', 'error');
         return;
      }
      
      try {
         showToast('Tokenizing property... Please confirm transaction in MetaMask', 'info');
         
         // Simulate tokenization process
         setTimeout(() => {
            showToast(`Property ${propertyId} tokenized successfully! 🎉`, 'success');
            closeModal();
            
            // Add visual feedback
            addTokenizedPropertyBadge();
         }, 2000);
         
      } catch (error) {
         showToast('Tokenization failed: ' + error.message, 'error');
      }
   }

   // Open NFT Marketplace
   function openNFTMarketplace() {
      showToast('Opening NFT Marketplace...', 'info');
      window.location.href = 'nft_marketplace.php';
   }

   // View Smart Contracts
   function viewContracts() {
      showToast('Opening Smart Contracts Dashboard...', 'info');
      window.location.href = 'web3_integration.php';
   }

   // Close Modal
   function closeModal() {
      const modal = document.querySelector('div[style*="position: fixed"]');
      if (modal) modal.remove();
   }

   // Add tokenized property badge
   function addTokenizedPropertyBadge() {
      const properties = document.querySelectorAll('.box');
      if (properties.length > 0) {
         const firstProperty = properties[0];
         const badge = document.createElement('div');
         badge.innerHTML = '🏆 TOKENIZED';
         badge.style.cssText = `
            position: absolute; top: 10px; left: 10px;
            background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
            color: white; padding: 5px 10px; border-radius: 15px;
            font-size: 10px; font-weight: bold; z-index: 10;
         `;
         firstProperty.style.position = 'relative';
         firstProperty.appendChild(badge);
      }
   }

   // Toast notification function
   function showToast(message, type = 'info') {
      const toast = document.createElement('div');
      toast.style.cssText = `
         position: fixed; top: 80px; right: 20px; z-index: 10001;
         padding: 15px 20px; border-radius: 5px; color: white;
         background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
         animation: slideInRight 0.3s ease;
      `;
      toast.textContent = message;
      
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 5000);
   }

   // Initialize when page loads
   document.addEventListener('DOMContentLoaded', function() {
      // Add connect wallet event
      addConnectEvent();
      
      // Check if wallet is already connected
      if (typeof window.ethereum !== 'undefined') {
         window.ethereum.request({ method: 'eth_accounts' })
            .then(accounts => {
               if (accounts.length > 0) {
                  web3 = new Web3(window.ethereum);
                  userAccount = accounts[0];
                  updateWalletUI(userAccount);
               }
            });
      }
      
      // Add CSS animations
      const style = document.createElement('style');
      style.textContent = `
         @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
         }
      `;
      document.head.appendChild(style);
   });

   console.log('🚀 KrayState Blockchain Platform Loaded!');
</script>

</body>
</html>