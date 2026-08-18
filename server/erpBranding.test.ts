import { describe, expect, it } from "vitest";
import { defaultErpBranding, normalizeErpBranding } from "../shared/erpBranding";

describe("branding persistente do ERP", () => {
  it("preserva os valores de hero e logo com URLs válidas", () => {
    expect(normalizeErpBranding({ heroTitle: "Central No Corre", heroDescription: "Gestão da produção", heroImageUrl: "https://cdn.example.com/hero.png", logoUrl: "https://cdn.example.com/logo.png" })).toMatchObject({ heroTitle: "Central No Corre", heroImageUrl: "https://cdn.example.com/hero.png", logoUrl: "https://cdn.example.com/logo.png" });
  });

  it("rejeita URLs inválidas e usa valores padrão", () => {
    expect(normalizeErpBranding({ heroImageUrl: "javascript:alert(1)", logoUrl: "arquivo-local" })).toEqual(defaultErpBranding);
  });
});
