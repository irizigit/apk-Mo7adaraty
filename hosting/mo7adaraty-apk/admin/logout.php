<?php
declare(strict_types=1);
require dirname(__DIR__) . '/bootstrap.php';
begin_admin_session();
$_SESSION = []; session_destroy();
header('Location: login.php'); exit;
