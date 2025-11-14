<?php
// lista os pedidos que o DOADOR logado já sinalizou + total doado por pedido
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
  $uid = (int)$_SESSION['user']['id'];

  // IDs distintos
  $sqlIds = "SELECT DISTINCT pedido_id FROM doacoes WHERE doador_id = ?";
  $st1 = $pdo->prepare($sqlIds); $st1->execute([$uid]);
  $ids = array_map(fn($r) => (int)$r['pedido_id'], $st1->fetchAll());

  // Totais doados por pedido (somando todas as intenções do usuário, pendentes ou concluídas)
  $sqlTot = "SELECT pedido_id, COALESCE(SUM(quantidade),0) AS total
             FROM doacoes
             WHERE doador_id = ?
             GROUP BY pedido_id";
  $st2 = $pdo->prepare($sqlTot); $st2->execute([$uid]);
  $map = [];
  foreach ($st2->fetchAll() as $r) {
    $map[(int)$r['pedido_id']] = (int)$r['total'];
  }

  out(['ok'=>true, 'pedido_ids'=>$ids, 'totais'=>$map]);
} catch (Throwable $e) {
  out(['ok'=>false,'error'=>'erro interno: '.$e->getMessage()], 500);
}