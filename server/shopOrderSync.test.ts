import { describe, expect, it } from "vitest";
import { describeShopOrderItems, isDuplicateShopOrder, toCurrencyValue } from "../shared/shopOrderSync";

describe("normalização de pedidos da No Corre Shop", () => {
  it("preserva variação e quantidade na descrição operacional", () => {
    expect(describeShopOrderItems([
      { name: "Camiseta No Corre", variant: "Preta / M", quantity: 2, unitPriceCents: 8990 },
      { name: "Moletom Central", quantity: 1, unitPriceCents: 16990 },
    ])).toBe("2× Camiseta No Corre (Preta / M) · 1× Moletom Central");
  });

  it("identifica pedidos já importados pela chave externa", () => {
    expect(isDuplicateShopOrder([{ source: "no-corre-shop", externalId: "shop_001" }], "shop_001")).toBe(true);
    expect(isDuplicateShopOrder([{ source: "manual", externalId: "shop_001" }], "shop_001")).toBe(false);
  });

  it("converte centavos para o valor do ERP sem arredondamento indevido", () => {
    expect(toCurrencyValue(10999)).toBe(109.99);
  });
});
