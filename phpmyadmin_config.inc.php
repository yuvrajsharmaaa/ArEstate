<?php
/* 
 * Simple phpMyAdmin configuration for XAMPP without authentication
 */

declare(strict_types=1);

// Basic configuration
$cfg['blowfish_secret'] = 'kraystate-secret-key-for-phpmyadmin-2025';

// Server configuration
$i = 0;

// First server (localhost without password)
$i++;
$cfg['Servers'][$i]['auth_type'] = 'config';
$cfg['Servers'][$i]['host'] = 'localhost';
$cfg['Servers'][$i]['compress'] = false;
$cfg['Servers'][$i]['AllowNoPassword'] = true;
$cfg['Servers'][$i]['user'] = 'root';
$cfg['Servers'][$i]['password'] = '';
$cfg['Servers'][$i]['port'] = 3306;
$cfg['Servers'][$i]['connect_type'] = 'tcp';
$cfg['Servers'][$i]['extension'] = 'mysqli';

// Try alternative connection
$i++;
$cfg['Servers'][$i]['auth_type'] = 'config';
$cfg['Servers'][$i]['host'] = '127.0.0.1';
$cfg['Servers'][$i]['compress'] = false;
$cfg['Servers'][$i]['AllowNoPassword'] = true;
$cfg['Servers'][$i]['user'] = 'root';
$cfg['Servers'][$i]['password'] = '';
$cfg['Servers'][$i]['port'] = 3306;
$cfg['Servers'][$i]['connect_type'] = 'tcp';
$cfg['Servers'][$i]['extension'] = 'mysqli';

// Disable control user features to avoid authentication errors
$cfg['Servers'][$i]['controluser'] = '';
$cfg['Servers'][$i]['controlpass'] = '';
$cfg['Servers'][$i]['pmadb'] = '';
$cfg['Servers'][$i]['bookmarktable'] = '';
$cfg['Servers'][$i]['relation'] = '';
$cfg['Servers'][$i]['table_info'] = '';
$cfg['Servers'][$i]['table_coords'] = '';
$cfg['Servers'][$i]['pdf_pages'] = '';
$cfg['Servers'][$i]['column_info'] = '';
$cfg['Servers'][$i]['history'] = '';
$cfg['Servers'][$i]['table_uiprefs'] = '';
$cfg['Servers'][$i]['tracking'] = '';
$cfg['Servers'][$i]['userconfig'] = '';
$cfg['Servers'][$i]['recent'] = '';
$cfg['Servers'][$i]['favorite'] = '';
$cfg['Servers'][$i]['users'] = '';
$cfg['Servers'][$i]['usergroups'] = '';
$cfg['Servers'][$i]['navigationhiding'] = '';
$cfg['Servers'][$i]['savedsearches'] = '';
$cfg['Servers'][$i]['central_columns'] = '';
$cfg['Servers'][$i]['designer_settings'] = '';
$cfg['Servers'][$i]['export_templates'] = '';

// Global configuration
$cfg['DefaultLang'] = 'en';
$cfg['ServerDefault'] = 1;
$cfg['UploadDir'] = '';
$cfg['SaveDir'] = '';
$cfg['LoginCookieValidity'] = 1440;
$cfg['LoginCookieStore'] = 0;
$cfg['LoginCookieDeleteAll'] = true;
$cfg['UseDbSearch'] = true;
$cfg['IgnoreMultiSubmitErrors'] = false;
$cfg['VerboseMultiSubmit'] = true;
$cfg['AllowUserDropDatabase'] = false;
$cfg['Confirm'] = true;
$cfg['QueryHistoryDB'] = false;
$cfg['QueryHistoryMax'] = 25;
$cfg['BrowseMIME'] = true;
$cfg['MaxExactCount'] = 0;
$cfg['MaxExactCountViews'] = 0;

// Theme and appearance
$cfg['ThemeDefault'] = 'pmahomme';
$cfg['DefaultTabServer'] = 'welcome';
$cfg['DefaultTabDatabase'] = 'structure';
$cfg['DefaultTabTable'] = 'browse';

// Disable warnings for easier use
$cfg['SendErrorReports'] = 'never';
$cfg['ConsoleEnterExecutes'] = false;

// Allow all functions
$cfg['AllowArbitraryServer'] = false;
$cfg['ArbitraryServerRegexp'] = '';

// Show PHP info
$cfg['ShowPhpInfo'] = false;
$cfg['ShowServerInfo'] = true;
$cfg['ShowAll'] = false;
$cfg['MaxRows'] = 30;
$cfg['Order'] = 'ASC';
$cfg['ProtectBinary'] = 'blob';
$cfg['ShowFunctionFields'] = true;
$cfg['ShowFieldTypesInDataEditView'] = true;
$cfg['CharEditing'] = 'input';
$cfg['MinSizeForInputField'] = 4;
$cfg['MaxSizeForInputField'] = 40;
$cfg['InsertRows'] = 2;
$cfg['ForeignKeyDropdownOrder'] = array('content-id', 'id-content');
$cfg['ForeignKeyMaxLimit'] = 100;

// Disable complex features that might cause auth issues  
$cfg['ZipDump'] = false;
$cfg['GZipDump'] = false;
$cfg['BZipDump'] = false;

// Memory and execution limits
$cfg['MemoryLimit'] = '512M';
$cfg['SkipLockedTables'] = false;
$cfg['ShowSQL'] = true;
$cfg['AllowSharedBookmarks'] = false;
$cfg['RetainQueryBox'] = false;
$cfg['CodemirrorEnable'] = true;
$cfg['LintEnable'] = false;

// Simplified export/import
$cfg['Export']['compression'] = 'none';
$cfg['Import']['charset'] = 'utf-8';

?>