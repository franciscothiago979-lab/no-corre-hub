import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { ENV } from "./_core/env";
import { createAsset, createCustomer, createOrder, createProduct, createStockItem, createTransaction, deleteAsset, deleteCustomer, deleteOrder, deleteProduct, deleteStockItem, deleteTransaction, getWorkspaceSnapshot, listAccessUsers, listAssets, listCustomers, listOrders, listProducts, listStockItems, listTransactions, saveWorkspaceSnapshot, setUserAccessRole, updateAsset, updateCustomer, updateOrder, updateOrderStatus, updateProduct, updateStockItem, updateTransaction } from "./db";
import { canChangeAdministratorRole } from "../shared/adminAccess";
import { clampConfidence, fallbackAssetName, hasUsefulFilename, type AssetCatalogInput } from "../shared/assetCatalog";
import { toShopCatalog } from "../shared/shopCatalogSync";
import { publishImmediateShopEvent } from "./shopSyncPublisher";
import { storageGetSignedUrl, storagePut } from "./storage";

const customerInput = z.object({ name: z.string().min(2), phone: z.string().optional(), email: z.string().email().optional().or(z.literal("")), city: z.string().optional(), type: z.enum(["individual", "company"]).default("individual") });
const productInput = z.object({ name: z.string().min(2), category: z.string().min(2), sku: z.string().min(1), variations: z.string().optional(), price: z.coerce.number().nonnegative(), stock: z.coerce.number().int().nonnegative(), minimumStock: z.coerce.number().int().nonnegative() });
const orderInput = z.object({ customerId: z.number().int().optional(), customerName: z.string().min(2), itemsDescription: z.string().min(2), total: z.coerce.number().nonnegative() });
const stockInput = z.object({ name: z.string().min(2), category: z.string().min(2), quantity: z.coerce.number().int().nonnegative(), minimumQuantity: z.coerce.number().int().nonnegative(), unitCost: z.coerce.number().nonnegative() });
const transactionInput = z.object({ description: z.string().min(2), type: z.enum(["income", "expense"]), amount: z.coerce.number().nonnegative(), dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), settlementStatus: z.enum(["pending", "settled"]).default("settled") });
const workspaceModule = z.enum(["orders", "suppliers", "quotes", "production", "shirt_production", "stock", "transactions", "assets", "company", "sublimation", "marketing"]);
const orderStatus = z.enum(["awaiting_payment", "in_production", "ready", "completed", "cancelled"]);
const assetMimeType = z.enum(["image/png", "image/jpeg", "image/webp"]);
const assetImportInput = z.object({ originalName: z.string().trim().min(1).max(180), mimeType: assetMimeType, dataUrl: z.string().min(32).max(11_500_000) });
const assetReviewInput = z.object({ id: z.number().int().positive(), name: z.string().trim().min(2).max(100), model: z.string().trim().min(2).max(80), theme: z.string().trim().min(2).max(100) });

/**
 * Pedidos que chegam pela integração HTTP já são persistidos sob o proprietário
 * operacional configurado. Os administradores aprovados devem consultar e
 * atualizar esse mesmo espaço de trabalho, mesmo quando seu openId individual
 * for diferente do dono técnico do projeto.
 */
export function getOperationalOwnerOpenId(userOpenId: string) {
  return ENV.ownerOpenId || userOpenId;
}

function parseAssetDataUrl(dataUrl: string, expectedMimeType: string) {
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([a-z0-9+/=\r\n]+)$/i.exec(dataUrl);
  if (!match || match[1].toLowerCase() !== expectedMimeType) throw new TRPCError({ code: "BAD_REQUEST", message: "O arquivo de imagem enviado não possui um formato válido." });
  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length || buffer.length > 8 * 1024 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Cada imagem pode ter até 8 MB." });
  return buffer;
}

function assetData(asset: { id: number; createdAt: string; updatedAt: string } & AssetCatalogInput): AssetCatalogInput {
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...data } = asset;
  return data;
}

function syncEventId(entity: string, externalId: string, updatedAt: string) {
  return `erp-${entity}-${createHash("sha256").update(`${externalId}:${updatedAt}`).digest("hex").slice(0, 24)}`;
}

async function publishProductToShop(ownerOpenId: string, product: Awaited<ReturnType<typeof createProduct>>) {
  const catalogProduct = toShopCatalog([product])[0];
  if (!catalogProduct) return;
  try {
    await publishImmediateShopEvent(ownerOpenId, {
      eventId: syncEventId("product", `sku:${catalogProduct.sku}`, product.updatedAt),
      entity: "product",
      operation: "upsert",
      source: "erp",
      externalId: `sku:${catalogProduct.sku}`,
      occurredAt: product.updatedAt,
      payload: catalogProduct,
    });
  } catch (error) {
    console.error("[Shop sync] Unable to persist product synchronization event", error);
  }
}

async function publishContactToShop(ownerOpenId: string, customer: Awaited<ReturnType<typeof createCustomer>>) {
  const externalId = `erp-customer:${customer.id}`;
  try {
    await publishImmediateShopEvent(ownerOpenId, {
      eventId: syncEventId("contact", externalId, customer.updatedAt),
      entity: "contact",
      operation: "upsert",
      source: "erp",
      externalId,
      occurredAt: customer.updatedAt,
      payload: { erpCustomerId: customer.id, name: customer.name, phone: customer.phone ?? null, email: customer.email ?? null, city: customer.city ?? null, type: customer.type, status: customer.status },
    });
  } catch (error) {
    console.error("[Shop sync] Unable to persist contact synchronization event", error);
  }
}

async function publishOrderStatusToShop(ownerOpenId: string, order: Awaited<ReturnType<typeof updateOrderStatus>>) {
  if (order.source !== "no-corre-shop" || !order.externalId) return;
  try {
    await publishImmediateShopEvent(ownerOpenId, {
      eventId: syncEventId("order-status", order.externalId, order.updatedAt),
      entity: "order_status",
      operation: "upsert",
      source: "erp",
      externalId: order.externalId,
      occurredAt: order.updatedAt,
      payload: { erpOrderId: order.id, externalId: order.externalId, status: order.status, paymentStatus: order.paymentStatus ?? "pending" },
    });
  } catch (error) {
    console.error("[Shop sync] Unable to persist order status synchronization event", error);
  }
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user ? { ...opts.ctx.user, isOwner: opts.ctx.user.openId === ENV.ownerOpenId } : null),
    logout: publicProcedure.mutation(() => ({ success: true } as const)),
  }),
  customers: router({
    list: adminProcedure.query(({ ctx }) => listCustomers(ctx.user.openId)),
    create: adminProcedure.input(customerInput).mutation(async ({ ctx, input }) => {
      const customer = await createCustomer(ctx.user.openId, { ...input, email: input.email || null, status: "active" });
      await publishContactToShop(ctx.user.openId, customer);
      return customer;
    }),
    update: adminProcedure.input(customerInput.extend({ id: z.number().int() })).mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const customer = await updateCustomer(ctx.user.openId, id, { ...data, email: data.email || null, status: "active" });
      await publishContactToShop(ctx.user.openId, customer);
      return customer;
    }),
    remove: adminProcedure.input(z.object({ id: z.number().int() })).mutation(({ ctx, input }) => deleteCustomer(ctx.user.openId, input.id)),
  }),
  products: router({
    list: adminProcedure.query(({ ctx }) => listProducts(ctx.user.openId)),
    create: adminProcedure.input(productInput).mutation(async ({ ctx, input }) => {
      const product = await createProduct(ctx.user.openId, input);
      await publishProductToShop(ctx.user.openId, product);
      return product;
    }),
    update: adminProcedure.input(productInput.extend({ id: z.number().int() })).mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const product = await updateProduct(ctx.user.openId, id, data);
      await publishProductToShop(ctx.user.openId, product);
      return product;
    }),
    remove: adminProcedure.input(z.object({ id: z.number().int() })).mutation(({ ctx, input }) => deleteProduct(ctx.user.openId, input.id)),
  }),
  orders: router({
    list: adminProcedure.query(({ ctx }) => listOrders(getOperationalOwnerOpenId(ctx.user.openId))),
    create: adminProcedure.input(orderInput).mutation(({ ctx, input }) => createOrder(getOperationalOwnerOpenId(ctx.user.openId), { ...input, status: "awaiting_payment" })),
    update: adminProcedure.input(orderInput.extend({ id: z.number().int(), status: orderStatus })).mutation(({ ctx, input }) => { const { id, ...data } = input; return updateOrder(getOperationalOwnerOpenId(ctx.user.openId), id, data); }),
    updateStatus: adminProcedure.input(z.object({ id: z.number().int(), status: orderStatus })).mutation(async ({ ctx, input }) => {
      const ownerOpenId = getOperationalOwnerOpenId(ctx.user.openId);
      const order = await updateOrderStatus(ownerOpenId, input.id, input.status);
      await publishOrderStatusToShop(ownerOpenId, order);
      return order;
    }),
    remove: adminProcedure.input(z.object({ id: z.number().int() })).mutation(({ ctx, input }) => deleteOrder(getOperationalOwnerOpenId(ctx.user.openId), input.id)),
  }),
  stock: router({
    list: adminProcedure.query(({ ctx }) => listStockItems(ctx.user.openId)),
    create: adminProcedure.input(stockInput).mutation(({ ctx, input }) => createStockItem(ctx.user.openId, input)),
    update: adminProcedure.input(stockInput.extend({ id: z.number().int() })).mutation(({ ctx, input }) => { const { id, ...data } = input; return updateStockItem(ctx.user.openId, id, data); }),
    remove: adminProcedure.input(z.object({ id: z.number().int() })).mutation(({ ctx, input }) => deleteStockItem(ctx.user.openId, input.id)),
  }),
  finance: router({
    list: adminProcedure.query(({ ctx }) => listTransactions(ctx.user.openId)),
    create: adminProcedure.input(transactionInput).mutation(({ ctx, input }) => createTransaction(ctx.user.openId, input)),
    update: adminProcedure.input(transactionInput.extend({ id: z.number().int() })).mutation(({ ctx, input }) => { const { id, ...data } = input; return updateTransaction(ctx.user.openId, input.id, data); }),
    remove: adminProcedure.input(z.object({ id: z.number().int() })).mutation(({ ctx, input }) => deleteTransaction(ctx.user.openId, input.id)),
  }),
  workspace: router({
    get: adminProcedure.input(z.object({ module: workspaceModule })).query(async ({ ctx, input }) => {
      const data = await getWorkspaceSnapshot(ctx.user.openId, input.module);
      return { data };
    }),
    save: adminProcedure.input(z.object({ module: workspaceModule, data: z.string().min(2).max(60000) })).mutation(async ({ ctx, input }) => {
      return saveWorkspaceSnapshot(ctx.user.openId, input.module, input.data);
    }),
  }),
  ai: router({
    generateBriefing: adminProcedure.input(z.object({ prompt: z.string().trim().min(12).max(1800) })).mutation(async ({ input }) => {
      const response = await invokeLLM({
        model: "gpt-5-mini",
        maxTokens: 900,
        messages: [
          { role: "system", content: "Você é diretor criativo especializado em estamparia, DTF, sublimação e streetwear brasileiro. Produza um briefing prático em português do Brasil, com as seções: Conceito, Direção visual, Paleta, Elementos principais, Técnica de impressão, Aplicações e Checklist de produção. Não invente dados de clientes, preços, resultados ou direitos autorais. Seja objetivo e use Markdown simples." },
          { role: "user", content: `Crie um briefing de arte a partir desta solicitação do usuário:\n\n${input.prompt}` },
        ],
      });
      const briefing = response.choices[0]?.message?.content;
      if (typeof briefing !== "string" || !briefing.trim()) throw new Error("A geração de briefing não retornou conteúdo. Tente novamente.");
      return { briefing };
    }),
    generateCampaign: adminProcedure.input(z.object({
      objective: z.string().trim().min(5).max(360),
      offer: z.string().trim().min(3).max(280),
      audience: z.string().trim().max(220).optional(),
      tone: z.enum(["direto", "energético", "premium", "informal"]).default("direto"),
    })).mutation(async ({ input }) => {
      const response = await invokeLLM({
        model: "gpt-5-mini",
        maxTokens: 650,
        messages: [
          { role: "system", content: "Você é redator de campanhas de WhatsApp para uma operação brasileira de estamparia, DTF, sublimação e streetwear. Gere um rascunho em português do Brasil, claro e responsável, com título curto, mensagem principal, CTA e duas variações curtas. Não invente preços, descontos, estoque, urgência, resultados, depoimentos, direitos autorais ou dados de clientes. Não afirme que uma mensagem foi enviada; o texto será revisado e enviado manualmente pelo usuário. Use Markdown simples." },
          { role: "user", content: `Objetivo: ${input.objective}\nOferta: ${input.offer}\nPúblico: ${input.audience?.trim() || "Não especificado"}\nTom: ${input.tone}\n\nCrie um rascunho de campanha editável.` },
        ],
      });
      const campaign = response.choices[0]?.message?.content;
      if (typeof campaign !== "string" || !campaign.trim()) throw new Error("A IA não retornou o rascunho da campanha. Tente novamente.");
      return { campaign };
    }),
  }),
  assets: router({
    list: adminProcedure.query(({ ctx }) => listAssets(ctx.user.openId)),
    import: adminProcedure.input(assetImportInput).mutation(async ({ ctx, input }) => {
      const buffer = parseAssetDataUrl(input.dataUrl, input.mimeType);
      const checksum = createHash("sha256").update(buffer).digest("hex");
      const existing = (await listAssets(ctx.user.openId)).find((asset) => asset.checksum === checksum);
      if (existing) return { duplicate: true as const, asset: existing };

      const safeName = input.originalName.replace(/[^a-z0-9._-]+/gi, "-").replace(/^-+|-+$/g, "") || "arte";
      const stored = await storagePut(`art-library/${ctx.user.openId}/${safeName}`, buffer, input.mimeType);
      const signedUrl = await storageGetSignedUrl(stored.key);
      const fallbackName = fallbackAssetName(input.originalName);
      let analysis = { suggestedName: fallbackName, model: "A revisar", theme: "A revisar", confidence: 0, notes: "Não foi possível concluir a análise automática. Revise esta arte manualmente." };
      try {
        const response = await invokeLLM({
          model: "gpt-5-mini",
          maxTokens: 450,
          messages: [
            { role: "system", content: "Você é especialista em catalogação visual para estamparia, DTF, sublimação e moda. Analise exclusivamente a imagem recebida. Sugira dados objetivos em português do Brasil, sem alegar direitos autorais, marcas, pessoas ou detalhes que não possam ser vistos. O nome deve ter no máximo 80 caracteres e descrever a arte. Quando não tiver segurança, indique 'A revisar' para modelo ou tema e reduza a confiança." },
            { role: "user", content: [{ type: "text", text: `Arquivo original: ${input.originalName}. Classifique a arte para uma biblioteca de produção.` }, { type: "image_url", image_url: { url: signedUrl, detail: "low" } }] },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "asset_catalog_suggestion",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  suggestedName: { type: "string" },
                  model: { type: "string" },
                  theme: { type: "string" },
                  confidence: { type: "number" },
                  notes: { type: "string" },
                },
                required: ["suggestedName", "model", "theme", "confidence", "notes"],
                additionalProperties: false,
              },
            },
          },
        });
        const parsed = JSON.parse(String(response.choices[0]?.message?.content ?? "{}")) as Record<string, unknown>;
        analysis = {
          suggestedName: typeof parsed.suggestedName === "string" && parsed.suggestedName.trim() ? parsed.suggestedName.trim().slice(0, 100) : fallbackName,
          model: typeof parsed.model === "string" && parsed.model.trim() ? parsed.model.trim().slice(0, 80) : "A revisar",
          theme: typeof parsed.theme === "string" && parsed.theme.trim() ? parsed.theme.trim().slice(0, 100) : "A revisar",
          confidence: clampConfidence(parsed.confidence),
          notes: typeof parsed.notes === "string" ? parsed.notes.trim().slice(0, 280) : "Revise a sugestão antes de catalogar.",
        };
      } catch (error) {
        console.warn("[Assets] AI catalog analysis failed", error);
      }

      const asset = await createAsset(ctx.user.openId, {
        originalName: input.originalName,
        name: fallbackName,
        model: "Não definido",
        theme: "Não definido",
        suggestedName: analysis.suggestedName,
        suggestedModel: analysis.model,
        suggestedTheme: analysis.theme,
        confidence: analysis.confidence,
        notes: analysis.notes,
        needsNameReview: !hasUsefulFilename(input.originalName),
        status: "pending_review",
        mimeType: input.mimeType,
        sizeBytes: buffer.length,
        checksum,
        storageKey: stored.key,
        url: stored.url,
      });
      return { duplicate: false as const, asset };
    }),
    approve: adminProcedure.input(assetReviewInput).mutation(async ({ ctx, input }) => {
      const asset = (await listAssets(ctx.user.openId)).find((item) => item.id === input.id);
      if (!asset) throw new TRPCError({ code: "NOT_FOUND", message: "A arte que você tentou catalogar não foi encontrada." });
      return updateAsset(ctx.user.openId, input.id, { ...assetData(asset), name: input.name, model: input.model, theme: input.theme, status: "approved" });
    }),
    markManual: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const asset = (await listAssets(ctx.user.openId)).find((item) => item.id === input.id);
      if (!asset) throw new TRPCError({ code: "NOT_FOUND", message: "A arte que você tentou atualizar não foi encontrada." });
      return updateAsset(ctx.user.openId, input.id, { ...assetData(asset), status: "manual" });
    }),
    remove: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => deleteAsset(ctx.user.openId, input.id)),
  }),
  access: router({
    list: adminProcedure.query(({ ctx }) => {
      if (ctx.user.openId !== ENV.ownerOpenId) throw new TRPCError({ code: "FORBIDDEN", message: "Somente o proprietário pode gerir aprovações." });
      return listAccessUsers();
    }),
    setRole: adminProcedure.input(z.object({ openId: z.string().min(1), role: z.enum(["admin", "user"]) })).mutation(async ({ ctx, input }) => {
      if (!canChangeAdministratorRole(ctx.user.openId, ENV.ownerOpenId, input.openId, input.role)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Você não pode alterar esta aprovação." });
      }
      const updated = await setUserAccessRole(input.openId, input.role);
      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado." });
      return updated;
    }),
  }),
});

export type AppRouter = typeof appRouter;
