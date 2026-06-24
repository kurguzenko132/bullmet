'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Icon } from './Icon';

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

const quickSearches = ['римские', 'кофе', 'классика', 'кухня', 'настенные часы'];

export function Header() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const trimmedQuery = query.trim();
  const hasResults = results.length > 0;

  const nav = useMemo(() => [
    { href: '/catalog', label: 'Каталог' },
    { href: '/production', label: 'Производство' },
    { href: '/about', label: 'О компании' },
    { href: '/contacts', label: 'Контакты' }
  ], []);

  const bottomNav = useMemo(() => [
    { href: '/', label: 'Главная', icon: 'factory' as const },
    { href: '/catalog', label: 'Каталог', icon: 'search' as const },
    { href: '/about', label: 'О нас', icon: 'shield' as const },
    { href: '/cart', label: 'Корзина', icon: 'cart' as const },
    { href: '/login', label: 'Профиль', icon: 'user' as const }
  ], []);

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
    if (!searchOpen && !mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [searchOpen, mobileOpen]);

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

  function useQuickSearch(value: string) {
    setQuery(value);
  }

  return (
    <>
      <header className="site-header-exact site-header-polished">
        <div className="home-container header-inner-exact header-inner-polished">
          <Link href="/" className="brand-exact" aria-label="Bullmet">
            <img src="/logo-shield-check.svg" alt="" className="brand-mark" />
            <span className="brand-text"><b>BULLMET</b><small>металл с элементами дерева</small></span>
          </Link>

          <nav className="nav-exact nav-polished">
            {nav.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
          </nav>

          <div className="header-actions-exact header-actions-polished">
            <button aria-label="Поиск" className="icon-btn" type="button" onClick={() => setSearchOpen(true)}><Icon name="search" /></button>
            <Link href="/cart" className="cart-mini" aria-label="Корзина"><Icon name="cart" />{cartCount > 0 && <span>{cartCount}</span>}</Link>
            <Link href="/login" className="login-btn"><Icon name="user" /><span>Войти</span></Link>
            <button className={mobileOpen ? 'mobile-menu-btn is-open' : 'mobile-menu-btn'} type="button" onClick={() => setMobileOpen((value) => !value)} aria-label="Меню"><span /><span /><span /></button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="mobile-menu-overlay" role="dialog" aria-modal="true">
          <button className="mobile-menu-backdrop" type="button" onClick={() => setMobileOpen(false)} aria-label="Закрыть меню" />
          <div className="mobile-menu-panel">
            <div className="mobile-menu-head">
              <Link href="/" className="mobile-menu-brand" onClick={() => setMobileOpen(false)}>
                <img src="/logo-shield-check.svg" alt="" className="mobile-menu-brand-mark" />
                <span className="mobile-menu-brand-text"><b>BULLMET</b><small>металл с элементами дерева</small></span>
              </Link>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Закрыть">×</button>
            </div>
            <button className="mobile-menu-search" type="button" onClick={() => { setMobileOpen(false); setSearchOpen(true); }}><Icon name="search" /> Поиск по каталогу</button>
            <nav>
              {nav.map((item) => <Link href={item.href} key={item.href} onClick={() => setMobileOpen(false)}>{item.label}<span>→</span></Link>)}
            </nav>
            <div className="mobile-menu-contact">
              <span>Нужна консультация по часам?</span>
              <div className="mobile-menu-contact-actions">
                <Link href="/contacts" onClick={() => setMobileOpen(false)}>Контакты</Link>
                <Link href="/catalog" onClick={() => setMobileOpen(false)}>Каталог</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {searchOpen && (
        <div className="site-search-modal site-search-modal--polished" role="dialog" aria-modal="true">
          <button className="site-search-backdrop" type="button" onClick={() => setSearchOpen(false)} aria-label="Закрыть поиск" />
          <div className="site-search-card site-search-card--polished">
            <button className="site-search-close" type="button" onClick={() => setSearchOpen(false)} aria-label="Закрыть">×</button>
            <div className="site-search-head">
              <span>Поиск по каталогу</span>
              <h2>Что ищем?</h2>
              <p>Введите название или тематику часов: римские, кофе, классика, кухня.</p>
            </div>
            <form onSubmit={submitSearch} className="site-search-form-polished">
              <Icon name="search" />
              <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Например: римские, кофе, классика, кухня" />
              <button type="submit">Найти</button>
            </form>
            <div className="site-search-quick">
              {quickSearches.map((item) => <button key={item} type="button" onClick={() => useQuickSearch(item)}>{item}</button>)}
            </div>
            <div className="site-search-results site-search-results--polished">
              {loading && <span>Ищу товары...</span>}
              {!loading && trimmedQuery.length < 2 && <span>Начните вводить минимум 2 символа или выберите быстрый запрос.</span>}
              {!loading && trimmedQuery.length >= 2 && !hasResults && <span>Ничего не найдено. Попробуйте другой запрос.</span>}
              {hasResults && results.map((product) => (
                <Link href={`/product/${product.slug}`} key={product.slug} onClick={() => setSearchOpen(false)}>
                  <img src={product.image} alt="" />
                  <div><b>{product.title}</b><span>{product.category || product.short || 'Каталог'}</span></div>
                  <strong>от {money(product.price)} BYN</strong>
                </Link>
              ))}
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
