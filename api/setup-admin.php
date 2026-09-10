<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';

$message = '';
$error = '';
try {
    $count = (int)db()->query('SELECT COUNT(*) FROM admin_users')->fetchColumn();
    if ($count > 0) {
        $message = 'An admin account already exists. For security, this setup page is now disabled.';
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $email = strtolower(trim((string)($_POST['email'] ?? '')));
        $password = (string)($_POST['password'] ?? '');
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) throw new RuntimeException('Enter a valid email.');
        if (strlen($password) < 8) throw new RuntimeException('Password must be at least 8 characters.');
        $stmt = db()->prepare('INSERT INTO admin_users (email,password_hash) VALUES (?,?)');
        $stmt->execute([$email, password_hash($password, PASSWORD_DEFAULT)]);
        $message = 'Admin account created successfully. Delete or rename api/setup-admin.php now, then use /admin/login.';
    }
} catch (Throwable $e) { $error = $e->getMessage(); }
?><!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ayesha Collection — Admin Setup</title><style>
body{font-family:Arial,sans-serif;background:#fff7fa;margin:0;display:grid;place-items:center;min-height:100vh;color:#222}.card{background:#fff;width:min(420px,calc(100% - 32px));padding:32px;border:1px solid #eadbe2;border-radius:16px;box-shadow:0 12px 40px #00000012}h1{margin:0 0 8px;font-size:25px}p{color:#666;line-height:1.5}label{display:block;margin:18px 0 6px;font-weight:600}input{width:100%;box-sizing:border-box;padding:13px;border:1px solid #ccc;border-radius:8px;font-size:15px}button{margin-top:20px;width:100%;padding:14px;border:0;border-radius:8px;background:#c9115b;color:#fff;font-weight:700;cursor:pointer}.msg{padding:12px;background:#f1f8f3;color:#24633c;border-radius:8px}.err{padding:12px;background:#fff0f0;color:#9b1c1c;border-radius:8px}
</style></head><body><div class="card"><h1>Ayesha Collection</h1><p><b>Admin setup</b><br>Create the first client administrator. Passwords are stored securely as hashes.</p><?php if($message): ?><div class="msg"><?=htmlspecialchars($message)?></div><?php elseif($error): ?><div class="err"><?=htmlspecialchars($error)?></div><form method="post"><label>Email</label><input name="email" type="email" required><label>Password</label><input name="password" type="password" minlength="8" required><button>Create Admin</button></form><?php else: ?><form method="post"><label>Email</label><input name="email" type="email" required><label>Password</label><input name="password" type="password" minlength="8" required><button>Create Admin</button></form><?php endif; ?></div></body></html>
