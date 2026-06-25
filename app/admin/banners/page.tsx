import { AdminBannersClient } from '@/components/AdminBannersClient';
import { getBannerControlSettings } from '@/lib/adminContent';
import { isSupabaseConfigured } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Баннеры | Админка Bullmet' };

export default async function AdminBannersPage() {
  const settings = await getBannerControlSettings();
  return <AdminBannersClient initialSettings={settings} supabaseConfigured={isSupabaseConfigured()} />;
}
