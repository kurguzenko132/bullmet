-- Admin homepage control. Settings are stored in site_settings under key = homepage_control.
insert into public.site_settings (key, value)
values ('homepage_control', '{}'::jsonb)
on conflict (key) do nothing;
