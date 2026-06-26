import { getAdminOrders, getAdminRequests } from './adminCommerce';
import { getAdminReviews, getBannerControlSettings } from './adminContent';
import { getAdminActivityLog, getAdminProfiles } from './adminPeople';
import { getCatalogControlSettings, visibleCatalogCategories } from './catalogControl';
import { getAdminCatalogProducts } from './products';
import { getHomepageControlSettings } from './homepageControl';
import { getSiteControlSettings, visibleDirections } from './siteControl';
import { getAdminSitePages } from './sitePages';
import { isSupabaseConfigured, serverSupabase } from './serverSupabase';

export type BackupOverview = {
  configured: boolean;
  products: number;
  orders: number;
  requests: number;
  reviews: number;
  users: number;
  activity: number;
  settings: number;
  pages: number;
  visibleCategories: number;
  visibleDirections: number;
  generatedAt: string;
};

export type AuditItem = {
  id: string;
  title: string;
  status: 'ok' | 'warn' | 'bad';
  message: string;
  href?: string;
};

export type AuditReport = {
  score: number;
  items: AuditItem[];
  generatedAt: string;
};

export type ExportType =
  | 'all'
  | 'products'
  | 'orders'
  | 'requests'
  | 'reviews'
  | 'users'
  | 'activity'
  | 'settings'
  | 'categories'
  | 'banners'
  | 'pages';

function safeArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

export async function getSettingsCount() {
  if (!serverSupabase) return 0;
  const { count } = await serverSupabase
    .from('site_settings')
    .select('*', { count: 'exact', head: true });
  return count || 0;
}

export async function getBackupOverview(): Promise<BackupOverview> {
  const [products, orders, requests, reviews, users, activity, site, catalog, settings, pages] = await Promise.all([
    getAdminCatalogProducts(),
    getAdminOrders(),
    getAdminRequests(),
    getAdminReviews(),
    getAdminProfiles(),
    getAdminActivityLog(),
    getSiteControlSettings(),
    getCatalogControlSettings(),
    getSettingsCount(),
    getAdminSitePages()
  ]);

  return {
    configured: isSupabaseConfigured(),
    products: products.length,
    orders: orders.length,
    requests: requests.length,
    reviews: reviews.length,
    users: users.length,
    activity: activity.length,
    settings,
    pages: pages.length,
    visibleCategories: visibleCatalogCategories(catalog).length,
    visibleDirections: visibleDirections(site).length,
    generatedAt: new Date().toISOString()
  };
}

export async function getAuditReport(): Promise<AuditReport> {
  const [products, orders, requests, reviews, users, activity, site, catalog, banners, pages] = await Promise.all([
    getAdminCatalogProducts(),
    getAdminOrders(),
    getAdminRequests(),
    getAdminReviews(),
    getAdminProfiles(),
    getAdminActivityLog(),
    getSiteControlSettings(),
    getCatalogControlSettings(),
    getBannerControlSettings(),
    getAdminSitePages()
  ]);

  const visibleCats = visibleCatalogCategories(catalog);
  const visibleDirs = visibleDirections(site);
  const missingPhotos = products.filter((product) => !product.image && !product.images?.length).length;
  const missingPrice = products.filter((product) => !Number(product.price)).length;
  const weakDescription = products.filter((product) => !product.description || product.description.length < 40).length;
  const admins = users.filter((user) => user.role === 'admin').length;
  const hiddenServices = !visibleDirs.some((direction) => direction.key !== 'clocks');
  const items: AuditItem[] = [
    {
      id: 'supabase',
      title: 'Supabase',
      status: isSupabaseConfigured() ? 'ok' : 'bad',
      message: isSupabaseConfigured() ? 'Подключение настроено.' : 'Нет переменных Supabase, админка не сможет работать с базой.'
    },
    {
      id: 'seo-index',
      title: 'Индексация',
      status: site.seo.robotsIndex ? 'ok' : 'warn',
      message: site.seo.robotsIndex ? 'Индексация включена.' : 'robotsIndex выключен: сайт закрыт от индексации.',
      href: '/admin/settings'
    },
    {
      id: 'directions',
      title: 'Видимые направления',
      status: visibleDirs.length ? 'ok' : 'bad',
      message: `Видимых направлений: ${visibleDirs.length}.`,
      href: '/admin/settings'
    },
    {
      id: 'services-hidden',
      title: 'Услуги',
      status: hiddenServices ? 'ok' : 'warn',
      message: hiddenServices ? 'Услуги скрыты — подходит для запуска только часов.' : 'Есть включённые услуги: проверьте готовность принимать заявки.',
      href: '/admin/categories'
    },
    {
      id: 'categories',
      title: 'Категории каталога',
      status: visibleCats.length ? 'ok' : 'bad',
      message: `Видимых категорий: ${visibleCats.length}.`,
      href: '/admin/categories'
    },
    {
      id: 'pages',
      title: 'CMS-страницы',
      status: pages.length ? 'ok' : 'warn',
      message: pages.length ? `Создано страниц: ${pages.length}.` : 'Пользовательских страниц пока нет. Создайте страницы в супер-админке.',
      href: '/admin/pages'
    },
    {
      id: 'products',
      title: 'Товары',
      status: products.length ? 'ok' : 'bad',
      message: `Товаров в админке: ${products.length}.`,
      href: '/admin/products'
    },
    {
      id: 'product-photos',
      title: 'Фото товаров',
      status: missingPhotos ? 'bad' : 'ok',
      message: missingPhotos ? `Товаров без фото: ${missingPhotos}.` : 'У всех товаров есть фото.',
      href: '/admin/products'
    },
    {
      id: 'product-price',
      title: 'Цены',
      status: missingPrice ? 'warn' : 'ok',
      message: missingPrice ? `Товаров без цены: ${missingPrice}.` : 'У всех товаров заполнена цена.',
      href: '/admin/products'
    },
    {
      id: 'product-description',
      title: 'Описания',
      status: weakDescription ? 'warn' : 'ok',
      message: weakDescription ? `Слабые/короткие описания: ${weakDescription}.` : 'Описания выглядят заполненными.',
      href: '/admin/products'
    },
    {
      id: 'admins',
      title: 'Администраторы',
      status: admins ? 'ok' : 'warn',
      message: admins ? `Администраторов в profiles: ${admins}.` : 'В profiles нет роли admin. Доступ может держаться только на NEXT_PUBLIC_ADMIN_EMAIL.',
      href: '/admin/users'
    },
    {
      id: 'orders',
      title: 'Заказы',
      status: orders.length ? 'ok' : 'warn',
      message: orders.length ? `Заказов: ${orders.length}.` : 'Заказов пока нет. Перед запуском сделайте тестовый заказ.',
      href: '/admin/orders'
    },
    {
      id: 'requests',
      title: 'Заявки',
      status: requests.length ? 'ok' : 'warn',
      message: requests.length ? `Заявок: ${requests.length}.` : 'Заявок пока нет. Перед запуском проверьте формы.',
      href: '/admin/requests'
    },
    {
      id: 'reviews',
      title: 'Отзывы',
      status: reviews.length ? 'ok' : 'warn',
      message: reviews.length ? `Отзывов: ${reviews.length}.` : 'Отзывов пока нет.',
      href: '/admin/reviews'
    },
    {
      id: 'banners',
      title: 'Баннеры',
      status: banners.enabled ? 'warn' : 'ok',
      message: banners.enabled ? 'Баннеры включены: проверьте актуальность акции.' : 'Баннеры выключены.',
      href: '/admin/banners'
    },
    {
      id: 'activity',
      title: 'Журнал действий',
      status: activity.length ? 'ok' : 'warn',
      message: activity.length ? `Записей журнала: ${activity.length}.` : 'Журнал пока пуст. Измените данные в админке для проверки.',
      href: '/admin/activity'
    }
  ];

  const ok = items.filter((item) => item.status === 'ok').length;
  const warn = items.filter((item) => item.status === 'warn').length;
  const bad = items.filter((item) => item.status === 'bad').length;
  const score = Math.max(0, Math.round((ok * 100 + warn * 55 - bad * 30) / items.length));

  return {
    score,
    items,
    generatedAt: new Date().toISOString()
  };
}

export async function getExportData(type: ExportType) {
  const [
    products,
    orders,
    requests,
    reviews,
    users,
    activity,
    site,
    homepage,
    catalog,
    banners,
    pages
  ] = await Promise.all([
    getAdminCatalogProducts(),
    getAdminOrders(),
    getAdminRequests(),
    getAdminReviews(),
    getAdminProfiles(),
    getAdminActivityLog(),
    getSiteControlSettings(),
    getHomepageControlSettings(),
    getCatalogControlSettings(),
    getBannerControlSettings(),
    getAdminSitePages()
  ]);

  const settings = { site, homepage, catalog, banners };

  if (type === 'products') return products;
  if (type === 'orders') return orders;
  if (type === 'requests') return requests;
  if (type === 'reviews') return reviews;
  if (type === 'users') return users;
  if (type === 'activity') return activity;
  if (type === 'settings') return settings;
  if (type === 'categories') return catalog.categories;
  if (type === 'banners') return banners.banners;
  if (type === 'pages') return pages;

  return {
    generatedAt: new Date().toISOString(),
    products,
    orders,
    requests,
    reviews,
    users,
    activity,
    pages,
    settings
  };
}

function flattenValue(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export function toCsv(data: unknown) {
  const rows = Array.isArray(data) ? data : [data];
  const normalized = safeArray(rows).map((row) => row && typeof row === 'object' ? row as Record<string, unknown> : { value: row });
  const headers = Array.from(new Set(normalized.flatMap((row) => Object.keys(row))));

  const escape = (value: unknown) => {
    const string = flattenValue(value).replace(/"/g, '""');
    return `"${string}"`;
  };

  return [
    headers.map(escape).join(','),
    ...normalized.map((row) => headers.map((header) => escape((row as Record<string, unknown>)[header])).join(','))
  ].join('\n');
}
