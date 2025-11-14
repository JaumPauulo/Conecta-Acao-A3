<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';

$nome = trim($_POST['nome'] ?? '');
$cnpj = trim($_POST['cnpj'] ?? '');
$email = trim($_POST['email'] ?? '');
$endereco = trim($_POST['endereco'] ?? '');
$telefone = trim($_POST['telefone'] ?? '');
$senha = $_POST['senha'] ?? '';

if (!$nome || !$email || !$senha || !$cnpj) {
  header('Location: ../../login_ong.html?err=Preencha%20todos%20os%20campos');
  exit;
}

try {
  $hash = password_hash($senha, PASSWORD_DEFAULT);
  $stmt = $pdo->prepare('INSERT INTO ongs (nome,cnpj,email,endereco,telefone,senha) VALUES (?,?,?,?,?,?)');
  $stmt->execute([$nome,$cnpj,$email,$endereco,$telefone,$hash]);
  header('Location: ../../login_ong.html?ok=ONG%20cadastrada!%20Faça%20login');
} catch (Throwable $e) {
  header('Location: ../../login_ong.html?err=Email%20ou%20CNPJ%20já%20cadastrado');
}