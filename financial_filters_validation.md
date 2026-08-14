# Validação — Filtros Financeiros

## Escopo entregue

O Financeiro agora permite recortar os lançamentos persistidos por situação, tipo e período. Os períodos disponíveis incluem histórico completo, atrasos, próximos sete dias e mês atual. Os três indicadores superiores passam a refletir somente o conjunto filtrado, mostrando receitas, despesas e saldo do recorte. Registros legados sem situação continuam tratados como liquidados.

## Verificações técnicas

A filtragem recebeu testes para vencimentos em atraso, próximos sete dias, registros legados e resumo de saldo. A checagem TypeScript foi concluída sem erros, onze arquivos de teste executaram com **28 testes aprovados**, e o build de produção foi aprovado. O único aviso mantido é o tamanho do bundle principal acima de 500 kB, sem impacto na publicação.

## Verificação visual

Em desktop, os filtros, o contador do recorte, os indicadores e a tabela foram exibidos com espaçamento e hierarquia consistentes. Em 390 × 844 pixels, os três filtros foram reorganizados em coluna única, mantendo rótulos e opções legíveis; a tabela permanece em contêiner de rolagem horizontal para preservar suas seis colunas.

## Verificação do domínio permanente

Na primeira abertura publicada com `?rev=5f7b4917`, após a sessão concluir o carregamento, a tela ainda apresentou o bundle anterior: não exibiu o bloco **Leitura do período**, os filtros nem os indicadores identificados como **no recorte**. A implementação está aprovada no ambiente de desenvolvimento; a confirmação de propagação permanecerá pendente até o próximo ciclo de publicação automática.

Após o checkpoint de repropagação e uma nova consulta com `?rev=5b1287de-2`, o Financeiro permanente exibiu os indicadores de receitas, despesas e saldo **no recorte**, o bloco **Leitura do período** e os três filtros de situação, tipo e período. A publicação dos filtros financeiros está confirmada.
