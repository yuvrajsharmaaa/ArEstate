# KrayState Real Estate - Quick Start Guide

## 🚀 Running Without Installation

### Option 1: XAMPP Portable (Recommended)

1. Download XAMPP Portable from: https://portableapps.com/apps/development/xampp
2. Extract to any folder (e.g., C:\xampp-portable)
3. Copy your project to: xampp-portable\htdocs\kraystate
4. Run xampp-control.exe
5. Start Apache
6. Visit: http://localhost/kraystate/home.php

### Option 2: PHP Zip Download (Manual)

1. Go to: https://windows.php.net/downloads/releases/
2. Download PHP 8.2+ "Thread Safe" ZIP
3. Extract to C:\php
4. Add C:\php to your Windows PATH:
   - Right-click "This PC" → Properties
   - Advanced System Settings
   - Environment Variables
   - Edit "Path" → Add "C:\php"
5. Open new Command Prompt
6. Run: php -S localhost:8000

### Option 3: Online Testing

Upload your files to:

- 000webhost.com (free PHP hosting)
- InfinityFree.net
- AwardSpace.com

## 🎯 Your Real Estate Website Features

Once running, you'll have:

- ✅ Traditional property listings
- ✅ User registration and login
- ✅ Property search and filters
- ✅ Admin panel for management
- ✅ Contact forms and messaging
- ✅ NFT tokenization option (new feature)
- ✅ Web3 wallet connectivity
- ✅ Blockchain property verification

## 📁 Main Pages

- home.php - Homepage with property listings
- listings.php - All property listings
- view_property.php - Individual property details
- nft_marketplace.php - NFT tokenization features
- login.php / register.php - User authentication
- admin/ - Admin panel

## 🔧 Quick Test (Static HTML)

If you can't run PHP immediately:

1. Rename home.php to home.html
2. Open in any web browser
3. Most features will work except:
   - Database connections
   - User authentication
   - Dynamic content loading
