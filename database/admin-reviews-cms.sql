-- Расширение CMS отзывов Bullmet. Выполните в Supabase SQL Editor.
alter table public.product_reviews add column if not exists customer_city text;
alter table public.product_reviews add column if not exists customer_phone text;
alter table public.product_reviews add column if not exists product_id text;
alter table public.product_reviews add column if not exists order_id text;
alter table public.product_reviews add column if not exists verified_purchase boolean not null default false;
alter table public.product_reviews add column if not exists source text not null default 'website';
alter table public.product_reviews add column if not exists admin_reply text;
alter table public.product_reviews add column if not exists admin_reply_at timestamptz;
alter table public.product_reviews add column if not exists internal_note text;
alter table public.product_reviews add column if not exists show_on_homepage boolean not null default false;
alter table public.product_reviews add column if not exists rejection_reason text;
alter table public.product_reviews drop constraint if exists product_reviews_status_check;
alter table public.product_reviews add constraint product_reviews_status_check check (status in ('pending', 'published', 'hidden', 'rejected'));
create index if not exists product_reviews_review_status_idx on public.product_reviews(status);
create index if not exists product_reviews_homepage_idx on public.product_reviews(show_on_homepage) where show_on_homepage = true;
