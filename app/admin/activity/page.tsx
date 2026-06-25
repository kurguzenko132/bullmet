import { AdminActivityClient } from '@/components/AdminActivityClient';
import { getAdminActivityLog } from '@/lib/adminPeople';
import { isSupabaseConfigured } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Журнал действий | Админка Bullmet' };

export default async function AdminActivityPage() {
  const activity = await getAdminActivityLog();
  return <AdminActivityClient initialActivity={activity} supabaseConfigured={isSupabaseConfigured()} />;
}
