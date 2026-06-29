export type AdminRole = 'admin' | 'manager' | 'content_manager' | 'customer';

export type AdminRoleInfo = {
  value: AdminRole;
  label: string;
  description: string;
  access: string[];
};

export const adminRoles: AdminRoleInfo[] = [
  {
    value: 'admin',
    label: 'Администратор',
    description: 'Полный доступ ко всем разделам сайта и настройкам.',
    access: ['Настройки сайта', 'Страницы', 'Категории', 'Товары', 'Услуги', 'Производство', 'Заказы', 'Покупатели', 'Купоны', 'Доставка', 'Оплата', 'Заявки', 'Отзывы', 'Медиа', 'Баннеры', 'Отчеты', 'Пользователи', 'Роли', 'Журнал действий', 'Экспорт данных']
  },
  {
    value: 'manager',
    label: 'Менеджер',
    description: 'Работа с клиентами, заказами, заявками и отзывами без системных настроек.',
    access: ['Главная админки', 'Заказы', 'Заявки', 'Отзывы', 'Покупатели', 'Статистика', 'Отчеты']
  },
  {
    value: 'content_manager',
    label: 'Контент-менеджер',
    description: 'Управление товарами, фото, главной страницей, баннерами и SEO-контентом.',
    access: ['Главная админки', 'Главная страница', 'Страницы', 'Категории', 'Товары', 'Услуги', 'Производство', 'Фото', 'Медиа', 'Баннеры']
  },
  {
    value: 'customer',
    label: 'Клиент',
    description: 'Обычный пользователь сайта: личный кабинет, корзина, избранное и отзывы.',
    access: ['Личный кабинет', 'Заказы клиента', 'Избранное', 'Отзывы']
  }
];

const rolePathAccess: Record<AdminRole, string[]> = {
  admin: ['/admin'],
  manager: ['/admin', '/admin/orders', '/admin/requests', '/admin/reviews', '/admin/customers', '/admin/stats', '/admin/reports'],
  content_manager: ['/admin', '/admin/homepage', '/admin/pages', '/admin/categories', '/admin/products', '/admin/services', '/admin/production', '/admin/media', '/admin/banners'],
  customer: []
};

const exactDashboardPath = '/admin';

export function normalizeAdminRole(value?: string | null): AdminRole {
  if (value === 'admin' || value === 'manager' || value === 'content_manager') return value;
  return 'customer';
}

export function roleLabel(role?: string | null) {
  return adminRoles.find((item) => item.value === role)?.label || 'Клиент';
}

export function roleClass(role?: string | null) {
  if (role === 'admin') return 'is-admin';
  if (role === 'manager') return 'is-manager';
  if (role === 'content_manager') return 'is-content';
  return 'is-customer';
}

export function isStaffRole(role?: string | null) {
  const normalized = normalizeAdminRole(role);
  return normalized === 'admin' || normalized === 'manager' || normalized === 'content_manager';
}

export function canAccessAdminPath(role: AdminRole, pathname?: string | null) {
  const path = (pathname || exactDashboardPath).split('?')[0].replace(/\/$/, '') || exactDashboardPath;
  if (role === 'admin') return true;
  if (path === exactDashboardPath) return isStaffRole(role);

  return rolePathAccess[role].some((prefix) => {
    if (prefix === exactDashboardPath) return path === exactDashboardPath;
    return path === prefix || path.startsWith(`${prefix}/`);
  });
}

export function defaultAdminPath(role?: string | null) {
  const normalized = normalizeAdminRole(role);
  if (normalized === 'manager') return '/admin/orders';
  if (normalized === 'content_manager') return '/admin/products';
  if (normalized === 'admin') return '/admin';
  return '/account';
}


export function actionLabel(action?: string | null) {
  const map: Record<string, string> = {
    site_control_update: 'Настройки сайта',
    homepage_control_update: 'Главная страница',
    products_update: 'Товар обновлён',
    orders_update: 'Заказ обновлён',
    requests_update: 'Заявка обновлена',
    review_update: 'Отзыв обновлён',
    review_delete: 'Отзыв удалён',
    banner_control_update: 'Баннеры обновлены',
    catalog_categories_update: 'Категории обновлены',
    user_update: 'Пользователь обновлён',
    backup_export: 'Экспорт данных',
    site_page_create: 'Страница создана',
    site_page_update: 'Страница обновлена',
    site_page_delete: 'Страница удалена'
  };

  return map[String(action || '')] || String(action || 'Действие');
}
