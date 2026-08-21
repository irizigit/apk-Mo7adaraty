<?php
declare(strict_types=1);
require dirname(__DIR__) . '/bootstrap.php';
begin_admin_session(); ensure_first_admin();
if (!empty($_SESSION['admin_id'])) { header('Location: index.php'); exit; }
$error = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $username = trim((string)($_POST['username'] ?? ''));
    $password = (string)($_POST['password'] ?? '');
    $stmt = db()->prepare('SELECT id, username, password_hash FROM admin_users WHERE username = ? LIMIT 1');
    $stmt->execute([$username]); $admin = $stmt->fetch();
    if ($admin && password_verify($password, $admin['password_hash'])) {
        session_regenerate_id(true); $_SESSION['admin_id'] = (int)$admin['id']; $_SESSION['admin_name'] = $admin['username'];
        header('Location: index.php'); exit;
    }
    $error = 'بيانات الدخول غير صحيحة.';
}
render_head('دخول إدارة محاضراتي');
?>
<main class="wrap" style="max-width:520px;padding-top:10vh"><section class="card"><h1>دخول لوحة الإدارة</h1><p class="small">استخدم الحساب الذي أُنشئ عند إعداد قاعدة البيانات. لا توجد أي كلمات مرور افتراضية.</p><?php if($error): ?><p class="error"><?= e($error) ?></p><?php endif; ?><form method="post"><input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>"><label>اسم المستخدم</label><input class="field" name="username" autocomplete="username" required maxlength="60"><label>كلمة المرور</label><input class="field" type="password" name="password" autocomplete="current-password" required><p><button class="button" type="submit">دخول آمن</button></p></form></section></main>
<?php render_foot(); ?>
