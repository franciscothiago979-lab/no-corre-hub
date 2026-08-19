import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "../..");

describe("aplicativo móvel instalável", () => {
  it("declara manifesto, ícone e service worker do No Corre Central", () => {
    const html = readFileSync(resolve(projectRoot, "client/index.html"), "utf8");
    const manifest = JSON.parse(readFileSync(resolve(projectRoot, "client/public/manifest.webmanifest"), "utf8"));
    const serviceWorker = readFileSync(resolve(projectRoot, "client/public/sw.js"), "utf8");

    expect(html).toContain('rel="manifest"');
    expect(manifest).toMatchObject({ name: "No Corre Central", display: "standalone", start_url: "/dashboard" });
    expect(manifest.icons[0]?.src).toBe("/no-corre-central-icon.svg");
    expect(serviceWorker).toContain("no-corre-central-shell");
  });
});
