import express from "express";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { registerShopIntegrationRoutes } from "./shopIntegration";

describe("autenticação da integração da loja", () => {
  const app = express();
  registerShopIntegrationRoutes(app);
  const server = app.listen(0);
  let baseUrl = "";

  beforeAll(() => {
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Servidor de teste não iniciou.");
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(() => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));

  it("aceita a chave de sincronização configurada", async () => {
    expect(process.env.SHOP_ERP_SYNC_SECRET).toBeTruthy();
    const response = await fetch(`${baseUrl}/api/integrations/shop/health`, {
      headers: { "x-shop-sync-secret": process.env.SHOP_ERP_SYNC_SECRET! },
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true, integration: "shop-orders" });
  });

  it("recusa uma chave diferente", async () => {
    const response = await fetch(`${baseUrl}/api/integrations/shop/health`, {
      headers: { "x-shop-sync-secret": "chave-incorreta" },
    });
    expect(response.status).toBe(401);
  });
});
