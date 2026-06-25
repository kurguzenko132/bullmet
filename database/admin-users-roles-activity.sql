-- Admin users, roles and activity stage.
alter table public.profiles add column if not exists status text not null default 'active';
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
check (role in ('customer', 'admin', 'manager', 'content_manager'));

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_status_check'
  ) then
    alter table public.profiles add constraint profiles_status_check check (status in ('active', 'blocked'));
  end if;
end $$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_status_idx on public.profiles(status);
create index if not exists profiles_email_idx on public.profiles(email);

-- Admin may read and update all profiles in demo/prototype mode.
drop policy if exists "profiles_admin_update_all" on public.profiles;
create policy "profiles_admin_update_all" on public.profiles for update using (public.is_admin()) with check (public.is_admin());

-- Ensure activity log exists even if earlier migration was skipped.
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
create index if not exists admin_activity_log_entity_idx on public.admin_activity_log(entity);
create index if not exists admin_activity_log_action_idx on public.admin_activity_log(action);
