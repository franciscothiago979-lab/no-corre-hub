import { readFile } from "node:fs/promises";
import postgres from "postgres";

const migrationUrl = new URL("../supabase/migrations/20260812_erp_persistence.sql", import.meta.url);

export async function applyErpSupabaseSchema({ databaseUrl = process.env.DATABASE_URL, readFileImpl = readFile, postgresFactory = postgres, log = console.log } = {}) {
  if (!databaseUrl || !/^postgres(ql)?:\/\//i.test(databaseUrl)) {
    throw new Error("DATABASE_URL PostgreSQL é obrigatório para aplicar o esquema ERP no Supabase.");
  }
  const migration = await readFileImpl(migrationUrl, "utf8");
  const sql = postgresFactory(databaseUrl, { ssl: "require", max: 1 });
  try {
    await sql.unsafe(migration);
    const tables = await sql`
      select tablename
      from pg_tables
      where schemaname = 'public'
        and tablename in ('erp_records', 'erp_workspace_snapshots')
      order by tablename
    `;
    if (tables.length !== 2) throw new Error("O Supabase não confirmou as duas tabelas de persistência do ERP.");
    log("Esquema de persistência ERP confirmado no Supabase.");
    return tables.map((row) => row.tablename);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1])) {
  applyErpSupabaseSchema().then((tables) => console.log(JSON.stringify({ tables }))).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
