import { describe, expect, it } from "vitest";
import { canAccessErp, canChangeAdministratorRole, erpAdministrativePaths, getErpRouteAccess } from "../shared/adminAccess";

describe("aprovação administrativa", () => {
  it("libera o ERP somente para o papel administrativo", () => {
    expect(canAccessErp("admin")).toBe(true);
    expect(canAccessErp("user")).toBe(false);
    expect(canAccessErp(null)).toBe(false);
    expect(canAccessErp("user", true)).toBe(true);
  });

  it("permite que somente o proprietário aprove ou revogue outro usuário", () => {
    expect(canChangeAdministratorRole("owner", "owner", "member", "admin")).toBe(true);
    expect(canChangeAdministratorRole("member", "owner", "another", "admin")).toBe(false);
    expect(canChangeAdministratorRole("owner", "owner", "owner", "user")).toBe(false);
  });

  it("mostra acesso pendente em todas as rotas administrativas para uma conta não aprovada", () => {
    for (const path of erpAdministrativePaths) {
      expect(getErpRouteAccess(path, true, "user")).toBe("pending");
      expect(getErpRouteAccess(path, true, "admin")).toBe("allowed");
      expect(getErpRouteAccess(path, true, "user", true)).toBe("allowed");
    }
  });

  it("mantém o login público e rotas desconhecidas fora da barreira administrativa", () => {
    expect(getErpRouteAccess("/dashboard", false, null)).toBe("allowed");
    expect(getErpRouteAccess("/nao-encontrada", true, "user")).toBe("allowed");
  });
});
