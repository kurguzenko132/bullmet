import { serverSupabase } from './serverSupabase';

export type AdminRole = 'admin' | 'manager' | 'content_manager' | 'customer';

export type AdminProfile = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
  role: AdminRole | string;
  status?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type AdminActivityItem = {
  id: string;
  created_at?: string;
  actor_email?: string | null;
  action: string;
  entity: string;
  entity_id?: string | null;
  payload?: Record<string, unknown>;
};

export const adminRoles: Array<{ value: AdminRole; label: string; description: string; access: string[] }> = [
  {
    value: 'admin',
    label: 'Администратор',
    description: 'Полный доступ ко всем разделам сайта и настройкам.',
    access: ['Настройки сайта', 'Товары', 'Заказы', 'Заявки', 'Отзывы', 'Медиа', 'Баннеры', 'Пользователи', 'Роли']
  },
  {
    value: 'manager',
    label: 'Менеджер',
    description: 'Работа с клиентами, заказами, заявками и отзывами без системных настроек.',
    access: ['Заказы', 'Заявки', 'Отзывы', 'Клиенты']
  },
  {
    value: 'content_manager',
    label: 'Контент-менеджер',
    description: 'Управление товарами, фото, главной страницей, баннерами и SEO-контентом.',
    access: ['Товары', 'Фото', 'Главная', 'Баннеры', 'Медиа', 'SEO']
  },
  {
    value: 'customer',
    label: 'Клиент',
    description: 'Обычный пользователь сайта: личный кабинет, корзина, избранное и отзывы.',
    access: ['Личный кабинет', 'Заказы клиента', 'Избранное', 'Отзывы']
  }
];

export function roleLabel(role?: string) {
  return adminRoles.find((item) => item.value === role)?.label || 'Клиент';
}

export function roleClass(role?: string) {
  if (role === 'admin') return 'is-admin';
  if (role === 'manager') return 'is-manager';
  if (role === 'content_manager') return 'is-content';
  return 'is-customer';
}

export function actionLabel(action?: string) {
  const map: Record<string, string> = {
    site_control_update: 'Настройки сайта',
    homepage_control_update: 'Главная страница',
    products_update: 'Товар обновлён',
    orders_update: 'Заказ обновлён',
    requests_update: 'Заявка обновлена',
    review_update: 'Отзыв обновлён',
    review_delete: 'Отзыв удалён',
    banner_control_update: 'Баннеры обновлены',
    user_update: 'Пользователь обновлён'
  };

  return map[String(action || '')] || String(action || 'Действие');
}

export async function getAdminProfiles() {
  if (!serverSupabase) return [] as AdminProfile[];

  const { data, error } = await serverSupabase
    .from('profiles')
    .select('id, email, full_name, phone, role, status, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    console.error('Admin profiles load error:', error.message);
    return [];
  }

  return (data || []) as AdminProfile[];
}

export async function getAdminActivityLog() {
  if (!serverSupabase) return [] as AdminActivityItem[];

  const { data, error } = await serverSupabase
    .from('admin_activity_log')
    .select('id, created_at, actor_email, action, entity, entity_id, payload')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    console.error('Admin activity log load error:', error.message);
    return [];
  }

  return (data || []) as AdminActivityItem[];
}
