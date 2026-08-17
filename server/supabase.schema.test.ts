import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("migração de persistência ERP no Supabase", () => {
  it("cria de forma idempotente os dois repositórios necessários à sincronização", () => {
    const source = readFileSync(resolve(process.cwd(), "supabase/migrations/20260812_erp_persistence.sql"), "utf8");
    expect(source).toContain("create table if not exists public.erp_records");
    expect(source).toContain("create table if not exists public.erp_workspace_snapshots");
    expect(source).toContain("primary key (owner_open_id, module, record_id)");
  });
});
