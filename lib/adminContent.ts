import { serverSupabase } from './serverSupabase';
import { getAdminCatalogProducts } from './products';

export type AdminReview = {
  id: string;
  product_slug: string;
  user_id?: string | null;
  user_email?: string | null;
  user_name?: string | null;
  rating: number;
  comment: string;
  photo_urls?: string[];
  status: 'pending' | 'published' | 'hidden' | 'rejected' | string;
  customer_city?: string | null;
  customer_phone?: string | null;
  product_id?: string | null;
  order_id?: string | null;
  verified_purchase?: boolean;
  source?: 'website' | 'instagram' | 'telegram' | 'offline' | 'import' | string;
  admin_reply?: string | null;
  admin_reply_at?: string | null;
  internal_note?: string | null;
  show_on_homepage?: boolean;
  rejection_reason?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type AdminMediaFile = {
  id: string;
  url: string;
  title?: string;
  folder?: string;
  source?: string;
  used_in?: string;
  size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
  alt_text?: string;
  description?: string;
  tags?: string[];
  usage?: Array<{ type: string; title: string; href: string; publicHref?: string }>;
  created_at?: string;
  updated_at?: string;
};

export type BannerItem = {
  id: string;
  title: string;
  text: string;
  image: string;
  href: string;
  buttonLabel: string;
  visible: boolean;
  placement: 'home_top' | 'catalog_top' | 'product_bottom';
  order: number;
  startsAt?: string;
  endsAt?: string;
};

export type BannerControlSettings = {
  enabled: boolean;
  banners: BannerItem[];
};

export const bannerControlKey = 'banner_control';

export const defaultBannerControl: BannerControlSettings = {
  enabled: false,
  banners: [
    {
      id: 'home-clocks-promo',
      title: 'Настенные часы Bullmet',
      text: 'Выберите модель из металла с элементами дерева или уточните индивидуальный размер.',
      image: '/mockup/cat-clock.jpg',
      href: '/catalog',
      buttonLabel: 'Перейти в каталог',
      visible: true,
      placement: 'home_top',
      order: 1
    }
  ]
};

function asObject(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function mergeBannerControl(value: unknown): BannerControlSettings {
  const incoming = asObject(value);
  const incomingBanners = Array.isArray(incoming.banners) ? incoming.banners : [];

  const banners = defaultBannerControl.banners.map((item) => {
    const match = incomingBanners.find((banner: any) => banner?.id === item.id);
    return { ...item, ...asObject(match) } as BannerItem;
  });

  const customBanners = incomingBanners
    .filter((banner: any) => banner?.id && !banners.some((item) => item.id === banner.id))
    .map((banner: any) => ({ ...defaultBannerControl.banners[0], ...asObject(banner) } as BannerItem));

  return {
    enabled: typeof incoming.enabled === 'boolean' ? incoming.enabled : defaultBannerControl.enabled,
    banners: [...banners, ...customBanners].sort((a, b) => a.order - b.order)
  };
}

export async function getAdminReviews() {
  if (!serverSupabase) return [] as AdminReview[];

  const { data, error } = await serverSupabase
    .from('product_reviews')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(300);

  if (error) {
    console.error('Admin reviews load error:', error.message);
    return [];
  }

  return (data || []) as AdminReview[];
}

export async function getAdminMediaFiles() {
  const files = new Map<string, AdminMediaFile>();

  const add = (url?: string | null, meta?: Partial<AdminMediaFile>) => {
    const clean = String(url || '').trim();
    if (!clean) return;
    const current = files.get(clean);
    const usage = [...(current?.usage || []), ...(meta?.usage || [])];
    files.set(clean, {
      id: meta?.id || current?.id || clean,
      url: clean,
      title: meta?.title || current?.title || clean.split('/').pop() || 'media',
      folder: meta?.folder || current?.folder || 'site',
      source: meta?.source || current?.source || 'unknown',
      used_in: meta?.used_in || current?.used_in || '',
      size: meta?.size || current?.size,
      mime_type: meta?.mime_type || current?.mime_type,
      width: meta?.width || current?.width,
      height: meta?.height || current?.height,
      alt_text: meta?.alt_text || current?.alt_text,
      description: meta?.description || current?.description,
      tags: meta?.tags || current?.tags || [],
      usage,
      created_at: meta?.created_at || current?.created_at,
      updated_at: meta?.updated_at || current?.updated_at
    });
  };

  if (serverSupabase) {
    const { data } = await serverSupabase.from('media_files').select('*').order('created_at', { ascending: false }).limit(500);
    (data || []).forEach((file: any) => add(file.url, {
      id: file.id, title: file.title, folder: file.folder, source: file.source, used_in: file.used_in,
      size: file.size_bytes, mime_type: file.mime_type, width: file.width, height: file.height,
      alt_text: file.alt_text, description: file.description, tags: Array.isArray(file.tags) ? file.tags : [],
      created_at: file.created_at, updated_at: file.updated_at
    }));
  }

  const products = await getAdminCatalogProducts();
  products.forEach((product) => {
    (product.images?.length ? product.images : [product.image]).forEach((url) => add(url, {
      title: product.title,
      folder: 'products',
      source: 'product',
      used_in: `/product/${product.slug}`,
      usage: [{ type: 'Товар', title: product.title, href: `/admin/products?search=${encodeURIComponent(product.slug)}`, publicHref: `/product/${product.slug}` }]
    }));
  });

  const reviews = await getAdminReviews();
  reviews.forEach((review) => {
    (review.photo_urls || []).forEach((url, index) => add(url, {
      title: `Фото отзыва ${index + 1}`,
      folder: 'reviews',
      source: 'review',
      used_in: `/product/${review.product_slug}`,
      created_at: review.created_at,
      usage: [{ type: 'Отзыв', title: review.product_slug || 'Фото отзыва', href: `/admin/reviews`, publicHref: `/product/${review.product_slug}` }]
    }));
  });

  const banners = await getBannerControlSettings();
  banners.banners.forEach((banner) => add(banner.image, {
    title: banner.title,
    folder: 'banners',
    source: 'banner',
    used_in: banner.placement,
    usage: [{ type: 'Баннер', title: banner.title, href: `/admin/banners`, publicHref: banner.href }]
  }));

  return Array.from(files.values()).map((file) => ({ ...file, used_in: file.usage?.map((item) => item.title).join(', ') || file.used_in || '' }));
}

export async function getBannerControlSettings(): Promise<BannerControlSettings> {
  if (!serverSupabase) return defaultBannerControl;

  const { data, error } = await serverSupabase
    .from('site_settings')
    .select('value')
    .eq('key', bannerControlKey)
    .maybeSingle();

  if (error || !data?.value) return defaultBannerControl;
  return mergeBannerControl(data.value);
}
