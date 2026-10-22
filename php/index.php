<?php
/**
 * Rota Exata - Versão PHP Estruturado com Sessões Nativas e PDO
 */
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/db.php';

$resultado = $_SESSION['resultado'] ?? null;
$erros = $_SESSION['erros'] ?? [];
$old = $_SESSION['old_input'] ?? [];

// Helpers de formatação pt-BR
function brMoeda($val) {
    return 'R$ ' . number_format((float)$val, 2, ',', '.');
}

function brNumero($val, $dec = 2) {
    return number_format((float)$val, $dec, ',', '.');
}

// Histórico de cálculos
$historico = $_SESSION['historico'] ?? [];

// Se houver conexão com MySQL, pode carregar do banco de dados
$db = getDbConnection();
if ($db !== null && empty($historico)) {
    try {
        $stmt = $db->prepare("SELECT * FROM `calculos_viagem` WHERE `session_id` = ? ORDER BY `id` DESC LIMIT 5");
        $stmt->execute([session_id()]);
        $rows = $stmt->fetchAll();
        foreach ($rows as $r) {
            $historico[] = [
                'tipo_veiculo' => $r['tipo_veiculo'],
                'tipo_combustivel' => $r['tipo_combustivel'],
                'distancia' => $r['distancia'],
                'preco' => $r['preco_combustivel'],
                'consumo' => $r['consumo_medio'],
                'combustivel_necessario' => $r['combustivel_necessario'],
                'custo_total' => $r['custo_total'],
                'custo_por_km' => $r['custo_total'] / ($r['distancia'] ?: 1),
                'unidade_volume' => ($r['tipo_combustivel'] === 'gnv') ? 'm³' : 'litros',
                'unidade_consumo' => ($r['tipo_combustivel'] === 'gnv') ? 'km/m³' : 'km/L',
                'timestamp' => date('d/m/Y H:i', strtotime($r['criado_em']))
            ];
        }
    } catch (PDOException $e) {
        // silencioso
    }
}

$combustivelSelecionado = $old['tipo_combustivel'] ?? ($resultado['tipo_combustivel'] ?? 'gasolina');
$veiculoSelecionado = $old['tipo_veiculo'] ?? ($resultado['tipo_veiculo'] ?? 'carro');
$isGnv = $combustivelSelecionado === 'gnv';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rota Exata (PHP) | Calculadora de Combustível</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⛽</text></svg>">
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet">
  
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="../css/style.css">
</head>
<body class="bg-slate-100 text-slate-800 antialiased flex flex-col min-h-screen">

  <!-- Header -->
  <header class="glass-header text-white sticky top-0 z-50 border-b border-slate-800 shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/40">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
        <div>
          <span class="text-2xl font-black font-display tracking-tight text-white flex items-center gap-1.5">
            Rota <span class="text-emerald-400">Exata</span>
          </span>
          <p class="text-xs text-slate-400 font-medium">Módulo PHP Estruturado &bull; Sessões Nativas</p>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <a href="../index.html" class="text-xs bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition">
          Versão Estática (GitHub Pages) &rarr;
        </a>
      </div>
    </div>
  </header>

  <!-- Banner -->
  <section class="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pt-8 pb-16 px-4 border-b border-slate-800 text-center">
    <div class="max-w-4xl mx-auto">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
        <span>PHP 8+ Estruturado &bull; Sessões Nativas &bull; Suporte PDO MySQL</span>
      </div>
      <h1 class="text-3xl sm:text-4xl font-extrabold font-display">Calculadora de Combustível</h1>
      <p class="mt-2 text-slate-300 text-sm max-w-xl mx-auto">
        Processamento do cálculo executado no servidor com armazenamento em sessão nativa.
      </p>
    </div>
  </section>

  <!-- Principal -->
  <main id="calculadora" class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-16 w-full">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

      <!-- Formulário PHP -->
      <div class="lg:col-span-7">
        <div class="glass-panel rounded-2xl p-6 sm:p-8 shadow-xl">
          <div class="pb-5 border-b border-slate-100 mb-6 flex justify-between items-center">
            <h2 class="text-lg font-bold font-display text-slate-800">Parâmetros da Viagem</h2>
            <span class="text-xs text-slate-400">Método POST &bull; Validação no Servidor</span>
          </div>

          <form action="calcular.php" method="POST" novalidate>
            <!-- Veículo -->
            <div class="mb-5">
              <label class="block text-sm font-semibold text-slate-700 mb-2">Tipo de Veículo *</label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <?php
                $veiculos = [
                    'carro' => ['Carro', 'Passeio'],
                    'moto' => ['Moto', '2 Rodas'],
                    'van' => ['Van', 'Utilitário'],
                    'caminhao' => ['Caminhão', 'Pesado']
                ];
                foreach ($veiculos as $key => $info):
                    $active = ($veiculoSelecionado === $key) ? 'active' : '';
                ?>
                  <label class="selectable-card p-3 rounded-xl text-center bg-white cursor-pointer <?= $active ?>">
                    <input type="radio" name="tipo_veiculo" value="<?= $key ?>" class="sr-only" <?= ($veiculoSelecionado === $key) ? 'checked' : '' ?>>
                    <span class="text-xs font-semibold block text-slate-700"><?= $info[0] ?></span>
                    <span class="text-[10px] text-slate-400 block"><?= $info[1] ?></span>
                  </label>
                <?php endforeach; ?>
              </div>
              <?php if (isset($erros['tipo_veiculo'])): ?>
                <p class="error-message"><?= htmlspecialchars($erros['tipo_veiculo']) ?></p>
              <?php endif; ?>
            </div>

            <!-- Combustível -->
            <div class="mb-5">
              <label class="block text-sm font-semibold text-slate-700 mb-2">Tipo de Combustível *</label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <?php
                $combustiveis = [
                    'gasolina' => ['Gasolina', 'R$/L &bull; km/L'],
                    'etanol' => ['Etanol', 'R$/L &bull; km/L'],
                    'diesel' => ['Diesel', 'R$/L &bull; km/L'],
                    'gnv' => ['GNV', 'R$/m³ &bull; km/m³']
                ];
                foreach ($combustiveis as $key => $info):
                    $active = ($combustivelSelecionado === $key) ? 'active' : '';
                ?>
                  <label class="selectable-card p-3 rounded-xl text-center bg-white cursor-pointer <?= $active ?>">
                    <input type="radio" name="tipo_combustivel" value="<?= $key ?>" class="sr-only" <?= ($combustivelSelecionado === $key) ? 'checked' : '' ?>>
                    <span class="text-xs font-semibold block text-slate-800"><?= $info[0] ?></span>
                    <span class="text-[10px] text-slate-400 block"><?= $info[1] ?></span>
                  </label>
                <?php endforeach; ?>
              </div>
              <?php if (isset($erros['tipo_combustivel'])): ?>
                <p class="error-message"><?= htmlspecialchars($erros['tipo_combustivel']) ?></p>
              <?php endif; ?>
            </div>

            <!-- Distância -->
            <div class="mb-5">
              <label for="distancia" class="block text-sm font-semibold text-slate-700 mb-1">Distância (km) *</label>
              <input
                type="text"
                id="distancia"
                name="distancia"
                placeholder="Ex: 250 ou 180,5"
                value="<?= htmlspecialchars($old['distancia'] ?? ($resultado['distancia'] ?? '')) ?>"
                class="input-custom <?= isset($erros['distancia']) ? 'is-invalid' : '' ?>"
                required
              >
              <?php if (isset($erros['distancia'])): ?>
                <p class="error-message"><?= htmlspecialchars($erros['distancia']) ?></p>
              <?php endif; ?>
            </div>

            <!-- Preço e Consumo -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label for="preco" class="block text-sm font-semibold text-slate-700 mb-1">
                  Preço <?= $isGnv ? '(R$/m³)' : '(R$/L)' ?> *
                </label>
                <input
                  type="text"
                  id="preco"
                  name="preco"
                  placeholder="Ex: 5,89"
                  value="<?= htmlspecialchars($old['preco'] ?? ($resultado['preco'] ?? '')) ?>"
                  class="input-custom <?= isset($erros['preco']) ? 'is-invalid' : '' ?>"
                  required
                >
                <?php if (isset($erros['preco'])): ?>
                  <p class="error-message"><?= htmlspecialchars($erros['preco']) ?></p>
                <?php endif; ?>
              </div>

              <div>
                <label for="consumo" class="block text-sm font-semibold text-slate-700 mb-1">
                  Consumo <?= $isGnv ? '(km/m³)' : '(km/L)' ?> *
                </label>
                <input
                  type="text"
                  id="consumo"
                  name="consumo"
                  placeholder="Ex: 12,0"
                  value="<?= htmlspecialchars($old['consumo'] ?? ($resultado['consumo'] ?? '')) ?>"
                  class="input-custom <?= isset($erros['consumo']) ? 'is-invalid' : '' ?>"
                  required
                >
                <?php if (isset($erros['consumo'])): ?>
                  <p class="error-message"><?= htmlspecialchars($erros['consumo']) ?></p>
                <?php endif; ?>
              </div>
            </div>

            <button type="submit" class="btn-calc-glow w-full py-3.5 px-6 rounded-xl text-white font-bold text-base tracking-wide flex items-center justify-center gap-2">
              <span>CALCULAR COM PHP</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Resultados PHP -->
      <div class="lg:col-span-5 space-y-6">
        <?php if ($resultado): ?>
          <div class="card-total-destaque rounded-2xl p-6 text-white shadow-xl pop-in">
            <span class="text-xs uppercase font-bold text-emerald-200">Custo Total da Viagem (PHP)</span>
            <div class="text-4xl font-black font-display mt-2">
              <?= brMoeda($resultado['custo_total']) ?>
            </div>
            <div class="mt-4 pt-4 border-t border-emerald-800/60 flex justify-between text-xs">
              <span>Custo por km:</span>
              <span class="font-bold"><?= brMoeda($resultado['custo_por_km']) ?> / km</span>
            </div>
          </div>

          <div class="glass-panel rounded-2xl p-6 shadow-md">
            <h3 class="text-xs font-bold uppercase text-slate-400 mb-3">Detalhamento</h3>
            <div class="grid grid-cols-2 gap-3 text-center">
              <div class="bg-slate-50 p-3 rounded-lg border">
                <span class="text-xs text-slate-500 block">Combustível Necessário</span>
                <span class="text-xl font-bold text-slate-800"><?= brNumero($resultado['combustivel_necessario']) ?> <?= $resultado['unidade_volume'] ?></span>
              </div>
              <div class="bg-slate-50 p-3 rounded-lg border">
                <span class="text-xs text-slate-500 block">Distância</span>
                <span class="text-xl font-bold text-slate-800"><?= brNumero($resultado['distancia']) ?> km</span>
              </div>
            </div>
          </div>
        <?php else: ?>
          <div class="glass-panel rounded-2xl p-8 text-center text-slate-500">
            <p class="text-sm">Envie o formulário para visualizar os cálculos processados pelo PHP com sessões nativas.</p>
          </div>
        <?php endif; ?>

        <!-- Histórico PHP -->
        <?php if (!empty($historico)): ?>
          <div class="glass-panel rounded-2xl p-5 shadow-sm">
            <h4 class="text-xs font-bold uppercase text-slate-400 mb-3">Histórico na Sessão / MySQL</h4>
            <div class="space-y-2">
              <?php foreach ($historico as $h): ?>
                <div class="history-item p-2.5 bg-white rounded border text-xs flex justify-between">
                  <div>
                    <span class="font-bold text-emerald-700"><?= brMoeda($h['custo_total']) ?></span>
                    <span class="text-slate-500 block"><?= brNumero($h['distancia']) ?> km &bull; <?= brNumero($h['combustivel_necessario']) ?> <?= $h['unidade_volume'] ?></span>
                  </div>
                  <span class="text-[10px] text-slate-400"><?= $h['timestamp'] ?></span>
                </div>
              <?php endforeach; ?>
            </div>
          </div>
        <?php endif; ?>
      </div>

    </div>
  </main>

  <footer class="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 mt-auto text-center text-xs">
    <p>Rota Exata &bull; Desenvolvido em conformidade com requisitos.md</p>
  </footer>

  <script>
    // Interatividade simples para os rádios na versão PHP
    document.querySelectorAll('.selectable-card').forEach(card => {
      card.addEventListener('click', () => {
        const input = card.querySelector('input[type="radio"]');
        if (input) {
          const groupName = input.name;
          document.querySelectorAll(`input[name="${groupName}"]`).forEach(i => {
            i.closest('.selectable-card')?.classList.remove('active');
          });
          input.checked = true;
          card.classList.add('active');
        }
      });
    });
  </script>
</body>
</html>
