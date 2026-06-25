-- Admin role access hardening stage.
-- Keeps customers from escalating their own role/status while still allowing profile name/phone updates.

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

create or replace function public.prevent_profile_privilege_escalation()
returns trigger as $$
begin
  if auth.uid() = old.id and not public.is_admin() then
    new.role := old.role;
    new.status := old.status;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists profiles_prevent_privilege_escalation on public.profiles;
create trigger profiles_prevent_privilege_escalation
before update on public.profiles
for each row execute function public.prevent_profile_privilege_escalation();

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_status_idx on public.profiles(status);
