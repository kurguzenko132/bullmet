import { NextRequest, NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/couponValidation';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const result = await validateCoupon({ code: body.code, items: Array.isArray(body.items) ? body.items : [], customer: body.customer, delivery: body.delivery });
  return NextResponse.json({
    ok: result.ok,
    code: result.coupon?.code,
    discount: result.discount,
    deliveryDiscount: Boolean(result.deliveryDiscount),
    isEstimate: result.ok,
    message: result.ok ? `${result.message} Окончательная сумма будет подтверждена при оформлении.` : result.message
  }, { status: result.ok ? 200 : 400 });
}
