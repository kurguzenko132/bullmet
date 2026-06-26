import { serverSupabase } from './serverSupabase';
import { getSiteControlSettings } from './siteControl';

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
    .replace(/[^a-z0-9а-яё\-_/]+/gi, '-')
    .replace(/\/+/g, '/')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function validateSitePageInput(input: Partial<SitePageInput>) {
  const slug = normalizePageSlug(String(input.slug || ''));
  if (!slug) return 'Укажите slug страницы.';
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

export function normalizeSitePage(row: any): SitePage {
  return {
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

  return (data || []).map(normalizeSitePage);
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
  return (data || []).map(normalizeSitePage);
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
