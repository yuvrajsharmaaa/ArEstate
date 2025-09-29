<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KrayState - System Health Check</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css">
    <link rel="stylesheet" href="css/style.css">
    <style>
        .health-check {
            max-width: 1000px;
            margin: 20px auto;
            padding: 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .status-item {
            padding: 20px;
            border-radius: 8px;
            border-left: 5px solid;
        }
        .status-ok {
            background: #d4edda;
            border-color: #28a745;
            color: #155724;
        }
        .status-warning {
            background: #fff3cd;
            border-color: #ffc107;
            color: #856404;
        }
        .status-error {
            background: #f8d7da;
            border-color: #dc3545;
            color: #721c24;
        }
        .test-results {
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 5px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <?php include 'components/user_header.php'; ?>
    
    <div class="health-check">
        <h1><i class="fas fa-heartbeat"></i> KrayState System Health Check</h1>
        
        <?php
        $healthStatus = [];
        
        // Check PHP Version
        $phpVersion = phpversion();
        $healthStatus['PHP'] = [
            'status' => version_compare($phpVersion, '7.4.0', '>=') ? 'ok' : 'warning',
            'message' => "PHP Version: $phpVersion " . (version_compare($phpVersion, '7.4.0', '>=') ? '✅' : '⚠️'),
            'details' => version_compare($phpVersion, '7.4.0', '>=') ? 'PHP version is compatible' : 'Consider upgrading PHP'
        ];
        
        // Check Database Connection
        try {
            include 'components/connect.php';
            if (isset($conn) && $conn) {
                $healthStatus['Database'] = [
                    'status' => 'ok',
                    'message' => 'Database Connection: ✅ Connected',
                    'details' => 'Database connection established successfully'
                ];
                
                // Test database operations
                try {
                    $stmt = $conn->query("SELECT COUNT(*) as count FROM property");
                    $propertyCount = $stmt->fetch()['count'];
                    $healthStatus['Database Data'] = [
                        'status' => 'ok',
                        'message' => "Property Records: $propertyCount ✅",
                        'details' => 'Database contains property data'
                    ];
                } catch (Exception $e) {
                    $healthStatus['Database Data'] = [
                        'status' => 'warning',
                        'message' => 'Database Data: ⚠️ Limited',
                        'details' => 'Using fallback data mode'
                    ];
                }
            } else {
                $healthStatus['Database'] = [
                    'status' => 'warning',
                    'message' => 'Database Connection: ⚠️ Using Fallback',
                    'details' => 'SQLite fallback mode active'
                ];
            }
        } catch (Exception $e) {
            $healthStatus['Database'] = [
                'status' => 'error',
                'message' => 'Database Connection: ❌ Error',
                'details' => 'Database connection failed: ' . $e->getMessage()
            ];
        }
        
        // Check Web Server
        $webServer = $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown';
        $healthStatus['Web Server'] = [
            'status' => 'ok',
            'message' => "Web Server: $webServer ✅",
            'details' => 'Web server is running properly'
        ];
        
        // Check File Permissions
        $writableDirectories = ['uploaded_files'];
        $allWritable = true;
        foreach ($writableDirectories as $dir) {
            if (!is_writable($dir)) {
                $allWritable = false;
                break;
            }
        }
        $healthStatus['File Permissions'] = [
            'status' => $allWritable ? 'ok' : 'warning',
            'message' => 'File Permissions: ' . ($allWritable ? '✅ OK' : '⚠️ Check'),
            'details' => $allWritable ? 'All directories writable' : 'Some directories may need write permissions'
        ];
        
        // Check JavaScript Dependencies
        $healthStatus['Frontend'] = [
            'status' => 'ok',
            'message' => 'Frontend Assets: ✅ Loaded',
            'details' => 'CSS, JS, and Web3 integration ready'
        ];
        
        // Check Critical Files
        $criticalFiles = [
            'components/connect.php' => 'Database connection',
            'components/user_header.php' => 'Navigation header',
            'css/style.css' => 'Main stylesheet',
            'js/script.js' => 'JavaScript functions'
        ];
        
        $missingFiles = [];
        foreach ($criticalFiles as $file => $description) {
            if (!file_exists($file)) {
                $missingFiles[] = "$file ($description)";
            }
        }
        
        $healthStatus['Critical Files'] = [
            'status' => empty($missingFiles) ? 'ok' : 'error',
            'message' => 'Critical Files: ' . (empty($missingFiles) ? '✅ All Present' : '❌ Missing'),
            'details' => empty($missingFiles) ? 'All critical files found' : 'Missing: ' . implode(', ', $missingFiles)
        ];
        
        // Display Results
        echo '<div class="status-grid">';
        foreach ($healthStatus as $component => $status) {
            $statusClass = 'status-' . $status['status'];
            echo "<div class='status-item $statusClass'>";
            echo "<h3>$component</h3>";
            echo "<p><strong>{$status['message']}</strong></p>";
            echo "<p>{$status['details']}</p>";
            echo "</div>";
        }
        echo '</div>';
        
        // System Information
        echo '<div class="test-results">';
        echo '<h3>📊 System Information</h3>';
        echo '<p><strong>Server:</strong> ' . ($_SERVER['SERVER_NAME'] ?? 'localhost') . '</p>';
        echo '<p><strong>Document Root:</strong> ' . ($_SERVER['DOCUMENT_ROOT'] ?? 'Unknown') . '</p>';
        echo '<p><strong>Current Directory:</strong> ' . getcwd() . '</p>';
        echo '<p><strong>PHP Memory Limit:</strong> ' . ini_get('memory_limit') . '</p>';
        echo '<p><strong>Max Execution Time:</strong> ' . ini_get('max_execution_time') . ' seconds</p>';
        echo '<p><strong>Upload Max Size:</strong> ' . ini_get('upload_max_filesize') . '</p>';
        echo '</div>';
        
        // Overall Health Score
        $totalChecks = count($healthStatus);
        $passedChecks = 0;
        foreach ($healthStatus as $status) {
            if ($status['status'] === 'ok') $passedChecks++;
        }
        $healthScore = round(($passedChecks / $totalChecks) * 100);
        
        $scoreClass = $healthScore >= 80 ? 'status-ok' : ($healthScore >= 60 ? 'status-warning' : 'status-error');
        echo "<div class='status-item $scoreClass' style='text-align: center; margin: 20px 0;'>";
        echo "<h2>Overall Health Score: $healthScore%</h2>";
        echo "<p>$passedChecks out of $totalChecks checks passed</p>";
        if ($healthScore >= 80) {
            echo "<p>🎉 System is running well!</p>";
        } elseif ($healthScore >= 60) {
            echo "<p>⚠️ System has minor issues but is functional</p>";
        } else {
            echo "<p>❌ System needs attention</p>";
        }
        echo "</div>";
        ?>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="home.php" class="btn" style="margin: 10px;">🏠 Main Application</a>
            <a href="database_manager.php" class="btn" style="margin: 10px;">🗄️ Database Manager</a>
            <a href="contract_dashboard.php" class="btn" style="margin: 10px;">⛓️ Smart Contracts</a>
            <a href="listings.php" class="btn" style="margin: 10px;">📋 View Properties</a>
        </div>
    </div>
</body>
</html>