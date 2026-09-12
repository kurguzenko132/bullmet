import { serverSupabase } from './serverSupabase';
import { couponCode, couponRuntimeStatus, customerCouponKey, type AdminCoupon, type CouponUsage } from './adminCoupons';

export type CouponCartItem = { productId?: string; slug?: string; price?: number; quantity?: number; oldPrice?: number };

export type CouponCheck = { ok: boolean; message: string; coupon?: AdminCoupon; subtotal?: number; discount?: number; deliveryDiscount?: number; customerKey?: string };

const qualifyingStatuses = ['Оплачен', 'Передан в доставку', 'Выполнен'];

export async function validateCoupon(input: { code: unknown; items: CouponCartItem[]; customer?: { name?: string; phone?: string; email?: string }; delivery?: string; excludeOrderId?: string }) : Promise<CouponCheck> {
  const code = couponCode(input.code);
  if (!code) return { ok: false, message: 'Введите промокод.' };
  if (!serverSupabase) return { ok: false, message: 'Проверка промокода временно недоступна.' };
  const { data: rawCoupon, error } = await serverSupabase.from('coupons').select('*').eq('code', code).maybeSingle();
  if (error || !rawCoupon) return { ok: false, message: 'Промокод не найден.' };
  const coupon = rawCoupon as AdminCoupon;
  const runtime = couponRuntimeStatus(coupon);
  if (runtime === 'archived' || runtime === 'inactive') return { ok: false, message: 'Промокод больше не действует.' };
  if (runtime === 'scheduled') return { ok: false, message: 'Промокод ещё не активен.' };
  if (runtime === 'expired') return { ok: false, message: 'Срок действия промокода истёк.' };
  const subtotal = input.items.reduce((sum, item) => sum + Math.max(0, Number(item.price || 0)) * Math.max(1, Number(item.quantity || 1)), 0);
  if (coupon.minimum_order_amount && subtotal < Number(coupon.minimum_order_amount)) return { ok: false, message: `Минимальная сумма заказа — ${Number(coupon.minimum_order_amount)} BYN.` };
  const ids = input.items.flatMap((item) => [item.productId, item.slug]).filter(Boolean).map(String);
  if (coupon.product_ids?.length && !coupon.product_ids.some((id) => ids.includes(id))) return { ok: false, message: 'Промокод не действует на выбранные товары.' };
  if (coupon.category_ids?.length) return { ok: false, message: 'Промокод действует только на выбранные категории.' };
  const { data: usages } = await serverSupabase.from('coupon_usages').select('*').eq('coupon_id', coupon.id);
  const allUsages = ((usages || []) as CouponUsage[]).filter((usage) => usage.order_id !== input.excludeOrderId);
  if (coupon.total_usage_limit && allUsages.length >= coupon.total_usage_limit) return { ok: false, message: 'Лимит использований исчерпан.' };
  const customerKey = customerCouponKey(input.customer);
  if (coupon.usage_limit_per_customer && allUsages.filter((usage) => usage.customer_key === customerKey).length >= coupon.usage_limit_per_customer) return { ok: false, message: 'Промокод уже использован вами.' };
  if (coupon.new_customers_only || coupon.first_order_only) {
    const { data: orders } = await serverSupabase.from('orders').select('id,customer,status').in('status', qualifyingStatuses);
    const previous = (orders || []).filter((order: any) => customerCouponKey(order.customer) === customerKey && order.id !== input.excludeOrderId);
    if (previous.length) return { ok: false, message: coupon.first_order_only ? 'Промокод действует только на первый заказ.' : 'Промокод доступен только новым клиентам.' };
  }
  const eligible = coupon.allow_discounted_products ? subtotal : input.items.filter((item) => !item.oldPrice || Number(item.oldPrice) <= Number(item.price)).reduce((sum, item) => sum + Math.max(0, Number(item.price || 0)) * Math.max(1, Number(item.quantity || 1)), 0);
  if (!eligible && coupon.type !== 'free_shipping') return { ok: false, message: 'Промокод не действует на выбранные товары.' };
  const discount = coupon.type === 'percentage' ? Math.min(eligible * Number(coupon.value || 0) / 100, Number(coupon.max_discount || Infinity)) : coupon.type === 'fixed' ? Math.min(eligible, Number(coupon.value || 0)) : 0;
  return { ok: true, message: coupon.type === 'free_shipping' ? 'Бесплатная доставка применена.' : `Скидка ${Math.round(discount)} BYN применена.`, coupon, subtotal, discount: Math.round(discount * 100) / 100, deliveryDiscount: coupon.type === 'free_shipping' ? 1 : 0, customerKey };
}
