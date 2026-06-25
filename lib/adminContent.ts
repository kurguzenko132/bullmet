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
  status: 'pending' | 'published' | 'hidden' | string;
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
  created_at?: string;
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
    .select('id, product_slug, user_id, user_email, user_name, rating, comment, photo_urls, status, created_at, updated_at')
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
    files.set(clean, {
      id: clean,
      url: clean,
      title: meta?.title || clean.split('/').pop() || 'media',
      folder: meta?.folder || 'site',
      source: meta?.source || 'unknown',
      used_in: meta?.used_in || '',
      size: meta?.size,
      created_at: meta?.created_at
    });
  };

  const products = await getAdminCatalogProducts();
  products.forEach((product) => {
    (product.images?.length ? product.images : [product.image]).forEach((url) => add(url, {
      title: product.title,
      folder: 'products',
      source: 'product',
      used_in: `/product/${product.slug}`
    }));
  });

  const reviews = await getAdminReviews();
  reviews.forEach((review) => {
    (review.photo_urls || []).forEach((url, index) => add(url, {
      title: `Фото отзыва ${index + 1}`,
      folder: 'reviews',
      source: 'review',
      used_in: `/product/${review.product_slug}`,
      created_at: review.created_at
    }));
  });

  const banners = await getBannerControlSettings();
  banners.banners.forEach((banner) => add(banner.image, {
    title: banner.title,
    folder: 'banners',
    source: 'banner',
    used_in: banner.placement
  }));

  return Array.from(files.values());
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
