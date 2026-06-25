-- Admin CRM stage: orders/requests processing fields.
alter table public.orders add column if not exists priority text not null default 'normal';
alter table public.orders add column if not exists follow_up_at timestamptz;
alter table public.orders add column if not exists manager text;

alter table public.requests add column if not exists priority text not null default 'normal';
alter table public.requests add column if not exists follow_up_at timestamptz;
alter table public.requests add column if not exists manager text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_priority_check'
  ) then
    alter table public.orders add constraint orders_priority_check check (priority in ('normal', 'high', 'urgent'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'requests_priority_check'
  ) then
    alter table public.requests add constraint requests_priority_check check (priority in ('normal', 'high', 'urgent'));
  end if;
end $$;

create index if not exists orders_priority_idx on public.orders(priority);
create index if not exists orders_follow_up_at_idx on public.orders(follow_up_at);
create index if not exists requests_priority_idx on public.requests(priority);
create index if not exists requests_follow_up_at_idx on public.requests(follow_up_at);
