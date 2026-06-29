import { AdminBackupClient } from '@/components/AdminBackupClient';
import { getBackupOverview } from '@/lib/adminBackup';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Экспорт данных | Админка Bullmet' };

export default async function AdminBackupPage() {
  const overview = await getBackupOverview();

  return <AdminBackupClient initialOverview={overview} />;
}
