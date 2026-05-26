'use client';

import type { ComponentType, SVGProps } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CartIcon, SearchIcon, UserIcon } from './Icons';
import { cartCount, readCart } from './cart';
import { readFavorites } from '@/lib/favorites';

function HomeIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.5 11.2 12 4l8.5 7.2V21h-5.4v-6.2H8.9V21H3.5v-9.8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>;
}

function HeartIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.3 5.7a5.2 5.2 0 0 0-7.4 0l-.9.9-.9-.9a5.2 5.2 0 1 0-7.4 7.4l.9.9L12 21.2l7.4-7.2.9-.9a5.2 5.2 0 0 0 0-7.4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>;
}

function RequestIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 20h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M7 16.8V13l8.7-8.7 4 4-8.7 8.5H7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="m14.5 5.5 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  match: (path: string) => boolean;
  badge?: 'cart' | 'favorites';
};

const navItems: NavItem[] = [
  { href: '/', label: 'Главная', icon: HomeIcon, match: (path: string) => path === '/' },
  { href: '/catalog', label: 'Каталог', icon: SearchIcon, match: (path: string) => path.startsWith('/catalog') },
  { href: '/cart', label: 'Корзина', icon: CartIcon, match: (path: string) => path.startsWith('/cart') || path.startsWith('/checkout'), badge: 'cart' as const },
  { href: '/account#favorites', label: 'Избранное', icon: HeartIcon, match: (path: string) => path.startsWith('/account'), badge: 'favorites' as const },
  { href: '/account', label: 'Профиль', icon: UserIcon, match: (path: string) => path.startsWith('/login') || path.startsWith('/register') },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [cart, setCart] = useState(0);
  const [favorites, setFavorites] = useState(0);

  useEffect(() => {
    const updateCart = () => setCart(cartCount(readCart()));
    const updateFavorites = () => readFavorites().then((items) => setFavorites(items.length)).catch(() => setFavorites(0));

    updateCart();
    updateFavorites();

    window.addEventListener('storage', updateCart);
    window.addEventListener('storage', updateFavorites);
    window.addEventListener('bullmet-cart-updated', updateCart);
    window.addEventListener('bullmet-favorites-updated', updateFavorites);

    return () => {
      window.removeEventListener('storage', updateCart);
      window.removeEventListener('storage', updateFavorites);
      window.removeEventListener('bullmet-cart-updated', updateCart);
      window.removeEventListener('bullmet-favorites-updated', updateFavorites);
    };
  }, []);

  if (pathname.startsWith('/admin')) return null;

  return (
    <>
      <Link className="mobileQuickRequest" href="/request"><RequestIcon />Заказать расчет</Link>
      <nav className="mobileBottomNav" aria-label="Нижнее мобильное меню">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.match(pathname);
          const badgeValue = item.badge === 'cart' ? cart : item.badge === 'favorites' ? favorites : 0;
          return (
            <Link className={active ? 'mobileBottomNav__item active' : 'mobileBottomNav__item'} href={item.href} key={item.href}>
              <span className="mobileBottomNav__icon">
                <Icon />
                {badgeValue > 0 && <em>{badgeValue > 99 ? '99+' : badgeValue}</em>}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
