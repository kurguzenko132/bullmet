import { AdminLaunchTestClient } from '@/components/AdminLaunchTestClient';
import { getAuditReport, getBackupOverview } from '@/lib/adminBackup';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Боевой тест запуска | Админка Bullmet' };

export default async function AdminLaunchTestPage() {
  const [overview, audit] = await Promise.all([
    getBackupOverview(),
    getAuditReport()
  ]);

  return <AdminLaunchTestClient initialOverview={overview} initialAudit={audit} />;
}
