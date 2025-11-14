<?php
require_once __DIR__ . '/../includes/config.php';

header('Content-Type: application/json; charset=utf-8');
echo json_encode([
  'ok' => true,
  'session_active' => session_status() === PHP_SESSION_ACTIVE,
  'user' => $_SESSION['user'] ?? null,
  'role' => $_SESSION['user']['role'] ?? null,
]);