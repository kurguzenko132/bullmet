import { AdminUsersClient } from '@/components/AdminUsersClient';
import { getAdminProfiles } from '@/lib/adminPeople';
import { isSupabaseConfigured } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Пользователи | Админка Bullmet' };

export default async function AdminUsersPage() {
  const users = await getAdminProfiles();
  return <AdminUsersClient initialUsers={users} supabaseConfigured={isSupabaseConfigured()} />;
}
