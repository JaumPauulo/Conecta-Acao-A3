<?php
// Lista pedidos ATIVOS para doadores, com totais de concluídas e restante
declare(strict_types=1);
ob_start();
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
header('Content-Type: application/json; charset=utf-8');

function out($d,$c=200){ http_response_code($c); if(ob_get_length())ob_clean(); echo json_encode($d,JSON_UNESCAPED_UNICODE); exit; }

try {
  $q = trim($_GET['q'] ?? '');
  $categoria = trim($_GET['categoria'] ?? '');

  $params = [];
  $where = ["p.status='ativo'"];
  if ($q !== '') { $where[] = "(p.titulo LIKE ? OR p.descricao LIKE ?)"; $params[]="%$q%"; $params[]="%$q%"; }
  if ($categoria !== '') { $where[] = "p.categoria = ?"; $params[]=$categoria; }
  $w = 'WHERE '.implode(' AND ', $where);

  $sql = "
    SELECT
      p.id, p.titulo, p.descricao, p.categoria, p.quantidade,
      o.nome AS ong_nome,
      COALESCE(SUM(CASE WHEN d.status='concluida' THEN d.quantidade ELSE 0 END),0) AS total_concluida,
      GREATEST(p.quantidade - COALESCE(SUM(CASE WHEN d.status='concluida' THEN d.quantidade ELSE 0 END),0), 0) AS restante
    FROM pedidos p
    JOIN ongs o ON o.id = p.ong_id
    LEFT JOIN doacoes d ON d.pedido_id = p.id
    $w
    GROUP BY p.id, p.titulo, p.descricao, p.categoria, p.quantidade, o.nome
    ORDER BY p.criado_em DESC
  ";

  $st = $pdo->prepare($sql);
  $st->execute($params);
  out($st->fetchAll());
} catch (Throwable $e) {
  out(['ok'=>false,'error'=>'erro interno: '.$e->getMessage()], 500);
}