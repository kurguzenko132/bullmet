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
