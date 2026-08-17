import { describe, expect, it } from "vitest";
import { findSupabaseOwner } from "../deploy/lookup-supabase-owner.mjs";

describe("lookup de proprietário Supabase", () => {
  it("encontra o usuário pelo e-mail normalizado", async () => {
    const fetchMock = async () => new Response(JSON.stringify({ users: [{ id: "user-123", email: "prissnuness31@gmail.com" }] }), { status: 200 });
    await expect(findSupabaseOwner({ email: "PRISSNUNESS31@GMAIL.COM", env: { SUPABASE_URL: "https://project.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "test" }, fetchImpl: fetchMock }))
      .resolves.toEqual({ id: "user-123", email: "prissnuness31@gmail.com" });
  });
});
