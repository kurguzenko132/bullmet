import { AdminBackupClient } from '@/components/AdminBackupClient';
import { getBackupDashboard } from '@/lib/adminBackup';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Резервное копирование | Админка Bullmet' };

export default async function AdminBackupPage() {
  const dashboard = await getBackupDashboard();

  return <AdminBackupClient initialDashboard={dashboard} />;
}
