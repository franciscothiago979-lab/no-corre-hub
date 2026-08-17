const externalId = process.env.TEST_ORDER_ID || "NC-MSXNQCCD-4C0D51";

async function main() {
  const baseUrl = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!baseUrl || !key) throw new Error("Credenciais Supabase ausentes.");
  const query = new URLSearchParams({ module: "eq.orders", "data->>externalId": `eq.${externalId}`, select: "owner_open_id,record_id,data" });
  const response = await fetch(`${baseUrl}/rest/v1/erp_records?${query}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  if (!response.ok) throw new Error(`Consulta falhou (${response.status}).`);
  const rows = await response.json();
  console.log(JSON.stringify(rows.map((row) => ({ ownerOpenId: row.owner_open_id, recordId: row.record_id, externalId: row.data?.externalId ?? null, source: row.data?.source ?? null }))));
}
main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
