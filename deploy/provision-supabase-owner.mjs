import { findSupabaseOwner } from "./lookup-supabase-owner.mjs";

export async function provisionSupabaseOwner({ email = process.env.OWNER_EMAIL, redirectTo = process.env.MAGIC_REDIRECT_URL || "https://no-corre-erp-production.up.railway.app/dashboard", env = process.env, fetchImpl = fetch } = {}) {
  const normalizedEmail = (email || "").trim().toLowerCase();
  if (!normalizedEmail) throw new Error("OWNER_EMAIL é obrigatório.");
  try {
    return { ...(await findSupabaseOwner({ email: normalizedEmail, env, fetchImpl })), created: false };
  } catch (error) {
    if (!(error instanceof Error) || !error.message.startsWith("Nenhum usuário Supabase")) throw error;
  }
  const supabaseUrl = (env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceKey) throw new Error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios.");
  const response = await fetchImpl(`${supabaseUrl}/auth/v1/otp`, {
    method: "POST",
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "content-type": "application/json" },
    body: JSON.stringify({ email: normalizedEmail, options: { emailRedirectTo: redirectTo, shouldCreateUser: true } }),
  });
  if (!response.ok) throw new Error(`Não foi possível criar o acesso por e-mail no Supabase (${response.status}).`);
  const owner = await findSupabaseOwner({ email: normalizedEmail, env, fetchImpl });
  return { ...owner, created: true };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1])) {
  provisionSupabaseOwner().then((owner) => console.log(JSON.stringify({ id: owner.id, email: owner.email, openId: `supabase:${owner.id}`, created: owner.created }))).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
