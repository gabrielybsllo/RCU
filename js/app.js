/**
 * Rota Exata - Calculadora de Combustível
 * Lógica da aplicação, validações, cálculos e manipulação de DOM
 */

document.addEventListener('DOMContentLoaded', () => {
  // Referências aos elementos do DOM
  const form = document.getElementById('calcForm');
  const btnCalcular = document.getElementById('btnCalcular');
  const btnLimpar = document.getElementById('btnLimpar');

  // Campos de entrada
  const inputDistancia = document.getElementById('distancia');
  const inputPreco = document.getElementById('preco');
  const inputConsumo = document.getElementById('consumo');

  // Rádios / Seletores
  const fuelCards = document.querySelectorAll('.fuel-selector-card');
  const vehicleCards = document.querySelectorAll('.vehicle-selector-card');

  // Rótulos e unidades dinâmicas
  const labelPrecoUnidade = document.getElementById('labelPrecoUnidade');
  const labelConsumoUnidade = document.getElementById('labelConsumoUnidade');
  const badgePrecoUnidade = document.getElementById('badgePrecoUnidade');
  const badgeConsumoUnidade = document.getElementById('badgeConsumoUnidade');

  // Elementos de Mensagem de Erro
  const erroDistancia = document.getElementById('erro-distancia');
  const erroPreco = document.getElementById('erro-preco');
  const erroConsumo = document.getElementById('erro-consumo');
  const erroCombustivel = document.getElementById('erro-combustivel');
  const erroVeiculo = document.getElementById('erro-veiculo');

  // Seções de Resultado e Feedback
  const resultadosContainer = document.getElementById('resultadosContainer');
  const placeholderResultados = document.getElementById('placeholderResultados');
  const avisoDadosAlterados = document.getElementById('avisoDadosAlterados');

  // Elementos de exibição de resultado
  const resCustoTotal = document.getElementById('resCustoTotal');
  const resCombustivelQtd = document.getElementById('resCombustivelQtd');
  const resCombustivelUnidade = document.getElementById('resCombustivelUnidade');
  const resDistancia = document.getElementById('resDistancia');
  const resCustoPorKm = document.getElementById('resCustoPorKm');
  const resVeiculoInfo = document.getElementById('resVeiculoInfo');
  const resCombustivelInfo = document.getElementById('resCombustivelInfo');
  const resConsumoInfo = document.getElementById('resConsumoInfo');

  // Histórico
  const historicoLista = document.getElementById('historicoLista');
  const historicoVazio = document.getElementById('historicoVazio');
  const btnLimparHistorico = document.getElementById('btnLimparHistorico');

  // Estado da aplicação
  let currentFuelType = 'gasolina'; // gasolina | etanol | diesel | gnv
  let currentVehicleType = 'carro'; // carro | moto | caminhao | van
  let hasCalculated = false;
  let lastCalculatedHash = '';

  // Consumos médios de referência para sugestão (o usuário sempre pode alterar)
  const vehicleConsumptionPresets = {
    carro: { gasolina: '12.0', etanol: '8.5', diesel: '14.0', gnv: '13.0' },
    moto: { gasolina: '35.0', etanol: '28.0', diesel: '30.0', gnv: '32.0' },
    caminhao: { gasolina: '4.0', etanol: '3.0', diesel: '3.5', gnv: '4.0' },
    van: { gasolina: '9.0', etanol: '6.5', diesel: '10.5', gnv: '9.5' }
  };

  /**
   * Converte strings de entrada (com ponto ou vírgula) para número de ponto flutuante válido
   * Ex: "1.250,50" -> 1250.50 | "12,5" -> 12.5 | "12.5" -> 12.5
   */
  function parseBrNumber(value) {
    if (!value) return NaN;
    if (typeof value === 'number') return value;

    let cleanStr = value.toString().trim();
    // Se tiver pontos de milhar e vírgula decimal (ex: 1.250,50)
    if (cleanStr.includes('.') && cleanStr.includes(',')) {
      cleanStr = cleanStr.replace(/\./g, '').replace(',', '.');
    } else if (cleanStr.includes(',')) {
      // Apenas vírgula decimal (ex: 12,5)
      cleanStr = cleanStr.replace(',', '.');
    }

    const num = parseFloat(cleanStr);
    return isNaN(num) ? NaN : num;
  }

  /**
   * Formata número no padrão monetário brasileiro (R$ 0,00)
   */
  function formatMoneyBr(val) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  }

  /**
   * Formata número decimal com 2 casas decimais no padrão brasileiro (0,00)
   */
  function formatDecimalBr(val, minDecimals = 2, maxDecimals = 2) {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals
    }).format(val);
  }

  /**
   * Atualiza as unidades de medida na interface conforme o combustível selecionado
   */
  function updateFuelUnits(fuelType) {
    currentFuelType = fuelType;
    const isGnv = fuelType === 'gnv';

    const unitVol = isGnv ? 'm³' : 'L';
    const unitPrice = isGnv ? 'R$/m³' : 'R$/L';
    const unitEfficiency = isGnv ? 'km/m³' : 'km/L';

    if (labelPrecoUnidade) labelPrecoUnidade.textContent = `Preço do Combustível (${unitPrice})`;
    if (labelConsumoUnidade) labelConsumoUnidade.textContent = `Consumo Médio (${unitEfficiency})`;
    if (badgePrecoUnidade) badgePrecoUnidade.textContent = unitPrice;
    if (badgeConsumoUnidade) badgeConsumoUnidade.textContent = unitEfficiency;

    if (inputPreco) {
      inputPreco.placeholder = isGnv ? 'Ex: 4,79' : 'Ex: 5,89';
    }
    if (inputConsumo) {
      inputConsumo.placeholder = isGnv ? 'Ex: 13,0' : 'Ex: 11,5';
    }

    markDataAsStale();
  }

  /**
   * Configura seleção de cartões de combustível
   */
  fuelCards.forEach(card => {
    const handleSelect = () => {
      fuelCards.forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-checked', 'false');
      });
      card.classList.add('active');
      card.setAttribute('aria-checked', 'true');
      const fuel = card.dataset.fuel;
      updateFuelUnits(fuel);
      limparErro(erroCombustivel);
    };

    card.addEventListener('click', handleSelect);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelect();
      }
    });
  });

  /**
   * Configura seleção de cartões de veículos
   */
  vehicleCards.forEach(card => {
    const handleSelect = () => {
      vehicleCards.forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-checked', 'false');
      });
      card.classList.add('active');
      card.setAttribute('aria-checked', 'true');
      currentVehicleType = card.dataset.vehicle;

      // Se o campo de consumo estiver vazio, preenche com sugestão amigável
      if (!inputConsumo.value.trim()) {
        const suggestion = vehicleConsumptionPresets[currentVehicleType]?.[currentFuelType];
        if (suggestion) {
          inputConsumo.value = suggestion.replace('.', ',');
        }
      }

      limparErro(erroVeiculo);
      markDataAsStale();
    };

    card.addEventListener('click', handleSelect);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelect();
      }
    });
  });

  /**
   * Exibe erro em um campo específico
   */
  function exibirErro(inputElement, erroElement, mensagem) {
    if (inputElement) {
      inputElement.classList.add('is-invalid');
      inputElement.classList.add('shake');
      setTimeout(() => inputElement.classList.remove('shake'), 400);
    }
    if (erroElement) {
      erroElement.innerHTML = `
        <svg class="w-4 h-4 text-red-500 inline-block flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>
        <span>${mensagem}</span>
      `;
      erroElement.classList.remove('hidden');
    }
  }

  /**
   * Limpa erro de um campo específico
   */
  function limparErro(erroElement, inputElement = null) {
    if (inputElement) {
      inputElement.classList.remove('is-invalid');
    }
    if (erroElement) {
      erroElement.textContent = '';
      erroElement.classList.add('hidden');
    }
  }

  /**
   * Limpa todos os erros visíveis
   */
  function limparTodosErros() {
    limparErro(erroDistancia, inputDistancia);
    limparErro(erroPreco, inputPreco);
    limparErro(erroConsumo, inputConsumo);
    limparErro(erroCombustivel);
    limparErro(erroVeiculo);
  }

  /**
   * Gera um hash representativo dos valores atuais do formulário
   */
  function getCurrentFormHash() {
    return `${inputDistancia.value.trim()}|${inputPreco.value.trim()}|${inputConsumo.value.trim()}|${currentFuelType}|${currentVehicleType}`;
  }

  /**
   * Marca os dados como alterados para que o usuário nunca confunda resultados antigos
   * com uma nova alteração de campos.
   */
  function markDataAsStale() {
    if (!hasCalculated) return;
    const currentHash = getCurrentFormHash();
    if (currentHash !== lastCalculatedHash) {
      if (avisoDadosAlterados) {
        avisoDadosAlterados.classList.remove('hidden');
      }
      if (resCustoTotal) {
        resCustoTotal.classList.add('opacity-40');
      }
    } else {
      if (avisoDadosAlterados) {
        avisoDadosAlterados.classList.add('hidden');
      }
      if (resCustoTotal) {
        resCustoTotal.classList.remove('opacity-40');
      }
    }
  }

  // Ouvintes de alteração em tempo real para limpar mensagens de erro e marcar estado
  [inputDistancia, inputPreco, inputConsumo].forEach(input => {
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) {
        if (input === inputDistancia) limparErro(erroDistancia, inputDistancia);
        if (input === inputPreco) limparErro(erroPreco, inputPreco);
        if (input === inputConsumo) limparErro(erroConsumo, inputConsumo);
      }
      markDataAsStale();
    });
  });

  /**
   * Validação completa dos dados de entrada
   * Retorna os valores numéricos se válidos ou null se houver qualquer erro
   */
  function validarCampos() {
    limparTodosErros();
    let hasError = false;

    // 1. Distância
    const distRaw = inputDistancia.value.trim();
    const distancia = parseBrNumber(distRaw);
    if (!distRaw) {
      exibirErro(inputDistancia, erroDistancia, 'A distância da viagem é obrigatória.');
      hasError = true;
    } else if (isNaN(distancia)) {
      exibirErro(inputDistancia, erroDistancia, 'Informe um valor numérico válido para a distância.');
      hasError = true;
    } else if (distancia <= 0) {
      exibirErro(inputDistancia, erroDistancia, 'A distância deve ser maior que zero (ex: 150 km).');
      hasError = true;
    }

    // 2. Preço do combustível
    const precoRaw = inputPreco.value.trim();
    const preco = parseBrNumber(precoRaw);
    if (!precoRaw) {
      exibirErro(inputPreco, erroPreco, 'O preço do combustível é obrigatório.');
      hasError = true;
    } else if (isNaN(preco)) {
      exibirErro(inputPreco, erroPreco, 'Informe um preço numérico válido (ex: 5,89).');
      hasError = true;
    } else if (preco <= 0) {
      exibirErro(inputPreco, erroPreco, 'O preço do combustível deve ser maior que zero.');
      hasError = true;
    }

    // 3. Consumo médio
    const consumoRaw = inputConsumo.value.trim();
    const consumo = parseBrNumber(consumoRaw);
    if (!consumoRaw) {
      exibirErro(inputConsumo, erroConsumo, 'O consumo médio do veículo é obrigatório.');
      hasError = true;
    } else if (isNaN(consumo)) {
      exibirErro(inputConsumo, erroConsumo, 'Informe um consumo numérico válido (ex: 12,5).');
      hasError = true;
    } else if (consumo <= 0) {
      exibirErro(inputConsumo, erroConsumo, 'O consumo médio deve ser maior que zero.');
      hasError = true;
    }

    // 4. Tipo de combustível
    if (!currentFuelType) {
      exibirErro(null, erroCombustivel, 'Selecione o tipo de combustível.');
      hasError = true;
    }

    // 5. Tipo de veículo
    if (!currentVehicleType) {
      exibirErro(null, erroVeiculo, 'Selecione o tipo de veículo.');
      hasError = true;
    }

    if (hasError) {
      return null;
    }

    return {
      distancia,
      preco,
      consumo,
      fuelType: currentFuelType,
      vehicleType: currentVehicleType
    };
  }

  /**
   * Realiza os cálculos matemáticos conforme especificação
   */
  function calcularViagem(dados) {
    const { distancia, preco, consumo } = dados;

    // Fórmula CORE 1: Quantidade = Distância ÷ Consumo
    const combustivelQtd = distancia / consumo;

    // Fórmula CORE 2: Custo Total = Quantidade × Preço
    const custoTotal = combustivelQtd * preco;

    // Custo estimado por quilômetro (métrica auxiliar valiosa)
    const custoPorKm = custoTotal / distancia;

    return {
      distancia,
      preco,
      consumo,
      combustivelQtd,
      custoTotal,
      custoPorKm
    };
  }

  /**
   * Retorna o nome amigável do combustível
   */
  function getFuelLabel(fuel) {
    switch (fuel) {
      case 'gasolina': return 'Gasolina';
      case 'etanol': return 'Etanol';
      case 'diesel': return 'Diesel';
      case 'gnv': return 'GNV';
      default: return fuel;
    }
  }

  /**
   * Retorna o nome amigável do veículo
   */
  function getVehicleLabel(vehicle) {
    switch (vehicle) {
      case 'carro': return 'Carro de Passeio';
      case 'moto': return 'Motocicleta';
      case 'caminhao': return 'Caminhão / Ônibus';
      case 'van': return 'Van / Utilitário';
      default: return vehicle;
    }
  }

  /**
   * Apresenta os resultados no DOM com animações e formatação pt-BR
   */
  function renderResultados(calculo, dados) {
    const isGnv = dados.fuelType === 'gnv';
    const volumeUnit = isGnv ? 'm³' : 'litros';
    const efficiencyUnit = isGnv ? 'km/m³' : 'km/L';
    const priceUnit = isGnv ? 'R$/m³' : 'R$/L';

    // Preenche valores com arredondamento e padrão brasileiro
    resCustoTotal.textContent = formatMoneyBr(calculo.custoTotal);
    resCombustivelQtd.textContent = formatDecimalBr(calculo.combustivelQtd);
    resCombustivelUnidade.textContent = volumeUnit;
    resDistancia.textContent = `${formatDecimalBr(calculo.distancia)} km`;
    resCustoPorKm.textContent = `${formatMoneyBr(calculo.custoPorKm)} / km`;

    // Resumo dos parâmetros utilizados
    resVeiculoInfo.textContent = getVehicleLabel(dados.vehicleType);
    resCombustivelInfo.textContent = `${getFuelLabel(dados.fuelType)} (${formatMoneyBr(dados.preco)} / ${isGnv ? 'm³' : 'L'})`;
    resConsumoInfo.textContent = `${formatDecimalBr(dados.consumo)} ${efficiencyUnit}`;

    // Atualiza estado de exibição
    if (placeholderResultados) placeholderResultados.classList.add('hidden');
    if (resultadosContainer) {
      resultadosContainer.classList.remove('hidden');
      resultadosContainer.classList.add('pop-in');
    }
    if (avisoDadosAlterados) avisoDadosAlterados.classList.add('hidden');
    if (resCustoTotal) resCustoTotal.classList.remove('opacity-40');

    hasCalculated = true;
    lastCalculatedHash = getCurrentFormHash();

    // Rola suavemente até o resultado no mobile se necessário
    if (window.innerWidth < 1024) {
      resultadosContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Salva no histórico da sessão (localStorage)
    salvarNoHistorico({
      data: new Date().toISOString(),
      distancia: calculo.distancia,
      preco: calculo.preco,
      consumo: calculo.consumo,
      fuelType: dados.fuelType,
      vehicleType: dados.vehicleType,
      combustivelQtd: calculo.combustivelQtd,
      custoTotal: calculo.custoTotal,
      custoPorKm: calculo.custoPorKm
    });
  }

  /**
   * Salva o cálculo recente no localStorage
   */
  function salvarNoHistorico(item) {
    try {
      const historico = JSON.parse(localStorage.getItem('rota_exata_historico') || '[]');
      historico.unshift(item);
      // Limita a 5 itens mais recentes
      if (historico.length > 5) historico.pop();
      localStorage.setItem('rota_exata_historico', JSON.stringify(historico));
      renderHistorico();
    } catch (e) {
      console.warn('Não foi possível salvar no localStorage:', e);
    }
  }

  /**
   * Renderiza a lista de histórico recente
   */
  function renderHistorico() {
    if (!historicoLista) return;
    try {
      const historico = JSON.parse(localStorage.getItem('rota_exata_historico') || '[]');
      if (historico.length === 0) {
        historicoLista.innerHTML = '';
        if (historicoVazio) historicoVazio.classList.remove('hidden');
        if (btnLimparHistorico) btnLimparHistorico.classList.add('hidden');
        return;
      }

      if (historicoVazio) historicoVazio.classList.add('hidden');
      if (btnLimparHistorico) btnLimparHistorico.classList.remove('hidden');

      historicoLista.innerHTML = historico.map((item, idx) => {
        const isGnv = item.fuelType === 'gnv';
        const dateObj = new Date(item.data);
        const timeFormatted = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        return `
          <div class="history-item p-3 bg-white rounded-lg shadow-sm border border-slate-100 flex items-center justify-between gap-3 text-sm">
            <div>
              <div class="font-semibold text-slate-800 flex items-center gap-1.5">
                <span class="text-emerald-700">${formatMoneyBr(item.custoTotal)}</span>
                <span class="text-xs text-slate-400 font-normal">(${timeFormatted})</span>
              </div>
              <div class="text-xs text-slate-500 mt-0.5">
                ${formatDecimalBr(item.distancia)} km &bull; ${formatDecimalBr(item.combustivelQtd)} ${isGnv ? 'm³' : 'L'} de ${getFuelLabel(item.fuelType)}
              </div>
            </div>
            <button type="button" data-index="${idx}" class="btn-recuperar-historico text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded transition">
              Carregar
            </button>
          </div>
        `;
      }).join('');

      // Adiciona listener para recarregar valores do histórico
      document.querySelectorAll('.btn-recuperar-historico').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = parseInt(e.currentTarget.dataset.index, 10);
          carregarHistorico(historico[index]);
        });
      });
    } catch (e) {
      console.warn('Erro ao ler histórico:', e);
    }
  }

  /**
   * Recarrega valores de um item do histórico no formulário
   */
  function carregarHistorico(item) {
    if (!item) return;

    inputDistancia.value = formatDecimalBr(item.distancia);
    inputPreco.value = formatDecimalBr(item.preco);
    inputConsumo.value = formatDecimalBr(item.consumo);

    // Seleciona combustível
    const fuelCard = document.querySelector(`.fuel-selector-card[data-fuel="${item.fuelType}"]`);
    if (fuelCard) fuelCard.click();

    // Seleciona veículo
    const vehicleCard = document.querySelector(`.vehicle-selector-card[data-vehicle="${item.vehicleType}"]`);
    if (vehicleCard) vehicleCard.click();

    // Dispara cálculo imediatamente
    executarCalculo();
  }

  /**
   * Limpa o histórico de cálculos
   */
  if (btnLimparHistorico) {
    btnLimparHistorico.addEventListener('click', () => {
      localStorage.removeItem('rota_exata_historico');
      renderHistorico();
    });
  }

  /**
   * Função executora do cálculo acionada pelo botão ou submissão do formulário
   */
  function executarCalculo() {
    const dadosValidos = validarCampos();
    if (!dadosValidos) {
      return;
    }

    const calculo = calcularViagem(dadosValidos);
    renderResultados(calculo, dadosValidos);
  }

  /**
   * Evento de submit do formulário
   */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    executarCalculo();
  });

  /**
   * Botão Limpar / Reset
   */
  btnLimpar.addEventListener('click', () => {
    form.reset();
    limparTodosErros();

    // Redefine para padrão: Gasolina e Carro
    const defaultFuel = document.querySelector('.fuel-selector-card[data-fuel="gasolina"]');
    if (defaultFuel) defaultFuel.click();

    const defaultVehicle = document.querySelector('.vehicle-selector-card[data-vehicle="carro"]');
    if (defaultVehicle) defaultVehicle.click();

    // Esconde resultados e reseta estado
    if (resultadosContainer) resultadosContainer.classList.add('hidden');
    if (placeholderResultados) placeholderResultados.classList.remove('hidden');
    if (avisoDadosAlterados) avisoDadosAlterados.classList.add('hidden');

    hasCalculated = false;
    lastCalculatedHash = '';
    inputDistancia.focus();
  });

  // Inicializa componentes
  updateFuelUnits('gasolina');
  renderHistorico();
});
