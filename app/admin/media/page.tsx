import { AdminMediaClient } from '@/components/AdminMediaClient';
import { getAdminMediaFiles } from '@/lib/adminContent';
import { isSupabaseConfigured } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Медиафайлы | Админка Bullmet' };

export default async function AdminMedia() {
  const files = await getAdminMediaFiles();
  return <AdminMediaClient initialFiles={files} supabaseConfigured={isSupabaseConfigured()} />;
}
