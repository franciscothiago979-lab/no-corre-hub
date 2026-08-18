import { timingSafeEqual } from "crypto";
import type { Express, Request } from "express";
import { ENV } from "./_core/env";
import { createProduct, deleteOrder, deleteProduct, importShopOrder, listOrders, listProducts, updateOrderStatus, updateProduct } from "./db";
import { toShopCatalog } from "../shared/shopCatalogSync";
import { normalizeShopCheckoutPayload } from "../shared/shopCheckoutCompatibility";
import type { ShopOrderPayload } from "../shared/shopOrderSync";

type ShopIntegrationDependencies = {
  importShopOrder: typeof importShopOrder;
  listOrders: typeof listOrders;
  listProducts: typeof listProducts;
  createProduct: typeof createProduct;
  updateProduct: typeof updateProduct;
  deleteProduct: typeof deleteProduct;
  updateOrderStatus: typeof updateOrderStatus;
  deleteOrder: typeof deleteOrder;
};

type ShopProductInput = {
  externalProductId: string;
  sku: string;
  name: string;
  category: string;
  priceCents: number;
  stock: number;
  minimumStock: number;
  variations: string;
};

function hasValidShopSecret(request: Request) {
  const supplied = request.header("x-shop-sync-secret") ?? "";
  const configured = process.env.SHOP_ERP_SYNC_SECRET || process.env.ERP_SYNC_SECRET || ENV.shopSyncSecret;
  if (!configured || supplied.length !== configured.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(configured));
}

export function resolveShopOwnerOpenId(value = ENV.ownerOpenId) {
  const ownerOpenId = String(value || "").trim();
  if (!ownerOpenId) return "";
  return ownerOpenId.startsWith("supabase:") ? ownerOpenId : `supabase:${ownerOpenId}`;
}

export function normalizeShopProductInput(value: unknown): ShopProductInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const text = (field: string) => typeof raw[field] === "string" ? raw[field].trim() : "";
  const integer = (field: string) => typeof raw[field] === "number" && Number.isSafeInteger(raw[field]) && raw[field] >= 0 ? raw[field] : null;
  const externalProductId = text("externalProductId");
  const sku = text("sku");
  const name = text("name");
  const category = text("category");
  const priceCents = integer("priceCents");
  const stock = integer("stock");
  const minimumStock = integer("minimumStock");
  const variations = typeof raw.variations === "string" ? raw.variations.trim() : "";
  if (!externalProductId || !sku || !name || !category || priceCents === null || stock === null || minimumStock === null) return null;
  return { externalProductId, sku, name, category, priceCents, stock, minimumStock, variations };
}

export function registerShopIntegrationRoutes(app: Express, dependencies: ShopIntegrationDependencies = { importShopOrder, listOrders, listProducts, createProduct, updateProduct, deleteProduct, updateOrderStatus, deleteOrder }) {
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
      const products = await dependencies.listProducts(resolveShopOwnerOpenId());
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

  app.post("/api/integrations/shop/products", async (request, response) => {
    if (!hasValidShopSecret(request)) return response.status(401).json({ ok: false, error: "Não autorizado." });
    const input = normalizeShopProductInput(request.body);
    if (!input) return response.status(400).json({ ok: false, error: "Dados de produto inválidos." });
    try {
      const ownerOpenId = resolveShopOwnerOpenId();
      if (!ownerOpenId) return response.status(500).json({ ok: false, error: "Proprietário ERP não configurado." });
      const data = { name: input.name, category: input.category, sku: input.sku, variations: input.variations, price: input.priceCents / 100, stock: input.stock, minimumStock: input.minimumStock };
      const existing = (await dependencies.listProducts(ownerOpenId)).find((product) => product.sku === input.sku);
      const product = existing
        ? await dependencies.updateProduct(ownerOpenId, existing.id, data)
        : await dependencies.createProduct(ownerOpenId, data);
      return response.status(existing ? 200 : 201).json({ ok: true, erpProductId: product.id, externalProductId: input.externalProductId, sku: product.sku, updatedAt: product.updatedAt });
    } catch (error) {
      console.error("[Shop integration] Unable to upsert product:", error);
      return response.status(500).json({ ok: false, error: "Não foi possível sincronizar o produto." });
    }
  });

  app.delete("/api/integrations/shop/products/:sku", async (request, response) => {
    if (!hasValidShopSecret(request)) return response.status(401).json({ ok: false, error: "Não autorizado." });
    const sku = request.params.sku.trim();
    if (!sku) return response.status(400).json({ ok: false, error: "SKU inválido." });
    try {
      const ownerOpenId = resolveShopOwnerOpenId();
      const product = (await dependencies.listProducts(ownerOpenId)).find((candidate) => candidate.sku === sku);
      if (!product) return response.json({ ok: true, deleted: false, sku });
      await dependencies.deleteProduct(ownerOpenId, product.id);
      return response.json({ ok: true, deleted: true, sku });
    } catch (error) {
      console.error("[Shop integration] Unable to delete product:", error);
      return response.status(500).json({ ok: false, error: "Não foi possível remover o produto no ERP." });
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
      const order = (await dependencies.listOrders(resolveShopOwnerOpenId()))
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

  app.patch("/api/integrations/shop/orders/:externalId", async (request, response) => {
    if (!hasValidShopSecret(request)) return response.status(401).json({ ok: false, error: "Não autorizado." });
    const externalId = request.params.externalId.trim();
    const status = typeof request.body?.status === "string" ? request.body.status : "";
    if (!externalId || !["new", "contacted", "confirmed", "in_production", "ready", "completed", "cancelled"].includes(status)) {
      return response.status(400).json({ ok: false, error: "Atualização de pedido inválida." });
    }
    try {
      const ownerOpenId = resolveShopOwnerOpenId();
      const order = (await dependencies.listOrders(ownerOpenId)).find((record) => record.source === "no-corre-shop" && record.externalId === externalId);
      if (!order) return response.status(404).json({ ok: false, error: "Pedido não encontrado." });
      const updated = await dependencies.updateOrderStatus(ownerOpenId, order.id, status as typeof order.status);
      return response.json({ ok: true, order: { externalId, erpOrderId: updated.id, status: updated.status, paymentStatus: updated.paymentStatus ?? "pending", updatedAt: updated.updatedAt } });
    } catch (error) {
      console.error("[Shop integration] Unable to update order:", error);
      return response.status(500).json({ ok: false, error: "Não foi possível atualizar o pedido no ERP." });
    }
  });

  app.delete("/api/integrations/shop/orders/:externalId", async (request, response) => {
    if (!hasValidShopSecret(request)) return response.status(401).json({ ok: false, error: "Não autorizado." });
    const externalId = request.params.externalId.trim();
    if (!externalId) return response.status(400).json({ ok: false, error: "Identificador de pedido inválido." });
    try {
      const ownerOpenId = resolveShopOwnerOpenId();
      const order = (await dependencies.listOrders(ownerOpenId)).find((record) => record.source === "no-corre-shop" && record.externalId === externalId);
      if (!order) return response.json({ ok: true, deleted: false, externalId });
      await dependencies.deleteOrder(ownerOpenId, order.id);
      return response.json({ ok: true, deleted: true, externalId });
    } catch (error) {
      console.error("[Shop integration] Unable to delete order:", error);
      return response.status(500).json({ ok: false, error: "Não foi possível excluir o pedido no ERP." });
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
      const result = await dependencies.importShopOrder(resolveShopOwnerOpenId(), payload);
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
