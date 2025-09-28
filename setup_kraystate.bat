@echo off
echo =========================================
echo KrayState NFT Marketplace Setup Script
echo =========================================
echo.

echo Checking for XAMPP installation...
if exist "C:\xampp\php\php.exe" (
    echo ✓ XAMPP found!
    echo.
    echo Copying project files to XAMPP directory...
    xcopy "%~dp0project" "C:\xampp\htdocs\kraystate" /E /I /Y
    echo ✓ Files copied successfully!
    echo.
    echo Starting XAMPP Apache server...
    "C:\xampp\xampp_start.exe"
    echo.
    echo =========================================
    echo Your KrayState NFT Marketplace is ready!
    echo.
    echo Visit: http://localhost/kraystate/nft_marketplace.php
    echo Test Setup: http://localhost/kraystate/test_setup.php
    echo =========================================
    echo.
    echo Press any key to open the marketplace in your browser...
    pause >nul
    start http://localhost/kraystate/nft_marketplace.php
) else (
    echo ❌ XAMPP not found!
    echo.
    echo Please install XAMPP first:
    echo 1. Go to: https://www.apachefriends.org/download.html
    echo 2. Download XAMPP for Windows
    echo 3. Install to C:\xampp
    echo 4. Run this script again
    echo.
    echo Alternatively, you can run with PHP directly:
    echo 1. Install PHP 8+ from: https://windows.php.net/download/
    echo 2. Add PHP to your PATH
    echo 3. Run: php -S localhost:8000 (in project directory)
    echo.
    pause
)