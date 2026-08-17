import { describe, expect, it } from "vitest";
import { ownerIdentityPair } from "../deploy/normalize-erp-owner-open-id.mjs";

describe("normalização de proprietário ERP", () => {
  it("migra o UUID legado para o identificador Supabase usado pela sessão", () => {
    expect(ownerIdentityPair("supabase:af1ae635-e7b7-4fd0-8839-71d46df9301e")).toEqual({
      target: "supabase:af1ae635-e7b7-4fd0-8839-71d46df9301e",
      legacy: "af1ae635-e7b7-4fd0-8839-71d46df9301e",
    });
  });
});
