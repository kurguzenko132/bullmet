-- Bullmet: несколько отзывов от одного аккаунта на один товар.
-- Выполнить в Supabase SQL Editor, если таблица product_reviews уже существует.

alter table public.product_reviews
  drop constraint if exists product_reviews_product_slug_user_id_key;

alter table public.product_reviews
  alter column status set default 'published';

update public.product_reviews
set status = 'published'
where status = 'pending';

alter table public.product_reviews
  add column if not exists photo_urls text[] not null default '{}';

create index if not exists product_reviews_product_slug_idx on public.product_reviews(product_slug);
create index if not exists product_reviews_user_id_idx on public.product_reviews(user_id);
create index if not exists product_reviews_status_idx on public.product_reviews(status);
