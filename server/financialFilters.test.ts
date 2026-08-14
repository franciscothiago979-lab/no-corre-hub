import { describe, expect, it } from "vitest";
import { filterFinancialRecords, getFinancialFilterSummary, searchFinancialRecords } from "../shared/financialFilters";

const records = [
  { id: 1, description: "Receita em atraso", type: "income" as const, amount: 120, dueDate: "2026-08-01", settlementStatus: "pending" as const },
  { id: 2, description: "Despesa próxima", type: "expense" as const, amount: 45, dueDate: "2026-08-15", settlementStatus: "pending" as const },
  { id: 3, description: "Receita liquidada", type: "income" as const, amount: 90, dueDate: "2026-08-12", settlementStatus: "settled" as const },
  { id: 4, description: "Registro legado", type: "expense" as const, amount: 20, createdAt: "2026-08-10T12:00:00.000Z" },
];

describe("filtros financeiros", () => {
  it("separa pendências em atraso e próximos sete dias", () => {
    expect(filterFinancialRecords(records, { status: "all", type: "all", period: "overdue" }, "2026-08-12").map((item) => item.id)).toEqual([1]);
    expect(filterFinancialRecords(records, { status: "pending", type: "all", period: "next_7_days" }, "2026-08-12").map((item) => item.id)).toEqual([2]);
  });

  it("mantém registros legados como liquidados e calcula o resumo do recorte", () => {
    const settledExpenses = filterFinancialRecords(records, { status: "settled", type: "expense", period: "all" }, "2026-08-12");
    expect(settledExpenses.map((item) => item.id)).toEqual([4]);
    expect(getFinancialFilterSummary(settledExpenses)).toEqual({ income: 0, expenses: 20, balance: -20, count: 1 });
  });

  it("localiza descrições sem diferenciar maiúsculas ou acentuação e preserva os filtros aplicados", () => {
    const pending = filterFinancialRecords(records, { status: "pending", type: "all", period: "all" }, "2026-08-12");
    expect(searchFinancialRecords(pending, "DESPESA proxima").map((item) => item.id)).toEqual([2]);
    expect(searchFinancialRecords(pending, "receita").map((item) => item.id)).toEqual([1]);
    expect(searchFinancialRecords(pending, "inexistente")).toEqual([]);
  });
});
