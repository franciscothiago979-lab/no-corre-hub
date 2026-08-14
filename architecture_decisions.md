# Decisões de arquitetura

## Shell de navegação do ERP

O componente `client/src/components/DashboardLayout.tsx` do template foi avaliado antes da definição do shell final. Ele oferece uma navegação genérica com apenas duas entradas de exemplo (`Page 1` e `Page 2`), textos em inglês e comportamento de redimensionamento armazenado no navegador.

O No Corre Central mantém um shell próprio em `client/src/App.tsx` porque precisa de uma hierarquia lateral específica para os módulos de estamparia, DTF, sublimação, produção, estoque e gestão, além da identidade visual oficial, cabeçalho de operação e navegação móvel compatível com as rotas do ERP. O shell próprio reutiliza a autenticação existente e protege as telas pelo mesmo fluxo de sessão, sem duplicar credenciais ou contratos do backend.

Essa escolha reduz adaptações no componente genérico e preserva uma experiência coerente com o domínio do ERP. O `DashboardLayout` permanece disponível no projeto para páginas futuras que não dependam da navegação operacional.

## Persistência operacional

Os cadastros centrais usam registros estruturados em `erp_records` no Supabase. Módulos que trabalham com listas operacionais compactas usam snapshots JSON em `erp_workspace_snapshots`, isolados por usuário e módulo. As duas estratégias foram validadas com registros efêmeros removidos ao término dos testes.
