import { ENV } from "./_core/env";
import { createShopSyncEvent, updateShopSyncEvent, type ShopSyncEventRecord } from "./db";
import { deliverShopSyncEvent } from "./shopOutboundSync";
import type { ShopSyncEnvelope } from "../shared/shopBidirectionalSync";

type PublisherDependencies = {
  create: typeof createShopSyncEvent;
  update: typeof updateShopSyncEvent;
  deliver: typeof deliverShopSyncEvent;
  enabled: boolean;
};

const defaultDependencies: PublisherDependencies = {
  create: createShopSyncEvent,
  update: updateShopSyncEvent,
  deliver: deliverShopSyncEvent,
  enabled: ENV.shopSyncEnabled,
};

function recordFromEvent(event: ShopSyncEnvelope): Omit<ShopSyncEventRecord, "id" | "createdAt" | "updatedAt"> {
  return {
    eventId: event.eventId,
    entity: event.entity,
    externalId: event.externalId,
    occurredAt: event.occurredAt,
    payload: event.payload,
    status: "pending",
    statusMessage: null,
    deliveredAt: null,
  };
}

export async function publishImmediateShopEvent(ownerOpenId: string, event: ShopSyncEnvelope, dependencies: PublisherDependencies = defaultDependencies) {
  const created = await dependencies.create(ownerOpenId, recordFromEvent(event));
  if (!dependencies.enabled) {
    return dependencies.update(ownerOpenId, created.id, { ...recordFromEvent(event), status: "skipped", statusMessage: "Aguardando a publicação do receptor autenticado da loja.", deliveredAt: null });
  }

  try {
    const result = await dependencies.deliver(event);
    if (!result.delivered) {
      return dependencies.update(ownerOpenId, created.id, { ...recordFromEvent(event), status: "skipped", statusMessage: "A integração imediata não está configurada.", deliveredAt: null });
    }
    return dependencies.update(ownerOpenId, created.id, { ...recordFromEvent(event), status: "delivered", statusMessage: `Confirmado pela loja (HTTP ${result.status}).`, deliveredAt: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "A loja não confirmou o evento de sincronização.";
    return dependencies.update(ownerOpenId, created.id, { ...recordFromEvent(event), status: "failed", statusMessage: message.slice(0, 280), deliveredAt: null });
  }
}
