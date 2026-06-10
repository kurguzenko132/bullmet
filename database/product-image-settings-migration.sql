-- Bullmet: дополнительные поля для удобной настройки фото и отзывов
-- Выполнить в Supabase SQL Editor, если сохранение товара ругается на image_settings.

alter table public.products
  add column if not exists image_settings jsonb default '{}'::jsonb;

alter table public.products
  add column if not exists old_price numeric;

alter table public.products
  add column if not exists is_new boolean default false;

alter table public.products
  add column if not exists is_popular boolean default false;

alter table public.products
  add column if not exists in_stock boolean default true;

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null,
  user_id uuid,
  user_email text,
  user_name text,
  rating integer not null default 5 check (rating >= 1 and rating <= 5),
  comment text not null,
  photo_urls text[] default '{}',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists product_reviews_product_slug_idx on public.product_reviews(product_slug);
create index if not exists product_reviews_status_idx on public.product_reviews(status);
