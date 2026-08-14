import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { supabaseRest } from "./supabase";
import { describeShopOrderItems, isDuplicateShopOrder, toCurrencyValue, type ShopOrderPayload } from "../shared/shopOrderSync";
import type { AssetCatalogInput } from "../shared/assetCatalog";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  values.lastSignedIn ??= new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listAccessUsers() {
  const db = await getDb();
  if (!db) return [];
  const records = await db.select({
    openId: users.openId,
    name: users.name,
    email: users.email,
    role: users.role,
    lastSignedIn: users.lastSignedIn,
  }).from(users);
  return records;
}

export async function setUserAccessRole(openId: string, role: "admin" | "user") {
  const db = await getDb();
  if (!db) throw new Error("Banco de usuários indisponível.");
  await db.update(users).set({ role }).where(eq(users.openId, openId));
  return getUserByOpenId(openId);
}

export type CustomerRecord = {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  type: "individual" | "company";
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductRecord = {
  id: number;
  name: string;
  category: string;
  sku: string;
  variations?: string;
  price: number;
  stock: number;
  minimumStock: number;
  createdAt: string;
  updatedAt: string;
};

export type OrderRecord = {
  id: number;
  customerId?: number;
  customerName: string;
  itemsDescription: string;
  total: number;
  status: "awaiting_payment" | "in_production" | "ready" | "completed" | "cancelled";
  source?: "manual" | "no-corre-shop";
  externalId?: string | null;
  paymentMethod?: string | null;
  paymentStatus?: "pending" | "paid" | "failed" | null;
  productionNotes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StockRecord = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  minimumQuantity: number;
  unitCost: number;
  createdAt: string;
  updatedAt: string;
};

export type TransactionRecord = {
  id: number;
  description: string;
  type: "income" | "expense";
  amount: number;
  dueDate?: string | null;
  settlementStatus?: "pending" | "settled" | null;
  createdAt: string;
  updatedAt: string;
};

export type AssetRecord = AssetCatalogInput & {
  id: number;
  createdAt: string;
  updatedAt: string;
};

export type ShopSyncEventRecord = {
  id: number;
  eventId: string;
  entity: "product" | "contact" | "stock" | "order_status";
  externalId: string;
  occurredAt: string;
  payload: Record<string, unknown>;
  status: "pending" | "delivered" | "skipped" | "failed";
  statusMessage?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

type ErpRecordModule = "customers" | "products" | "orders" | "stock" | "transactions" | "assets" | "sync_events";
type SupabaseRecordRow<T extends object> = {
  record_id: number | string;
  data: T;
  created_at: string;
  updated_at: string;
};

function erpQuery(params: Record<string, string>) {
  return new URLSearchParams(params).toString();
}

function recordPath(ownerOpenId: string, module: ErpRecordModule, extra: Record<string, string> = {}) {
  return `erp_records?${erpQuery({
    owner_open_id: `eq.${ownerOpenId}`,
    module: `eq.${module}`,
    ...extra,
  })}`;
}

async function listErpRecords<T extends object>(ownerOpenId: string, module: ErpRecordModule): Promise<Array<T & { id: number; createdAt: string; updatedAt: string }>> {
  const rows = await supabaseRest<Array<SupabaseRecordRow<T>>>(recordPath(ownerOpenId, module, {
    select: "record_id,data,created_at,updated_at",
    order: "record_id.desc",
  }));
  return rows.map((row) => {
    const data = row.data as T & { createdAt?: string; updatedAt?: string };
    return {
      ...data,
      id: Number(row.record_id),
      createdAt: data.createdAt ?? row.created_at,
      updatedAt: data.updatedAt ?? row.updated_at,
    };
  });
}

async function nextRecordId(ownerOpenId: string, module: ErpRecordModule) {
  const rows = await supabaseRest<Array<Pick<SupabaseRecordRow<object>, "record_id">>>(recordPath(ownerOpenId, module, {
    select: "record_id",
    order: "record_id.desc",
    limit: "1",
  }));
  return rows.length ? Number(rows[0].record_id) + 1 : 1;
}

async function createErpRecord<T extends object>(ownerOpenId: string, module: ErpRecordModule, data: T): Promise<T & { id: number; createdAt: string; updatedAt: string }> {
  const recordId = await nextRecordId(ownerOpenId, module);
  const timestamp = new Date().toISOString();
  const payload = { ...data, createdAt: timestamp, updatedAt: timestamp };
  const rows = await supabaseRest<Array<SupabaseRecordRow<typeof payload>>>("erp_records", {
    method: "POST",
    body: [{ owner_open_id: ownerOpenId, module, record_id: recordId, data: payload }],
    prefer: "return=representation",
  });
  const created = rows[0];
  if (!created) throw new Error("O registro não foi confirmado pelo Supabase.");
  return { ...payload, id: Number(created.record_id) };
}

async function updateErpRecord<T extends object>(ownerOpenId: string, module: ErpRecordModule, recordId: number, data: T): Promise<T & { id: number; createdAt: string; updatedAt: string }> {
  const timestamp = new Date().toISOString();
  const payload = { ...data, updatedAt: timestamp };
  const rows = await supabaseRest<Array<SupabaseRecordRow<typeof payload>>>(recordPath(ownerOpenId, module, {
    record_id: `eq.${recordId}`,
  }), {
    method: "PATCH",
    body: { data: payload },
    prefer: "return=representation",
  });
  const updated = rows[0];
  if (!updated) throw new Error("O registro que você tentou editar não foi encontrado.");
  const stored = updated.data as typeof payload & { createdAt?: string };
  return {
    ...stored,
    id: Number(updated.record_id),
    createdAt: stored.createdAt ?? updated.created_at,
    updatedAt: stored.updatedAt,
  } as T & { id: number; createdAt: string; updatedAt: string };
}

async function deleteErpRecord(ownerOpenId: string, module: ErpRecordModule, recordId: number) {
  const rows = await supabaseRest<Array<Pick<SupabaseRecordRow<object>, "record_id">>>(recordPath(ownerOpenId, module, {
    record_id: `eq.${recordId}`,
  }), {
    method: "DELETE",
    prefer: "return=representation",
  });
  if (!rows.length) throw new Error("O registro que você tentou excluir não foi encontrado.");
  return { success: true } as const;
}

export async function listCustomers(ownerOpenId: string) {
  return listErpRecords<Omit<CustomerRecord, "id" | "createdAt" | "updatedAt">>(ownerOpenId, "customers");
}

export async function createCustomer(ownerOpenId: string, data: Omit<CustomerRecord, "id" | "createdAt" | "updatedAt">) {
  return createErpRecord(ownerOpenId, "customers", data);
}

export async function updateCustomer(ownerOpenId: string, id: number, data: Omit<CustomerRecord, "id" | "createdAt" | "updatedAt">) {
  const existing = (await listCustomers(ownerOpenId)).find((customer) => customer.id === id);
  if (!existing) throw new Error("O contato que você tentou editar não foi encontrado.");
  return updateErpRecord(ownerOpenId, "customers", id, { ...data, createdAt: existing.createdAt });
}

export async function deleteCustomer(ownerOpenId: string, id: number) {
  return deleteErpRecord(ownerOpenId, "customers", id);
}

export async function listProducts(ownerOpenId: string) {
  return listErpRecords<Omit<ProductRecord, "id" | "createdAt" | "updatedAt">>(ownerOpenId, "products");
}

export async function createProduct(ownerOpenId: string, data: Omit<ProductRecord, "id" | "createdAt" | "updatedAt">) {
  return createErpRecord(ownerOpenId, "products", data);
}

export async function updateProduct(ownerOpenId: string, id: number, data: Omit<ProductRecord, "id" | "createdAt" | "updatedAt">) {
  const existing = (await listProducts(ownerOpenId)).find((product) => product.id === id);
  if (!existing) throw new Error("O produto que você tentou editar não foi encontrado.");
  return updateErpRecord(ownerOpenId, "products", id, { ...data, createdAt: existing.createdAt });
}

export async function deleteProduct(ownerOpenId: string, id: number) {
  return deleteErpRecord(ownerOpenId, "products", id);
}

export async function listOrders(ownerOpenId: string) {
  return listErpRecords<Omit<OrderRecord, "id" | "createdAt" | "updatedAt">>(ownerOpenId, "orders");
}

export async function createOrder(ownerOpenId: string, data: Omit<OrderRecord, "id" | "createdAt" | "updatedAt">) {
  return createErpRecord(ownerOpenId, "orders", data);
}

export async function updateOrder(ownerOpenId: string, id: number, data: Omit<OrderRecord, "id" | "createdAt" | "updatedAt">) {
  const existing = (await listOrders(ownerOpenId)).find((order) => order.id === id);
  if (!existing) throw new Error("O pedido que você tentou editar não foi encontrado.");
  return updateErpRecord(ownerOpenId, "orders", id, { ...data, createdAt: existing.createdAt });
}

export async function updateOrderStatus(ownerOpenId: string, id: number, status: OrderRecord["status"]) {
  const existing = (await listOrders(ownerOpenId)).find((order) => order.id === id);
  if (!existing) throw new Error("O pedido que você tentou atualizar não foi encontrado.");
  return updateErpRecord(ownerOpenId, "orders", id, { ...existing, status, createdAt: existing.createdAt });
}

export async function deleteOrder(ownerOpenId: string, id: number) {
  return deleteErpRecord(ownerOpenId, "orders", id);
}

export async function importShopOrder(ownerOpenId: string, payload: ShopOrderPayload) {
  const existingOrders = await listOrders(ownerOpenId);
  const existing = existingOrders.find((order) => isDuplicateShopOrder([order], payload.externalId));
  if (existing) return { order: existing, duplicate: true };

  const normalize = (value?: string | null) => value?.trim().toLowerCase() || "";
  const customers = await listCustomers(ownerOpenId);
  const customer = customers.find((record) =>
    (payload.customer.phone && normalize(record.phone) === normalize(payload.customer.phone)) ||
    (payload.customer.email && normalize(record.email) === normalize(payload.customer.email))
  ) ?? await createCustomer(ownerOpenId, {
    name: payload.customer.name.trim(),
    phone: payload.customer.phone?.trim() || null,
    email: payload.customer.email?.trim() || null,
    city: payload.customer.city?.trim() || null,
    type: "individual",
    status: "active",
  });

  const total = toCurrencyValue(payload.totalCents);
  const created = await createOrder(ownerOpenId, {
    customerId: customer.id,
    customerName: customer.name,
    itemsDescription: describeShopOrderItems(payload.items),
    total,
    status: payload.paymentStatus === "paid" ? "in_production" : "awaiting_payment",
    source: "no-corre-shop",
    externalId: payload.externalId,
    paymentMethod: payload.paymentMethod?.trim() || null,
    paymentStatus: payload.paymentStatus ?? "pending",
    productionNotes: payload.notes?.trim() || null,
  });
  return { order: created, duplicate: false };
}

export async function listStockItems(ownerOpenId: string) {
  return listErpRecords<Omit<StockRecord, "id" | "createdAt" | "updatedAt">>(ownerOpenId, "stock");
}

export async function createStockItem(ownerOpenId: string, data: Omit<StockRecord, "id" | "createdAt" | "updatedAt">) {
  return createErpRecord(ownerOpenId, "stock", data);
}

export async function updateStockItem(ownerOpenId: string, id: number, data: Omit<StockRecord, "id" | "createdAt" | "updatedAt">) {
  const existing = (await listStockItems(ownerOpenId)).find((item) => item.id === id);
  if (!existing) throw new Error("O item de estoque que você tentou editar não foi encontrado.");
  return updateErpRecord(ownerOpenId, "stock", id, { ...data, createdAt: existing.createdAt });
}

export async function deleteStockItem(ownerOpenId: string, id: number) {
  return deleteErpRecord(ownerOpenId, "stock", id);
}

export async function listTransactions(ownerOpenId: string) {
  return listErpRecords<Omit<TransactionRecord, "id" | "createdAt" | "updatedAt">>(ownerOpenId, "transactions");
}

export async function createTransaction(ownerOpenId: string, data: Omit<TransactionRecord, "id" | "createdAt" | "updatedAt">) {
  return createErpRecord(ownerOpenId, "transactions", data);
}

export async function updateTransaction(ownerOpenId: string, id: number, data: Omit<TransactionRecord, "id" | "createdAt" | "updatedAt">) {
  const existing = (await listTransactions(ownerOpenId)).find((transaction) => transaction.id === id);
  if (!existing) throw new Error("A transação que você tentou editar não foi encontrada.");
  return updateErpRecord(ownerOpenId, "transactions", id, { ...data, createdAt: existing.createdAt });
}

export async function deleteTransaction(ownerOpenId: string, id: number) {
  return deleteErpRecord(ownerOpenId, "transactions", id);
}

export async function listAssets(ownerOpenId: string) {
  return listErpRecords<Omit<AssetRecord, "id" | "createdAt" | "updatedAt">>(ownerOpenId, "assets");
}

export async function createAsset(ownerOpenId: string, data: Omit<AssetRecord, "id" | "createdAt" | "updatedAt">) {
  return createErpRecord(ownerOpenId, "assets", data);
}

export async function updateAsset(ownerOpenId: string, id: number, data: Omit<AssetRecord, "id" | "createdAt" | "updatedAt">) {
  const existing = (await listAssets(ownerOpenId)).find((asset) => asset.id === id);
  if (!existing) throw new Error("A arte que você tentou atualizar não foi encontrada.");
  return updateErpRecord(ownerOpenId, "assets", id, { ...data, createdAt: existing.createdAt });
}

export async function deleteAsset(ownerOpenId: string, id: number) {
  return deleteErpRecord(ownerOpenId, "assets", id);
}

export async function createShopSyncEvent(ownerOpenId: string, data: Omit<ShopSyncEventRecord, "id" | "createdAt" | "updatedAt">) {
  return createErpRecord(ownerOpenId, "sync_events", data);
}

export async function updateShopSyncEvent(ownerOpenId: string, id: number, data: Omit<ShopSyncEventRecord, "id" | "createdAt" | "updatedAt">) {
  const existing = (await listShopSyncEvents(ownerOpenId)).find((event) => event.id === id);
  if (!existing) throw new Error("O evento de sincronização não foi encontrado.");
  return updateErpRecord(ownerOpenId, "sync_events", id, { ...data, createdAt: existing.createdAt });
}

export async function listShopSyncEvents(ownerOpenId: string) {
  return listErpRecords<Omit<ShopSyncEventRecord, "id" | "createdAt" | "updatedAt">>(ownerOpenId, "sync_events");
}

type SupabaseSnapshot = { data: unknown };

export async function getWorkspaceSnapshot(ownerOpenId: string, module: string) {
  const query = new URLSearchParams({
    owner_open_id: `eq.${ownerOpenId}`,
    module: `eq.${module}`,
    select: "data",
    limit: "1",
  });
  const rows = await supabaseRest<SupabaseSnapshot[]>(`erp_workspace_snapshots?${query.toString()}`);
  return rows[0] ? JSON.stringify(rows[0].data) : null;
}

export async function saveWorkspaceSnapshot(ownerOpenId: string, module: string, data: string) {
  let parsedData: unknown;
  try {
    parsedData = JSON.parse(data);
  } catch {
    throw new Error("Os dados a salvar não possuem formato válido.");
  }
  await supabaseRest<SupabaseSnapshot[]>("erp_workspace_snapshots?on_conflict=owner_open_id,module", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=representation",
    body: [{ owner_open_id: ownerOpenId, module, data: parsedData, updated_at: new Date().toISOString() }],
  });
  return { success: true, module } as const;
}
