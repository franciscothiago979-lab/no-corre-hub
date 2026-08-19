import { describe, expect, it } from "vitest";
import { getOperationalPriorities } from "./operationalPriorities";

describe("prioridades operacionais", () => {
  it("destaca variantes com estoque crítico e pedidos sem confirmação há mais de duas horas", () => {
    const priorities = getOperationalPriorities({
      orders: [{ id: 8, customerName: "Cliente", status: "awaiting_payment", createdAt: "2026-08-19T08:30:00.000Z" }],
      stockItems: [],
      products: [{ id: 4, name: "Camiseta Essential", stock: 4, minimumStock: 2, variations: JSON.stringify([{ title: "M / Preto", stock: 1 }, { title: "G / Preto", stock: 3 }]) }],
      income: 0,
      expenses: 0,
      now: new Date("2026-08-19T11:00:00.000Z"),
    });

    expect(priorities.map(priority => priority.id)).toEqual(expect.arrayContaining(["unconfirmed-orders", "low-variant-stock"]));
    expect(priorities.find(priority => priority.id === "low-variant-stock")?.description).toContain("M / Preto");
  });
});
