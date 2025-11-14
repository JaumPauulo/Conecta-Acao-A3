<?php
// php/includes/db.php
$DB_HOST = '127.0.0.1';
$DB_NAME = 'conecta_acao'; // certifique-se de criar manualmente no phpMyAdmin
$DB_USER = 'root';
$DB_PASS = ''; // ajuste se tiver senha

try {
  $pdo = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4", $DB_USER, $DB_PASS, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  header('Content-Type: application/json');
  echo json_encode(['error' => 'Falha de conexão ao banco', 'detail' => $e->getMessage()]);
  exit;
}