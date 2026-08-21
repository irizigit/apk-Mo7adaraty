<?php
declare(strict_types=1);
require __DIR__ . '/layout.php'; require_admin();
$message = $error = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf(); $title = trim((string)($_POST['title'] ?? '')); $body = trim((string)($_POST['body'] ?? '')); $url = valid_url($_POST['action_url'] ?? null);
    if ($title === '' || mb_strlen($title) > 120 || $body === '' || mb_strlen($body) > 500) $error = 'العنوان أو النص غير صالح.';
    else { db()->exec('UPDATE announcements SET is_active = 0 WHERE is_active = 1'); db()->prepare('INSERT INTO announcements (title, body, action_url, is_active) VALUES (?, ?, ?, 1)')->execute([$title, $body, $url]); $message = 'نُشر الإعلان داخل التطبيق.'; }
}
$announcements = db()->query('SELECT * FROM announcements ORDER BY id DESC LIMIT 20')->fetchAll(); admin_head('إعلانات داخل التطبيق');
?>
<h1>إعلانات داخل التطبيق</h1><p class="small">يظهر الإعلان للمستخدم عند فتح التطبيق، حتى إن كان قد رفض الإشعارات الفورية.</p><?php if($message): ?><p class="notice"><?= e($message) ?></p><?php endif; ?><?php if($error): ?><p class="error"><?= e($error) ?></p><?php endif; ?><section class="card"><form method="post"><input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>"><label>العنوان</label><input class="field" name="title" maxlength="120" required><label>النص</label><textarea class="field" name="body" rows="4" maxlength="500" required></textarea><label>رابط الإجراء (اختياري)</label><input class="field" type="url" name="action_url" placeholder="https://..."><p><button class="button">نشر الإعلان</button></p></form></section><section class="card"><table class="table"><thead><tr><th>العنوان</th><th>الحالة</th><th>التاريخ</th></tr></thead><tbody><?php foreach($announcements as $a): ?><tr><td><?= e($a['title']) ?></td><td><?= $a['is_active'] ? 'نشط' : 'مؤرشف' ?></td><td><?= e($a['created_at']) ?></td></tr><?php endforeach; ?></tbody></table></section>
<?php admin_foot(); ?>
