import { serverSupabase } from './serverSupabase';

export type SiteDirectionKey =
  | 'clocks'
  | 'garden_furniture'
  | 'loft_furniture'
  | 'laser_cutting'
  | 'metal_wholesale'
  | 'metal_bending';

export type SiteDirection = {
  key: SiteDirectionKey;
  title: string;
  href: string;
  visible: boolean;
  order: number;
  note: string;
};

export type SiteNavigationItem = {
  id: string;
  label: string;
  href: string;
  location: 'header' | 'mobile' | 'footer';
  visible: boolean;
  order: number;
};

export type SiteControlSettings = {
  general: {
    siteName: string;
    tagline: string;
    positioning: string;
    launchMode: 'clocks_only' | 'mixed' | 'all';
    logoText: string;
  };
  contacts: {
    phone: string;
    email: string;
    address: string;
    hours: string;
    telegram: string;
    instagram: string;
  };
  directions: SiteDirection[];
  navigation: SiteNavigationItem[];
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    ogImage: string;
    robotsIndex: boolean;
  };
};

export const siteControlKey = 'site_control';

export const defaultSiteControl: SiteControlSettings = {
  general: {
    siteName: 'Bullmet',
    tagline: 'металл с элементами дерева',
    positioning: 'производство металлоизделий',
    launchMode: 'clocks_only',
    logoText: 'BULLMET'
  },
  contacts: {
    phone: '+375 29 802 70 61',
    email: 'info@bullmet.by',
    address: 'Брестская обл., Ивацевичский р-н, д. Булла, ул. Школьная 10А',
    hours: 'ПН–ПТ: 9:00–18:00',
    telegram: '',
    instagram: ''
  },
  directions: [
    { key: 'clocks', title: 'Настенные часы', href: '/catalog', visible: true, order: 1, note: 'Первое публичное направление запуска' },
    { key: 'garden_furniture', title: 'Садовая мебель', href: '/services', visible: false, order: 2, note: 'Подготовлено, включить позже' },
    { key: 'loft_furniture', title: 'Мебель для дома в стиле лофт', href: '/services', visible: false, order: 3, note: 'Подготовлено, включить позже' },
    { key: 'laser_cutting', title: 'Лазерная резка', href: '/services', visible: false, order: 4, note: 'Подготовлено, включить позже' },
    { key: 'metal_wholesale', title: 'Мелкий опт металлопроката', href: '/services', visible: false, order: 5, note: 'Подготовлено, включить позже' },
    { key: 'metal_bending', title: 'Гибка металла', href: '/services', visible: false, order: 6, note: 'Подготовлено, включить позже' }
  ],
  navigation: [
    { id: 'catalog', label: 'Каталог', href: '/catalog', location: 'header', visible: true, order: 1 },
    { id: 'production', label: 'Производство', href: '/production', location: 'header', visible: true, order: 2 },
    { id: 'services', label: 'Услуги', href: '/services', location: 'header', visible: true, order: 3 },
    { id: 'contacts', label: 'Контакты', href: '/contacts', location: 'header', visible: true, order: 4 },
    { id: 'about', label: 'О компании', href: '/about', location: 'header', visible: false, order: 5 },
    { id: 'home_mobile', label: 'Главная', href: '/', location: 'mobile', visible: true, order: 1 },
    { id: 'catalog_mobile', label: 'Каталог', href: '/catalog', location: 'mobile', visible: true, order: 2 },
    { id: 'services_mobile', label: 'Услуги', href: '/services', location: 'mobile', visible: true, order: 3 },
    { id: 'about_mobile', label: 'О нас', href: '/about', location: 'mobile', visible: false, order: 6 },
    { id: 'cart_mobile', label: 'Корзина', href: '/cart', location: 'mobile', visible: true, order: 4 },
    { id: 'profile_mobile', label: 'Профиль', href: '/login', location: 'mobile', visible: true, order: 5 }
  ],
  seo: {
    defaultTitle: 'Bullmet — настенные часы из металла с элементами дерева',
    defaultDescription: 'Настенные часы из металла с элементами дерева собственного производства Bullmet. Производство металлоизделий в Беларуси.',
    ogImage: '/og-image.jpg',
    robotsIndex: true
  }
};

function asObject(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function mergeSiteControl(value: unknown): SiteControlSettings {
  const incoming = asObject(value);
  const general = { ...defaultSiteControl.general, ...asObject(incoming.general) };
  const contacts = { ...defaultSiteControl.contacts, ...asObject(incoming.contacts) };
  const seo = { ...defaultSiteControl.seo, ...asObject(incoming.seo) };

  const incomingDirections = Array.isArray(incoming.directions) ? incoming.directions : [];
  const directions = defaultSiteControl.directions.map((direction) => {
    const match = incomingDirections.find((item: any) => item?.key === direction.key);
    return { ...direction, ...asObject(match) } as SiteDirection;
  }).sort((a, b) => a.order - b.order);

  const incomingNavigation = Array.isArray(incoming.navigation) ? incoming.navigation : [];
  const navigation = defaultSiteControl.navigation.map((item) => {
    const match = incomingNavigation.find((nav: any) => nav?.id === item.id);
    const merged = { ...item, ...asObject(match) } as SiteNavigationItem;

    // Public launch navigation decision:
    // "О компании" is removed from the visible navigation, while "Услуги" is shown instead.
    // This also protects the header from older saved Supabase settings.
    if (merged.href === '/about' || merged.id === 'about' || merged.id === 'about_mobile') {
      return { ...merged, visible: false };
    }

    if (merged.href === '/services' || merged.id === 'services' || merged.id === 'services_mobile') {
      return { ...merged, visible: true, order: merged.location === 'header' ? 3 : 3 };
    }

    return merged;
  }).sort((a, b) => a.order - b.order);

  return { general, contacts, directions, navigation, seo };
}

export async function getSiteControlSettings(): Promise<SiteControlSettings> {
  if (!serverSupabase) return defaultSiteControl;

  const { data, error } = await serverSupabase
    .from('site_settings')
    .select('value')
    .eq('key', siteControlKey)
    .maybeSingle();

  if (error || !data?.value) return defaultSiteControl;
  return mergeSiteControl(data.value);
}

export function visibleNavigation(settings: SiteControlSettings, location: SiteNavigationItem['location']) {
  return settings.navigation
    .filter((item) => item.location === location && item.visible)
    .sort((a, b) => a.order - b.order);
}

export function visibleDirections(settings: SiteControlSettings) {
  return settings.directions
    .filter((item) => item.visible)
    .sort((a, b) => a.order - b.order);
}
