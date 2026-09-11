import { AdminCategoriesClient } from '@/components/AdminCategoriesClient';
import { getCatalogControlSettings } from '@/lib/catalogControl';
import { getAdminCatalogProducts } from '@/lib/products';
import { isSupabaseConfigured } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Категории | Админка Bullmet' };

export default async function AdminCategoriesPage() {
  const [settings, products] = await Promise.all([getCatalogControlSettings(), getAdminCatalogProducts()]);
  return <AdminCategoriesClient initialSettings={settings} initialProducts={products} supabaseConfigured={isSupabaseConfigured()} />;
}
