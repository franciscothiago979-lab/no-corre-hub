# Auditoria — ERP móvel e comunicação com a loja

## Experiência móvel

O ERP recebeu uma barra de ações fixa para telas pequenas, com atalhos para Início, Pedidos, Produção e Financeiro. A barra destaca a rota ativa, mantém áreas de toque adequadas e respeita a área segura inferior do dispositivo. O menu superior continua disponível para acesso aos demais módulos.

Em 390 × 844 pixels, Dashboard e Financeiro apresentaram cabeçalho, cards, ações e barra fixa sem sobreposição. O conteúdo recebeu espaço adicional ao final para que os controles e dados não fiquem encobertos pela navegação inferior.

## Estado da comunicação loja → ERP

O ERP possui a rota protegida `POST /api/integrations/shop/orders`, que autentica pelo segredo de sincronização, valida a estrutura do pedido, cria/localiza o contato, registra itens, pagamento e observações de produção e evita importação repetida pelo identificador externo. Os testes do ERP cobrem autenticação da rota e normalização/idempotência de pedidos.

O código atualizado da loja também está preparado para criar o pedido estruturado antes do encaminhamento ao WhatsApp. No entanto, essa versão ainda **não foi publicada no projeto original da loja**, portanto nenhuma compra feita na loja atualmente em produção chega automaticamente ao ERP. O fluxo automático será confirmado somente após a publicação da loja atualizada com `ERP_SYNC_URL` e `ERP_SYNC_SECRET` no ambiente de servidor.

Em 13 de agosto de 2026, a rota de saúde protegida do ERP foi consultada no domínio permanente com o segredo configurado e respondeu HTTP 200. Nenhum pedido foi enviado nesse teste. Assim, o receptor do ERP está disponível; a ausência atual de pedidos automáticos decorre exclusivamente da loja pública ainda usar a versão anterior, sem o checkout estruturado publicado.
