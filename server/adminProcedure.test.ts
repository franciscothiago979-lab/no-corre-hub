import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(role: "admin" | "user"): TrpcContext {
  return {
    user: {
      id: 18,
      openId: `${role}-user`,
      name: `${role} user`,
      email: `${role}@example.com`,
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("procedimentos administrativos", () => {
  it("recusa um usuário autenticado ainda não aprovado", async () => {
    const caller = appRouter.createCaller(createContext("user"));
    await expect(caller.workspace.get({ module: "suppliers" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("permite que um administrador aprovado alcance a validação do procedimento", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    await expect(caller.workspace.get({ module: "" as never })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
