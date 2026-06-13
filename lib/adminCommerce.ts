import { serverSupabase } from './serverSupabase';

export type AdminOrderItem = {
  slug?: string;
  title?: string;
  price?: number;
  quantity?: number;
  size?: string;
  material?: string;
  image?: string;
};

export type AdminOrder = {
  id: string;
  created_at?: string;
  customer?: { name?: string; phone?: string; email?: string };
  delivery?: string;
  comment?: string;
  admin_note?: string;
  items?: AdminOrderItem[];
  total?: number;
  status?: string;
};

export type AdminRequest = {
  id: string;
  created_at?: string;
  customer?: { name?: string; phone?: string; email?: string };
  kind?: string;
  contact_method?: string;
  type?: string;
  material?: string;
  sizes?: string;
  comment?: string;
  admin_note?: string;
  product_slug?: string;
  product_title?: string;
  product_image?: string;
  product_price?: number | null;
  quantity?: number | null;
  file_name?: string;
  file_urls?: string[];
  status?: string;
};

export const orderStatuses = ['Новый', 'В работе', 'Ожидает оплаты', 'Выполнен', 'Отменён'];
export const requestStatuses = ['Новая', 'В работе', 'Ожидает ответа', 'Рассчитана', 'Закрыта', 'Отменена'];

export function money(value?: number | null) {
  return new Intl.NumberFormat('ru-RU').format(Number(value || 0));
}

export function formatDate(value?: string) {
  if (!value) return 'Дата не указана';
  try {
    return new Date(value).toLocaleString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Дата не указана';
  }
}

export function statusClass(status?: string) {
  const value = String(status || '').toLowerCase();
  if (value.includes('выполн') || value.includes('закры') || value.includes('рассчит')) return 'is-done';
  if (value.includes('работ') || value.includes('ожида')) return 'is-progress';
  if (value.includes('отмен')) return 'is-cancel';
  return 'is-new';
}

export async function getAdminOrders() {
  if (!serverSupabase) return [] as AdminOrder[];

  const { data, error } = await serverSupabase
    .from('orders')
    .select('id, created_at, customer, delivery, comment, admin_note, items, total, status')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    console.error('Admin orders load error:', error.message);
    return [];
  }

  return (data || []) as AdminOrder[];
}

export async function getAdminRequests() {
  if (!serverSupabase) return [] as AdminRequest[];

  const { data, error } = await serverSupabase
    .from('requests')
    .select('id, created_at, customer, kind, contact_method, type, material, sizes, comment, admin_note, product_slug, product_title, product_image, product_price, quantity, file_name, file_urls, status')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    console.error('Admin requests load error:', error.message);
    return [];
  }

  return (data || []) as AdminRequest[];
}
