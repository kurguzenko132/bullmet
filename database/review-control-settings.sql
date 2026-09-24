-- Централизованные настройки отзывов Bullmet.
-- Выполните в Supabase SQL Editor после основной схемы.
insert into public.site_settings (key, value)
values (
  'review_control',
  '{
    "autoPublish": true,
    "allowPhotos": true,
    "allowGuest": false,
    "productRating": true,
    "productCount": true,
    "homepage": true
  }'::jsonb
)
on conflict (key) do nothing;
