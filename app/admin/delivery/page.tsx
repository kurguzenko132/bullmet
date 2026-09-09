import { AdminCommerceSettingsClient } from '@/components/AdminCommerceSettingsClient';
import { getSiteControlSettings } from '@/lib/siteControl';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Доставка | Админка Bullmet' };

export default async function AdminDeliveryPage() {
  return <AdminCommerceSettingsClient initialSettings={await getSiteControlSettings()} mode="delivery" />;
}
