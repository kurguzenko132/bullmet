import { AdminReportsClient } from '@/components/AdminReportsClient';
import { getAdminOrders } from '@/lib/adminCommerce';
import { getAdminCatalogProducts } from '@/lib/products';
import { getAdminReviews } from '@/lib/adminContent';
import { getAdminCoupons } from '@/lib/adminCoupons';
import { getAdminProfiles } from '@/lib/adminPeople';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Отчеты | Админка Bullmet' };

export default async function AdminReportsPage() {
  const [orders, products, reviews, couponData, profiles] = await Promise.all([
    getAdminOrders(),
    getAdminCatalogProducts(),
    getAdminReviews(),
    getAdminCoupons(),
    getAdminProfiles(),
  ]);

  return <AdminReportsClient orders={orders} products={products} reviews={reviews} coupons={couponData.coupons} usages={couponData.usages} profiles={profiles} />;
}
