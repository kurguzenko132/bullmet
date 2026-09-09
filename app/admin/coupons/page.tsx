import { AdminCommerceSettingsClient } from '@/components/AdminCommerceSettingsClient';
import { getSiteControlSettings } from '@/lib/siteControl';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Купоны и скидки | Админка Bullmet' };

export default async function AdminCouponsPage() {
  return <AdminCommerceSettingsClient initialSettings={await getSiteControlSettings()} mode="coupons" />;
}
