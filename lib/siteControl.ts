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

export type CommerceOption = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  note: string;
  order: number;
};

export type DeliveryMethod = CommerceOption & {
  type?: 'pickup' | 'delivery' | 'courier' | 'pickup_point' | 'other';
  icon?: 'store' | 'truck' | 'package' | 'map-pin' | 'bike' | 'box';
  pricingType?: 'free' | 'fixed' | 'carrier';
  price?: number;
  freeFromAmount?: number | null;
  estimatedMinDays?: number | null;
  estimatedMaxDays?: number | null;
  workingDaysOnly?: boolean;
  coverage?: 'all_belarus' | 'minsk' | 'cities' | 'custom';
  cities?: string[];
  useCompanyAddress?: boolean;
  address?: string;
  schedule?: string;
  customerInstruction?: string;
  archived?: boolean;
};

export type DeliverySettings = {
  freeDeliveryEnabled: boolean;
  freeDeliveryFrom: number;
  freeDeliveryScope: 'delivery_only' | 'all_paid';
  showEstimatedDates: boolean;
  showInstruction: boolean;
  showPickupAddress: boolean;
  allowComment: boolean;
};

export type CouponRule = {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  enabled: boolean;
  note: string;
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
  commerce: {
    deliveryMethods: DeliveryMethod[];
    paymentMethods: CommerceOption[];
    couponRules: CouponRule[];
    deliverySettings: DeliverySettings;
  };
  adminSettings: {
    company: {
      legalName: string;
      description: string;
      additionalInfo: string;
      logo: string;
      favicon: string;
      requisites: { inn: string; unp: string; bank: string; account: string };
    };
    site: {
      maintenance: boolean;
      timezone: string;
      currency: string;
      language: string;
    };
    contacts: {
      secondaryPhone: string;
      ordersEmail: string;
      whatsapp: string;
      vk: string;
      youtube: string;
    };
    orders: {
      allowGuestCheckout: boolean;
      autoNewStatus: boolean;
      quickOrder: boolean;
      orderPrefix: string;
      nextOrderNumber: number;
    };
    notifications: {
      adminEmail: boolean;
      telegram: boolean;
      customerEmail: boolean;
      newOrder: boolean;
      orderStatus: boolean;
      lowStock: boolean;
    };
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
    { id: 'services', label: 'Услуги', href: '/services', location: 'header', visible: false, order: 3 },
    { id: 'contacts', label: 'Контакты', href: '/contacts', location: 'header', visible: true, order: 4 },
    { id: 'about', label: 'О компании', href: '/about', location: 'header', visible: false, order: 5 },
    { id: 'home_mobile', label: 'Главная', href: '/', location: 'mobile', visible: true, order: 1 },
    { id: 'catalog_mobile', label: 'Каталог', href: '/catalog', location: 'mobile', visible: true, order: 2 },
    { id: 'services_mobile', label: 'Услуги', href: '/services', location: 'mobile', visible: false, order: 3 },
    { id: 'about_mobile', label: 'О нас', href: '/about', location: 'mobile', visible: false, order: 6 },
    { id: 'cart_mobile', label: 'Корзина', href: '/cart', location: 'mobile', visible: true, order: 4 },
    { id: 'profile_mobile', label: 'Профиль', href: '/login', location: 'mobile', visible: true, order: 5 }
  ],
  seo: {
    defaultTitle: 'Bullmet — настенные часы из металла с элементами дерева',
    defaultDescription: 'Настенные часы из металла с элементами дерева собственного производства Bullmet. Производство металлоизделий в Беларуси.',
    ogImage: '/og-image.jpg',
    robotsIndex: true
  },
  commerce: {
    deliveryMethods: [
      { id: 'pickup', title: 'Самовывоз', description: 'Заберите заказ на производстве после подтверждения готовности.', enabled: true, note: 'Получение на производстве', order: 1, type: 'pickup', icon: 'store', pricingType: 'free', price: 0, coverage: 'all_belarus', useCompanyAddress: true, customerInstruction: 'После подтверждения заказа мы сообщим, когда он будет готов к получению.' },
      { id: 'belarus_delivery', title: 'Доставка по Беларуси', description: 'Доставка заказов курьером по всей стране.', enabled: true, note: 'Основной способ получения', order: 2, type: 'delivery', icon: 'truck', pricingType: 'fixed', price: 15, freeFromAmount: 300, estimatedMinDays: 1, estimatedMaxDays: 3, workingDaysOnly: true, coverage: 'all_belarus' },
      { id: 'europost', title: 'Европочта', description: 'Доставка в отделение Европочты.', enabled: false, note: 'Подготовлено к подключению', order: 3, type: 'pickup_point', icon: 'package', pricingType: 'carrier', coverage: 'all_belarus' },
      { id: 'minsk_courier', title: 'Курьер (Минск)', description: 'Доставка курьером по Минску.', enabled: false, note: 'Подготовлено к подключению', order: 4, type: 'courier', icon: 'bike', pricingType: 'fixed', price: 20, freeFromAmount: 300, estimatedMinDays: 0, estimatedMaxDays: 1, workingDaysOnly: true, coverage: 'minsk' }
    ],
    paymentMethods: [
      { id: 'manager', title: 'Согласовать с менеджером', description: 'Менеджер подтвердит доступный способ оплаты после заказа.', enabled: true, note: 'Рабочий сценарий до подключения эквайринга', order: 1 },
      { id: 'cash', title: 'Наличными при получении', description: 'Оплата при самовывозе или получении заказа.', enabled: false, note: 'Включить, когда способ доступен', order: 2 },
      { id: 'online', title: 'Онлайн-оплата', description: 'Оплата банковской картой на сайте.', enabled: false, note: 'Требует подключенного платёжного провайдера', order: 3 }
    ],
    couponRules: [],
    deliverySettings: { freeDeliveryEnabled: true, freeDeliveryFrom: 300, freeDeliveryScope: 'delivery_only', showEstimatedDates: true, showInstruction: true, showPickupAddress: true, allowComment: true }
  },
  adminSettings: {
    company: {
      legalName: '', description: 'Производим металлические изделия и стильные часы для дома и бизнеса.', additionalInfo: '', logo: '', favicon: '',
      requisites: { inn: '', unp: '', bank: '', account: '' }
    },
    site: { maintenance: false, timezone: 'Europe/Minsk', currency: 'BYN', language: 'Русский' },
    contacts: { secondaryPhone: '', ordersEmail: '', whatsapp: '', vk: '', youtube: '' },
    orders: { allowGuestCheckout: true, autoNewStatus: true, quickOrder: true, orderPrefix: 'BM-', nextOrderNumber: 100249 },
    notifications: { adminEmail: true, telegram: false, customerEmail: true, newOrder: true, orderStatus: true, lowStock: true }
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
  const adminIncoming = asObject(incoming.adminSettings);
  const adminCompany = { ...defaultSiteControl.adminSettings.company, ...asObject(adminIncoming.company) };
  const adminRequisites = { ...defaultSiteControl.adminSettings.company.requisites, ...asObject(asObject(adminIncoming.company).requisites) };
  const adminSettings = {
    company: { ...adminCompany, requisites: adminRequisites },
    site: { ...defaultSiteControl.adminSettings.site, ...asObject(adminIncoming.site) },
    contacts: { ...defaultSiteControl.adminSettings.contacts, ...asObject(adminIncoming.contacts) },
    orders: { ...defaultSiteControl.adminSettings.orders, ...asObject(adminIncoming.orders) },
    notifications: { ...defaultSiteControl.adminSettings.notifications, ...asObject(adminIncoming.notifications) }
  } as SiteControlSettings['adminSettings'];
  const commerceIncoming = asObject(incoming.commerce);
  const mergeCommerceOptions = (source: CommerceOption[], value: unknown) => {
    if (!Array.isArray(value)) return source;
    return value
      .filter((candidate: any) => candidate?.id)
      .map((candidate: any, index) => {
        const base = source.find((item) => item.id === candidate.id);
        return {
          ...(base || { id: String(candidate.id), title: 'Новый вариант', description: '', enabled: false, note: '', order: 100 + index }),
          ...asObject(candidate),
          id: String(candidate.id),
          title: String(candidate.title || base?.title || 'Новый вариант'),
          description: String(candidate.description || base?.description || ''),
          note: String(candidate.note || base?.note || ''),
          enabled: Boolean(candidate.enabled),
          order: Number(candidate.order || base?.order || 100 + index)
        } as CommerceOption;
      })
      .sort((a, b) => a.order - b.order);
  };
  const couponRules = (Array.isArray(commerceIncoming.couponRules) ? commerceIncoming.couponRules : [])
    .filter((item: any) => item?.id && item?.code)
    .map((item: any) => ({
      id: String(item.id),
      code: String(item.code).trim().toUpperCase(),
      type: item.type === 'fixed' ? 'fixed' : 'percent',
      value: Math.max(0, Number(item.value || 0)),
      enabled: Boolean(item.enabled),
      note: String(item.note || '')
    } as CouponRule));
  const deliveryRaw = mergeCommerceOptions(defaultSiteControl.commerce.deliveryMethods, commerceIncoming.deliveryMethods)
    .map((item: any) => {
      const base = defaultSiteControl.commerce.deliveryMethods.find((method) => method.id === item.id);
      return {
        ...base,
        ...item,
        type: ['pickup', 'delivery', 'courier', 'pickup_point', 'other'].includes(item.type) ? item.type : base?.type || 'delivery',
        icon: ['store', 'truck', 'package', 'map-pin', 'bike', 'box'].includes(item.icon) ? item.icon : base?.icon || 'truck',
        pricingType: ['free', 'fixed', 'carrier'].includes(item.pricingType) ? item.pricingType : base?.pricingType || 'free',
        price: Math.max(0, Number(item.price ?? base?.price ?? 0)),
        freeFromAmount: item.freeFromAmount === null || item.freeFromAmount === '' ? null : Math.max(0, Number(item.freeFromAmount ?? base?.freeFromAmount ?? 0)),
        estimatedMinDays: item.estimatedMinDays === null || item.estimatedMinDays === '' ? null : Math.max(0, Number(item.estimatedMinDays ?? base?.estimatedMinDays ?? 0)),
        estimatedMaxDays: item.estimatedMaxDays === null || item.estimatedMaxDays === '' ? null : Math.max(0, Number(item.estimatedMaxDays ?? base?.estimatedMaxDays ?? 0)),
        workingDaysOnly: Boolean(item.workingDaysOnly ?? base?.workingDaysOnly),
        coverage: ['all_belarus', 'minsk', 'cities', 'custom'].includes(item.coverage) ? item.coverage : base?.coverage || 'all_belarus',
        cities: Array.isArray(item.cities) ? item.cities.map(String) : base?.cities || [],
        useCompanyAddress: item.useCompanyAddress === undefined ? base?.useCompanyAddress !== false : Boolean(item.useCompanyAddress),
        address: String(item.address || base?.address || ''),
        schedule: String(item.schedule || base?.schedule || ''),
        customerInstruction: String(item.customerInstruction || base?.customerInstruction || ''),
        archived: Boolean(item.archived)
      } as DeliveryMethod;
    });
  const deliveryIncoming = asObject(commerceIncoming.deliverySettings);
  const deliverySettings: DeliverySettings = {
    ...defaultSiteControl.commerce.deliverySettings,
    freeDeliveryEnabled: deliveryIncoming.freeDeliveryEnabled === undefined ? defaultSiteControl.commerce.deliverySettings.freeDeliveryEnabled : Boolean(deliveryIncoming.freeDeliveryEnabled),
    freeDeliveryFrom: Math.max(0, Number(deliveryIncoming.freeDeliveryFrom ?? defaultSiteControl.commerce.deliverySettings.freeDeliveryFrom)),
    freeDeliveryScope: deliveryIncoming.freeDeliveryScope === 'all_paid' ? 'all_paid' : 'delivery_only',
    showEstimatedDates: deliveryIncoming.showEstimatedDates === undefined ? true : Boolean(deliveryIncoming.showEstimatedDates),
    showInstruction: deliveryIncoming.showInstruction === undefined ? true : Boolean(deliveryIncoming.showInstruction),
    showPickupAddress: deliveryIncoming.showPickupAddress === undefined ? true : Boolean(deliveryIncoming.showPickupAddress),
    allowComment: deliveryIncoming.allowComment === undefined ? true : Boolean(deliveryIncoming.allowComment)
  };
  const commerce = {
    deliveryMethods: deliveryRaw,
    paymentMethods: mergeCommerceOptions(defaultSiteControl.commerce.paymentMethods, commerceIncoming.paymentMethods),
    couponRules,
    deliverySettings
  };

  const incomingDirections = Array.isArray(incoming.directions) ? incoming.directions : [];
  const directions = defaultSiteControl.directions.map((direction) => {
    const match = incomingDirections.find((item: any) => item?.key === direction.key);
    return { ...direction, ...asObject(match) } as SiteDirection;
  }).sort((a, b) => a.order - b.order);
  const hasVisibleServices = directions.some((direction) => direction.key !== 'clocks' && direction.visible);

  const incomingNavigation = Array.isArray(incoming.navigation) ? incoming.navigation : [];
  const defaultNavigation = defaultSiteControl.navigation.map((item) => {
    const match = incomingNavigation.find((nav: any) => nav?.id === item.id);
    const merged = { ...item, ...asObject(match) } as SiteNavigationItem;

    if (merged.href === '/about' || merged.id === 'about' || merged.id === 'about_mobile') {
      return { ...merged, visible: false };
    }

    if (merged.href === '/services' || merged.id === 'services' || merged.id === 'services_mobile') {
      return { ...merged, visible: Boolean(merged.visible && hasVisibleServices), order: merged.location === 'header' ? 3 : 3 };
    }

    return merged;
  });

  const customNavigation = incomingNavigation
    .filter((item: any) => item?.id && !defaultNavigation.some((nav) => nav.id === item.id))
    .map((item: any, index) => {
      const location = ['header', 'mobile', 'footer'].includes(item.location) ? item.location : 'header';
      const href = String(item.href || '').trim();
      const label = String(item.label || '').trim();
      return {
        id: String(item.id),
        label,
        href,
        location,
        visible: typeof item.visible === 'boolean' ? item.visible : true,
        order: Number(item.order || 100 + index)
      } as SiteNavigationItem;
    })
    .filter((item) => item.label && item.href)
    .map((item) => {
      if (item.href === '/services') return { ...item, visible: Boolean(item.visible && hasVisibleServices) };
      if (item.href === '/about') return { ...item, visible: false };
      return item;
    });

  const navigation = [...defaultNavigation, ...customNavigation].sort((a, b) => a.order - b.order);

  return { general, contacts, directions, navigation, seo, commerce, adminSettings };
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

export function visibleDeliveryMethods(settings: SiteControlSettings) {
  return settings.commerce.deliveryMethods
    .filter((method) => method.enabled && !method.archived)
    .sort((a, b) => a.order - b.order);
}

export function quoteDelivery(settings: SiteControlSettings, methodId: string, subtotal: number) {
  const method = visibleDeliveryMethods(settings).find((item) => item.id === methodId);
  if (!method) return null;
  const amount = Math.max(0, Number(subtotal || 0));
  const methodThreshold = method.freeFromAmount ?? settings.commerce.deliverySettings.freeDeliveryFrom;
  const canBeFree = settings.commerce.deliverySettings.freeDeliveryEnabled
    && method.pricingType === 'fixed'
    && (settings.commerce.deliverySettings.freeDeliveryScope === 'all_paid' || method.type !== 'pickup')
    && amount >= Number(methodThreshold || 0);
  const price = method.pricingType === 'free' || method.pricingType === 'carrier' || canBeFree ? 0 : Math.max(0, Number(method.price || 0));
  return { method, price, isFree: method.pricingType === 'free' || canBeFree, priceType: method.pricingType };
}
