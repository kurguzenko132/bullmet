import Link from 'next/link';
import { BarChart3, Boxes, Home, Image, LayoutDashboard, Package, Settings, ShoppingBag } from 'lucide-react';

const links = [
  ['Главная', '/admin', LayoutDashboard],
  ['Главная страница', '/admin/homepage', Home],
  ['Товары', '/admin/products', Package],
  ['Заказы', '/admin/orders', ShoppingBag],
  ['Статистика', '/admin/stats', BarChart3],
  ['Медиафайлы', '/admin/media', Image],
  ['Категории', '/admin/categories', Boxes],
  ['Настройки', '/admin/settings', Settings]
] as const;

export function AdminSidebar() {
  return (
    <aside className="hidden bg-bull-dark p-6 text-white lg:block">
      <div className="mb-10 text-3xl font-black">BULLMET<br/><span className="text-sm font-normal text-white/60">панель управления</span></div>
      <nav className="space-y-2">
        {links.map(([title, href, Icon], i) => (
          <Link key={href} href={href} className={`flex items-center gap-3 rounded-lg px-4 py-3 ${i === 0 ? 'bg-bull-orange' : 'hover:bg-white/10'}`}>
            <Icon size={18}/>{title}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
