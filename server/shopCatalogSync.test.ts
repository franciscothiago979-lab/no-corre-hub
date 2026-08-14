import { describe, expect, it } from "vitest";
import { toShopCatalog } from "../shared/shopCatalogSync";

describe("catálogo sincronizável da loja", () => {
  it("normaliza preço, disponibilidade e ordena pelo SKU", () => {
    const catalog = toShopCatalog([
      { id: 2, name: "Camiseta preta", category: "Camisas", sku: "CAM-20", variations: "M, G", price: 59.9, stock: 0, minimumStock: 2, updatedAt: "2026-08-13T12:00:00.000Z" },
      { id: 1, name: "Caneca", category: "Sublimação", sku: "CAN-01", price: 35.5, stock: 4, minimumStock: 1, updatedAt: "2026-08-13T12:00:00.000Z" },
    ]);

    expect(catalog).toEqual([
      expect.objectContaining({ sku: "CAM-20", priceCents: 5990, stock: 0, available: false, variations: "M, G" }),
      expect.objectContaining({ sku: "CAN-01", priceCents: 3550, stock: 4, available: true }),
    ]);
  });

  it("não expõe produtos sem SKU para evitar associações ambíguas", () => {
    expect(toShopCatalog([
      { id: 3, name: "Produto sem chave", category: "Outros", sku: "  ", price: 10, stock: 2, minimumStock: 0, updatedAt: "2026-08-13T12:00:00.000Z" },
    ])).toEqual([]);
  });
});
