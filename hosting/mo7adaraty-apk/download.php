<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

$map = ['github' => 'github_url', 'googleDrive' => 'google_drive_url', 'mediaFire' => 'mediafire_url'];
$mirror = $_GET['mirror'] ?? '';
if (!isset($map[$mirror])) { http_response_code(400); exit('مصدر التنزيل غير صالح.'); }
$release = latest_release();
$url = $release ? valid_url($release[$map[$mirror]]) : null;
if (!$url) { http_response_code(404); exit('رابط التنزيل غير متاح حالياً.'); }

$stmt = db()->prepare('INSERT INTO download_events (release_id, mirror) VALUES (?, ?)');
$stmt->execute([(int)$release['id'], $mirror]);
header('Location: ' . $url, true, 302);
exit;
