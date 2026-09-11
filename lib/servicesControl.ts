import { serverSupabase } from './serverSupabase';

export type ServiceStatus = 'published' | 'draft' | 'hidden' | 'archived';
export type ServicePrice = { enabled: boolean; type: 'from' | 'fixed' | 'agreement'; amount?: number; currency: 'BYN' };
export type ServiceGalleryImage = { id: string; image: string; alt: string; caption: string; order: number };
export type ServiceSeo = { title: string; description: string; ogTitle: string; ogDescription: string; ogImage: string; canonical: string; robotsIndex: boolean; robotsFollow: boolean };
export type ServiceContentBlock = { id: string; type: 'text' | 'benefits' | 'gallery' | 'steps' | 'faq' | 'cta'; title: string; text: string; visible: boolean; order: number };

export type ServiceCard = {
  id: string; directionKey: string; icon: string; title: string; subtitle: string; image: string; items: string[]; href: string; visible: boolean; order: number;
  slug?: string; eyebrow?: string; status?: ServiceStatus; price?: ServicePrice; gallery?: ServiceGalleryImage[]; blocks?: ServiceContentBlock[];
  showOnHomepage?: boolean; showInNavigation?: boolean; showGallery?: boolean; showFaq?: boolean; seo?: ServiceSeo;
  createdAt?: string; updatedAt?: string; createdBy?: string; updatedBy?: string;
};
export type ServiceStep = { id: string; number: string; title: string; text: string; visible: boolean; order: number };
export type ServicesControlSettings = { hero: { enabled: boolean; kicker: string; title: string; text: string; image: string; primaryLabel: string; secondaryLabel: string }; services: ServiceCard[]; steps: ServiceStep[]; examples: string[]; };

export const servicesControlKey = 'services_control';
const now = '2026-09-11T10:00:00.000Z';
const defaultSeo = (): ServiceSeo => ({ title: '', description: '', ogTitle: '', ogDescription: '', ogImage: '', canonical: '', robotsIndex: true, robotsFollow: true });
const defaultPrice = (): ServicePrice => ({ enabled: false, type: 'from', currency: 'BYN' });

export const defaultServicesControl: ServicesControlSettings = {
  hero: { enabled: true, kicker: 'Услуги производства', title: 'Производственные возможности Bullmet', text: 'Работаем с металлом, элементами дерева и индивидуальными проектами. Здесь собраны основные производственные направления Bullmet.', image: '/assets/hero-machine.jpg', primaryLabel: 'Связаться', secondaryLabel: 'Смотреть каталог' },
  services: [
    { id: 'laser', directionKey: 'laser_cutting', icon: 'spark', title: 'Лазерная резка', subtitle: 'Декор, таблички, вывески, панели и детали из листового металла.', image: '/assets/service-metal.jpg', items: ['по чертежу или эскизу', 'аккуратный рез', 'подготовка под покраску'], href: '/contacts', visible: true, order: 1, slug: 'laser-cutting', eyebrow: 'Обработка металла', status: 'published', price: { enabled: true, type: 'from', amount: 10, currency: 'BYN' }, gallery: [], blocks: [], showOnHomepage: false, showInNavigation: false, showGallery: true, showFaq: false, seo: defaultSeo(), createdAt: now, updatedAt: now, createdBy: 'Администратор', updatedBy: 'Администратор' },
    { id: 'bending', directionKey: 'metal_bending', icon: 'materials', title: 'Гибка металла', subtitle: 'Детали для мебели, навесов, каркасов и малых архитектурных форм.', image: '/assets/service-wood.jpg', items: ['индивидуальные размеры', 'разовые и серийные задачи', 'согласование до запуска'], href: '/contacts', visible: true, order: 2, slug: 'metal-bending', eyebrow: 'Обработка металла', status: 'published', price: { enabled: true, type: 'from', amount: 15, currency: 'BYN' }, gallery: [], blocks: [], showOnHomepage: false, showInNavigation: false, showGallery: true, showFaq: false, seo: defaultSeo(), createdAt: now, updatedAt: now, createdBy: 'Администратор', updatedBy: 'Администратор' },
    { id: 'custom', directionKey: 'loft_furniture', icon: 'custom', title: 'Изделия под заказ', subtitle: 'Изготовление по фото, ссылке на пример, чертежу или вашей идее.', image: '/assets/cat-custom.jpg', items: ['часы, качели, мебель', 'металл с элементами дерева', 'адаптация под задачу'], href: '/contacts', visible: true, order: 3, slug: 'custom-products', eyebrow: 'Индивидуальные изделия', status: 'published', price: defaultPrice(), gallery: [], blocks: [], showOnHomepage: false, showInNavigation: false, showGallery: true, showFaq: false, seo: defaultSeo(), createdAt: now, updatedAt: now, createdBy: 'Администратор', updatedBy: 'Администратор' },
    { id: 'metal', directionKey: 'metal_wholesale', icon: 'factory', title: 'Мелкий опт металлопроката', subtitle: 'Подбор и подготовка металла под производство, участок или ремонт.', image: '/assets/cat-metal.jpg', items: ['подбор материала', 'ориентир по количеству', 'подготовка под задачу'], href: '/contacts', visible: true, order: 4, slug: 'metal-wholesale', eyebrow: 'Материалы', status: 'published', price: defaultPrice(), gallery: [], blocks: [], showOnHomepage: false, showInNavigation: false, showGallery: true, showFaq: false, seo: defaultSeo(), createdAt: now, updatedAt: now, createdBy: 'Администратор', updatedBy: 'Администратор' }
  ],
  steps: [
    { id: 'task', number: '01', title: 'Знакомство с задачей', text: 'Понимаем, какое изделие нужно и где оно будет использоваться.', visible: true, order: 1 },
    { id: 'details', number: '02', title: 'Уточнение деталей', text: 'Размеры, материал, покрытие, количество, сроки и назначение изделия.', visible: true, order: 2 },
    { id: 'solution', number: '03', title: 'Подготовка решения', text: 'Подбираем оптимальный вариант изготовления и согласуем детали.', visible: true, order: 3 },
    { id: 'production', number: '04', title: 'Производство', text: 'Запускаем работу, проверяем качество и передаём готовое изделие.', visible: true, order: 4 }
  ],
  examples: ['декоративное панно', 'табличка или вывеска', 'каркас для мебели', 'навес или качели', 'деталь по чертежу', 'изделие по фото']
};

function object(value: unknown) { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function normalizeSlug(value: string) { return value.trim().toLowerCase().replace(/[^a-z0-9а-яё]+/gi, '-').replace(/^-+|-+$/g, '') || 'new-service'; }
function statusOf(service: ServiceCard): ServiceStatus { return service.status === 'published' || service.status === 'draft' || service.status === 'hidden' || service.status === 'archived' ? service.status : service.visible ? 'published' : 'hidden'; }
function normalizeGallery(value: unknown): ServiceGalleryImage[] { return Array.isArray(value) ? value.filter((image: any) => image?.id && image?.image).map((image: any, index) => ({ id: String(image.id), image: String(image.image), alt: String(image.alt || ''), caption: String(image.caption || ''), order: Number(image.order || index + 1) })).sort((a, b) => a.order - b.order) : []; }
function normalizeBlocks(value: unknown): ServiceContentBlock[] { return Array.isArray(value) ? value.filter((item: any) => item?.id).map((item: any, index) => ({ id: String(item.id), type: ['text', 'benefits', 'gallery', 'steps', 'faq', 'cta'].includes(item.type) ? item.type : 'text', title: String(item.title || ''), text: String(item.text || ''), visible: item.visible !== false, order: Number(item.order || index + 1) })).sort((a, b) => a.order - b.order) : []; }
function normalizeService(service: ServiceCard, fallback?: ServiceCard, index = 0): ServiceCard {
  const merged = { ...fallback, ...service } as ServiceCard;
  const status = statusOf(merged);
  return {
    ...merged,
    slug: normalizeSlug(String(merged.slug || merged.directionKey || merged.title)),
    status,
    visible: status === 'published',
    price: { ...defaultPrice(), ...object(merged.price) } as ServicePrice,
    gallery: normalizeGallery(merged.gallery),
    blocks: normalizeBlocks(merged.blocks),
    seo: { ...defaultSeo(), ...object(merged.seo) } as ServiceSeo,
    showOnHomepage: merged.showOnHomepage === true,
    showInNavigation: merged.showInNavigation === true,
    showGallery: merged.showGallery !== false,
    showFaq: merged.showFaq === true,
    createdAt: merged.createdAt || now,
    updatedAt: merged.updatedAt || now,
    createdBy: merged.createdBy || 'Администратор',
    updatedBy: merged.updatedBy || 'Администратор',
    order: Number(merged.order || index + 1)
  };
}
function mergeList<T extends { id: string; order: number }>(defaults: T[], value: unknown) { if (!Array.isArray(value)) return defaults; return value.filter((item: any) => item?.id).map((item: any, index) => ({ ...(defaults.find((base) => base.id === item.id) || {}), ...object(item), order: Number(item.order || index + 1) } as T)).sort((a, b) => a.order - b.order); }
export function mergeServicesControl(value: unknown): ServicesControlSettings { const input = object(value); const rawServices = Array.isArray(input.services) ? input.services : defaultServicesControl.services; return { hero: { ...defaultServicesControl.hero, ...object(input.hero) }, services: rawServices.filter((item: any) => item?.id).map((item: any, index) => normalizeService({ ...object(item) } as ServiceCard, defaultServicesControl.services.find((base) => base.id === item.id), index)).sort((a, b) => a.order - b.order), steps: mergeList(defaultServicesControl.steps, input.steps), examples: Array.isArray(input.examples) ? input.examples.map(String).filter(Boolean) : defaultServicesControl.examples }; }
export async function getServicesControlSettings() { if (!serverSupabase) return defaultServicesControl; const { data, error } = await serverSupabase.from('site_settings').select('value').eq('key', servicesControlKey).maybeSingle(); return error || !data?.value ? defaultServicesControl : mergeServicesControl(data.value); }
export function visibleServicesItems<T extends { visible: boolean; order: number; status?: ServiceStatus }>(items: T[]) { return items.filter((item) => item.visible && (!item.status || item.status === 'published')).sort((a, b) => a.order - b.order); }
