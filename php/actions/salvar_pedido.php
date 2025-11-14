<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_role('ong');

$ong_id = $_SESSION['user']['id'];
$input = json_decode(file_get_contents('php://input'), true) ?? [];

$id = isset($input['id']) ? (int)$input['id'] : 0;
$titulo = trim($input['titulo'] ?? '');
$descricao = trim($input['descricao'] ?? '');
$categoria = trim($input['categoria'] ?? '');
$quantidade = (int)($input['quantidade'] ?? 1);

if (!$titulo) json_out(['error' => 'título obrigatório'], 400);

if ($id > 0) {
  // editar
  $stmt = $pdo->prepare("UPDATE pedidos SET titulo=?, descricao=?, categoria=?, quantidade=? WHERE id=? AND ong_id=?");
  $stmt->execute([$titulo,$descricao,$categoria,$quantidade,$id,$ong_id]);
  json_out(['ok'=>true,'id'=>$id]);
} else {
  // criar
  $stmt = $pdo->prepare("INSERT INTO pedidos (ong_id,titulo,descricao,categoria,quantidade) VALUES (?,?,?,?,?)");
  $stmt->execute([$ong_id,$titulo,$descricao,$categoria,$quantidade]);
  json_out(['ok'=>true,'id'=>$pdo->lastInsertId()]);
}