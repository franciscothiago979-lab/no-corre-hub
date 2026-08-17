import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { invokeLLMMock } = vi.hoisted(() => ({ invokeLLMMock: vi.fn() }));
vi.mock("./_core/llm", () => ({ invokeLLM: invokeLLMMock }));

function createContext(user?: TrpcContext["user"]): TrpcContext {
  return { user, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: { clearCookie: () => undefined } as TrpcContext["res"] };
}

const approvedUser = { id: 12, openId: "asset-user", name: "Asset User", email: "asset@example.com", loginMethod: "manus" as const, role: "admin" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
const fetchMock = vi.fn();

beforeEach(() => {
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  invokeLLMMock.mockReset();
});

afterEach(() => vi.unstubAllGlobals());

describe("assets catalog", () => {
  it("requires administrative authentication to list cataloged arts", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.assets.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("imports an image, creates a pending review and uses the AI suggestion", async () => {
    invokeLLMMock.mockResolvedValue({ choices: [{ message: { content: JSON.stringify({ suggestedName: "Tigre streetwear neon", model: "Estampa frontal", theme: "Tigre neon", confidence: 86, notes: "Arte com felino em cores vibrantes." }) } }] });
    fetchMock.mockImplementation((url: string | URL, init?: RequestInit) => {
      const href = String(url);
      if (href.includes("erp_records?") && (!init?.method || init.method === "GET")) return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
      if (href.includes("/storage/v1/object/") && init?.method === "POST" && !href.includes("/sign/")) return Promise.resolve(new Response(JSON.stringify({ Key: "media/arte.png" }), { status: 200 }));
      if (href.includes("/storage/v1/object/sign/")) return Promise.resolve(new Response(JSON.stringify({ signedURL: "https://storage.test/get" }), { status: 200 }));
      if (href.endsWith("/rest/v1/erp_records") && init?.method === "POST") return Promise.resolve(new Response(JSON.stringify([{ record_id: 1, data: {} }]), { status: 201 }));
      return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
    });
    const caller = appRouter.createCaller(createContext(approvedUser));

    const result = await caller.assets.import({ originalName: "IMG_0032.png", mimeType: "image/png", dataUrl: "data:image/png;base64,aGVsbG8gaGVsbG8=" });

    expect(result.duplicate).toBe(false);
    if (!result.duplicate) {
      expect(result.asset).toMatchObject({ status: "pending_review", needsNameReview: true, suggestedName: "Tigre streetwear neon", suggestedModel: "Estampa frontal", confidence: 86 });
    }
    expect(invokeLLMMock).toHaveBeenCalledTimes(1);
  });

  it("rejects file types outside the supported image formats", async () => {
    const caller = appRouter.createCaller(createContext(approvedUser));
    await expect(caller.assets.import({ originalName: "arte.gif", mimeType: "image/gif" as never, dataUrl: "data:image/gif;base64,aGVsbG8=" })).rejects.toBeTruthy();
  });
});
