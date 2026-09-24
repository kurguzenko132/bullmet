-- Production security migration for Bullmet.
-- Apply this *after* the historical schema files. It replaces every permissive
-- prototype policy and makes the service-role server API the only public write path.
-- Verify with the role matrix in todo.md before deploying to production.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'active'
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'manager', 'content_manager')
      and status = 'active'
  );
$$;

-- A user can edit only their public contact fields. Roles and status are server-only.
create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = old.id and not public.is_admin() then
    new.role := old.role;
    new.status := old.status;
  end if;
  return new;
end;
$$;

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.requests enable row level security;
alter table public.site_settings enable row level security;
alter table public.admin_notifications enable row level security;
alter table public.admin_activity_log enable row level security;
alter table public.crm_customers enable row level security;
alter table public.customer_notes enable row level security;
alter table public.media_files enable row level security;

drop policy if exists "products_write_demo" on public.products;
drop policy if exists "products_select_public" on public.products;
drop policy if exists "products_staff_all" on public.products;
create policy "products_select_public" on public.products for select using (status = 'active');
create policy "products_staff_all" on public.products for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "orders_write_demo" on public.orders;
drop policy if exists "orders_staff_all" on public.orders;
create policy "orders_staff_all" on public.orders for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "requests_write_demo" on public.requests;
drop policy if exists "requests_staff_all" on public.requests;
create policy "requests_staff_all" on public.requests for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "site_settings_select_public" on public.site_settings;
drop policy if exists "site_settings_write_demo" on public.site_settings;
drop policy if exists "site_settings_staff_all" on public.site_settings;
create policy "site_settings_staff_all" on public.site_settings for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "admin_notifications_select_demo" on public.admin_notifications;
drop policy if exists "admin_notifications_write_demo" on public.admin_notifications;
drop policy if exists "admin_notifications_staff_all" on public.admin_notifications;
create policy "admin_notifications_staff_all" on public.admin_notifications for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "admin_activity_log_select_demo" on public.admin_activity_log;
drop policy if exists "admin_activity_log_write_demo" on public.admin_activity_log;
drop policy if exists "admin_activity_log_staff_all" on public.admin_activity_log;
create policy "admin_activity_log_staff_all" on public.admin_activity_log for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "crm_customers_admin_demo" on public.crm_customers;
drop policy if exists "crm_customers_staff_all" on public.crm_customers;
create policy "crm_customers_staff_all" on public.crm_customers for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "customer_notes_admin_demo" on public.customer_notes;
drop policy if exists "customer_notes_staff_all" on public.customer_notes;
create policy "customer_notes_staff_all" on public.customer_notes for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "media_files_select_demo" on public.media_files;
drop policy if exists "media_files_write_demo" on public.media_files;
drop policy if exists "media_files_staff_all" on public.media_files;
create policy "media_files_staff_all" on public.media_files for all using (public.is_staff()) with check (public.is_staff());

-- Product photos are public to display them, but only active staff can alter objects.
drop policy if exists "product_images_insert_demo" on storage.objects;
drop policy if exists "product_images_update_demo" on storage.objects;
drop policy if exists "product_images_delete_demo" on storage.objects;
drop policy if exists "product_images_insert_staff" on storage.objects;
drop policy if exists "product_images_update_staff" on storage.objects;
drop policy if exists "product_images_delete_staff" on storage.objects;
create policy "product_images_insert_staff" on storage.objects for insert with check (bucket_id = 'product-images' and public.is_staff());
create policy "product_images_update_staff" on storage.objects for update using (bucket_id = 'product-images' and public.is_staff()) with check (bucket_id = 'product-images' and public.is_staff());
create policy "product_images_delete_staff" on storage.objects for delete using (bucket_id = 'product-images' and public.is_staff());

-- Customer attachments are private; the server uses the service role to upload and
-- later issues signed URLs only to authorized staff or the verified owner.
insert into storage.buckets (id, name, public)
values ('request-files', 'request-files', false)
on conflict (id) do update set public = false;
drop policy if exists "request_files_select_public" on storage.objects;
drop policy if exists "request_files_insert_demo" on storage.objects;
drop policy if exists "request_files_update_demo" on storage.objects;
drop policy if exists "request_files_delete_demo" on storage.objects;
drop policy if exists "request_files_staff_select" on storage.objects;
drop policy if exists "request_files_staff_delete" on storage.objects;
create policy "request_files_staff_select" on storage.objects for select using (bucket_id = 'request-files' and public.is_staff());
create policy "request_files_staff_delete" on storage.objects for delete using (bucket_id = 'request-files' and public.is_staff());
