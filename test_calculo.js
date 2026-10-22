// Testes unitários para as funções lógicas do Rota Exata

function parseBrNumber(value) {
  if (!value) return NaN;
  if (typeof value === 'number') return value;

  let cleanStr = value.toString().trim();
  if (cleanStr.includes('.') && cleanStr.includes(',')) {
    cleanStr = cleanStr.replace(/\./g, '').replace(',', '.');
  } else if (cleanStr.includes(',')) {
    cleanStr = cleanStr.replace(',', '.');
  }

  const num = parseFloat(cleanStr);
  return isNaN(num) ? NaN : num;
}

function calcular(distancia, consumo, preco) {
  if (distancia <= 0 || consumo <= 0 || preco <= 0) {
    throw new Error('Todos os valores devem ser maiores que zero.');
  }
  const combustivel = distancia / consumo;
  const custo = combustivel * preco;
  return {
    combustivel: Number(combustivel.toFixed(2)),
    custo: Number(custo.toFixed(2))
  };
}

// Asserts
console.log('--- Testando conversão numérica pt-BR ---');
console.assert(parseBrNumber('12,5') === 12.5, 'Erro no parse de 12,5');
console.assert(parseBrNumber('12.5') === 12.5, 'Erro no parse de 12.5');
console.assert(parseBrNumber('1.250,50') === 1250.50, 'Erro no parse de 1.250,50');
console.assert(isNaN(parseBrNumber('abc')), 'Erro com não-número');
console.assert(isNaN(parseBrNumber('')), 'Erro com vazio');
console.log('Sucesso no parse numérico!');

console.log('--- Testando cálculo de viagem ---');
const res1 = calcular(300, 10, 5.50);
console.assert(res1.combustivel === 30.00, `Esperado 30, obtido ${res1.combustivel}`);
console.assert(res1.custo === 165.00, `Esperado 165, obtido ${res1.custo}`);
console.log('Cálculo 1 (Gasolina 300km, 10km/L, R$5,50/L):', res1);

const res2 = calcular(130, 13, 4.79);
console.assert(res2.combustivel === 10.00, `Esperado 10, obtido ${res2.combustivel}`);
console.assert(res2.custo === 47.90, `Esperado 47.90, obtido ${res2.custo}`);
console.log('Cálculo 2 (GNV 130km, 13km/m³, R$4,79/m³):', res2);

console.log('Todos os testes passaram com sucesso!');
