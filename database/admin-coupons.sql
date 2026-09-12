-- Bullmet CMS: coupons, snapshots and usage history.
create extension if not exists "pgcrypto";

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  description text not null default '',
  type text not null check (type in ('percentage', 'fixed', 'free_shipping')),
  value numeric(12,2),
  max_discount numeric(12,2),
  status text not null default 'inactive' check (status in ('active', 'inactive', 'archived')),
  starts_at timestamptz,
  ends_at timestamptz,
  total_usage_limit integer,
  usage_limit_per_customer integer,
  minimum_order_amount numeric(12,2),
  first_order_only boolean not null default false,
  new_customers_only boolean not null default false,
  allow_discounted_products boolean not null default false,
  category_ids text[] not null default '{}',
  product_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists coupons_code_idx on public.coupons (code);
create index if not exists coupons_status_idx on public.coupons (status);

create table if not exists public.coupon_usages (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete restrict,
  order_id text not null references public.orders(id) on delete restrict,
  customer_id uuid references public.profiles(id) on delete set null,
  customer_name text,
  customer_key text not null,
  order_total numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  unique(coupon_id, order_id)
);
create index if not exists coupon_usages_coupon_id_idx on public.coupon_usages(coupon_id);
create index if not exists coupon_usages_customer_key_idx on public.coupon_usages(coupon_id, customer_key);

alter table public.orders add column if not exists coupon_id uuid references public.coupons(id) on delete set null;
alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists coupon_type text;
alter table public.orders add column if not exists coupon_value numeric(12,2);
alter table public.orders add column if not exists discount_amount numeric(12,2) not null default 0;
alter table public.orders add column if not exists delivery_discount numeric(12,2) not null default 0;
alter table public.orders add column if not exists subtotal numeric(12,2);

alter table public.coupons enable row level security;
alter table public.coupon_usages enable row level security;
drop policy if exists "coupons_admin_all" on public.coupons;
create policy "coupons_admin_all" on public.coupons for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "coupon_usages_admin_all" on public.coupon_usages;
create policy "coupon_usages_admin_all" on public.coupon_usages for all using (public.is_admin()) with check (public.is_admin());
