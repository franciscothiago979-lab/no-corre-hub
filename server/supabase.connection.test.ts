import { describe, expect, it } from "vitest";

describe("Supabase connection", () => {
  it("authenticates the server against the Supabase health endpoint", async () => {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(url).toMatch(/^https:\/\/.+\.supabase\.co$/);
    expect(serviceRoleKey).toBeTruthy();

    const response = await fetch(`${url}/auth/v1/health`, {
      headers: {
        apikey: serviceRoleKey!,
      },
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toHaveProperty("version");
  });
});
