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

if (str_starts_with($path, $prefix . '/')) {
    $path = substr($path, strlen($prefix) + 1);
} elseif ($path === $prefix) {
    $path = '';
}

$parts = $path === '' ? [] : explode('/', $path);
$route = $parts[0] ?? '';
$id = isset($parts[1]) && ctype_digit($parts[1]) ? (int)$parts[1] : null;

try {
    if ($route === 'session' && $method === 'GET') {
        jsonResponse([
            'authenticated' => !empty($_SESSION['admin_id']),
            'user' => !empty($_SESSION['admin_id'])
                ? ['id' => (int)$_SESSION['admin_id'], 'email' => $_SESSION['admin_email']]
                : null,
        ]);
    }

    if ($route === 'login' && $method === 'POST') {
        $d = inputJson();
        $email = strtolower(trim((string)($d['email'] ?? '')));
        $password = (string)($d['password'] ?? '');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
            jsonResponse(['message' => 'Enter a valid email and password.'], 422);
        }

        $stmt = db()->prepare(
            'SELECT id, email, password_hash FROM admin_users WHERE email = ? LIMIT 1'
        );
        $stmt->execute([$email]);
        $admin = $stmt->fetch();

        if (!$admin || !password_verify($password, $admin['password_hash'])) {
            usleep(250000);
            jsonResponse(['message' => 'Incorrect email or password.'], 401);
        }

        session_regenerate_id(true);
        $_SESSION['admin_id'] = (int)$admin['id'];
        $_SESSION['admin_email'] = $admin['email'];

        jsonResponse([
            'authenticated' => true,
            'user' => [
                'id' => (int)$admin['id'],
                'email' => $admin['email']
            ]
        ]);
    }

    if ($route === 'logout' && $method === 'POST') {
        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $p = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $p['path'],
                $p['domain'] ?? '',
                $p['secure'],
                $p['httponly']
            );
        }

        session_destroy();
        jsonResponse(['ok' => true]);
    }

    /* PRODUCTS */

    if ($route === 'products' && $method === 'GET') {
        $rows = db()
            ->query('SELECT * FROM products ORDER BY created_at DESC, id DESC')
            ->fetchAll();

        jsonResponse(array_map('dbProduct', $rows));
    }

    if ($route === 'products' && $method === 'POST') {
        requireAdmin();

        $p = productPayload(inputJson());

        $stmt = db()->prepare(
            'INSERT INTO products
            (name,brand,category,subcategory,price,mrp,discount,rating,review_count,
             images,colors,sizes,fit,stock,description,tags)
            VALUES
            (:name,:brand,:category,:subcategory,:price,:mrp,:discount,:rating,:review_count,
             :images,:colors,:sizes,:fit,:stock,:description,:tags)'
        );

        $stmt->execute([
            ':name' => $p['name'],
            ':brand' => $p['brand'],
            ':category' => $p['category'],
            ':subcategory' => $p['subcategory'],
            ':price' => $p['price'],
            ':mrp' => $p['mrp'],
            ':discount' => $p['discount'],
            ':rating' => $p['rating'],
            ':review_count' => $p['review_count'],
            ':images' => json_encode($p['images']),
            ':colors' => json_encode($p['colors']),
            ':sizes' => json_encode($p['sizes']),
            ':fit' => $p['fit'],
            ':stock' => $p['stock'],
            ':description' => $p['description'],
            ':tags' => json_encode($p['tags'])
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

        if (!$existing) {
            jsonResponse(['message' => 'Product not found.'], 404);
        }

        $p = productPayload(inputJson(), $existing);

        $stmt = db()->prepare(
            'UPDATE products SET
             name=:name,brand=:brand,category=:category,subcategory=:subcategory,
             price=:price,mrp=:mrp,discount=:discount,rating=:rating,
             review_count=:review_count,images=:images,colors=:colors,sizes=:sizes,
             fit=:fit,stock=:stock,description=:description,tags=:tags
             WHERE id=:id'
        );

        $stmt->execute([
            ':name' => $p['name'],
            ':brand' => $p['brand'],
            ':category' => $p['category'],
            ':subcategory' => $p['subcategory'],
            ':price' => $p['price'],
            ':mrp' => $p['mrp'],
            ':discount' => $p['discount'],
            ':rating' => $p['rating'],
            ':review_count' => $p['review_count'],
            ':images' => json_encode($p['images']),
            ':colors' => json_encode($p['colors']),
            ':sizes' => json_encode($p['sizes']),
            ':fit' => $p['fit'],
            ':stock' => $p['stock'],
            ':description' => $p['description'],
            ':tags' => json_encode($p['tags']),
            ':id' => $id
        ]);

        $stmt = db()->prepare('SELECT * FROM products WHERE id = ?');
        $stmt->execute([$id]);

        jsonResponse(dbProduct($stmt->fetch()));
    }

    if ($route === 'products' && $id !== null && $method === 'DELETE') {
        requireAdmin();

        $stmt = db()->prepare('DELETE FROM products WHERE id = ?');
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            jsonResponse(['message' => 'Product not found.'], 404);
        }

        jsonResponse(['ok' => true]);
    }

    /* CREATE ORDER */

    if ($route === 'orders' && $method === 'POST') {
        $data = inputJson();

        $customerToken = trim((string)($data['customer_token'] ?? ''));
        $name = trim((string)($data['name'] ?? ''));
        $phone = trim((string)($data['phone'] ?? ''));
        $email = trim((string)($data['email'] ?? ''));
        $address = trim((string)($data['address'] ?? ''));
        $city = trim((string)($data['city'] ?? ''));
        $state = trim((string)($data['state'] ?? ''));
        $pin = trim((string)($data['pin'] ?? ''));
        $paymentMethod = trim((string)($data['payment'] ?? 'COD'));
        $items = $data['items'] ?? [];

        if (!preg_match('/^[a-f0-9-]{36}$/i', $customerToken)) {
            jsonResponse(['message' => 'Invalid customer session.'], 422);
        }

        if (
            strlen($name) < 2 ||
            !preg_match('/^\+91\s\d{10}$/', $phone) ||
            strlen($address) < 8 ||
            strlen($city) < 2 ||
            strlen($state) < 2 ||
            !preg_match('/^\d{6}$/', $pin)
        ) {
            jsonResponse(['message' => 'Please provide valid delivery details.'], 422);
        }

        if (!is_array($items) || count($items) === 0) {
            jsonResponse(['message' => 'Your cart is empty.'], 422);
        }

        $pdo = db();

        try {
            $pdo->beginTransaction();

            $stmt = $pdo->prepare(
                'SELECT id FROM customers WHERE customer_token = ? LIMIT 1'
            );
            $stmt->execute([$customerToken]);
            $customer = $stmt->fetch();

            if ($customer) {
                $customerId = (int)$customer['id'];

                $stmt = $pdo->prepare(
                    'UPDATE customers SET name=?, phone=?, email=? WHERE id=?'
                );
                $stmt->execute([
                    $name,
                    $phone,
                    $email !== '' ? $email : null,
                    $customerId
                ]);
            } else {
                $stmt = $pdo->prepare(
                    'INSERT INTO customers (customer_token,name,phone,email)
                     VALUES (?,?,?,?)'
                );
                $stmt->execute([
                    $customerToken,
                    $name,
                    $phone,
                    $email !== '' ? $email : null
                ]);
                $customerId = (int)$pdo->lastInsertId();
            }

            $preparedItems = [];
            $subtotal = 0.0;

            foreach ($items as $item) {
                $productId = (int)($item['product_id'] ?? 0);
                $quantity = (int)($item['quantity'] ?? 0);
                $size = trim((string)($item['size'] ?? ''));
                $color = trim((string)($item['color'] ?? ''));

                if ($productId <= 0 || $quantity <= 0 || $quantity > 99) {
                    throw new RuntimeException('Invalid product quantity.');
                }

                $stmt = $pdo->prepare(
                    'SELECT id,name,brand,images,price,stock
                     FROM products WHERE id = ? FOR UPDATE'
                );
                $stmt->execute([$productId]);
                $product = $stmt->fetch();

                if (!$product) {
                    throw new RuntimeException(
                        'One of the products is no longer available.'
                    );
                }

                $stock = (int)$product['stock'];

                if ($stock < $quantity) {
                    throw new RuntimeException(
                        $product['name'] . ' has only ' . $stock . ' item(s) left in stock.'
                    );
                }

                $unitPrice = (float)$product['price'];
                $lineTotal = $unitPrice * $quantity;
                $subtotal += $lineTotal;

                $images = json_decode($product['images'] ?? '[]', true);
                $image = is_array($images) && !empty($images[0])
                    ? $images[0]
                    : null;

                $preparedItems[] = [
                    'product_id' => $productId,
                    'product_name' => $product['name'],
                    'product_brand' => $product['brand'],
                    'product_image' => $image,
                    'size' => $size,
                    'color' => $color,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'line_total' => $lineTotal,
                ];
            }

            $discount = 0.0;
            $deliveryCharge = 0.0;
            $total = $subtotal;

            $orderNumber =
                'AY' . date('ymd') .
                strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));

            $paymentStatus =
                strtolower($paymentMethod) === 'cash on delivery'
                ? 'COD'
                : 'Pending';

            $stmt = $pdo->prepare(
                'INSERT INTO orders
                (order_number,customer_id,customer_name,customer_phone,address,city,state,pin,
                 subtotal,discount,delivery_charge,total,payment_method,payment_status,status)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
            );

            $stmt->execute([
                $orderNumber,
                $customerId,
                $name,
                $phone,
                $address,
                $city,
                $state,
                $pin,
                $subtotal,
                $discount,
                $deliveryCharge,
                $total,
                $paymentMethod,
                $paymentStatus,
                'Confirmed'
            ]);

            $orderId = (int)$pdo->lastInsertId();

            foreach ($preparedItems as $item) {
                $stmt = $pdo->prepare(
                    'INSERT INTO order_items
                    (order_id,product_id,product_name,product_brand,product_image,
                     size,color,quantity,unit_price,line_total)
                    VALUES (?,?,?,?,?,?,?,?,?,?)'
                );

                $stmt->execute([
                    $orderId,
                    $item['product_id'],
                    $item['product_name'],
                    $item['product_brand'],
                    $item['product_image'],
                    $item['size'],
                    $item['color'],
                    $item['quantity'],
                    $item['unit_price'],
                    $item['line_total']
                ]);

                $stmt = $pdo->prepare(
                    'UPDATE products
                     SET stock = stock - ?
                     WHERE id = ? AND stock >= ?'
                );

                $stmt->execute([
                    $item['quantity'],
                    $item['product_id'],
                    $item['quantity']
                ]);

                if ($stmt->rowCount() !== 1) {
                    throw new RuntimeException(
                        'Stock changed while placing the order. Please try again.'
                    );
                }
            }

            $pdo->commit();

            jsonResponse([
                'success' => true,
                'order' => getOrderForResponse($orderId, $pdo)
            ], 201);

        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }
    }

    /* CUSTOMER ORDERS */

    if ($route === 'orders' && $method === 'GET') {
        $customerToken = trim((string)($_GET['customer_token'] ?? ''));

        if (!preg_match('/^[a-f0-9-]{36}$/i', $customerToken)) {
            jsonResponse(['message' => 'Customer session required.'], 422);
        }

        $stmt = db()->prepare(
            'SELECT id FROM customers WHERE customer_token = ? LIMIT 1'
        );
        $stmt->execute([$customerToken]);
        $customer = $stmt->fetch();

        if (!$customer) {
            jsonResponse([]);
        }

        jsonResponse(
            getOrdersForCustomer((int)$customer['id'], db())
        );
    }

    /* ADMIN ORDERS */

    if ($route === 'admin-orders' && $method === 'GET') {
        requireAdmin();
        jsonResponse(getAllOrders(db()));
    }

    /* ADMIN ORDER STATUS */

    if ($route === 'orders' && $id !== null && $method === 'PATCH') {
        requireAdmin();

        $data = inputJson();
        $status = trim((string)($data['status'] ?? ''));

        $allowed = [
            'Confirmed',
            'Processing',
            'Packed',
            'Shipped',
            'Out for Delivery',
            'Delivered',
            'Cancelled'
        ];

        if (!in_array($status, $allowed, true)) {
            jsonResponse(['message' => 'Invalid order status.'], 422);
        }

        $pdo = db();

        try {
            $pdo->beginTransaction();

            $stmt = $pdo->prepare(
                'SELECT status FROM orders WHERE id = ? FOR UPDATE'
            );
            $stmt->execute([$id]);
            $order = $stmt->fetch();

            if (!$order) {
                $pdo->rollBack();
                jsonResponse(['message' => 'Order not found.'], 404);
            }

            $oldStatus = $order['status'];

            if ($oldStatus === 'Cancelled' && $status !== 'Cancelled') {
                $pdo->rollBack();
                jsonResponse([
                    'message' => 'A cancelled order cannot be reopened.'
                ], 409);
            }

            if ($status === 'Cancelled' && $oldStatus !== 'Cancelled') {
                $stmt = $pdo->prepare(
                    'SELECT product_id, quantity
                     FROM order_items WHERE order_id = ?'
                );
                $stmt->execute([$id]);

                foreach ($stmt->fetchAll() as $item) {
                    $restore = $pdo->prepare(
                        'UPDATE products SET stock = stock + ? WHERE id = ?'
                    );
                    $restore->execute([
                        (int)$item['quantity'],
                        (int)$item['product_id']
                    ]);
                }
            }

            $stmt = $pdo->prepare(
                'UPDATE orders SET status = ? WHERE id = ?'
            );
            $stmt->execute([$status, $id]);

            $pdo->commit();

            jsonResponse([
                'success' => true,
                'order' => getOrderForResponse($id, $pdo)
            ]);

        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }
    }

    /* IMAGE UPLOAD */

    if ($route === 'upload' && $method === 'POST') {
        requireAdmin();

        if (
            empty($_FILES['file']) ||
            $_FILES['file']['error'] !== UPLOAD_ERR_OK
        ) {
            jsonResponse(['message' => 'Choose an image to upload.'], 422);
        }

        $file = $_FILES['file'];

        if ($file['size'] > 5 * 1024 * 1024) {
            jsonResponse(['message' => 'Image must be 5 MB or smaller.'], 422);
        }

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($file['tmp_name']);

        $allowed = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/gif' => 'gif'
        ];

        if (!isset($allowed[$mime])) {
            jsonResponse([
                'message' => 'Only JPG, PNG, WEBP or GIF images are allowed.'
            ], 422);
        }

        $dir = __DIR__ . '/uploads/products';

        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $filename =
            bin2hex(random_bytes(16)) .
            '.' .
            $allowed[$mime];

        if (!move_uploaded_file(
            $file['tmp_name'],
            $dir . '/' . $filename
        )) {
            jsonResponse(['message' => 'Could not save image.'], 500);
        }

        jsonResponse([
            'url' => '/api/uploads/products/' . $filename
        ]);
    }

    jsonResponse(['message' => 'Route not found.'], 404);

} catch (PDOException $e) {
    error_log($e->getMessage());

    jsonResponse([
        'message' => 'Database error. Check api/config.php and the MySQL database.'
    ], 500);

} catch (Throwable $e) {
    error_log($e->getMessage());

    jsonResponse([
        'message' => $e->getMessage() ?: 'Server error. Please try again.'
    ], 500);
}

/* HELPERS */

function getOrderForResponse(int $orderId, PDO $pdo): array {
    $stmt = $pdo->prepare(
        'SELECT o.*, c.customer_token
         FROM orders o
         INNER JOIN customers c ON c.id = o.customer_id
         WHERE o.id = ? LIMIT 1'
    );
    $stmt->execute([$orderId]);

    $order = $stmt->fetch();

    if (!$order) {
        throw new RuntimeException('Order not found.');
    }

    $stmt = $pdo->prepare(
        'SELECT id,product_id,product_name,product_brand,product_image,
                size,color,quantity,unit_price,line_total
         FROM order_items
         WHERE order_id = ?
         ORDER BY id ASC'
    );
    $stmt->execute([$orderId]);

    return formatOrder($order, $stmt->fetchAll());
}

function getOrdersForCustomer(int $customerId, PDO $pdo): array {
    $stmt = $pdo->prepare(
        'SELECT o.*, c.customer_token
         FROM orders o
         INNER JOIN customers c ON c.id = o.customer_id
         WHERE o.customer_id = ?
         ORDER BY o.created_at DESC, o.id DESC'
    );
    $stmt->execute([$customerId]);

    $result = [];

    foreach ($stmt->fetchAll() as $order) {
        $itemStmt = $pdo->prepare(
            'SELECT id,product_id,product_name,product_brand,product_image,
                    size,color,quantity,unit_price,line_total
             FROM order_items
             WHERE order_id = ?
             ORDER BY id ASC'
        );
        $itemStmt->execute([(int)$order['id']]);

        $result[] = formatOrder($order, $itemStmt->fetchAll());
    }

    return $result;
}

function getAllOrders(PDO $pdo): array {
    $stmt = $pdo->query(
        'SELECT o.*, c.customer_token
         FROM orders o
         INNER JOIN customers c ON c.id = o.customer_id
         ORDER BY o.created_at DESC, o.id DESC'
    );

    $result = [];

    foreach ($stmt->fetchAll() as $order) {
        $itemStmt = $pdo->prepare(
            'SELECT id,product_id,product_name,product_brand,product_image,
                    size,color,quantity,unit_price,line_total
             FROM order_items
             WHERE order_id = ?
             ORDER BY id ASC'
        );
        $itemStmt->execute([(int)$order['id']]);

        $result[] = formatOrder($order, $itemStmt->fetchAll());
    }

    return $result;
}

function formatOrder(array $order, array $items): array {
    return [
        'id' => $order['order_number'],
        'databaseId' => (int)$order['id'],
        'date' => date('d/m/Y', strtotime($order['created_at'])),
        'createdAt' => $order['created_at'],

        'customer' => [
            'name' => $order['customer_name'],
            'phone' => $order['customer_phone'],
        ],

        'address' => [
            'name' => $order['customer_name'],
            'phone' => $order['customer_phone'],
            'address' => $order['address'],
            'city' => $order['city'],
            'state' => $order['state'],
            'pin' => $order['pin'],
        ],

        'items' => array_map(
            static function ($item) {
                return [
                    'product' => [
                        'id' => (int)$item['product_id'],
                        'name' => $item['product_name'],
                        'brand' => $item['product_brand'],
                        'images' => $item['product_image']
                            ? [$item['product_image']]
                            : [],
                    ],
                    'size' => $item['size'],
                    'color' => $item['color'],
                    'qty' => (int)$item['quantity'],
                    'price' => (float)$item['unit_price'],
                    'lineTotal' => (float)$item['line_total'],
                ];
            },
            $items
        ),

        'subtotal' => (float)$order['subtotal'],
        'discount' => (float)$order['discount'],
        'delivery' => (float)$order['delivery_charge'],
        'total' => (float)$order['total'],
        'payment' => $order['payment_method'],
        'paymentStatus' => $order['payment_status'],
        'status' => $order['status'],
    ];
}
