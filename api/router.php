<?php
// PHP built-in server router for local development.
// Apache/Hostinger uses .htaccess instead.
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$file = __DIR__ . '/../' . ltrim($path, '/');
if ($path !== '/api' && $path !== '/api/' && is_file($file) && !str_starts_with($path, '/api/')) {
    return false;
}
require __DIR__ . '/index.php';
