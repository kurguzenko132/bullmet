import { NextRequest, NextResponse } from 'next/server';
import { logAdminActivity } from '@/lib/adminActivity';
import { serverSupabase } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!serverSupabase) return NextResponse.json({ ok: false, message: 'Supabase не подключен.' }, { status: 500 });

  try {
    const payload = await request.json();
    const { data: before, error: beforeError } = await serverSupabase.from('products').select('*').eq('id', id).maybeSingle();
    if (beforeError) return NextResponse.json({ ok: false, message: beforeError.message }, { status: 500 });
    if (!before) return NextResponse.json({ ok: false, message: 'Товар не найден.' }, { status: 404 });

    const { data, error } = await serverSupabase.from('products').update(payload).eq('id', id).select('*').single();
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

    const activityWarning = await logAdminActivity(request, {
      action: 'product_update', entity: 'products', entityId: id,
      before, after: data, payload: { changedFields: Object.keys(payload || {}) }
    });
    return NextResponse.json({ ok: true, product: data, warning: activityWarning ? `Товар сохранён, но запись в журнал не добавлена: ${activityWarning}` : undefined });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Не удалось обновить товар.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!serverSupabase) return NextResponse.json({ ok: false, message: 'Supabase не подключен.' }, { status: 500 });

  const { data: before, error: beforeError } = await serverSupabase.from('products').select('*').eq('id', id).maybeSingle();
  if (beforeError) return NextResponse.json({ ok: false, message: beforeError.message }, { status: 500 });
  if (!before) return NextResponse.json({ ok: false, message: 'Товар не найден.' }, { status: 404 });

  const { error } = await serverSupabase.from('products').delete().eq('id', id);
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  const activityWarning = await logAdminActivity(request, { action: 'product_delete', entity: 'products', entityId: id, before });
  return NextResponse.json({ ok: true, warning: activityWarning ? `Товар удалён, но запись в журнал не добавлена: ${activityWarning}` : undefined });
}
