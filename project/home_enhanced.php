<?php  
/**
 * Enhanced KrayState Real Estate Platform
 * Traditional real estate with optional NFT tokenization
 */

include 'components/connect.php';
require_once 'config.php';
require_once 'nft_data_manager.php';

if(isset($_COOKIE['user_id'])){
   $user_id = $_COOKIE['user_id'];
}else{
   $user_id = '';
}

include 'components/save_send.php';

// Get some NFT marketplace stats for the new section
try {
    $nftManager = new NFTDataManager();
    $nftStats = $nftManager->getMarketplaceStats();
    $trendingNFTs = $nftManager->getTrendingNFTs(3);
} catch (Exception $e) {
    $nftStats = ['total_nfts' => 0, 'listed_nfts' => 0, 'floor_price' => '0', 'total_volume' => '0'];
    $trendingNFTs = [];
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta http-equiv="X-UA-Compatible" content="IE=edge">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>KrayState ArEstate - Buy, Sell & Tokenize Properties</title>

   <!-- font awesome cdn link  -->
   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css">

   <!-- custom css file link  -->
   <link rel="stylesheet" href="css/style.css">
   
   <!-- Web3 Integration -->
   <script src="https://cdn.jsdelivr.net/npm/web3@4.1.1/dist/web3.min.js"></script>
   
   <style>
   /* Enhanced styles for NFT integration */
   .nft-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 4rem 0;
      margin: 3rem 0;
   }
   
   .nft-section .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
   }
   
   .nft-features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin: 2rem 0;
   }
   
   .nft-feature-card {
      background: rgba(255,255,255,0.1);
      padding: 2rem;
      border-radius: 15px;
      text-align: center;
      transition: transform 0.3s ease;
   }
   
   .nft-feature-card:hover {
      transform: translateY(-5px);
   }
   
   .nft-feature-card i {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: #ffd700;
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
      font-size: 0.9rem;
   }
   
   .wallet-btn:hover {
      background: var(--dark-color);
      transform: translateY(-2px);
   }
   
   .wallet-connected {
      background: #28a745 !important;
   }
   
   .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin: 2rem 0;
   }
   
   .stat-card {
      background: rgba(255,255,255,0.15);
      padding: 1.5rem;
      border-radius: 10px;
      text-align: center;
   }
   
   .stat-card h3 {
      font-size: 2rem;
      margin: 0;
      color: #ffd700;
   }
   
   .trending-nfts {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin: 2rem 0;
   }
   
   .mini-nft-card {
      background: rgba(255,255,255,0.1);
      border-radius: 10px;
      overflow: hidden;
      transition: transform 0.3s ease;
   }
   
   .mini-nft-card:hover {
      transform: scale(1.05);
   }
   
   .mini-nft-card img {
      width: 100%;
      height: 150px;
      object-fit: cover;
   }
   
   .mini-nft-card .content {
      padding: 1rem;
   }
   
   .mini-nft-card h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
   }
   
   .mini-nft-card .price {
      color: #ffd700;
      font-weight: bold;
   }
   
   @media (max-width: 768px) {
      .wallet-connection {
         position: relative;
         top: auto;
         right: auto;
         text-align: center;
         margin-bottom: 1rem;
      }
      
      .nft-features {
         grid-template-columns: 1fr;
      }
   }
   </style>
</head>
<body>

<!-- Wallet Connection (for NFT features) -->
<div class="wallet-connection">
    <button id="connectWallet" class="wallet-btn">
        <i class="fas fa-wallet"></i>
        <span id="walletText">Web3 Wallet</span>
    </button>
</div>

<?php include 'components/user_header.php'; ?>

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
               <p>minimum budget <span>*</span></p>
               <select name="h_min" class="input" required>
                  <option value="5000000">5 lac</option>
                  <option value="1000000">10 lac</option>
                  <option value="2000000">20 lac</option>
                  <option value="3000000">30 lac</option>
                  <option value="4000000">40 lac</option>
                  <option value="4000000">40 lac +</option>
               </select>
            </div>
            <div class="box">
               <p>maximum budget <span>*</span></p>
               <select name="h_max" class="input" required>
                  <option value="1000000">10 lac</option>
                  <option value="2000000">20 lac</option>
                  <option value="3000000">30 lac</option>
                  <option value="4000000">40 lac</option>
                  <option value="5000000">50 lac</option>
                  <option value="6000000">60 lac</option>
                  <option value="7000000">70 lac</option>
                  <option value="8000000">80 lac</option>
                  <option value="9000000">90 lac</option>
                  <option value="10000000">1 Cr</option>
                  <option value="15000000">1.5 Cr</option>
                  <option value="20000000">2 Cr</option>
               </select>
            </div>
         </div>
         <input type="submit" value="search property" name="h_search" class="btn">
      </form>
   </section>
</div>
<!-- home section ends -->

<!-- Enhanced NFT Tokenization Section -->
<section class="nft-section">
   <div class="container">
      <div style="text-align: center; margin-bottom: 3rem;">
         <h2 style="font-size: 2.5rem; margin-bottom: 1rem;">
            <i class="fas fa-coins"></i> 
            Tokenize Your Real Estate
         </h2>
         <p style="font-size: 1.2rem; opacity: 0.9;">
            Now offering blockchain-based property tokenization for fractional ownership and enhanced liquidity
         </p>
      </div>
      
      <div class="nft-features">
         <div class="nft-feature-card">
            <i class="fas fa-cut"></i>
            <h3>Fractional Ownership</h3>
            <p>Own a portion of high-value properties through blockchain tokens. Start investing with smaller amounts.</p>
            <a href="nft_marketplace.php" style="color: #ffd700; text-decoration: none;">
               <strong>Browse Tokenized Properties →</strong>
            </a>
         </div>
         
         <div class="nft-feature-card">
            <i class="fas fa-exchange-alt"></i>
            <h3>Enhanced Liquidity</h3>
            <p>Trade property tokens instantly without traditional lengthy sale processes. 24/7 marketplace availability.</p>
            <a href="post_property.php" style="color: #ffd700; text-decoration: none;">
               <strong>Tokenize Your Property →</strong>
            </a>
         </div>
         
         <div class="nft-feature-card">
            <i class="fas fa-shield-alt"></i>
            <h3>Blockchain Security</h3>
            <p>Transparent ownership records, smart contract automation, and secure transactions on Ethereum network.</p>
            <button onclick="connectWeb3()" style="background: #ffd700; color: #333; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer; font-weight: bold;">
               Connect Wallet
            </button>
         </div>
      </div>
      
      <?php if ($nftStats['total_nfts'] > 0): ?>
      <div class="stats-grid">
         <div class="stat-card">
            <h3><?= $nftStats['total_nfts'] ?></h3>
            <p>Tokenized Properties</p>
         </div>
         <div class="stat-card">
            <h3><?= $nftStats['listed_nfts'] ?></h3>
            <p>Available Now</p>
         </div>
         <div class="stat-card">
            <h3><?= $nftStats['floor_price'] ?> ETH</h3>
            <p>Floor Price</p>
         </div>
         <div class="stat-card">
            <h3><?= $nftStats['total_volume'] ?> ETH</h3>
            <p>Trading Volume</p>
         </div>
      </div>
      
      <?php if (!empty($trendingNFTs)): ?>
      <h3 style="text-align: center; margin: 2rem 0;">Featured Tokenized Properties</h3>
      <div class="trending-nfts">
         <?php foreach ($trendingNFTs as $nft): ?>
         <div class="mini-nft-card">
            <img src="<?= $nft['image_url'] ?: 'images/placeholder-property.jpg' ?>" 
                 alt="<?= htmlspecialchars($nft['name']) ?>"
                 onerror="this.src='images/placeholder-property.jpg'">
            <div class="content">
               <h4><?= htmlspecialchars($nft['name']) ?></h4>
               <div style="font-size: 0.8rem; color: #ccc; margin-bottom: 0.5rem;">
                  <i class="fas fa-map-marker-alt"></i> <?= htmlspecialchars($nft['location']) ?>
               </div>
               <?php if ($nft['is_listed']): ?>
                  <div class="price">
                     <i class="fab fa-ethereum"></i> <?= number_format($nft['current_price'], 4) ?> ETH
                  </div>
               <?php else: ?>
                  <div style="color: #ccc;">Not Listed</div>
               <?php endif; ?>
            </div>
         </div>
         <?php endforeach; ?>
      </div>
      <?php endif; ?>
      <?php endif; ?>
      
      <div style="text-align: center; margin-top: 2rem;">
         <a href="nft_marketplace.php" class="btn" style="background: #ffd700; color: #333; padding: 1rem 2rem; border-radius: 25px; text-decoration: none; font-weight: bold; display: inline-block;">
            <i class="fas fa-coins"></i> Explore Tokenized Properties
         </a>
      </div>
   </div>
</section>

<!-- services section starts  -->
<section class="services">
   <h1 class="heading">our services</h1>
   <div class="box-container">
      <div class="box">
         <img src="images/icon-1.png" alt="">
         <h3>buy house</h3>
         <p>Find your dream home from our extensive collection of residential properties.</p>
      </div>
      <div class="box">
         <img src="images/icon-2.png" alt="">
         <h3>rent house</h3>
         <p>Discover rental properties that fit your lifestyle and budget perfectly.</p>
      </div>
      <div class="box">
         <img src="images/icon-3.png" alt="">
         <h3>sell house</h3>
         <p>List your property with us and reach thousands of potential buyers quickly.</p>
      </div>
      <div class="box">
         <img src="images/icon-4.png" alt="">
         <h3>flats and buildings</h3>
         <p>Explore apartments, condos, and commercial buildings in prime locations.</p>
      </div>
      <div class="box">
         <img src="images/icon-5.png" alt="">
         <h3>shops and malls</h3>
         <p>Invest in commercial spaces with high footfall and excellent returns.</p>
      </div>
      <div class="box">
         <img src="images/icon-6.png" alt="">
         <h3>24/7 service</h3>
         <p>Round-the-clock support for all your real estate needs and queries.</p>
      </div>
      <!-- New NFT/Tokenization service -->
      <div class="box" style="border: 2px solid var(--main-color);">
         <i class="fas fa-coins" style="font-size: 3rem; color: var(--main-color); margin-bottom: 1rem;"></i>
         <h3>property tokenization</h3>
         <p>Transform your properties into tradeable digital tokens for fractional ownership.</p>
      </div>
   </div>
</section>
<!-- services section ends -->

<!-- listings section starts  -->
<section class="listings">
   <h1 class="heading">latest listings</h1>
   <div class="box-container">
      <?php
         $total_images = 0;
         $select_properties = $conn->prepare("SELECT * FROM `property` ORDER BY date DESC LIMIT 6");
         $select_properties->execute();
         if($select_properties->rowCount() > 0){
            while($fetch_property = $select_properties->fetch(PDO::FETCH_ASSOC)){
               
            $select_user = $conn->prepare("SELECT * FROM `users` WHERE id = ?");
            $select_user->execute([$fetch_property['user_id']]);
            $fetch_user = $select_user->fetch(PDO::FETCH_ASSOC);

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
            <div class="admin">
               <h3><?= substr($fetch_user['name'], 0, 1); ?></h3>
               <div>
                  <p><?= $fetch_user['name']; ?></p>
                  <span><?= $fetch_property['date']; ?></span>
               </div>
            </div>
            <div class="thumb">
               <p class="total-images"><i class="far fa-image"></i><span><?= $total_images; ?></span></p>
               <img src="uploaded_files/<?= $fetch_property['image_01']; ?>" alt="">
            </div>
            <div class="details">
               <p class="location"><i class="fas fa-map-marker-alt"></i><span><?= $fetch_property['address']; ?></span></p>
               <div class="tags">
                  <p><i class="fas fa-building"></i><span><?= $fetch_property['type']; ?></span></p>
                  <p><i class="fas fa-tag"></i><span><?= $fetch_property['offer']; ?></span></p>
               </div>
               <div class="flex">
                  <div class="flex-btn">
                     <p><i class="fas fa-bed"></i><span><?= $fetch_property['bedroom']; ?></span></p>
                     <p><i class="fas fa-bath"></i><span><?= $fetch_property['bathroom']; ?></span></p>
                     <p><i class="fas fa-maximize"></i><span><?= $fetch_property['carpet']; ?>sqft</span></p>
                  </div>
                  <div class="flex-btn">
                     <p class="price">₹<?= $fetch_property['price']; ?><span>/lacs</span></p>
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
                  </div>
               </div>
               <a href="view_property.php?get_id=<?= $fetch_property['id']; ?>" class="btn">view property</a>
               
               <!-- New NFT tokenization option for premium properties -->
               <?php if ($fetch_property['price'] > 3000000): // Properties above 30 lacs ?>
               <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #eee;">
                  <small style="color: var(--main-color); font-weight: 600;">
                     <i class="fas fa-coins"></i> Tokenization Available
                  </small>
               </div>
               <?php endif; ?>
            </div>
         </div>
      </form>
      <?php
         }
      }else{
         echo '<p class="empty">no properties added yet!</p>';
      }
      ?>
   </div>

   <div style="text-align: center; margin: 2rem 0;">
      <a href="listings.php" class="btn">view all</a>
   </div>
</section>
<!-- listings section ends -->

<?php include 'components/footer.php'; ?>

<!-- Web3 Integration Script -->
<script src="js/marketplace.js"></script>
<script>
// Simplified Web3 integration for the main website
function connectWeb3() {
    if (window.marketplace) {
        window.marketplace.connectWallet();
    } else {
        // Initialize basic Web3 connection
        if (typeof window.ethereum !== 'undefined') {
            window.ethereum.request({ method: 'eth_requestAccounts' })
                .then(accounts => {
                    updateWalletUI(accounts[0]);
                    showNotification('Wallet connected! Visit tokenized properties to explore NFT features.', 'success');
                })
                .catch(error => {
                    console.error('Wallet connection failed:', error);
                    showNotification('Failed to connect wallet', 'error');
                });
        } else {
            showNotification('Please install MetaMask to use Web3 features', 'warning');
            window.open('https://metamask.io/download/', '_blank');
        }
    }
}

function updateWalletUI(account) {
    const walletBtn = document.getElementById('connectWallet');
    const walletText = document.getElementById('walletText');
    
    if (account) {
        walletBtn.classList.add('wallet-connected');
        const shortAddress = `${account.substring(0, 6)}...${account.substring(38)}`;
        walletText.textContent = shortAddress;
    }
}

function showNotification(message, type = 'info') {
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 1rem;
        border-radius: 8px;
        z-index: 10000;
        max-width: 300px;
        font-weight: 600;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Check for existing Web3 connection on page load
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.request({ method: 'eth_accounts' })
            .then(accounts => {
                if (accounts.length > 0) {
                    updateWalletUI(accounts[0]);
                }
            });
    }
});
</script>

<!-- custom js file link  -->
<script src="js/script.js"></script>

</body>
</html>