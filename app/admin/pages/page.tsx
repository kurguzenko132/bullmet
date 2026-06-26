import { AdminPagesClient } from '@/components/AdminPagesClient';
import { getAdminSitePages } from '@/lib/sitePages';
import { isSupabaseConfigured } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Страницы сайта | Админка Bullmet' };

export default async function AdminPagesPage() {
  const pages = await getAdminSitePages();
  return <AdminPagesClient initialPages={pages} supabaseConfigured={isSupabaseConfigured()} />;
}
