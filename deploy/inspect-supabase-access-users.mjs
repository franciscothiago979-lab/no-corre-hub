export async function inspectSupabaseAccessUsers({ env = process.env, fetchImpl = fetch } = {}) {
  const supabaseUrl = (env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceKey) throw new Error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios.");
  const response = await fetchImpl(`${supabaseUrl}/rest/v1/users?select=openId,name,email,role,lastSignedIn&order=lastSignedIn.desc`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  if (!response.ok) throw new Error(`Não foi possível consultar os perfis administrativos (${response.status}).`);
  return response.json();
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1])) {
  inspectSupabaseAccessUsers().then((users) => console.log(JSON.stringify(users))).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
