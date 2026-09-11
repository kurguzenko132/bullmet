import { AdminReportsClient } from '@/components/AdminReportsClient';
import { getBackupOverview } from '@/lib/adminBackup';
import { getAdminOrders, getAdminRequests } from '@/lib/adminCommerce';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Отчеты | Админка Bullmet' };

export default async function AdminReportsPage() {
  const [overview, orders, requests] = await Promise.all([getBackupOverview(), getAdminOrders(), getAdminRequests()]);
  return <AdminReportsClient overview={overview} orders={orders} requests={requests} />;
}
