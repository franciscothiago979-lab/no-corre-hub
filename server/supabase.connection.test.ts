import { describe, expect, it } from "vitest";

describe("Supabase connection", () => {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  it.skipIf(!url || !serviceRoleKey)("authenticates the server against the Supabase health endpoint", async () => {
    expect(url).toMatch(/^https:\/\/.+\.supabase\.co$/);
    expect(serviceRoleKey).toBeTruthy();

    const response = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: serviceRoleKey! },
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toHaveProperty("version");
  });
});
