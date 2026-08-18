export type ErpBranding = {
  heroTitle: string;
  heroDescription: string;
  heroImageUrl: string;
  logoUrl: string;
};

export const defaultErpBranding: ErpBranding = {
  heroTitle: "Operação em foco",
  heroDescription: "No Corre Central · clareza para produzir melhor.",
  heroImageUrl: "",
  logoUrl: "https://placehold.co/320x80/111111/FFFFFF?text=NO+CORRE+CENTRAL",
};

function text(value: unknown, fallback: string, max: number) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : fallback;
}

function url(value: unknown, fallback = "") {
  if (typeof value !== "string" || !value.trim()) return fallback;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : fallback;
  } catch {
    return fallback;
  }
}

export function normalizeErpBranding(input: unknown): ErpBranding {
  const value = input && typeof input === "object" ? input as Record<string, unknown> : {};
  return {
    heroTitle: text(value.heroTitle, defaultErpBranding.heroTitle, 90),
    heroDescription: text(value.heroDescription, defaultErpBranding.heroDescription, 180),
    heroImageUrl: url(value.heroImageUrl),
    logoUrl: url(value.logoUrl, defaultErpBranding.logoUrl),
  };
}
