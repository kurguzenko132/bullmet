'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAccess } from './AdminAccessContext';
import {
  Activity,
  BarChart3,
  Boxes,
  ClipboardList,
  CreditCard,
  DatabaseBackup,
  Home,
  Image,
  LayoutDashboard,
  MessageSquare,
  Package,
  Percent,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserCog,
  Users,
  Wrench
} from 'lucide-react';

const groups: Array<{ label: string; links: Array<[string, string, any, string?]> }> = [
  {
    label: '',
    links: [
      ['Главная', '/admin', LayoutDashboard]
    ]
  },
  {
    label: 'Контент',
    links: [
      ['Главная страница', '/admin/homepage', Home],
      ['Страницы', '/admin/pages', ClipboardList],
      ['Категории', '/admin/categories', ClipboardList],
      ['Каталог товаров', '/admin/products', Package],
      ['Услуги', '/admin/services', Wrench],
      ['Производство', '/admin/production', Boxes],
      ['Отзывы', '/admin/reviews', MessageSquare],
      ['Баннеры', '/admin/banners', Image],
      ['Медиафайлы', '/admin/media', Image]
    ]
  },
  {
    label: 'Интернет-магазин',
    links: [
      ['Заказы', '/admin/orders', ShoppingBag],
      ['Покупатели', '/admin/customers', Users],
      ['Купоны и скидки', '/admin/coupons', Percent],
      ['Доставка', '/admin/delivery', Truck],
      ['Оплата', '/admin/payment', CreditCard]
    ]
  },
  {
    label: 'Аналитика',
    links: [
      ['Статистика', '/admin/stats', BarChart3],
      ['Отчеты', '/admin/reports', ClipboardList],
      ['Журнал действий', '/admin/activity', Activity]
    ]
  },
  {
    label: 'Настройки',
    links: [
      ['Настройки сайта', '/admin/settings', Settings],
      ['Пользователи', '/admin/users', UserCog],
      ['Роли и права', '/admin/roles', ShieldCheck],
      ['Резервное копирование', '/admin/backup', DatabaseBackup]
    ]
  }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { canAccess, roleLabel } = useAdminAccess();

  return (
    <aside className="admin-sidebar-pro admin-sidebar-redesign">
      <Link href="/admin" className="admin-logo-redesign">
        <span className="admin-logo-mark">BM</span>
        <div><b>BULLMET</b><small>панель управления</small></div>
      </Link>

      <nav className="admin-nav-redesign">
        {groups.map((group, groupIndex) => {
          const links = group.links.filter(([, href]) => canAccess(href));
          if (!links.length) return null;

          return (
            <div className="admin-nav-group" key={`${group.label}-${groupIndex}`}>
              {group.label && <p>{group.label}</p>}
              {links.map((link) => {
                const [title, href, Icon] = link;
                const badge = (link as readonly unknown[])[3] as string | undefined;
                const active = pathname === href || (href !== '/admin' && pathname?.startsWith(href));
                return (
                  <Link key={`${title}-${href}`} href={href} className={active ? 'active' : ''}>
                    <Icon size={18} />
                    <span>{title}</span>
                    {badge && <b>{badge}</b>}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="admin-sidebar-role">
        <span>Текущая роль</span>
        <b>{roleLabel}</b>
      </div>

      <div className="admin-sidebar-bottom-redesign">
        <Link href="/login?next=/admin">Выйти из системы</Link>
      </div>
    </aside>
  );
}
