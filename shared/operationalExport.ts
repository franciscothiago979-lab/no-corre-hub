export type ExportColumn = { key: string; label: string };

function csvCell(value: unknown) {
  const normalized = value === null || value === undefined ? "" : String(value);
  return `"${normalized.replace(/"/g, '""')}"`;
}

export function recordsToCsv(records: Array<Record<string, unknown>>, columns: ExportColumn[]) {
  const header = columns.map((column) => csvCell(column.label)).join(";");
  const lines = records.map((record) => columns.map((column) => csvCell(record[column.key])).join(";"));
  return [header, ...lines].join("\n");
}

export function operationalSummaryCsv(input: { customers: number; products: number; orders: number; stockItems: number; income: number; expenses: number }) {
  return recordsToCsv([
    { indicator: "Contatos cadastrados", value: input.customers },
    { indicator: "Produtos cadastrados", value: input.products },
    { indicator: "Pedidos cadastrados", value: input.orders },
    { indicator: "Itens em estoque", value: input.stockItems },
    { indicator: "Receitas registradas", value: input.income.toFixed(2) },
    { indicator: "Despesas registradas", value: input.expenses.toFixed(2) },
    { indicator: "Saldo operacional", value: (input.income - input.expenses).toFixed(2) },
  ], [{ key: "indicator", label: "Indicador" }, { key: "value", label: "Valor" }]);
}
