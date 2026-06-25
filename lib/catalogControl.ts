import { serverSupabase } from './serverSupabase';

export type CatalogCategoryKind = 'clock' | 'product' | 'service';

export type CatalogCategory = {
  id: string;
  title: string;
  slug: string;
  kind: CatalogCategoryKind;
  visible: boolean;
  order: number;
  description: string;
  image: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type CatalogControlSettings = {
  enabled: boolean;
  categories: CatalogCategory[];
};

export const catalogControlKey = 'catalog_control';

export const defaultCatalogControl: CatalogControlSettings = {
  enabled: true,
  categories: [
    { id: 'clock-auto', title: 'Авто-мир', slug: 'Авто-мир', kind: 'clock', visible: true, order: 1, description: 'Часы автомобильной тематики', image: '/mockup/cat-clock.jpg' },
    { id: 'clock-barber', title: 'Барбершоп, парикмахерская', slug: 'Барбершоп, парикмахерская', kind: 'clock', visible: true, order: 2, description: 'Часы для барбершопов и салонов', image: '/mockup/cat-clock.jpg' },
    { id: 'clock-graphic', title: 'Графика', slug: 'Графика', kind: 'clock', visible: true, order: 3, description: 'Графические модели часов', image: '/mockup/cat-clock.jpg' },
    { id: 'clock-kids', title: 'Детские', slug: 'Детские', kind: 'clock', visible: true, order: 4, description: 'Детские настенные часы', image: '/mockup/cat-clock.jpg' },
    { id: 'clock-animals', title: 'Животные', slug: 'Животные', kind: 'clock', visible: true, order: 5, description: 'Модели с животными', image: '/mockup/cat-clock.jpg' },
    { id: 'clock-classic', title: 'Классика', slug: 'Классика', kind: 'clock', visible: true, order: 6, description: 'Классические настенные часы', image: '/mockup/cat-clock.jpg' },
    { id: 'clock-coffee', title: 'Кофе и кухня', slug: 'Кофе и кухня', kind: 'clock', visible: true, order: 7, description: 'Часы для кухни, кафе и кофейни', image: '/mockup/cat-clock.jpg' },
    { id: 'clock-music', title: 'Музыка', slug: 'Музыка', kind: 'clock', visible: true, order: 8, description: 'Музыкальная тематика', image: '/mockup/cat-clock.jpg' },
    { id: 'clock-professions', title: 'Профессии', slug: 'Профессии', kind: 'clock', visible: true, order: 9, description: 'Часы под профессию или подарок', image: '/mockup/cat-clock.jpg' },
    { id: 'clock-romance', title: 'Романтика', slug: 'Романтика', kind: 'clock', visible: true, order: 10, description: 'Романтические модели', image: '/mockup/cat-clock.jpg' },
    { id: 'clock-fishing', title: 'Рыбалка, охота', slug: 'Рыбалка, охота', kind: 'clock', visible: true, order: 11, description: 'Тематика рыбалки и охоты', image: '/mockup/cat-clock.jpg' },
    { id: 'clock-sport', title: 'Спорт', slug: 'Спорт', kind: 'clock', visible: true, order: 12, description: 'Спортивные модели часов', image: '/mockup/cat-clock.jpg' },
    { id: 'clock-christian', title: 'Христианские', slug: 'Христианские', kind: 'clock', visible: true, order: 13, description: 'Христианская тематика', image: '/mockup/cat-clock.jpg' },
    { id: 'service-laser', title: 'Лазерная резка', slug: 'laser_cutting', kind: 'service', visible: false, order: 101, description: 'Художественная лазерная резка из листового металла', image: '/assets/service-metal.jpg' },
    { id: 'service-bending', title: 'Гибка металла', slug: 'metal_bending', kind: 'service', visible: false, order: 102, description: 'Гибка металлических деталей', image: '/assets/service-wood.jpg' },
    { id: 'service-wholesale', title: 'Мелкий опт металлопроката', slug: 'metal_wholesale', kind: 'service', visible: false, order: 103, description: 'Подбор металлопроката под задачу', image: '/assets/cat-metal.jpg' },
    { id: 'product-garden', title: 'Садовая мебель', slug: 'garden_furniture', kind: 'product', visible: false, order: 201, description: 'Садовая мебель и качели', image: '/mockup/cat-swing.jpg' },
    { id: 'product-loft', title: 'Мебель лофт', slug: 'loft_furniture', kind: 'product', visible: false, order: 202, description: 'Мебель для дома в стиле лофт', image: '/mockup/cat-custom.jpg' }
  ]
};

function asObject(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function mergeCatalogControl(value: unknown): CatalogControlSettings {
  const incoming = asObject(value);
  const incomingCategories = Array.isArray(incoming.categories) ? incoming.categories : [];

  const categories = defaultCatalogControl.categories.map((item) => {
    const match = incomingCategories.find((category: any) => category?.id === item.id);
    return { ...item, ...asObject(match) } as CatalogCategory;
  });

  const customCategories = incomingCategories
    .filter((category: any) => category?.id && !categories.some((item) => item.id === category.id))
    .map((category: any) => ({ ...defaultCatalogControl.categories[0], ...asObject(category) } as CatalogCategory));

  return {
    enabled: typeof incoming.enabled === 'boolean' ? incoming.enabled : defaultCatalogControl.enabled,
    categories: [...categories, ...customCategories].sort((a, b) => a.order - b.order)
  };
}

export async function getCatalogControlSettings(): Promise<CatalogControlSettings> {
  if (!serverSupabase) return defaultCatalogControl;

  const { data, error } = await serverSupabase
    .from('site_settings')
    .select('value')
    .eq('key', catalogControlKey)
    .maybeSingle();

  if (error || !data?.value) return defaultCatalogControl;
  return mergeCatalogControl(data.value);
}

export function visibleCatalogCategories(settings: CatalogControlSettings, kind?: CatalogCategoryKind) {
  return settings.categories
    .filter((item) => item.visible && (!kind || item.kind === kind))
    .sort((a, b) => a.order - b.order);
}
