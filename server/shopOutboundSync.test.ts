import { describe, expect, it, vi } from "vitest";
import { deliverShopSyncEvent } from "./shopOutboundSync";

const event = { eventId: "evt-product-1", entity: "product" as const, operation: "upsert" as const, source: "erp" as const, externalId: "sku:NC-001", occurredAt: "2026-08-14T18:00:00.000Z", payload: { sku: "NC-001" } };

describe("ERP outbound shop synchronization", () => {
  it("sends a lightweight authenticated event to the configured shop receiver", async () => {
    const request = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 202 }));

    const result = await deliverShopSyncEvent(event, { baseUrl: "https://shop.example.com/", secret: "paired-secret", request });

    expect(result).toEqual({ delivered: true, status: 202 });
    expect(request).toHaveBeenCalledWith("https://shop.example.com/api/integrations/erp/events", expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({ "x-shop-sync-secret": "paired-secret" }),
    }));
  });

  it("does not attempt a delivery when the receiver configuration is incomplete", async () => {
    const request = vi.fn();
    await expect(deliverShopSyncEvent(event, { baseUrl: "", secret: "", request })).resolves.toEqual({ delivered: false, skipped: true, reason: "not_configured" });
    expect(request).not.toHaveBeenCalled();
  });
});
