<?php
/**
 * Vercel PHP Runtime entry point for Laravel.
 * 
 * This file routes all requests through Laravel's public/index.php
 */

// Laravel application path
$appPath = __DIR__ . '/..';

// Require Laravel's entry point
require $appPath . '/public/index.php';
