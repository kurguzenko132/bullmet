import { AdminUsersClient } from '@/components/AdminUsersClient';
import { getAdminActivityLog, getAdminCustomerRecords, getAdminProfiles } from '@/lib/adminPeople';
import { isSupabaseConfigured } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Пользователи | Админка Bullmet' };

export default async function AdminUsersPage() {
  const [users, activity, customers] = await Promise.all([
    getAdminProfiles(),
    getAdminActivityLog(),
    getAdminCustomerRecords()
  ]);

  return <AdminUsersClient initialUsers={users} activity={activity} customers={customers} supabaseConfigured={isSupabaseConfigured()} />;
}
