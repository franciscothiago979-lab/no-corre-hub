import { describe, expect, it } from "vitest";
import { calculateShirtProduction } from "../shared/shirtProduction";

describe("calculadora de produção de camisas", () => {
  it("calcula custo do lote, custo unitário, preço sugerido e vantagem de fabricar", () => {
    const result = calculateShirtProduction({ quantity: 20, fabricCost: 200, seamstressCost: 100, cutterCost: 40, otherCost: 60, resellerUnitCost: 25, desiredMarginPercent: 40 });

    expect(result.totalProductionCost).toBe(400);
    expect(result.unitProductionCost).toBe(20);
    expect(result.suggestedUnitPrice).toBe(28);
    expect(result.decision).toBe("manufacture");
    expect(result.unitDifference).toBe(5);
    expect(result.totalDifference).toBe(100);
  });

  it("recomenda comprar quando o revendedor tem menor custo unitário", () => {
    const result = calculateShirtProduction({ quantity: 10, fabricCost: 220, seamstressCost: 100, cutterCost: 40, otherCost: 40, resellerUnitCost: 35, desiredMarginPercent: 30 });

    expect(result.unitProductionCost).toBe(40);
    expect(result.decision).toBe("buy");
    expect(result.unitDifference).toBe(5);
    expect(result.totalDifference).toBe(50);
  });

  it("mantém a comparação incompleta sem quantidade, custos ou preço do revendedor", () => {
    const result = calculateShirtProduction({ quantity: 0, fabricCost: 100, seamstressCost: 0, cutterCost: 0, otherCost: 0, resellerUnitCost: 0, desiredMarginPercent: 50 });

    expect(result.comparisonReady).toBe(false);
    expect(result.decision).toBe("incomplete");
    expect(result.suggestedUnitPrice).toBe(0);
  });
});
