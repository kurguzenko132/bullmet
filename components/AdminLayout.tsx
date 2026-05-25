'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CartIcon, FactoryIcon, ShieldIcon, ToolsIcon, TruckIcon, UserIcon } from './Icons';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { getCurrentSession, signOutBullmet, type BullmetSession } from '@/lib/auth';

const menuGroups = [
  { title: '', items: [
    { label: 'Главная', href: '/admin', icon: HomeIcon, enabled: true },
  ] },
  { title: 'Контент', items: [
    { label: 'Главная страница', href: '/admin/home', icon: LayoutIcon, enabled: true },
    { label: 'Страницы', href: '/admin/pages', icon: DocumentIcon, enabled: false },
    { label: 'Каталог товаров', href: '/admin/products', icon: GridIcon, enabled: true },
    { label: 'Группы товаров', href: '/admin/product-groups', icon: LinkIcon, enabled: true },
    { label: 'Услуги', href: '/admin/services', icon: ToolsIcon, enabled: false },
    { label: 'Производство', href: '/admin/production', icon: FactoryIcon, enabled: false },
    { label: 'Отзывы', href: '/admin/reviews', icon: StarIcon, enabled: false },
    { label: 'Фото главной', href: '/admin/home-media', icon: ImageIcon, enabled: false },
    { label: 'Медиафайлы', href: '/admin/media', icon: FolderIcon, enabled: false },
  ] },
  { title: 'Интернет-магазин', items: [
    { label: 'Заказы', href: '/admin/orders', icon: CartIcon, enabled: true },
    { label: 'Заявки на расчет', href: '/admin/requests', icon: DocumentIcon, enabled: true },
    { label: 'Покупатели', href: '/admin/customers', icon: UserIcon, enabled: false },
    { label: 'Купоны и скидки', href: '/admin/coupons', icon: TicketIcon, enabled: false },
    { label: 'Доставка', href: '/admin/delivery', icon: TruckIcon, enabled: false },
    { label: 'Оплата', href: '/admin/payment', icon: CardIcon, enabled: false },
  ] },
  { title: 'Аналитика', items: [
    { label: 'Статистика', href: '/admin/stats', icon: ChartIcon, enabled: false },
    { label: 'Отчеты', href: '/admin/reports', icon: ReportIcon, enabled: false },
  ] },
  { title: 'Настройки', items: [
    { label: 'Настройки сайта', href: '/admin/settings', icon: SettingsIcon, enabled: false },
    { label: 'Пользователи', href: '/admin/users', icon: UserIcon, enabled: false },
    { label: 'Роли и права', href: '/admin/roles', icon: ShieldIcon, enabled: false },
    { label: 'Резервное копирование', href: '/admin/backups', icon: BackupIcon, enabled: false },
  ] },
];

export function AdminLayout({ title, children }: { title: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<BullmetSession | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    getCurrentSession().then((nextSession) => {
      if (!mounted) return;
      if (!nextSession) {
        router.push('/login');
        return;
      }
      if (nextSession.role !== 'admin') {
        router.push('/account');
        return;
      }
      setSession(nextSession);
      setChecking(false);
    });
    return () => { mounted = false; };
  }, [router]);

  async function logout() {
    await signOutBullmet();
    router.push('/login');
  }

  if (checking) {
    return <div className="adminAccessLoading"><div><b>BULLMET</b><p>Проверяем доступ к админке...</p></div></div>;
  }

  if (!session) return null;

  return (
    <div className="adminShell">
      <aside className="adminSidebar">
        <Link className="adminLogo" href="/admin">
          <Image src="/assets/logo-mark.png" alt="" width={44} height={48} />
          <div><b>BULLMET</b><span>Панель управления</span></div>
        </Link>
        <nav className="adminMenu">
          {menuGroups.map((group, groupIndex) => (
            <div className="adminMenuGroup" key={groupIndex}>
              {group.title && <p>{group.title}</p>}
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = item.enabled && (pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`)));
                const className = [
                  'adminMenuItem',
                  active ? 'adminMenuItem--active' : '',
                  !item.enabled ? 'adminMenuItem--disabled' : '',
                ].filter(Boolean).join(' ');
                if (!item.enabled) {
                  return (
                    <span className={className} key={item.label} title="Раздел будет реализован позже">
                      <Icon />
                      <span>{item.label}</span>
                    </span>
                  );
                }
                return (
                  <Link className={className} href={item.href} key={item.label}>
                    <Icon />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <button className="adminLogout" type="button" onClick={logout}><LogoutIcon />Выйти из системы</button>
      </aside>

      <div className="adminMain">
        <header className="adminTopbar">
          <div className="adminTopbar__left"><button aria-label="Меню"><MenuIcon /></button><h1>{title}</h1></div>
          <div className="adminTopbar__right">
            <Link className="adminSiteLink" href="/">Перейти на сайт <ExternalIcon /></Link>
            <button className="adminBell" aria-label="Уведомления"><BellIcon /><em>3</em></button>
            <div className="adminProfile"><div className="adminAvatar">{session.email.slice(0, 1).toUpperCase()}</div><div><b>Администратор</b><span>{session.email}</span></div><ChevronIcon /></div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

export function HomeIcon() { return <svg viewBox="0 0 24 24"><path d="M4 11 12 4l8 7v9H5v-8"/><path d="M10 20v-6h4v6"/></svg>; }
export function LayoutIcon() { return <svg viewBox="0 0 24 24"><path d="M4 5h16v14H4z"/><path d="M4 10h16M9 10v9"/></svg>; }
export function DocumentIcon() { return <svg viewBox="0 0 24 24"><path d="M6 3h9l3 3v15H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/></svg>; }
export function GridIcon() { return <svg viewBox="0 0 24 24"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></svg>; }
export function LinkIcon() { return <svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1"/></svg>; }
export function StarIcon() { return <svg viewBox="0 0 24 24"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2 7.5 14 3 9.6l6.2-.9z"/></svg>; }
export function ImageIcon() { return <svg viewBox="0 0 24 24"><path d="M4 5h16v14H4z"/><path d="m4 16 5-5 4 4 2-2 5 5"/><circle cx="15" cy="9" r="1.5"/></svg>; }
export function FolderIcon() { return <svg viewBox="0 0 24 24"><path d="M3 7h7l2 2h9v10H3z"/></svg>; }
export function TicketIcon() { return <svg viewBox="0 0 24 24"><path d="M4 8a2 2 0 0 0 0 4 2 2 0 0 0 0 4v2h16v-2a2 2 0 0 0 0-4 2 2 0 0 0 0-4V6H4z"/><path d="M12 7v10"/></svg>; }
export function CardIcon() { return <svg viewBox="0 0 24 24"><path d="M4 6h16v12H4z"/><path d="M4 10h16M8 15h3"/></svg>; }
export function ChartIcon() { return <svg viewBox="0 0 24 24"><path d="M4 20V5M4 20h16"/><path d="M8 17v-5M13 17V8M18 17v-9"/></svg>; }
export function ReportIcon() { return <svg viewBox="0 0 24 24"><path d="M6 3h12v18H6z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>; }
export function SettingsIcon() { return <svg viewBox="0 0 24 24"><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><path d="M3 12h3M18 12h3M12 3v3M12 18v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/></svg>; }
export function BackupIcon() { return <svg viewBox="0 0 24 24"><path d="M4 7h16v13H4z"/><path d="M8 7V4h8v3M8 14h8"/></svg>; }
export function LogoutIcon() { return <svg viewBox="0 0 24 24"><path d="M10 4H5v16h5"/><path d="M14 8l4 4-4 4M18 12H9"/></svg>; }
export function MenuIcon() { return <svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>; }
export function ExternalIcon() { return <svg viewBox="0 0 24 24"><path d="M8 8h8v8"/><path d="m16 8-9 9"/><path d="M5 5h14v14"/></svg>; }
export function BellIcon() { return <svg viewBox="0 0 24 24"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>; }
export function ChevronIcon() { return <svg viewBox="0 0 24 24"><path d="m8 10 4 4 4-4"/></svg>; }
export function EditIcon() { return <svg viewBox="0 0 24 24"><path d="M5 19h4L19 9l-4-4L5 15z"/><path d="m14 6 4 4"/></svg>; }
export function TrashIcon() { return <svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 14h10l1-14"/><path d="M9 7V4h6v3"/></svg>; }
export function PlusIcon() { return <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>; }
