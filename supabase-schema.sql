-- Bullmet starter schema for Supabase PostgreSQL
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  image_url text,
  seo_title text,
  seo_description text,
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  title text not null,
  slug text unique not null,
  description text,
  price numeric(12,2) not null default 0,
  old_price numeric(12,2),
  status text not null default 'active',
  material text,
  dimensions text,
  cover text,
  image_url text,
  seo_title text,
  seo_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  image_url text not null,
  sort_order integer default 0
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  email text,
  comment text,
  status text not null default 'new',
  total numeric(12,2) not null default 0,
  created_at timestamptz default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  title text not null,
  quantity integer not null default 1,
  price numeric(12,2) not null default 0
);

create table if not exists custom_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  external_link text,
  message text,
  file_url text,
  status text not null default 'new',
  created_at timestamptz default now()
);

create table if not exists homepage_settings (
  id integer primary key default 1,
  hero_title text,
  hero_subtitle text,
  hero_image_url text,
  seo_title text,
  seo_description text,
  updated_at timestamptz default now(),
  constraint homepage_single_row check (id = 1)
);

insert into categories (title, slug, description) values
('Часы собственного производства', 'chasy', 'Часы из металла с элементами дерева'),
('Садовые качели', 'sadovye-kacheli', 'Садовые качели собственного производства'),
('Резка металла', 'rezka-metalla', 'Резка металла под заказ'),
('Резка дерева', 'rezka-dereva', 'Резка дерева под заказ')
on conflict (slug) do nothing;
