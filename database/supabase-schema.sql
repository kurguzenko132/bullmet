-- Bullmet Supabase schema
-- Run this file in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  material text not null,
  short text not null default '',
  description text not null default '',
  price numeric(12,2) not null default 0,
  old_price numeric(12,2),
  image text not null default '/assets/cat-clock.jpg',
  images text[] not null default '{}',
  sizes text[] not null default '{}',
  specs text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'draft')),
  is_popular boolean not null default false,
  is_new boolean not null default false,
  in_stock boolean not null default true,
  catalog_image_fit text not null default 'cover' check (catalog_image_fit in ('cover', 'contain')),
  catalog_image_position text not null default 'center center',
  product_image_fit text not null default 'cover' check (product_image_fit in ('cover', 'contain')),
  product_image_position text not null default 'center center',
  image_settings jsonb not null default '{}'::jsonb,
  variants jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- Add image display settings for existing projects.
alter table public.products add column if not exists catalog_image_fit text not null default 'cover';
alter table public.products add column if not exists catalog_image_position text not null default 'center center';
alter table public.products add column if not exists product_image_fit text not null default 'cover';
alter table public.products add column if not exists product_image_position text not null default 'center center';
alter table public.products add column if not exists image_settings jsonb not null default '{}'::jsonb;
alter table public.products add column if not exists variants jsonb not null default '[]'::jsonb;

create table if not exists public.orders (
  id text primary key,
  created_at timestamptz not null default now(),
  customer jsonb not null,
  delivery text not null default 'Доставка по Беларуси',
  comment text,
  items jsonb not null default '[]'::jsonb,
  total numeric(12,2) not null default 0,
  status text not null default 'Новый'
);

create table if not exists public.requests (
  id text primary key,
  created_at timestamptz not null default now(),
  customer jsonb not null,
  type text not null,
  material text not null,
  sizes text,
  comment text not null default '',
  product_slug text,
  product_title text,
  file_name text,
  status text not null default 'Новая'
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);


-- Auth profile trigger. Creates a customer profile after user registration.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Helper for checking admin role in RLS policies.
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.requests enable row level security;
alter table public.profiles enable row level security;

-- Supabase Storage bucket for product photos.
-- If the bucket already exists, this command will not duplicate it.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- Public read access for product images.
drop policy if exists "product_images_select_public" on storage.objects;
create policy "product_images_select_public"
on storage.objects for select
using (bucket_id = 'product-images');

-- Demo upload/update/delete access for product images.
-- For production, restrict these policies to admin users.
drop policy if exists "product_images_insert_demo" on storage.objects;
create policy "product_images_insert_demo"
on storage.objects for insert
with check (bucket_id = 'product-images');

drop policy if exists "product_images_update_demo" on storage.objects;
create policy "product_images_update_demo"
on storage.objects for update
using (bucket_id = 'product-images')
with check (bucket_id = 'product-images');

drop policy if exists "product_images_delete_demo" on storage.objects;
create policy "product_images_delete_demo"
on storage.objects for delete
using (bucket_id = 'product-images');


-- Demo policies for prototype launch. For production, restrict writes to admin role.
drop policy if exists "products_select_public" on public.products;
create policy "products_select_public" on public.products for select using (true);

drop policy if exists "products_write_demo" on public.products;
create policy "products_write_demo" on public.products for all using (true) with check (true);

drop policy if exists "orders_write_demo" on public.orders;
create policy "orders_write_demo" on public.orders for all using (true) with check (true);

drop policy if exists "requests_write_demo" on public.requests;
create policy "requests_write_demo" on public.requests for all using (true) with check (true);

drop policy if exists "profiles_read_own" on public.profiles;
create policy "profiles_read_own" on public.profiles for select using (auth.uid() = id);

-- Profiles policies for Supabase Auth.
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_admin_read_all" on public.profiles;
create policy "profiles_admin_read_all" on public.profiles for select using (public.is_admin());

-- To make an existing user an admin, run this after registration:
-- update public.profiles set role = 'admin' where email = 'admin@bullmet.by';


-- Demo product inserts were removed intentionally.
-- Re-running this schema will not restore deleted products.

-- Favorites
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  product_slug text not null,
  title text not null,
  price numeric default 0,
  image text,
  short text,
  category text,
  created_at timestamptz default now(),
  unique(user_id, product_slug)
);

alter table public.favorites enable row level security;

drop policy if exists "Users can read own favorites" on public.favorites;
create policy "Users can read own favorites" on public.favorites
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own favorites" on public.favorites;
create policy "Users can insert own favorites" on public.favorites
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own favorites" on public.favorites;
create policy "Users can delete own favorites" on public.favorites
  for delete using (auth.uid() = user_id);

-- Site settings for editable home page images/categories.
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

drop policy if exists "site_settings_select_public" on public.site_settings;
create policy "site_settings_select_public" on public.site_settings for select using (true);

drop policy if exists "site_settings_write_demo" on public.site_settings;
create policy "site_settings_write_demo" on public.site_settings for all using (true) with check (true);

-- Default home settings insert was removed intentionally.
-- Re-running this schema will not restore old hero/category images.
