import { describe, expect, it } from "vitest";
import { getFinancialDueSummary } from "../shared/financialDueDates";

describe("controle de vencimentos financeiros", () => {
  it("classifica somente lançamentos pendentes em atraso e nos próximos sete dias", () => {
    const summary = getFinancialDueSummary([
      { id: 1, description: "Fornecedor", type: "expense", amount: 180, dueDate: "2026-08-10", settlementStatus: "pending" },
      { id: 2, description: "Sinal de pedido", type: "income", amount: 320, dueDate: "2026-08-16", settlementStatus: "pending" },
      { id: 3, description: "Receita recebida", type: "income", amount: 90, dueDate: "2026-08-08", settlementStatus: "settled" },
    ], "2026-08-12");

    expect(summary.overdue.map((record) => record.id)).toEqual([1]);
    expect(summary.upcoming.map((record) => record.id)).toEqual([2]);
    expect(summary.overdueTotal).toBe(180);
    expect(summary.upcomingTotal).toBe(320);
  });

  it("trata registros anteriores sem status de liquidação como já registrados", () => {
    const summary = getFinancialDueSummary([{ id: 1, description: "Registro legado", type: "expense", amount: 50, dueDate: "2026-08-01" }], "2026-08-12");
    expect(summary.hasAlerts).toBe(false);
    expect(summary.pendingTotal).toBe(0);
  });
});
