'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
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

const groups = [
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
      ['Страницы', '/admin/homepage', ClipboardList],
      ['Каталог товаров', '/admin/products', Package],
      ['Услуги', '/admin/requests', Wrench],
      ['Производство', '/admin/homepage', Boxes],
      ['Отзывы', '/admin/reviews', MessageSquare],
      ['Баннеры', '/admin/banners', Image],
      ['Медиафайлы', '/admin/media', Image]
    ]
  },
  {
    label: 'Интернет-магазин',
    links: [
      ['Заказы', '/admin/orders', ShoppingBag, '12'],
      ['Покупатели', '/admin/stats', Users],
      ['Купоны и скидки', '/admin/stats', Percent],
      ['Доставка', '/admin/settings', Truck],
      ['Оплата', '/admin/settings', CreditCard]
    ]
  },
  {
    label: 'Аналитика',
    links: [
      ['Статистика', '/admin/stats', BarChart3],
      ['Отчеты', '/admin/stats', ClipboardList]
    ]
  },
  {
    label: 'Настройки',
    links: [
      ['Настройки сайта', '/admin/settings', Settings],
      ['Пользователи', '/admin/settings', UserCog],
      ['Роли и права', '/admin/settings', ShieldCheck],
      ['Резервное копирование', '/admin/settings', DatabaseBackup]
    ]
  }
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar-pro admin-sidebar-redesign">
      <Link href="/admin" className="admin-logo-redesign">
        <span className="admin-logo-mark">BM</span>
        <div><b>BULLMET</b><small>панель управления</small></div>
      </Link>

      <nav className="admin-nav-redesign">
        {groups.map((group, groupIndex) => (
          <div className="admin-nav-group" key={`${group.label}-${groupIndex}`}>
            {group.label && <p>{group.label}</p>}
            {group.links.map(([title, href, Icon, badge]) => {
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
        ))}
      </nav>

      <div className="admin-sidebar-bottom-redesign">
        <Link href="/login?next=/admin">Выйти из системы</Link>
      </div>
    </aside>
  );
}
