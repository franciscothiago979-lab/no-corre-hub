import { clampConfidence, fallbackAssetName, hasUsefulFilename } from "./assetCatalog";

describe("asset catalog filename helpers", () => {
  it("identifies generic camera and export names as needing review", () => {
    expect(hasUsefulFilename("IMG_0032.png")).toBe(false);
    expect(hasUsefulFilename("WhatsApp Image 2026-08-13.jpg")).toBe(false);
    expect(fallbackAssetName("IMG_0032.png")).toBe("Arte sem nome");
  });

  it("preserves descriptive names and constrains confidence", () => {
    expect(hasUsefulFilename("Camiseta Street Tigre Neon.webp")).toBe(true);
    expect(fallbackAssetName("Camiseta Street Tigre Neon.webp")).toBe("Camiseta Street Tigre Neon");
    expect(clampConfidence(108)).toBe(100);
    expect(clampConfidence("47")).toBe(47);
    expect(clampConfidence("inválido")).toBe(0);
  });
});
