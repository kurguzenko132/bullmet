import { NextRequest, NextResponse } from 'next/server';
import { createBackup, createBackupDownloadUrl, deleteBackup, getBackupDashboard, updateBackupRecord, updateBackupSettings, type BackupKind } from '@/lib/adminBackup';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dashboard = await getBackupDashboard();

    return NextResponse.json({ ok: true, dashboard });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Не удалось собрать данные резервного копирования.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const action = String(body.action || '');

    if (action === 'create') {
      const kind = String(body.kind || 'full');
      if (!['full', 'database', 'media'].includes(kind)) {
        return NextResponse.json({ ok: false, message: 'Некорректный тип резервной копии.' }, { status: 400 });
      }
      const record = await createBackup({ kind: kind as BackupKind, comment: typeof body.comment === 'string' ? body.comment : undefined });
      return NextResponse.json({ ok: true, record, message: 'Резервная копия создана и сохранена в закрытом хранилище.' });
    }

    if (action === 'settings') {
      const settings = await updateBackupSettings({
        enabled: typeof body.enabled === 'boolean' ? body.enabled : undefined,
        frequency: body.frequency === 'weekly' ? 'weekly' : body.frequency === 'daily' ? 'daily' : undefined,
        time: typeof body.time === 'string' ? body.time : undefined,
        retentionCount: typeof body.retentionCount === 'number' ? body.retentionCount : undefined
      });
      return NextResponse.json({ ok: true, settings, message: 'Настройки резервного копирования сохранены.' });
    }

    if (action === 'download') {
      const signedUrl = await createBackupDownloadUrl(String(body.id || ''));
      return NextResponse.json({ ok: true, signedUrl });
    }

    if (action === 'protect') {
      const record = await updateBackupRecord(String(body.id || ''), { protected: Boolean(body.protected) });
      return NextResponse.json({ ok: true, record, message: record.protected ? 'Копия защищена от очистки.' : 'Защита копии отключена.' });
    }

    if (action === 'delete') {
      await deleteBackup(String(body.id || ''));
      return NextResponse.json({ ok: true, message: 'Резервная копия удалена.' });
    }

    if (action === 'restore') {
      return NextResponse.json({ ok: false, message: 'Восстановление доступно только через контролируемую серверную процедуру с отдельным подтверждением администратора системы.' }, { status: 409 });
    }

    return NextResponse.json({ ok: false, message: 'Неизвестное действие.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Операция с резервной копией не выполнена.' }, { status: 500 });
  }
}
