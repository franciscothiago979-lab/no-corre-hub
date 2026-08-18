import { describe, expect, it, vi } from "vitest";
import { provisionSupabaseOwner } from "../deploy/provision-supabase-owner.mjs";

describe("provisionamento do administrador Supabase", () => {
  it("cria a identidade ausente via OTP e retorna seu openId", async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ users: [] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ users: [{ id: "novo-uuid", email: "francisco.thiago979@gmail.com" }] }), { status: 200 }));
    await expect(provisionSupabaseOwner({ email: "francisco.thiago979@gmail.com", env: { SUPABASE_URL: "https://project.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "service-test" }, fetchImpl })).resolves.toEqual({ id: "novo-uuid", email: "francisco.thiago979@gmail.com", created: true });
    expect(fetchImpl.mock.calls[1]?.[0]).toBe("https://project.supabase.co/auth/v1/otp");
  });
});
