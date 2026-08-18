export async function grantSupabaseAdmin({ email = process.env.TEAM_MEMBER_EMAIL, env = process.env, fetchImpl = fetch } = {}) {
  const supabaseUrl = (env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || "";
  const normalizedEmail = (email || "").trim().toLowerCase();
  if (!supabaseUrl || !serviceKey || !normalizedEmail) throw new Error("SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e TEAM_MEMBER_EMAIL são obrigatórios.");
  const lookup = await fetchImpl(`${supabaseUrl}/rest/v1/users?select=openId,email,role&limit=1000`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  if (!lookup.ok) throw new Error(`Não foi possível localizar a integrante da equipe (${lookup.status}).`);
  const records = await lookup.json();
  const matches = Array.isArray(records) ? records.filter((record) => typeof record?.email === "string" && record.email.trim().toLowerCase() === normalizedEmail) : [];
  if (matches.length !== 1 || !matches[0]?.openId) throw new Error(`Nenhum perfil único do ERP foi encontrado para ${normalizedEmail}. A pessoa deve entrar uma vez antes de ser aprovada.`);
  const member = matches[0];
  const update = await fetchImpl(`${supabaseUrl}/rest/v1/users?openId=eq.${encodeURIComponent(member.openId)}`, {
    method: "PATCH",
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "content-type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify({ role: "admin" }),
  });
  if (!update.ok) throw new Error(`Não foi possível aprovar a integrante (${update.status}).`);
  const updated = await update.json();
  return Array.isArray(updated) ? updated[0] : updated;
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1])) {
  grantSupabaseAdmin().then((member) => console.log(JSON.stringify({ openId: member?.openId, email: member?.email, role: member?.role }))).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
