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
