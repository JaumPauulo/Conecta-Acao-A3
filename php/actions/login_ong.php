<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';

$email = trim($_POST['email'] ?? '');
$senha = $_POST['senha'] ?? '';

if (!$email || !$senha) json_out(['error' => 'campos obrigatórios'], 400);

$stmt = $pdo->prepare('SELECT * FROM ongs WHERE email=? LIMIT 1');
$stmt->execute([$email]);
$u = $stmt->fetch();

if ($u && password_verify($senha, $u['senha'])) {
  unset($u['senha']);
  $_SESSION['user'] = ['role' => 'ong'] + $u;
  header('Location: ../../painel_ong.html');
  exit;
}
header('Location: ../../login_ong.html?err=Email%20ou%20senha%20inválidos');