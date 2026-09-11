import { serverSupabase } from './serverSupabase';

export type ProductionFact = { id: string; icon: 'shield' | 'layers' | 'check'; title: string; text: string; visible: boolean; order: number };
export type ProductionPoint = { id: string; icon: 'layers' | 'paint' | 'box' | 'clock' | 'tools'; title: string; text: string; visible: boolean; order: number };
export type ProductionStep = { id: string; number: string; title: string; text: string; image: string; visible: boolean; order: number };
export type ProductionResult = { id: string; title: string; text: string; image: string; visible: boolean; order: number };

export type ProductionControlSettings = {
  hero: { enabled: boolean; kicker: string; title: string; text: string; image: string; catalogLabel: string; contactLabel: string };
  facts: ProductionFact[];
  structure: { enabled: boolean; eyebrow: string; title: string; image: string; imageAlt: string; left: ProductionPoint[]; right: ProductionPoint[] };
  process: { enabled: boolean; title: string; steps: ProductionStep[] };
  results: { enabled: boolean; title: string; text: string; items: ProductionResult[]; ctaTitle: string; ctaText: string; ctaLabel: string };
};

export const productionControlKey = 'production_control';

export const defaultProductionControl: ProductionControlSettings = {
  hero: { enabled: true, kicker: 'Производство Bullmet', title: 'От металла до готовых настенных часов', text: 'Мы сами изготавливаем, окрашиваем, собираем и проверяем изделия, чтобы вы получали часы, которые будут выглядеть аккуратно и служить долго.', image: '/assets/hero-bullmet.png', catalogLabel: 'Смотреть каталог', contactLabel: 'Связаться' },
  facts: [
    { id: 'own', icon: 'shield', title: 'Собственное производство', text: 'Полный цикл работ без лишних посредников.', visible: true, order: 1 },
    { id: 'materials', icon: 'layers', title: 'Металл + дерево', text: 'Сочетание прочности и тёплой фактуры.', visible: true, order: 2 },
    { id: 'quality', icon: 'check', title: 'Контроль перед передачей', text: 'Проверяем внешний вид и сборку каждого изделия.', visible: true, order: 3 }
  ],
  structure: {
    enabled: true, eyebrow: 'Детали', title: 'Из чего состоят наши часы', image: '/assets/production-clock-numeral-clean.png', imageAlt: 'Настенные часы Bullmet с крупными цифрами',
    left: [
      { id: 'metal', icon: 'layers', title: 'Металлическая основа', text: 'Прочный металл обеспечивает форму, жёсткость и долговечность.', visible: true, order: 1 },
      { id: 'paint', icon: 'paint', title: 'Покраска', text: 'Порошковое покрытие защищает металл и сохраняет аккуратный внешний вид.', visible: true, order: 2 }
    ],
    right: [
      { id: 'wood', icon: 'box', title: 'Деревянный элемент', text: 'Добавляет теплоту, фактуру и делает изделие ближе к интерьеру.', visible: true, order: 1 },
      { id: 'mechanism', icon: 'clock', title: 'Механизм и стрелки', text: 'Тихий кварцевый механизм и стрелки под выбранный стиль.', visible: true, order: 2 },
      { id: 'mount', icon: 'tools', title: 'Крепление', text: 'Продуманное крепление для простой установки на стену.', visible: true, order: 3 }
    ]
  },
  process: { enabled: true, title: 'Как создаются наши часы', steps: [
    { id: 'metal', number: '01', title: 'Металл', text: 'Подбираем металл нужной толщины и качества.', image: '/assets/cat-metal.jpg', visible: true, order: 1 },
    { id: 'cutting', number: '02', title: 'Резка', text: 'Вырезаем элементы на современном оборудовании.', image: '/assets/hero-machine.jpg', visible: true, order: 2 },
    { id: 'processing', number: '03', title: 'Обработка', text: 'Шлифуем края, убираем заусенцы и готовим поверхность.', image: '/assets/production.jpg', visible: true, order: 3 },
    { id: 'painting', number: '04', title: 'Покраска', text: 'Наносим покрытие для ровного цвета и защиты.', image: '/assets/service-metal.jpg', visible: true, order: 4 },
    { id: 'assembly', number: '05', title: 'Сборка', text: 'Соединяем металл, дерево, механизм и стрелки.', image: '/assets/gallery-5.jpg', visible: true, order: 5 },
    { id: 'check', number: '06', title: 'Проверка', text: 'Проверяем ход часов, внешний вид и комплектацию.', image: '/assets/prod-clock-classic.jpg', visible: true, order: 6 }
  ] },
  results: { enabled: true, title: 'Готовый результат', text: 'Создаём часы для разных интерьеров, задач и подарков.', ctaTitle: 'Выберите свои часы', ctaText: 'Перейдите в каталог и найдите модель под ваш интерьер.', ctaLabel: 'Смотреть каталог', items: [
    { id: 'home', title: 'Для дома', text: 'Уютный акцент для гостиной, кухни или спальни.', image: '/assets/result-home.jpg', visible: true, order: 1 },
    { id: 'office', title: 'Для офиса', text: 'Строгий элемент интерьера для кабинета или переговорной.', image: '/assets/result-office.jpg', visible: true, order: 2 },
    { id: 'cafe', title: 'Для кафе и ресторанов', text: 'Декор, который поддерживает атмосферу заведения.', image: '/assets/result-cafe.jpg', visible: true, order: 3 },
    { id: 'gift', title: 'В подарок', text: 'Практичный и запоминающийся подарок.', image: '/assets/result-gift.jpg', visible: true, order: 4 }
  ] }
};

function object(value: unknown) { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function mergeList<T extends { id: string; order: number }>(defaults: T[], value: unknown) {
  if (!Array.isArray(value)) return defaults;
  return value.filter((item: any) => item?.id).map((item: any, index) => ({ ...(defaults.find((base) => base.id === item.id) || {}), ...object(item), order: Number(item.order || index + 1) } as T)).sort((a, b) => a.order - b.order);
}

export function mergeProductionControl(value: unknown): ProductionControlSettings {
  const input = object(value); const structure = object(input.structure); const process = object(input.process); const results = object(input.results);
  return {
    hero: { ...defaultProductionControl.hero, ...object(input.hero) },
    facts: mergeList(defaultProductionControl.facts, input.facts),
    structure: { ...defaultProductionControl.structure, ...structure, left: mergeList(defaultProductionControl.structure.left, structure.left), right: mergeList(defaultProductionControl.structure.right, structure.right) },
    process: { ...defaultProductionControl.process, ...process, steps: mergeList(defaultProductionControl.process.steps, process.steps) },
    results: { ...defaultProductionControl.results, ...results, items: mergeList(defaultProductionControl.results.items, results.items) }
  };
}

export async function getProductionControlSettings(): Promise<ProductionControlSettings> {
  if (!serverSupabase) return defaultProductionControl;
  const { data, error } = await serverSupabase.from('site_settings').select('value').eq('key', productionControlKey).maybeSingle();
  return error || !data?.value ? defaultProductionControl : mergeProductionControl(data.value);
}

export function visibleProductionItems<T extends { visible: boolean; order: number }>(items: T[]) { return items.filter((item) => item.visible).sort((a, b) => a.order - b.order); }
