import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabase';
import { getServerAdminAccess } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const access = await getServerAdminAccess(request);
  if (!access) return NextResponse.json({ ok: false, message: 'Требуется авторизация.' }, { status: 401 });
  if (access.role !== 'admin') return NextResponse.json({ ok: false, message: 'Недостаточно прав.' }, { status: 403 });
  if (!serverSupabase) {
    return NextResponse.json({ configured: false });
  }

  const { error } = await serverSupabase.from('products').select('id', { count: 'exact', head: true }).limit(1);
  return NextResponse.json({
    configured: true,
    productsTableReadable: !error,
    error: error ? 'Products table is unavailable.' : null
  });
}
