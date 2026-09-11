import { serverSupabase } from './serverSupabase';

export type ServiceCard = { id: string; directionKey: string; icon: string; title: string; subtitle: string; image: string; items: string[]; href: string; visible: boolean; order: number };
export type ServiceStep = { id: string; number: string; title: string; text: string; visible: boolean; order: number };
export type ServicesControlSettings = { hero: { enabled: boolean; kicker: string; title: string; text: string; image: string; primaryLabel: string; secondaryLabel: string }; services: ServiceCard[]; steps: ServiceStep[]; examples: string[]; };
export const servicesControlKey = 'services_control';
export const defaultServicesControl: ServicesControlSettings = {
  hero: { enabled: true, kicker: 'Услуги производства', title: 'Производственные возможности Bullmet', text: 'Работаем с металлом, элементами дерева и индивидуальными проектами. Здесь собраны основные производственные направления Bullmet.', image: '/assets/hero-machine.jpg', primaryLabel: 'Связаться', secondaryLabel: 'Смотреть каталог' },
  services: [
    { id: 'laser', directionKey: 'laser_cutting', icon: 'spark', title: 'Лазерная резка', subtitle: 'Декор, таблички, вывески, панели и детали из листового металла.', image: '/assets/service-metal.jpg', items: ['по чертежу или эскизу', 'аккуратный рез', 'подготовка под покраску'], href: '/contacts', visible: true, order: 1 },
    { id: 'bending', directionKey: 'metal_bending', icon: 'materials', title: 'Гибка металла', subtitle: 'Детали для мебели, навесов, каркасов и малых архитектурных форм.', image: '/assets/service-wood.jpg', items: ['индивидуальные размеры', 'разовые и серийные задачи', 'согласование до запуска'], href: '/contacts', visible: true, order: 2 },
    { id: 'custom', directionKey: 'loft_furniture', icon: 'custom', title: 'Изделия под заказ', subtitle: 'Изготовление по фото, ссылке на пример, чертежу или вашей идее.', image: '/assets/cat-custom.jpg', items: ['часы, качели, мебель', 'металл с элементами дерева', 'адаптация под задачу'], href: '/contacts', visible: true, order: 3 },
    { id: 'metal', directionKey: 'metal_wholesale', icon: 'factory', title: 'Мелкий опт металлопроката', subtitle: 'Подбор и подготовка металла под производство, участок или ремонт.', image: '/assets/cat-metal.jpg', items: ['подбор материала', 'ориентир по количеству', 'подготовка под задачу'], href: '/contacts', visible: true, order: 4 }
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
function mergeList<T extends { id: string; order: number }>(defaults: T[], value: unknown) { if (!Array.isArray(value)) return defaults; return value.filter((item: any) => item?.id).map((item: any, index) => ({ ...(defaults.find((base) => base.id === item.id) || {}), ...object(item), order: Number(item.order || index + 1) } as T)).sort((a, b) => a.order - b.order); }
export function mergeServicesControl(value: unknown): ServicesControlSettings { const input = object(value); return { hero: { ...defaultServicesControl.hero, ...object(input.hero) }, services: mergeList(defaultServicesControl.services, input.services), steps: mergeList(defaultServicesControl.steps, input.steps), examples: Array.isArray(input.examples) ? input.examples.map(String).filter(Boolean) : defaultServicesControl.examples }; }
export async function getServicesControlSettings() { if (!serverSupabase) return defaultServicesControl; const { data, error } = await serverSupabase.from('site_settings').select('value').eq('key', servicesControlKey).maybeSingle(); return error || !data?.value ? defaultServicesControl : mergeServicesControl(data.value); }
export function visibleServicesItems<T extends { visible: boolean; order: number }>(items: T[]) { return items.filter((item) => item.visible).sort((a, b) => a.order - b.order); }
