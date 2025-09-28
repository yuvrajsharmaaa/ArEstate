<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KrayState - Database Manager</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 30px;
        }
        .status-card {
            background: #f8f9fa;
            border-left: 5px solid #28a745;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .error-card {
            background: #f8f9fa;
            border-left: 5px solid #dc3545;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .info-card {
            background: #f8f9fa;
            border-left: 5px solid #007bff;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .btn {
            background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin: 5px;
            transition: transform 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background: #f8f9fa;
            font-weight: bold;
        }
        .sql-result {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            font-family: monospace;
            white-space: pre-wrap;
            max-height: 300px;
            overflow-y: auto;
        }
        .form-group {
            margin: 15px 0;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        .form-group input, .form-group textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🗄️ KrayState Database Manager</h1>
        
        <?php
        // Database connection testing
        $connectionStatus = [];
        $activeConnection = null;
        
        // Test different connection methods
        $connectionMethods = [
            ['host' => 'localhost', 'port' => 3306, 'name' => 'MySQL localhost:3306'],
            ['host' => '127.0.0.1', 'port' => 3306, 'name' => 'MySQL 127.0.0.1:3306'],
            ['host' => 'localhost', 'port' => 3307, 'name' => 'MySQL localhost:3307'],
            ['host' => '127.0.0.1', 'port' => 3307, 'name' => 'MySQL 127.0.0.1:3307'],
        ];
        
        foreach ($connectionMethods as $method) {
            try {
                $dsn = "mysql:host={$method['host']};port={$method['port']}";
                $pdo = new PDO($dsn, 'root', '', [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_TIMEOUT => 5
                ]);
                $connectionStatus[] = [
                    'name' => $method['name'],
                    'status' => 'success',
                    'message' => 'Connected successfully',
                    'connection' => $pdo
                ];
                if (!$activeConnection) {
                    $activeConnection = $pdo;
                }
            } catch (PDOException $e) {
                $connectionStatus[] = [
                    'name' => $method['name'],
                    'status' => 'error',
                    'message' => $e->getMessage(),
                    'connection' => null
                ];
            }
        }
        
        // If no MySQL connection, use SQLite fallback
        if (!$activeConnection) {
            try {
                $activeConnection = new PDO('sqlite:' . __DIR__ . '/kraystate.sqlite');
                $activeConnection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $connectionStatus[] = [
                    'name' => 'SQLite Fallback',
                    'status' => 'success',
                    'message' => 'Using SQLite database for demo',
                    'connection' => $activeConnection
                ];
            } catch (PDOException $e) {
                $connectionStatus[] = [
                    'name' => 'SQLite Fallback',
                    'status' => 'error',
                    'message' => $e->getMessage(),
                    'connection' => null
                ];
            }
        }
        
        // Display connection status
        echo '<div class="info-card"><h3>🔌 Database Connection Status</h3>';
        foreach ($connectionStatus as $status) {
            $cardClass = $status['status'] === 'success' ? 'status-card' : 'error-card';
            $icon = $status['status'] === 'success' ? '✅' : '❌';
            echo "<div class='$cardClass'>$icon <strong>{$status['name']}:</strong> {$status['message']}</div>";
        }
        echo '</div>';
        
        if ($activeConnection) {
            // Create database and tables
            try {
                if (strpos(get_class($activeConnection), 'sqlite') === false) {
                    // MySQL - create database
                    $activeConnection->exec("CREATE DATABASE IF NOT EXISTS home_db");
                    $activeConnection->exec("USE home_db");
                }
                
                // Create tables
                $createTables = [
                    "CREATE TABLE IF NOT EXISTS users (
                        id VARCHAR(20) PRIMARY KEY,
                        name VARCHAR(50) NOT NULL,
                        email VARCHAR(100),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )",
                    "CREATE TABLE IF NOT EXISTS property (
                        id INTEGER PRIMARY KEY " . (strpos(get_class($activeConnection), 'sqlite') !== false ? 'AUTOINCREMENT' : 'AUTO_INCREMENT') . ",
                        property_name VARCHAR(100) NOT NULL,
                        price VARCHAR(20) NOT NULL,
                        address TEXT NOT NULL,
                        type VARCHAR(20) NOT NULL,
                        offer VARCHAR(20) NOT NULL,
                        status VARCHAR(20) NOT NULL,
                        furnished VARCHAR(20) NOT NULL,
                        bhk VARCHAR(10) NOT NULL,
                        carpet VARCHAR(10) NOT NULL,
                        image_01 VARCHAR(100),
                        image_02 VARCHAR(100),
                        image_03 VARCHAR(100),
                        image_04 VARCHAR(100),
                        image_05 VARCHAR(100),
                        date DATE,
                        user_id VARCHAR(20),
                        tokenized BOOLEAN DEFAULT FALSE,
                        token_amount DECIMAL(18,8) DEFAULT 0,
                        blockchain_address VARCHAR(42)
                    )",
                    "CREATE TABLE IF NOT EXISTS saved (
                        id INTEGER PRIMARY KEY " . (strpos(get_class($activeConnection), 'sqlite') !== false ? 'AUTOINCREMENT' : 'AUTO_INCREMENT') . ",
                        property_id VARCHAR(20) NOT NULL,
                        user_id VARCHAR(20) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )",
                    "CREATE TABLE IF NOT EXISTS lease_agreements (
                        id INTEGER PRIMARY KEY " . (strpos(get_class($activeConnection), 'sqlite') !== false ? 'AUTOINCREMENT' : 'AUTO_INCREMENT') . ",
                        property_id VARCHAR(20) NOT NULL,
                        landlord_id VARCHAR(20) NOT NULL,
                        tenant_id VARCHAR(20) NOT NULL,
                        monthly_rent DECIMAL(10,2) NOT NULL,
                        duration INTEGER NOT NULL,
                        start_date DATE,
                        blockchain_lease_id INTEGER,
                        status VARCHAR(20) DEFAULT 'active'
                    )",
                    "CREATE TABLE IF NOT EXISTS blockchain_transactions (
                        id INTEGER PRIMARY KEY " . (strpos(get_class($activeConnection), 'sqlite') !== false ? 'AUTOINCREMENT' : 'AUTO_INCREMENT') . ",
                        tx_hash VARCHAR(66) NOT NULL,
                        contract_address VARCHAR(42) NOT NULL,
                        function_name VARCHAR(50) NOT NULL,
                        property_id VARCHAR(20),
                        user_address VARCHAR(42),
                        amount DECIMAL(18,8),
                        status VARCHAR(20) DEFAULT 'pending',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )"
                ];
                
                foreach ($createTables as $sql) {
                    $activeConnection->exec($sql);
                }
                
                // Insert sample data
                $insertSamples = [
                    "INSERT OR IGNORE INTO users (id, name, email) VALUES 
                        ('demo_user', 'Demo User', 'demo@kraystate.com'),
                        ('user_001', 'John Doe', 'john@example.com'),
                        ('user_002', 'Jane Smith', 'jane@example.com')",
                    "INSERT OR IGNORE INTO property (id, property_name, price, address, type, offer, status, furnished, bhk, carpet, image_01, date, user_id, tokenized, token_amount) VALUES 
                        (1, 'Luxury Downtown Apartment', '5000000', '123 Main St, Downtown', 'flat', 'sale', 'ready to move', 'furnished', '3', '1500', 'pic-1.png', '2025-09-28', 'demo_user', 1, 100.50),
                        (2, 'Modern Villa with Garden', '8500000', '456 Oak Avenue, Suburbs', 'house', 'sale', 'ready to move', 'semi-furnished', '4', '2500', 'pic-2.png', '2025-09-28', 'user_001', 1, 250.75),
                        (3, 'Commercial Space Downtown', '3500000', '789 Business District', 'shop', 'rent', 'ready to move', 'unfurnished', '1', '800', 'pic-3.png', '2025-09-28', 'user_002', 0, 0),
                        (4, 'Penthouse with City View', '12000000', '321 High Rise Tower', 'flat', 'sale', 'under construction', 'furnished', '5', '3000', 'pic-4.png', '2025-09-28', 'demo_user', 1, 500.25)",
                    "INSERT OR IGNORE INTO lease_agreements (property_id, landlord_id, tenant_id, monthly_rent, duration, start_date, blockchain_lease_id, status) VALUES 
                        (3, 'user_002', 'demo_user', 25000.00, 12, '2025-09-01', 1001, 'active'),
                        (1, 'demo_user', 'user_001', 45000.00, 24, '2025-08-15', 1002, 'active')",
                    "INSERT OR IGNORE INTO blockchain_transactions (tx_hash, contract_address, function_name, property_id, user_address, amount, status) VALUES 
                        ('0x1234...abcd', '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', 'tokenizeProperty', '1', '0x742d35Cc6634C0532925a3b8D9e5d0FD', 100.50, 'confirmed'),
                        ('0x5678...efgh', '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9', 'createLease', '3', '0x8ba1f109551bD432803012645Hac136c', 25000.00, 'confirmed')"
                ];
                
                foreach ($insertSamples as $sql) {
                    if (strpos(get_class($activeConnection), 'sqlite') === false) {
                        // For MySQL, use INSERT IGNORE
                        $sql = str_replace('INSERT OR IGNORE', 'INSERT IGNORE', $sql);
                    }
                    try {
                        $activeConnection->exec($sql);
                    } catch (PDOException $e) {
                        // Ignore duplicate entry errors
                        if (!strpos($e->getMessage(), 'UNIQUE constraint') && !strpos($e->getMessage(), 'Duplicate entry')) {
                            throw $e;
                        }
                    }
                }
                
                echo '<div class="status-card">
                    <h3>✅ Database Setup Complete!</h3>
                    <p>Database and tables created successfully with sample data.</p>
                    <p><strong>Database Type:</strong> ' . (strpos(get_class($activeConnection), 'sqlite') !== false ? 'SQLite (Demo Mode)' : 'MySQL') . '</p>
                </div>';
                
            } catch (PDOException $e) {
                echo '<div class="error-card">
                    <h3>❌ Database Setup Error</h3>
                    <p>' . htmlspecialchars($e->getMessage()) . '</p>
                </div>';
            }
            
            // Display database tables and data
            try {
                echo '<div class="info-card"><h3>📊 Database Tables</h3>';
                
                $tables = ['users', 'property', 'saved', 'lease_agreements', 'blockchain_transactions'];
                
                foreach ($tables as $table) {
                    try {
                        $stmt = $activeConnection->query("SELECT COUNT(*) as count FROM $table");
                        $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
                        echo "<p><strong>$table:</strong> $count records</p>";
                    } catch (PDOException $e) {
                        echo "<p><strong>$table:</strong> Table not found</p>";
                    }
                }
                
                // Show property data
                echo '<h4>🏠 Property Listings</h4>';
                $stmt = $activeConnection->query("SELECT * FROM property LIMIT 5");
                $properties = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                if ($properties) {
                    echo '<table>';
                    echo '<tr><th>ID</th><th>Name</th><th>Price</th><th>Type</th><th>Tokenized</th><th>Token Amount</th></tr>';
                    foreach ($properties as $property) {
                        $tokenized = isset($property['tokenized']) && $property['tokenized'] ? '✅ Yes' : '❌ No';
                        $tokenAmount = isset($property['token_amount']) ? $property['token_amount'] : '0';
                        echo "<tr>
                            <td>{$property['id']}</td>
                            <td>{$property['property_name']}</td>
                            <td>₹{$property['price']}</td>
                            <td>{$property['type']}</td>
                            <td>$tokenized</td>
                            <td>$tokenAmount</td>
                        </tr>";
                    }
                    echo '</table>';
                }
                
                // Show blockchain transactions
                echo '<h4>⛓️ Blockchain Transactions</h4>';
                try {
                    $stmt = $activeConnection->query("SELECT * FROM blockchain_transactions LIMIT 5");
                    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    
                    if ($transactions) {
                        echo '<table>';
                        echo '<tr><th>TX Hash</th><th>Function</th><th>Property ID</th><th>Amount</th><th>Status</th></tr>';
                        foreach ($transactions as $tx) {
                            $shortHash = substr($tx['tx_hash'], 0, 10) . '...';
                            echo "<tr>
                                <td>$shortHash</td>
                                <td>{$tx['function_name']}</td>
                                <td>{$tx['property_id']}</td>
                                <td>{$tx['amount']}</td>
                                <td>{$tx['status']}</td>
                            </tr>";
                        }
                        echo '</table>';
                    }
                } catch (PDOException $e) {
                    echo '<p>No blockchain transactions found.</p>';
                }
                
                echo '</div>';
                
            } catch (PDOException $e) {
                echo '<div class="error-card">
                    <h3>❌ Error Reading Database</h3>
                    <p>' . htmlspecialchars($e->getMessage()) . '</p>
                </div>';
            }
        }
        ?>
        
        <div class="info-card">
            <h3>🚀 Quick Actions</h3>
            <a href="home.php" class="btn">🏠 Go to Main Application</a>
            <a href="contract_dashboard.php" class="btn">⛓️ Smart Contract Dashboard</a>
            <a href="nft_marketplace.php" class="btn">🎨 NFT Marketplace</a>
            <a href="listings.php" class="btn">📋 View All Properties</a>
        </div>
        
        <div class="status-card">
            <h3>ℹ️ System Information</h3>
            <p><strong>PHP Version:</strong> <?php echo phpversion(); ?></p>
            <p><strong>Database Status:</strong> <?php echo $activeConnection ? 'Connected ✅' : 'Not Connected ❌'; ?></p>
            <p><strong>Web3 Ready:</strong> Integration available ✅</p>
            <p><strong>Authentication:</strong> Disabled for demo ✅</p>
        </div>
    </div>
</body>
</html>