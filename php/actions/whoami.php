<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';

header('Content-Type: application/json; charset=utf-8');
echo json_encode([
  'ok' => true,
  'user' => $_SESSION['user'] ?? null,
  'role' => $_SESSION['user']['role'] ?? null,
  'php_sapi' => php_sapi_name(),
  'session_id' => session_id(),
  'cookie_params' => session_get_cookie_params(),
]);