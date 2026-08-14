export const shopSyncEntities = ["product", "contact", "stock", "order_status"] as const;
export type ShopSyncEntity = (typeof shopSyncEntities)[number];

export type ShopSyncSource = "erp" | "shop";
export type ShopSyncOperation = "upsert" | "delete";

export type ShopSyncEnvelope<TPayload = Record<string, unknown>> = {
  eventId: string;
  entity: ShopSyncEntity;
  operation: ShopSyncOperation;
  source: ShopSyncSource;
  externalId: string;
  occurredAt: string;
  payload: TPayload;
};

export type SyncRevision = Pick<ShopSyncEnvelope, "occurredAt" | "source" | "eventId">;

export function normalizeSyncIdentifier(value?: string | null) {
  return value?.trim().toLowerCase().replace(/[^a-z0-9@.+-]/g, "") ?? "";
}

export function getContactDeduplicationKey(contact: { email?: string | null; phone?: string | null; externalId?: string | null }) {
  const externalId = normalizeSyncIdentifier(contact.externalId);
  if (externalId) return `external:${externalId}`;
  const email = normalizeSyncIdentifier(contact.email);
  if (email) return `email:${email}`;
  const phone = (contact.phone ?? "").replace(/\D/g, "");
  return phone ? `phone:${phone}` : "";
}

export function getProductSyncKey(product: { sku?: string | null; externalId?: string | null }) {
  const sku = normalizeSyncIdentifier(product.sku);
  if (sku) return `sku:${sku}`;
  const externalId = normalizeSyncIdentifier(product.externalId);
  return externalId ? `external:${externalId}` : "";
}

export function shouldApplySyncRevision(current: SyncRevision | undefined, incoming: SyncRevision) {
  if (!current) return true;
  const currentTime = Date.parse(current.occurredAt);
  const incomingTime = Date.parse(incoming.occurredAt);
  if (!Number.isFinite(incomingTime)) return false;
  if (!Number.isFinite(currentTime)) return true;
  if (incomingTime !== currentTime) return incomingTime > currentTime;
  if (incoming.source !== current.source) return incoming.source === "erp";
  return incoming.eventId.localeCompare(current.eventId) > 0;
}

export function canSynchronizeProduct(product: { sku?: string | null }) {
  return Boolean(product.sku?.trim());
}
