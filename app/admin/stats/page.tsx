import { AdminStatsClient } from '@/components/AdminStatsClient';
import { getAdminCoupons } from '@/lib/adminCoupons';
import { getAdminReviews } from '@/lib/adminContent';
import { getAdminOrders } from '@/lib/adminCommerce';
import { buildAdminStats } from '@/lib/adminStats';
import { getCatalogProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Статистика | Админка Bullmet' };

export default async function AdminStats() {
  const [orders, products, reviews, couponData] = await Promise.all([getAdminOrders(), getCatalogProducts(), getAdminReviews(), getAdminCoupons()]);
  const initialStats = buildAdminStats({ orders, products, reviews, coupons: couponData.coupons, usages: couponData.usages, period: '30', compare: 'previous' });
  return <AdminStatsClient initialStats={initialStats} />;
}
