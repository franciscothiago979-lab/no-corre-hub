import { describe, expect, it, vi } from "vitest";
import { grantSupabaseAdmin } from "../deploy/grant-supabase-admin.mjs";

describe("aprovação direta de integrante", () => {
  it("localiza a conta pelo e-mail e a promove a administradora", async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([{ openId: "supabase:member", email: "membro@example.com", role: "user" }]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ openId: "supabase:member", email: "membro@example.com", role: "admin" }]), { status: 200 }));
    await expect(grantSupabaseAdmin({ email: "MEMBRO@example.com", env: { SUPABASE_URL: "https://project.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "service-test" }, fetchImpl })).resolves.toMatchObject({ role: "admin" });
    expect(fetchImpl.mock.calls[1]?.[1]).toMatchObject({ method: "PATCH" });
  });
});
