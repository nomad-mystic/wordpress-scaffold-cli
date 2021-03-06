<?php

define('THEME_NAME_THEME_DIR', get_stylesheet_directory());

// Get out theme config
$project_config = file_get_contents(ABSPATH . 'internal/project/project-config.json');

// Extract values from config
$active_theme = 'scaffold-theme';

if (empty($project_config)) {
    // Let the user know there was an issue with a WordPress alert!!!
    exit;
} else {

    // Build our values
    $project_config = json_decode($project_config);

    $active_theme = $project_config->{'active-theme'};
}

/**
 * Load Composer
 */
if (file_exists(ABSPATH . 'vendor/autoload.php')) {
    require_once(ABSPATH . 'vendor/autoload.php');
}

/**
 * Starting point for all auto initializing
 */
if (file_exists(ABSPATH . "wp-content/themes/{$active_theme}/classes/BootstrapClasses.php")) {
    require_once(ABSPATH . "wp-content/themes/{$active_theme}/classes/BootstrapClasses.php");
}

// Build our constants
define('THEME_NAME_DOMAIN', $active_theme);

// Auto require includes PHP files
if (is_dir(get_stylesheet_directory() . '/includes/')) {
    $includes_php_path = get_stylesheet_directory() . '/includes/';
    $php_files = [];

    foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($includes_php_path, FilesystemIterator::SKIP_DOTS)) as $filename) {
        // Extract the files info
        $path_parts = pathinfo($filename);

        // Make sure we have an array and the file is PHP
        if (is_array($path_parts) && $path_parts['extension'] === 'php') {
            if (!empty($path_parts['dirname']) && !empty($path_parts['basename'])) {
                // If all checks pass add it to the file list
                $php_files[] = $path_parts['dirname'] . '/' . $path_parts['basename'];
            }
        }
    }

    // Require our PHP files
    if (!empty($php_files)) {
        foreach ($php_files as $php_file) {
            if (isset($php_file) && !empty($php_file)) {
                require_once($php_file);
            }
        }
    }
}
