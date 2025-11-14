<?php
declare(strict_types=1);
ob_start();
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
header('Content-Type: application/json; charset=utf-8');
function out($d,$c=200){ http_response_code($c); if(ob_get_length())ob_clean(); echo json_encode($d,JSON_UNESCAPED_UNICODE); exit; }

try {
  if (!isset($_SESSION['user']) || ($_SESSION['user']['role'] ?? '') !== 'doador') {
    out(['ok'=>false,'error'=>'não autorizado: faça login como doador'], 401);
  }

  $input = json_decode(file_get_contents('php://input'), true) ?? [];
  $pedido_id = (int)($input['pedido_id'] ?? 0);
  $nome      = trim($input['nome'] ?? ($_SESSION['user']['nome'] ?? ''));
  $contato   = trim($input['contato'] ?? '');
  $mensagem  = trim($input['mensagem'] ?? '');
  $quantidade= max(1, (int)($input['quantidade'] ?? 1));

  if ($pedido_id <= 0 || $nome === '') out(['ok'=>false,'error'=>'dados inválidos'], 400);

  // pedido precisa existir e estar ativo
  $chk = $pdo->prepare("SELECT id FROM pedidos WHERE id=? AND status='ativo'");
  $chk->execute([$pedido_id]);
  if (!$chk->fetch()) out(['ok'=>false,'error'=>'pedido inválido'], 404);

  // grava intenção como PENDENTE c/ quantidade
  $stmt = $pdo->prepare(
    "INSERT INTO doacoes (pedido_id, doador_id, nome_doador, contato, mensagem, quantidade, status)
     VALUES (?, ?, ?, ?, ?, ?, 'pendente')"
  );
  $stmt->execute([$pedido_id, $_SESSION['user']['id'] ?? null, $nome, $contato, $mensagem, $quantidade]);

  out(['ok'=>true]);
} catch (Throwable $e) {
  out(['ok'=>false,'error'=>'erro interno: '.$e->getMessage()], 500);
}