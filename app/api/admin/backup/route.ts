import { NextResponse } from 'next/server';
import { getBackupOverview } from '@/lib/adminBackup';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const overview = await getBackupOverview();

    return NextResponse.json({ ok: true, overview });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Не удалось собрать данные резервного копирования.' }, { status: 500 });
  }
}
