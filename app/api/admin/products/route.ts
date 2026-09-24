import { NextRequest, NextResponse } from 'next/server';
import { logAdminActivity } from '@/lib/adminActivity';
import { serverSupabase } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!serverSupabase) return NextResponse.json({ ok: false, message: 'Supabase не подключен.' }, { status: 500 });

  try {
    const payload = await request.json();
    const { data, error } = await serverSupabase.from('products').insert(payload).select('*').single();
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

    const activityWarning = await logAdminActivity(request, {
      action: 'product_create', entity: 'products', entityId: data.id,
      after: data, payload: { changedFields: Object.keys(payload || {}) }
    });
    return NextResponse.json({ ok: true, product: data, warning: activityWarning ? `Товар сохранён, но запись в журнал не добавлена: ${activityWarning}` : undefined });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Не удалось сохранить товар.' }, { status: 500 });
  }
}
