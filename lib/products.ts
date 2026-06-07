import { getPublicStorageUrl, isSupabaseConfigured, supabase } from './supabase';

export type CatalogProduct = {
  id?: string;
  slug: string;
  title: string;
  material: string;
  price: number;
  image: string;
  images?: string[];
  description?: string;
  category?: string;
  status?: string;
  isPopular?: boolean;
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

type ProductRow = Record<string, any>;

function isHiddenStatus(status?: string | null) {
  if (!status) return false;
  return ['draft', 'hidden', 'archived', 'deleted', 'inactive'].includes(String(status).toLowerCase());
}

function arrayFromUnknown(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
    } catch {
      return value ? [value] : [];
    }
  }
  return [];
}

function normalizeProduct(row: ProductRow): CatalogProduct | null {
  if (!row?.slug || !row?.title) return null;

  const galleryFromArray = arrayFromUnknown(row.images);
  const galleryFromRelation = Array.isArray(row.product_images)
    ? [...row.product_images]
        .sort((a, b) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0))
        .map((img) => img?.image_url)
        .filter(Boolean)
        .map(String)
    : [];

  const rawImages = [
    row.image,
    row.image_url,
    row.cover,
    ...galleryFromArray,
    ...galleryFromRelation
  ].filter(Boolean).map(String);

  const images = rawImages.map((src) => getPublicStorageUrl(src)).filter(Boolean);
  const parsedPrice = Number(row.price ?? 0);
  const category =
    row.category ||
    row.clock_theme ||
    row.categories?.title ||
    row.category_title ||
    'Каталог';

  return {
    id: row.id,
    slug: String(row.slug),
    title: String(row.title),
    material: String(row.material || row.short || 'Металл с элементами дерева'),
    price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
    image: images[0] || '/mockup/prod-clock-1.jpg',
    images,
    description: String(row.description || row.short || ''),
    category: String(category),
    status: row.status ? String(row.status) : undefined,
    isPopular: Boolean(row.is_popular || row.isPopular)
  };
}

async function loadProductsOldSchema() {
  if (!supabase) return { products: [] as CatalogProduct[], error: 'Supabase is not configured' };

  const { data, error } = await supabase
    .from('products')
    .select('id, slug, title, category, clock_theme, material, short, description, price, image, images, status, is_popular, created_at')
    .order('created_at', { ascending: false });

  if (error) return { products: [] as CatalogProduct[], error: error.message };

  const products = (data || [])
    .map(normalizeProduct)
    .filter(Boolean)
    .filter((product) => !isHiddenStatus(product?.status)) as CatalogProduct[];

  return { products, error: null };
}

async function loadProductsStarterSchema() {
  if (!supabase) return { products: [] as CatalogProduct[], error: 'Supabase is not configured' };

  const { data, error } = await supabase
    .from('products')
    .select('id, slug, title, material, price, image_url, cover, description, status, created_at')
    .order('created_at', { ascending: false });

  if (error) return { products: [] as CatalogProduct[], error: error.message };

  const rows = data || [];
  const ids = rows.map((row) => row.id).filter(Boolean);
  let imageMap = new Map<string, { image_url?: string | null; sort_order?: number | null }[]>();

  if (ids.length) {
    const { data: imageRows } = await supabase
      .from('product_images')
      .select('product_id, image_url, sort_order')
      .in('product_id', ids);

    (imageRows || []).forEach((img) => {
      const list = imageMap.get(img.product_id) || [];
      list.push({ image_url: img.image_url, sort_order: img.sort_order });
      imageMap.set(img.product_id, list);
    });
  }

  const products = rows
    .map((row) => normalizeProduct({ ...row, product_images: imageMap.get(row.id) || [] }))
    .filter(Boolean)
    .filter((product) => !isHiddenStatus(product?.status)) as CatalogProduct[];

  return { products, error: null };
}

export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase environment variables are missing. Local fallback products are shown.');
    return localFallbackProducts;
  }

  const oldSchema = await loadProductsOldSchema();
  if (oldSchema.products.length || !oldSchema.error) {
    return oldSchema.products.length ? oldSchema.products : localFallbackProducts;
  }

  const starterSchema = await loadProductsStarterSchema();
  if (starterSchema.products.length || !starterSchema.error) {
    return starterSchema.products.length ? starterSchema.products : localFallbackProducts;
  }

  console.error('Supabase products load failed:', oldSchema.error, starterSchema.error);
  return localFallbackProducts;
}

export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  if (!isSupabaseConfigured || !supabase) {
    return localFallbackProducts.find((product) => product.slug === slug) || null;
  }

  const { data: oldData, error: oldError } = await supabase
    .from('products')
    .select('id, slug, title, category, clock_theme, material, short, description, price, image, images, status, is_popular, created_at')
    .eq('slug', slug)
    .maybeSingle();

  if (!oldError && oldData) return normalizeProduct(oldData);

  const { data: starterData, error: starterError } = await supabase
    .from('products')
    .select('id, slug, title, material, price, image_url, cover, description, status, created_at')
    .eq('slug', slug)
    .maybeSingle();

  if (!starterError && starterData) return normalizeProduct(starterData);

  console.error('Supabase product load failed:', oldError?.message, starterError?.message);
  return localFallbackProducts.find((product) => product.slug === slug) || null;
}
