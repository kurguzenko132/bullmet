import { serverSupabase } from './serverSupabase';
import { getSiteControlSettings, siteControlKey, type SiteNavigationItem } from './siteControl';

export type SitePageStatus = 'published' | 'draft' | 'hidden';
export type SitePageSectionType = 'hero' | 'text' | 'image_text' | 'cards' | 'faq' | 'cta';

export type SitePageSection = {
  id: string;
  type: SitePageSectionType;
  title?: string;
  subtitle?: string;
  text?: string;
  image?: string;
  buttonLabel?: string;
  buttonHref?: string;
  items?: Array<{ title: string; text?: string; image?: string; href?: string }>;
};

export type SitePageMenuSettings = {
  label: string;
  header: boolean;
  mobile: boolean;
  footer: boolean;
  order: number;
};

export type SitePage = {
  id: string;
  slug: string;
  title: string;
  status: SitePageStatus | string;
  excerpt?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  og_image?: string | null;
  sections: SitePageSection[];
  menu?: SitePageMenuSettings;
  sort_order?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type SitePageInput = {
  slug: string;
  title: string;
  status: SitePageStatus;
  excerpt?: string;
  seo_title?: string;
  seo_description?: string;
  og_image?: string;
  sections: SitePageSection[];
  menu?: SitePageMenuSettings;
  sort_order?: number;
};

const reservedSlugs = new Set([
  'admin',
  'api',
  'catalog',
  'cart',
  'checkout',
  'contacts',
  'login',
  'order-success',
  'product',
  'services',
  'production',
  'about',
  'account',
  'sitemap.xml',
  'robots.txt'
]);

export function normalizePageSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-z0-9а-яё\-_]+/gi, '-')
    .replace(/_+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function validateSitePageInput(input: Partial<SitePageInput>) {
  const slug = normalizePageSlug(String(input.slug || ''));
  if (!slug) return 'Укажите slug страницы.';
  if (slug.includes('/')) return 'Slug страницы должен быть одним словом без символа “/”.';
  if (reservedSlugs.has(slug.split('/')[0])) return `Slug “${slug}” зарезервирован системной страницей.`;
  if (!String(input.title || '').trim()) return 'Укажите название страницы.';
  if (!['published', 'draft', 'hidden'].includes(String(input.status || ''))) return 'Некорректный статус страницы.';
  return '';
}

function normalizeSections(value: unknown): SitePageSection[] {
  if (!Array.isArray(value)) return [];
  return value.map((section: any, index) => ({
    id: String(section?.id || `section-${index + 1}`),
    type: ['hero', 'text', 'image_text', 'cards', 'faq', 'cta'].includes(section?.type) ? section.type : 'text',
    title: section?.title || '',
    subtitle: section?.subtitle || '',
    text: section?.text || '',
    image: section?.image || '',
    buttonLabel: section?.buttonLabel || '',
    buttonHref: section?.buttonHref || '',
    items: Array.isArray(section?.items) ? section.items.map((item: any) => ({
      title: item?.title || '',
      text: item?.text || '',
      image: item?.image || '',
      href: item?.href || ''
    })) : []
  }));
}

export function sitePageHref(slug: string) {
  const cleanSlug = normalizePageSlug(slug);
  return cleanSlug ? `/${cleanSlug}` : '/';
}

export function sitePageNavigationId(slug: string, location: SiteNavigationItem['location']) {
  const key = normalizePageSlug(slug).replace(/[^a-z0-9а-яё]+/gi, '_') || 'page';
  return `page_${location}_${key}`;
}

export function deriveSitePageMenu(page: Pick<SitePage, 'slug' | 'title' | 'sort_order'>, navigation: SiteNavigationItem[] = []): SitePageMenuSettings {
  const href = sitePageHref(page.slug);
  const matches = navigation.filter((item) => item.href === href || item.id === sitePageNavigationId(page.slug, item.location));
  const firstMatch = matches[0];

  return {
    label: firstMatch?.label || page.title,
    header: matches.some((item) => item.location === 'header' && item.visible),
    mobile: matches.some((item) => item.location === 'mobile' && item.visible),
    footer: matches.some((item) => item.location === 'footer' && item.visible),
    order: Number(firstMatch?.order || page.sort_order || 100)
  };
}

export function normalizeSitePage(row: any, navigation?: SiteNavigationItem[]): SitePage {
  const page = {
    id: String(row.id),
    slug: String(row.slug || ''),
    title: String(row.title || ''),
    status: row.status || 'draft',
    excerpt: row.excerpt || '',
    seo_title: row.seo_title || '',
    seo_description: row.seo_description || '',
    og_image: row.og_image || '',
    sections: normalizeSections(row.sections),
    sort_order: Number(row.sort_order || 100),
    created_at: row.created_at,
    updated_at: row.updated_at
  };

  return {
    ...page,
    menu: deriveSitePageMenu(page, navigation)
  };
}

export async function getAdminSitePages(): Promise<SitePage[]> {
  if (!serverSupabase) return [];

  const { data, error } = await serverSupabase
    .from('site_pages')
    .select('id, slug, title, status, excerpt, seo_title, seo_description, og_image, sections, sort_order, created_at, updated_at')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(300);

  if (error) {
    console.error('Admin site pages load error:', error.message);
    return [];
  }

  const settings = await getSiteControlSettings();
  return (data || []).map((row) => normalizeSitePage(row, settings.navigation));
}

export async function getPublishedSitePages(): Promise<SitePage[]> {
  if (!serverSupabase) return [];

  const { data, error } = await serverSupabase
    .from('site_pages')
    .select('id, slug, title, status, excerpt, seo_title, seo_description, og_image, sections, sort_order, created_at, updated_at')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(300);

  if (error) return [];
  return (data || []).map((row) => normalizeSitePage(row));
}

export async function getPublishedSitePageBySlug(slug: string): Promise<SitePage | null> {
  if (!serverSupabase) return null;

  const cleanSlug = normalizePageSlug(slug);
  const { data, error } = await serverSupabase
    .from('site_pages')
    .select('id, slug, title, status, excerpt, seo_title, seo_description, og_image, sections, sort_order, created_at, updated_at')
    .eq('slug', cleanSlug)
    .eq('status', 'published')
    .maybeSingle();

  if (error || !data) return null;
  return normalizeSitePage(data);
}

export async function syncSitePageNavigation(page: SitePage, menu?: Partial<SitePageMenuSettings>, previousSlug?: string) {
  if (!serverSupabase || !menu) return;

  const settings = await getSiteControlSettings();
  const currentHref = sitePageHref(page.slug);
  const previousHref = previousSlug ? sitePageHref(previousSlug) : '';
  const knownIds = new Set([
    sitePageNavigationId(page.slug, 'header'),
    sitePageNavigationId(page.slug, 'mobile'),
    sitePageNavigationId(page.slug, 'footer'),
    previousSlug ? sitePageNavigationId(previousSlug, 'header') : '',
    previousSlug ? sitePageNavigationId(previousSlug, 'mobile') : '',
    previousSlug ? sitePageNavigationId(previousSlug, 'footer') : ''
  ].filter(Boolean));

  const navigation = settings.navigation.filter((item) => {
    if (knownIds.has(item.id)) return false;
    if (item.href === currentHref) return false;
    if (previousHref && item.href === previousHref) return false;
    return true;
  });

  const label = String(menu.label || page.title || '').trim() || page.title;
  const order = Number(menu.order || page.sort_order || 100);

  if (page.status === 'published') {
    const locations: Array<SiteNavigationItem['location']> = [];
    if (menu.header) locations.push('header');
    if (menu.mobile) locations.push('mobile');
    if (menu.footer) locations.push('footer');

    locations.forEach((location) => {
      navigation.push({
        id: sitePageNavigationId(page.slug, location),
        label,
        href: currentHref,
        location,
        visible: true,
        order
      });
    });
  }

  await serverSupabase
    .from('site_settings')
    .upsert({
      key: siteControlKey,
      value: { ...settings, navigation },
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });
}

export async function getPageMetadata(slug: string) {
  const [page, site] = await Promise.all([
    getPublishedSitePageBySlug(slug),
    getSiteControlSettings()
  ]);

  if (!page) return null;

  return {
    title: page.seo_title || page.title,
    description: page.seo_description || page.excerpt || site.seo.defaultDescription,
    robots: site.seo.robotsIndex ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title: page.seo_title || page.title,
      description: page.seo_description || page.excerpt || site.seo.defaultDescription,
      images: page.og_image ? [page.og_image] : site.seo.ogImage ? [site.seo.ogImage] : undefined
    }
  };
}
