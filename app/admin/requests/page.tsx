import { AdminRequestsClient } from '@/components/AdminRequestsClient';
import { getAdminRequests } from '@/lib/adminCommerce';
import { isSupabaseConfigured } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Заявки | Админка Bullmet' };

export default async function AdminRequestsPage() {
  const requests = await getAdminRequests();
  return <AdminRequestsClient initialRequests={requests} supabaseConfigured={isSupabaseConfigured()} />;
}
