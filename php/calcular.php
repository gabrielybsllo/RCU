<?php
/**
 * Rota Exata - Processador de Cálculos (PHP Estruturado com Sessões Nativas)
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/db.php';

// Limpa resultados e erros anteriores
$_SESSION['erros'] = [];
unset($_SESSION['resultado']);

/**
 * Converte valor numérico em formato brasileiro para float
 */
function parseBrazilianNumber($value) {
    if ($value === null || $value === '') return null;
    $val = trim((string)$value);
    
    // Se tiver pontos de milhar e vírgula decimal (ex: 1.250,50)
    if (strpos($val, '.') !== false && strpos($val, ',') !== false) {
        $val = str_replace('.', '', $val);
        $val = str_replace(',', '.', $val);
    } elseif (strpos($val, ',') !== false) {
        // Apenas vírgula decimal
        $val = str_replace(',', '.', $val);
    }

    if (!is_numeric($val)) {
        return null;
    }

    return (float)$val;
}

// Apenas aceita requisições POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.php');
    exit;
}

// Recebe dados brutos
$tipoVeiculo = trim($_POST['tipo_veiculo'] ?? 'carro');
$tipoCombustivel = trim($_POST['tipo_combustivel'] ?? 'gasolina');
$distanciaRaw = $_POST['distancia'] ?? '';
$precoRaw = $_POST['preco'] ?? '';
$consumoRaw = $_POST['consumo'] ?? '';

// Guarda valores antigos para repopular formulário
$_SESSION['old_input'] = [
    'tipo_veiculo' => $tipoVeiculo,
    'tipo_combustivel' => $tipoCombustivel,
    'distancia' => $distanciaRaw,
    'preco' => $precoRaw,
    'consumo' => $consumoRaw
];

// Validações dos campos
$distancia = parseBrazilianNumber($distanciaRaw);
$preco = parseBrazilianNumber($precoRaw);
$consumo = parseBrazilianNumber($consumoRaw);

$erros = [];

// 1. Distância
if ($distanciaRaw === '' || $distanciaRaw === null) {
    $erros['distancia'] = 'A distância da viagem é obrigatória.';
} elseif ($distancia === null) {
    $erros['distancia'] = 'Informe um valor numérico válido para a distância.';
} elseif ($distancia <= 0) {
    $erros['distancia'] = 'A distância deve ser maior que zero.';
}

// 2. Preço
if ($precoRaw === '' || $precoRaw === null) {
    $erros['preco'] = 'O preço do combustível é obrigatório.';
} elseif ($preco === null) {
    $erros['preco'] = 'Informe um preço numérico válido (ex: 5,89).';
} elseif ($preco <= 0) {
    $erros['preco'] = 'O preço do combustível deve ser maior que zero.';
}

// 3. Consumo
if ($consumoRaw === '' || $consumoRaw === null) {
    $erros['consumo'] = 'O consumo médio do veículo é obrigatório.';
} elseif ($consumo === null) {
    $erros['consumo'] = 'Informe um consumo numérico válido (ex: 12,5).';
} elseif ($consumo <= 0) {
    $erros['consumo'] = 'O consumo médio deve ser maior que zero.';
}

// 4. Tipo de Combustível
$combustiveisValidos = ['gasolina', 'etanol', 'diesel', 'gnv'];
if (!in_array($tipoCombustivel, $combustiveisValidos)) {
    $erros['tipo_combustivel'] = 'Tipo de combustível selecionado é inválido.';
}

// 5. Tipo de Veículo
$veiculosValidos = ['carro', 'moto', 'van', 'caminhao'];
if (!in_array($tipoVeiculo, $veiculosValidos)) {
    $erros['tipo_veiculo'] = 'Tipo de veículo selecionado é inválido.';
}

$isAjax = !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';

// Se houver erros
if (!empty($erros)) {
    $_SESSION['erros'] = $erros;
    if ($isAjax) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => false, 'erros' => $erros]);
        exit;
    }
    header('Location: index.php#calculadora');
    exit;
}

// Cálculos matemáticos CORE
// Fórmula 1: Quantidade = Distância ÷ Consumo
$combustivelNecessario = $distancia / $consumo;

// Fórmula 2: Custo Total = Quantidade × Preço
$custoTotal = $combustivelNecessario * $preco;

// Métricas complementares
$custoPorKm = $custoTotal / $distancia;

$resultado = [
    'tipo_veiculo' => $tipoVeiculo,
    'tipo_combustivel' => $tipoCombustivel,
    'distancia' => $distancia,
    'preco' => $preco,
    'consumo' => $consumo,
    'combustivel_necessario' => round($combustivelNecessario, 2),
    'custo_total' => round($custoTotal, 2),
    'custo_por_km' => round($custoPorKm, 2),
    'unidade_volume' => ($tipoCombustivel === 'gnv') ? 'm³' : 'litros',
    'unidade_consumo' => ($tipoCombustivel === 'gnv') ? 'km/m³' : 'km/L',
    'unidade_preco' => ($tipoCombustivel === 'gnv') ? 'R$/m³' : 'R$/L',
    'timestamp' => date('d/m/Y H:i')
];

// Salva resultado na Sessão Nativa PHP
$_SESSION['resultado'] = $resultado;

// Salva no histórico de sessão
if (!isset($_SESSION['historico']) || !is_array($_SESSION['historico'])) {
    $_SESSION['historico'] = [];
}
array_unshift($_SESSION['historico'], $resultado);
if (count($_SESSION['historico']) > 5) {
    array_pop($_SESSION['historico']);
}

// Opcional: Persistência no MySQL via PDO
$db = getDbConnection();
if ($db !== null) {
    try {
        $stmt = $db->prepare("
            INSERT INTO `calculos_viagem` 
            (`session_id`, `tipo_veiculo`, `tipo_combustivel`, `distancia`, `preco_combustivel`, `consumo_medio`, `combustivel_necessario`, `custo_total`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            session_id(),
            $tipoVeiculo,
            $tipoCombustivel,
            $resultado['distancia'],
            $resultado['preco'],
            $resultado['consumo'],
            $resultado['combustivel_necessario'],
            $resultado['custo_total']
        ]);
    } catch (PDOException $e) {
        error_log("Erro ao salvar cálculo no MySQL: " . $e->getMessage());
    }
}

// Resposta
if ($isAjax) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['sucesso' => true, 'resultado' => $resultado]);
    exit;
}

header('Location: index.php#calculadora');
exit;
