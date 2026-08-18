import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getUserByOpenId: vi.fn(), upsertUser: vi.fn() }));

vi.mock("./db", () => mocks);

import { authenticateIndependentRequest } from "./independent-auth";

describe("autenticação independente do ERP", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    mocks.getUserByOpenId.mockReset();
    mocks.upsertUser.mockReset();
  });

  it("persiste o proprietário Supabase como administrador mesmo sem perfil interno prévio", async () => {
    process.env.SUPABASE_URL = "https://project.supabase.co";
    process.env.SUPABASE_PUBLISHABLE_KEY = "publishable-test";
    process.env.OWNER_EMAIL = "francisco.thiago979@gmail.com";
    process.env.OWNER_OPEN_ID = "supabase:owner-uuid";
    mocks.getUserByOpenId.mockResolvedValue(undefined);
    mocks.upsertUser.mockResolvedValue(undefined);
    const fetchImpl = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(new Response(JSON.stringify({ id: "owner-uuid", email: "francisco.thiago979@gmail.com" }), { status: 200 }));

    const user = await authenticateIndependentRequest({ header: () => "Bearer token" } as unknown as Request);

    expect(user).toMatchObject({ openId: "supabase:owner-uuid", role: "admin" });
    expect(mocks.upsertUser).toHaveBeenCalledWith(expect.objectContaining({ openId: "supabase:owner-uuid", role: "admin" }));
    fetchImpl.mockRestore();
  });
});
