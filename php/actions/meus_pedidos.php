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
  $ong_id = (int)$_SESSION['user']['id'];

  $sql = "SELECT p.id, p.titulo, p.categoria, p.quantidade, p.status,
                 (SELECT COUNT(*) FROM doacoes d WHERE d.pedido_id = p.id AND d.status='pendente') AS pendentes
          FROM pedidos p
          WHERE p.ong_id = ?
          ORDER BY p.criado_em DESC";
  $st = $pdo->prepare($sql); $st->execute([$ong_id]);
  out($st->fetchAll());
} catch (Throwable $e) { out(['ok'=>false,'error'=>'erro interno: '.$e->getMessage()],500); }