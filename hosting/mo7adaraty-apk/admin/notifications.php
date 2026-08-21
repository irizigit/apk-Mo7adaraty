<?php
declare(strict_types=1);
require __DIR__ . '/layout.php'; require_admin();

function send_expo_batch(array $tokens, string $title, string $body, ?string $url): array {
    $payload = array_map(static fn(string $token): array => [
        'to' => $token, 'sound' => 'default', 'title' => $title, 'body' => $body,
        'data' => $url ? ['url' => $url] : new stdClass(), 'priority' => 'high',
    ], $tokens);
    $headers = ['Accept: application/json', 'Accept-Encoding: gzip, deflate', 'Content-Type: application/json'];
    $accessToken = trim((string)(app_config()['expo_access_token'] ?? ''));
    if ($accessToken !== '') $headers[] = 'Authorization: Bearer ' . $accessToken;
    $curl = curl_init('https://exp.host/--/api/v2/push/send');
    curl_setopt_array($curl, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => $headers, CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_SLASHES), CURLOPT_TIMEOUT => 20]);
    $raw = curl_exec($curl); $http = (int)curl_getinfo($curl, CURLINFO_HTTP_CODE); curl_close($curl);
    $data = is_string($raw) ? json_decode($raw, true) : null;
    if ($http < 200 || $http >= 300 || !is_array($data)) return [0, count($tokens)];
    $accepted = 0; $errors = 0;
    foreach (($data['data'] ?? []) as $result) { ($result['status'] ?? '') === 'ok' ? $accepted++ : $errors++; }
    return [$accepted, $errors];
}

$message = $error = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $title = trim((string)($_POST['title'] ?? '')); $body = trim((string)($_POST['body'] ?? '')); $url = valid_url($_POST['action_url'] ?? null);
    if ($title === '' || mb_strlen($title) > 120 || $body === '' || mb_strlen($body) > 500) {
        $error = 'العنوان أو النص غير صالح.';
    } elseif (!function_exists('curl_init')) {
        $error = 'خدمة cURL غير متاحة في هذه الاستضافة، لذلك لا يمكن إرسال الإشعار الآن.';
    } else {
        $tokens = db()->query('SELECT expo_push_token FROM installations WHERE notifications_allowed = 1 AND expo_push_token IS NOT NULL')->fetchAll(PDO::FETCH_COLUMN);
        $accepted = 0; $errors = 0;
        foreach (array_chunk($tokens, 100) as $chunk) { [$ok, $failed] = send_expo_batch($chunk, $title, $body, $url); $accepted += $ok; $errors += $failed; }
        db()->prepare('INSERT INTO notification_batches (title, body, target_count, accepted_count, error_count) VALUES (?, ?, ?, ?, ?)')->execute([$title, $body, count($tokens), $accepted, $errors]);
        $message = "تمت معالجة " . count($tokens) . " رمز إشعار؛ قبلت الخدمة $accepted رسالة وسجلت $errors أخطاء أولية.";
    }
}
$batches = db()->query('SELECT * FROM notification_batches ORDER BY id DESC LIMIT 20')->fetchAll();
$subscribed = (int)db()->query('SELECT COUNT(*) FROM installations WHERE notifications_allowed = 1 AND expo_push_token IS NOT NULL')->fetchColumn();
admin_head('إشعارات فورية');
?>
<h1>إشعارات فورية</h1><p class="small">سيصل الإشعار إلى الأجهزة التي منحت الإذن وسجلت رمز الإشعار. لا يضمن قبول خدمة الإرسال وصول الإشعار فعلياً إلى جهاز مغلق أو غير متصل.</p><section class="card"><strong><?= number_format($subscribed) ?></strong> جهازاً قابلاً للاستهداف حالياً.</section><?php if($message): ?><p class="notice"><?= e($message) ?></p><?php endif; ?><?php if($error): ?><p class="error"><?= e($error) ?></p><?php endif; ?><section class="card"><form method="post"><input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>"><label>عنوان الإشعار</label><input class="field" name="title" maxlength="120" required><label>النص</label><textarea class="field" name="body" rows="4" maxlength="500" required></textarea><label>رابط يفتح عند الضغط (اختياري)</label><input class="field" type="url" name="action_url" placeholder="https://..."><p><button class="button" type="submit">إرسال الآن</button></p></form></section><section class="card"><h2>سجل الإرسال</h2><table class="table"><thead><tr><th>العنوان</th><th>المستهدف</th><th>قبول أولي</th><th>أخطاء</th><th>التاريخ</th></tr></thead><tbody><?php foreach($batches as $b): ?><tr><td><?= e($b['title']) ?></td><td><?= (int)$b['target_count'] ?></td><td><?= (int)$b['accepted_count'] ?></td><td><?= (int)$b['error_count'] ?></td><td><?= e($b['created_at']) ?></td></tr><?php endforeach; ?></tbody></table></section>
<?php admin_foot(); ?>
