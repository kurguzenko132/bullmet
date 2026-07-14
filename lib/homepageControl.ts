import { serverSupabase } from './serverSupabase';

export type HomeIcon =
  | 'search'
  | 'cart'
  | 'user'
  | 'factory'
  | 'custom'
  | 'materials'
  | 'truck'
  | 'arrow'
  | 'shield'
  | 'tools'
  | 'spark'
  | 'file'
  | 'phone'
  | 'mail'
  | 'pin'
  | 'clock'
  | 'instagram'
  | 'telegram'
  | 'request'
  | 'ruler'
  | 'calculator'
  | 'hammer'
  | 'package';

export type HomeFeatureItem = {
  id: string;
  icon: HomeIcon;
  text: string;
  visible: boolean;
  order: number;
};

export type HomeDirectionCard = {
  id: string;
  title: string;
  img: string;
  href: string;
  visible: boolean;
  order: number;
};

export type HomeStep = {
  id: string;
  icon: HomeIcon;
  num: string;
  title: string;
  desc: string;
  visible: boolean;
  order: number;
};

export type HomeBenefit = {
  id: string;
  icon: HomeIcon;
  title: string;
  desc: string;
  visible: boolean;
  order: number;
};

export type HomeGalleryItem = {
  id: string;
  src: string;
  title: string;
  note: string;
  visible: boolean;
  order: number;
};

export type HomeControlSettings = {
  hero: {
    enabled: boolean;
    kicker: string;
    title: string;
    text: string;
    image: string;
    imageAlt: string;
    primaryLabel: string;
    primaryHref: string;
  };
  features: HomeFeatureItem[];
  directionsSection: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    text: string;
    buttonLabel: string;
    buttonHref: string;
  };
  directions: HomeDirectionCard[];
  productsSection: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    text: string;
    buttonLabel: string;
    buttonHref: string;
    limit: number;
    onlyClocks: boolean;
  };
  productionSection: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    text: string;
    image: string;
    buttonLabel: string;
    buttonHref: string;
  };
  productionBenefits: HomeFeatureItem[];
  stepsSection: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    text: string;
  };
  steps: HomeStep[];
  workBenefits: HomeBenefit[];
  gallerySection: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    buttonLabel: string;
    buttonHref: string;
  };
  gallery: HomeGalleryItem[];
  cta: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    text: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  };
};

export const homepageControlKey = 'homepage_control';

export const defaultHomepageControl: HomeControlSettings = {
  hero: {
    enabled: true,
    kicker: 'Производство металлоизделий Bullmet',
    title: 'Изделия из металла с элементами дерева',
    text: 'Изготавливаем: садовую мебель, мебель для дома в стиле лофт, качели, навесы, малые архитектурные формы, а также выполняем художественную лазерную резку из листового металла.',
    image: '/assets/hero-bullmet.png',
    imageAlt: 'Станок режет металл',
    primaryLabel: 'Перейти в каталог',
    primaryHref: '/catalog'
  },
  features: [
    { id: 'production', icon: 'factory', text: 'Собственное\nпроизводство', visible: true, order: 1 },
    { id: 'clocks', icon: 'custom', text: 'Индивидуальные\nзаказы', visible: true, order: 2 },
    { id: 'materials', icon: 'materials', text: 'Металл\nи дерево', visible: true, order: 3 },
    { id: 'delivery', icon: 'truck', text: 'Доставка по\nБеларуси', visible: true, order: 4 }
  ],
  directionsSection: {
    enabled: true,
    eyebrow: 'главные переходы',
    title: 'Направления Bullmet',
    text: 'Сейчас клиентам открыт каталог настенных часов Bullmet.',
    buttonLabel: 'Смотреть каталог',
    buttonHref: '/catalog'
  },
  directions: [
    { id: 'clocks', title: 'Настенные\nчасы', img: '/mockup/cat-clock.jpg', href: '/catalog?category=Настенные часы', visible: true, order: 1 },
    { id: 'garden', title: 'Садовая\nмебель', img: '/mockup/cat-swing.jpg', href: '/catalog?category=Садовая мебель', visible: true, order: 2 },
    { id: 'loft', title: 'Мебель для дома\nв стиле лофт', img: '/mockup/cat-custom.jpg', href: '/catalog?category=Мебель для дома в стиле лофт', visible: true, order: 3 },
    { id: 'laser', title: 'Лазерная\nрезка', img: '/mockup/cat-metal.jpg', href: '/services#laser', visible: true, order: 4 },
    { id: 'wholesale', title: 'Мелкий опт\nметаллопроката', img: '/mockup/cat-wood.jpg', href: '/services#metal', visible: true, order: 5 },
    { id: 'bending', title: 'Гибка\nметалла', img: '/mockup/service-metal.jpg', href: '/services#bending', visible: false, order: 6 }
  ],
  productsSection: {
    enabled: true,
    eyebrow: 'популярные модели',
    title: 'Популярные часы',
    text: 'Модели, с которых удобно начать знакомство с Bullmet.',
    buttonLabel: 'Все часы',
    buttonHref: '/catalog',
    limit: 4,
    onlyClocks: true
  },
  productionSection: {
    enabled: true,
    eyebrow: 'производство металлоизделий',
    title: 'Собственное производство Bullmet',
    text: 'Делаем настенные часы Bullmet на собственном производстве: металл, элементы дерева, порошковая покраска и контроль качества перед выдачей.',
    image: '/mockup/prod-workshop.jpg',
    buttonLabel: 'О производстве',
    buttonHref: '/production'
  },
  productionBenefits: [
    { id: 'own-clocks', icon: 'clock', text: 'Настенные часы\nсобственного изготовления', visible: true, order: 1 },
    { id: 'metal-wood', icon: 'materials', text: 'Металл\nс элементами дерева', visible: true, order: 2 },
    { id: 'size-design', icon: 'tools', text: 'Подбор размера\nи оформления', visible: true, order: 3 },
    { id: 'quality', icon: 'shield', text: 'Контроль качества\nперед выдачей', visible: true, order: 4 }
  ],
  stepsSection: {
    enabled: true,
    eyebrow: 'Как мы работаем',
    title: 'Как заказать часы Bullmet',
    text: 'Простой путь: выбрали модель, уточнили детали, получили готовые часы.'
  },
  steps: [
    { id: 'choose', icon: 'search', num: '01', title: 'Выбор часов', desc: 'Вы выбираете модель в каталоге или пишете нам, если нужен другой размер или цвет', visible: true, order: 1 },
    { id: 'details', icon: 'request', num: '02', title: 'Уточнение деталей', desc: 'Мы подтверждаем наличие, стоимость, сроки изготовления и способ получения', visible: true, order: 2 },
    { id: 'production', icon: 'hammer', num: '03', title: 'Изготовление', desc: 'Готовим часы на собственном производстве и контролируем качество изделия', visible: true, order: 3 },
    { id: 'handover', icon: 'package', num: '04', title: 'Передача заказа', desc: 'Передаём заказ самовывозом или согласуем доставку по Беларуси', visible: true, order: 4 }
  ],
  workBenefits: [
    { id: 'quality', icon: 'shield', title: 'Гарантия качества', desc: 'Проверяем часы перед передачей клиенту', visible: true, order: 1 },
    { id: 'deadlines', icon: 'clock', title: 'Согласуем сроки', desc: 'Заранее сообщаем дату готовности заказа', visible: true, order: 2 },
    { id: 'own-production', icon: 'factory', title: 'Свое производство', desc: 'Делаем изделия сами, без лишних посредников', visible: true, order: 3 },
    { id: 'delivery', icon: 'truck', title: 'Доставка по Беларуси', desc: 'Согласуем удобный способ получения', visible: true, order: 4 }
  ],
  gallerySection: {
    enabled: true,
    eyebrow: 'производство и детали',
    title: 'Изделия и детали Bullmet',
    buttonLabel: 'Производство',
    buttonHref: '/production'
  },
  gallery: [
    { id: 'ready-clocks', src: '/mockup/gallery-4.jpg', title: 'Готовые часы', note: 'Настенные часы из металла с элементами дерева', visible: true, order: 1 },
    { id: 'details', src: '/mockup/gallery-1.jpg', title: 'Работа с деталями', note: 'Подготовка металлических элементов на производстве', visible: true, order: 2 },
    { id: 'production', src: '/mockup/gallery-3.jpg', title: 'Производство', note: 'Собственное производство Bullmet в Беларуси', visible: true, order: 3 },
    { id: 'quality', src: '/mockup/gallery-5.jpg', title: 'Контроль качества', note: 'Проверяем внешний вид и сборку перед передачей', visible: true, order: 4 },
    { id: 'materials', src: '/mockup/gallery-2.jpg', title: 'Материалы', note: 'Металл и дерево для изделий Bullmet', visible: true, order: 5 },
    { id: 'workshop', src: '/mockup/gallery-6.jpg', title: 'Мастерская', note: 'Рабочие процессы собственного производства', visible: true, order: 6 }
  ],
  cta: {
    enabled: true,
    eyebrow: 'готовы выбрать часы?',
    title: 'Откройте каталог настенных часов',
    text: 'Выберите модель в каталоге, добавьте товар в корзину или свяжитесь с нами для уточнения деталей.',
    primaryLabel: 'Перейти в каталог',
    primaryHref: '/catalog',
    secondaryLabel: 'Связаться',
    secondaryHref: '/contacts'
  }
};

function asObject(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function mergeArray<T extends { id: string; order: number }>(defaults: T[], incoming: unknown): T[] {
  const list = Array.isArray(incoming) ? incoming : [];
  return defaults.map((item) => {
    const match = list.find((candidate: any) => candidate?.id === item.id);
    return { ...item, ...asObject(match) } as T;
  }).sort((a, b) => a.order - b.order);
}

export function mergeHomepageControl(value: unknown): HomeControlSettings {
  const incoming = asObject(value);

  return {
    hero: { ...defaultHomepageControl.hero, ...asObject(incoming.hero) },
    features: mergeArray(defaultHomepageControl.features, incoming.features),
    directionsSection: { ...defaultHomepageControl.directionsSection, ...asObject(incoming.directionsSection) },
    directions: mergeArray(defaultHomepageControl.directions, incoming.directions),
    productsSection: { ...defaultHomepageControl.productsSection, ...asObject(incoming.productsSection) },
    productionSection: { ...defaultHomepageControl.productionSection, ...asObject(incoming.productionSection) },
    productionBenefits: mergeArray(defaultHomepageControl.productionBenefits, incoming.productionBenefits),
    stepsSection: { ...defaultHomepageControl.stepsSection, ...asObject(incoming.stepsSection) },
    steps: mergeArray(defaultHomepageControl.steps, incoming.steps),
    workBenefits: mergeArray(defaultHomepageControl.workBenefits, incoming.workBenefits),
    gallerySection: { ...defaultHomepageControl.gallerySection, ...asObject(incoming.gallerySection) },
    gallery: mergeArray(defaultHomepageControl.gallery, incoming.gallery),
    cta: { ...defaultHomepageControl.cta, ...asObject(incoming.cta) }
  };
}

export async function getHomepageControlSettings(): Promise<HomeControlSettings> {
  if (!serverSupabase) return defaultHomepageControl;

  const { data, error } = await serverSupabase
    .from('site_settings')
    .select('value')
    .eq('key', homepageControlKey)
    .maybeSingle();

  if (error || !data?.value) return defaultHomepageControl;
  return mergeHomepageControl(data.value);
}

export function visibleHomeItems<T extends { visible: boolean; order: number }>(items: T[]) {
  return items.filter((item) => item.visible).sort((a, b) => a.order - b.order);
}
