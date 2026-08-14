import { describe, expect, it } from "vitest";
import { operationalSummaryCsv, recordsToCsv } from "../shared/operationalExport";

describe("operational export", () => {
  it("normaliza valores e protege aspas para CSV", () => {
    expect(recordsToCsv([{ name: "Camiseta \"Urban\"", stock: 2 }], [{ key: "name", label: "Produto" }, { key: "stock", label: "Estoque" }])).toBe('"Produto";"Estoque"\n"Camiseta ""Urban""";"2"');
  });

  it("calcula o saldo no resumo operacional exportado", () => {
    const csv = operationalSummaryCsv({ customers: 3, products: 4, orders: 5, stockItems: 6, income: 1200, expenses: 450.5 });
    expect(csv).toContain('"Saldo operacional";"749.50"');
    expect(csv.split("\n")).toHaveLength(8);
  });
});
