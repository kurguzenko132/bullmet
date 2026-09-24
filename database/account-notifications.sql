-- Выполните в Supabase SQL Editor для синхронизации настройки уведомлений аккаунта.
alter table public.profiles
  add column if not exists notification_preferences boolean not null default true;
