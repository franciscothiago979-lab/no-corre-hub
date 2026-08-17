import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { createApp } from "./_core/index";

async function requestHealth() {
  const app = await createApp();
  const server = createServer(app);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string") throw new Error("HTTP server did not expose a TCP address.");

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/health`);
    return { status: response.status, body: await response.json() };
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}

describe("runtime externo do ERP", () => {
  it("responde ao health check em uma porta atribuída pelo sistema", async () => {
    await expect(requestHealth()).resolves.toEqual({
      status: 200,
      body: { ok: true, service: "no-corre-central", runtime: "external" },
    });
  });

  it("usa link mágico Supabase no login publicado, sem OAuth legado", () => {
    const loginSource = readFileSync(resolve(process.cwd(), "client/src/pages/Login.tsx"), "utf8");
    const entrySource = readFileSync(resolve(process.cwd(), "client/src/const.ts"), "utf8");
    expect(loginSource).toContain("signInWithOtp");
    expect(loginSource).toContain("emailRedirectTo");
    expect(loginSource).not.toContain("signInWithOAuth");
    expect(entrySource).toContain('window.location.assign("/entrar")');
  });
});
