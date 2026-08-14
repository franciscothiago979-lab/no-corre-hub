import { ENV } from "./_core/env";
import type { ShopSyncEnvelope } from "../shared/shopBidirectionalSync";

type OutboundSyncOptions = {
  baseUrl?: string;
  secret?: string;
  request?: typeof fetch;
};

export type OutboundSyncResult =
  | { delivered: true; status: number }
  | { delivered: false; skipped: true; reason: "not_configured" };

export async function deliverShopSyncEvent(event: ShopSyncEnvelope, options: OutboundSyncOptions = {}): Promise<OutboundSyncResult> {
  const baseUrl = (options.baseUrl ?? ENV.shopSyncBaseUrl).replace(/\/$/, "");
  const secret = options.secret ?? ENV.shopSyncSecret;
  if (!baseUrl || !secret) return { delivered: false, skipped: true, reason: "not_configured" };

  const request = options.request ?? fetch;
  const response = await request(`${baseUrl}/api/integrations/erp/events`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-shop-sync-secret": secret },
    body: JSON.stringify(event),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`A loja recusou o evento de sincronização (${response.status}).`);
  return { delivered: true, status: response.status };
}
