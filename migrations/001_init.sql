-- Schema base Conecta Ação (utf8mb4, InnoDB, idempotente)
CREATE DATABASE IF NOT EXISTS conecta_acao CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE conecta_acao;

-- Tabela ONGs
CREATE TABLE IF NOT EXISTS ongs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  cnpj VARCHAR(32),
  email VARCHAR(160) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  endereco VARCHAR(255),
  telefone VARCHAR(40),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela Doadores
CREATE TABLE IF NOT EXISTS doadores (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  telefone VARCHAR(40),
  endereco VARCHAR(255),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ong_id INT UNSIGNED NOT NULL,
  titulo VARCHAR(160) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(80),
  quantidade INT NOT NULL DEFAULT 1,
  status ENUM('ativo','atendido') NOT NULL DEFAULT 'ativo',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pedidos_ong (ong_id),
  INDEX idx_pedidos_status (status),
  CONSTRAINT fk_pedidos_ong FOREIGN KEY (ong_id) REFERENCES ongs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela Doações (intenções)
CREATE TABLE IF NOT EXISTS doacoes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT UNSIGNED NOT NULL,
  doador_id INT UNSIGNED NULL,
  nome_doador VARCHAR(160) NOT NULL,
  contato VARCHAR(160),
  mensagem TEXT,
  quantidade INT NOT NULL DEFAULT 1,
  status ENUM('pendente','concluida','cancelada') NOT NULL DEFAULT 'pendente',
  recebida TINYINT(1) NOT NULL DEFAULT 0,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_doacoes_pedido (pedido_id),
  INDEX idx_doacoes_status (status),
  CONSTRAINT fk_doacoes_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  CONSTRAINT fk_doacoes_doador FOREIGN KEY (doador_id) REFERENCES doadores(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- (Opcional) Usuário/ONG demo – comente se não quiser seeds
-- INSERT IGNORE INTO ongs (id, nome, email, senha_hash, telefone) VALUES
-- (1, 'ONG Exemplo', 'ong@exemplo.org', '$2y$10$abcdefghijklmnopqrstuv/abc1234567890abcdefghiJK', '(85) 99999-9999');

-- INSERT IGNORE INTO doadores (id, nome, email, senha_hash) VALUES
-- (1, 'Ana Doadora', 'ana@exemplo.com', '$2y$10$abcdefghijklmnopqrstuv/abc1234567890abcdefghiJK');