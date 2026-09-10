<?php
declare(strict_types=1);

/*
 * Ayesha Collection — MySQL configuration.
 * For Hostinger: replace these values with the database details from hPanel.
 */
const DB_HOST = 'localhost';
const DB_NAME = 'ayesha_collection';
const DB_USER = 'YOUR_DB_USER';
const DB_PASS = 'YOUR_DB_PASSWORD';

function db(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;
    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    return $pdo;
}

function jsonResponse(mixed $data, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_SLASHES);
    exit;
}

function inputJson(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '{}', true);
    return is_array($data) ? $data : [];
}

function requireAdmin(): array {
    if (session_status() !== PHP_SESSION_ACTIVE) session_start();
    if (empty($_SESSION['admin_id'])) {
        jsonResponse(['message' => 'Admin login required.'], 401);
    }
    return ['id' => (int)$_SESSION['admin_id'], 'email' => (string)$_SESSION['admin_email']];
}

function productPayload(array $d, ?array $existing = null): array {
    $name = trim((string)($d['name'] ?? $existing['name'] ?? ''));
    $category = (string)($d['category'] ?? $existing['category'] ?? '');
    if ($name === '') jsonResponse(['message' => 'Product name is required.'], 422);
    if (!in_array($category, ['Women', 'Men', 'Kids'], true)) {
        jsonResponse(['message' => 'Category must be Women, Men or Kids.'], 422);
    }
    $price = max(0, (float)($d['price'] ?? $existing['price'] ?? 0));
    $mrp = max(0, (float)($d['mrp'] ?? $existing['mrp'] ?? 0));
    $discount = $mrp > 0 ? max(0, min(100, (int)round((1 - $price / $mrp) * 100))) : 0;
    $arr = static function ($v, $fallback = []) {
        if ($v === null) return $fallback;
        if (is_array($v)) return array_values(array_filter(array_map('strval', $v), fn($x) => trim($x) !== ''));
        return array_values(array_filter(array_map('trim', preg_split('/[,\\n]+/', (string)$v)), fn($x) => $x !== ''));
    };
    return [
        'name' => $name,
        'brand' => trim((string)($d['brand'] ?? $existing['brand'] ?? 'AYESHA®')),
        'category' => $category,
        'subcategory' => trim((string)($d['subcategory'] ?? $existing['subcategory'] ?? '')),
        'price' => $price,
        'mrp' => $mrp,
        'discount' => $discount,
        'rating' => max(0, min(5, (float)($d['rating'] ?? $existing['rating'] ?? 4.5))),
        'review_count' => max(0, (int)($d['review_count'] ?? $existing['review_count'] ?? 0)),
        'images' => $arr($d['images'] ?? null, $existing ? json_decode($existing['images'], true) ?: [] : []),
        'colors' => $arr($d['colors'] ?? null, $existing ? json_decode($existing['colors'], true) ?: [] : []),
        'sizes' => $arr($d['sizes'] ?? null, $existing ? json_decode($existing['sizes'], true) ?: [] : []),
        'fit' => trim((string)($d['fit'] ?? $existing['fit'] ?? 'REGULAR FIT')),
        'stock' => max(0, (int)($d['stock'] ?? $existing['stock'] ?? 0)),
        'description' => trim((string)($d['description'] ?? $existing['description'] ?? '')),
        'tags' => $arr($d['tags'] ?? null, $existing ? json_decode($existing['tags'], true) ?: [] : []),
    ];
}

function dbProduct(array $row): array {
    foreach (['images','colors','sizes','tags'] as $k) $row[$k] = json_decode($row[$k] ?? '[]', true) ?: [];
    return $row;
}
