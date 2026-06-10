'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Boxes, ClipboardList, Home, Image, LayoutDashboard, MessageSquare, Package, Settings, ShoppingBag } from 'lucide-react';

const links = [
  ['Главная', '/admin', LayoutDashboard],
  ['Главная страница', '/admin/homepage', Home],
  ['Товары и фото', '/admin/products', Package],
  ['Заказы', '/admin/orders', ShoppingBag],
  ['Заявки', '/admin/requests', ClipboardList],
  ['Отзывы', '/admin/reviews', MessageSquare],
  ['Статистика', '/admin/stats', BarChart3],
  ['Медиафайлы', '/admin/media', Image],
  ['Категории', '/admin/categories', Boxes],
  ['Настройки', '/admin/settings', Settings]
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="admin-sidebar-pro">
      <div className="admin-logo-pro">BULLMET<span>панель управления</span></div>
      <nav>
        {links.map(([title, href, Icon]) => {
          const active = pathname === href || (href !== '/admin' && pathname?.startsWith(href));
          return <Link key={href} href={href} className={active ? 'active' : ''}><Icon size={18}/>{title}</Link>;
        })}
      </nav>
    </aside>
  );
}
