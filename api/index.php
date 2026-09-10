<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';

session_name('ayesha_admin');
session_set_cookie_params([
    'httponly' => true,
    'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    'samesite' => 'Lax',
    'path' => '/',
]);
session_start();

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Referrer-Policy: strict-origin-when-cross-origin');

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$path = trim(parse_url($_SERVER['REQUEST_URI'] ?? '/api', PHP_URL_PATH), '/');
$prefix = 'api';
if (str_starts_with($path, $prefix . '/')) $path = substr($path, strlen($prefix) + 1);
elseif ($path === $prefix) $path = '';
$parts = $path === '' ? [] : explode('/', $path);
$route = $parts[0] ?? '';
$id = isset($parts[1]) && ctype_digit($parts[1]) ? (int)$parts[1] : null;

try {
    if ($route === 'session' && $method === 'GET') {
        jsonResponse([
            'authenticated' => !empty($_SESSION['admin_id']),
            'user' => !empty($_SESSION['admin_id']) ? ['id' => (int)$_SESSION['admin_id'], 'email' => $_SESSION['admin_email']] : null,
        ]);
    }

    if ($route === 'login' && $method === 'POST') {
        $d = inputJson();
        $email = strtolower(trim((string)($d['email'] ?? '')));
        $password = (string)($d['password'] ?? '');
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') jsonResponse(['message' => 'Enter a valid email and password.'], 422);
        $stmt = db()->prepare('SELECT id, email, password_hash FROM admin_users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $admin = $stmt->fetch();
        if (!$admin || !password_verify($password, $admin['password_hash'])) {
            usleep(250000);
            jsonResponse(['message' => 'Incorrect email or password.'], 401);
        }
        session_regenerate_id(true);
        $_SESSION['admin_id'] = (int)$admin['id'];
        $_SESSION['admin_email'] = $admin['email'];
        jsonResponse(['authenticated' => true, 'user' => ['id' => (int)$admin['id'], 'email' => $admin['email']]]);
    }

    if ($route === 'logout' && $method === 'POST') {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $p = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'] ?? '', $p['secure'], $p['httponly']);
        }
        session_destroy();
        jsonResponse(['ok' => true]);
    }

    if ($route === 'products' && $method === 'GET') {
        $rows = db()->query('SELECT * FROM products ORDER BY created_at DESC, id DESC')->fetchAll();
        jsonResponse(array_map('dbProduct', $rows));
    }

    if ($route === 'products' && $method === 'POST') {
        requireAdmin();
        $p = productPayload(inputJson());
        $sql = 'INSERT INTO products (name,brand,category,subcategory,price,mrp,discount,rating,review_count,images,colors,sizes,fit,stock,description,tags)
                VALUES (:name,:brand,:category,:subcategory,:price,:mrp,:discount,:rating,:review_count,:images,:colors,:sizes,:fit,:stock,:description,:tags)';
        $stmt = db()->prepare($sql);
        $stmt->execute([
            ':name'=>$p['name'], ':brand'=>$p['brand'], ':category'=>$p['category'], ':subcategory'=>$p['subcategory'],
            ':price'=>$p['price'], ':mrp'=>$p['mrp'], ':discount'=>$p['discount'], ':rating'=>$p['rating'],
            ':review_count'=>$p['review_count'], ':images'=>json_encode($p['images']), ':colors'=>json_encode($p['colors']),
            ':sizes'=>json_encode($p['sizes']), ':fit'=>$p['fit'], ':stock'=>$p['stock'], ':description'=>$p['description'],
            ':tags'=>json_encode($p['tags'])
        ]);
        $newId = (int)db()->lastInsertId();
        $stmt = db()->prepare('SELECT * FROM products WHERE id = ?');
        $stmt->execute([$newId]);
        jsonResponse(dbProduct($stmt->fetch()), 201);
    }

    if ($route === 'products' && $id !== null && $method === 'PATCH') {
        requireAdmin();
        $stmt = db()->prepare('SELECT * FROM products WHERE id = ?');
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) jsonResponse(['message' => 'Product not found.'], 404);
        $p = productPayload(inputJson(), $existing);
        $sql = 'UPDATE products SET name=:name,brand=:brand,category=:category,subcategory=:subcategory,price=:price,mrp=:mrp,discount=:discount,rating=:rating,review_count=:review_count,images=:images,colors=:colors,sizes=:sizes,fit=:fit,stock=:stock,description=:description,tags=:tags WHERE id=:id';
        $stmt = db()->prepare($sql);
        $stmt->execute([
            ':name'=>$p['name'], ':brand'=>$p['brand'], ':category'=>$p['category'], ':subcategory'=>$p['subcategory'],
            ':price'=>$p['price'], ':mrp'=>$p['mrp'], ':discount'=>$p['discount'], ':rating'=>$p['rating'],
            ':review_count'=>$p['review_count'], ':images'=>json_encode($p['images']), ':colors'=>json_encode($p['colors']),
            ':sizes'=>json_encode($p['sizes']), ':fit'=>$p['fit'], ':stock'=>$p['stock'], ':description'=>$p['description'],
            ':tags'=>json_encode($p['tags']), ':id'=>$id
        ]);
        $stmt = db()->prepare('SELECT * FROM products WHERE id = ?');
        $stmt->execute([$id]);
        jsonResponse(dbProduct($stmt->fetch()));
    }

    if ($route === 'products' && $id !== null && $method === 'DELETE') {
        requireAdmin();
        $stmt = db()->prepare('DELETE FROM products WHERE id = ?');
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) jsonResponse(['message' => 'Product not found.'], 404);
        jsonResponse(['ok' => true]);
    }

    if ($route === 'upload' && $method === 'POST') {
        requireAdmin();
        if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) jsonResponse(['message' => 'Choose an image to upload.'], 422);
        $file = $_FILES['file'];
        if ($file['size'] > 5 * 1024 * 1024) jsonResponse(['message' => 'Image must be 5 MB or smaller.'], 422);
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($file['tmp_name']);
        $allowed = ['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp','image/gif'=>'gif'];
        if (!isset($allowed[$mime])) jsonResponse(['message' => 'Only JPG, PNG, WEBP or GIF images are allowed.'], 422);
        $dir = __DIR__ . '/uploads/products';
        if (!is_dir($dir)) mkdir($dir, 0755, true);
        $filename = bin2hex(random_bytes(16)) . '.' . $allowed[$mime];
        if (!move_uploaded_file($file['tmp_name'], $dir . '/' . $filename)) jsonResponse(['message' => 'Could not save image.'], 500);
        jsonResponse(['url' => '/api/uploads/products/' . $filename]);
    }

    jsonResponse(['message' => 'Route not found.'], 404);
} catch (PDOException $e) {
    error_log($e->getMessage());
    jsonResponse(['message' => 'Database error. Check api/config.php and the MySQL database.'], 500);
} catch (Throwable $e) {
    error_log($e->getMessage());
    jsonResponse(['message' => 'Server error. Please try again.'], 500);
}
