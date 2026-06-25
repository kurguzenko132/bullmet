import { NextRequest, NextResponse } from 'next/server';
import { getExportData, toCsv, type ExportType } from '@/lib/adminBackup';

export const dynamic = 'force-dynamic';

const exportTypes: ExportType[] = ['all', 'products', 'orders', 'requests', 'reviews', 'users', 'activity', 'settings', 'categories', 'banners'];

function safeType(value: string | null): ExportType {
  return exportTypes.includes(value as ExportType) ? value as ExportType : 'all';
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const type = safeType(url.searchParams.get('type'));
    const format = url.searchParams.get('format') === 'csv' ? 'csv' : 'json';
    const data = await getExportData(type);

    if (format === 'csv') {
      const csv = toCsv(data);
      return new NextResponse('\ufeff' + csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="bullmet-${type}-${timestamp()}.csv"`
        }
      });
    }

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="bullmet-${type}-${timestamp()}.json"`
      }
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Не удалось выполнить экспорт.' }, { status: 500 });
  }
}
