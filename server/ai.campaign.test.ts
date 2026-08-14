import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { invokeLLMMock } = vi.hoisted(() => ({ invokeLLMMock: vi.fn() }));
vi.mock("./_core/llm", () => ({ invokeLLM: invokeLLMMock }));

function createContext(user?: TrpcContext["user"]): TrpcContext {
  return { user, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: { clearCookie: () => undefined } as TrpcContext["res"] };
}

const approvedUser = { id: 21, openId: "marketing-admin", name: "Marketing Admin", email: "admin@example.com", loginMethod: "manus" as const, role: "admin" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };

beforeEach(() => invokeLLMMock.mockReset());

describe("campaign generator", () => {
  it("requires administrative authentication", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.ai.generateCampaign({ objective: "Divulgar uma coleção nova", offer: "Novas camisetas", tone: "direto" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("returns an editable campaign draft without sending messages", async () => {
    invokeLLMMock.mockResolvedValue({ choices: [{ message: { content: "## Coleção em destaque\nConheça as novidades da semana.\n\n**CTA:** Responda para saber mais." } }] });
    const caller = appRouter.createCaller(createContext(approvedUser));

    const result = await caller.ai.generateCampaign({ objective: "Apresentar uma nova coleção streetwear", offer: "Camisetas disponíveis", audience: "Clientes que gostam de streetwear", tone: "energético" });

    expect(result.campaign).toContain("Coleção em destaque");
    expect(invokeLLMMock).toHaveBeenCalledWith(expect.objectContaining({ model: "gpt-5-mini", maxTokens: 650 }));
  });
});
