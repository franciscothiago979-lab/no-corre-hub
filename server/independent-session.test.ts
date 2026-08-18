import { describe, expect, it, vi } from "vitest";
import { clearIndependentSession } from "../client/src/lib/independent-session";

describe("encerramento de sessão independente", () => {
  it("encerra a sessão Supabase e remove o cache local de autenticação", async () => {
    const signOut = vi.fn().mockResolvedValue(undefined);
    const session = { removeItem: vi.fn() };
    const local = { removeItem: vi.fn() };
    await clearIndependentSession({ signOut, session, local });
    expect(signOut).toHaveBeenCalledOnce();
    expect(session.removeItem).toHaveBeenCalledWith("no-corre-auth-session");
    expect(local.removeItem).toHaveBeenCalledWith("no-corre-auth-user");
  });
});
