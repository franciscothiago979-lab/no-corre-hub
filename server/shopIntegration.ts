import { timingSafeEqual } from "crypto";
import type { Express, Request } from "express";
import { ENV } from "./_core/env";
import { importShopOrder, listOrders, listProducts } from "./db";
import { toShopCatalog } from "../shared/shopCatalogSync";
import { normalizeShopCheckoutPayload } from "../shared/shopCheckoutCompatibility";
import type { ShopOrderPayload } from "../shared/shopOrderSync";

type ShopIntegrationDependencies = {
  importShopOrder: typeof importShopOrder;
  listOrders: typeof listOrders;
  listProducts: typeof listProducts;
};

function hasValidShopSecret(request: Request) {
  const supplied = request.header("x-shop-sync-secret") ?? "";
  const configured = ENV.shopSyncSecret;
  if (!configured || supplied.length !== configured.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(configured));
}

export function registerShopIntegrationRoutes(app: Express, dependencies: ShopIntegrationDependencies = { importShopOrder, listOrders, listProducts }) {
  app.get("/api/integrations/shop/health", (request, response) => {
    if (!hasValidShopSecret(request)) {
      return response.status(401).json({ ok: false, error: "Não autorizado." });
    }
    return response.json({ ok: true, integration: "shop-orders" });
  });

  app.get("/api/integrations/shop/catalog", async (request, response) => {
    if (!hasValidShopSecret(request)) {
      return response.status(401).json({ ok: false, error: "Não autorizado." });
    }
    try {
      const products = await dependencies.listProducts(ENV.ownerOpenId);
      response.set("Cache-Control", "no-store");
      return response.json({
        ok: true,
        generatedAt: new Date().toISOString(),
        products: toShopCatalog(products),
      });
    } catch (error) {
      console.error("[Shop integration] Unable to read catalog:", error);
      return response.status(500).json({ ok: false, error: "Não foi possível consultar o catálogo do ERP." });
    }
  });

  app.get("/api/integrations/shop/orders/:externalId", async (request, response) => {
    if (!hasValidShopSecret(request)) {
      return response.status(401).json({ ok: false, error: "Não autorizado." });
    }
    const externalId = request.params.externalId.trim();
    if (!externalId) {
      return response.status(400).json({ ok: false, error: "Identificador de pedido inválido." });
    }
    try {
      const order = (await dependencies.listOrders(ENV.ownerOpenId))
        .find((record) => record.source === "no-corre-shop" && record.externalId === externalId);
      if (!order) {
        return response.status(404).json({ ok: false, error: "Pedido não encontrado." });
      }
      response.set("Cache-Control", "no-store");
      return response.json({
        ok: true,
        order: {
          externalId,
          erpOrderId: order.id,
          status: order.status,
          paymentStatus: order.paymentStatus ?? "pending",
          updatedAt: order.updatedAt,
        },
      });
    } catch (error) {
      console.error("[Shop integration] Unable to read order status:", error);
      return response.status(500).json({ ok: false, error: "Não foi possível consultar o pedido no ERP." });
    }
  });

  app.post("/api/integrations/shop/orders", async (request, response) => {
    if (!hasValidShopSecret(request)) {
      return response.status(401).json({ ok: false, error: "Não autorizado." });
    }
    const payload = normalizeShopCheckoutPayload(request.body);
    if (!payload) {
      return response.status(400).json({ ok: false, error: "Dados de pedido inválidos." });
    }
    try {
      const result = await dependencies.importShopOrder(ENV.ownerOpenId, payload);
      return response.status(result.duplicate ? 200 : 201).json({
        ok: true,
        duplicate: result.duplicate,
        orderId: result.order.id,
        externalId: payload.externalId,
        status: result.order.status,
      });
    } catch (error) {
      console.error("[Shop integration] Unable to import order:", error);
      return response.status(500).json({ ok: false, error: "Não foi possível sincronizar o pedido." });
    }
  });
}
