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
