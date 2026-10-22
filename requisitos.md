# Rota Exata

## Objetivos
- Desenvolver um site responsivo chamado Calculadora de Combustível, que permita ao usuário calcular a quantidade de combustível necessária para percorrer uma determinada distância e estimar o custo total da viagem. O site deverá permitir informar a distância em quilômetros, o preço do combustível por litro ou unidade, o tipo de combustível, o tipo de veículo e o consumo médio do veículo. Ao clicar no botão "Calcular", o sistema deverá apresentar a quantidade estimada de combustível necessária e o custo total da viagem. A interface deverá ser moderna, intuitiva, organizada e adaptável a celulares e computadores.

### Stack Tecnlógico
- Backend: PHP estruturado com sessões nativas
- Banco de dados: MySQL (PDO para segurança)
- Frontend: HTML5, PHP, CSS, Tailwind CSS

#### Regras de negócio (CORE)
- O usuário deverá informar a distância da viagem, o preço do combustível e o consumo médio do veículo.
- O usuário deverá selecionar o tipo de combustível e o tipo de veículo.
- A distância, o preço e o consumo deverão ser maiores que zero.
- A quantidade de combustível necessária será calculada pela fórmula: distância percorrida ÷ consumo médio.
- O custo total será calculado pela fórmula: quantidade de combustível necessária × preço por unidade.
- Para gasolina, etanol e diesel, utilizar o consumo em km/L e o preço em R$/L.
- Para GNV, quando selecionado, utilizar o consumo em km/m³ e o preço em R$/m³.
- O sistema deverá aceitar números decimais, inclusive com vírgula ou ponto, e apresentar os valores no padrão brasileiro.
- Caso algum campo obrigatório esteja vazio ou contenha um valor inválido, o cálculo não deverá ser realizado e uma mensagem de erro deverá ser exibida.
- Após o cálculo, apresentar a distância, a quantidade estimada de combustível necessária e o custo total da viagem.
- O cálculo deverá utilizar o preço informado pelo usuário. Não afirmar que o preço é atualizado automaticamente, a menos que uma API confiável seja implementada.
- Os resultados deverão ser arredondados para duas casas decimais na apresentação, mantendo precisão suficiente durante os cálculos.

##### Regras Globais
- Todo o conteúdo do site deverá estar em português brasileiro (pt-BR).
- Utilizar o real brasileiro (R$) como moeda.
- Criar um design moderno, limpo, intuitivo e profissional.
- Garantir compatibilidade com celulares, tablets e computadores.
- Utilizar cores e elementos visuais relacionados a combustível, veículos e viagens.
- Destacar visualmente o botão "Calcular" e o resultado do custo total.
- Organizar os campos com títulos e instruções claras.
- Exibir mensagens de erro compreensíveis e próximas aos campos correspondentes.
- Garantir boa legibilidade, contraste adequado e acessibilidade básica.
- Não permitir que os resultados anteriores sejam apresentados como se fossem os resultados de um novo cálculo.
- Não exigir cadastro, login ou coleta de dados pessoais.
- Manter o código organizado, legível e separado em arquivos HTML, CSS e JavaScript.
- Garantir que todas as funcionalidades operem corretamente após a publicação no GitHub Pages.
- Não inventar preços atuais de combustíveis. Permitir a inserção manual do preço e, futuramente, a integração com uma API confiável.
- https://combustivelapi.com.br/#documentacao
- https://combustivelapi.com.br/api/precos/
