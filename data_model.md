# Modelo de persistência do ERP

## Registros comerciais estruturados

A tabela `public.erp_records` armazena Contatos, Produtos, Pedidos, Estoque e Financeiro. A chave primária composta `(owner_open_id, module, record_id)` impede colisões entre usuários, módulos e registros. O índice `erp_records_owner_module_created_idx` atende as listagens mais frequentes, filtradas por usuário e módulo e ordenadas por criação decrescente.

| Elemento | Finalidade | Validação realizada |
|---|---|---|
| `owner_open_id` | Isolamento lógico por usuário autenticado | Operações efêmeras foram criadas e removidas com filtro de proprietário. |
| `module` | Segmentação de domínio, como `orders`, `stock` e `transactions` | Consultas, atualizações e exclusões foram verificadas por módulo. |
| `record_id` | Identidade do registro dentro do módulo do usuário | CRUD real de Contatos, Produtos, Pedidos, Estoque e Financeiro foi validado. |
| Índice por usuário, módulo e criação | Desempenho das listagens recentes | A migração cria o índice e as consultas utilizam os campos do índice. |

## Snapshots operacionais

A tabela `public.erp_workspace_snapshots` usa a chave primária `(owner_open_id, module)`. Cada usuário possui no máximo um snapshot por módulo, atualizado por *upsert*. Esse modelo é aplicado a Fornecedores, Orçamentos, Produção, Sublimação, Biblioteca, Configurações e Marketing, onde a tela trabalha com coleções compactas e o estado inteiro é salvo de uma só vez.

| Garantia | Implementação |
|---|---|
| Isolamento | `owner_open_id` em todas as leituras e gravações. |
| Unicidade | Chave primária composta com o módulo. |
| Atualização atômica | `on_conflict=owner_open_id,module` com `resolution=merge-duplicates`. |
| Limite de conteúdo | Contrato tRPC restringe o payload de snapshot a 60.000 caracteres. |

As permissões REST necessárias foram concedidas exclusivamente ao `service_role`; as credenciais permanecem somente no servidor. A aplicação cliente chama procedimentos tRPC protegidos, não a API REST do Supabase diretamente.
