import type { ImageDisplaySettings } from '../lib/imageDisplay';

export type ProductVariant = {
  id: string;
  name: string;
  slug: string;
  colorHex?: string;
  image: string;
  images: string[];
  imageSettings?: Record<string, ImageDisplaySettings>;
  catalogImageFit?: 'cover' | 'contain';
  catalogImagePosition?: string;
  productImageFit?: 'cover' | 'contain';
  productImagePosition?: string;
};

export type Product = {
  slug: string;
  title: string;
  category: string;
  material: string;
  short: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  images: string[];
  sizes?: string[];
  specs: string[];
  catalogImageFit?: 'cover' | 'contain';
  catalogImagePosition?: string;
  productImageFit?: 'cover' | 'contain';
  productImagePosition?: string;
  imageSettings?: Record<string, ImageDisplaySettings>;
  variants?: ProductVariant[];
  status?: 'active' | 'draft';
  isPopular?: boolean;
  isNew?: boolean;
  inStock?: boolean;
  activeVariantId?: string;
  parentSlug?: string;
  variantName?: string;
  variantSlug?: string;
  variantColorHex?: string;
};


export function slugifyVariant(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[а-яё]/g, (char) => {
      const map: Record<string, string> = {
        а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
      };
      return map[char] ?? char;
    })
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'color';
}

export function getProductVariantSlug(product: Product, variant: ProductVariant) {
  return `${product.slug}-${variant.slug}`;
}

export function applyVariantToProduct(product: Product, variant?: ProductVariant): Product {
  if (!variant) return product;
  return {
    ...product,
    slug: getProductVariantSlug(product, variant),
    parentSlug: product.slug,
    activeVariantId: variant.id,
    variantName: variant.name,
    variantSlug: variant.slug,
    variantColorHex: variant.colorHex,
    image: variant.image,
    images: variant.images?.length ? variant.images : [variant.image],
    imageSettings: variant.imageSettings ?? product.imageSettings ?? {},
    catalogImageFit: variant.catalogImageFit ?? product.catalogImageFit,
    catalogImagePosition: variant.catalogImagePosition ?? product.catalogImagePosition,
    productImageFit: variant.productImageFit ?? product.productImageFit,
    productImagePosition: variant.productImagePosition ?? product.productImagePosition,
  };
}

export function expandProductVariants(items: Product[]): Product[] {
  return items.flatMap((product) => {
    const variants = product.variants?.filter((variant) => variant.name && variant.image) ?? [];
    if (!variants.length) return [product];
    return variants.map((variant) => applyVariantToProduct(product, variant));
  });
}

export function findProductByVariantSlug(items: Product[], slug: string): Product | null {
  for (const product of items) {
    if (product.slug === slug) return product;
    for (const variant of product.variants ?? []) {
      if (getProductVariantSlug(product, variant) === slug) return applyVariantToProduct(product, variant);
    }
  }
  return null;
}

export const categories = [
  'Часы собственного производства',
  'Садовые качели',
  'Резка металла',
  'Резка дерева',
  'Изделия на заказ',
  'Элементы декора',
  'Мебель и предметы интерьера',
];

export const products: Product[] = [
  {
    slug: 'wall-clock-loft',
    title: 'Настенные часы Loft',
    category: 'Часы собственного производства',
    material: 'Металл + дерево',
    short: 'Металл · дерево',
    description: 'Стильные настенные часы в стиле Loft. Сочетание натурального дерева и металлического каркаса делает изделие акцентом для гостиной, офиса или загородного дома.',
    price: 120,
    oldPrice: 150,
    image: '/assets/cat-clock.jpg',
    images: ['/assets/cat-clock.jpg', '/assets/prod-clock-loft.jpg', '/assets/prod-clock-classic.jpg', '/assets/gallery-4.jpg'],
    sizes: ['40 см', '60 см', '80 см'],
    specs: ['Диаметр: 60 см', 'Материал: металл, дерево дуб', 'Покрытие: порошковая покраска', 'Механизм: бесшумный', 'Крепление в комплекте'],
  },
  {
    slug: 'garden-swing-bullmet',
    title: 'Садовые качели Bullmet',
    category: 'Садовые качели',
    material: 'Профильная труба, дерево',
    short: 'Прочная металлическая рама',
    description: 'Надежные садовые качели для участка, дачи или зоны отдыха. Каркас из металла, сиденье из дерева, возможна окраска под ваш экстерьер.',
    price: 650,
    image: '/assets/cat-swing.jpg',
    images: ['/assets/cat-swing.jpg', '/assets/prod-swing.jpg', '/assets/prod-swing-comfort.jpg', '/assets/gallery-5.jpg'],
    sizes: ['160 см', '180 см', '200 см'],
    specs: ['Каркас: профильная труба', 'Сиденье: дерево', 'Покрытие: порошковая покраска', 'Для улицы и сада', 'Возможны индивидуальные размеры'],
  },
  {
    slug: 'wall-clock-classic',
    title: 'Настенные часы Classic',
    category: 'Часы собственного производства',
    material: 'Металл',
    short: 'Металл',
    description: 'Лаконичные металлические часы для современного интерьера. Подходят для дома, офиса, кафе и шоурума.',
    price: 140,
    image: '/assets/prod-clock-classic.jpg',
    images: ['/assets/prod-clock-classic.jpg', '/assets/cat-clock.jpg', '/assets/gallery-4.jpg'],
    sizes: ['50 см', '70 см'],
    specs: ['Материал: металл', 'Покрытие: порошковая покраска', 'Механизм: бесшумный', 'Цвет по согласованию'],
  },
  {
    slug: 'wall-clock-industrial',
    title: 'Часы Industrial',
    category: 'Часы собственного производства',
    material: 'Металл + дерево',
    short: 'Металл · дерево',
    description: 'Крупные декоративные часы с индустриальным характером. Хорошо смотрятся в loft-интерьерах и коммерческих пространствах.',
    price: 180,
    image: '/assets/prod-clock-loft.jpg',
    images: ['/assets/prod-clock-loft.jpg', '/assets/cat-clock.jpg', '/assets/prod-clock-classic.jpg'],
    sizes: ['60 см', '80 см', '100 см'],
    specs: ['Диаметр: до 100 см', 'Материал: металл, дерево', 'Индивидуальный цвет', 'Крепление в комплекте'],
  },
  {
    slug: 'garden-comfort-swing',
    title: 'Качели Garden Comfort',
    category: 'Садовые качели',
    material: 'Металл + дерево',
    short: 'Для дачи и сада',
    description: 'Комфортная модель садовых качелей с усиленной конструкцией и аккуратным внешним видом.',
    price: 700,
    image: '/assets/prod-swing-comfort.jpg',
    images: ['/assets/prod-swing-comfort.jpg', '/assets/cat-swing.jpg', '/assets/prod-swing.jpg'],
    sizes: ['180 см', '200 см'],
    specs: ['Усиленная рама', 'Деревянное сиденье', 'Покрытие для улицы', 'Возможна доставка'],
  },
  {
    slug: 'wood-tree-panel',
    title: 'Панно «Дерево жизни»',
    category: 'Резка дерева',
    material: 'Дерево',
    short: 'Металл',
    description: 'Декоративное деревянное панно, выполненное резкой по дереву. Размер и рисунок можно адаптировать под проект.',
    price: 180,
    image: '/assets/cat-wood.jpg',
    images: ['/assets/cat-wood.jpg', '/assets/service-wood.jpg', '/assets/gallery-6.jpg'],
    sizes: ['40 см', '60 см', '90 см'],
    specs: ['Материал: фанера/дерево', 'Индивидуальный рисунок', 'Шлифовка и обработка', 'Подходит для интерьера'],
  },
  {
    slug: 'decorative-grille',
    title: 'Решетка декоративная',
    category: 'Элементы декора',
    material: 'Металл',
    short: 'Металл',
    description: 'Декоративная металлическая решетка для интерьера, фасада, ограждений или мебели. Возможна резка по вашему файлу.',
    price: 90,
    image: '/assets/cat-custom.jpg',
    images: ['/assets/cat-custom.jpg', '/assets/service-metal.jpg', '/assets/gallery-6.jpg'],
    sizes: ['По размеру'],
    specs: ['Материал: металл', 'Резка по макету', 'Покраска по RAL', 'Изготовление под заказ'],
  },
  {
    slug: 'metal-house-number',
    title: 'Номер дома металлический',
    category: 'Элементы декора',
    material: 'Металл',
    short: 'Металл',
    description: 'Аккуратный металлический номер дома с порошковой покраской. Можно изменить размер, шрифт и цвет.',
    price: 60,
    image: '/assets/custom-bg.jpg',
    images: ['/assets/custom-bg.jpg', '/assets/cat-custom.jpg', '/assets/service-metal.jpg'],
    sizes: ['30 см', '40 см', '50 см'],
    specs: ['Материал: металл', 'Порошковая покраска', 'Крепление в комплекте', 'Дизайн по согласованию'],
  },
  {
    slug: 'metal-cutting-service',
    title: 'Резка металла по макету',
    category: 'Резка металла',
    material: 'Металл',
    short: 'Услуга производства',
    description: 'Выполняем резку металла для декоративных изделий, деталей, табличек, решеток и индивидуальных проектов.',
    price: 50,
    image: '/assets/cat-metal.jpg',
    images: ['/assets/cat-metal.jpg', '/assets/service-metal.jpg', '/assets/gallery-1.jpg'],
    sizes: ['По расчету'],
    specs: ['Работа по чертежу', 'Разные толщины металла', 'Подготовка к покраске', 'Расчет после заявки'],
  },
  {
    slug: 'wood-cutting-service',
    title: 'Резка дерева по макету',
    category: 'Резка дерева',
    material: 'Дерево',
    short: 'Услуга производства',
    description: 'Резка дерева и фанеры для декора, панно, вывесок, подарков и интерьерных элементов.',
    price: 45,
    image: '/assets/service-wood.jpg',
    images: ['/assets/service-wood.jpg', '/assets/cat-wood.jpg', '/assets/gallery-6.jpg'],
    sizes: ['По расчету'],
    specs: ['Работа по макету', 'Дерево и фанера', 'Декор и интерьер', 'Индивидуальный расчет'],
  },
  {
    slug: 'custom-metal-decor',
    title: 'Изделие на заказ',
    category: 'Изделия на заказ',
    material: 'Металл + дерево',
    short: 'По вашим размерам',
    description: 'Изготовим изделие по фотографии, чертежу или идее. Подходит для дома, сада, бизнеса и подарков.',
    price: 100,
    image: '/assets/cat-custom.jpg',
    images: ['/assets/cat-custom.jpg', '/assets/custom-bg.jpg', '/assets/gallery-3.jpg'],
    sizes: ['Индивидуально'],
    specs: ['Разработка по идее', 'Металл и дерево', 'Согласование макета', 'Расчет до запуска в работу'],
  },
  {
    slug: 'interior-metal-shelf',
    title: 'Полка металл и дерево',
    category: 'Мебель и предметы интерьера',
    material: 'Металл + дерево',
    short: 'Интерьерное изделие',
    description: 'Полка в стиле loft из металла и дерева. Возможно изготовление под размеры стены или ниши.',
    price: 160,
    image: '/assets/production.jpg',
    images: ['/assets/production.jpg', '/assets/cat-custom.jpg', '/assets/gallery-3.jpg'],
    sizes: ['60 см', '90 см', '120 см'],
    specs: ['Металлический каркас', 'Деревянные элементы', 'Размер под проект', 'Покраска по согласованию'],
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug) ?? products[0];
}
