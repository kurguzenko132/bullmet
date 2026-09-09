import { AdminDashboardClient } from '@/components/AdminDashboardClient';
import { getAdminOrders, getAdminRequests } from '@/lib/adminCommerce';
import { getAdminReviews } from '@/lib/adminContent';
import { getAdminActivityLog } from '@/lib/adminPeople';
import { getHomepageControlSettings } from '@/lib/homepageControl';
import { getAdminCatalogProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Главная | Админка Bullmet' };

export default async function AdminPage() {
  const [products, orders, requests, reviews, activity, homepage] = await Promise.all([
    getAdminCatalogProducts(),
    getAdminOrders(),
    getAdminRequests(),
    getAdminReviews(),
    getAdminActivityLog(),
    getHomepageControlSettings()
  ]);

  return <AdminDashboardClient
    products={products}
    orders={orders}
    requests={requests}
    reviews={reviews}
    activity={activity}
    homepage={homepage}
  />;
}
