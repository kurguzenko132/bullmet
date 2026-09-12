import { AdminCouponsClient } from '@/components/AdminCouponsClient';
import { getAdminCoupons } from '@/lib/adminCoupons';
import { getCatalogControlSettings } from '@/lib/catalogControl';
import { getAdminCatalogProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Купоны и скидки | Админка Bullmet' };

export default async function AdminCouponsPage() {
  const [{ coupons, usages }, catalog, products] = await Promise.all([
    getAdminCoupons(),
    getCatalogControlSettings(),
    getAdminCatalogProducts()
  ]);

  return (
    <AdminCouponsClient
      initialCoupons={coupons}
      initialUsages={usages}
      categories={catalog.categories.map((category) => ({ id: category.slug, title: category.title }))}
      products={products.map((product) => ({ id: product.slug, title: product.title }))}
    />
  );
}
