import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AccessGate } from "../client/src/components/AccessGate";
import { erpAdministrativePaths } from "../shared/adminAccess";

function renderGate(path: string, role: "admin" | "user") {
  return renderToStaticMarkup(<AccessGate path={path} isAuthenticated role={role} onLogout={() => undefined}><main>Conteúdo administrativo</main></AccessGate>);
}

describe("barreira de acesso do aplicativo", () => {
  it("renderiza o conteúdo administrativo para um administrador em todas as rotas centrais", () => {
    for (const path of erpAdministrativePaths) {
      const markup = renderGate(path, "admin");
      expect(markup).toContain("Conteúdo administrativo");
      expect(markup).not.toContain("Sua conta aguarda aprovação");
    }
  });

  it("renderiza a tela de acesso pendente e oculta o conteúdo para uma conta não aprovada", () => {
    for (const path of erpAdministrativePaths) {
      const markup = renderGate(path, "user");
      expect(markup).toContain("Sua conta aguarda aprovação");
      expect(markup).not.toContain("Conteúdo administrativo");
    }
  });
});
