'use client';

import type { Product } from './shopData';
import { clockCategory, products as baseProducts } from './shopData';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { type ImageDisplaySettings } from '../lib/imageDisplay';

export type AdminProduct = Product & {
  status?: 'active' | 'draft';
  isPopular?: boolean;
  isNew?: boolean;
  inStock?: boolean;
};

export const ADMIN_PRODUCTS_KEY = 'bullmet-admin-products';

function withTimeout<T>(promise: PromiseLike<T>, ms = 6500, label = 'Операция заняла слишком много времени'): Promise<T> {
  return Promise.race<T>([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => window.setTimeout(() => reject(new Error(label)), ms)),
  ]);
}

export function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[а-яё]/g, (char) => {
      const map: Record<string, string> = {
        а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
      };
      return map[char] ?? char;
    })
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `product-${Date.now()}`;
}


export async function makeUniqueProductSlug(baseSlug: string, currentSlug?: string): Promise<string> {
  const safeBase = makeSlug(baseSlug || `product-${Date.now()}`);
  try {
    let items: Pick<AdminProduct, 'slug'>[] = [];

    if (isSupabaseConfigured && supabase) {
      const result = await withTimeout<{ data: { slug: string }[] | null; error: { message?: string } | null }>(
        supabase.from('products').select('slug') as unknown as PromiseLike<{ data: { slug: string }[] | null; error: { message?: string } | null }>,
        6500,
        'Supabase долго не отвечает при проверке уникальности товара'
      );
      if (result.error) throw result.error;
      items = Array.isArray(result.data) ? result.data : [];
    } else {
      items = readAdminProducts();
    }

    const used = new Set(
      items
        .map((item) => item.slug)
        .filter((slug) => slug && slug !== currentSlug)
    );

    if (!used.has(safeBase)) return safeBase;

    let counter = 2;
    let nextSlug = `${safeBase}-${counter}`;
    while (used.has(nextSlug)) {
      counter += 1;
      nextSlug = `${safeBase}-${counter}`;
    }
    return nextSlug;
  } catch (error) {
    console.warn('Unique slug check failed, using timestamp fallback:', error);
    return `${safeBase}-${Date.now()}`;
  }
}

export function withAdminDefaults(product: Product): AdminProduct {
  return {
    ...product,
    status: 'active',
    isPopular: ['wall-clock-loft', 'garden-swing-bullmet', 'wooden-tree-panel'].includes(product.slug),
    isNew: false,
    inStock: true,
    catalogImageFit: product.catalogImageFit ?? 'cover',
    catalogImagePosition: product.catalogImagePosition ?? 'center center',
    productImageFit: product.productImageFit ?? 'cover',
    productImagePosition: product.productImagePosition ?? 'center center',
    imageSettings: product.imageSettings ?? {},
    variants: [],
    colorGroupId: product.colorGroupId ?? '',
    colorName: product.colorName ?? '',
    colorHex: product.colorHex ?? '#111111',
  };
}

export function initialAdminProducts(): AdminProduct[] {
  return baseProducts.map(withAdminDefaults);
}

function productFromDb(row: any): AdminProduct {
  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
    clockTheme: row.clock_theme ?? '',
    material: row.material,
    short: row.short ?? '',
    description: row.description ?? '',
    price: Number(row.price ?? 0),
    oldPrice: row.old_price === null || row.old_price === undefined ? undefined : Number(row.old_price),
    image: row.image ?? '/assets/cat-clock.jpg',
    images: Array.isArray(row.images) && row.images.length ? row.images : [row.image ?? '/assets/cat-clock.jpg'],
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
    specs: Array.isArray(row.specs) ? row.specs : [],
    status: row.status === 'draft' ? 'draft' : 'active',
    isPopular: Boolean(row.is_popular),
    isNew: Boolean(row.is_new),
    inStock: row.in_stock !== false,
    catalogImageFit: row.catalog_image_fit === 'contain' ? 'contain' : 'cover',
    catalogImagePosition: row.catalog_image_position || 'center center',
    productImageFit: row.product_image_fit === 'contain' ? 'contain' : 'cover',
    productImagePosition: row.product_image_position || 'center center',
    imageSettings: row.image_settings && typeof row.image_settings === 'object' ? row.image_settings as Record<string, ImageDisplaySettings> : {},
    variants: [],
    colorGroupId: row.color_group_id ?? '',
    colorName: row.color_name ?? '',
    colorHex: row.color_hex ?? '#111111',
  };
}

function productToDb(product: AdminProduct) {
  return {
    slug: product.slug,
    title: product.title,
    category: product.category,
    clock_theme: product.category === clockCategory ? (product.clockTheme || null) : null,
    material: product.material,
    short: product.short,
    description: product.description,
    price: product.price,
    old_price: product.oldPrice ?? null,
    image: product.image,
    images: product.images ?? [product.image],
    sizes: product.sizes ?? [],
    specs: product.specs ?? [],
    status: product.status ?? 'active',
    is_popular: Boolean(product.isPopular),
    is_new: Boolean(product.isNew),
    in_stock: product.inStock !== false,
    catalog_image_fit: product.catalogImageFit ?? 'cover',
    catalog_image_position: product.catalogImagePosition ?? 'center center',
    product_image_fit: product.productImageFit ?? 'cover',
    product_image_position: product.productImagePosition ?? 'center center',
    image_settings: product.imageSettings ?? {},
    variants: [],
    color_group_id: product.colorGroupId || null,
    color_name: product.colorName || null,
    color_hex: product.colorHex || null,
  };
}

export function readAdminProducts(): AdminProduct[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(ADMIN_PRODUCTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function readAdminProductsAsync(): Promise<AdminProduct[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      const result = await withTimeout<{ data: unknown[] | null; error: { message?: string } | null }>(
        query as unknown as PromiseLike<{ data: unknown[] | null; error: { message?: string } | null }>,
        6500,
        'Supabase долго не отвечает при загрузке товаров'
      );
      if (result.error) throw result.error;
      return Array.isArray(result.data) ? result.data.map(productFromDb) : [];
    } catch (error) {
      console.warn('Supabase products read failed. Returning empty list to avoid stale demo products:', error);
      return [];
    }
  }
  return readAdminProducts();
}

export function writeAdminProducts(items: AdminProduct[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('bullmet-products-updated'));
}

export function saveAdminProduct(product: AdminProduct) {
  const items = readAdminProducts();
  const index = items.findIndex((item) => item.slug === product.slug);
  const next = index >= 0 ? items.map((item) => item.slug === product.slug ? product : item) : [product, ...items];
  writeAdminProducts(next);
  return product;
}

export async function saveAdminProductAsync(product: AdminProduct) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('products')
        .upsert(productToDb(product), { onConflict: 'slug' });
      if (error) throw error;
    } catch (error) {
      console.warn('Supabase save product fallback to localStorage:', error);
    }
  }
  return saveAdminProduct(product);
}

export function deleteAdminProduct(slug: string) {
  writeAdminProducts(readAdminProducts().filter((item) => item.slug !== slug));
}

export async function deleteAdminProductAsync(slug: string) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('products').delete().eq('slug', slug);
      if (error) throw error;
    } catch (error) {
      console.warn('Supabase delete product fallback to localStorage:', error);
    }
  }
  deleteAdminProduct(slug);
}

export function productFromForm(formData: FormData, old?: AdminProduct): AdminProduct {
  const title = String(formData.get('title') || '').trim() || 'Новый товар Bullmet';
  const slug = old?.slug || makeSlug(title);
  const price = Number(formData.get('price')) || 0;
  const oldPriceRaw = Number(formData.get('oldPrice'));
  const image = String(formData.get('image') || '').trim() || '/assets/cat-clock.jpg';
  const extraImages = String(formData.get('images') || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
  const sizes = String(formData.get('sizes') || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const specs = String(formData.get('specs') || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    slug,
    title,
    category: String(formData.get('category') || 'Изделия на заказ'),
    clockTheme: String(formData.get('clockTheme') || '').trim(),
    material: String(formData.get('material') || 'Металл + дерево'),
    short: String(formData.get('short') || 'Изделие Bullmet'),
    description: String(formData.get('description') || 'Описание товара Bullmet.'),
    price,
    oldPrice: oldPriceRaw > 0 ? oldPriceRaw : undefined,
    image,
    images: [image, ...extraImages].filter((item, index, array) => array.indexOf(item) === index),
    sizes: sizes.length ? sizes : ['Индивидуально'],
    specs: specs.length ? specs : ['Материал по согласованию', 'Размер под проект', 'Контроль качества'],
    status: formData.get('status') === 'draft' ? 'draft' : 'active',
    isPopular: formData.get('isPopular') === 'on',
    isNew: formData.get('isNew') === 'on',
    inStock: formData.get('inStock') !== null,
    catalogImageFit: formData.get('catalogImageFit') === 'contain' ? 'contain' : 'cover',
    catalogImagePosition: String(formData.get('catalogImagePosition') || 'center center'),
    productImageFit: formData.get('productImageFit') === 'contain' ? 'contain' : 'cover',
    productImagePosition: String(formData.get('productImagePosition') || 'center center'),
    imageSettings: old?.imageSettings ?? {},
    variants: [],
    colorGroupId: String(formData.get('colorGroupId') || '').trim(),
    colorName: String(formData.get('colorName') || '').trim(),
    colorHex: String(formData.get('colorHex') || old?.colorHex || '#111111'),
  };
}
