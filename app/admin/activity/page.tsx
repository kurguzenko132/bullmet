import { AdminActivityClient } from '@/components/AdminActivityClient';
import { getAdminActivityLog, getAdminProfiles } from '@/lib/adminPeople';
import { getAdminOrders } from '@/lib/adminCommerce';
import { getAdminCatalogProducts } from '@/lib/products';
import { getAdminCoupons } from '@/lib/adminCoupons';
import { isSupabaseConfigured } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Журнал действий | Админка Bullmet' };

export default async function AdminActivityPage() {
  const [activity, profiles, orders, products, couponData] = await Promise.all([getAdminActivityLog(), getAdminProfiles(), getAdminOrders(), getAdminCatalogProducts(), getAdminCoupons()]);
  return <AdminActivityClient initialActivity={activity} profiles={profiles} orders={orders} products={products} coupons={couponData.coupons} supabaseConfigured={isSupabaseConfigured()} />;
}
