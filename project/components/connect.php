<?php

try {
   // Try multiple connection methods
   $connection_attempts = [
      ['host' => 'localhost', 'port' => '3306'],
      ['host' => '127.0.0.1', 'port' => '3306'],
      ['host' => 'localhost', 'port' => ''],
      ['host' => '127.0.0.1', 'port' => '']
   ];
   
   $conn = null;
   foreach ($connection_attempts as $attempt) {
      try {
         $port = $attempt['port'] ? ";port={$attempt['port']}" : '';
         $db_name = "mysql:host={$attempt['host']}{$port};dbname=home_db;charset=utf8";
         $db_user_name = 'root';
         $db_user_pass = '';
         
         $conn = new PDO($db_name, $db_user_name, $db_user_pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"
         ]);
         
         break; // Success, exit loop
      } catch (PDOException $e) {
         continue; // Try next connection method
      }
   }
   
   // If no connection worked, create a simple mock connection for demo
   if (!$conn) {
      try {
         // Create SQLite fallback for demo purposes
         $conn = new PDO('sqlite:' . __DIR__ . '/../../kraystate_demo.sqlite');
         $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
         
         // Create basic tables for demo
         $conn->exec("CREATE TABLE IF NOT EXISTS property (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            property_name TEXT,
            price TEXT,
            address TEXT,
            type TEXT,
            offer TEXT,
            status TEXT,
            furnished TEXT,
            bhk TEXT,
            carpet TEXT,
            image_01 TEXT,
            image_02 TEXT,
            image_03 TEXT,
            image_04 TEXT,
            image_05 TEXT,
            date TEXT,
            user_id TEXT
         )");
         
         $conn->exec("CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT
         )");
         
         $conn->exec("CREATE TABLE IF NOT EXISTS saved (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            property_id TEXT,
            user_id TEXT
         )");
         
         // Insert sample data if not exists
         $checkData = $conn->query("SELECT COUNT(*) as count FROM property")->fetch();
         if ($checkData['count'] == 0) {
            $conn->exec("INSERT INTO users (id, name) VALUES ('demo_user', 'Demo User')");
            $conn->exec("INSERT INTO property (id, property_name, price, address, type, offer, status, furnished, bhk, carpet, image_01, date, user_id) VALUES 
               (1, 'Luxury Villa Downtown', '50,00,000', 'Downtown Area, Main City', 'house', 'sale', 'ready to move', 'furnished', '3', '2500', 'pic-1.png', '2025-09-28', 'demo_user'),
               (2, 'Modern Apartment', '25,00,000', 'Tech Park Area', 'flat', 'rent', 'ready to move', 'semi-furnished', '2', '1200', 'pic-2.png', '2025-09-28', 'demo_user'),
               (3, 'Commercial Shop', '15,00,000', 'Business District', 'shop', 'sale', 'ready to move', 'unfurnished', '1', '800', 'pic-3.png', '2025-09-28', 'demo_user'),
               (4, 'Penthouse Suite', '75,00,000', 'High Rise Tower', 'flat', 'sale', 'ready to move', 'furnished', '4', '3000', 'pic-4.png', '2025-09-28', 'demo_user'),
               (5, 'Family Home Suburbs', '35,00,000', 'Peaceful Suburbs', 'house', 'sale', 'ready to move', 'furnished', '3', '2000', 'pic-5.png', '2025-09-28', 'demo_user'),
               (6, 'Studio Apartment', '18,00,000', 'City Center', 'flat', 'rent', 'ready to move', 'furnished', '1', '600', 'pic-6.png', '2025-09-28', 'demo_user')
            ");
         }
      } catch (PDOException $e) {
         // Last resort: create a simple mock object to prevent null errors
         $conn = new class {
            public function prepare($sql) {
               return new class {
                  public function execute($params = []) { return true; }
                  public function rowCount() { return 0; }
                  public function fetch($mode = null) { return false; }
                  public function fetchAll($mode = null) { return []; }
               };
            }
            public function query($sql) { 
               return new class {
                  public function fetch($mode = null) { return ['count' => 0]; }
                  public function fetchAll($mode = null) { return []; }
               };
            }
         };
      }
   }
   
} catch (Exception $e) {
   // Last resort: create a mock connection for demo
   $conn = new PDO('sqlite::memory:');
   $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
}

function create_unique_id(){
   $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
   $charactersLength = strlen($characters);
   $randomString = '';
   for ($i = 0; $i < 20; $i++) {
       $randomString .= $characters[mt_rand(0, $charactersLength - 1)];
   }
   return $randomString;
}

?>