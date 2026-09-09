import { AdminCommerceSettingsClient } from '@/components/AdminCommerceSettingsClient';
import { getSiteControlSettings } from '@/lib/siteControl';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Оплата | Админка Bullmet' };

export default async function AdminPaymentPage() {
  return <AdminCommerceSettingsClient initialSettings={await getSiteControlSettings()} mode="payment" />;
}
