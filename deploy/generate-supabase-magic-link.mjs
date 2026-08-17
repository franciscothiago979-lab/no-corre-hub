export async function generateSupabaseMagicLink({ email = process.env.OWNER_EMAIL, redirectTo = "https://no-corre-erp-production.up.railway.app/dashboard", env = process.env, fetchImpl = fetch } = {}) {
  const supabaseUrl = (env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceKey || !email) throw new Error("SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e e-mail são obrigatórios.");
  const response = await fetchImpl(`${supabaseUrl}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "content-type": "application/json" },
    body: JSON.stringify({ type: "magiclink", email, redirect_to: redirectTo }),
  });
  if (!response.ok) throw new Error(`O Supabase não gerou o link de acesso (${response.status}).`);
  const body = await response.json();
  const actionLink = body?.properties?.action_link ?? body?.action_link;
  if (typeof actionLink !== "string" || !/^https?:\/\//.test(actionLink)) {
    const fields = body && typeof body === "object" ? Object.keys(body).join(", ") : "resposta não estruturada";
    const propertyFields = body?.properties && typeof body.properties === "object" ? Object.keys(body.properties).join(", ") : "sem properties";
    throw new Error(`O Supabase não retornou um link de acesso válido. Campos: ${fields}; properties: ${propertyFields}.`);
  }
  return actionLink;
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1])) {
  generateSupabaseMagicLink().then((link) => console.log(link)).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
