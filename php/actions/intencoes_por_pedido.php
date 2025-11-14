<?php
// retorna as intenções de um pedido para a ONG dona do pedido
declare(strict_types=1);
ob_start();
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';

header('Content-Type: application/json; charset=utf-8');

function out($data, int $code = 200) {
  http_response_code($code);
  if (ob_get_length()) { ob_clean(); }
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  // exige ONG logada
  if (!isset($_SESSION['user']) || ($_SESSION['user']['role'] ?? '') !== 'ong') {
    out(['ok'=>false,'error'=>'não autorizado: faça login como ONG'], 401);
  }

  $pedido_id = (int)($_GET['pedido_id'] ?? 0);
  if ($pedido_id <= 0) {
    out(['ok'=>false,'error'=>'id inválido'], 400);
  }

  // garante que o pedido pertence a essa ONG
  $chk = $pdo->prepare("SELECT id FROM pedidos WHERE id=? AND ong_id=?");
  $chk->execute([$pedido_id, $_SESSION['user']['id']]);
  if (!$chk->fetch()) {
    out(['ok'=>false,'error'=>'pedido não pertence a esta ONG'], 403);
  }

  // retorna intenções (inclui quantidade e flag 'recebida')
  $sql = "SELECT id, nome_doador, contato, mensagem, quantidade, status, recebida, criado_em
          FROM doacoes
          WHERE pedido_id = ?
          ORDER BY criado_em DESC";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([$pedido_id]);

  out($stmt->fetchAll());
} catch (Throwable $e) {
  out(['ok'=>false,'error'=>'erro interno: '.$e->getMessage()], 500);
}