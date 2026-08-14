export type AssetCatalogStatus = "pending_review" | "approved" | "manual";

export type AssetCatalogInput = {
  originalName: string;
  name: string;
  model: string;
  theme: string;
  suggestedName: string;
  suggestedModel: string;
  suggestedTheme: string;
  confidence: number;
  notes: string;
  needsNameReview: boolean;
  status: AssetCatalogStatus;
  mimeType: "image/png" | "image/jpeg" | "image/webp";
  sizeBytes: number;
  checksum: string;
  storageKey: string;
  url: string;
};

const GENERIC_FILENAME = /^(?:img|image|foto|photo|whatsapp(?:\s+image)?|screenshot|captura|untitled|sem\s+nome|novo|new|dsc|pxl|file|arquivo)[\s_.-]*\d*[\s_.-]*$/i;

export function fileStem(filename: string) {
  return filename.replace(/\.[a-z0-9]{1,8}$/i, "").replace(/[._-]+/g, " ").replace(/\s+/g, " ").trim();
}

export function hasUsefulFilename(filename: string) {
  const stem = fileStem(filename);
  if (stem.length < 4 || /^\d+$/.test(stem)) return false;
  return !GENERIC_FILENAME.test(stem);
}

export function fallbackAssetName(filename: string) {
  const stem = fileStem(filename);
  return hasUsefulFilename(filename) ? stem : "Arte sem nome";
}

export function clampConfidence(value: unknown) {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}
