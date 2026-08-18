import { describe, expect, it, vi } from "vitest";
import { inspectSupabaseAccessUsers } from "../deploy/inspect-supabase-access-users.mjs";

describe("inspeção de acessos Supabase", () => {
  it("consulta somente os campos necessários para diagnosticar perfis administrativos", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));
    await expect(inspectSupabaseAccessUsers({ env: { SUPABASE_URL: "https://project.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "service-test" }, fetchImpl })).resolves.toEqual([]);
    expect(fetchImpl.mock.calls[0]?.[0]).toContain("select=openId,name,email,role,lastSignedIn");
  });
});
