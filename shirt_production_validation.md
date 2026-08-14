# Validação — Produção de Camisas

## Implementação

A nova rota `/camisas` foi incluída no grupo de navegação **Produção**. A tela registra, por lote, a referência da camisa, a quantidade, os custos de tecido, costureira, cortador, custos extras, o preço unitário de revendedor e a margem desejada. As simulações são gravadas no snapshot persistente `shirt_production`, isolado por usuário.

## Cálculo e recomendação

O cálculo soma os custos do lote, divide o total pela quantidade de peças e aplica a margem desejada para exibir um preço mínimo sugerido. A comparação confronta o custo interno por peça com o preço informado pelo revendedor, exibindo a alternativa de menor custo e a diferença por lote. A tela informa que a estimativa depende dos valores cadastrados e que prazo, capacidade, qualidade e capital de giro também devem compor a decisão operacional.

## Verificações

Em desktop, a tela apresentou a navegação ativa, ação de nova simulação, painel explicativo e estado vazio sem sobreposições. Em 390 × 844 pixels, a hierarquia foi reorganizada em coluna única, mantendo texto, cards e botões legíveis, sem corte ou rolagem horizontal. A validação técnica concluiu com TypeScript sem erros, sete arquivos de teste e 20 testes Vitest aprovados, além do build de produção aprovado. O build mantém apenas o aviso não bloqueador referente ao tamanho do pacote JavaScript principal.

## Verificação do domínio publicado

Após o checkpoint `08d1d4d8`, duas consultas consecutivas a `https://nocorehub-jcf6ltmc.manus.space/camisas` ainda retornaram o bundle anterior, sem a entrada **Camisas** na navegação e com o redirecionamento visual para o Dashboard. O ambiente de desenvolvimento, por sua vez, exibiu a nova tela em desktop e mobile. A confirmação de propagação no domínio permanente permanece pendente antes de considerar a validação de produção concluída.

Após a conclusão da publicação automática do checkpoint `b63d3063`, a rota foi consultada novamente e apresentou corretamente a tela **Produção de camisas**, a entrada ativa **Camisas** na navegação e os controles de nova simulação. A versão permanente está, portanto, propagada e acessível.
