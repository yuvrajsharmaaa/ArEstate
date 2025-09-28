<?php
// Database setup script for KrayState
echo "<h2>KrayState Database Setup</h2>";

$host = 'localhost';
$username = 'root';
$password = '';
$database = 'home_db';

try {
    // Try different connection methods
    $connectionMethods = [
        "mysql:host=$host",
        "mysql:host=$host;port=3306",
        "mysql:host=127.0.0.1",
        "mysql:host=127.0.0.1;port=3306"
    ];
    
    $pdo = null;
    foreach ($connectionMethods as $dsn) {
        try {
            $pdo = new PDO($dsn, $username, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"
            ]);
            echo "<p style='color: blue;'>✅ Connected using: $dsn</p>";
            break;
        } catch (PDOException $e) {
            echo "<p style='color: orange;'>⚠️ Failed with $dsn: " . $e->getMessage() . "</p>";
            continue;
        }
    }
    
    if (!$pdo) {
        throw new PDOException("All connection methods failed");
    }
    
    // Create database
    $pdo->exec("CREATE DATABASE IF NOT EXISTS $database");
    echo "<p style='color: green;'>✅ Database 'home_db' created successfully!</p>";
    
    // Now connect to the database
    $pdo = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    
    // Read and execute SQL file
    $sqlFile = __DIR__ . '/home_db.sql';
    if (file_exists($sqlFile)) {
        $sql = file_get_contents($sqlFile);
        
        // Split SQL file into individual statements
        $statements = explode(';', $sql);
        
        foreach ($statements as $statement) {
            $statement = trim($statement);
            if (!empty($statement)) {
                $pdo->exec($statement);
            }
        }
        
        echo "<p style='color: green;'>✅ Database schema imported successfully!</p>";
    } else {
        echo "<p style='color: red;'>❌ SQL file not found: $sqlFile</p>";
    }
    
    // Test the connection
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll();
    
    echo "<h3>Database Tables:</h3><ul>";
    foreach ($tables as $table) {
        echo "<li>" . $table[0] . "</li>";
    }
    echo "</ul>";
    
    echo "<p style='color: green; font-weight: bold;'>🎉 Database setup completed successfully!</p>";
    echo "<p><a href='/kraystate/home.php'>Go to KrayState Application</a></p>";
    
} catch (PDOException $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}
?>