# Rota Exata - Calculadora de Combustível ⛽🚗

Aplicação web moderna, intuitiva e responsiva desenvolvida para planejar viagens, calcular com precisão a quantidade estimada de combustível necessária e o custo total financeiro do trajeto.

Projeto desenvolvido rigorosamente de acordo com os requisitos especificados em [`requisitos.md`](requisitos.md).

---

## 🚀 Demonstração e Publicação (GitHub Pages)

O projeto foi projetado com uma arquitetura estática desacoplada (`index.html`, `css/style.css`, `js/app.js`), funcionando imediatamente e sem necessidade de servidor no **GitHub Pages**:

1. Acesse o repositório no GitHub.
2. Vá em **Settings** > **Pages**.
3. Em **Branch**, selecione `main` e pasta `/ (root)`.
4. Salve. O site estará online com todas as funcionalidades operando em alta performance!

---

## 📌 Funcionalidades e Regras de Negócio (CORE)

- **Parâmetros de Entrada:**
  - Distância percorrida na viagem (em km).
  - Preço do combustível por litro ou unidade monetária brasileira (R$).
  - Consumo médio do veículo (km/L ou km/m³).
  - Seleção interativa do tipo de combustível: **Gasolina**, **Etanol**, **Diesel** e **GNV**.
  - Seleção do tipo de veículo: **Carro de Passeio**, **Motocicleta**, **Van/Utilitário** e **Caminhão/Ônibus**.

- **Tratamento Dinâmico de Unidades:**
  - Para combustíveis líquidos (*Gasolina, Etanol e Diesel*): consumo em `km/L`, preço em `R$/L` e volume resultante em `litros`.
  - Para *GNV* (Gás Natural Veicular): consumo em `km/m³`, preço em `R$/m³` e volume resultante em `m³`.

- **Fórmulas Matemáticas:**
  $$\text{Combustível Necessário} = \frac{\text{Distância}}{\text{Consumo Médio}}$$
  $$\text{Custo Total} = \text{Combustível Necessário} \times \text{Preço por Unidade}$$
  $$\text{Custo por Quilômetro} = \frac{\text{Custo Total}}{\text{Distância}}$$

- **Padrão Brasileiro (pt-BR):**
  - Aceita números decimais informados tanto com vírgula quanto com ponto (ex: `12,5` ou `12.5`).
  - Apresenta moeda no formato padrão `R$ 0,00` e números com separador decimal por vírgula.
  - Resultados apresentados arredondados para duas casas decimais, preservando a precisão interna dos cálculos.

- **Validação e Prevenção de Erros:**
  - Impede cálculos caso valores sejam menores ou iguais a zero, vazios ou não numéricos.
  - Exibe mensagens de erro claras e amigáveis posicionadas logo abaixo do campo correspondente com animação visual (*shake*).
  - **Prevenção de resultados defasados:** se qualquer campo for modificado após um cálculo, um alerta visual indica que os dados foram alterados e orienta um novo clique no botão "Calcular Viagem".

- **Recursos Adicionais:**
  - Histórico dos últimos 5 cálculos da sessão para consulta e recarregamento rápido.
  - Botão "Limpar Dados" para reiniciar o formulário.
  - Seção educativa com a "Regra dos 70%" (Etanol vs Gasolina).
  - 100% livre de cadastro, login ou coleta de dados privados.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend Estático (Compatível com GitHub Pages):**
  - **HTML5 Semântico:** Estrutura acessível com atributos WAI-ARIA.
  - **Tailwind CSS + CSS3 Personalizado:** Design moderno com degradês, glassmorphism e animações.
  - **JavaScript Moderno (ES6+):** Validação em tempo real, manipulação DOM e persistência local (*localStorage*).
- **Backend Estruturado (Opcional para ambientes Apache/Nginx/XAMPP):**
  - **PHP 8+ Estruturado:** Processamento de requisições via POST com sessões nativas (`$_SESSION`).
  - **MySQL (PDO):** Conexão segura utilizando *Prepared Statements* para persistência dos cálculos.

---

## 📁 Estrutura de Arquivos

```text
RCU/
├── index.html          # Aplicação principal (GitHub Pages)
├── css/
│   └── style.css       # Estilos personalizados, animações e responsividade
├── js/
│   └── app.js          # Validação, cálculos matemáticos, formatação pt-BR e DOM
├── php/
│   ├── index.php       # Versão PHP estruturada com sessões nativas
│   ├── calcular.php    # Processamento de formulário no servidor e regras de negócio
│   ├── db.php          # Conexão PDO segura com MySQL
│   └── schema.sql      # Script de criação do banco e tabela MySQL
├── test_calculo.js     # Testes automatizados das regras matemáticas e parsing pt-BR
├── requisitos.md       # Especificação original do projeto
└── README.md           # Documentação completa
```

---

## 💻 Como Executar Localmente

### 1. Versão Estática (Recomendado / GitHub Pages)
Abra diretamente o arquivo `index.html` em qualquer navegador web moderno, ou inicie um servidor simples:
```bash
# Com Node.js:
npx serve .

# Ou com Python:
python -m http.server 8000
```
Acesse no navegador: `http://localhost:8000`

### 2. Versão PHP + MySQL
Caso queira testar a implementação com backend PHP e banco de dados MySQL:
1. Certifique-se de ter o PHP e o MySQL (ex: via XAMPP ou Docker) instalados.
2. Importe o script `php/schema.sql` no seu MySQL:
   ```bash
   mysql -u root -p < php/schema.sql
   ```
3. Inicie o servidor embutido do PHP apontando para a pasta raiz ou `/php`:
   ```bash
   php -S localhost:8000
   ```
4. Acesse: `http://localhost:8000/php/index.php`

---

## 🧪 Testes Automatizados

O repositório inclui testes unitários para certificar as fórmulas e o tratamento de decimais:
```bash
node test_calculo.js
```

---

## 📄 Licença
Este projeto está sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.
