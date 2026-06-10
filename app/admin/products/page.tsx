import { AdminProductsClient } from '@/components/AdminProductsClient';
import { getCatalogProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';

export default async function AdminProducts() {
  const products = await getCatalogProducts();
  return <AdminProductsClient initialProducts={products} />;
}
