import { supabase } from './supabase';

export type ImageFit = 'cover' | 'contain';

export type ImageDisplayContext =
  | 'catalog'
  | 'product'
  | 'thumb'
  | 'variant'
  | 'related'
  | 'modal'
  | 'home';

export type ImageDisplaySettings = {
  catalogFit?: ImageFit;
  catalogX?: number;
  catalogY?: number;
  catalogZoom?: number;

  productFit?: ImageFit;
  productX?: number;
  productY?: number;
  productZoom?: number;

  thumbFit?: ImageFit;
  thumbX?: number;
  thumbY?: number;
  thumbZoom?: number;

  variantFit?: ImageFit;
  variantX?: number;
  variantY?: number;
  variantZoom?: number;

  relatedFit?: ImageFit;
  relatedX?: number;
  relatedY?: number;
  relatedZoom?: number;

  modalFit?: ImageFit;
  modalX?: number;
  modalY?: number;
  modalZoom?: number;

  homeFit?: ImageFit;
  homeX?: number;
  homeY?: number;
  homeZoom?: number;
};

export type ProductStatus = 'active' | 'draft' | 'hidden' | 'out_of_stock';

export type CatalogProduct = {
  id?: string;
  slug: string;
  title: string;
  category?: string;
  clockTheme?: string;
  material: string;
  short: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  images: string[];
  sizes: string[];
  specs: string[];
  status?: ProductStatus | string;
  seoTitle?: string;
  seoDescription?: string;
  sortOrder?: number;
  inStock: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  catalogImageFit?: ImageFit;
  catalogImagePosition?: string;
  productImageFit?: ImageFit;
  productImagePosition?: string;
  imageSettings?: Record<string, ImageDisplaySettings>;
  colorGroupId?: string;
  colorName?: string;
  colorHex?: string;
  rating?: number;
  reviewsCount?: number;
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
  {
    slug: 'nastennye-chasy-loft',
    title: 'Настенные часы Loft',
    material: 'Металл с элементами дерева',
    price: 120,
    oldPrice: 150,
    image: '/assets/prod-clock-loft.jpg',
    images: ['/assets/prod-clock-loft.jpg', '/assets/cat-clock.jpg', '/assets/gallery-4.jpg'],
    short: 'Металл с элементами дерева',
    description: 'Дизайнерские настенные часы Bullmet в стиле loft. Изготавливаем под заказ, можно подобрать размер, цвет и оформление.',
    category: 'Настенные часы',
    sizes: ['40 см', '60 см', '80 см'],
    specs: ['Размер: под заказ', 'Материал: металл с элементами дерева', 'Покрытие: порошковая покраска', 'Изготовление: Bullmet'],
    inStock: true,
    isPopular: true,
    colorName: 'Черный',
    colorHex: '#111111',
    productImageFit: 'contain',
    productImagePosition: 'center center'
  },
  {
    slug: 'sadovye-kacheli-bullmet',
    title: 'Садовые качели Bullmet',
    material: 'Металл с элементами дерева',
    price: 650,
    image: '/assets/prod-swing.jpg',
    images: ['/assets/prod-swing.jpg', '/assets/prod-swing-comfort.jpg', '/assets/cat-swing.jpg'],
    short: 'Прочная металлическая рама',
    description: 'Садовые качели с прочным металлическим каркасом и деревянными элементами. Возможны индивидуальные размеры.',
    category: 'Садовая мебель',
    sizes: ['160 см', '180 см', '200 см'],
    specs: ['Металлический каркас', 'Элементы дерева', 'Покраска в нужный цвет', 'Доставка по Беларуси'],
    inStock: true,
    isPopular: true
  },
  {
    slug: 'nastennye-chasy-classic',
    title: 'Настенные часы Classic',
    material: 'Металл',
    price: 140,
    image: '/assets/prod-clock-classic.jpg',
    images: ['/assets/prod-clock-classic.jpg', '/assets/gallery-4.jpg'],
    short: 'Классические настенные часы',
    description: 'Классические настенные часы из металла. Подойдут для дома, офиса, салона или подарка.',
    category: 'Настенные часы',
    sizes: ['40 см', '60 см', '80 см'],
    specs: ['Размер: под заказ', 'Материал: металл', 'Покрытие: порошковая покраска', 'Изготовление: Bullmet'],
    inStock: true
  },
  {
    slug: 'chasy-industrial',
    title: 'Часы Industrial',
    material: 'Металл с элементами дерева',
    price: 100,
    image: '/assets/cat-clock.jpg',
    images: ['/assets/cat-clock.jpg', '/assets/prod-clock-loft.jpg'],
    short: 'Индустриальный стиль',
    description: 'Настенные часы в индустриальном стиле с элементами дерева.',
    category: 'Настенные часы',
    sizes: ['50 см', '60 см', '70 см'],
    specs: ['Материал: металл с элементами дерева', 'Покрытие: порошковая покраска', 'Крепление в комплекте'],
    inStock: true
  },
  {
    slug: 'kacheli-garden-comfort',
    title: 'Качели Garden Comfort',
    material: 'Металл с элементами дерева',
    price: 700,
    image: '/assets/prod-swing-comfort.jpg',
    images: ['/assets/prod-swing-comfort.jpg', '/assets/prod-swing.jpg', '/assets/cat-swing.jpg'],
    short: 'Для дачи и сада',
    description: 'Удобные садовые качели для дачи и участка. Изготавливаем под нужный размер.',
    category: 'Садовая мебель',
    sizes: ['160 см', '180 см', '200 см'],
    specs: ['Прочная рама', 'Деревянные элементы', 'Покраска по каталогу', 'Доставка по Беларуси'],
    inStock: true
  },
  {
    slug: 'panno-derevo-zhizni',
    title: 'Панно “Дерево жизни”',
    material: 'Металл',
    price: 180,
    image: '/assets/cat-wood.jpg',
    images: ['/assets/cat-wood.jpg', '/assets/cat-custom.jpg', '/assets/gallery-6.jpg'],
    short: 'Художественная лазерная резка',
    description: 'Декоративное панно из листового металла. Можно изготовить по вашему эскизу.',
    category: 'Лазерная резка',
    sizes: ['Под заказ'],
    specs: ['Листовой металл', 'Художественная лазерная резка', 'Покраска по желанию'],
    inStock: true
  }
];

type RichProductRow = {
  id?: string;
  slug?: string | null;
  title?: string | null;
  category?: string | null;
  clock_theme?: string | null;
  material?: string | null;
  short?: string | null;
  description?: string | null;
  price?: number | string | null;
  old_price?: number | string | null;
  image?: string | null;
  images?: string[] | string | null;
  sizes?: string[] | string | null;
  specs?: string[] | string | null;
  status?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  sort_order?: number | string | null;
  is_popular?: boolean | null;
  is_new?: boolean | null;
  in_stock?: boolean | null;
  catalog_image_fit?: string | null;
  catalog_image_position?: string | null;
  product_image_fit?: string | null;
  product_image_position?: string | null;
  image_settings?: Record<string, ImageDisplaySettings> | string | null;
  color_group_id?: string | null;
  color_name?: string | null;
  color_hex?: string | null;
};

type LegacyProductRow = {
  id?: string;
  slug?: string | null;
  title?: string | null;
  material?: string | null;
  price?: number | string | null;
  old_price?: number | string | null;
  oldPrice?: number | string | null;
  image_url?: string | null;
  image?: string | null;
  description?: string | null;
  short?: string | null;
  status?: string | null;
  categories?: { title?: string | null } | null;
  category?: string | null;
  product_images?: { image_url?: string | null; sort_order?: number | null }[] | null;
};

function parseNumber(value: unknown, fallback = 0) {
  const number = Number(value ?? fallback);
  return Number.isFinite(number) ? number : fallback;
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((x) => x.trim()).filter(Boolean);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parseStringArray(parsed);
    } catch {}
    if (trimmed.includes(',')) return trimmed.split(',').map((x) => x.trim()).filter(Boolean);
    return [trimmed];
  }
  return [];
}

function parseImageSettings(value: unknown): Record<string, ImageDisplaySettings> | undefined {
  if (!value) return undefined;
  if (typeof value === 'object' && !Array.isArray(value)) return value as Record<string, ImageDisplaySettings>;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, ImageDisplaySettings>;
    } catch {}
  }
  return undefined;
}

function uniqueImages(images: Array<string | null | undefined>) {
  const seen = new Set<string>();
  return images
    .map((image) => String(image || '').trim())
    .filter(Boolean)
    .filter((image) => {
      if (seen.has(image)) return false;
      seen.add(image);
      return true;
    });
}

function normalizeFit(value: unknown, fallback: ImageFit): ImageFit {
  return value === 'contain' || value === 'cover' ? value : fallback;
}

function defaultSpecs(category?: string, material?: string) {
  const isClock = (category || '').toLowerCase().includes('час');
  if (isClock) {
    return [
      'Размер: под заказ',
      `Материал: ${material || 'металл с элементами дерева'}`,
      'Покрытие: порошковая покраска',
      'Крепление в комплекте'
    ];
  }

  return [
    'Индивидуальные размеры',
    `Материал: ${material || 'металл с элементами дерева'}`,
    'Покраска по согласованию',
    'Изготовление Bullmet'
  ];
}

function defaultSizes(category?: string) {
  const text = (category || '').toLowerCase();
  if (text.includes('кач') || text.includes('мебел')) return ['160 см', '180 см', '200 см'];
  if (text.includes('резк') || text.includes('гибк')) return ['По чертежу'];
  return ['40 см', '60 см', '80 см'];
}

function normalizeRichProduct(row: RichProductRow): CatalogProduct | null {
  if (!row.slug || !row.title) return null;

  const material = row.material || 'Металл с элементами дерева';
  const category = row.category || 'Каталог';
  const images = uniqueImages([row.image, ...parseStringArray(row.images)]);
  const mainImage = images[0] || '/assets/prod-clock-loft.jpg';
  const specs = parseStringArray(row.specs);
  const sizes = parseStringArray(row.sizes);
  const description = row.description || row.short || 'Товар Bullmet собственного изготовления.';

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category,
    clockTheme: row.clock_theme || undefined,
    material,
    short: row.short || material,
    description,
    price: parseNumber(row.price),
    oldPrice: row.old_price ? parseNumber(row.old_price) : undefined,
    image: mainImage,
    images: images.length ? images : [mainImage],
    sizes: sizes.length ? sizes : defaultSizes(category),
    specs: specs.length ? specs : defaultSpecs(category, material),
    status: (row.status || 'active') as ProductStatus,
    seoTitle: row.seo_title || undefined,
    seoDescription: row.seo_description || undefined,
    sortOrder: parseNumber(row.sort_order, 0),
    inStock: row.in_stock !== false && row.status !== 'draft' && row.status !== 'hidden' && row.status !== 'out_of_stock',
    isPopular: Boolean(row.is_popular),
    isNew: Boolean(row.is_new),
    catalogImageFit: normalizeFit(row.catalog_image_fit, 'cover'),
    catalogImagePosition: row.catalog_image_position || 'center center',
    productImageFit: row.product_image_fit === 'cover' ? 'contain' : normalizeFit(row.product_image_fit, 'contain'),
    productImagePosition: row.product_image_position || 'center center',
    imageSettings: parseImageSettings(row.image_settings),
    colorGroupId: row.color_group_id || undefined,
    colorName: row.color_name || undefined,
    colorHex: row.color_hex || undefined
  };
}

function normalizeLegacyProduct(row: LegacyProductRow): CatalogProduct | null {
  if (!row.slug || !row.title) return null;

  const sortedImages = Array.isArray(row.product_images)
    ? [...row.product_images].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map((item) => item.image_url)
    : [];

  const material = row.material || 'Металл с элементами дерева';
  const category = row.category || row.categories?.title || 'Каталог';
  const images = uniqueImages([row.image || row.image_url, row.image_url, ...sortedImages]);
  const mainImage = images[0] || '/assets/prod-clock-loft.jpg';
  const description = row.description || row.short || 'Товар Bullmet собственного изготовления.';

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category,
    material,
    short: row.short || material,
    description,
    price: parseNumber(row.price),
    oldPrice: row.old_price || row.oldPrice ? parseNumber(row.old_price ?? row.oldPrice) : undefined,
    image: mainImage,
    images: images.length ? images : [mainImage],
    sizes: defaultSizes(category),
    specs: defaultSpecs(category, material),
    status: (row.status || 'active') as ProductStatus,
    inStock: row.status !== 'draft' && row.status !== 'hidden' && row.status !== 'out_of_stock',
    productImageFit: 'contain',
    productImagePosition: 'center center',
    catalogImageFit: 'cover',
    catalogImagePosition: 'center center'
  };
}

async function fetchRichProducts(includeAll = false) {
  if (!supabase) return { data: null, error: new Error('Supabase is not configured') };
  let query = supabase
    .from('products')
    .select('id, slug, title, category, clock_theme, material, short, description, price, old_price, image, images, sizes, specs, status, seo_title, seo_description, sort_order, is_popular, is_new, in_stock, catalog_image_fit, catalog_image_position, product_image_fit, product_image_position, image_settings, color_group_id, color_name, color_hex, created_at');

  if (!includeAll) {
    query = query.not('status', 'in', '("draft","hidden")');
  }

  return query.order('sort_order', { ascending: true }).order('created_at', { ascending: false });
}

async function fetchLegacyProducts() {
  if (!supabase) return { data: null, error: new Error('Supabase is not configured') };
  return supabase
    .from('products')
    .select('id, slug, title, material, price, old_price, image_url, image, description, short, status, category, categories(title), product_images(image_url, sort_order)')
    .or('status.is.null,status.eq.active,status.eq.in_stock,status.eq.available')
    .order('created_at', { ascending: false });
}


export type ProductReviewStats = Record<string, { average: number; count: number }>;

export async function getProductReviewStats(slugs: string[]): Promise<ProductReviewStats> {
  const uniqueSlugs = Array.from(new Set(slugs.filter(Boolean)));
  if (!supabase || !uniqueSlugs.length) return {};

  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('product_slug, rating, status')
      .in('product_slug', uniqueSlugs)
      .eq('status', 'published');

    if (error || !data) return {};

    return data.reduce<ProductReviewStats>((acc, row: any) => {
      const slug = String(row.product_slug || '').trim();
      const rating = Number(row.rating || 0);
      if (!slug || !Number.isFinite(rating) || rating <= 0) return acc;
      const current = acc[slug] || { average: 0, count: 0 };
      const total = current.average * current.count + rating;
      const count = current.count + 1;
      acc[slug] = { average: total / count, count };
      return acc;
    }, {});
  } catch {
    return {};
  }
}


export function isPublicClockProduct(product: CatalogProduct) {
  const text = [product.title, product.slug, product.category, product.clockTheme].join(' ').toLowerCase();
  return text.includes('час') || Boolean(product.clockTheme);
}

export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  if (!supabase) return localFallbackProducts;

  const rich = await fetchRichProducts(false);
  if (!rich.error && rich.data) {
    const normalized = (rich.data as RichProductRow[]).map(normalizeRichProduct).filter(Boolean) as CatalogProduct[];
    if (normalized.length) return normalized;
  }

  const legacy = await fetchLegacyProducts();
  if (!legacy.error && legacy.data) {
    const normalized = (legacy.data as LegacyProductRow[]).map(normalizeLegacyProduct).filter(Boolean) as CatalogProduct[];
    if (normalized.length) return normalized;
  }

  console.error('Supabase products load failed:', rich.error?.message || legacy.error?.message);
  return localFallbackProducts;
}


export async function getAdminCatalogProducts(): Promise<CatalogProduct[]> {
  if (!supabase) return localFallbackProducts;

  const rich = await fetchRichProducts(true);
  if (!rich.error && rich.data) {
    const normalized = (rich.data as RichProductRow[]).map(normalizeRichProduct).filter(Boolean) as CatalogProduct[];
    if (normalized.length) return normalized;
  }

  const legacy = await fetchLegacyProducts();
  if (!legacy.error && legacy.data) {
    const normalized = (legacy.data as LegacyProductRow[]).map(normalizeLegacyProduct).filter(Boolean) as CatalogProduct[];
    if (normalized.length) return normalized;
  }

  return localFallbackProducts;
}

export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  const products = await getCatalogProducts();
  const product = products.find((item) => item.slug === slug) || null;
  return product && isPublicClockProduct(product) ? product : null;
}

export async function getProductPageData(slug: string): Promise<{ product: CatalogProduct | null; related: CatalogProduct[]; colorVariants: CatalogProduct[] }> {
  const products = (await getCatalogProducts()).filter(isPublicClockProduct);
  const product = products.find((item) => item.slug === slug) || null;
  if (!product) return { product: null, related: [], colorVariants: [] };

  const colorVariants = product.colorGroupId
    ? products.filter((item) => item.colorGroupId === product.colorGroupId)
    : [product, ...products.filter((item) => item.title === product.title && item.slug !== product.slug)];

  const related = products
    .filter((item) => item.slug !== product.slug)
    .sort((a, b) => {
      const sameCategoryA = a.category === product.category ? 0 : 1;
      const sameCategoryB = b.category === product.category ? 0 : 1;
      return sameCategoryA - sameCategoryB;
    })
    .slice(0, 4);

  return { product, related, colorVariants };
}
