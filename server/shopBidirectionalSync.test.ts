import { describe, expect, it } from "vitest";
import { canSynchronizeProduct, getContactDeduplicationKey, getProductSyncKey, shouldApplySyncRevision } from "../shared/shopBidirectionalSync";

describe("shop bidirectional synchronization contract", () => {
  it("uses stable keys for products and contacts", () => {
    expect(getProductSyncKey({ sku: " NC-TEE 001 " })).toBe("sku:nc-tee001");
    expect(getContactDeduplicationKey({ email: " Cliente@Exemplo.com " })).toBe("email:cliente@exemplo.com");
    expect(getContactDeduplicationKey({ phone: "+55 (11) 99999-0000" })).toBe("phone:5511999990000");
    expect(canSynchronizeProduct({ sku: "" })).toBe(false);
  });

  it("does not overwrite a newer change with an older event", () => {
    const current = { occurredAt: "2026-08-14T18:00:00.000Z", source: "erp" as const, eventId: "evt-2" };
    expect(shouldApplySyncRevision(current, { occurredAt: "2026-08-14T17:59:00.000Z", source: "shop", eventId: "evt-3" })).toBe(false);
    expect(shouldApplySyncRevision(current, { occurredAt: "2026-08-14T18:01:00.000Z", source: "shop", eventId: "evt-4" })).toBe(true);
  });

  it("keeps ERP as deterministic tie breaker for simultaneous events", () => {
    const current = { occurredAt: "2026-08-14T18:00:00.000Z", source: "shop" as const, eventId: "evt-2" };
    expect(shouldApplySyncRevision(current, { occurredAt: "2026-08-14T18:00:00.000Z", source: "erp", eventId: "evt-1" })).toBe(true);
  });
});
