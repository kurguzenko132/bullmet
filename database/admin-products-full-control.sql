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
