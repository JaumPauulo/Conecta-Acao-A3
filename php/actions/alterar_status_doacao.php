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
  $status = trim($input['status'] ?? ''); // 'concluida' | 'cancelada'
  if ($id <= 0 || !in_array($status, ['concluida','cancelada'], true)) {
    out(['ok'=>false,'error'=>'dados inválidos'], 400);
  }

  // Atualiza status garantindo que pertence à ONG
  $sql = "UPDATE doacoes d
          JOIN pedidos p ON p.id = d.pedido_id
          SET d.status = ?
          WHERE d.id = ? AND p.ong_id = ?";
  $st = $pdo->prepare($sql); $st->execute([$status, $id, $_SESSION['user']['id']]);

  // Se marcou 'concluida', verifica se já atingiu a quantidade do pedido
  if ($status === 'concluida') {
    $sqlQtd = "SELECT p.id, p.quantidade,
                      COALESCE(SUM(CASE WHEN d.status='concluida' THEN d.quantidade ELSE 0 END),0) AS total_concluida
               FROM pedidos p
               LEFT JOIN doacoes d ON d.pedido_id = p.id
               JOIN doacoes d2 ON d2.id = ? AND d2.pedido_id = p.id
               GROUP BY p.id";
    $q = $pdo->prepare($sqlQtd); $q->execute([$id]);
    if ($row = $q->fetch()) {
      if ((int)$row['total_concluida'] >= (int)$row['quantidade']) {
        $upd = $pdo->prepare("UPDATE pedidos p
                              JOIN doacoes d ON d.id=? AND d.pedido_id=p.id
                              SET p.status='atendido'");
        $upd->execute([$id]);
      }
    }
  }

  out(['ok'=>true]);
} catch (Throwable $e) { out(['ok'=>false,'error'=>'erro interno: '.$e->getMessage()],500); }