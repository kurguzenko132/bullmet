-- Orders CRM workflow. Apply after supabase-schema.sql.
alter table public.orders add column if not exists delivery_address text;
alter table public.orders add column if not exists payment_method text;
alter table public.orders add column if not exists source text not null default 'website';
alter table public.orders add column if not exists status_history jsonb not null default '[]'::jsonb;
alter table public.orders add column if not exists updated_at timestamptz not null default now();

create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_manager_idx on public.orders(manager);
