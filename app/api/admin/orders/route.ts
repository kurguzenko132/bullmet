import { NextResponse } from 'next/server';
import { getAdminOrders } from '@/lib/adminCommerce';
import { isSupabaseConfigured } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await getAdminOrders();
    return NextResponse.json({ ok: true, configured: isSupabaseConfigured(), orders });
  } catch (error) {
    return NextResponse.json({ ok: false, configured: isSupabaseConfigured(), orders: [], message: error instanceof Error ? error.message : 'Не удалось загрузить заказы.' }, { status: 500 });
  }
}
