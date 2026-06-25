import { AdminHomepageClient } from '@/components/AdminHomepageClient';
import { getHomepageControlSettings } from '@/lib/homepageControl';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Главная страница | Админка Bullmet' };

export default async function AdminHomepage() {
  const settings = await getHomepageControlSettings();
  return <AdminHomepageClient initialSettings={settings} />;
}
