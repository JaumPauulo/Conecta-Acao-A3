<?php
declare(strict_types=1);
ob_start();
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
header('Content-Type: application/json; charset=utf-8');
function out($d,$c=200){ http_response_code($c); if(ob_get_length())ob_clean(); echo json_encode($d,JSON_UNESCAPED_UNICODE); exit; }

try {
  $id = (int)($_GET['id'] ?? 0);
  if ($id <= 0) out(['ok'=>false,'error'=>'id inválido'], 400);

  $sql = "
    SELECT
      p.*,
      o.nome AS ong_nome, o.email AS ong_email, o.telefone AS ong_tel,
      COALESCE(SUM(CASE WHEN d.status='concluida' THEN d.quantidade ELSE 0 END),0) AS total_concluida,
      GREATEST(p.quantidade - COALESCE(SUM(CASE WHEN d.status='concluida' THEN d.quantidade ELSE 0 END),0), 0) AS restante
    FROM pedidos p
    JOIN ongs o ON o.id = p.ong_id
    LEFT JOIN doacoes d ON d.pedido_id = p.id
    WHERE p.id = ?
    GROUP BY p.id
    LIMIT 1
  ";
  $st = $pdo->prepare($sql); $st->execute([$id]);
  $pedido = $st->fetch();
  if (!$pedido) out(['ok'=>false,'error'=>'não encontrado'], 404);

  out($pedido);
} catch (Throwable $e) {
  out(['ok'=>false,'error'=>'erro interno: '.$e->getMessage()], 500);
}