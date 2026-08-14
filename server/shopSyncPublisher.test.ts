import { describe, expect, it, vi } from "vitest";
import { publishImmediateShopEvent } from "./shopSyncPublisher";

const event = { eventId: "evt-1", entity: "product" as const, operation: "upsert" as const, source: "erp" as const, externalId: "sku:NC-001", occurredAt: "2026-08-14T18:00:00.000Z", payload: { sku: "NC-001" } };
const created = { id: 8, ...event, status: "pending" as const, statusMessage: null, deliveredAt: null, createdAt: "2026-08-14T18:00:00.000Z", updatedAt: "2026-08-14T18:00:00.000Z" };

describe("shop sync publisher", () => {
  it("records a skipped event until the authenticated receiver is published", async () => {
    const create = vi.fn().mockResolvedValue(created);
    const update = vi.fn().mockImplementation(async (_owner, _id, data) => ({ ...created, ...data }));
    const deliver = vi.fn();

    const result = await publishImmediateShopEvent("owner", event, { create, update, deliver, enabled: false } as never);

    expect(deliver).not.toHaveBeenCalled();
    expect(result.status).toBe("skipped");
    expect(result.statusMessage).toMatch(/Aguardando/);
  });

  it("marks an event as failed when the store does not confirm delivery", async () => {
    const create = vi.fn().mockResolvedValue(created);
    const update = vi.fn().mockImplementation(async (_owner, _id, data) => ({ ...created, ...data }));
    const deliver = vi.fn().mockRejectedValue(new Error("HTTP 502"));

    const result = await publishImmediateShopEvent("owner", event, { create, update, deliver, enabled: true } as never);

    expect(result.status).toBe("failed");
    expect(result.statusMessage).toBe("HTTP 502");
  });
});
