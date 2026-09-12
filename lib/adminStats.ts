import type { AdminCoupon, CouponUsage } from './adminCoupons';
import type { AdminReview } from './adminContent';
import type { AdminOrder } from './adminCommerce';
import type { CatalogProduct } from './products';

export type StatsPeriod = 'today' | '7' | '30' | '90' | 'year' | 'custom';
export type StatsCompare = 'previous' | 'year' | 'none';

const TZ = 'Europe/Minsk';
export const statsThresholds = { revenueDropAlert: 10, noSalesDays: 60, categoryConcentration: 40, unpaidHours: 24 };
const paidStatuses = new Set(['Оплачен', 'Передан в доставку', 'Выполнен']);
const dayKey = (value: Date | string) => new Intl.DateTimeFormat('sv-SE', { timeZone: TZ }).format(new Date(value));
const dateLabel = (value: string) => new Intl.DateTimeFormat('ru-RU', { timeZone: TZ, day: 'numeric', month: 'short' }).format(new Date(`${value}T12:00:00`));
const customerKey = (order: AdminOrder) => String(order.customer?.phone || order.customer?.email || order.customer?.name || `guest:${order.id}`).trim().toLowerCase();
const safeDate = (value?: string) => value ? new Date(value) : null;
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
const change = (current: number, previous: number) => previous ? Math.round(((current - previous) / previous) * 100) : null;

export function statsRange(period: StatsPeriod, from?: string, to?: string) {
  const end = to ? new Date(`${to}T23:59:59`) : new Date();
  const start = from ? new Date(`${from}T00:00:00`) : new Date(end);
  if (!from) {
    if (period === 'today') start.setHours(0, 0, 0, 0);
    if (period === '7') start.setDate(start.getDate() - 6);
    if (period === '30') start.setDate(start.getDate() - 29);
    if (period === '90') start.setDate(start.getDate() - 89);
    if (period === 'year') start.setFullYear(start.getFullYear() - 1);
  }
  return { start, end };
}

function inRange(value: string | undefined, range: { start: Date; end: Date }) {
  const date = safeDate(value); return Boolean(date && date >= range.start && date <= range.end);
}

function rangeDays(range: { start: Date; end: Date }) { return Math.max(1, Math.round((range.end.getTime() - range.start.getTime()) / 86400000) + 1); }

function getPrevious(range: { start: Date; end: Date }, compare: StatsCompare) {
  const days = rangeDays(range); const end = new Date(range.start); end.setMilliseconds(-1);
  const start = new Date(end);
  if (compare === 'year') { start.setFullYear(start.getFullYear() - 1); end.setFullYear(end.getFullYear() - 1); }
  else start.setDate(start.getDate() - days + 1);
  return { start, end };
}

function metric(orders: AdminOrder[]) {
  const accounted = orders.filter((order) => paidStatuses.has(order.status || ''));
  const revenue = sum(accounted.map((order) => Number(order.total || 0)));
  const itemsSold = sum(accounted.flatMap((order) => (order.items || []).map((item) => Number(item.quantity || 1))));
  return { revenue, orders: orders.length, averageOrder: accounted.length ? Math.round(revenue / accounted.length) : 0, customers: new Set(orders.map(customerKey)).size, itemsSold, accounted };
}

export function buildAdminStats(input: { orders: AdminOrder[]; products: CatalogProduct[]; reviews: AdminReview[]; coupons: AdminCoupon[]; usages: CouponUsage[]; period: StatsPeriod; compare: StatsCompare; from?: string; to?: string }) {
  const range = statsRange(input.period, input.from, input.to); const previousRange = getPrevious(range, input.compare);
  const currentOrders = input.orders.filter((order) => inRange(order.created_at, range));
  const previousOrders = input.compare === 'none' ? [] : input.orders.filter((order) => inRange(order.created_at, previousRange));
  const current = metric(currentOrders); const previous = metric(previousOrders);
  const productBySlug = new Map(input.products.map((item) => [item.slug, item]));
  const seriesMap = new Map<string, { revenue: number; orders: number }>();
  const cursor = new Date(range.start); cursor.setHours(12, 0, 0, 0);
  while (cursor <= range.end) { seriesMap.set(dayKey(cursor), { revenue: 0, orders: 0 }); cursor.setDate(cursor.getDate() + 1); }
  current.accounted.forEach((order) => { const key = dayKey(order.created_at || range.end); const point = seriesMap.get(key); if (point) { point.revenue += Number(order.total || 0); point.orders += 1; } });
  const salesSeries = Array.from(seriesMap.entries()).map(([date, value]) => ({ date, label: dateLabel(date), revenue: value.revenue, orders: value.orders, averageOrder: value.orders ? Math.round(value.revenue / value.orders) : 0 }));
  const statuses = ['Новый', 'В работе', 'Ожидает оплаты', 'Оплачен', 'Передан в доставку', 'Выполнен', 'Отменён'].map((status) => ({ status, count: currentOrders.filter((order) => (order.status || 'Новый') === status).length })).filter((item) => item.count > 0 || currentOrders.length === 0);
  const productTotals = new Map<string, { slug: string; title: string; image?: string; sold: number; revenue: number }>();
  const categoryTotals = new Map<string, { name: string; orders: Set<string>; revenue: number }>();
  current.accounted.forEach((order) => (order.items || []).forEach((item) => {
    const slug = item.slug || item.title || 'unknown'; const product = productBySlug.get(slug);
    const total = Number(item.price || 0) * Number(item.quantity || 1); const existing = productTotals.get(slug) || { slug, title: item.title || product?.title || 'Товар', image: item.image || product?.image, sold: 0, revenue: 0 };
    existing.sold += Number(item.quantity || 1); existing.revenue += total; productTotals.set(slug, existing);
    const name = product?.category || 'Без категории'; const category = categoryTotals.get(name) || { name, orders: new Set<string>(), revenue: 0 }; category.orders.add(order.id); category.revenue += total; categoryTotals.set(name, category);
  }));
  const topProducts = Array.from(productTotals.values()).sort((a,b) => b.revenue - a.revenue).slice(0, 5);
  const categories = Array.from(categoryTotals.values()).map((item) => ({ name: item.name, orders: item.orders.size, revenue: item.revenue, share: current.revenue ? Math.round(item.revenue / current.revenue * 100) : 0 })).sort((a,b) => b.revenue - a.revenue).slice(0, 6);
  const byDelivery = new Map<string, { name: string; count: number }>(); const byPayment = new Map<string, { name: string; count: number; amount: number }>();
  currentOrders.forEach((order) => { const delivery = order.delivery || 'Не указан'; const next = byDelivery.get(delivery) || { name: delivery, count: 0 }; next.count++; byDelivery.set(delivery, next); });
  current.accounted.forEach((order) => { const payment = order.payment_method || 'Не указан'; const next = byPayment.get(payment) || { name: payment, count: 0, amount: 0 }; next.count++; next.amount += Number(order.total || 0); byPayment.set(payment, next); });
  const allAccounted = input.orders.filter((order) => paidStatuses.has(order.status || ''));
  const currentCustomerKeys = new Set(currentOrders.map(customerKey)); const historical = new Map<string, AdminOrder[]>();
  input.orders.forEach((order) => { const key = customerKey(order); historical.set(key, [...(historical.get(key) || []), order]); });
  let newCustomers = 0, repeatCustomers = 0, loyalCustomers = 0;
  currentCustomerKeys.forEach((key) => { const list = historical.get(key) || []; const prior = list.filter((order) => safeDate(order.created_at) && safeDate(order.created_at)! < range.start); if (!prior.length) newCustomers++; else repeatCustomers++; if (list.length >= 3) loyalCustomers++; });
  const publishedReviews = input.reviews.filter((review) => review.status === 'published' && inRange(review.created_at, range)); const ratingDistribution = [5,4,3,2,1].map((rating) => ({ rating, count: publishedReviews.filter((review) => Number(review.rating) === rating).length }));
  const averageRating = publishedReviews.length ? Math.round(publishedReviews.reduce((total, review) => total + Number(review.rating || 0), 0) / publishedReviews.length * 10) / 10 : 0;
  const currentUsages = input.usages.filter((usage) => inRange(usage.created_at, range)); const couponById = new Map(input.coupons.map((coupon) => [coupon.id, coupon])); const couponGroups = new Map<string, number>(); currentUsages.forEach((usage) => couponGroups.set(usage.coupon_id, (couponGroups.get(usage.coupon_id) || 0) + 1));
  const insights: Array<{ type: 'critical'|'warning'|'info'|'positive'; title: string; href: string }> = [];
  const revenueChange = change(current.revenue, previous.revenue); if (revenueChange !== null && revenueChange <= -statsThresholds.revenueDropAlert) insights.push({ type: 'critical', title: `Выручка снизилась на ${Math.abs(revenueChange)}% к сравнению`, href: '/admin/orders' });
  const overdueUnpaid = currentOrders.filter((order) => order.status === 'Ожидает оплаты' && safeDate(order.created_at) && Date.now() - safeDate(order.created_at)!.getTime() > statsThresholds.unpaidHours * 3600000); if (overdueUnpaid.length) insights.push({ type: 'warning', title: `${overdueUnpaid.length} неоплаченных заказов требуют внимания`, href: '/admin/orders?status=Ожидает%20оплаты' });
  if (categories[0]?.share >= statsThresholds.categoryConcentration) insights.push({ type: 'info', title: `Категория «${categories[0].name}» даёт ${categories[0].share}% выручки`, href: `/admin/products?category=${encodeURIComponent(categories[0].name)}` });
  const lastSoldAt = new Map<string, number>();
  allAccounted.forEach((order) => (order.items || []).forEach((item) => {
    const slug = item.slug || item.title;
    const createdAt = safeDate(order.created_at)?.getTime() || 0;
    if (slug && createdAt > (lastSoldAt.get(slug) || 0)) lastSoldAt.set(slug, createdAt);
  }));
  const staleProducts = input.products.filter((product) => product.status !== 'draft' && product.status !== 'hidden').filter((product) => {
    const lastSold = lastSoldAt.get(product.slug) || 0;
    return !lastSold || Date.now() - lastSold > statsThresholds.noSalesDays * 86400000;
  });
  if (staleProducts.length) insights.push({ type: 'warning', title: `${staleProducts.length} товаров не продавались более ${statsThresholds.noSalesDays} дней`, href: '/admin/products?sort=sales_asc' });
  if (!insights.length) insights.push({ type: 'positive', title: 'За выбранный период критичных сигналов нет', href: '/admin/orders' });
  return { range: { from: dayKey(range.start), to: dayKey(range.end), label: `${dateLabel(dayKey(range.start))} — ${dateLabel(dayKey(range.end))}` }, kpis: Object.fromEntries(Object.entries(current).filter(([key]) => key !== 'accounted').map(([key, value]) => [key, { value, previous: (previous as any)[key], change: input.compare === 'none' ? null : change(value as number, (previous as any)[key]) }])), salesSeries, statuses, topProducts, categories, customers: { newCustomers, repeatCustomers, loyalCustomers, repeatRate: currentCustomerKeys.size ? Math.round(repeatCustomers / currentCustomerKeys.size * 1000) / 10 : 0 }, delivery: Array.from(byDelivery.values()).map((item) => ({ ...item, share: currentOrders.length ? Math.round(item.count / currentOrders.length * 100) : 0 })).sort((a,b) => b.count-a.count), payment: Array.from(byPayment.values()).map((item) => ({ ...item, share: current.revenue ? Math.round(item.amount / current.revenue * 100) : 0 })).sort((a,b) => b.amount-a.amount), coupons: { used: currentUsages.length, totalDiscount: sum(currentUsages.map((item) => Number(item.discount_amount || 0))), averageDiscount: currentUsages.length ? Math.round(sum(currentUsages.map((item) => Number(item.discount_amount || 0))) / currentUsages.length) : 0, top: Array.from(couponGroups.entries()).map(([id,count]) => ({ code: couponById.get(id)?.code || 'Купон', count })).sort((a,b) => b.count-a.count).slice(0,3) }, reviews: { average: averageRating, total: publishedReviews.length, distribution: ratingDistribution }, insights };
}
