-- CRM customers: editable commercial contacts separate from auth profiles.
create table if not exists public.crm_customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  phone text,
  normalized_phone text,
  email text,
  city text,
  address text,
  status text not null default 'new' check (status in ('new', 'active', 'inactive', 'blocked')),
  source text not null default 'admin',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists crm_customers_user_id_unique on public.crm_customers(user_id) where user_id is not null;
create index if not exists crm_customers_email_idx on public.crm_customers(lower(email));
create index if not exists crm_customers_phone_idx on public.crm_customers(normalized_phone);
create index if not exists crm_customers_status_idx on public.crm_customers(status);

create table if not exists public.customer_notes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.crm_customers(id) on delete cascade,
  text text not null,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists customer_notes_customer_idx on public.customer_notes(customer_id, created_at desc);

alter table public.crm_customers enable row level security;
alter table public.customer_notes enable row level security;
drop policy if exists "crm_customers_admin_demo" on public.crm_customers;
create policy "crm_customers_admin_demo" on public.crm_customers for all using (true) with check (true);
drop policy if exists "customer_notes_admin_demo" on public.customer_notes;
create policy "customer_notes_admin_demo" on public.customer_notes for all using (true) with check (true);
