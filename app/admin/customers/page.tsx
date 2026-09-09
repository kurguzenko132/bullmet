import { AdminCustomersClient } from '@/components/AdminCustomersClient';
import { getAdminOrders, getAdminRequests } from '@/lib/adminCommerce';
import { getAdminProfiles } from '@/lib/adminPeople';
import { isSupabaseConfigured } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Покупатели | Админка Bullmet' };

export default async function AdminCustomersPage() {
  const [profiles, orders, requests] = await Promise.all([getAdminProfiles(), getAdminOrders(), getAdminRequests()]);
  return <AdminCustomersClient profiles={profiles} orders={orders} requests={requests} supabaseConfigured={isSupabaseConfigured()} />;
}
