-- ============================================================================
-- Rota Exata - Schema do Banco de Dados MySQL
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `rota_exata`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `rota_exata`;

-- Tabela para registro do histórico de cálculos
CREATE TABLE IF NOT EXISTS `calculos_viagem` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `session_id` VARCHAR(128) NOT NULL,
  `tipo_veiculo` VARCHAR(30) NOT NULL,
  `tipo_combustivel` VARCHAR(20) NOT NULL,
  `distancia` DECIMAL(10, 2) NOT NULL,
  `preco_combustivel` DECIMAL(10, 2) NOT NULL,
  `consumo_medio` DECIMAL(10, 2) NOT NULL,
  `combustivel_necessario` DECIMAL(10, 2) NOT NULL,
  `custo_total` DECIMAL(10, 2) NOT NULL,
  `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_session` (`session_id`),
  INDEX `idx_criado_em` (`criado_em`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
