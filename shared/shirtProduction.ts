export type ShirtProductionInput = {
  quantity: number;
  fabricCost: number;
  seamstressCost: number;
  cutterCost: number;
  otherCost: number;
  resellerUnitCost: number;
  desiredMarginPercent: number;
};

export type MakeOrBuyDecision = "manufacture" | "buy" | "tie" | "incomplete";

const positiveNumber = (value: number) => Number.isFinite(value) ? Math.max(0, value) : 0;

export function calculateShirtProduction(input: ShirtProductionInput) {
  const quantity = positiveNumber(input.quantity);
  const fabricCost = positiveNumber(input.fabricCost);
  const seamstressCost = positiveNumber(input.seamstressCost);
  const cutterCost = positiveNumber(input.cutterCost);
  const otherCost = positiveNumber(input.otherCost);
  const resellerUnitCost = positiveNumber(input.resellerUnitCost);
  const desiredMarginPercent = positiveNumber(input.desiredMarginPercent);
  const totalProductionCost = fabricCost + seamstressCost + cutterCost + otherCost;
  const unitProductionCost = quantity > 0 ? totalProductionCost / quantity : 0;
  const suggestedUnitPrice = unitProductionCost * (1 + desiredMarginPercent / 100);
  const comparisonReady = quantity > 0 && totalProductionCost > 0 && resellerUnitCost > 0;
  const unitDifference = comparisonReady ? Math.abs(resellerUnitCost - unitProductionCost) : 0;
  const totalDifference = unitDifference * quantity;
  const decision: MakeOrBuyDecision = !comparisonReady
    ? "incomplete"
    : unitProductionCost < resellerUnitCost
      ? "manufacture"
      : unitProductionCost > resellerUnitCost
        ? "buy"
        : "tie";

  const recommendation = decision === "manufacture"
    ? `Fabricar internamente reduz ${unitDifference.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} por peça neste lote.`
    : decision === "buy"
      ? `Comprar do revendedor reduz ${unitDifference.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} por peça neste lote.`
      : decision === "tie"
        ? "Os custos por peça estão empatados; avalie prazo, qualidade, capacidade e risco operacional."
        : "Informe quantidade, custos de fabricação e preço por peça do revendedor para comparar.";

  return { quantity, fabricCost, seamstressCost, cutterCost, otherCost, resellerUnitCost, desiredMarginPercent, totalProductionCost, unitProductionCost, suggestedUnitPrice, comparisonReady, unitDifference, totalDifference, decision, recommendation };
}
