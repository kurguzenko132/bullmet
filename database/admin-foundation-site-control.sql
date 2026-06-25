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
