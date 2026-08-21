<?php
declare(strict_types=1);
require __DIR__ . '/layout.php'; require_admin();
$pdo = db();
$stats = [
  'downloads' => (int)$pdo->query('SELECT COUNT(*) FROM download_events')->fetchColumn(),
  'active' => (int)$pdo->query("SELECT COUNT(*) FROM installations WHERE last_seen_at >= (NOW() - INTERVAL 30 DAY)")->fetchColumn(),
  'push_enabled' => (int)$pdo->query('SELECT COUNT(*) FROM installations WHERE notifications_allowed = 1 AND expo_push_token IS NOT NULL')->fetchColumn(),
  'releases' => (int)$pdo->query('SELECT COUNT(*) FROM app_releases WHERE is_published = 1')->fetchColumn(),
];
$recentDownloads = $pdo->query("SELECT DATE(created_at) AS day, COUNT(*) AS total FROM download_events WHERE created_at >= (CURDATE() - INTERVAL 6 DAY) GROUP BY DATE(created_at) ORDER BY day DESC")->fetchAll();
$latest = latest_release();
admin_head('ملخص الإدارة');
?>
<h1>مرحباً <?= e($_SESSION['admin_name'] ?? 'مدير') ?></h1><p class="small">هذه البيانات تعتمد على نقرات التنزيل والأجهزة التي وافقت على قياس نشاط مجهول.</p>
<section class="grid"><article class="card"><div class="metric"><?= number_format($stats['downloads']) ?></div><div class="small">نقرات التنزيل</div></article><article class="card"><div class="metric"><?= number_format($stats['active']) ?></div><div class="small">أجهزة نشطة (30 يوماً)</div></article><article class="card"><div class="metric"><?= number_format($stats['push_enabled']) ?></div><div class="small">أجهزة تسمح بالإشعارات</div></article><article class="card"><div class="metric"><?= number_format($stats['releases']) ?></div><div class="small">إصدارات منشورة</div></article></section>
<section class="card"><h2>الإصدار المنشور</h2><?php if($latest): ?><p><strong>v<?= e($latest['version_name']) ?></strong> · build <?= (int)$latest['version_code'] ?> · <?= $latest['force_update'] ? 'تحديث إلزامي' : 'تحديث اختياري' ?></p><?php else: ?><p>لا يوجد إصدار منشور بعد. <a href="releases.php">أضف إصداراً</a></p><?php endif; ?></section>
<section class="card"><h2>تنزيلات آخر 7 أيام</h2><table class="table"><thead><tr><th>التاريخ</th><th>النقرات</th></tr></thead><tbody><?php foreach($recentDownloads as $row): ?><tr><td><?= e($row['day']) ?></td><td><?= (int)$row['total'] ?></td></tr><?php endforeach; ?></tbody></table></section>
<?php admin_foot(); ?>
