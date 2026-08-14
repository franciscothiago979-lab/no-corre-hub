# Correção de visibilidade de pedidos da No Corre Shop

## O que foi corrigido

A API protegida `POST /api/integrations/shop/orders` já gravava o pedido sob o `OWNER_OPEN_ID` configurado no ERP. A página administrativa **Pedidos**, porém, consultava os registros usando o identificador individual de quem estava logado. Quando os identificadores eram diferentes, o pedido recebia confirmação pela API, mas não aparecia na lista operacional.

O arquivo `server/routers.ts` agora usa `getOperationalOwnerOpenId()` em todas as operações do módulo **Pedidos**. Assim, qualquer administrador aprovado consulta e atualiza o mesmo espaço operacional usado pela integração da loja. Fora de uma configuração de proprietário, o sistema preserva o identificador do usuário autenticado como alternativa.

## Arquivos alterados

| Arquivo | Alteração |
|---|---|
| `server/routers.ts` | Unifica o proprietário operacional das operações de listar, criar, editar, atualizar status e excluir pedidos. |
| `server/orders.operational-owner.test.ts` | Cobre o uso do proprietário configurado e a alternativa segura sem configuração. |

## Validações executadas

| Verificação | Resultado |
|---|---|
| Regressão isolada de proprietário operacional | 2 testes aprovados |
| Verificação de tipos | Concluída sem erros |
| Compilação de produção | Concluída com sucesso |

## Como publicar

Substitua o código do projeto ativo do **No Core Hub** pelos arquivos deste pacote, preservando os segredos já configurados no projeto. Em seguida, salve/publice uma nova versão do ERP. Não altere `OWNER_OPEN_ID` nem a chave de sincronização durante a publicação.

Após a publicação, abra **Pedidos** usando uma conta administrativa aprovada. O pedido técnico já sincronizado deve aparecer; se desejar evitar o registro de teste na operação, ele pode ser cancelado pelo próprio ERP depois da confirmação visual. Faça também uma nova finalização técnica pela loja para confirmar que pedidos futuros aparecem imediatamente.
