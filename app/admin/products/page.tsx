import { AdminProductsClient } from '@/components/AdminProductsClient';
import { getAdminCatalogProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';

export default async function AdminProducts() {
  const products = await getAdminCatalogProducts();
  return <AdminProductsClient initialProducts={products} />;
}
