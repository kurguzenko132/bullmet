import { NextResponse } from 'next/server';
import { getAuditReport, getBackupOverview } from '@/lib/adminBackup';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [overview, audit] = await Promise.all([
      getBackupOverview(),
      getAuditReport()
    ]);

    return NextResponse.json({ ok: true, overview, audit });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Не удалось собрать данные резервного копирования.' }, { status: 500 });
  }
}
