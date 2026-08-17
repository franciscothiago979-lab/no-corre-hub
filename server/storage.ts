const bucket = () => process.env.SUPABASE_STORAGE_BUCKET || "media";

function getStorageConfig() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey) throw new Error("Supabase Storage não configurado: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios.");
  return { url, serviceKey, bucket: bucket() };
}

function normalizeKey(relKey: string) { return relKey.replace(/^\/+/, ""); }
function appendHashSuffix(relKey: string) {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  return lastDot === -1 ? `${relKey}_${hash}` : `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}
function objectPath(bucketName: string, key: string) {
  return `${encodeURIComponent(bucketName)}/${key.split("/").map(encodeURIComponent).join("/")}`;
}
function publicUrl(url: string, bucketName: string, key: string) { return `${url}/storage/v1/object/public/${objectPath(bucketName, key)}`; }

export async function storagePut(relKey: string, data: Buffer | Uint8Array | string, contentType = "application/octet-stream") {
  const { url, serviceKey, bucket: bucketName } = getStorageConfig();
  const key = appendHashSuffix(normalizeKey(relKey));
  const body = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const response = await fetch(`${url}/storage/v1/object/${objectPath(bucketName, key)}`, {
    method: "POST",
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": contentType, "x-upsert": "true" },
    body: body as BodyInit,
  });
  if (!response.ok) throw new Error(`Supabase Storage upload failed (${response.status}): ${await response.text()}`);
  return { key, url: publicUrl(url, bucketName, key) };
}

export async function storageGet(relKey: string) {
  const { url, bucket: bucketName } = getStorageConfig();
  const key = normalizeKey(relKey);
  return { key, url: publicUrl(url, bucketName, key) };
}

export async function storageGetSignedUrl(relKey: string, expiresIn = 3600) {
  const { url, serviceKey, bucket: bucketName } = getStorageConfig();
  const key = normalizeKey(relKey);
  const response = await fetch(`${url}/storage/v1/object/sign/${objectPath(bucketName, key)}`, {
    method: "POST",
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ expiresIn }),
  });
  if (!response.ok) throw new Error(`Supabase Storage signed URL failed (${response.status}): ${await response.text()}`);
  const result = await response.json() as { signedURL?: string; signedUrl?: string; url?: string };
  const signed = result.signedURL || result.signedUrl || result.url;
  if (!signed) throw new Error("Supabase Storage não retornou URL assinada.");
  return signed.startsWith("http") ? signed : `${url}/storage/v1${signed}`;
}
