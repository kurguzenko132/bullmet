-- Bullmet public navigation fix: hide "О компании", show "Услуги".
-- Run this if Supabase already has saved site_control settings.

update public.site_settings
set value = jsonb_set(
  jsonb_set(
    value,
    '{navigation}',
    (
      select jsonb_agg(
        case
          when item->>'href' = '/about' or item->>'id' in ('about', 'about_mobile')
            then jsonb_set(item, '{visible}', 'false'::jsonb)
          when item->>'href' = '/services' or item->>'id' in ('services', 'services_mobile')
            then jsonb_set(jsonb_set(item, '{visible}', 'true'::jsonb), '{order}', '3'::jsonb)
          else item
        end
        order by coalesce((item->>'order')::int, 100)
      )
      from jsonb_array_elements(value->'navigation') item
    )
  ),
  '{updated_at}',
  to_jsonb(now()::text),
  true
)
where key = 'site_control';
