import { describe, expect, it } from "vitest";
import { getOperationalPriorities } from "../shared/operationalPriorities";

describe("prioridades operacionais", () => {
  it("prioriza saldo negativo, cobranças, estoque mínimo e produção nessa ordem", () => {
    const priorities = getOperationalPriorities({
      income: 100,
      expenses: 180,
      orders: [{ id: 1, status: "in_production" }, { id: 2, status: "awaiting_payment" }],
      stockItems: [{ id: 1, name: "Camiseta branca M", quantity: 4, minimumQuantity: 5 }],
    });

    expect(priorities.map((priority) => priority.id)).toEqual(["negative-balance", "awaiting-payment", "low-stock", "in-production"]);
    expect(priorities[2]?.description).toContain("Camiseta branca M");
  });

  it("não cria alertas quando a operação não possui pendências mensuráveis", () => {
    expect(getOperationalPriorities({ income: 500, expenses: 200, orders: [{ id: 1, status: "completed" }], stockItems: [{ id: 1, name: "Filme DTF", quantity: 10, minimumQuantity: 3 }] })).toEqual([]);
  });
});
