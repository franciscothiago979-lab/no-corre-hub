import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(user?: TrpcContext["user"]): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

const fetchMock = vi.fn();
const approvedUser = {
  id: 12,
  openId: "snapshot-user",
  name: "Snapshot User",
  email: "snapshot@example.com",
  loginMethod: "manus" as const,
  role: "admin" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

beforeEach(() => {
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("workspace snapshots", () => {
  it("requires authentication to read a snapshot", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.workspace.get({ module: "suppliers" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects an empty module identifier for approved administrators", async () => {
    const caller = appRouter.createCaller(createContext(approvedUser));
    await expect(caller.workspace.get({ module: "" as never })).rejects.toBeTruthy();
  });

  it("rejects oversized snapshot payloads for approved administrators", async () => {
    const caller = appRouter.createCaller(createContext(approvedUser));
    await expect(caller.workspace.save({ module: "company", data: "x".repeat(60001) })).rejects.toBeTruthy();
  });
});

describe("operational modules persistence", () => {
  it("accepts a marketing snapshot for approved administrators", async () => {
    const marketingData = JSON.stringify([{ id: 2, kind: "campaign", detail: "Campanha de lançamento" }]);
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify([{ data: [{ id: 2, kind: "campaign", detail: "Campanha de lançamento" }] }]), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ data: [{ id: 2, kind: "campaign", detail: "Campanha de lançamento" }] }]), { status: 200 }));
    const caller = appRouter.createCaller(createContext(approvedUser));

    const result = await caller.workspace.save({ module: "marketing", data: marketingData });

    expect(result).toMatchObject({ success: true, module: "marketing" });
    const restored = await caller.workspace.get({ module: "marketing" });
    expect(restored.data).toBe(marketingData);
  });

  it("saves and retrieves workspace snapshots successfully for approved administrators", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify([{ data: [{ id: 1, name: "Texprima Malhas" }] }]), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ data: [{ id: 1, name: "Texprima Malhas" }] }]), { status: 200 }));
    const caller = appRouter.createCaller(createContext(approvedUser));

    const saveRes = await caller.workspace.save({ module: "suppliers", data: JSON.stringify([{ id: 1, name: "Texprima Malhas" }]) });
    expect(saveRes).toMatchObject({ success: true, module: "suppliers" });

    const getRes = await caller.workspace.get({ module: "suppliers" });
    expect(getRes.data).toBe(JSON.stringify([{ id: 1, name: "Texprima Malhas" }]));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
