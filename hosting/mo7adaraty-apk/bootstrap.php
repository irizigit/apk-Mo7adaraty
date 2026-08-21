<?php
declare(strict_types=1);

const ROOT_DIR = __DIR__;
const CONFIG_FILE = ROOT_DIR . '/config/config.php';

function app_config(): array {
    static $config;
    if ($config !== null) return $config;
    if (!is_file(CONFIG_FILE)) {
        http_response_code(503);
        exit('يلزم إعداد config/config.php من القالب config.example.php.');
    }
    $config = require CONFIG_FILE;
    return $config;
}

function db(): PDO {
    static $pdo;
    if ($pdo instanceof PDO) return $pdo;
    $c = app_config();
    $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $c['db_host'], $c['db_name']);
    $pdo = new PDO($dsn, $c['db_user'], $c['db_pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    return $pdo;
}

function e(?string $value): string { return htmlspecialchars((string)$value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function is_https(): bool { return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https'; }
function absolute_url(string $path = ''): string { return rtrim(app_config()['base_url'], '/') . '/' . ltrim($path, '/'); }

function begin_admin_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    session_name('mo7adaraty_admin');
    session_set_cookie_params(['httponly' => true, 'secure' => is_https(), 'samesite' => 'Strict', 'path' => '/']);
    session_start();
}

function csrf_token(): string {
    begin_admin_session();
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}

function verify_csrf(): void {
    begin_admin_session();
    if (!hash_equals($_SESSION['csrf'] ?? '', $_POST['csrf'] ?? '')) {
        http_response_code(419); exit('انتهت صلاحية النموذج. أعد المحاولة.');
    }
}

function ensure_first_admin(): void {
    $exists = (int) db()->query('SELECT COUNT(*) FROM admin_users')->fetchColumn();
    if ($exists > 0) return;
    $c = app_config();
    if (empty($c['first_admin_password']) || str_contains($c['first_admin_password'], 'ضع_')) return;
    $stmt = db()->prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)');
    $stmt->execute([$c['first_admin_username'], password_hash($c['first_admin_password'], PASSWORD_DEFAULT)]);
}

function require_admin(): void {
    begin_admin_session();
    if (empty($_SESSION['admin_id'])) { header('Location: login.php'); exit; }
}

function api_json(array $data, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function valid_url(?string $url): ?string {
    $url = trim((string)$url);
    return $url !== '' && filter_var($url, FILTER_VALIDATE_URL) && str_starts_with($url, 'https://') ? $url : null;
}

function latest_release(): ?array {
    $stmt = db()->query('SELECT * FROM app_releases WHERE is_published = 1 ORDER BY version_code DESC LIMIT 1');
    return $stmt->fetch() ?: null;
}

function write_version_json(array $release): void {
    $payload = [
        'versionName' => $release['version_name'],
        'versionCode' => (int)$release['version_code'],
        'minSupportedVersionCode' => 1,
        'downloadPageUrl' => absolute_url('/'),
        'mirrors' => [
            'github' => $release['github_url'],
            'googleDrive' => $release['google_drive_url'] ?: null,
            'mediaFire' => $release['mediafire_url'] ?: null,
        ],
        'message' => $release['changelog'],
        'forceUpdate' => (bool)$release['force_update'],
        'publishedAt' => gmdate('c'),
    ];
    file_put_contents(ROOT_DIR . '/version.json', json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT), LOCK_EX);
}

function render_head(string $title): void { ?>
<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#101923"><title><?= e($title) ?></title><link rel="stylesheet" href="<?= e(absolute_url('assets/app.css')) ?>"></head><body><?php }
function render_foot(): void { echo '</body></html>'; }
