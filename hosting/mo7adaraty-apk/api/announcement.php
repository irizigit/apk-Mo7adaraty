<?php
declare(strict_types=1);
require dirname(__DIR__) . '/bootstrap.php';
$announcement = db()->query("SELECT title, body, action_url, created_at FROM announcements WHERE is_active = 1 AND (expires_at IS NULL OR expires_at > NOW()) ORDER BY id DESC LIMIT 1")->fetch();
api_json(['announcement' => $announcement ?: null]);
