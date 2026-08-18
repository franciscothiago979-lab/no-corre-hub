import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Router } from "wouter";
import { describe, expect, it, vi } from "vitest";
import { erpAdministrativePaths } from "../shared/adminAccess";

const auth = vi.hoisted(() => ({
  current: { user: { name: "Administrador", role: "admin" as "admin" | "user" }, loading: false, isAuthenticated: true, logout: () => undefined },
}));

vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => auth.current }));
vi.mock("@/hooks/useErpBranding", () => ({ useErpBranding: () => ({ heroTitle: "Operação em foco", heroDescription: "No Corre Central · clareza para produzir melhor.", heroImageUrl: "", logoUrl: "https://placehold.co/320x80/111111/FFFFFF?text=NO+CORRE+CENTRAL" }) }));

import { App } from "../client/src/App";

function renderApp(path: string, role: "admin" | "user") {
  auth.current = { user: { name: role === "admin" ? "Administrador" : "Pendente", role }, loading: false, isAuthenticated: true, logout: () => undefined };
  const locationHook = () => [path, () => undefined] as [string, (to: string) => void];
  return renderToStaticMarkup(<Router hook={locationHook}><App renderContent={(page) => <main>Rota administrativa: {page}</main>} /></Router>);
}

describe("roteamento real do aplicativo", () => {
  it("libera o shell e o conteúdo das rotas administrativas para uma sessão aprovada", () => {
    for (const path of erpAdministrativePaths) {
      const markup = renderApp(path, "admin");
      expect(markup).toContain(`Rota administrativa: ${path.replace("/", "")}`);
      expect(markup).not.toContain("Sua conta aguarda aprovação");
    }
  });

  it("interrompe o roteamento e exibe acesso pendente para uma sessão não aprovada", () => {
    for (const path of erpAdministrativePaths) {
      const markup = renderApp(path, "user");
      expect(markup).toContain("Sua conta aguarda aprovação");
      expect(markup).not.toContain("Rota administrativa:");
      expect(markup).not.toContain("Operação em foco");
    }
  });
});
