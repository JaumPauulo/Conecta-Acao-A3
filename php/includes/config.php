<?php
// php/includes/config.php
if (session_status() !== PHP_SESSION_ACTIVE) {
  session_start();
}

function json_out($data, int $code = 200) {
  http_response_code($code);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($data);
  exit;
}

function require_role(string $role) {
  if (!isset($_SESSION['user']) || ($_SESSION['user']['role'] ?? null) !== $role) {
    json_out(['error' => 'não autorizado'], 401);
  }
}