# Auditoria inicial — Supabase NCH-OS-V3

- Projeto acessado com êxito: `bztrrxgawyilgizjoyxm`.
- Estado do projeto: **Healthy**.
- O painel de tabelas não exibiu itens recentes e apresentou apenas a opção de criar uma tabela.
- Uma consulta somente de leitura confirmou **34 tabelas** no schema `public`, incluindo dados empresariais e operacionais como `companies`, `company_settings`, `contacts`, `products`, `orders`, `inventory`, `financial_transactions`, `files` e tabelas de apoio.
- Nenhuma limpeza de dados foi executada nesta etapa.
- Próximo passo: consultar o catálogo PostgreSQL no SQL Editor para confirmar nomes completos, dependências e contagens antes de solicitar a confirmação destrutiva.

## Andamento da auditoria

Uma consulta agregada de contagens foi preparada no SQL Editor. Ela é exclusivamente de leitura e usa `pg_stat_user_tables`; não houve comandos `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `DROP` ou alteração de schema.

## Inventário de dados

O inventário confirmou que as tabelas operacionais do ERP estão sem registros estimados: cadastros, produtos, vendas, pedidos de produção, estoque, contas, transações, compras e arquivos retornaram `0`.

Somente duas tabelas possuem dados: `modules` (12 registros) e `permissions` (38 registros). Esses registros são a configuração técnica que define a estrutura de módulos e permissões; removê-los comprometeria os controles de acesso do ERP. Portanto, eles serão preservados, salvo orientação explícita em contrário.

## Verificação de dependências

Uma consulta somente de leitura baseada em `pg_constraint` foi preparada para listar as chaves estrangeiras do schema `public`. Essa verificação definirá a ordem segura para eventual limpeza e confirmará se `modules` e `permissions` podem permanecer sem quebrar referências.

A primeira execução não alterou dados, mas o editor inseriu um caractere adicional e retornou erro de sintaxe. A consulta será refeita por meio de um inventário sem agregações, mantendo o mesmo caráter somente de leitura.

O inventário de constraints retornou com êxito. As primeiras relações confirmadas incluem `addresses.contact_id -> contacts.id` com exclusão em cascata, `audit_logs.profile_id -> profiles.id` e `audit_logs.company_id -> companies.id` com referência anulada, além de `bank_accounts` ligado a `cost_centers` e `companies`. Como o painel limita a primeira consulta a 100 linhas, será executado um inventário específico apenas das chaves estrangeiras antes de determinar qualquer exclusão.

## Estado de integração do backend

O painel web autenticado permite consultar o banco pelo SQL Editor, mas a chamada do servidor do ERP ao endpoint REST retornou `403` mesmo após a configuração de uma chave secreta. Nenhuma operação de escrita foi executada. A migração do backend e qualquer limpeza permanecem bloqueadas até validar uma credencial de serviço que tenha acesso à API REST ou receber uma URI de conexão PostgreSQL do projeto.

Uma validação independente no endpoint `auth/v1/health` retornou `200`, confirmando que a nova credencial do ambiente é aceita pelo projeto Supabase. O `403` anterior está restrito ao acesso REST das tabelas e será tratado como uma configuração de permissões/schema antes da migração do backend.

Uma consulta ao catálogo de permissões confirmou que o papel `service_role` não possui nenhum privilégio explícito sobre as tabelas do schema `public`. Esse é o motivo do bloqueio `403` ao acessar as tabelas pela API REST. A próxima alteração será conceder privilégios mínimos necessários ao backend, sem mudar registros nem excluir dados.

Após confirmação do usuário, foram concedidos ao `service_role` privilégios de uso no schema público, CRUD nas tabelas existentes e acesso às sequências, com privilégios padrão equivalentes para novos objetos. A consulta REST de leitura mínima em `modules` passou a retornar `200`; não houve alteração de dados.

## Mapa de persistência no cliente

As telas de fornecedores, orçamentos, produção, estoque, financeiro, biblioteca e configurações usam o hook compartilhado de persistência. As telas de clientes, produtos e pedidos já possuem consultas/mutações próprias. Precificação, DTF, sublimação, relatórios, IA Studio e marketing ainda possuem dados ou formulários locais que precisam de uma estratégia persistente adequada.

## Entidades disponíveis para integração

O schema público já possui entidades maduras para a operação: `companies` e `company_settings` para a empresa; `contacts` e `addresses` para clientes/fornecedores; `products`, `product_variants`, `categories`, `brands` e `collections` para catálogo; `orders`, `order_items`, `production_orders`, `inventory`, `stock_movements`, `financial_transactions`, `bank_accounts`, `cost_centers`, `purchases` e `files` para os módulos operacionais. As chaves são UUIDs e os registros são associados por `company_id`, o que exige que o ERP resolva a empresa ativa antes de criar ou listar dados.

O modelo confirma os campos necessários para a primeira integração: `contacts` guarda tipo, status, identificação e canais de contato; `products` e `product_variants` suportam SKU, variações e atributos comerciais; `inventory` armazena quantidades, mínimos e máximos; `financial_transactions` suporta valores, vencimentos, pagamentos e contas; e `companies`/`company_settings` suportam a configuração operacional. Os registros precisarão ser criados a partir de um único contexto de empresa ativa.

## Migração de persistência

A primeira tentativa de aplicar a migração das tabelas `erp_workspace_snapshots` e `erp_records` foi rejeitada pelo editor SQL com erro de sintaxe `42601` junto à linha 24. A operação foi atômica e não criou nem alterou objetos. A migração será reaplicada em comandos simplificados e separados para evitar resíduos de formatação do editor.

A criação isolada da tabela `public.erp_workspace_snapshots` foi executada com sucesso. A operação criou apenas a estrutura vazia para dados futuros; nenhuma informação operacional existente foi apagada ou modificada.

Em 2026-08-12, o painel autenticado do Supabase foi reaberto e confirmou o projeto **NCH-OS-V3** na organização `franciscothiago979-lab`, com acesso ao editor de tabelas e ao editor SQL. A auditoria de privilégios seguirá como consulta somente-leitura.

A consulta em `information_schema.role_table_grants` confirmou **22 permissões** nas duas tabelas do ERP. Para `service_role`, há apenas `SELECT`, `INSERT`, `UPDATE` e `DELETE` em `erp_records` e `erp_workspace_snapshots` (8 permissões ao todo). Privilégios estruturais como `REFERENCES`, `TRIGGER` e `TRUNCATE` permanecem associados somente ao proprietário `postgres`; portanto, não é necessária revogação adicional.
