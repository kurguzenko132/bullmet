import { AdminOrdersClient } from '@/components/AdminOrdersClient';
import { getAdminOrders } from '@/lib/adminCommerce';
import { isSupabaseConfigured } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Заказы | Админка Bullmet' };

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();
  return <AdminOrdersClient initialOrders={orders} supabaseConfigured={isSupabaseConfigured()} />;
}
