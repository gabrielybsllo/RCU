<?php
/**
 * Rota Exata - Conexão Segura com Banco de Dados MySQL via PDO
 */

// Configurações de conexão (ajuste conforme o ambiente ou variáveis de ambiente)
$dbHost = getenv('DB_HOST') ?: 'localhost';
$dbPort = getenv('DB_PORT') ?: '3306';
$dbName = getenv('DB_NAME') ?: 'rota_exata';
$dbUser = getenv('DB_USER') ?: 'root';
$dbPass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';

$pdo = null;

try {
    $dsn = "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ];

    $pdo = new PDO($dsn, $dbUser, $dbPass, $options);
} catch (PDOException $e) {
    // Não interrompe o sistema se o banco não estiver ativo localmente;
    // O sistema continuará operando normalmente com Sessões Nativas PHP.
    error_log("Aviso Rota Exata PDO: Falha ao conectar ao MySQL - " . $e->getMessage());
    $pdo = null;
}

/**
 * Retorna a instância ativa do PDO ou null se indisponível
 */
function getDbConnection() {
    global $pdo;
    return $pdo;
}
