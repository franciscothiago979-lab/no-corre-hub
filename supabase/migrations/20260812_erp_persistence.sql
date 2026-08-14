create table if not exists public.erp_workspace_snapshots (
  owner_open_id text not null,
  module text not null,
  data jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_open_id, module)
);

create table if not exists public.erp_records (
  owner_open_id text not null,
  module text not null,
  record_id bigint not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_open_id, module, record_id)
);

create index if not exists erp_records_owner_module_created_idx
  on public.erp_records (owner_open_id, module, created_at desc);

grant select, insert, update, delete on public.erp_workspace_snapshots to service_role;
grant select, insert, update, delete on public.erp_records to service_role;
