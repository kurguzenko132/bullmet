-- CMS-14. Выполните в Supabase SQL Editor после database/20260920_security_hardening.sql.
-- Связывает каждое административное действие с проверенным пользователем.
alter table public.admin_activity_log
  add column if not exists actor_id uuid references public.profiles(id) on delete set null;

create index if not exists admin_activity_log_actor_id_created_at_idx
  on public.admin_activity_log(actor_id, created_at desc);
