-- NO CORRE HUB | Execute no SQL Editor do Supabase.
create extension if not exists "uuid-ossp";
create type public.user_role as enum ('admin','operacao','financeiro','vendas');
create type public.order_status as enum ('novo','corte','costura','dtf','revisao','embalagem','entregue','cancelado');
create type public.movement_type as enum ('entrada','saida','ajuste');
create type public.transaction_type as enum ('receita','despesa');

create table public.profiles (id uuid primary key references auth.users(id) on delete cascade, full_name text not null, role public.user_role not null default 'operacao', created_at timestamptz default now());
create table public.customers (id uuid primary key default uuid_generate_v4(), name text not null, phone text, email text, instagram text, address jsonb default '{}'::jsonb, notes text, created_at timestamptz default now());
create table public.suppliers (id uuid primary key default uuid_generate_v4(), name text not null, contact_name text, phone text, email text, notes text, created_at timestamptz default now());
create table public.products (id uuid primary key default uuid_generate_v4(), sku text unique not null, name text not null, category text, fabric text, model text, base_price numeric(12,2) default 0, active boolean default true, created_at timestamptz default now());
create table public.product_variants (id uuid primary key default uuid_generate_v4(), product_id uuid not null references public.products(id) on delete cascade, color text not null, size text not null, sale_price numeric(12,2), cost_price numeric(12,2), unique(product_id,color,size));
create table public.stock_items (id uuid primary key default uuid_generate_v4(), supplier_id uuid references public.suppliers(id) on delete set null, name text not null, category text not null, unit text not null, min_quantity numeric(12,3) default 0, current_quantity numeric(12,3) default 0, unit_cost numeric(12,2) default 0, created_at timestamptz default now());
create table public.stock_movements (id uuid primary key default uuid_generate_v4(), item_id uuid not null references public.stock_items(id) on delete cascade, type public.movement_type not null, quantity numeric(12,3) not null check(quantity > 0), unit_cost numeric(12,2), reference text, created_at timestamptz default now(), created_by uuid references public.profiles(id));
create table public.orders (id uuid primary key default uuid_generate_v4(), order_number text unique not null, customer_id uuid references public.customers(id) on delete set null, status public.order_status not null default 'novo', due_date date, total numeric(12,2) default 0, notes text, created_at timestamptz default now());
create table public.order_items (id uuid primary key default uuid_generate_v4(), order_id uuid not null references public.orders(id) on delete cascade, variant_id uuid references public.product_variants(id) on delete set null, description text not null, quantity integer not null check(quantity > 0), unit_price numeric(12,2) not null default 0);
create table public.cost_sheets (id uuid primary key default uuid_generate_v4(), product_id uuid references public.products(id) on delete cascade, name text not null, fabric_cost numeric(12,2) default 0, sewing_cost numeric(12,2) default 0, dtf_cost numeric(12,2) default 0, labels_cost numeric(12,2) default 0, packaging_cost numeric(12,2) default 0, energy_cost numeric(12,2) default 0, sales_fee_percent numeric(5,2) default 0, target_margin_percent numeric(5,2) default 0, created_at timestamptz default now());
create table public.financial_transactions (id uuid primary key default uuid_generate_v4(), type public.transaction_type not null, description text not null, amount numeric(12,2) not null check(amount > 0), due_date date, paid_at date, order_id uuid references public.orders(id) on delete set null, category text, created_at timestamptz default now());
create table public.artworks (id uuid primary key default uuid_generate_v4(), name text not null, category text, storage_path text not null, file_type text, width_px integer, height_px integer, recommended_position text, tags text[] default '{}', active boolean default true, created_at timestamptz default now(), created_by uuid references public.profiles(id));

-- Futuras tabelas: dtf_jobs, knowledge_articles, label_templates, kpi_snapshots.
alter table public.profiles enable row level security; alter table public.customers enable row level security; alter table public.suppliers enable row level security; alter table public.products enable row level security; alter table public.product_variants enable row level security; alter table public.stock_items enable row level security; alter table public.stock_movements enable row level security; alter table public.orders enable row level security; alter table public.order_items enable row level security; alter table public.cost_sheets enable row level security; alter table public.financial_transactions enable row level security; alter table public.artworks enable row level security;
create policy "auth_customers" on public.customers for all to authenticated using (true) with check (true);
create policy "auth_suppliers" on public.suppliers for all to authenticated using (true) with check (true);
create policy "auth_products" on public.products for all to authenticated using (true) with check (true);
create policy "auth_variants" on public.product_variants for all to authenticated using (true) with check (true);
create policy "auth_stock_items" on public.stock_items for all to authenticated using (true) with check (true);
create policy "auth_stock_moves" on public.stock_movements for all to authenticated using (true) with check (true);
create policy "auth_orders" on public.orders for all to authenticated using (true) with check (true);
create policy "auth_order_items" on public.order_items for all to authenticated using (true) with check (true);
create policy "auth_costs" on public.cost_sheets for all to authenticated using (true) with check (true);
create policy "auth_transactions" on public.financial_transactions for all to authenticated using (true) with check (true);
create policy "auth_artworks" on public.artworks for all to authenticated using (true) with check (true);
