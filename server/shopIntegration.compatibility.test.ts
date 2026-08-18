import express from "express";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { registerShopIntegrationRoutes } from "./shopIntegration";

describe("compatibilidade do checkout publicado da loja", () => {
  const imported = vi.fn();
  const app = express();
  app.use(express.json());
  registerShopIntegrationRoutes(app, {
    importShopOrder: imported,
    listOrders: vi.fn(),
    listProducts: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
  });
  const server = app.listen(0);
  let baseUrl = "";

  beforeAll(() => {
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Servidor de teste não iniciou.");
    baseUrl = `http://127.0.0.1:${address.port}`;
    imported.mockResolvedValue({ duplicate: false, order: { id: 72, status: "awaiting_payment" } });
  });

  afterAll(() => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));

  it("normaliza externalOrderId, totais e variante do checkout publicado", async () => {
    const response = await fetch(`${baseUrl}/api/integrations/shop/orders`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-shop-sync-secret": process.env.SHOP_ERP_SYNC_SECRET!,
      },
      body: JSON.stringify({
        externalOrderId: "NC-COMPAT-001",
        source: "no-corre-storefront",
        customer: { name: "Cliente de teste", phone: "11999999999", notes: "TESTE ERP" },
        items: [{ productId: 10, sku: "NC-TS-001", variantId: "preta-g", name: "Camisa preta", colorName: "Preto", colorHex: "#000000", size: "G", quantity: 1, unitPriceCents: 4599 }],
        totals: { subtotalCents: 4599, discountCents: 0, shippingCents: 0, totalCents: 4599 },
        orderSummary: "1 camisa preta G",
      }),
    });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({ ok: true, externalId: "NC-COMPAT-001", orderId: 72 });
    expect(imported).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      externalId: "NC-COMPAT-001",
      totalCents: 4599,
      shippingCents: 0,
      discountCents: 0,
      paymentStatus: "pending",
      items: [{ sku: "NC-TS-001", variantId: "preta-g", name: "Camisa preta", variant: "Preto · G", quantity: 1, unitPriceCents: 4599 }],
    }));
  });
});
