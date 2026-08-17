import { describe, expect, it } from "vitest";
import { generateSupabaseMagicLink } from "../deploy/generate-supabase-magic-link.mjs";

describe("validação de link mágico Supabase", () => {
  it("solicita um link de acesso com redirecionamento explícito e devolve a URL segura", async () => {
    const fetchMock = async (_url: string, init?: RequestInit) => {
      expect(init?.method).toBe("POST");
      expect(JSON.parse(String(init?.body))).toMatchObject({ type: "magiclink", email: "prissnuness31@gmail.com", redirect_to: "https://erp.example/dashboard" });
      return new Response(JSON.stringify({ properties: { action_link: "https://project.supabase.co/verify?token=example" } }), { status: 200 });
    };
    await expect(generateSupabaseMagicLink({
      email: "prissnuness31@gmail.com",
      redirectTo: "https://erp.example/dashboard",
      env: { SUPABASE_URL: "https://project.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "test" },
      fetchImpl: fetchMock,
    })).resolves.toBe("https://project.supabase.co/verify?token=example");
  });
});
