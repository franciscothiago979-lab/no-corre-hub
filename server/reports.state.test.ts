import { describe, expect, it } from "vitest";
import { getReportsViewState } from "../shared/reportState";

describe("estado de Relatórios", () => {
  it("prioriza o estado de carregamento enquanto as consultas ainda não foram resolvidas", () => {
    expect(getReportsViewState({ isAuthenticated: true, authLoading: false, isLoading: true, hasError: false, hasData: false })).toBe("loading");
  });

  it("expõe a recuperação quando uma consulta persistente falha", () => {
    expect(getReportsViewState({ isAuthenticated: true, authLoading: false, isLoading: false, hasError: true, hasData: false })).toBe("error");
  });

  it("distingue um relatório vazio de um relatório com dados", () => {
    expect(getReportsViewState({ isAuthenticated: true, authLoading: false, isLoading: false, hasError: false, hasData: false })).toBe("empty");
    expect(getReportsViewState({ isAuthenticated: true, authLoading: false, isLoading: false, hasError: false, hasData: true })).toBe("ready");
  });
});
