import type { TrpcContext } from "./_core/context";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";

const fetchMock = vi.fn();

function createContext(user?: TrpcContext["user"]): TrpcContext {
  return { user, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: { clearCookie: () => undefined } as TrpcContext["res"] };
}

const approvedUser = { id: 12, openId: "branding-user", name: "Branding User", email: "branding@example.com", loginMethod: "manus" as const, role: "admin" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };

describe("upload de aparência do ERP", () => {
  beforeEach(() => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key");
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("envia um logotipo válido e retorna a URL pública para preencher o formulário", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ Key: "media/branding/logo.png" }), { status: 200 }));
    const caller = appRouter.createCaller(createContext(approvedUser));
    const result = await caller.branding.uploadImage({ originalName: "logo oficial.png", mimeType: "image/png", dataUrl: "data:image/png;base64,aGVsbG8gaGVsbG8=", target: "logo" });

    expect(result).toMatchObject({ target: "logo" });
    expect(result.url).toContain("https://example.supabase.co/storage/v1/object/public/media/branding/branding-user/logo/");
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/storage/v1/object/media/branding/branding-user/logo/logo-oficial_"), expect.objectContaining({ method: "POST", headers: expect.objectContaining({ "Content-Type": "image/png" }) }));
  });

  it("recusa upload de aparência sem autorização administrativa", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.branding.uploadImage({ originalName: "hero.jpg", mimeType: "image/jpeg", dataUrl: "data:image/jpeg;base64,aGVsbG8gaGVsbG8=", target: "hero" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
