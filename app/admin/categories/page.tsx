import { AdminCategoriesClient } from '@/components/AdminCategoriesClient';
import { getCatalogControlSettings } from '@/lib/catalogControl';
import { isSupabaseConfigured } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Категории | Админка Bullmet' };

export default async function AdminCategoriesPage() {
  const settings = await getCatalogControlSettings();
  return <AdminCategoriesClient initialSettings={settings} supabaseConfigured={isSupabaseConfigured()} />;
}
