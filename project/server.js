const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 8000;

// Serve static files (CSS, JS, images)
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  "/uploaded_files",
  express.static(path.join(__dirname, "uploaded_files"))
);

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock data for demonstration
const mockProperties = [
  {
    id: 1,
    title: "Luxury Downtown Condo",
    location: "Downtown Manhattan, NY",
    price: "1,250,000",
    type: "Condominium",
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200,
    image: "images/property-1.jpg",
    description:
      "Prime downtown condominium with city views and modern amenities.",
    nft_available: true,
    token_price: "1.5",
    rental_yield: "8.5",
  },
  {
    id: 2,
    title: "Suburban Family Villa",
    location: "Westfield, NJ",
    price: "850,000",
    type: "Villa",
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2800,
    image: "images/property-2.jpg",
    description: "Beautiful suburban villa perfect for family living.",
    nft_available: true,
    token_price: "2.8",
    rental_yield: "6.2",
  },
  {
    id: 3,
    title: "Commercial Office Space",
    location: "Financial District, NYC",
    price: "2,100,000",
    type: "Commercial",
    bedrooms: 0,
    bathrooms: 4,
    sqft: 4500,
    image: "images/property-3.jpg",
    description: "Premium office space in the heart of the financial district.",
    nft_available: true,
    token_price: "5.2",
    rental_yield: "12.3",
  },
];

// Route for homepage
app.get("/", (req, res) => {
  const htmlContent = generateHomePage();
  res.send(htmlContent);
});

app.get("/home.php", (req, res) => {
  const htmlContent = generateHomePage();
  res.send(htmlContent);
});

// Route for listings
app.get("/listings.php", (req, res) => {
  const htmlContent = generateListingsPage();
  res.send(htmlContent);
});

// Route for NFT marketplace
app.get("/nft_marketplace.php", (req, res) => {
  const htmlContent = generateNFTMarketplacePage();
  res.send(htmlContent);
});

// API endpoints
app.get("/api.php", (req, res) => {
  const action = req.query.action;

  switch (action) {
    case "get_properties":
      res.json({ success: true, data: mockProperties });
      break;
    case "get_marketplace_stats":
      res.json({
        success: true,
        data: {
          total_properties: mockProperties.length,
          nft_enabled: mockProperties.filter((p) => p.nft_available).length,
          total_value: "4.2M",
          avg_yield: "9.0",
        },
      });
      break;
    default:
      res.json({ success: false, error: "Invalid action" });
  }
});

function generateHomePage() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KrayState ArEstate - Real Estate & NFT Platform</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css">
    <link rel="stylesheet" href="css/style.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        
        /* Header */
        .header { background: #2c3e50; color: white; padding: 1rem 0; }
        .nav { display: flex; justify-content: space-between; align-items: center; }
        .nav h1 { font-size: 1.8rem; }
        .nav-links { display: flex; list-style: none; gap: 2rem; }
        .nav-links a { color: white; text-decoration: none; transition: color 0.3s; }
        .nav-links a:hover { color: #3498db; }
        
        /* Hero Section */
        .hero { background: linear-gradient(135deg, #3498db, #2c3e50); color: white; padding: 4rem 0; text-align: center; }
        .hero h2 { font-size: 2.5rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9; }
        .hero-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .btn { padding: 12px 24px; border: none; border-radius: 5px; text-decoration: none; font-weight: 600; transition: transform 0.3s; cursor: pointer; }
        .btn:hover { transform: translateY(-2px); }
        .btn-primary { background: #e74c3c; color: white; }
        .btn-secondary { background: transparent; color: white; border: 2px solid white; }
        
        /* Features Section */
        .features { padding: 4rem 0; background: #f8f9fa; }
        .features h3 { text-align: center; font-size: 2rem; margin-bottom: 3rem; color: #2c3e50; }
        .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .feature-card { background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); text-align: center; }
        .feature-card i { font-size: 3rem; color: #3498db; margin-bottom: 1rem; }
        .feature-card h4 { font-size: 1.3rem; margin-bottom: 1rem; color: #2c3e50; }
        
        /* Properties Section */
        .properties { padding: 4rem 0; }
        .properties h3 { text-align: center; font-size: 2rem; margin-bottom: 3rem; color: #2c3e50; }
        .property-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; }
        .property-card { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.1); transition: transform 0.3s; }
        .property-card:hover { transform: translateY(-5px); }
        .property-image { width: 100%; height: 200px; background: #ddd; display: flex; align-items: center; justify-content: center; color: #666; }
        .property-content { padding: 1.5rem; }
        .property-price { font-size: 1.5rem; font-weight: bold; color: #e74c3c; margin-bottom: 0.5rem; }
        .property-title { font-size: 1.2rem; margin-bottom: 0.5rem; color: #2c3e50; }
        .property-location { color: #666; margin-bottom: 1rem; }
        .property-features { display: flex; gap: 1rem; margin-bottom: 1rem; font-size: 0.9rem; }
        .nft-badge { background: linear-gradient(45deg, #3498db, #2c3e50); color: white; padding: 0.25rem 0.5rem; border-radius: 15px; font-size: 0.8rem; }
        
        /* Footer */
        .footer { background: #2c3e50; color: white; padding: 2rem 0; text-align: center; }
        
        @media (max-width: 768px) {
            .nav { flex-direction: column; gap: 1rem; }
            .nav-links { gap: 1rem; }
            .hero h2 { font-size: 2rem; }
            .hero-buttons { flex-direction: column; align-items: center; }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header class="header">
        <nav class="nav container">
            <h1><i class="fas fa-home"></i> KrayState ArEstate</h1>
            <ul class="nav-links">
                <li><a href="/"><i class="fas fa-home"></i> Home</a></li>
                <li><a href="/listings.php"><i class="fas fa-building"></i> Properties</a></li>
                <li><a href="/nft_marketplace.php"><i class="fas fa-coins"></i> NFT Tokenization</a></li>
                <li><a href="#about"><i class="fas fa-info-circle"></i> About</a></li>
                <li><a href="#contact"><i class="fas fa-envelope"></i> Contact</a></li>
                <li><a href="#" id="walletBtn"><i class="fas fa-wallet"></i> Connect Wallet</a></li>
            </ul>
        </nav>
    </header>

    <!-- Hero Section -->
    <section class="hero">
        <div class="container">
            <h2>Modern Real Estate Platform</h2>
            <p>Discover premium properties with traditional buying options and revolutionary NFT tokenization</p>
            <div class="hero-buttons">
                <a href="/listings.php" class="btn btn-primary">
                    <i class="fas fa-search"></i> Browse Properties
                </a>
                <a href="/nft_marketplace.php" class="btn btn-secondary">
                    <i class="fas fa-coins"></i> Explore NFT Options
                </a>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="features">
        <div class="container">
            <h3>Why Choose KrayState?</h3>
            <div class="feature-grid">
                <div class="feature-card">
                    <i class="fas fa-home"></i>
                    <h4>Traditional Real Estate</h4>
                    <p>Complete property listings with detailed information, high-quality images, and competitive pricing.</p>
                </div>
                <div class="feature-card">
                    <i class="fas fa-coins"></i>
                    <h4>NFT Tokenization</h4>
                    <p>Revolutionary blockchain technology allowing fractional ownership and transparent property investment.</p>
                </div>
                <div class="feature-card">
                    <i class="fas fa-shield-alt"></i>
                    <h4>Secure Transactions</h4>
                    <p>Advanced security measures and blockchain verification for all property transactions and investments.</p>
                </div>
                <div class="feature-card">
                    <i class="fas fa-chart-line"></i>
                    <h4>Investment Analytics</h4>
                    <p>Detailed property analytics, rental yield calculations, and market trend analysis tools.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Featured Properties -->
    <section class="properties">
        <div class="container">
            <h3>Featured Properties</h3>
            <div class="property-grid">
                ${mockProperties
                  .map(
                    (property) => `
                <div class="property-card">
                    <div class="property-image">
                        <i class="fas fa-image fa-3x"></i>
                    </div>
                    <div class="property-content">
                        <div class="property-price">$${property.price}</div>
                        <h4 class="property-title">${property.title}</h4>
                        <p class="property-location"><i class="fas fa-map-marker-alt"></i> ${property.location}</p>
                        <div class="property-features">
                            <span><i class="fas fa-bed"></i> ${property.bedrooms} Beds</span>
                            <span><i class="fas fa-bath"></i> ${property.bathrooms} Baths</span>
                            <span><i class="fas fa-ruler-combined"></i> ${property.sqft.toLocaleString()} sqft</span>
                        </div>
                        ${
                          property.nft_available
                            ? `
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                            <span class="nft-badge"><i class="fas fa-coins"></i> NFT Available</span>
                            <small style="color: #27ae60;">Yield: ${property.rental_yield}%</small>
                        </div>`
                            : ""
                        }
                        <div style="margin-top: 1rem;">
                            <a href="#" class="btn btn-primary" style="width: 100%; text-align: center; display: block;">View Details</a>
                        </div>
                    </div>
                </div>
                `
                  )
                  .join("")}
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 KrayState ArEstate. All rights reserved. | Traditional Real Estate & NFT Tokenization Platform</p>
        </div>
    </footer>

    <!-- Web3 Integration -->
    <script src="https://cdn.jsdelivr.net/npm/web3@4.1.1/dist/web3.min.js"></script>
    <script>
        // Simple Web3 integration
        document.getElementById('walletBtn').addEventListener('click', async () => {
            if (typeof window.ethereum !== 'undefined') {
                try {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    alert('Wallet connected successfully!');
                    document.getElementById('walletBtn').innerHTML = '<i class="fas fa-check-circle"></i> Wallet Connected';
                    document.getElementById('walletBtn').style.background = '#27ae60';
                } catch (error) {
                    alert('Failed to connect wallet');
                }
            } else {
                alert('Please install MetaMask to connect your wallet');
            }
        });
    </script>
</body>
</html>`;
}

function generateListingsPage() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Property Listings - KrayState ArEstate</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; line-height: 1.6; background: #f8f9fa; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: #2c3e50; color: white; padding: 1rem 0; margin-bottom: 2rem; }
        .nav { display: flex; justify-content: space-between; align-items: center; }
        .nav h1 { font-size: 1.8rem; }
        .nav a { color: white; text-decoration: none; margin-left: 2rem; }
        .nav a:hover { color: #3498db; }
        .page-title { font-size: 2.5rem; text-align: center; margin-bottom: 2rem; color: #2c3e50; }
        .property-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; }
        .property-card { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .property-image { width: 100%; height: 200px; background: #ddd; display: flex; align-items: center; justify-content: center; color: #666; }
        .property-content { padding: 1.5rem; }
        .property-price { font-size: 1.5rem; font-weight: bold; color: #e74c3c; margin-bottom: 0.5rem; }
        .property-title { font-size: 1.2rem; margin-bottom: 0.5rem; color: #2c3e50; }
        .property-location { color: #666; margin-bottom: 1rem; }
        .property-features { display: flex; gap: 1rem; margin-bottom: 1rem; font-size: 0.9rem; color: #555; }
        .nft-available { background: linear-gradient(45deg, #3498db, #2c3e50); color: white; padding: 0.5rem; text-align: center; margin-top: 1rem; border-radius: 5px; }
        .btn { padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; text-decoration: none; display: inline-block; margin-top: 1rem; }
        .btn:hover { background: #2c3e50; }
    </style>
</head>
<body>
    <header class="header">
        <nav class="nav container">
            <h1><i class="fas fa-home"></i> KrayState ArEstate</h1>
            <div>
                <a href="/"><i class="fas fa-home"></i> Home</a>
                <a href="/listings.php"><i class="fas fa-building"></i> Properties</a>
                <a href="/nft_marketplace.php"><i class="fas fa-coins"></i> NFT Market</a>
            </div>
        </nav>
    </header>

    <div class="container">
        <h2 class="page-title">Property Listings</h2>
        <div class="property-grid">
            ${mockProperties
              .map(
                (property) => `
            <div class="property-card">
                <div class="property-image">
                    <i class="fas fa-image fa-3x"></i>
                </div>
                <div class="property-content">
                    <div class="property-price">$${property.price}</div>
                    <h3 class="property-title">${property.title}</h3>
                    <p class="property-location"><i class="fas fa-map-marker-alt"></i> ${property.location}</p>
                    <div class="property-features">
                        <span><i class="fas fa-bed"></i> ${property.bedrooms}</span>
                        <span><i class="fas fa-bath"></i> ${property.bathrooms}</span>
                        <span><i class="fas fa-ruler-combined"></i> ${property.sqft.toLocaleString()} sqft</span>
                    </div>
                    <p style="color: #666; margin-bottom: 1rem;">${property.description}</p>
                    ${
                      property.nft_available
                        ? `
                    <div class="nft-available">
                        <i class="fas fa-coins"></i> NFT Tokenization Available
                        <br><small>Token Price: ${property.token_price} ETH | Yield: ${property.rental_yield}%</small>
                    </div>`
                        : ""
                    }
                    <a href="#" class="btn">View Full Details</a>
                </div>
            </div>
            `
              )
              .join("")}
        </div>
    </div>
</body>
</html>`;
}

function generateNFTMarketplacePage() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NFT Tokenization - KrayState ArEstate</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; line-height: 1.6; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: rgba(0,0,0,0.1); color: white; padding: 1rem 0; margin-bottom: 2rem; border-radius: 10px; }
        .nav { display: flex; justify-content: space-between; align-items: center; }
        .nav h1 { font-size: 1.8rem; }
        .nav a { color: white; text-decoration: none; margin-left: 2rem; padding: 0.5rem 1rem; border-radius: 5px; transition: background 0.3s; }
        .nav a:hover { background: rgba(255,255,255,0.2); }
        .hero { text-align: center; color: white; margin-bottom: 3rem; }
        .hero h2 { font-size: 3rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.2rem; opacity: 0.9; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; margin-bottom: 3rem; }
        .stat-card { background: rgba(255,255,255,0.1); color: white; padding: 2rem; border-radius: 10px; text-align: center; backdrop-filter: blur(10px); }
        .stat-card h3 { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .nft-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .nft-card { background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2); transition: transform 0.3s; }
        .nft-card:hover { transform: translateY(-10px); }
        .nft-image { width: 100%; height: 200px; background: linear-gradient(45deg, #3498db, #2c3e50); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; }
        .nft-content { padding: 2rem; }
        .nft-collection { color: #3498db; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem; }
        .nft-title { font-size: 1.3rem; font-weight: bold; margin-bottom: 0.5rem; color: #2c3e50; }
        .nft-location { color: #666; margin-bottom: 1rem; }
        .nft-price { background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; }
        .eth-price { font-size: 1.2rem; font-weight: bold; color: #3498db; }
        .usd-price { color: #666; font-size: 0.9rem; }
        .nft-yield { color: #27ae60; font-weight: 600; }
        .btn-buy { background: linear-gradient(45deg, #3498db, #2c3e50); color: white; border: none; padding: 12px 24px; border-radius: 8px; width: 100%; font-weight: 600; cursor: pointer; transition: transform 0.3s; }
        .btn-buy:hover { transform: translateY(-2px); }
        .wallet-connection { position: fixed; top: 20px; right: 20px; }
        .wallet-btn { background: #27ae60; color: white; border: none; padding: 12px 24px; border-radius: 25px; cursor: pointer; font-weight: 600; }
    </style>
</head>
<body>
    <div class="wallet-connection">
        <button class="wallet-btn" id="connectWallet">
            <i class="fas fa-wallet"></i> Connect Wallet
        </button>
    </div>

    <header class="header">
        <nav class="nav container">
            <h1><i class="fas fa-coins"></i> NFT Tokenization</h1>
            <div>
                <a href="/"><i class="fas fa-home"></i> Home</a>
                <a href="/listings.php"><i class="fas fa-building"></i> Properties</a>
                <a href="/nft_marketplace.php"><i class="fas fa-coins"></i> NFT Market</a>
            </div>
        </nav>
    </header>

    <div class="container">
        <div class="hero">
            <h2>🏠⛓️ Tokenized Real Estate</h2>
            <p>Own fractions of premium properties through blockchain technology</p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <h3>3</h3>
                <p>Properties Available</p>
            </div>
            <div class="stat-card">
                <h3>9.8 ETH</h3>
                <p>Total Value</p>
            </div>
            <div class="stat-card">
                <h3>8.5%</h3>
                <p>Avg Yield</p>
            </div>
            <div class="stat-card">
                <h3>100%</h3>
                <p>Blockchain Verified</p>
            </div>
        </div>

        <div class="nft-grid">
            ${mockProperties
              .filter((p) => p.nft_available)
              .map(
                (property) => `
            <div class="nft-card">
                <div class="nft-image">
                    <i class="fas fa-home"></i>
                </div>
                <div class="nft-content">
                    <div class="nft-collection">KrayState Properties</div>
                    <h3 class="nft-title">${property.title}</h3>
                    <p class="nft-location"><i class="fas fa-map-marker-alt"></i> ${property.location}</p>
                    
                    <div class="nft-price">
                        <div class="eth-price">⟠ ${property.token_price} ETH</div>
                        <div class="usd-price">≈ $${(parseFloat(property.token_price) * 2500).toLocaleString()}</div>
                        <div class="nft-yield">📈 ${property.rental_yield}% Annual Yield</div>
                    </div>
                    
                    <button class="btn-buy" onclick="buyNFT('${property.id}', '${property.token_price}')">
                        <i class="fas fa-shopping-cart"></i> Purchase NFT Token
                    </button>
                </div>
            </div>
            `
              )
              .join("")}
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/web3@4.1.1/dist/web3.min.js"></script>
    <script>
        let web3;
        let userAccount;

        document.getElementById('connectWallet').addEventListener('click', async () => {
            if (typeof window.ethereum !== 'undefined') {
                try {
                    web3 = new Web3(window.ethereum);
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    userAccount = accounts[0];
                    
                    document.getElementById('connectWallet').innerHTML = 
                        '<i class="fas fa-check-circle"></i> ' + userAccount.substring(0,6) + '...' + userAccount.substring(38);
                    document.getElementById('connectWallet').style.background = '#27ae60';
                    
                    // Check network
                    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                    if (parseInt(chainId, 16) !== 11155111) {
                        alert('Please switch to Sepolia testnet to interact with our smart contracts');
                    }
                    
                    alert('Wallet connected successfully!');
                } catch (error) {
                    alert('Failed to connect wallet: ' + error.message);
                }
            } else {
                alert('Please install MetaMask to interact with NFTs');
                window.open('https://metamask.io/download/', '_blank');
            }
        });

        function buyNFT(propertyId, price) {
            if (!userAccount) {
                alert('Please connect your wallet first');
                return;
            }
            
            // Simulate NFT purchase
            const confirmed = confirm('Purchase NFT token for ' + price + ' ETH?\\n\\nThis is a demo - no actual transaction will occur.');
            
            if (confirmed) {
                alert('🎉 NFT Purchase Successful!\\n\\nProperty: ' + propertyId + '\\nPrice: ' + price + ' ETH\\nWallet: ' + userAccount + '\\n\\nNote: This is a demo simulation. In production, this would interact with smart contracts on Sepolia testnet.');
            }
        }

        // Load contract data
        window.addEventListener('load', () => {
            console.log('🏠 KrayState NFT Marketplace loaded');
            console.log('📄 Smart Contracts:', {
                PropertyToken: '0xc601F6352300Af039FA9E4F63545cC52c33D44D8',
                Network: 'Sepolia Testnet (11155111)'
            });
        });
    </script>
</body>
</html>`;
}

app.listen(PORT, () => {
  console.log("🏠 KrayState ArEstate Server running at:");
  console.log("🌐 http://localhost:" + PORT);
  console.log("");
  console.log("📄 Available pages:");
  console.log("   • Homepage: http://localhost:" + PORT + "/");
  console.log("   • Properties: http://localhost:" + PORT + "/listings.php");
  console.log(
    "   • NFT Market: http://localhost:" + PORT + "/nft_marketplace.php"
  );
  console.log("");
  console.log("🔧 Features:");
  console.log("   ✅ Traditional real estate listings");
  console.log("   ✅ NFT tokenization options");
  console.log("   ✅ Web3 wallet connectivity");
  console.log("   ✅ Mock property data");
  console.log("   ✅ Responsive design");
});

module.exports = app;
