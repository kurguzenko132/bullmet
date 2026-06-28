-- Bullmet Supabase schema
-- Run this file in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  clock_theme text,
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
  product_image_fit text not null default 'contain' check (product_image_fit in ('cover', 'contain')),
  product_image_position text not null default 'center center',
  image_settings jsonb not null default '{}'::jsonb,
  variants jsonb not null default '[]'::jsonb,
  color_group_id text,
  color_name text,
  color_hex text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- Add image display settings for existing projects.
alter table public.products add column if not exists clock_theme text;
create index if not exists products_clock_theme_idx on public.products(clock_theme);

alter table public.products add column if not exists catalog_image_fit text not null default 'cover';
alter table public.products add column if not exists catalog_image_position text not null default 'center center';
alter table public.products add column if not exists product_image_fit text not null default 'contain';
alter table public.products add column if not exists product_image_position text not null default 'center center';
alter table public.products add column if not exists image_settings jsonb not null default '{}'::jsonb;
alter table public.products add column if not exists variants jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists color_group_id text;
alter table public.products add column if not exists color_name text;
alter table public.products add column if not exists color_hex text;
create index if not exists products_color_group_id_idx on public.products(color_group_id);

create table if not exists public.orders (
  id text primary key,
  created_at timestamptz not null default now(),
  customer jsonb not null,
  delivery text not null default 'Доставка по Беларуси',
  comment text,
  admin_note text not null default '',
  items jsonb not null default '[]'::jsonb,
  total numeric(12,2) not null default 0,
  status text not null default 'Новый'
);

create table if not exists public.requests (
  id text primary key,
  created_at timestamptz not null default now(),
  customer jsonb not null,
  kind text not null default 'calculation' check (kind in ('calculation', 'quick_order', 'contact', 'service')),
  contact_method text,
  type text not null,
  material text not null,
  sizes text,
  comment text not null default '',
  admin_note text not null default '',
  product_slug text,
  product_title text,
  product_image text,
  product_price numeric(12,2),
  quantity integer,
  file_name text,
  file_urls text[] not null default '{}',
  status text not null default 'Новая'
);

alter table public.requests add column if not exists kind text not null default 'calculation';
alter table public.requests add column if not exists contact_method text;
alter table public.requests add column if not exists product_image text;
alter table public.requests add column if not exists product_price numeric(12,2);
alter table public.requests add column if not exists quantity integer;
alter table public.requests add column if not exists file_urls text[] not null default '{}';

alter table public.orders add column if not exists admin_note text not null default '';
alter table public.requests add column if not exists admin_note text not null default '';
create index if not exists requests_kind_idx on public.requests(kind);
create index if not exists requests_status_idx on public.requests(status);

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
alter table public.profiles add column if not exists phone text;

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


-- Supabase Storage bucket for request attachments.
insert into storage.buckets (id, name, public)
values ('request-files', 'request-files', true)
on conflict (id) do update set public = true;

drop policy if exists "request_files_select_public" on storage.objects;
create policy "request_files_select_public"
on storage.objects for select
using (bucket_id = 'request-files');

drop policy if exists "request_files_insert_demo" on storage.objects;
create policy "request_files_insert_demo"
on storage.objects for insert
with check (bucket_id = 'request-files');

drop policy if exists "request_files_update_demo" on storage.objects;
create policy "request_files_update_demo"
on storage.objects for update
using (bucket_id = 'request-files')
with check (bucket_id = 'request-files');

drop policy if exists "request_files_delete_demo" on storage.objects;
create policy "request_files_delete_demo"
on storage.objects for delete
using (bucket_id = 'request-files');


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

-- Product reviews and ratings.
create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null,
  user_id uuid references auth.users(id) on delete cascade,
  user_email text,
  user_name text,
  rating integer not null check (rating between 1 and 5),
  comment text not null default '',
  photo_urls text[] not null default '{}',
  status text not null default 'published' check (status in ('pending', 'published', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.product_reviews add column if not exists photo_urls text[] not null default '{}';
alter table public.product_reviews drop constraint if exists product_reviews_product_slug_user_id_key;
alter table public.product_reviews add column if not exists status text not null default 'published' check (status in ('pending', 'published', 'hidden'));
alter table public.product_reviews alter column status set default 'published';
update public.product_reviews set status = 'published' where status = 'pending';

create index if not exists product_reviews_product_slug_idx on public.product_reviews(product_slug);
create index if not exists product_reviews_user_id_idx on public.product_reviews(user_id);
create index if not exists product_reviews_status_idx on public.product_reviews(status);

alter table public.product_reviews enable row level security;

drop trigger if exists product_reviews_set_updated_at on public.product_reviews;
create trigger product_reviews_set_updated_at
before update on public.product_reviews
for each row execute function public.set_updated_at();

drop policy if exists "product_reviews_select_public" on public.product_reviews;
create policy "product_reviews_select_public" on public.product_reviews
  for select using (status = 'published' or auth.uid() = user_id or public.is_admin());

drop policy if exists "product_reviews_insert_registered" on public.product_reviews;
create policy "product_reviews_insert_registered" on public.product_reviews
  for insert with check (auth.uid() = user_id);

drop policy if exists "product_reviews_update_own" on public.product_reviews;
create policy "product_reviews_update_own" on public.product_reviews
  for update using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "product_reviews_delete_own_or_admin" on public.product_reviews;
create policy "product_reviews_delete_own_or_admin" on public.product_reviews
  for delete using (auth.uid() = user_id or public.is_admin());

-- Admin notification center.
create table if not exists public.admin_notifications (
  id text primary key,
  type text not null default 'system' check (type in ('order', 'request', 'review', 'system')),
  title text not null default '',
  body text not null default '',
  href text not null default '/admin',
  status text not null default 'unread' check (status in ('unread', 'read')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists admin_notifications_created_at_idx on public.admin_notifications(created_at desc);
create index if not exists admin_notifications_status_idx on public.admin_notifications(status);
create index if not exists admin_notifications_type_idx on public.admin_notifications(type);

alter table public.admin_notifications enable row level security;

drop policy if exists "admin_notifications_select_demo" on public.admin_notifications;
create policy "admin_notifications_select_demo" on public.admin_notifications for select using (true);

drop policy if exists "admin_notifications_write_demo" on public.admin_notifications;
create policy "admin_notifications_write_demo" on public.admin_notifications for all using (true) with check (true);


-- Admin foundation: site control, navigation, SEO and activity log.
create table if not exists public.admin_activity_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor_email text,
  action text not null,
  entity text not null,
  entity_id text,
  payload jsonb not null default '{}'::jsonb
);

alter table public.admin_activity_log enable row level security;

drop policy if exists "admin_activity_log_select_demo" on public.admin_activity_log;
create policy "admin_activity_log_select_demo" on public.admin_activity_log for select using (true);

drop policy if exists "admin_activity_log_write_demo" on public.admin_activity_log;
create policy "admin_activity_log_write_demo" on public.admin_activity_log for all using (true) with check (true);

create index if not exists admin_activity_log_created_at_idx on public.admin_activity_log(created_at desc);
create index if not exists admin_activity_log_action_idx on public.admin_activity_log(action);

-- Keep all future site controls in site_settings under key = site_control.
insert into public.site_settings (key, value)
values (
  'site_control',
  '{
    "general": {
      "siteName": "Bullmet",
      "tagline": "металл с элементами дерева",
      "positioning": "производство металлоизделий",
      "launchMode": "clocks_only",
      "logoText": "BULLMET"
    },
    "contacts": {
      "phone": "+375 29 802 70 61",
      "email": "info@bullmet.by",
      "address": "Брестская обл., Ивацевичский р-н, д. Булла, ул. Школьная 10А",
      "hours": "ПН–ПТ: 9:00–18:00",
      "telegram": "",
      "instagram": ""
    },
    "directions": [
      { "key": "clocks", "title": "Настенные часы", "href": "/catalog", "visible": true, "order": 1, "note": "Первое публичное направление запуска" },
      { "key": "garden_furniture", "title": "Садовая мебель", "href": "/services", "visible": false, "order": 2, "note": "Подготовлено, включить позже" },
      { "key": "loft_furniture", "title": "Мебель для дома в стиле лофт", "href": "/services", "visible": false, "order": 3, "note": "Подготовлено, включить позже" },
      { "key": "laser_cutting", "title": "Лазерная резка", "href": "/services", "visible": false, "order": 4, "note": "Подготовлено, включить позже" },
      { "key": "metal_wholesale", "title": "Мелкий опт металлопроката", "href": "/services", "visible": false, "order": 5, "note": "Подготовлено, включить позже" },
      { "key": "metal_bending", "title": "Гибка металла", "href": "/services", "visible": false, "order": 6, "note": "Подготовлено, включить позже" }
    ],
    "navigation": [
      { "id": "catalog", "label": "Каталог", "href": "/catalog", "location": "header", "visible": true, "order": 1 },
      { "id": "production", "label": "Производство", "href": "/production", "location": "header", "visible": true, "order": 2 },
      { "id": "about", "label": "О компании", "href": "/about", "location": "header", "visible": true, "order": 3 },
      { "id": "contacts", "label": "Контакты", "href": "/contacts", "location": "header", "visible": true, "order": 4 },
      { "id": "services", "label": "Услуги", "href": "/services", "location": "header", "visible": false, "order": 5 },
      { "id": "home_mobile", "label": "Главная", "href": "/", "location": "mobile", "visible": true, "order": 1 },
      { "id": "catalog_mobile", "label": "Каталог", "href": "/catalog", "location": "mobile", "visible": true, "order": 2 },
      { "id": "about_mobile", "label": "О нас", "href": "/about", "location": "mobile", "visible": true, "order": 3 },
      { "id": "cart_mobile", "label": "Корзина", "href": "/cart", "location": "mobile", "visible": true, "order": 4 },
      { "id": "profile_mobile", "label": "Профиль", "href": "/login", "location": "mobile", "visible": true, "order": 5 }
    ],
    "seo": {
      "defaultTitle": "Bullmet — настенные часы из металла с элементами дерева",
      "defaultDescription": "Настенные часы из металла с элементами дерева собственного производства Bullmet. Производство металлоизделий в Беларуси.",
      "ogImage": "/og-image.jpg",
      "robotsIndex": true
    }
  }'::jsonb
)
on conflict (key) do nothing;


-- Admin homepage control. Settings are stored in site_settings under key = homepage_control.
insert into public.site_settings (key, value)
values ('homepage_control', '{}'::jsonb)
on conflict (key) do nothing;


-- Admin products full control: statuses, SEO and ordering.
alter table public.products add column if not exists seo_title text;
alter table public.products add column if not exists seo_description text;
alter table public.products add column if not exists sort_order integer not null default 100;

-- Expand product statuses for admin workflow.
alter table public.products drop constraint if exists products_status_check;
alter table public.products add constraint products_status_check
check (status in ('active', 'draft', 'hidden', 'out_of_stock'));

create index if not exists products_status_idx on public.products(status);
create index if not exists products_sort_order_idx on public.products(sort_order);
create index if not exists products_seo_title_idx on public.products(seo_title);


-- Admin CRM stage: orders/requests processing fields.
alter table public.orders add column if not exists priority text not null default 'normal';
alter table public.orders add column if not exists follow_up_at timestamptz;
alter table public.orders add column if not exists manager text;

alter table public.requests add column if not exists priority text not null default 'normal';
alter table public.requests add column if not exists follow_up_at timestamptz;
alter table public.requests add column if not exists manager text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_priority_check'
  ) then
    alter table public.orders add constraint orders_priority_check check (priority in ('normal', 'high', 'urgent'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'requests_priority_check'
  ) then
    alter table public.requests add constraint requests_priority_check check (priority in ('normal', 'high', 'urgent'));
  end if;
end $$;

create index if not exists orders_priority_idx on public.orders(priority);
create index if not exists orders_follow_up_at_idx on public.orders(follow_up_at);
create index if not exists requests_priority_idx on public.requests(priority);
create index if not exists requests_follow_up_at_idx on public.requests(follow_up_at);


-- Admin reviews/media/banners stage.
-- Reviews already use product_reviews. This stage adds banner control defaults.
insert into public.site_settings (key, value)
values (
  'banner_control',
  '{
    "enabled": false,
    "banners": [
      {
        "id": "home-clocks-promo",
        "title": "Настенные часы Bullmet",
        "text": "Выберите модель из металла с элементами дерева или уточните индивидуальный размер.",
        "image": "/mockup/cat-clock.jpg",
        "href": "/catalog",
        "buttonLabel": "Перейти в каталог",
        "visible": true,
        "placement": "home_top",
        "order": 1
      }
    ]
  }'::jsonb
)
on conflict (key) do nothing;

-- Optional registry for media uploaded manually from admin.
create table if not exists public.media_files (
  id uuid primary key default gen_random_uuid(),
  url text not null unique,
  title text,
  folder text not null default 'uploaded',
  source text not null default 'admin',
  used_in text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

alter table public.media_files enable row level security;

drop policy if exists "media_files_select_demo" on public.media_files;
create policy "media_files_select_demo" on public.media_files for select using (true);

drop policy if exists "media_files_write_demo" on public.media_files;
create policy "media_files_write_demo" on public.media_files for all using (true) with check (true);


-- Admin users, roles and activity stage.
alter table public.profiles add column if not exists status text not null default 'active';
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
check (role in ('customer', 'admin', 'manager', 'content_manager'));

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_status_check'
  ) then
    alter table public.profiles add constraint profiles_status_check check (status in ('active', 'blocked'));
  end if;
end $$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_status_idx on public.profiles(status);
create index if not exists profiles_email_idx on public.profiles(email);

-- Admin may read and update all profiles in demo/prototype mode.
drop policy if exists "profiles_admin_update_all" on public.profiles;
create policy "profiles_admin_update_all" on public.profiles for update using (public.is_admin()) with check (public.is_admin());

-- Ensure activity log exists even if earlier migration was skipped.
create table if not exists public.admin_activity_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor_email text,
  action text not null,
  entity text not null,
  entity_id text,
  payload jsonb not null default '{}'::jsonb
);

alter table public.admin_activity_log enable row level security;

drop policy if exists "admin_activity_log_select_demo" on public.admin_activity_log;
create policy "admin_activity_log_select_demo" on public.admin_activity_log for select using (true);

drop policy if exists "admin_activity_log_write_demo" on public.admin_activity_log;
create policy "admin_activity_log_write_demo" on public.admin_activity_log for all using (true) with check (true);

create index if not exists admin_activity_log_created_at_idx on public.admin_activity_log(created_at desc);
create index if not exists admin_activity_log_entity_idx on public.admin_activity_log(entity);
create index if not exists admin_activity_log_action_idx on public.admin_activity_log(action);


-- Admin role access hardening stage.
-- Keeps customers from escalating their own role/status while still allowing profile name/phone updates.

alter table public.profiles add column if not exists status text not null default 'active';
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
check (role in ('customer', 'admin', 'manager', 'content_manager'));

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_status_check'
  ) then
    alter table public.profiles add constraint profiles_status_check check (status in ('active', 'blocked'));
  end if;
end $$;

create or replace function public.prevent_profile_privilege_escalation()
returns trigger as $$
begin
  if auth.uid() = old.id and not public.is_admin() then
    new.role := old.role;
    new.status := old.status;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists profiles_prevent_privilege_escalation on public.profiles;
create trigger profiles_prevent_privilege_escalation
before update on public.profiles
for each row execute function public.prevent_profile_privilege_escalation();

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_status_idx on public.profiles(status);


-- Admin SEO/categories/public visibility stage.
insert into public.site_settings (key, value)
values (
  'catalog_control',
  '{
    "enabled": true,
    "categories": [
      { "id": "clock-auto", "title": "Авто-мир", "slug": "Авто-мир", "kind": "clock", "visible": true, "order": 1, "description": "Часы автомобильной тематики", "image": "/mockup/cat-clock.jpg" },
      { "id": "clock-barber", "title": "Барбершоп, парикмахерская", "slug": "Барбершоп, парикмахерская", "kind": "clock", "visible": true, "order": 2, "description": "Часы для барбершопов и салонов", "image": "/mockup/cat-clock.jpg" },
      { "id": "clock-graphic", "title": "Графика", "slug": "Графика", "kind": "clock", "visible": true, "order": 3, "description": "Графические модели часов", "image": "/mockup/cat-clock.jpg" },
      { "id": "clock-kids", "title": "Детские", "slug": "Детские", "kind": "clock", "visible": true, "order": 4, "description": "Детские настенные часы", "image": "/mockup/cat-clock.jpg" },
      { "id": "clock-animals", "title": "Животные", "slug": "Животные", "kind": "clock", "visible": true, "order": 5, "description": "Модели с животными", "image": "/mockup/cat-clock.jpg" },
      { "id": "clock-classic", "title": "Классика", "slug": "Классика", "kind": "clock", "visible": true, "order": 6, "description": "Классические настенные часы", "image": "/mockup/cat-clock.jpg" },
      { "id": "clock-coffee", "title": "Кофе и кухня", "slug": "Кофе и кухня", "kind": "clock", "visible": true, "order": 7, "description": "Часы для кухни, кафе и кофейни", "image": "/mockup/cat-clock.jpg" },
      { "id": "clock-music", "title": "Музыка", "slug": "Музыка", "kind": "clock", "visible": true, "order": 8, "description": "Музыкальная тематика", "image": "/mockup/cat-clock.jpg" },
      { "id": "clock-professions", "title": "Профессии", "slug": "Профессии", "kind": "clock", "visible": true, "order": 9, "description": "Часы под профессию или подарок", "image": "/mockup/cat-clock.jpg" },
      { "id": "clock-romance", "title": "Романтика", "slug": "Романтика", "kind": "clock", "visible": true, "order": 10, "description": "Романтические модели", "image": "/mockup/cat-clock.jpg" },
      { "id": "clock-fishing", "title": "Рыбалка, охота", "slug": "Рыбалка, охота", "kind": "clock", "visible": true, "order": 11, "description": "Тематика рыбалки и охоты", "image": "/mockup/cat-clock.jpg" },
      { "id": "clock-sport", "title": "Спорт", "slug": "Спорт", "kind": "clock", "visible": true, "order": 12, "description": "Спортивные модели часов", "image": "/mockup/cat-clock.jpg" },
      { "id": "clock-christian", "title": "Христианские", "slug": "Христианские", "kind": "clock", "visible": true, "order": 13, "description": "Христианская тематика", "image": "/mockup/cat-clock.jpg" },
      { "id": "service-laser", "title": "Лазерная резка", "slug": "laser_cutting", "kind": "service", "visible": false, "order": 101, "description": "Художественная лазерная резка из листового металла", "image": "/assets/service-metal.jpg" },
      { "id": "service-bending", "title": "Гибка металла", "slug": "metal_bending", "kind": "service", "visible": false, "order": 102, "description": "Гибка металлических деталей", "image": "/assets/service-wood.jpg" },
      { "id": "service-wholesale", "title": "Мелкий опт металлопроката", "slug": "metal_wholesale", "kind": "service", "visible": false, "order": 103, "description": "Подбор металлопроката под задачу", "image": "/assets/cat-metal.jpg" },
      { "id": "product-garden", "title": "Садовая мебель", "slug": "garden_furniture", "kind": "product", "visible": false, "order": 201, "description": "Садовая мебель и качели", "image": "/mockup/cat-swing.jpg" },
      { "id": "product-loft", "title": "Мебель лофт", "slug": "loft_furniture", "kind": "product", "visible": false, "order": 202, "description": "Мебель для дома в стиле лофт", "image": "/mockup/cat-custom.jpg" }
    ]
  }'::jsonb
)
on conflict (key) do nothing;


-- Super admin CMS pages stage.
create table if not exists public.site_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  status text not null default 'draft' check (status in ('published', 'draft', 'hidden')),
  excerpt text not null default '',
  seo_title text not null default '',
  seo_description text not null default '',
  og_image text not null default '',
  sections jsonb not null default '[]'::jsonb,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_pages enable row level security;

drop trigger if exists site_pages_set_updated_at on public.site_pages;
create trigger site_pages_set_updated_at
before update on public.site_pages
for each row execute function public.set_updated_at();

create index if not exists site_pages_slug_idx on public.site_pages(slug);
create index if not exists site_pages_status_idx on public.site_pages(status);
create index if not exists site_pages_sort_order_idx on public.site_pages(sort_order);

drop policy if exists "site_pages_select_public" on public.site_pages;
create policy "site_pages_select_public" on public.site_pages
  for select using (status = 'published' or public.is_admin());

drop policy if exists "site_pages_admin_write_demo" on public.site_pages;
create policy "site_pages_admin_write_demo" on public.site_pages
  for all using (public.is_admin()) with check (public.is_admin());

-- Demo starter page. It is hidden until published from admin.
insert into public.site_pages (
  slug,
  title,
  status,
  excerpt,
  seo_title,
  seo_description,
  og_image,
  sections,
  sort_order
)
values (
  'faq',
  'Вопросы и ответы',
  'draft',
  'Ответы на частые вопросы о заказе настенных часов Bullmet.',
  'Вопросы и ответы Bullmet',
  'Частые вопросы о настенных часах Bullmet, доставке, оплате и индивидуальном изготовлении.',
  '/assets/hero-machine.jpg',
  '[
    {
      "id": "hero-faq",
      "type": "hero",
      "subtitle": "Bullmet",
      "title": "Вопросы и ответы",
      "text": "Соберите здесь ответы на вопросы клиентов перед запуском сайта.",
      "image": "/assets/hero-machine.jpg",
      "buttonLabel": "Перейти в каталог",
      "buttonHref": "/catalog"
    },
    {
      "id": "faq-list",
      "type": "faq",
      "subtitle": "FAQ",
      "title": "Частые вопросы",
      "items": [
        { "title": "Можно ли заказать часы в индивидуальном размере?", "text": "Да, можно обсудить индивидуальный размер и дизайн." },
        { "title": "Как оформить заказ?", "text": "Выберите товар в каталоге или отправьте заявку через форму." }
      ]
    }
  ]'::jsonb,
  100
)
on conflict (slug) do nothing;


-- public-navigation-services-fix

-- Bullmet public navigation fix: hide "О компании", show "Услуги".
-- Run this if Supabase already has saved site_control settings.

update public.site_settings
set value = jsonb_set(
  jsonb_set(
    value,
    '{navigation}',
    (
      select jsonb_agg(
        case
          when item->>'href' = '/about' or item->>'id' in ('about', 'about_mobile')
            then jsonb_set(item, '{visible}', 'false'::jsonb)
          when item->>'href' = '/services' or item->>'id' in ('services', 'services_mobile')
            then jsonb_set(jsonb_set(item, '{visible}', 'true'::jsonb), '{order}', '3'::jsonb)
          else item
        end
        order by coalesce((item->>'order')::int, 100)
      )
      from jsonb_array_elements(value->'navigation') item
    )
  ),
  '{updated_at}',
  to_jsonb(now()::text),
  true
)
where key = 'site_control';
