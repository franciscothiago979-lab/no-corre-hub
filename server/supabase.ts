type SupabaseRequestOptions = Omit<RequestInit, "headers" | "body"> & {
  body?: unknown;
  prefer?: string;
};

function getSupabaseConfig() {
  const configuredUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const url = configuredUrl?.replace(/\/rest\/v1$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("A conexão segura com o Supabase não está configurada.");
  }

  return { url, serviceKey };
}

export async function supabaseRest<T>(path: string, options: SupabaseRequestOptions = {}): Promise<T> {
  const { url, serviceKey } = getSupabaseConfig();
  const { body, prefer, ...requestOptions } = options;
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...requestOptions,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    throw new Error(`Não foi possível acessar os dados persistentes (Supabase ${response.status}).`);
  }

  return response.json() as Promise<T>;
}
