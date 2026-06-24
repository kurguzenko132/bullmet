-- Bullmet: отзывы публикуются сразу и поддерживают фото.
-- Выполнить в Supabase SQL Editor, если таблица product_reviews уже создана раньше.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

alter table public.product_reviews
  alter column status set default 'published';

update public.product_reviews
set status = 'published'
where status = 'pending';

alter table public.product_reviews
  add column if not exists photo_urls text[] not null default '{}';

drop policy if exists "product_images_select_public" on storage.objects;
create policy "product_images_select_public"
on storage.objects for select
using (bucket_id = 'product-images');

drop policy if exists "product_images_insert_demo" on storage.objects;
create policy "product_images_insert_demo"
on storage.objects for insert
with check (bucket_id = 'product-images');
