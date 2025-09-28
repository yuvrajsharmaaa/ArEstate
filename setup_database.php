<?php
// Database setup script for KrayState
echo "<h2>KrayState Database Setup</h2>";

$host = 'localhost';
$username = 'root';
$password = '';
$database = 'home_db';

try {
    // First, connect without specifying database to create it
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
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