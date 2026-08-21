<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/bootstrap.php';

function admin_head(string $title): void { render_head($title); ?>
<header class="admin"><div class="wrap"><strong>إدارة محاضراتي</strong><nav style="display:inline-block;margin-right:20px"><a href="index.php">الملخص</a><a href="releases.php">الإصدارات</a><a href="announcements.php">الإعلانات</a><a href="notifications.php">الإشعارات</a><a href="logout.php">خروج</a></nav></div></header><main class="wrap" style="padding:28px 0">
<?php }
function admin_foot(): void { echo '</main>'; render_foot(); }
