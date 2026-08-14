# Descoberta de integração — No Corre Shop

Fonte analisada: <https://nocoreshop-adsfkwqx.manus.space/>.

## Fluxo público observado

A loja disponibiliza catálogo, camisas, personalização, streetwear, artes e carrinho. A página pública informa que o cliente monta o carrinho e envia a lista pelo WhatsApp para confirmação da equipe. O carrinho vazio exibido em <https://nocoreshop-adsfkwqx.manus.space/carrinho> não apresenta checkout, pagamento ou endpoint público de criação de pedido.

## Ponto administrativo

A rota <https://nocoreshop-adsfkwqx.manus.space/admin> exige autenticação. Não foi executada nenhuma ação de login nem alterado qualquer dado da loja. Portanto, ainda não há evidência de um mecanismo oficial de webhook, API de pedidos ou banco compartilhado que permita sincronização automática.

Com acesso autorizado ao painel, foram observadas as áreas Produtos, Grade e estoque, Artes, Cupons, Frete, Configurações e Equipe. A carga de dados do painel utiliza tRPC e consulta `store.admin.products`, `store.admin.designs`, `store.admin.settings` e `store.admin.users`. Não foi observada uma consulta ou rota de pedidos no carregamento do painel, o que confirma que o fluxo atual de carrinho/WhatsApp não persiste um pedido comercial estruturado para integração.

O código JavaScript entregue pela loja foi inspecionado no navegador. Os procedimentos públicos identificados cobrem configurações, frete, cupom, catálogo, artes, mockups e produto por slug. Os procedimentos administrativos cobrem produtos, artes, mockups, cupons, frete, configurações e equipe. Não há procedimento `store.*` de criação, consulta ou atualização de pedidos, nem operação de checkout. Portanto, não existe uma rota já publicada que possa ser conectada ao ERP sem modificar o código-fonte da loja.

## Implicação técnica

Para uma integração automática confiável, a loja precisa gravar a confirmação do pedido ou chamar um endpoint autenticado do ERP no momento em que o pedido é enviado. A sincronização deve carregar identificador externo imutável, cliente, itens, valor, pagamento, observação e status inicial, usando esse identificador para impedir duplicidade. A próxima etapa exige acesso autorizado ao projeto da loja ou ao seu mecanismo oficial de integração.
