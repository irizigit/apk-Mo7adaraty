<?php
declare(strict_types=1);
require __DIR__ . '/layout.php'; require_admin();
$message = $error = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $versionName = trim((string)($_POST['version_name'] ?? ''));
    $versionCode = filter_var($_POST['version_code'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    $changelog = trim((string)($_POST['changelog'] ?? ''));
    $github = valid_url($_POST['github_url'] ?? null);
    $drive = valid_url($_POST['google_drive_url'] ?? null);
    $mediafire = valid_url($_POST['mediafire_url'] ?? null);
    $force = !empty($_POST['force_update']) ? 1 : 0;
    $publish = !empty($_POST['publish']) ? 1 : 0;
    if (!preg_match('/^\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?$/', $versionName) || !$versionCode || $changelog === '' || !$github) {
        $error = 'أدخل اسم إصدار بصيغة 1.2.3 ورقم بناء صحيح وسجل تغييرات ورابط GitHub Releases HTTPS.';
    } else {
        try {
            $stmt = db()->prepare('INSERT INTO app_releases (version_name, version_code, changelog, github_url, google_drive_url, mediafire_url, force_update, is_published, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
            $stmt->execute([$versionName, $versionCode, $changelog, $github, $drive, $mediafire, $force, $publish, $publish ? date('Y-m-d H:i:s') : null]);
            if ($publish) { $release = latest_release(); if ($release) write_version_json($release); }
            $message = $publish ? 'نُشر الإصدار وتم تحديث version.json.' : 'حُفظ الإصدار كمسودة.';
        } catch (Throwable $e) { $error = 'تعذر الحفظ. تأكد من عدم تكرار رقم الإصدار أو رقم البناء.'; }
    }
}
$releases = db()->query('SELECT * FROM app_releases ORDER BY version_code DESC')->fetchAll();
admin_head('إدارة الإصدارات');
?>
<h1>الإصدارات وروابط التنزيل</h1><?php if($message): ?><p class="notice"><?= e($message) ?></p><?php endif; ?><?php if($error): ?><p class="error"><?= e($error) ?></p><?php endif; ?>
<section class="card"><h2>إضافة إصدار</h2><form method="post"><input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>"><div class="grid"><div><label>اسم الإصدار</label><input class="field" name="version_name" placeholder="1.1.0" required></div><div><label>رقم البناء</label><input class="field" type="number" min="1" name="version_code" placeholder="2" required></div></div><label>سجل التغييرات</label><textarea class="field" name="changelog" rows="5" required></textarea><label>رابط GitHub Releases (أساسي)</label><input class="field" type="url" name="github_url" placeholder="https://github.com/..." required><label>رابط Google Drive (اختياري)</label><input class="field" type="url" name="google_drive_url" placeholder="https://drive.google.com/..." ><label>رابط MediaFire (اختياري)</label><input class="field" type="url" name="mediafire_url" placeholder="https://www.mediafire.com/..." ><p><label><input type="checkbox" name="force_update"> اجعل التحديث إلزامياً</label><label><input type="checkbox" name="publish" checked> انشر الإصدار الآن</label></p><button class="button" type="submit">حفظ الإصدار</button></form></section>
<section class="card"><h2>السجل</h2><table class="table"><thead><tr><th>الإصدار</th><th>البناء</th><th>الحالة</th><th>المرايا</th></tr></thead><tbody><?php foreach($releases as $r): ?><tr><td>v<?= e($r['version_name']) ?></td><td><?= (int)$r['version_code'] ?></td><td><?= $r['is_published'] ? 'منشور' : 'مسودة' ?></td><td><?= $r['google_drive_url'] ? 3 : ($r['mediafire_url'] ? 2 : 1) ?></td></tr><?php endforeach; ?></tbody></table></section>
<?php admin_foot(); ?>
