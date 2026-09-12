import { AdminDeliveryClient } from '@/components/AdminDeliveryClient';
import { getAdminOrders } from '@/lib/adminCommerce';
import { getSiteControlSettings } from '@/lib/siteControl';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Доставка | Админка Bullmet' };

export default async function AdminDeliveryPage() {
  const [settings, orders] = await Promise.all([getSiteControlSettings(), getAdminOrders()]);
  return <AdminDeliveryClient initialSettings={settings} orders={orders} />;
}
