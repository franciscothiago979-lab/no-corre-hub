import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPendingContext(): TrpcContext {
  return {
    user: {
      id: 99,
      openId: "pending-admin-test",
      name: "Pending Test User",
      email: "pending@example.com",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("proteção de módulos administrativos", () => {
  it("bloqueia uma conta pendente em todos os grupos operacionais do ERP", async () => {
    const caller = appRouter.createCaller(createPendingContext());

    await expect(caller.customers.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.products.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.orders.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.stock.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.finance.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.workspace.get({ module: "production" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.ai.generateBriefing({ prompt: "Criar arte urbana para uma coleção de camisetas." })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.access.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
