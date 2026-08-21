<?php
declare(strict_types=1);
require dirname(__DIR__) . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') api_json(['error' => 'method_not_allowed'], 405);
$body = file_get_contents('php://input', false, null, 0, 32768);
$input = json_decode($body ?: '', true);
if (!is_array($input)) api_json(['error' => 'invalid_json'], 400);

$installationId = strtolower(trim((string)($input['installationId'] ?? '')));
$versionCode = filter_var($input['versionCode'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
$notificationsAllowed = !empty($input['notificationsAllowed']) ? 1 : 0;
$pushToken = trim((string)($input['expoPushToken'] ?? ''));
if (!preg_match('/^[a-f0-9-]{16,64}$/', $installationId) || !$versionCode) api_json(['error' => 'invalid_request'], 422);
if ($pushToken !== '' && (!preg_match('/^Expo(?:nent)?PushToken\[[^\]]+\]$/', $pushToken) || strlen($pushToken) > 255)) api_json(['error' => 'invalid_push_token'], 422);

$hash = hash_hmac('sha256', $installationId, app_config()['analytics_salt']);
$token = $notificationsAllowed && $pushToken !== '' ? $pushToken : null;
$sql = 'INSERT INTO installations (installation_hash, app_version_code, notifications_allowed, expo_push_token) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE app_version_code = VALUES(app_version_code), notifications_allowed = VALUES(notifications_allowed), expo_push_token = VALUES(expo_push_token), last_seen_at = CURRENT_TIMESTAMP';
db()->prepare($sql)->execute([$hash, $versionCode, $notificationsAllowed, $token]);
api_json(['ok' => true]);
