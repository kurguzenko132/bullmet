-- Unified media library metadata. Apply after supabase-schema.sql.
alter table public.media_files add column if not exists mime_type text;
alter table public.media_files add column if not exists width integer;
alter table public.media_files add column if not exists height integer;
alter table public.media_files add column if not exists alt_text text not null default '';
alter table public.media_files add column if not exists description text not null default '';
alter table public.media_files add column if not exists tags text[] not null default '{}';
alter table public.media_files add column if not exists updated_at timestamptz not null default now();

create index if not exists media_files_folder_idx on public.media_files (folder);
create index if not exists media_files_created_at_idx on public.media_files (created_at desc);
create index if not exists media_files_tags_idx on public.media_files using gin (tags);
