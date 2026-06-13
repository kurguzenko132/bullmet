import { AdminRequestsClient } from '@/components/AdminRequestsClient';
import { getAdminRequests } from '@/lib/adminCommerce';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Заявки | Админка Bullmet' };

export default async function AdminRequestsPage() {
  const requests = await getAdminRequests();
  return <AdminRequestsClient initialRequests={requests} />;
}
