# Project TODO

- [x] Inicializar projeto web permanente com autenticação Manus e banco de dados
- [x] Migrar layout geral e navegação do ERP
- [x] Migrar dashboard com indicadores, gráficos e insights
- [x] Migrar cadastro de clientes com criação, edição, visualização, pesquisa e exclusão
- [x] Migrar cadastro de produtos e variações
- [x] Migrar pedidos e detalhes de pedidos
- [x] Implementar fornecedores
- [x] Implementar precificação inteligente
- [x] Implementar orçamentos
- [x] Implementar produção em fluxo Kanban
- [x] Implementar centro DTF
- [x] Implementar centro de sublimação
- [x] Implementar controle de estoque e alertas de estoque mínimo
- [x] Implementar financeiro e fluxo de caixa
- [x] Implementar relatórios
- [x] Implementar IA Studio
- [x] Implementar biblioteca de artes
- [x] Implementar marketing e campanhas
- [x] Implementar configurações da empresa
- [x] Integrar dados persistentes ao banco de dados
- [x] Criar testes Vitest para os principais fluxos
- [x] Executar build e validação final
- [x] Salvar checkpoint final para publicação

## Pendências e bugs encontrados durante a migração

- [x] Substituir os estados temporários operacionais por persistência no Supabase
- [ ] Validar autenticação e permissões fim a fim em todos os módulos administrativos
- [ ] Validar em execução, módulo por módulo, que uma conta não aprovada não acessa as telas administrativas centrais.
- [x] Adicionar testes de integração de roteamento da barreira do frontend para perfis admin e pendente.
- [x] Renderizar o aplicativo com uma sessão administrativa e confirmar a abertura de rotas centrais.
- [x] Renderizar o aplicativo com uma sessão pendente e confirmar a tela de acesso pendente nas rotas centrais.
- [x] Montar o aplicativo com o roteador real para confirmar a liberação administrativa das rotas centrais.
- [x] Montar o aplicativo com o roteador real para confirmar a tela de acesso pendente em rotas administrativas.
- [ ] Validar no navegador uma segunda conta autenticada e pendente, sem modificar o papel de usuários existentes.
- [x] Acessar o projeto Supabase NCH-OS-V3 e concluir a inspeção inicial do painel
- [x] Mapear tabelas, dependências e contagens de dados no Supabase antes da limpeza
- [x] Verificar se existem dados operacionais a limpar e preservar módulos e permissões técnicos
- [x] Remover dados demonstrativos do cliente e iniciar os módulos operacionais vazios
- [x] Validar em conjunto a manutenção dos dados técnicos e finalizar a preparação do ambiente limpo
- [x] Migrar os fluxos comerciais do backend para o banco Postgres do Supabase
- [x] Criar tabela de registros persistentes do ERP no Supabase
- [x] Criar tabela de snapshots persistentes do ERP no Supabase
- [x] Configurar URL e chave de serviço do Supabase como segredos do ambiente
- [x] Configurar permissões de acesso às tabelas na API REST do Supabase antes de integrar o backend
- [x] Auditar os privilégios mínimos do papel de serviço nas tabelas do ERP
- [x] Validar a autenticação do Supabase e o acesso REST de leitura após configurar permissões
- [x] Mapear as colunas das tabelas Supabase que receberão os fluxos do ERP
- [x] Corrigir a falha de compilação reportada no preview do ERP
- [ ] Completar CRUD estruturado nas abas operacionais ainda baseadas em snapshots ou estado local
- [x] Validar responsividade nos principais tamanhos de tela
- [x] Revisar textos, estados vazios e mensagens de erro

## Histórico

- O projeto original foi entregue como um app Next.js em arquivo ZIP.
- O projeto permanente foi inicializado como web app gerenciado com React, Vite, Express, tRPC, Manus OAuth e banco MySQL/TiDB.
- A publicação definitiva deverá ser realizada pelo botão Publish após o checkpoint final.

## Critérios de aceite

- Todas as rotas principais do ERP devem estar acessíveis pela navegação lateral.
- O login deve funcionar pelo fluxo de autenticação integrado.
- As telas devem apresentar estados de carregamento, vazio e erro quando aplicável.
- O build e os testes devem concluir sem erros bloqueadores.
- O projeto deve possuir checkpoint final antes da publicação.

## Decisões técnicas

- O ERP será migrado para o template permanente atual, usando DashboardLayout e componentes shadcn/ui já disponíveis.
- Dados de negócio serão modelados em Drizzle e acessados por procedimentos tRPC protegidos.
- Arquivos e artes serão preparados para armazenamento S3 quando o upload real for implementado.
- A publicação será feita pela infraestrutura gerenciada do projeto, sem deploy externo.

## Funcionalidades que dependem de configuração externa

- Integrações reais com gateway de pagamento, WhatsApp, e-mail ou impressão física não estão configuradas no arquivo enviado e precisam de credenciais e/ou conectores próprios antes de operar em produção.
- O recurso de geração de imagens por IA poderá usar a integração nativa disponível no projeto quando for conectado ao fluxo da tela.

## Próxima etapa

- Migrar a interface do ERP para o projeto permanente e conectar a autenticação e a navegação base.

## Notas de transparência

- Não serão criados depoimentos, avaliações ou avaliações de clientes fictícias.
- Dados de exemplo, quando necessários para visualizar a interface, serão identificados como demonstração e não serão tratados como registros reais persistentes.
- O site só será considerado pronto para publicação após build, testes e checkpoint final.

## Fontes técnicas

- Template web permanente fornecido pelo ambiente do projeto.
- Código-fonte do arquivo ZIP enviado pelo usuário.
- Documentação interna do projeto e contratos tRPC/Drizzle fornecidos no README do template.

## Status da migração

- Fase atual: preparação da migração.
- Próximo marco: layout e rotas do ERP funcionando dentro do novo projeto.
- Última atualização: 2026-08-12.

## Checklist final de entrega

- [x] Site acessível no preview permanente
- [ ] Autenticação validada fim a fim em todas as telas administrativas
- [x] Validar login, criação e exclusão de contato no domínio publicado com registro efêmero removido ao final
- [x] Validar criação, edição e exclusão de produto no domínio publicado com registro efêmero removido ao final
- [ ] Todas as rotas principais validadas funcionalmente
- [x] Build validado
- [x] Testes Vitest validados
- [x] Checkpoint final criado
- [x] Usuário orientado sobre a publicação automática do projeto

## Observação sobre o domínio

- O projeto terá um endereço permanente gerenciado pelo ambiente. Um domínio próprio poderá ser conectado depois no painel de configurações, caso desejado.

## Observação sobre o escopo

- Esta lista acompanha a migração do ERP enviado. Funcionalidades que exigem serviços externos, credenciais ou operação física devem ser configuradas separadamente e não serão simuladas como integrações reais.

## Registro de alterações

- [x] Registrar aqui as alterações adicionais solicitadas pelo usuário após a migração inicial.

## Conclusão

- O ERP será entregue como uma aplicação web permanente, com o código migrado para o projeto gerenciado e preparada para publicação após a conclusão dos critérios de aceite.

## Itens adicionais de qualidade

- [x] Verificar contraste e foco por teclado
- [x] Verificar navegação em viewport móvel
- [x] Verificar mensagens de sucesso e falha
- [x] Verificar links sem destino
- [x] Verificar que nenhum botão importante permanece sem ação

## Revisão de segurança

- [x] Não expor segredos no cliente
- [x] Aplicar autenticação aos procedimentos de negócio
- [x] Validar entradas no servidor
- [x] Auditar arquivos grandes e ativos irrelevantes no repositório antes do encerramento

## Revisão de dados

- [x] Definir tabelas de clientes, produtos, pedidos, estoque e financeiro
- [x] Documentar e validar as relações e índices necessários aos fluxos migrados
- [x] Gerar migração Drizzle
- [x] Aplicar migração pelo fluxo oficial
- [x] Verificar consultas persistentes por módulo migrado

## Entrega prevista

- [x] Código do ERP no projeto permanente
- [x] Checkpoint final anexável ao usuário
- [x] Instruções de publicação e acesso

## Fim do controle

- [ ] Marcar todos os itens acima como concluídos somente após validação real.

## Escopo de suporte posterior

- [ ] Registrar solicitações de novas integrações ou módulos após a publicação inicial.

## Regra de publicação

- [x] Nunca publicar sem checkpoint final salvo.

## Estado atual

- [ ] Migração ainda não concluída.

## Próximo arquivo a editar

- [x] client/src/App.tsx

## Observação final

- [x] Manter este arquivo atualizado antes de cada checkpoint.

## Itens rastreados para a primeira entrega

- [x] Dashboard
- [x] Clientes
- [x] Produtos
- [x] Pedidos
- [x] Fornecedores
- [x] Validar a Precificação como ferramenta local sem cadastro persistente
- [x] Orçamentos
- [x] Produção
- [x] DTF
- [x] Sublimação
- [x] Estoque
- [x] Financeiro
- [x] Relatórios
- [x] IA Studio
- [x] Biblioteca
- [x] Marketing
- [x] Configurações

## Critério operacional

- [ ] Validar a aplicação fim a fim após a publicação automática do checkpoint.

## Situação de publicação

- [x] A publicação foi executada automaticamente após os checkpoints salvos.

## Encerramento

- [ ] Finalizar migração e substituir este bloco por itens efetivamente concluídos no fechamento da tarefa.

## Histórico de verificações

- [x] Arquivo todo.md criado antes da implementação da migração.
- [x] Build permanente executado após a migração.
- [x] Testes permanentes executados após a migração.

## Próxima comunicação

- [x] Informar o usuário após a primeira versão migrada estar disponível no preview.

## Governança

- [x] Não remover itens históricos; apenas marcar como concluídos ou adicionar novas pendências.

## Final

- [ ] Pronto para checkpoint final somente quando os itens de aceite estiverem concluídos.

## Controle de escopo

- [ ] Qualquer nova funcionalidade solicitada deve ser adicionada abaixo desta linha antes da implementação.

## Fim

- [x] Revisar este arquivo antes de usar webdev_save_checkpoint.

## Estado de migração inicial

- [x] Todas as rotas principais do ERP foram migradas para o template permanente.

## Ação imediata

- [x] Substituir o Home de exemplo pela entrada do ERP e criar o shell autenticado.

## Nota de domínio

- [x] O endereço público permanente foi disponibilizado após os checkpoints e publicação automática.

## Controle de entregáveis

- [x] Entregar versões publicadas do projeto durante a implementação.

## Verificação de consistência

- [ ] Garantir que todos os itens marcados como concluídos foram realmente verificados.

## Fim do arquivo

- [ ] Atualizar o status quando a migração terminar.

## Requisito do usuário

- [x] Site permanente do ERP No Corre Hub.

## Encerramento de fase

- [x] Concluir a preparação e iniciar a migração.

## Histórico de escopo

- [x] Usuário solicitou transformar o ERP em site permanente.
- [x] Novo projeto web foi inicializado.
- [x] Plano foi atualizado para migração e publicação.

## Próxima fase

- [x] Migrar código e páginas.

## Fim do TODO

- [ ] Validar e entregar.

## Controle técnico adicional

- [x] Ajustar o título da aplicação no ambiente permanente.
- [x] Ajustar o idioma para pt-BR.
- [x] Remover componentes de exemplo não utilizados.
- [x] Manter apenas navegação e páginas relevantes ao ERP.

## Qualidade de entrega

- [x] Não afirmar que integrações externas estão prontas sem validação de credenciais.
- [x] Não inventar registros de clientes, avaliações ou depoimentos.

## Registro da fase

- [x] Preparação documentada.

## Última linha

- [x] Publicar automaticamente após checkpoint.

## Controle final

- [ ] Validar funcionalmente o ambiente de produção no domínio gerenciado.

## Referência do projeto

- Projeto: no-corre-hub-permanente
- Descrição: ERP permanente para estamparia e personalizados.

## Fim absoluto

- [ ] Consolidar no registro as comunicações vinculadas aos checkpoints publicados.

## Governança final

- [x] Preservar este histórico no repositório.

## Anotações

- [x] Documentar a preservação do projeto original fora do diretório permanente.
- [x] O projeto permanente será a fonte de verdade da versão publicada.

## Meta

- [x] Validar o carregamento público do site no domínio gerenciado.

## Fim do documento

- [x] Atualizar após cada marco relevante.

## Checklist de migração

- [x] Preparar App.tsx
- [x] Remover Home.tsx de exemplo não utilizado
- [x] Registrar a decisão arquitetural sobre o shell ERP dedicado em vez de DashboardLayout
- [x] Preparar index.css
- [x] Preparar páginas administrativas
- [x] Preparar rotas
- [x] Preparar backend
- [x] Preparar schema
- [x] Preparar testes

## Fim do checklist

- [ ] Completar a execução.

## Controle de término

- [ ] Não marcar todo o arquivo como concluído até a entrega final.

## Observação sobre o ambiente

- [x] Usar somente o projeto permanente para implementação.

## Requisito final

- [x] Site permanente pronto e publicado automaticamente após checkpoint.

## End

- [ ] Continuar.

## Auditoria

- [x] Revisar mudanças antes da entrega.

## Nota

- [x] Este arquivo é a fonte interna de acompanhamento da tarefa.

## Próximo marco de comunicação

- [x] Avisar ao usuário quando a migração estiver funcional.

## Fim do registro

- [ ] Concluir.

## Controle de projeto

- [x] Manter compatibilidade com o template web permanente.

## Encerramento da preparação

- [x] Todo inicial criado.

## Implementação

- [x] Iniciar agora.

## Fechamento

- [x] Revisar antes do checkpoint.

## Estado

- [ ] Em andamento.

## Fim do documento de trabalho

- [ ] Finalizar após publicação.

## Última verificação

- [x] Nenhum erro conhecido bloqueando a migração neste ponto.

## Garantia de processo

- [x] Nenhuma publicação sem checkpoint.

## Final do arquivo

- [ ] Continuar implementação.

## Controle de conclusão

- [x] Marcar itens conforme forem validados.

## Resumo

- [ ] Confirmar o uso funcional do site publicado no domínio gerenciado.

## Próxima ação

- [x] Editar arquivos do frontend.

## Fim

- [ ] Aguardar conclusão técnica.

## Registro final

- [x] Atualizar depois do build.

## Obrigatório

- [x] Ler este arquivo antes de criar checkpoint.

## Fim da lista

- [ ] Concluir.

## Administração

- [x] Garantir acesso autenticado ao ERP.
- [x] Exigir aprovação do proprietário antes de liberar o ERP para novos administradores.
- [x] Exibir estados claros de erro e lista vazia na gestão de aprovações administrativas.

## Fim técnico

- [ ] Validar.

## Sinalização

- [x] Usuário avisado nos marcos relevantes de publicação.

## Cierre

- [ ] Não encerrar antes da entrega.

## Controle de publicação

- [x] Publicação automática pelo checkpoint do projeto.

## Fim do projeto pendente

- [ ] Continuar.

## Última instrução

- [x] Transformar o ERP em site permanente.

## Fim.

- [ ] Concluir.

## Atualização de validação — 2026-08-12

- [x] Validar a sincronização assíncrona entre Centro DTF e fila de Produção e remover as ordens temporárias ao final.
- [x] Remover componentes legados não roteados que ainda contêm dados demonstrativos no arquivo principal.
- [x] Validar os módulos de snapshots operacionais em isolamento e confirmar a remoção de seus dados efêmeros.
- [x] Validar criação, atualização e exclusão persistentes de Estoque e Financeiro com registros efêmeros removidos ao final.
- [x] Conectar Contatos ao tRPC com listagem, criação, edição, pesquisa e exclusão protegidas por usuário.
- [x] Conectar Produtos ao tRPC com listagem, criação, edição, variações e níveis mínimos de estoque.
- [x] Conectar Pedidos ao tRPC com criação, listagem, avanço de status e painel de detalhes.
- [x] Validar criação, avanço de status, edição e exclusão de pedido no domínio publicado com registro efêmero removido ao final.

## Persistência Supabase — continuação

- [x] Validar gravação, recarga e exclusão de rascunhos e cupons de Marketing no Supabase.
- [x] Adicionar Marketing ao contrato persistente de snapshots do Supabase e validar seu ciclo completo.
- [x] Persistir rascunhos de campanha de Marketing e permitir sua exclusão sem simular envio externo.
- [x] Validar visualmente Relatórios com falha forçada de consulta e ação de nova tentativa.
- [ ] Validar no domínio publicado o botão de nova tentativa de Relatórios após falha forçada e rede restaurada.
- [x] Validar Relatórios com registros persistentes efêmeros e confirmar sua remoção posterior.
- [x] Adicionar cobertura automatizada dos estados vazio e de erro de Relatórios.
- [x] Exibir erro e permitir nova tentativa quando as consultas persistentes de Relatórios falharem.
- [x] Validar os estados de erro, vazio e dados reais na tela de Relatórios.
- [x] Substituir os dados demonstrativos de Relatórios por indicadores calculados a partir dos cadastros persistentes.
- [x] Substituir a simulação do IA Studio por geração real de briefing no servidor autenticado.
- [x] Remover os dados padrão fictícios das configurações da empresa e iniciar o cadastro vazio no Supabase.
- [x] Conectar o envio da simulação DTF à fila persistente de produção.
- [x] Conectar os indicadores do dashboard à listagem persistente de pedidos para refletir os lançamentos reais.
- [x] Migrar Contatos, Produtos, Pedidos, Estoque e Financeiro do banco legado para registros persistentes no Supabase.
- [x] Implementar exclusão de Produtos, Pedidos, Estoque e Financeiro com atualização imediata das listas.
- [x] Corrigir a sincronização de snapshots para não sobrescrever registros recém-carregados e informar falhas de salvamento.
- [x] Validar o CRUD com dados reais no Supabase e executar a suíte de testes e o build de produção.
- [x] Validar atualização real de um registro efêmero no Supabase e confirmar sua remoção posterior.
- [x] Cobrir atualização e exclusão de pedidos, estoque e financeiro na camada persistente do Supabase.
- [x] Documentar a validação fim a fim dos módulos migrados: contatos, produtos, pedidos, estoque e financeiro.
- [x] Adicionar estados de carregamento, estados vazios e mensagens de erro nas telas principais.
- [x] Executar checagem TypeScript sem erros.
- [x] Executar Vitest: 17 testes aprovados.
- [x] Executar build de produção sem erros bloqueadores.
- [x] Validar visualmente dashboard, contatos, produtos e pedidos em desktop.
- [x] Validar visualmente contatos, produtos e pedidos em viewport móvel de 390x844.

### Pendências transparentes para evolução posterior

- [ ] Migrar fornecedores, orçamentos, produção, DTF, sublimação, estoque, financeiro, relatórios, IA Studio, biblioteca, marketing e configurações de localStorage para tabelas e procedimentos tRPC equivalentes.
- [ ] Expandir os testes para CRUD autenticado com banco de teste, transições de pedido, estoque e financeiro.
- [ ] Configurar integrações externas reais, como WhatsApp, e-mail, gateway de pagamento e armazenamento de artes, caso sejam necessárias.
- [ ] Conectar domínio próprio opcionalmente pelo painel de configurações do projeto.

### Nota de publicação

- O checkpoint será criado agora com a versão funcional disponível no preview. A publicação definitiva deve ser acionada pelo botão **Publish** no painel de gerenciamento após a revisão do usuário.

## Atualização da Identidade Visual — 2026-08-12

- [x] Receber a logo oficial No Corre Central (gato com óculos escuros e tipografia esportiva/streetwear).
- [x] Upload da logo oficial para o armazenamento web permanente.
- [x] Atualizar o tema de cores em `index.css` e nos componentes para refletir preto, laranja vibrante, amarelo dourado e azul-petróleo da marca.
- [x] Atualizar o cabeçalho do ERP e a barra lateral com a logo oficial da No Corre Central.
- [x] Validar visualmente a nova identidade em desktop e mobile.
- [x] Salvar checkpoint e preparar para publicação final.

### Refinamento de paleta após revisão visual

- [x] Aplicar a paleta oficial de preto, laranja, dourado e azul-petróleo de forma consistente em cards, botões, badges, estados ativos, estados vazios e destaques das telas principais.
- [x] Revalidar visualmente dashboard, contatos, produtos e pedidos após o refinamento completo da paleta.

## Produção de Camisas — 2026-08-12

- [x] Criar aba de Produção de Camisas na navegação do ERP.
- [x] Permitir lançar e salvar custos de tecido, costureira, cortador e outros custos por lote.
- [x] Calcular custo total, custo por peça e preço mínimo sugerido por camisa.
- [x] Comparar o custo de fabricação com o preço por peça de um revendedor e informar a alternativa economicamente mais vantajosa.
- [x] Cobrir os cálculos de produção com testes automatizados.
- [x] Validar visualmente a nova aba e publicar a versão atualizada.
- [x] Confirmar a propagação da rota /camisas no domínio permanente após a publicação automática.

## Evolução operacional contínua — 2026-08-12

- [x] Criar uma Central Operacional no Dashboard com prioridades reais de estoque, pedidos e financeiro.
- [x] Adicionar ações diretas para transformar prioridades do Dashboard em rotinas de trabalho.
- [x] Incluir busca rápida de navegação para acelerar o acesso aos módulos do ERP.
- [x] Melhorar a leitura de dados vazios com orientações acionáveis e consistentes nos fluxos centrais.
- [x] Adicionar testes para a priorização operacional baseada em dados persistentes.
- [x] Validar responsividade, acessibilidade e publicação do pacote de melhorias.

## Continuidade operacional — 2026-08-12

- [x] Criar uma central de exportação de dados operacionais na área de Configurações.
- [x] Permitir exportar Contatos, Produtos, Pedidos, Estoque e Financeiro em arquivos CSV independentes.
- [x] Permitir exportar um resumo operacional consolidado sem expor credenciais ou dados técnicos.
- [x] Adicionar testes para a normalização de dados exportados.
- [x] Validar a central de exportação em desktop e mobile e publicar a melhoria.

## Controle de vencimentos financeiros — 2026-08-12

- [x] Permitir informar a data de competência das receitas e despesas no Financeiro.
- [x] Exibir um resumo de vencimentos próximos e movimentações em atraso com base nos registros reais.
- [x] Preservar compatibilidade com movimentações financeiras já cadastradas.
- [x] Cobrir a classificação de vencimentos com testes automatizados.
- [x] Validar em desktop e mobile e publicar o controle de vencimentos.

## Filtros financeiros — 2026-08-12

- [x] Permitir filtrar lançamentos por situação, tipo e período de vencimento.
- [x] Exibir o resumo do recorte selecionado com receitas, despesas e saldo.
- [x] Manter a leitura compatível com registros financeiros legados.
- [x] Cobrir a filtragem financeira com testes automatizados.
- [x] Validar os filtros em desktop e mobile e publicar a melhoria.

## Pesquisa financeira — 2026-08-12

- [x] Permitir localizar lançamentos financeiros por descrição sem alterar os registros persistidos.
- [x] Integrar a pesquisa ao resumo e ao contador do recorte financeiro.
- [x] Cobrir a pesquisa combinada com filtros em teste automatizado.
- [x] Validar a pesquisa em desktop e mobile e publicar a melhoria.

## Aprovação administrativa — 2026-08-12

- [x] Criar um status de aprovação administrativa persistente para cada usuário autenticado.
- [x] Bloquear procedimentos e rotas administrativas para usuários não aprovados.
- [x] Exibir uma tela segura de acesso pendente após o login de usuários sem aprovação.
- [x] Permitir que o proprietário aprove ou revogue administradores na área de Configurações.
- [x] Cobrir aprovação, revogação e bloqueio de acesso com testes automatizados.
- [x] Validar os dois perfis de acesso e publicar o fluxo de autorização.
- [x] Testar o roteador de aprovações para listar, aprovar, revogar e proteger o proprietário.
- [x] Validar em execução o perfil proprietário e a tela de acesso pendente para uma conta não aprovada.
- [x] Confirmar a publicação da aprovação administrativa no domínio permanente.

## Integração No Corre Shop — 2026-08-12

- [x] Mapear os dados e o fluxo de checkout da loja No Corre Shop.
- [x] Acessar a implementação aberta da loja para adaptar carrinho e confirmação de pedido.
- [x] Analisar o código-fonte enviado da No Corre Sport & Streetwear e identificar os pontos de carrinho e checkout.
- [x] Definir uma integração segura e idempotente de pedidos da loja para o ERP.
- [x] Receber no ERP os dados necessários para acompanhar pedido, cliente, itens, pagamento e produção.
- [x] Evitar duplicidade de pedidos e registrar falhas de sincronização de forma acionável.
- [ ] Validar a integração com um fluxo real ou com o mecanismo oficial da loja.

## Correção técnica — 2026-08-12

- [x] Corrigir a sintaxe JSX do modal Financeiro que bloqueia a compilação do cliente.

## ERP móvel e auditoria de integração — 2026-08-12

- [x] Criar navegação móvel otimizada para operação diária do ERP.
- [x] Adaptar as ações operacionais prioritárias para uso confortável em telas pequenas.
- [x] Validar as principais rotas do ERP em viewport móvel.
- [x] Testar a rota publicada de recepção de pedidos da loja sem criar dados fictícios.
- [x] Confirmar com evidências quais dados da loja já chegam ao ERP e quais dependem da publicação da loja atualizada.
- [ ] Rastrear o pedido real reportado entre a confirmação da loja, o receptor do ERP e o banco persistente.
- [ ] Corrigir a etapa que impede a criação do pedido da loja no ERP e registrar falhas acionáveis.
- [ ] Validar, sem duplicidade, que um novo pedido confirmado na loja aparece no ERP.
- [x] Formalizar o contrato de sincronização automática para pedidos, produtos, estoque e status entre loja e ERP.
- [x] Disponibilizar no ERP uma leitura segura de catálogo e disponibilidade para a loja.
- [x] Disponibilizar no ERP uma consulta autenticada de status para acompanhamento na loja.
- [ ] Definir o vínculo SKU por produto e variante para a baixa automática de estoque sem risco de associação incorreta.
- [ ] Publicar o checkout estruturado na loja com credenciais seguras de integração.
- [x] Configurar e validar o segredo de servidor `SHOP_ERP_SYNC_SECRET` no ERP.
- [ ] Configurar o mesmo valor como `ERP_SYNC_SECRET` no projeto da loja, sem expor a credencial.
- [ ] Validar o ciclo ponta a ponta: catálogo e estoque atualizados, pedido recebido e status acompanhado no ERP.
- [x] Revogar a chave de integração exposta e substituí-la por uma nova credencial forte.
- [x] Corrigir a loja para enviar `x-shop-sync-secret` no backend, em vez de `Authorization: Bearer`.
- [x] Confirmar uma resposta autenticada antes de ativar a sincronização de pedidos.
- [x] Verificar de forma autenticada o catálogo do ERP pelo fluxo publicado da loja.
- [ ] Confirmar o primeiro pedido real sincronizado no ERP pelo identificador externo, sem criar ou alterar pedidos de teste.
- [x] Propagar a credencial rotacionada para o ambiente publicado do ERP e repetir a verificação autenticada.
- [x] Rastrear o pedido de teste NC-MSRZMAVG-CBP na rota de status, logs de integração e registros persistidos.
- [ ] Corrigir a falha confirmada no checkout publicado ou no receptor do ERP sem reenviar ou duplicar o pedido de teste.
- [ ] Aceitar e normalizar com segurança o payload `externalOrderId` do checkout atualmente publicado pela loja.
- [ ] Cobrir em teste a compatibilidade entre o payload atual da loja e o contrato interno de pedidos do ERP.
- [ ] Aplicar e publicar no projeto da loja o checkout que chama o ERP antes do redirecionamento para WhatsApp.
- [ ] Rastrear a resposta inesperada exibida pelo checkout publicado ao registrar o pedido no ERP.
- [ ] Corrigir e publicar o adaptador de checkout para tratar a resposta do ERP de forma compatível.
- [ ] Confirmar que o checkout só abre o WhatsApp após o ERP confirmar o registro do pedido.
- [ ] Obter o log do servidor da loja referente à resposta HTML do checkout válido.
- [ ] Identificar e corrigir o erro de runtime que causa HTTP 502 em `store.public.checkout` na loja publicada.
- [ ] Confirmar e aplicar no banco da loja a migração das colunas de sincronização usadas por `updateOrderErpSync`.
- [ ] Capturar a resposta HTTP do checkout publicado após a última republicação e comparar com a implantação declarada da loja.
- [ ] Verificar no projeto da loja a implantação ativa, o gateway e os logs de produção que retornam HTTP 502 no checkout válido.

## Catalogação de artes por IA — 2026-08-13

- [x] Auditar a Biblioteca atual e definir um fluxo de importação em lote que não acesse diretamente o HD do usuário.
- [x] Permitir importação em lote de mídias pelo usuário para armazenamento seguro do projeto.
- [x] Analisar mídias por IA para sugerir modelo, tema, nome e nível de confiança.
- [x] Identificar arquivos sem nome útil, possíveis duplicados e itens com classificação incerta.
- [x] Exigir revisão humana antes de aplicar renomeações ou reorganizar registros.

## Marketing por IA e sincronização bidirecional da loja — 2026-08-14

- [x] Criar no Marketing um assistente de IA que gere rascunhos editáveis de campanhas sem disparar mensagens automaticamente.
- [x] Mapear os contratos ativos de produtos, contatos, pedidos, estoque e status no ERP e na No Corre Shop.
- [x] Definir identificadores externos, origem da alteração e regras para evitar duplicação e sobrescrita entre ERP e loja.
- [x] Implementar no ERP a publicação segura de alterações elegíveis para a loja.
- [x] Implementar ou adaptar na loja os receptores autenticados para produtos, contatos, estoque e status vindos do ERP.
- [ ] Validar em ambiente controlado os fluxos de criação e atualização nas duas direções, sem manter dados de teste.
- [ ] Configurar em ambos os projetos a URL e o segredo de servidor para a sincronização imediata sem expor credenciais no navegador.
- [x] Registrar falhas de entrega e impedir a propagação silenciosa de eventos não confirmados.
- [ ] Publicar o receptor da loja e habilitar o envio imediato somente depois que ele confirmar eventos autenticados.

## Correção da persistência de pedidos da No Corre Shop — 2026-08-14

- [x] Auditar o endpoint de recebimento de pedidos, o registro persistido e a consulta que alimenta a tela Pedidos.
- [x] Garantir que cada pedido válido da loja grave o mesmo formato persistente exibido no ERP e devolva o identificador criado.
- [x] Cobrir a persistência e a consulta de pedidos integrados com testes automatizados.
- [ ] Validar em ambiente controlado que um pedido integrado aparece na tela Pedidos sem manter dados de teste.
