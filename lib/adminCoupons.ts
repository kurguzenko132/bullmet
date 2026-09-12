import { serverSupabase } from './serverSupabase';

export type CouponType = 'percentage' | 'fixed' | 'free_shipping';
export type CouponStatus = 'active' | 'inactive' | 'archived';

export type AdminCoupon = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  type: CouponType;
  value?: number | null;
  max_discount?: number | null;
  status: CouponStatus;
  starts_at?: string | null;
  ends_at?: string | null;
  total_usage_limit?: number | null;
  usage_limit_per_customer?: number | null;
  minimum_order_amount?: number | null;
  first_order_only?: boolean;
  new_customers_only?: boolean;
  allow_discounted_products?: boolean;
  category_ids?: string[] | null;
  product_ids?: string[] | null;
  created_at?: string;
  updated_at?: string;
};

export type CouponUsage = {
  id: string;
  coupon_id: string;
  order_id: string;
  customer_id?: string | null;
  customer_name?: string | null;
  customer_key?: string | null;
  order_total?: number | null;
  discount_amount: number;
  created_at?: string;
};

export function couponCode(value: unknown) {
  return String(value || '').trim().toUpperCase().replace(/[^A-ZА-Я0-9_-]/g, '');
}

export function couponRuntimeStatus(coupon: AdminCoupon, now = new Date()) {
  if (coupon.status === 'archived') return 'archived';
  if (coupon.status === 'inactive') return 'inactive';
  if (coupon.starts_at && new Date(coupon.starts_at) > now) return 'scheduled';
  if (coupon.ends_at && new Date(coupon.ends_at) < now) return 'expired';
  return 'active';
}

export async function getAdminCoupons() {
  if (!serverSupabase) return { coupons: [] as AdminCoupon[], usages: [] as CouponUsage[] };
  const [couponResult, usageResult] = await Promise.all([
    serverSupabase.from('coupons').select('*').order('created_at', { ascending: false }).limit(500),
    serverSupabase.from('coupon_usages').select('*').order('created_at', { ascending: false }).limit(1000)
  ]);
  if (couponResult.error) console.error('Admin coupons load error:', couponResult.error.message);
  if (usageResult.error) console.error('Coupon usages load error:', usageResult.error.message);
  return { coupons: (couponResult.data || []) as AdminCoupon[], usages: (usageResult.data || []) as CouponUsage[] };
}

export function customerCouponKey(customer?: { phone?: string; email?: string; name?: string }) {
  const phone = String(customer?.phone || '').replace(/\D/g, '');
  const email = String(customer?.email || '').trim().toLowerCase();
  return phone ? `phone:${phone}` : email ? `email:${email}` : `guest:${String(customer?.name || '').trim().toLowerCase()}`;
}
