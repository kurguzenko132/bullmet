-- Bullmet public production cleanup.
-- Optional SQL if old saved settings in Supabase still contain old navigation/homepage text.

-- Hide "О компании" in saved public navigation and show "Услуги".
update public.site_settings
set value = jsonb_set(
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
  ),
  true
)
where key = 'site_control' and value ? 'navigation';

-- Remove old "О компании" button from homepage gallery settings if it was saved earlier.
update public.site_settings
set value = jsonb_set(
  jsonb_set(value, '{gallerySection,buttonLabel}', to_jsonb('Производство'::text), true),
  '{gallerySection,buttonHref}', to_jsonb('/production'::text), true
)
where key = 'homepage_control'
  and (
    value#>>'{gallerySection,buttonHref}' = '/about'
    or value#>>'{gallerySection,buttonLabel}' = 'О компании'
  );
