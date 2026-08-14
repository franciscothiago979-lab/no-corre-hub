# Auditoria de integração bidirecional — No Corre Shop ↔ No Corre Hub

## Evidências consultadas

O contrato atual do ERP está em `docs/no-corre-shop-integration.md`. Ele define o ERP como fonte operacional de produtos, preços, estoque disponível e status de pedidos. A loja chama o ERP somente pelo servidor e usa o cabeçalho `x-shop-sync-secret`.

O código recuperado da loja em `/home/ubuntu/no-corre-sport-source/active-recovery/erp-client.ts` confirma que ela já possui cliente de servidor para três chamadas ao ERP: criar pedido, consultar status e ler catálogo. As chamadas possuem timeout de 12 segundos e tratam respostas não JSON ou não bem-sucedidas como erro de comunicação.

O contrato recuperado da loja em `recovered-project/INTEGRACAO_ERP.md` confirma que a direção atualmente implementada é **loja → ERP para pedidos**. Não há, nesse material, receptor publicado da loja para receber alterações de produto, contato, estoque ou status iniciadas no ERP.

## Lacuna que precisa ser resolvida

A sincronização bidirecional solicitada requer endpoints autenticados na loja, além dos endpoints já publicados no ERP. Cada entidade deve carregar identificador estável, origem da modificação e data de atualização para evitar duplicidade e sobrescrita cega. O checkout da loja continua com investigação de HTTP 502 pendente; esse erro não deve ser mascarado pela ampliação do contrato.

## Direção segura recomendada para os dados

| Entidade | Fonte operacional proposta | Sincronização para o outro lado | Regra de segurança |
|---|---|---|---|
| Produtos e preço | ERP | ERP publica somente itens com SKU | SKU estável e atualização por versão/data |
| Estoque | ERP | ERP atualiza disponibilidade na loja | Variações exigem SKU próprio antes de baixa automática |
| Contatos | Loja/ERP | Criar ou atualizar por telefone/e-mail normalizados | Não sobrescrever campos preenchidos sem critério de precedência |
| Pedidos | Loja | Loja registra no ERP com `externalId` idempotente | Não gerar pedido duplicado em nova tentativa |
| Status do pedido | ERP | Loja consulta ou recebe atualização do ERP | Atualização monotônica, registrada com data e origem |

## Contrato de eventos aprovado para implementação

Cada inclusão ou atualização elegível deve ser representada por um envelope autenticado. O segredo compartilhado continua exclusivamente no servidor de cada aplicação, por meio do cabeçalho `x-shop-sync-secret`.

```json
{
  "eventId": "evt_01J...",
  "entity": "product | contact | stock | order_status",
  "operation": "upsert | delete",
  "source": "erp | shop",
  "externalId": "identificador estável no sistema de origem",
  "occurredAt": "2026-08-14T18:00:00.000Z",
  "payload": {}
}
```

| Entidade | Chave idempotente | Autoridade em caso de empate | Regra de atualização |
|---|---|---|---|
| Produto | SKU normalizado; se ausente, não sincroniza | ERP | Alteração mais recente vence; o ERP vence em empate de horário. |
| Estoque | SKU da variação | ERP | Nunca aceitar saldo negativo; a loja consome a disponibilidade publicada. |
| Contato | ID externo, e-mail normalizado ou telefone normalizado | Origem mais recente | Não apagar nem substituir campos não vazios sem revisão de versão. |
| Pedido | `externalId` da loja | Loja para criação; ERP para operação | Reenvio do mesmo identificador deve responder como duplicidade, sem novo pedido. |
| Status | `externalId` do pedido | ERP | Estado mais recente, com origem e data registradas; não retroceder automaticamente. |

As remoções não serão propagadas automaticamente nesta primeira etapa. Isso impede que uma exclusão local incompleta apague produto, contato ou histórico do outro sistema. Em vez disso, o registro pode ser marcado como indisponível e revisado pelo operador.

## Verificação do projeto de loja recuperado

O pacote recuperado da tarefa **Criar Site Intuitivo para Lojinha No Corre Sport & Streetwear** contém um cliente de envio de pedidos para o ERP, mas ainda não possui o receptor HTTP `/api/integrations/erp/events`. Também não há no schema atual da loja uma tabela de contatos, pedidos ou eventos de sincronização; há somente produtos, imagens e variantes de produto. Por isso, a primeira publicação deve criar o receptor e a trilha idempotente, além de adicionar campos de vínculo externo por SKU. Contatos e histórico de pedidos continuarão centralizados no ERP até que a loja tenha persistência própria para essas entidades.
