import { afterEach, describe, expect, it } from "vitest";
import { ENV } from "./_core/env";
import { getOperationalOwnerOpenId } from "./routers";

const originalOwnerOpenId = ENV.ownerOpenId;

afterEach(() => {
  ENV.ownerOpenId = originalOwnerOpenId;
});

describe("espaço operacional de Pedidos", () => {
  it("usa o proprietário configurado para que administradores vejam os pedidos importados da loja", () => {
    ENV.ownerOpenId = "proprietario-operacional";

    expect(getOperationalOwnerOpenId("segundo-administrador")).toBe("proprietario-operacional");
  });

  it("mantém o usuário autenticado como alternativa fora de uma configuração de proprietário", () => {
    ENV.ownerOpenId = "";

    expect(getOperationalOwnerOpenId("administrador-local")).toBe("administrador-local");
  });
});
