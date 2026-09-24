-- CMS-12. Выполните в Supabase SQL Editor после database/20260920_security_hardening.sql.
-- Сохраняет SEO-безопасные постоянные перенаправления после смены slug CMS-страницы.
create table if not exists public.site_page_redirects (
  old_slug text primary key,
  new_slug text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_page_redirects_different_slugs check (old_slug <> new_slug)
);

alter table public.site_page_redirects enable row level security;

drop trigger if exists site_page_redirects_set_updated_at on public.site_page_redirects;
create trigger site_page_redirects_set_updated_at
before update on public.site_page_redirects
for each row execute function public.set_updated_at();

create index if not exists site_page_redirects_new_slug_idx on public.site_page_redirects(new_slug);

drop policy if exists "site_page_redirects_staff_all" on public.site_page_redirects;
create policy "site_page_redirects_staff_all" on public.site_page_redirects
  for all using (public.is_staff()) with check (public.is_staff());
