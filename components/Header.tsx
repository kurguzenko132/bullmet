'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Icon } from './Icon';
import { useAccessibleDialog } from '@/lib/useAccessibleDialog';


type SiteControlLite = {
  general?: {
    logoText?: string;
    tagline?: string;
  };
  contacts?: {
    phone?: string;
  };
  navigation?: {
    id: string;
    label: string;
    href: string;
    location: 'header' | 'mobile' | 'footer';
    visible: boolean;
    order: number;
  }[];
};

type ServiceNavigationItem = { id: string; title: string; href: string };

function iconForNavItem(id: string, href: string) {
  if (href === '/') return 'factory' as const;
  if (href.startsWith('/catalog')) return 'search' as const;
  if (href.startsWith('/cart')) return 'cart' as const;
  if (href.startsWith('/account') || href.startsWith('/login')) return 'user' as const;
  if (href.startsWith('/contacts')) return 'phone' as const;
  if (href.startsWith('/services')) return 'tools' as const;
  return 'shield' as const;
}

type SearchProduct = {
  slug: string;
  title: string;
  price: number;
  image: string;
  category?: string;
  short?: string;
};

function money(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value);
}

function readCartCount() {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem('bullmet_cart');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.reduce((sum, item) => sum + Number(item.quantity || 1), 0) : 0;
  } catch {
    return 0;
  }
}

export function Header() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [accountEmail, setAccountEmail] = useState('');
  const [siteControl, setSiteControl] = useState<SiteControlLite | null>(null);
  const [serviceNavigation, setServiceNavigation] = useState<ServiceNavigationItem[]>([]);
  const mobileDialogRef = useRef<HTMLDivElement>(null);
  const mobileCloseRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const trimmedQuery = query.trim();
  const hasResults = results.length > 0;

  const nav = useMemo(() => {
    const fromSettings = siteControl
      ? siteControl.navigation
      ?.filter((item) => item.location === 'header' && item.visible)
      .sort((a, b) => a.order - b.order)
      .map((item) => ({ href: item.href, label: item.label })) || []
      : null;

    const base = fromSettings || [
      { href: '/catalog', label: 'Каталог' },
      { href: '/production', label: 'Производство' },
      { href: '/contacts', label: 'Контакты' }
    ];
    return [...base, ...serviceNavigation.filter((service) => !base.some((item) => item.href === service.href)).map((service) => ({ href: service.href, label: service.title }))];
  }, [siteControl, serviceNavigation]);

  const accountHref = accountEmail ? '/account' : '/login?next=/account';
  const accountLabel = accountEmail ? 'Личный кабинет' : 'Войти в аккаунт';

  const bottomNav = useMemo(() => {
    const fromSettings = siteControl
      ? siteControl.navigation
      ?.filter((item) => item.location === 'mobile' && item.visible)
      .sort((a, b) => a.order - b.order)
      .map((item) => {
        const href = item.id === 'profile_mobile' ? accountHref : item.href;
        return {
          href,
          label: item.id === 'profile_mobile' ? (accountEmail ? 'Личный кабинет' : 'Войти') : item.label,
          icon: iconForNavItem(item.id, href)
        };
      }) || []
      : null;

    return fromSettings || [
      { href: '/', label: 'Главная', icon: 'factory' as const },
      { href: '/catalog', label: 'Каталог', icon: 'search' as const },
      { href: '/cart', label: 'Корзина', icon: 'cart' as const },
      { href: accountHref, label: accountEmail ? 'Личный кабинет' : 'Войти', icon: 'user' as const }
    ];
  }, [accountEmail, accountHref, siteControl]);


  useEffect(() => {
    let active = true;

    fetch('/api/site-control')
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (active && data?.settings) setSiteControl(data.settings);
      })
      .catch(() => null);

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/services')
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (active) setServiceNavigation(Array.isArray(data?.services) ? data.services : []); })
      .catch(() => null);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const update = () => setCartCount(readCartCount());
    update();
    window.addEventListener('storage', update);
    window.addEventListener('bullmet-cart-updated', update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('bullmet-cart-updated', update);
    };
  }, []);

  useEffect(() => {
    let active = true;

    const updateAccount = async () => {
      if (!supabase) {
        if (active) setAccountEmail('');
        return;
      }

      const { data } = await supabase.auth.getSession();
      const email = data.session?.user?.email?.toLowerCase() || '';
      if (!active) return;

      setAccountEmail(email);
    };

    void updateAccount();

    const { data } = supabase?.auth.onAuthStateChange((event, session) => {
      const email = session?.user?.email?.toLowerCase() || '';
      setAccountEmail(email);

      if (event === 'SIGNED_OUT') {
        setAccountEmail('');
      }
    }) || { data: null };

    const onStorage = () => { void updateAccount(); };
    window.addEventListener('storage', onStorage);
    window.addEventListener('bullmet-auth-updated', onStorage);

    return () => {
      active = false;
      data?.subscription?.unsubscribe();
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('bullmet-auth-updated', onStorage);
    };
  }, []);

  useAccessibleDialog({ open: mobileOpen, onClose: () => setMobileOpen(false), dialogRef: mobileDialogRef, initialFocusRef: mobileCloseRef });

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen || trimmedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(trimmedQuery)}`, { signal: controller.signal });
        const data = await response.json();
        setResults(Array.isArray(data.products) ? data.products : []);
      } catch {
        if (!controller.signal.aborted) setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 220);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchOpen, trimmedQuery]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trimmedQuery) return;
    setSearchOpen(false);
    window.location.href = `/catalog?q=${encodeURIComponent(trimmedQuery)}`;
  }

  return (
    <>
      <header className="site-header-exact site-header-polished">
        <div className={`home-container header-inner-exact header-inner-polished${searchOpen ? ' is-search-open' : ''}`}>
          <Link href="/" className="brand-exact" aria-label="Bullmet">
            <img src="/bullmet-logo-mark.png" alt="" className="brand-mark brand-mark--bullmet" />
            <span className="brand-text"><b>{siteControl?.general?.logoText || 'BULLMET'}</b></span>
          </Link>

          {searchOpen ? (
            <div className="header-search-area">
              <form onSubmit={submitSearch} className="header-search-form">
                <Icon name="search" />
                <input ref={searchInputRef} aria-label="Поиск по каталогу" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по каталогу" />
                <button className="header-search-close" type="button" onClick={() => setSearchOpen(false)} aria-label="Закрыть поиск">×</button>
              </form>
              {(loading || trimmedQuery.length >= 2) && (
                <div className="header-search-results">
                  {loading && <span>Ищу товары...</span>}
                  {!loading && !hasResults && <span>Ничего не найдено. Попробуйте другой запрос.</span>}
                  {!loading && hasResults && results.map((product) => (
                    <Link href={`/product/${product.slug}`} key={product.slug} onClick={() => setSearchOpen(false)}>
                      <img src={product.image} alt="" />
                      <div><b>{product.title}</b><span>{product.short || product.category || 'Каталог'}</span></div>
                      <strong>от {money(product.price)} BYN</strong>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <nav className="nav-exact nav-polished">
              {nav.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
            </nav>
          )}

          <div className="header-actions-exact header-actions-polished">
            {!searchOpen && <button aria-label="Поиск" className="icon-btn" type="button" onClick={() => setSearchOpen(true)}><Icon name="search" /></button>}
            <Link href="/cart" className="cart-mini" aria-label="Корзина"><Icon name="cart" />{cartCount > 0 && <span>{cartCount}</span>}</Link>
            <Link href={accountHref} className={accountEmail ? 'login-btn login-btn--active' : 'login-btn'} title={accountEmail ? `Личный кабинет: ${accountEmail}` : 'Войти в аккаунт'}><Icon name="user" /><span>{accountLabel}</span></Link>
            <button className={mobileOpen ? 'mobile-menu-btn is-open' : 'mobile-menu-btn'} type="button" onClick={() => setMobileOpen((value) => !value)} aria-label="Меню"><span /><span /><span /></button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div ref={mobileDialogRef} className="mobile-menu-overlay" role="dialog" aria-modal="true" aria-label="Мобильное меню" tabIndex={-1}>
          <button className="mobile-menu-backdrop" type="button" onClick={() => setMobileOpen(false)} aria-label="Закрыть меню" />
          <div className="mobile-menu-panel">
            <div className="mobile-menu-head">
              <Link href="/" className="mobile-menu-brand" onClick={() => setMobileOpen(false)}>
                <img src="/bullmet-logo-mark.png" alt="" className="mobile-menu-brand-mark mobile-menu-brand-mark--bullmet" />
                <span className="mobile-menu-brand-text"><b>{siteControl?.general?.logoText || 'BULLMET'}</b></span>
              </Link>
              <button ref={mobileCloseRef} type="button" onClick={() => setMobileOpen(false)} aria-label="Закрыть">×</button>
            </div>
            <button className="mobile-menu-search" type="button" onClick={() => { setMobileOpen(false); setSearchOpen(true); }}><Icon name="search" /> Поиск по каталогу</button>
            <nav>
              {nav.map((item) => <Link href={item.href} key={item.href} onClick={() => setMobileOpen(false)}>{item.label}<span>→</span></Link>)}
              <Link href={accountHref} onClick={() => setMobileOpen(false)}>{accountEmail ? 'Личный кабинет' : 'Войти в аккаунт'}<span>→</span></Link>
            </nav>
            <div className="mobile-menu-contact">
              <span>Нужна консультация? {siteControl?.contacts?.phone || ''}</span>
              <div className="mobile-menu-contact-actions">
                <Link href="/contacts" onClick={() => setMobileOpen(false)}>Контакты</Link>
                <Link href="/catalog" onClick={() => setMobileOpen(false)}>Каталог</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="mobile-bottom-nav" aria-label="Быстрая навигация">
        {bottomNav.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href.split('#')[0]);
          return (
            <Link href={item.href} key={item.href} className={active ? 'is-active' : ''}>
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.href === '/cart' && cartCount > 0 && <b>{cartCount}</b>}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
