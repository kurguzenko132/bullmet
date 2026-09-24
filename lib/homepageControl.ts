import { serverSupabase } from './serverSupabase';
import { withSiteSettingsRevision } from './siteSettingsConcurrency';

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

export type HomeCollectionCard = HomeDirectionCard & { description: string };

export type HomeFaqItem = {
  id: string;
  question: string;
  answer: string;
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

export type HomeHeroSlide = {
  id: string;
  kicker: string;
  title: string;
  text: string;
  image: string;
  imageAlt: string;
  primaryLabel: string;
  primaryHref: string;
  visible: boolean;
  order: number;
};

export type HomeLayoutSection = {
  id: 'hero' | 'directions' | 'products' | 'production' | 'steps' | 'gallery' | 'cta';
  label: string;
  visible: boolean;
  order: number;
  locked?: boolean;
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
  heroSlides: HomeHeroSlide[];
  seo: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    canonical: string;
    robotsIndex: boolean;
  };
  settings: {
    heroAutoplay: boolean;
    heroInterval: number;
    showDots: boolean;
    showArrows: boolean;
    lazyImages: boolean;
  };
  layout: HomeLayoutSection[];
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
  collectionsSection: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    buttonLabel: string;
    buttonHref: string;
  };
  collections: HomeCollectionCard[];
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
  reviewsSection: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    limit: number;
    mode: 'auto' | 'manual';
    selectedIds: string[];
  };
  faqSection: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    text: string;
    image: string;
  };
  faqItems: HomeFaqItem[];
  cta: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    text: string;
    image: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
    benefits: HomeBenefit[];
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
  heroSlides: [
    {
      id: 'hero-main',
      kicker: 'Производство металлоизделий Bullmet',
      title: 'Изделия из металла с элементами дерева',
      text: 'Изготавливаем: садовую мебель, мебель для дома в стиле лофт, качели, навесы, малые архитектурные формы, а также выполняем художественную лазерную резку из листового металла.',
      image: '/assets/hero-bullmet.png',
      imageAlt: 'Станок режет металл',
      primaryLabel: 'Перейти в каталог',
      primaryHref: '/catalog',
      visible: true,
      order: 1
    }
  ],
  seo: {
    title: 'Bullmet — изделия из металла и дерева',
    description: 'Настенные часы и изделия из металла с элементами дерева собственного производства Bullmet.',
    ogTitle: 'Bullmet — изделия из металла и дерева',
    ogDescription: 'Собственное производство изделий Bullmet.',
    ogImage: '/assets/hero-bullmet.png',
    canonical: 'https://bullmet.by/',
    robotsIndex: true
  },
  settings: {
    heroAutoplay: false,
    heroInterval: 5000,
    showDots: true,
    showArrows: true,
    lazyImages: true
  },
  layout: [
    { id: 'hero', label: 'Главный слайд (Hero)', visible: true, order: 1, locked: true },
    { id: 'directions', label: 'Преимущества и направления', visible: true, order: 2 },
    { id: 'production', label: 'Собственное производство', visible: true, order: 3 },
    { id: 'products', label: 'Популярные товары и услуги', visible: true, order: 4 },
    { id: 'steps', label: 'Как мы работаем', visible: true, order: 5 },
    { id: 'gallery', label: 'Галерея производства', visible: true, order: 6 },
    { id: 'cta', label: 'Индивидуальный заказ', visible: true, order: 7 }
  ],
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
    { id: 'loft', title: 'Мебель для дома\nв стиле лофт', img: '/mockup/cat-custom.jpg', href: '/services', visible: true, order: 3 },
    { id: 'laser', title: 'Лазерная\nрезка', img: '/mockup/cat-metal.jpg', href: '/services#laser', visible: true, order: 4 },
    { id: 'wholesale', title: 'Мелкий опт\nметаллопроката', img: '/mockup/service-metal.jpg', href: '/contacts', visible: true, order: 5 }
  ],
  productsSection: {
    enabled: true,
    eyebrow: 'популярные модели',
    title: 'Популярные часы',
    text: 'Модели, с которых удобно начать знакомство с Bullmet.',
    buttonLabel: 'Все часы',
    buttonHref: '/catalog',
    limit: 3,
    onlyClocks: true
  },
  collectionsSection: {
    enabled: true,
    eyebrow: 'Коллекции',
    title: 'Подберите часы под интерьер',
    buttonLabel: 'Смотреть все коллекции',
    buttonHref: '/catalog'
  },
  collections: [
    { id: 'classic', title: 'Классика', description: 'Универсальный стиль\nна все времена', img: '/assets/prod-clock-classic.jpg', href: '/catalog?category=classic', visible: true, order: 1 },
    { id: 'coffee-kitchen', title: 'Кофе и кухня', description: 'Для уютной\nатмосферы', img: '/mockup/prod-clock-1.jpg', href: '/catalog?category=coffee-kitchen', visible: true, order: 2 },
    { id: 'loft', title: 'Лофт', description: 'Стиль и характер\nв интерьере', img: '/assets/prod-clock-loft.jpg', href: '/catalog?category=loft', visible: true, order: 3 },
    { id: 'roman', title: 'Римские цифры', description: 'Элегантная\nклассика', img: '/mockup/prod-clock-2.jpg', href: '/catalog?category=roman', visible: true, order: 4 },
    { id: 'wood', title: 'С элементами дерева', description: 'Тепло натуральных\nматериалов', img: '/assets/prod-clock-classic.jpg', href: '/catalog?material=Металл%20с%20элементами%20дерева', visible: true, order: 5 },
    { id: 'quotes', title: 'Надписи', description: 'Индивидуальный\nхарактер', img: '/mockup/gallery-4.jpg', href: '/catalog?category=Цитаты%20и%20надписи', visible: true, order: 6 }
  ],
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
    title: 'Как мы работаем',
    text: 'Пять понятных этапов от заявки до передачи готового заказа.'
  },
  steps: [
    { id: 'request', icon: 'request', num: '01', title: 'Вы оставляете заявку', desc: 'Через форму на сайте или по телефону', visible: true, order: 1 },
    { id: 'details', icon: 'ruler', num: '02', title: 'Мы уточняем детали', desc: 'Размеры, материал, пожелания', visible: true, order: 2 },
    { id: 'calculation', icon: 'calculator', num: '03', title: 'Рассчитываем стоимость', desc: 'Согласовываем цену и сроки', visible: true, order: 3 },
    { id: 'manufacturing', icon: 'hammer', num: '04', title: 'Изготавливаем изделие', desc: 'Контроль качества на каждом этапе', visible: true, order: 4 },
    { id: 'delivery', icon: 'package', num: '05', title: 'Передаём или доставляем заказ', desc: 'Самовывоз или доставка по Беларуси', visible: true, order: 5 }
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
  reviewsSection: {
    enabled: true,
    eyebrow: 'Отзывы покупателей',
    title: 'Отзывы покупателей',
    limit: 3,
    mode: 'auto',
    selectedIds: []
  },
  faqSection: {
    enabled: true,
    eyebrow: 'Частые вопросы',
    title: 'Ответы\nна ваши вопросы',
    text: 'Мы собрали ответы на популярные вопросы о наших часах, размерах, вариантах исполнения и доставке.',
    image: '/assets/prod-clock-classic.jpg'
  },
  faqItems: [
    { id: 'sizes', question: 'Какие размеры часов доступны?', answer: 'Доступные размеры зависят от конкретной модели. Основные варианты указаны в карточке товара. Если нужен другой размер, свяжитесь с нами — уточним возможность изготовления.', visible: true, order: 1 },
    { id: 'color', question: 'Можно ли выбрать цвет часов?', answer: 'Да, для большинства моделей доступны разные варианты исполнения. Доступные цвета отображаются в карточке товара. Другой вариант можно уточнить у нас перед заказом.', visible: true, order: 2 },
    { id: 'production-time', question: 'Сколько занимает изготовление?', answer: 'Срок зависит от модели, размера и текущей загрузки производства. Точный срок сообщим после уточнения выбранного исполнения.', visible: true, order: 3 },
    { id: 'mounting', question: 'Как крепятся часы?', answer: 'Способ крепления зависит от модели. Необходимое крепление указывается в характеристиках товара и передаётся вместе с заказом, если предусмотрено комплектацией.', visible: true, order: 4 },
    { id: 'delivery', question: 'Есть ли доставка по Беларуси?', answer: 'Да. Согласуем удобный способ получения заказа по Беларуси. Доступные варианты и стоимость уточняются при оформлении.', visible: true, order: 5 },
    { id: 'custom', question: 'Можно ли заказать часы в другом исполнении?', answer: 'Для многих моделей можно изменить размер, цвет или отдельные элементы исполнения. Напишите нам, и мы уточним, что возможно для выбранной модели.', visible: true, order: 6 }
  ],
  cta: {
    enabled: true,
    eyebrow: 'Индивидуальные решения',
    title: 'Нужен другой\nразмер или цвет?',
    text: 'Многие модели наших часов мы можем изготовить в другом размере, цвете или варианте исполнения. Подберём решение под ваш интерьер — от компактных версий до крупных акцентных моделей.',
    image: '/assets/contacts-cta-workbench.jpg',
    primaryLabel: 'Связаться с нами',
    primaryHref: '/contacts',
    secondaryLabel: 'Смотреть каталог',
    secondaryHref: '/catalog',
    benefits: [
      { id: 'options', icon: 'tools', title: 'Варианты исполнения', desc: 'под ваши пожелания', visible: true, order: 1 },
      { id: 'colors', icon: 'materials', title: 'Выбор размеров,', desc: 'цветов и покрытий', visible: true, order: 2 },
      { id: 'quality-style', icon: 'spark', title: 'Сохраняем качество', desc: 'и стиль модели', visible: true, order: 3 }
    ]
  }
};

function asObject(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function mergeArray<T extends { id: string; order: number }>(defaults: T[], incoming: unknown): T[] {
  if (!Array.isArray(incoming)) return defaults;
  return incoming
    .filter((candidate: any) => candidate?.id)
    .map((candidate: any) => {
      const base = defaults.find((item) => item.id === candidate.id) || defaults[0];
      return { ...base, ...asObject(candidate) } as T;
    })
    .sort((a, b) => a.order - b.order);
}

export function mergeHomepageControl(value: unknown): HomeControlSettings {
  const incoming = asObject(value);

  const hero = { ...defaultHomepageControl.hero, ...asObject(incoming.hero) };
  const legacyHeroSlide: HomeHeroSlide = {
    id: 'hero-main',
    kicker: hero.kicker,
    title: hero.title,
    text: hero.text,
    image: hero.image,
    imageAlt: hero.imageAlt,
    primaryLabel: hero.primaryLabel,
    primaryHref: hero.primaryHref,
    visible: hero.enabled,
    order: 1
  };
  const configuredSlides = Array.isArray(incoming.heroSlides) ? incoming.heroSlides : [legacyHeroSlide];
  const heroSlides = mergeArray(defaultHomepageControl.heroSlides, configuredSlides);

  return {
    hero,
    heroSlides,
    seo: { ...defaultHomepageControl.seo, ...asObject(incoming.seo) },
    settings: { ...defaultHomepageControl.settings, ...asObject(incoming.settings) },
    layout: mergeArray(defaultHomepageControl.layout, incoming.layout),
    features: mergeArray(defaultHomepageControl.features, incoming.features),
    directionsSection: { ...defaultHomepageControl.directionsSection, ...asObject(incoming.directionsSection) },
    directions: mergeArray(defaultHomepageControl.directions, incoming.directions),
    productsSection: { ...defaultHomepageControl.productsSection, ...asObject(incoming.productsSection) },
    collectionsSection: { ...defaultHomepageControl.collectionsSection, ...asObject(incoming.collectionsSection) },
    collections: mergeArray(defaultHomepageControl.collections, incoming.collections),
    productionSection: { ...defaultHomepageControl.productionSection, ...asObject(incoming.productionSection) },
    productionBenefits: mergeArray(defaultHomepageControl.productionBenefits, incoming.productionBenefits),
    stepsSection: { ...defaultHomepageControl.stepsSection, ...asObject(incoming.stepsSection) },
    steps: mergeArray(defaultHomepageControl.steps, incoming.steps),
    workBenefits: mergeArray(defaultHomepageControl.workBenefits, incoming.workBenefits),
    gallerySection: { ...defaultHomepageControl.gallerySection, ...asObject(incoming.gallerySection) },
    gallery: mergeArray(defaultHomepageControl.gallery, incoming.gallery),
    reviewsSection: { ...defaultHomepageControl.reviewsSection, ...asObject(incoming.reviewsSection) },
    faqSection: { ...defaultHomepageControl.faqSection, ...asObject(incoming.faqSection) },
    faqItems: mergeArray(defaultHomepageControl.faqItems, incoming.faqItems),
    cta: { ...defaultHomepageControl.cta, ...asObject(incoming.cta), benefits: mergeArray(defaultHomepageControl.cta.benefits, asObject(incoming.cta).benefits) }
  };
}

export async function getHomepageControlSettings(): Promise<HomeControlSettings> {
  if (!serverSupabase) return defaultHomepageControl;

  const { data, error } = await serverSupabase
    .from('site_settings')
    .select('value, updated_at')
    .eq('key', homepageControlKey)
    .maybeSingle();

  if (error || !data?.value) return defaultHomepageControl;
  return withSiteSettingsRevision(mergeHomepageControl(data.value), data.updated_at);
}

export function visibleHomeItems<T extends { visible: boolean; order: number }>(items: T[]) {
  return items.filter((item) => item.visible).sort((a, b) => a.order - b.order);
}
