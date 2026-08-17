import express from "express";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { registerShopIntegrationRoutes } from "./shopIntegration";

describe("contrato de catálogo e acompanhamento da loja", () => {
  process.env.SHOP_ERP_SYNC_SECRET = process.env.SHOP_ERP_SYNC_SECRET || "test-shop-sync-secret";
  const app = express();
  registerShopIntegrationRoutes(app, {
    importShopOrder: async () => { throw new Error("Não utilizado neste teste"); },
    listProducts: async () => [{ id: 8, name: "Camiseta No Corre", category: "Camisas", sku: "NC-TS-001", variations: "P, M, G", price: 79.9, stock: 6, minimumStock: 2, createdAt: "2026-08-13T12:00:00.000Z", updatedAt: "2026-08-13T12:00:00.000Z" }],
    listOrders: async () => [{ id: 22, customerName: "Cliente", itemsDescription: "1× Camiseta", total: 79.9, status: "in_production", source: "no-corre-shop", externalId: "SHOP-22", paymentStatus: "paid", createdAt: "2026-08-13T12:00:00.000Z", updatedAt: "2026-08-13T13:00:00.000Z" }],
  });
  const server = app.listen(0);
  let baseUrl = "";

  beforeAll(() => {
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Servidor de teste não iniciou.");
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(() => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));

  it("expõe somente o catálogo normalizado com chave válida", async () => {
    const response = await fetch(`${baseUrl}/api/integrations/shop/catalog`, { headers: { "x-shop-sync-secret": process.env.SHOP_ERP_SYNC_SECRET! } });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true, products: [expect.objectContaining({ sku: "NC-TS-001", priceCents: 7990, available: true })] });
  });

  it("expõe o estado operacional do pedido somente com a chave compartilhada", async () => {
    const response = await fetch(`${baseUrl}/api/integrations/shop/orders/SHOP-22`, { headers: { "x-shop-sync-secret": process.env.SHOP_ERP_SYNC_SECRET! } });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true, order: { erpOrderId: 22, status: "in_production", paymentStatus: "paid" } });
  });

  it("não expõe catálogo sem a chave de sincronização", async () => {
    const response = await fetch(`${baseUrl}/api/integrations/shop/catalog`);
    expect(response.status).toBe(401);
  });
});
