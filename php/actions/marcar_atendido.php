<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_role('ong');

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$id = (int)($input['id'] ?? 0);
if ($id <= 0) json_out(['error'=>'id inválido'], 400);

$stmt = $pdo->prepare("UPDATE pedidos SET status='atendido' WHERE id=? AND ong_id=?");
$stmt->execute([$id, $_SESSION['user']['id']]);

json_out(['ok'=>true]);