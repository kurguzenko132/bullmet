import { NextRequest, NextResponse } from 'next/server';
import { getAdminCoupons } from '@/lib/adminCoupons';
import { getAdminReviews } from '@/lib/adminContent';
import { getAdminOrders } from '@/lib/adminCommerce';
import { buildAdminStats, type StatsCompare, type StatsPeriod } from '@/lib/adminStats';
import { getCatalogProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const period = (['today','7','30','90','year','custom'].includes(params.get('period') || '') ? params.get('period') : '30') as StatsPeriod;
  const compare = (['previous','year','none'].includes(params.get('compare') || '') ? params.get('compare') : 'previous') as StatsCompare;
  const [orders, products, reviews, couponData] = await Promise.all([getAdminOrders(), getCatalogProducts(), getAdminReviews(), getAdminCoupons()]);
  return NextResponse.json({ ok: true, stats: buildAdminStats({ orders, products, reviews, coupons: couponData.coupons, usages: couponData.usages, period, compare, from: params.get('from') || undefined, to: params.get('to') || undefined }) }, { headers: { 'Cache-Control': 'private, max-age=60' } });
}
