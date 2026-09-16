import { AdminHomepageClient } from '@/components/AdminHomepageClient';
import { getHomepageControlSettings } from '@/lib/homepageControl';
import { getAdminReviews } from '@/lib/adminContent';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Главная страница | Админка Bullmet' };

export default async function AdminHomepage() {
  const [settings, reviews] = await Promise.all([getHomepageControlSettings(), getAdminReviews()]);
  return <AdminHomepageClient initialSettings={settings} reviews={reviews} />;
}
