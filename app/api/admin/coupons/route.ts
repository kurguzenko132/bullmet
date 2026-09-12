import { NextRequest, NextResponse } from 'next/server';
import { couponCode, getAdminCoupons } from '@/lib/adminCoupons';
import { serverSupabase } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';

function stringList(value: unknown) { return Array.isArray(value) ? value.map(String).filter(Boolean) : []; }
function normalized(body: any) {
  const type = ['percentage', 'fixed', 'free_shipping'].includes(body?.type) ? body.type : 'percentage';
  return { name: String(body?.name || '').trim(), code: couponCode(body?.code), description: String(body?.description || '').trim(), type, value: type === 'free_shipping' ? null : Math.max(0, Number(body?.value || 0)), max_discount: body?.max_discount ? Math.max(0, Number(body.max_discount)) : null, status: ['active','inactive','archived'].includes(body?.status) ? body.status : 'inactive', starts_at: body?.starts_at || null, ends_at: body?.ends_at || null, total_usage_limit: body?.total_usage_limit ? Math.max(1, Number(body.total_usage_limit)) : null, usage_limit_per_customer: body?.usage_limit_per_customer ? Math.max(1, Number(body.usage_limit_per_customer)) : null, minimum_order_amount: body?.minimum_order_amount ? Math.max(0, Number(body.minimum_order_amount)) : null, first_order_only: Boolean(body?.first_order_only), new_customers_only: Boolean(body?.new_customers_only), allow_discounted_products: Boolean(body?.allow_discounted_products), category_ids: stringList(body?.category_ids), product_ids: stringList(body?.product_ids) }; }

export async function GET() { const data = await getAdminCoupons(); return NextResponse.json({ ok: true, ...data }); }

export async function POST(request: NextRequest) {
  if (!serverSupabase) return NextResponse.json({ ok:false, message:'Supabase не подключён.' }, { status:500 });
  const data = normalized(await request.json().catch(() => ({})));
  if (!data.name || !data.code) return NextResponse.json({ ok:false, message:'Укажите название и уникальный промокод.' }, { status:400 });
  if (data.type === 'percentage' && (data.value || 0) > 100) return NextResponse.json({ ok:false, message:'Процент скидки не может быть больше 100.' }, { status:400 });
  const { data: coupon, error } = await serverSupabase.from('coupons').insert(data).select('*').single();
  if (error) return NextResponse.json({ ok:false, message:error.code === '23505' ? 'Этот промокод уже существует.' : error.message }, { status:409 });
  await serverSupabase.from('admin_activity_log').insert({ action:'coupon_create', entity:'coupons', entity_id:coupon.id, payload:{ code:coupon.code } }).then(() => null);
  return NextResponse.json({ ok:true, coupon });
}
