import postgres from "postgres";

export function ownerIdentityPair(ownerOpenId) {
  const normalized = String(ownerOpenId || "").trim();
  if (!normalized.startsWith("supabase:")) throw new Error("OWNER_OPEN_ID deve usar o formato supabase:<uuid>.");
  return { target: normalized, legacy: normalized.slice("supabase:".length) };
}

export async function normalizeErpOwnerOpenId({ databaseUrl = process.env.DATABASE_URL, ownerOpenId = process.env.OWNER_OPEN_ID, postgresFactory = postgres, log = console.log } = {}) {
  if (!databaseUrl || !/^postgres(ql)?:\/\//i.test(databaseUrl)) throw new Error("DATABASE_URL PostgreSQL é obrigatório.");
  const { target, legacy } = ownerIdentityPair(ownerOpenId);
  const sql = postgresFactory(databaseUrl, { ssl: "require", max: 1 });
  try {
    const records = await sql`
      update public.erp_records
      set owner_open_id = ${target}
      where owner_open_id = ${legacy}
      returning record_id
    `;
    const snapshots = await sql`
      update public.erp_workspace_snapshots
      set owner_open_id = ${target}
      where owner_open_id = ${legacy}
      returning module
    `;
    const result = { records: records.length, snapshots: snapshots.length, ownerOpenId: target };
    log(`Identidade ERP normalizada: ${result.records} registros e ${result.snapshots} snapshots migrados.`);
    return result;
  } finally {
    await sql.end({ timeout: 5 });
  }
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1])) {
  normalizeErpOwnerOpenId().then((result) => console.log(JSON.stringify(result))).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
