import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listAccessUsers: vi.fn(),
  setUserAccessRole: vi.fn(),
}));

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    listAccessUsers: mocks.listAccessUsers,
    setUserAccessRole: mocks.setUserAccessRole,
  };
});

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { ENV } from "./_core/env";

function createContext(openId: string, role: "admin" | "user"): TrpcContext {
  return {
    user: {
      id: 22,
      openId,
      name: "Access Test User",
      email: "access@example.com",
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

describe("roteador de aprovação administrativa", () => {
  const ownerOpenId = "owner-access-test";
  const memberOpenId = "member-access-test";

  beforeEach(() => {
    ENV.ownerOpenId = ownerOpenId;
    mocks.listAccessUsers.mockReset();
    mocks.setUserAccessRole.mockReset();
  });

  it("permite ao proprietário listar as contas que precisam de aprovação", async () => {
    mocks.listAccessUsers.mockResolvedValue([{ openId: memberOpenId, name: "Pending", email: "pending@example.com", role: "user", lastSignedIn: new Date() }]);
    const caller = appRouter.createCaller(createContext(ownerOpenId, "admin"));

    await expect(caller.access.list()).resolves.toHaveLength(1);
    expect(mocks.listAccessUsers).toHaveBeenCalledOnce();
  });

  it("permite ao proprietário aprovar e depois revogar uma conta comum", async () => {
    mocks.setUserAccessRole.mockResolvedValue({ openId: memberOpenId, role: "admin" });
    const caller = appRouter.createCaller(createContext(ownerOpenId, "admin"));

    await expect(caller.access.setRole({ openId: memberOpenId, role: "admin" })).resolves.toMatchObject({ role: "admin" });
    expect(mocks.setUserAccessRole).toHaveBeenLastCalledWith(memberOpenId, "admin");

    mocks.setUserAccessRole.mockResolvedValue({ openId: memberOpenId, role: "user" });
    await expect(caller.access.setRole({ openId: memberOpenId, role: "user" })).resolves.toMatchObject({ role: "user" });
    expect(mocks.setUserAccessRole).toHaveBeenLastCalledWith(memberOpenId, "user");
  });

  it("impede a revogação do proprietário", async () => {
    const caller = appRouter.createCaller(createContext(ownerOpenId, "admin"));

    await expect(caller.access.setRole({ openId: ownerOpenId, role: "user" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(mocks.setUserAccessRole).not.toHaveBeenCalled();
  });

  it("impede que administrador não proprietário gerencie aprovações", async () => {
    const caller = appRouter.createCaller(createContext(memberOpenId, "admin"));

    await expect(caller.access.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.access.setRole({ openId: memberOpenId, role: "user" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
