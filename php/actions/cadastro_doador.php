<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';

$nome = trim($_POST['nome'] ?? '');
$email = trim($_POST['email'] ?? '');
$telefone = trim($_POST['telefone'] ?? '');
$senha = $_POST['senha'] ?? '';

if (!$nome || !$email || !$senha) {
  header('Location: ../../login_doador.html?err=Preencha%20todos%20os%20campos');
  exit;
}

try {
  $hash = password_hash($senha, PASSWORD_DEFAULT);
  $stmt = $pdo->prepare('INSERT INTO doadores (nome,email,telefone,senha) VALUES (?,?,?,?)');
  $stmt->execute([$nome,$email,$telefone,$hash]);
  header('Location: ../../login_doador.html?ok=Cadastro%20concluído!%20Faça%20login');
} catch (Throwable $e) {
  header('Location: ../../login_doador.html?err=Email%20já%20cadastrado');
}