export type ModuleName = "clientes" | "produtos" | "fornecedores" | "estoque" | "pedidos" | "financeiro";
export type RecordItem = { id: string; title: string; subtitle: string; value?: string; status?: string };
export const seed: Record<ModuleName, RecordItem[]> = {
 clientes: [{ id: "CLI-001", title: "Cliente exemplo", subtitle: "WhatsApp: (85) 99999-9999", status: "Ativo" }],
 produtos: [{ id: "PRD-001", title: "NO CORRE Minimal 001", subtitle: "Poliamida 105g • Preto • M", value: "R$ 44,99", status: "Ativo" }],
 fornecedores: [{ id: "FOR-001", title: "Fornecedor de Malha", subtitle: "Poliamida Dry Fit 105g", status: "Ativo" }],
 estoque: [{ id: "EST-001", title: "Poliamida Dry Fit Preta", subtitle: "Tecido • 1,68m largura", value: "12 kg", status: "Normal" }, { id: "EST-002", title: "Saco de papel", subtitle: "Embalagem", value: "18 un.", status: "Baixo" }],
 pedidos: [{ id: "OP-2026-001", title: "Pedido #001", subtitle: "NO CORRE Minimal 001 • Tam. M", value: "R$ 44,99", status: "DTF" }],
 financeiro: [{ id: "FIN-001", title: "Venda Pedido #001", subtitle: "Entrada • Hoje", value: "+ R$ 44,99", status: "Recebido" }]
};
