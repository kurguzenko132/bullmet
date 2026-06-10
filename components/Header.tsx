'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
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

export function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const trimmedQuery = query.trim();
  const hasResults = results.length > 0;

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
    if (!searchOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSearchOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen || trimmedQuery.length < 2) {
      setResults([]);
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
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchOpen, trimmedQuery]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (trimmedQuery) {
      setSearchOpen(false);
      window.location.href = `/catalog?q=${encodeURIComponent(trimmedQuery)}`;
    }
  }

  const nav = useMemo(() => [
    { href: '/catalog', label: 'КАТАЛОГ' },
    { href: '/#production', label: 'ПРОИЗВОДСТВО' },
    { href: '/services', label: 'УСЛУГИ' },
    { href: '/about', label: 'О КОМПАНИИ' },
    { href: '/contacts', label: 'КОНТАКТЫ' }
  ], []);

  return (
    <header className="site-header-exact">
      <div className="home-container header-inner-exact">
        <Link href="/" className="brand-exact" aria-label="Bullmet">
          <img src="/logo-shield-check.svg" alt="" className="brand-mark" />
          <span className="brand-text"><b>BULLMET</b><small>металл с элементами дерева</small></span>
        </Link>

        <nav className="nav-exact">
          {nav.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
        </nav>

        <div className="header-actions-exact">
          <button aria-label="Поиск" className="icon-btn" type="button" onClick={() => setSearchOpen(true)}><Icon name="search" /></button>
          <Link href="/cart" className="cart-mini" aria-label="Корзина"><Icon name="cart" />{cartCount > 0 && <span>{cartCount}</span>}</Link>
          <Link href="/login" className="login-btn"><Icon name="user" /><span>Войти</span></Link>
          <Link href="/contacts" className="calc-btn">ЗАКАЗАТЬ РАСЧЕТ</Link>
          <button className="mobile-menu-btn" type="button" onClick={() => setMobileOpen((value) => !value)} aria-label="Меню"><span /><span /><span /></button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-header-menu">
          {nav.map((item) => <Link href={item.href} key={item.href} onClick={() => setMobileOpen(false)}>{item.label}</Link>)}
          <Link href="/contacts" onClick={() => setMobileOpen(false)}>Заказать расчет</Link>
        </div>
      )}

      {searchOpen && (
        <div className="site-search-modal" role="dialog" aria-modal="true">
          <button className="site-search-backdrop" type="button" onClick={() => setSearchOpen(false)} aria-label="Закрыть поиск" />
          <div className="site-search-card">
            <button className="site-search-close" type="button" onClick={() => setSearchOpen(false)} aria-label="Закрыть">×</button>
            <p>Поиск по каталогу</p>
            <form onSubmit={submitSearch}>
              <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Например: римские, кофе, качели, спорт" />
              <button type="submit">Найти</button>
            </form>
            <div className="site-search-results">
              {loading && <span>Ищу товары...</span>}
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
    </header>
  );
}
