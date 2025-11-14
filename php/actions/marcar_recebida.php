<?php
declare(strict_types=1);
ob_start();
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
header('Content-Type: application/json; charset=utf-8');
function out($d,$c=200){ http_response_code($c); if(ob_get_length())ob_clean(); echo json_encode($d,JSON_UNESCAPED_UNICODE); exit; }

try {
  if (!isset($_SESSION['user']) || ($_SESSION['user']['role'] ?? '') !== 'ong') {
    out(['ok'=>false,'error'=>'não autorizado: faça login como ONG'], 401);
  }
  $input = json_decode(file_get_contents('php://input'), true) ?? [];
  $id = (int)($input['id'] ?? 0);
  if ($id <= 0) out(['ok'=>false,'error'=>'id inválido'], 400);

  // só a ONG dona do pedido pode marcar
  $sql = "UPDATE doacoes d
          JOIN pedidos p ON p.id = d.pedido_id
          SET d.recebida = 1
          WHERE d.id = ? AND p.ong_id = ?";
  $st = $pdo->prepare($sql); $st->execute([$id, $_SESSION['user']['id']]);

  out(['ok'=>true]);
} catch (Throwable $e) { out(['ok'=>false,'error'=>'erro interno: '.$e->getMessage()],500); }