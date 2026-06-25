import { AdminBackupClient } from '@/components/AdminBackupClient';
import { getAuditReport, getBackupOverview } from '@/lib/adminBackup';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Резервные копии и аудит | Админка Bullmet' };

export default async function AdminBackupPage() {
  const [overview, audit] = await Promise.all([
    getBackupOverview(),
    getAuditReport()
  ]);

  return <AdminBackupClient initialOverview={overview} initialAudit={audit} />;
}
