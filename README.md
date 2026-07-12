# NO CORRE HUB

MVP do sistema de gestão da **NO CORRE SPORT & STREETWEAR**.

## Entrega

- Next.js, TypeScript e Tailwind CSS.
- Login de demonstração e painel administrativo responsivo.
- Clientes, produtos, fornecedores, estoque, pedidos/ordens, precificação, financeiro e relatórios.
- Simulador de artes em camisa e guia de tamanhos DTF por tamanho de camiseta.
- Calculadora preenchida com os dados discutidos: poliamida 105 g, R$ 64,90/kg e 5 m/kg.
- Banco PostgreSQL/Supabase relacional, preparado para acesso de você e sua esposa.

## Estado atual

A interface está em modo demonstração: os cadastros criados ficam somente na sessão. Dados reais, autenticação e permissões devem ser ativados conectando o Supabase. Assim, não há risco de confundir a demonstração com o financeiro da marca.

## Executar

1. Instale o Node.js LTS.
2. Abra INICIAR-NO-CORRE-HUB.cmd com dois cliques.
3. Quando aparecer "Ready", acesse http://localhost:3000.
4. Para banco e usuários reais, copie .env.example para .env.local e informe as chaves do Supabase.
5. No Supabase, execute supabase/schema.sql no SQL Editor e configure Authentication.

## Próximos passos

1. Conectar as páginas ao Supabase e implementar CRUD real.
2. Adicionar autenticação, recuperação de senha e perfis Admin/Operação/Financeiro/Vendas.
3. Baixar estoque automaticamente pelas ordens de produção.
4. Implementar DRE, fluxo de caixa, alertas, indicadores e relatórios.
5. Criar uma biblioteca de artes no Supabase Storage, enviando as artes do HD que forem selecionadas.
6. Publicar na Vercel e convidar sua esposa como usuária.

## Estrutura

- src/app: páginas.
- src/components: layout e componentes reutilizáveis.
- src/lib/types.ts: dados de demonstração.
- supabase/schema.sql: banco de dados.
