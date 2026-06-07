import { supabase } from './supabase';

export type CatalogProduct = {
  id?: string;
  slug: string;
  title: string;
  material: string;
  price: number;
  image: string;
  description?: string;
  category?: string;
};

export const clockCatalogCategories = [
  'Авто-мир',
  'Барбершоп, парикмахерская',
  'Графика',
  'Детские',
  'Животные',
  'Классика',
  'Кофе и кухня',
  'Музыка',
  'Профессии',
  'Романтика',
  'Рыбалка, охота',
  'Спорт',
  'Христианские'
];

export const localFallbackProducts: CatalogProduct[] = [
  { slug: 'nastennye-chasy-loft', title: 'Настенные часы Loft', material: 'Металл с элементами дерева', price: 120, image: '/mockup/prod-clock-1.jpg', description: 'Металл с элементами дерева, диаметр 60 см, собственное изготовление.', category: 'Часы' },
  { slug: 'sadovye-kacheli-bullmet', title: 'Садовые качели Bullmet', material: 'Прочная металлическая рама', price: 650, image: '/mockup/prod-swing-1.jpg', description: 'Прочная металлическая рама, деревянное сиденье, под заказ.', category: 'Садовая мебель' },
  { slug: 'nastennye-chasy-classic', title: 'Настенные часы Classic', material: 'Металл', price: 140, image: '/mockup/prod-clock-2.jpg', description: 'Классические настенные часы собственного изготовления.', category: 'Часы' },
  { slug: 'chasy-industrial', title: 'Часы Industrial', material: 'Металл с элементами дерева', price: 100, image: '/mockup/cat-clock.jpg', description: 'Настенные часы в индустриальном стиле.', category: 'Часы' },
  { slug: 'kacheli-garden-comfort', title: 'Качели Garden Comfort', material: 'Для дачи и сада', price: 700, image: '/mockup/prod-swing-2.jpg', description: 'Садовые качели с металлическим каркасом.', category: 'Садовая мебель' },
  { slug: 'panno-derevo-zhizni', title: 'Панно “Дерево жизни”', material: 'Металл', price: 180, image: '/mockup/cat-wood.jpg', description: 'Декоративное панно из листового металла.', category: 'Лазерная резка' },
  { slug: 'reshetka-dekorativnaya', title: 'Решетка декоративная', material: 'Металл', price: 90, image: '/mockup/cat-custom.jpg', description: 'Декоративная металлическая решетка.', category: 'Лазерная резка' },
  { slug: 'nomer-doma-metallicheskiy', title: 'Номер дома металлический', material: 'Металл', price: 60, image: '/mockup/gallery-6.jpg', description: 'Металлический номер дома под заказ.', category: 'Лазерная резка' }
];

type ProductRow = {
  id?: string;
  slug?: string | null;
  title?: string | null;
  material?: string | null;
  price?: number | string | null;
  image_url?: string | null;
  description?: string | null;
  status?: string | null;
  categories?: { title?: string | null } | null;
  product_images?: { image_url?: string | null; sort_order?: number | null }[] | null;
};

function normalizeProduct(row: ProductRow): CatalogProduct | null {
  if (!row.slug || !row.title) return null;

  const sortedImages = Array.isArray(row.product_images)
    ? [...row.product_images].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    : [];

  const image = row.image_url || sortedImages.find((img) => Boolean(img.image_url))?.image_url || '/mockup/prod-clock-1.jpg';
  const parsedPrice = Number(row.price ?? 0);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    material: row.material || 'Металл с элементами дерева',
    price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
    image,
    description: row.description || '',
    category: row.categories?.title || 'Каталог'
  };
}

export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  if (!supabase) return localFallbackProducts;

  const { data, error } = await supabase
    .from('products')
    .select('id, slug, title, material, price, image_url, description, status, categories(title), product_images(image_url, sort_order)')
    .or('status.is.null,status.eq.active,status.eq.in_stock,status.eq.available')
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('Supabase products load failed:', error?.message);
    return localFallbackProducts;
  }

  const normalized = (data as ProductRow[]).map(normalizeProduct).filter(Boolean) as CatalogProduct[];
  return normalized.length ? normalized : localFallbackProducts;
}

export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  if (!supabase) return localFallbackProducts.find((product) => product.slug === slug) || null;

  const { data, error } = await supabase
    .from('products')
    .select('id, slug, title, material, price, image_url, description, status, categories(title), product_images(image_url, sort_order)')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) {
    console.error('Supabase product load failed:', error?.message);
    return localFallbackProducts.find((product) => product.slug === slug) || null;
  }

  return normalizeProduct(data as ProductRow);
}
