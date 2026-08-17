export async function findSupabaseOwner({ email = process.env.OWNER_EMAIL, env = process.env, fetchImpl = fetch } = {}) {
  const supabaseUrl = (env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || "";
  const normalizedEmail = (email || "").trim().toLowerCase();
  if (!supabaseUrl || !serviceKey || !normalizedEmail) throw new Error("SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e OWNER_EMAIL são obrigatórios.");
  const response = await fetchImpl(`${supabaseUrl}/auth/v1/admin/users?page=1&per_page=1000`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  if (!response.ok) throw new Error(`Não foi possível consultar usuários Supabase (${response.status}).`);
  const body = await response.json();
  const users = Array.isArray(body?.users) ? body.users : [];
  const owner = users.find((user) => typeof user?.email === "string" && user.email.toLowerCase() === normalizedEmail);
  if (!owner?.id) throw new Error(`Nenhum usuário Supabase foi encontrado para ${normalizedEmail}.`);
  return { id: String(owner.id), email: String(owner.email) };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1])) {
  findSupabaseOwner().then((owner) => console.log(JSON.stringify(owner))).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
