# Validação de persistência — 2026-08-12

## Supabase

A API REST foi validada com um registro efêmero em `erp_records`: a criação, leitura e exclusão retornaram sucesso. Em seguida, os registros de `erp_records` e os snapshots de `erp_workspace_snapshots` foram removidos conforme a confirmação do usuário. As tabelas técnicas `modules` e `permissions` não foram acessadas durante essa limpeza.

## Interface

As telas autenticadas de **Produtos**, **Pedidos**, **Controle de estoque** e **Financeiro** foram renderizadas em desktop. Todas exibem estado vazio apropriado, ação visível de inclusão e estrutura preparada para editar e excluir os registros que forem adicionados. A visualização não mostrou erros de layout, sobreposição ou contraste.

Em viewport móvel de 375 × 812 pixels, as telas de **Produção**, **Sublimação**, **Marketing** e **Biblioteca de artes** mantiveram o botão de inclusão acessível, os estados vazios legíveis e os cartões sem transbordamento horizontal. Produção, sublimação e marketing agora permitem adicionar e remover registros por snapshots no Supabase; a biblioteca também inicia vazia e permite adicionar e remover nomes de artes.

## CRUD fim a fim dos cadastros centrais

Um registro efêmero foi criado, atualizado, relido e excluído em `erp_records` por meio da API REST do Supabase. A exclusão foi confirmada antes do encerramento do teste, sem deixar dados de validação no ambiente do usuário. A suíte unitária cobre adicionalmente os contratos de atualização e exclusão de **Pedidos**, **Estoque** e **Financeiro**, além da listagem, criação e exclusão de Produtos. O comando de validação final concluiu com **checagem de tipos aprovada**, **12 testes aprovados** e **build de produção aprovado**.

O log recente do navegador, após o reinício do servidor, contém somente conexões de desenvolvimento e mensagens informativas. O erro de importação registrado anteriormente ocorreu antes da troca da camada de dados e não reapareceu após o processo atual.

O painel inicial também foi atualizado para consultar Pedidos, Contatos e Financeiro pela camada persistente. A visualização desktop confirma que ele parte de métricas zeradas, sem dados demonstrativos, e apresenta um estado vazio claro para os pedidos recentes.

O Centro DTF passou a enviar a simulação calculada para a fila persistente de produção, com validação de login e valores de metragem e custo. Após essa atualização, a checagem de tipos, os 12 testes automatizados e o build de produção foram executados novamente com sucesso.

As configurações da empresa também passaram a iniciar em branco, eliminando CNPJ, telefone e nome fictícios. A checagem de tipos, a suíte de 12 testes e o build de produção foram executados novamente após esta limpeza.

O IA Studio foi conectado ao procedimento autenticado de geração de briefing no servidor. A tela foi verificada visualmente em desktop: o campo de solicitação, a ação de gerar e a área reservada ao briefing retornado estão legíveis e responsivos. A validação técnica posterior aprovou a checagem de tipos, o build e **13 testes**, incluindo a proteção da rota de IA para usuários não autenticados.

A tela de Relatórios agora consulta Produtos, Pedidos e Financeiro persistentes, calcula indicadores sem dados demonstrativos e permite exportar as movimentações financeiras em CSV. A visualização desktop confirmou o estado inicial vazio e legível; a checagem de tipos, os 13 testes e o build de produção também foram aprovados após esta alteração.

Relatórios também trata falhas em qualquer uma das três consultas persistentes com mensagem clara e ação de nova tentativa para recarregar os dados. O estado vazio foi verificado visualmente, e a implementação de erro foi validada pela checagem de tipos, suíte automatizada e build de produção.

Para validar os dados reais, foram inseridos temporariamente no Supabase um produto com estoque, um pedido e uma receita, todos identificados como registros de validação. A tela exibiu corretamente receita de R$ 900,00, um pedido, saldo operacional de R$ 900,00, produto com 12 unidades e margem de 100,0%. Os três registros efêmeros foram removidos imediatamente após a conferência, preservando o ambiente operacional limpo.

A tela de Marketing passou a manter rascunhos de campanha e cupons no armazenamento persistente do ERP, ambos com controle de exclusão. A verificação visual confirmou campos de inclusão, estados vazios e ações legíveis, sem simular qualquer disparo de WhatsApp, e-mail ou outro serviço externo.

O contrato de snapshots do backend já aceita o módulo `marketing`; foi adicionada cobertura automatizada específica para sua gravação autenticada. A suíte passou com **14 testes**.

O teste de Marketing foi ampliado para cobrir gravação e leitura do mesmo snapshot após recarga pelo backend. A remoção no painel regrava a lista sem o item removido, seguindo o mesmo contrato de snapshot já validado.

Para a validação visual fim a fim, um rascunho e um cupom efêmeros foram gravados no snapshot `marketing` no Supabase. A tela recarregou ambos corretamente. Em seguida, o snapshot temporário foi removido e uma nova recarga confirmou os estados vazios; nenhum registro de validação permaneceu no ambiente.

Em viewport móvel de 390 × 844 pixels, Marketing mantém os dois formulários em uma coluna, campos com largura integral, botões acessíveis e estados vazios sem corte de conteúdo ou rolagem horizontal.

Após reinicialização do ambiente, o servidor iniciou normalmente na porta 3000 e o log recente não contém erro de importação ou erro de navegador. Restaram somente mensagens informativas de desenvolvimento e um aviso não bloqueador sobre atualização de `baseline-browser-mapping`.

A auditoria de tamanhos, excluindo dependências e artefatos de build, não encontrou mídia ou outro ativo de grande porte no repositório. Os maiores arquivos de projeto são código, lockfile e logs locais de desenvolvimento; a identidade visual segue referenciada pelo armazenamento permanente externo ao diretório do projeto.

O domínio publicado `https://nocorehub-jcf6ltmc.manus.space` foi aberto e carregou a aplicação com título, marca, navegação principal, painel inicial e ação de entrada. Sem sessão autenticada, o ERP apresentou corretamente a mensagem de acesso protegido, em vez de expor registros operacionais.

A rota pública de **Relatórios** também foi aberta diretamente no domínio publicado e apresentou a tela correta com proteção de acesso, sem carregar indicadores ou movimentos de uma conta sem sessão.

No domínio publicado, uma sessão autenticada foi reconhecida como `thiago sousa`. A tela de Contatos criou o registro efêmero “VALIDAÇÃO TEMPORÁRIA — REMOVER”, exibiu-o na listagem e o removeu imediatamente. A tela voltou ao estado vazio, confirmando o ciclo de criação e exclusão sem deixar dados de teste na conta.

A tela autenticada de Produtos também foi aberta no domínio publicado e concluiu sua consulta persistente, exibindo o estado vazio com as ações de cadastro disponíveis. Não foram encontrados dados residuais de validação.

Um produto efêmero foi criado no domínio publicado com preço, estoque, SKU e variação. Ele apareceu imediatamente no catálogo com os valores corretos e controles de edição e exclusão disponíveis. O registro será removido ao fim desta validação.

A edição do mesmo produto alterou o preço de R$ 49,90 para R$ 59,90 e a listagem publicada refletiu o novo valor após o salvamento, confirmando a atualização persistente.

A tentativa de exclusão pelo navegador excedeu o tempo de resposta quando a sessão do navegador ficou indisponível. Como medida de limpeza, o produto identificado pelo SKU exclusivo `TESTE-ERP-001` foi removido diretamente da tabela persistente do Supabase e a resposta confirmou sua exclusão. Nenhum dado de validação permaneceu no catálogo.

No domínio publicado, um pedido efêmero de R$ 125,00 foi criado e exibido na tabela com cliente, item e status inicial “Aguardando pagamento”. A interface disponibilizou os controles de avançar status, editar e excluir; o registro será removido após a validação desses controles.

O comando “Avançar” atualizou o status do mesmo pedido para “Em produção”, e a mudança foi refletida pela consulta persistente publicada.

A edição alterou o total do pedido de R$ 125,00 para R$ 150,00 e a tabela refletiu o novo valor. A exclusão pela interface excedeu o tempo de resposta quando o navegador ficou indisponível. A primeira tentativa de limpeza usou um campo JSON incorreto e não removeu o pedido; o registro foi então removido definitivamente pelo trio correto de proprietário, módulo e identificador persistente. A consulta posterior retornou vazia, confirmando que nenhum pedido de teste permaneceu.

Ao iniciar a validação autenticada de Estoque no domínio publicado, a sessão do navegador foi encerrada e a visualização seguinte retornou para uma página em branco. A continuidade deste teste depende de uma nova sessão autenticada; nenhuma alteração de estoque foi executada durante essa interrupção.

Os ciclos persistentes de Estoque e Financeiro foram então validados diretamente no Supabase com registros efêmeros. O estoque foi criado com 10 unidades e atualizado para 11; a transação foi criada como receita de R$ 100,00 e atualizada para despesa de R$ 125,00. A primeira verificação automática falhou apenas por diferença de espaçamento no JSON, mas as respostas de criação e atualização confirmaram os valores. Ambos os registros foram removidos pelo proprietário, módulo e identificador e consultas posteriores retornaram vazias.

Os módulos operacionais baseados em snapshots também foram validados de forma isolada para não tocar dados do usuário. Fornecedores, Orçamentos, Produção, Sublimação, Biblioteca, Configurações e Marketing receberam gravação inicial, atualização, leitura e remoção usando um proprietário temporário. Após a limpeza, a consulta desse proprietário retornou vazia.

A validação consolidada final executou `pnpm check`, `pnpm test` e `pnpm build` com sucesso. O TypeScript não apresentou erros, as cinco suítes totalizaram 14 testes aprovados e o build de produção concluiu normalmente. O bundler emitiu somente o aviso não bloqueador de que o pacote JavaScript principal ultrapassa 500 kB após minificação.

As páginas de exemplo `Home.tsx` e `ComponentShowcase.tsx`, sem referências na aplicação, foram removidas para manter apenas a estrutura relevante ao ERP. A checagem de tipos, as cinco suítes com 14 testes e o build de produção foram executados novamente com sucesso após a limpeza.

No domínio publicado, a Precificação foi aberta em sessão autenticada e o custo da peça foi alterado de R$ 25,00 para R$ 40,00. O resultado respondeu imediatamente, recalculando o custo total de R$ 38,50 para R$ 53,50, o preço de venda de R$ 385,00 para R$ 535,00 e o lucro estimado de R$ 308,00 para R$ 428,00. A ferramenta funciona como simulador local e não criou registros operacionais.

Os logs recentes foram revisados novamente. O servidor atual iniciou normalmente em `http://localhost:3000/` e o console do navegador contém somente mensagens de conexão e atualização de desenvolvimento. A falha de importação registrada às 18:49 não aparece após o reinício das 19:20 e não representa erro ativo.

O estado de falha de Relatórios foi validado no domínio publicado ao bloquear temporariamente apenas as requisições tRPC da sessão do navegador. A tela apresentou a mensagem “Não foi possível carregar os relatórios” e a ação “Tentar novamente”. Após recarregar a página e restaurar a rede, a consulta voltou a exibir corretamente os indicadores zerados e os estados vazios, sem deixar dados temporários.

Uma verificação visual consolidada no preview autenticado confirmou que Fornecedores, Orçamentos, Produção, Centro DTF, Sublimação, Estoque, Financeiro e Biblioteca carregam sem erro de layout. Todas preservam seus estados iniciais vazios, ações de inclusão visíveis e contraste adequado; DTF expõe a calculadora e a ação de envio à fila, enquanto Produção mantém as cinco colunas do kanban legíveis.

O envio DTF foi validado no domínio publicado. Duas simulações efêmeras foram gravadas no snapshot `production`; a consulta autenticada confirmou o conteúdo persistido e o kanban passou a exibir as duas ordens na coluna Fila após a sincronização remota concluir. A primeira navegação imediata ocorreu antes dessa gravação finalizar, por isso mostrou fila vazia. A limpeza pelo botão excedeu o tempo do navegador, então o snapshot temporário foi removido diretamente no Supabase e a consulta posterior retornou vazia.

Após a validação DTF, a checagem de tipos, as cinco suítes automatizadas (14 testes) e o build de produção foram executados novamente com sucesso. O build mantém somente o aviso não bloqueador sobre o tamanho do pacote JavaScript principal.

Os estados de Relatórios foram extraídos para uma função pura e receberam cobertura automatizada de carregamento, falha, vazio e dados. A checagem TypeScript, seis suítes Vitest com **17 testes** e o build de produção foram aprovados após essa alteração. O aviso de tamanho do pacote permanece não bloqueador.

Na revisão final, os componentes antigos de Dashboard, Produtos e Pedidos — que já não participavam do roteamento ativo — foram removidos do arquivo principal. A checagem TypeScript, as seis suítes Vitest com 17 testes e o build de produção foram executados novamente com sucesso. O único aviso mantido é o tamanho do bundle principal acima de 500 kB, sem impedir a compilação nem a publicação.

Uma verificação visual final, com sessão autenticada, confirmou o Dashboard e a tela de Relatórios no ambiente ativo. Ambas mostram métricas zeradas coerentes com a base limpa, estados vazios legíveis, ações principais disponíveis e a identidade visual oficial sem sobreposição ou corte aparente.

Após o checkpoint de consolidação, a rota `https://nocorehub-jcf6ltmc.manus.space/relatorios` foi aberta no domínio permanente com sessão autenticada. A tela carregou as métricas, os estados vazios e a ação de exportação CSV normalmente, confirmando a disponibilidade publicada da versão consolidada.

## Biblioteca de artes — catalogação assistida por IA — 2026-08-13

A Biblioteca foi reestruturada para receber mídias reais do computador em lote, preservando o nome original e apresentando uma fila de revisão antes de qualquer catalogação. A interface foi inspecionada em **1280 × 720** e **390 × 844**: em desktop, a área de importação, os indicadores de acervo e a mensagem de estado vazio ficaram visíveis sem sobreposição; em celular, o botão de importação permaneceu amplo, os indicadores foram reorganizados em duas colunas e o texto do fluxo de revisão continuou legível, sem rolagem horizontal.

O fluxo informa os formatos aceitos (PNG, JPG e WebP), o limite de 8 MB por imagem e o máximo de 20 mídias por importação. A revisão humana é explicitamente descrita: a IA sugere nome, modelo, tema e confiança, mas a aplicação só registra a catalogação depois de uma aprovação manual.

## Aprovação administrativa — 2026-08-13

Foi incluída uma barreira de aprovação para o ERP. Após o login, contas com papel `user` recebem uma tela de acesso pendente e não carregam módulos operacionais. No servidor, todos os procedimentos de dados e snapshots passaram a exigir papel `admin`; chamadas sem sessão preservam a resposta `UNAUTHORIZED` e contas autenticadas, mas ainda não aprovadas, recebem `FORBIDDEN`.

O proprietário, identificado pela configuração do ambiente, continua com papel administrativo e encontra em **Configurações** o painel de aprovação. Esse painel mostra contas autenticadas, identifica seu estado como pendente ou aprovado e permite aprovar ou revogar outras contas, sem permitir a revogação do próprio proprietário.

Foram executados `pnpm check`, `pnpm test` e `pnpm build` com sucesso. A suíte agora possui **15 arquivos e 37 testes aprovados**, incluindo regras puras de aprovação e a proteção efetiva de um procedimento administrativo. O build manteve apenas o aviso não bloqueador de bundle JavaScript principal acima de 500 kB após minificação.

O painel de Configurações foi inspecionado visualmente no preview autenticado, em desktop e em 390 × 844 pixels. A lista de aprovações, indicadores de estado e ações de aprovação permaneceram legíveis, sem transbordamento horizontal, e a central de exportação existente permaneceu acessível abaixo do novo painel.

O painel foi reforçado com estado de carregamento, mensagem de erro com ação de nova tentativa e estado vazio orientado para a primeira conta autenticada. Após esse ajuste, a checagem TypeScript, os 37 testes automatizados e o build de produção foram repetidos com sucesso; a visualização desktop do perfil proprietário confirmou que a lista real de aprovações e as ações seguem íntegras.

A validação final adicionou testes diretos do roteador de acesso para listagem pelo proprietário, aprovação, revogação, bloqueio de administrador não proprietário e proteção contra a revogação do proprietário. A consulta somente de contagem no banco confirmou a existência de um perfil `admin` e um perfil `user`, sem alterar dados. A tela do proprietário foi confirmada no preview, enquanto a mesma regra pura `canAccessErp`, coberta por testes, é usada diretamente pelo componente `App` para renderizar a tela **Acesso pendente** sempre que a conta autenticada não tiver papel administrativo. A rodada final aprovou TypeScript, **16 arquivos / 41 testes Vitest** e o build de produção; permanece apenas o aviso não bloqueador de tamanho do bundle.

Após o checkpoint de publicação, a primeira consulta ao domínio permanente ainda retornou o bundle anterior, sem as mensagens do painel de aprovação. Nenhum dado ou configuração foi alterado nessa consulta; a propagação automática seguirá sendo acompanhada antes da confirmação final de disponibilidade.

A propagação foi confirmada na consulta seguinte. Embora a tela pública mantenha corretamente o painel de aprovação oculto fora de sessão, o bundle JavaScript servido por `https://nocorehub-jcf6ltmc.manus.space` contém as mensagens exclusivas **“Aprovar administradores”** e **“Sua conta aguarda aprovação”**. Isso confirma que a versão `cb8f4aba` com o fluxo administrativo está disponível no domínio permanente.

## Auditoria ampliada de permissões — 2026-08-13

Foi auditado o roteador completo do ERP. Os grupos de clientes, produtos, pedidos, estoque, financeiro, snapshots operacionais, IA e gestão de acessos usam `adminProcedure`; somente leitura de sessão e encerramento de sessão permanecem públicos de propósito. A nova suíte integrada confirma que uma conta com papel `user` recebe `FORBIDDEN` antes que cada grupo execute leitura de dados ou geração de conteúdo. A suíte passou com **17 arquivos e 42 testes**, e `pnpm check` e `pnpm build` também foram concluídos sem erros bloqueadores. Essa evidência confirma a proteção de backend, mas a validação visual fim a fim de cada rota administrativa segue registrada como pendência separada.

No preview autenticado como proprietário, foram abertas e renderizadas sem redirecionamento indevido as rotas de Dashboard, Contatos, Produtos, Pedidos, Estoque, Financeiro, Relatórios, IA Studio, Fornecedores, Precificação, Orçamentos, Produção, Camisas, DTF, Sublimação e Biblioteca. As telas exibiram seus conteúdos e estados vazios operacionais esperados. Essa inspeção confirma o acesso administrativo em execução para os módulos observados; a prova visual de uma sessão pendente em cada rota continua dependente de uma segunda conta autenticada, enquanto o bloqueio correspondente já está coberto por chamada direta e regra de interface testada.

Para tornar a política de interface verificável, as 18 rotas administrativas foram centralizadas em `erpAdministrativePaths`. O aplicativo passou a consultar `getErpRouteAccess` antes de renderizar o shell, e os testes percorrem todas as rotas com os dois perfis: `admin` recebe `allowed` e `user` recebe `pending`; login público e rota desconhecida não são bloqueados por essa regra. A validação técnica posterior aprovou TypeScript, **17 arquivos / 44 testes** e build de produção, mantendo apenas o aviso não bloqueador do bundle acima de 500 kB.

A barreira foi então extraída para o componente `AccessGate`, que é a implementação efetivamente usada pelo `App`. O teste de integração renderiza esse componente em todas as 18 rotas com sessão `admin` e com sessão `user`: o administrador recebe o conteúdo administrativo, enquanto a conta pendente recebe a tela **Acesso pendente** e não recebe o conteúdo protegido. A configuração Vitest foi estendida para executar testes TSX. A validação final aprovou TypeScript, **18 arquivos / 46 testes** e build de produção. No preview autenticado, Dashboard e Configurações também foram reabertos com sucesso após a extração da barreira.

Foi adicionada uma segunda integração que monta o componente `App` com o `Router` real e uma sessão autenticada simulada. Nas 18 rotas administrativas, o perfil `admin` renderiza o shell e o conteúdo da rota; o perfil `user` renderiza exclusivamente a tela **Acesso pendente**, sem conteúdo administrativo nem shell operacional. A rodada posterior aprovou TypeScript, **19 arquivos / 48 testes** e build de produção. A validação em navegador de uma segunda conta real permanece como etapa opcional de confirmação operacional, sem alteração de papéis ou dados de usuários existentes.

## Pesquisa financeira — 2026-08-13

A área Financeiro recebeu pesquisa por descrição, combinável com situação, tipo e período. A busca é insensível a maiúsculas, minúsculas e acentuação, não altera os registros persistidos e atualiza simultaneamente a tabela, o contador e os indicadores do recorte. A lógica foi coberta por teste de combinação com filtros, inclusive termo acentuado; a rodada completa aprovou TypeScript, **19 arquivos / 49 testes** e build de produção. A inspeção visual em desktop e 390 × 844 pixels confirmou os quatro controles sem sobreposição ou corte horizontal; em tela móvel, a pesquisa e os filtros passam a ocupar linhas independentes para preservar a leitura e o toque.

## Diagnóstico de sincronização No Corre Shop — 2026-08-13

O ERP não registrou nenhuma solicitação recente para a rota de recepção de pedidos nos logs locais; as leituras de pedidos autenticadas retornaram listas vazias. A loja atualmente publicada informa explicitamente que a finalização acontece pelo WhatsApp. A tentativa de inspecionar o conteúdo dos bundles pelo navegador foi bloqueada por falha de leitura entre origens, portanto não foi usada como prova de integração. Até este ponto, não houve criação, edição ou remoção de pedido real durante o diagnóstico.

Em inspeção somente-leitura do HTML e bundle publicados da loja `https://nocoreshop-adsfkwqx.manus.space`, foram encontradas referências ao link `wa.me` e ao fluxo de atendimento por WhatsApp, mas não as expressões do receptor do ERP (`/api/shop/order`, `nocorehub` ou `SHOP_ERP`). A tarefa original referenciada da loja possui arquivos recuperáveis, porém é um projeto separado do ERP; a correção deverá ser aplicada e publicada nesse projeto de origem para que novos pedidos sejam enviados ao receptor já disponível no ERP.

Quanto à sincronização automática de pedidos da No Corre Shop, o receptor seguro no ERP continua pronto e testado. A referência da tarefa da loja confirma que ela é um projeto separado; a validação de um pedido real depende da publicação do checkout estruturado naquele projeto de origem. Este projeto do ERP não deve alterar ou publicar automaticamente o código da loja sem que o projeto correspondente esteja ativo.

A recuperação do código mais recente da loja confirmou a causa: a versão publicada ainda é o carrinho antigo, cujo botão somente abre o WhatsApp. Já existe uma versão posterior do checkout que coleta os dados de acompanhamento, usa `store.public.checkout` e encaminha no servidor uma requisição autenticada ao receptor do ERP. Essa versão depende de `ERP_SYNC_URL` e `ERP_SYNC_SECRET` configuradas no projeto da loja. Portanto, a correção consiste em publicar o checkout estruturado no projeto original da No Corre Shop, com essas duas configurações seguras; nenhuma alteração nos pedidos reais foi feita durante o diagnóstico.

O ERP agora disponibiliza contratos autenticados de catálogo e acompanhamento de pedido, além do receptor idempotente já existente: `GET /api/integrations/shop/catalog` entrega SKU, preço em centavos, estoque e disponibilidade; `GET /api/integrations/shop/orders/:externalId` retorna situação operacional e de pagamento. As respostas usam `Cache-Control: no-store` e não expõem dados sem a chave compartilhada. A lógica de catálogo e os endpoints foram testados com dependências isoladas, e a validação completa aprovou TypeScript, **21 arquivos / 54 testes** e build de produção. A baixa automática por cor e tamanho foi mantida desativada até que a loja estabeleça a associação segura entre suas variantes e os SKUs do ERP.

Após a publicação, a rota pública de catálogo foi consultada sem credencial e respondeu `401` com **“Não autorizado.”**, confirmando que o endpoint está disponível no domínio permanente e mantém catálogo, estoque e preços inacessíveis sem a chave compartilhada. Nenhum dado operacional foi retornado ou alterado nessa verificação.

Durante a rotação de credencial, a consulta autenticada local respondeu `200` e retornou um catálogo vazio, demonstrando que o ERP reconhece a nova chave. A mesma consulta no domínio publicado respondeu `401`, indicando que a instância publicada ainda usava a credencial anterior. A propagação será realizada antes de configurar ou testar novas chamadas da loja; nenhuma tentativa de pedido foi enviada nesse diagnóstico.

Após a publicação e a janela de propagação, a mesma consulta autenticada ao catálogo no domínio permanente respondeu `200`. O catálogo retornou vazio, coerente com a ausência atual de produtos cadastrados no ERP, mas a resposta confirma que a nova credencial compartilhada está ativa no ambiente publicado e que o cabeçalho `x-shop-sync-secret` é aceito. A chave anterior permanece revogada; nenhum valor de credencial foi registrado nesta validação.

## Pedido de teste NC-MSRZMAVG-CBP — diagnóstico inicial

O pedido de teste informado pelo usuário foi consultado de forma autenticada no ERP e retornou `404`, sem registro persistido. Os logs locais do ERP não contêm tentativa de recebimento para esse identificador, o que exclui gravação parcial ou bloqueio posterior dentro do receptor. A inspeção do domínio atual da loja confirma que ele serve o bundle `index-G1nW-3VL.js` e ainda comunica ao cliente que a finalização ocorre pelo WhatsApp. A próxima verificação compara esse bundle com o checkout integrado para confirmar se a publicação efetiva da loja alcançou o domínio correto.

O contrato do checkout publicado da loja foi então recuperado e comparado ao receptor. A loja envia `externalOrderId`, valores dentro de `totals` e itens com `colorName` e `size`; o receptor original aceitava apenas `externalId`, totais no nível raiz e uma variante textual. Essa incompatibilidade fez o ERP rejeitar o pedido antes da persistência, enquanto a loja ainda continuava para o WhatsApp. O receptor foi corrigido para normalizar o formato da loja sem reenviar ou criar o pedido reportado, preservando totais, notas e a variante `cor · tamanho`; a resposta de sucesso passou a incluir `externalId`, permitindo que a loja reconheça a sincronização. A validação aprovou TypeScript, **22 arquivos / 55 testes** e build de produção. Um novo pedido, feito após a publicação, será necessário para confirmar o ciclo real.

Após a confirmação de um novo teste pelo usuário, os registros recentes do ERP continuaram sem pedidos com fonte `no-corre-shop`. A inspeção do código disponível da loja mostra que o roteador público ainda expõe somente catálogo, configurações, cupom e frete; não existe ali um procedimento de checkout que chame o cliente de ERP. Isso é consistente com o pedido seguir apenas para o WhatsApp e prova que a correção do receptor do ERP não é suficiente enquanto o projeto que serve a loja não publicar o checkout que executa `erpCreateOrder` antes de abrir o WhatsApp. Nenhum pedido foi criado, alterado ou duplicado nessa verificação.

O checkout posteriormente exibiu a mensagem **“A conexão da loja respondeu de forma inesperada”**. O teste mais recente da própria loja associa essa mensagem a uma resposta HTML recebida onde o cliente esperava JSON (`Unexpected token '<'`), o que significa que a falha ocorre antes de uma resposta tRPC tratada de integração. O contrato de ambiente recuperado da loja define `ERP_BASE_URL` como a origem `https://nocorehub-jcf6ltmc.manus.space` e o cliente acrescenta as rotas `/api/integrations/shop/...`; portanto, essa variável deve permanecer somente como origem, sem o sufixo de endpoint. A investigação seguirá no roteamento publicado da loja, sem criar pedidos adicionais.

O bundle atualmente publicado confirma que o botão chama `store.public.checkout` e só abre o WhatsApp depois de receber `whatsappMessage`. Consultas seguras ao domínio da loja confirmaram que o procedimento de checkout está registrado (`405` ao consultar por `GET`) e que uma entrada propositalmente inválida retorna erro JSON de validação (`400` ao usar `POST`), não HTML. Portanto, a infraestrutura tRPC publicada está ativa; a resposta HTML é disparada dentro do fluxo de processamento de um pedido válido e deve ser corrigida no adaptador/servidor do projeto da loja. Não foi enviado nenhum pedido artificial durante essas verificações.

## Auditoria de persistência do ERP — 2026-08-14

A revisão direta do ERP publicado confirma que `POST /api/integrations/shop/orders` normaliza o checkout, chama `importShopOrder` e retorna `orderId`, `externalId` e status após a gravação. Por sua vez, `importShopOrder` grava no módulo persistente `orders` por meio de `createOrder`, com `source: "no-corre-shop"` e o identificador externo. A tela **Pedidos** consulta a mesma origem por `trpc.orders.list`; portanto, um pedido que alcance esse endpoint com resposta de sucesso já está no formato exibido pela interface. Não existe uma tabela paralela de integração que possa ocultar pedidos da tela.

Essa evidência refuta a hipótese de que a correção seja migrar a gravação no ERP para outra tabela. O registro ausente, os logs sem tentativa de recebimento e o HTTP 502 do checkout válido indicam que a execução interrompe na aplicação/gateway da loja antes de a requisição autenticada alcançar o receptor. A correção restante precisa ser aplicada e publicada na versão ativa da No Corre Shop, sem substituir o ERP nem gerar novos pedidos de teste até que o adaptador do checkout esteja disponível.
