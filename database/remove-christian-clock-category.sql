-- Removes the retired category from an existing Supabase catalog_control row.
-- Safe to run after database/supabase-schema.sql.
update public.site_settings
set value = jsonb_set(
  value,
  '{categories}',
  coalesce(
    (
      select jsonb_agg(category)
      from jsonb_array_elements(coalesce(value -> 'categories', '[]'::jsonb)) as category
      where category ->> 'id' <> 'clock-christian'
    ),
    '[]'::jsonb
  )
)
where key = 'catalog_control'
  and jsonb_typeof(value -> 'categories') = 'array'
  and exists (
    select 1
    from jsonb_array_elements(value -> 'categories') as category
    where category ->> 'id' = 'clock-christian'
  );
