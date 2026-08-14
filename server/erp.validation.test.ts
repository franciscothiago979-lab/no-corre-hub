import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function anonymousContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("ERP protected procedures", () => {
  it("requires authentication to list customers", async () => {
    const caller = appRouter.createCaller(anonymousContext());
    await expect(caller.customers.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("requires authentication to list orders", async () => {
    const caller = appRouter.createCaller(anonymousContext());
    await expect(caller.orders.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("requires authentication to generate an AI briefing", async () => {
    const caller = appRouter.createCaller(anonymousContext());
    await expect(caller.ai.generateBriefing({ prompt: "Criar uma estampa minimalista para camiseta preta" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects invalid product payload before reaching the database", async () => {
    const caller = appRouter.createCaller(anonymousContext());
    await expect(caller.products.create({ name: "", category: "", sku: "", price: -1, stock: -2, minimumStock: -1 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
