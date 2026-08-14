# Validação — Melhorias Operacionais

## Central Operacional

O Dashboard passou a interpretar somente os registros persistentes de pedidos, estoque e financeiro. A Central Operacional organiza, em ordem de gravidade, saldo operacional negativo, pedidos aguardando pagamento, itens no estoque mínimo e pedidos em produção. Cada alerta fornece uma ação direta para o módulo correspondente, sem introduzir dados demonstrativos ou recomendações baseadas em informações não cadastradas.

## Busca rápida

Foi incluída uma paleta de navegação que permite localizar qualquer módulo pelo botão **Ir para módulo** ou pelo atalho `Ctrl/Cmd + K` em desktop. A paleta reutiliza o registro de navegação existente, de modo que os resultados permanecem coerentes com as rotas disponíveis no ERP.

## Verificações

No desktop, o Dashboard exibiu corretamente os indicadores reais, a Central Operacional em estado sem alertas, o botão de nova ação e o acesso à navegação rápida. No viewport móvel de 390 × 844 pixels, os cards e ações foram reorganizados em coluna única, sem corte horizontal e com a Central Operacional preservando legibilidade. A checagem TypeScript foi aprovada, oito arquivos de teste executaram com **22 testes aprovados**, e o build de produção foi concluído. O build mantém apenas o aviso não bloqueador de bundle acima de 500 kB.

## Verificação de publicação

Após o checkpoint `6e5d0e41`, duas consultas consecutivas ao Dashboard no domínio permanente ainda mostraram o bundle anterior: a Central Operacional e o botão de busca rápida não estavam visíveis. A versão de desenvolvimento apresenta ambos corretamente. A confirmação da propagação permanece pendente e será revalidada após o próximo ciclo de publicação automática.

Após a notificação de publicação do checkpoint `d56b908b`, o Dashboard permanente apresentou corretamente a Central Operacional, a indicação de operação sem alertas e os dois pontos de acesso à busca rápida. A versão publicada também confirmou a entrada **Camisas** na navegação. A validação de propagação está concluída.
