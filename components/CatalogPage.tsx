'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header, Footer } from './HomePage';
import { SearchIcon, ToolsIcon, TruckIcon } from './Icons';
import { categories as fallbackCategories, clockCategory, clockThemes as fallbackClockThemes, expandProductVariants } from './shopData';
import { getActiveCategoryNames, getActiveClockThemeNames, readCatalogSettingsAsync } from './categoryStore';
import { useAdminProducts } from './useAdminProducts';
import { AddToCartButton } from './AddToCartButton';
import { FavoriteButton } from './FavoriteButton';
import { QuickOrderButton } from './QuickOrderButton';
import { getImageSettings } from '../lib/imageDisplay';
import { loadReviewSummaries, type ProductReviewSummary } from '../lib/reviews';

const materialFilters = ['Металл', 'Дерево', 'Металл и дерево'];
const PAGE_SIZE = 12;

type SortValue = 'popular' | 'price-low' | 'price-high' | 'new';

function normalizeText(value: string) {
  return value.toLowerCase().replace(/ё/g, 'е');
}

function matchesMaterial(productMaterial: string, selectedMaterial: string) {
  if (!selectedMaterial) return true;
  const material = normalizeText(productMaterial);
  const hasMetal = material.includes('металл');
  const hasWood = material.includes('дерев') || material.includes('фанер') || material.includes('дуб');

  if (selectedMaterial === 'Металл и дерево') return hasMetal && hasWood;
  if (selectedMaterial === 'Металл') return hasMetal && !hasWood;
  if (selectedMaterial === 'Дерево') return hasWood && !hasMetal;
  return true;
}

function makePluralReviews(count: number) {
  const lastTwo = count % 100;
  const last = count % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return 'отзывов';
  if (last === 1) return 'отзыв';
  if (last >= 2 && last <= 4) return 'отзыва';
  return 'отзывов';
}

export function CatalogPage() {
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<string[]>(fallbackCategories);
  const [clockThemeOptions, setClockThemeOptions] = useState<string[]>(fallbackClockThemes);
  const [reviewSummaries, setReviewSummaries] = useState<Record<string, ProductReviewSummary>>({});
  const [sort, setSort] = useState<SortValue>('popular');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [page, setPage] = useState(1);
  const activeCategory = searchParams.get('category') || '';
  const activeClockTheme = searchParams.get('clockTheme') || '';
  const searchQuery = searchParams.get('q')?.trim() || '';
  const { items, ready } = useAdminProducts();

  useEffect(() => {
    let mounted = true;
    readCatalogSettingsAsync().then((settings) => {
      if (!mounted) return;
      const nextCategories = getActiveCategoryNames(settings);
      const nextThemes = getActiveClockThemeNames(settings);
      setCategoryOptions(nextCategories.length ? nextCategories : fallbackCategories);
      setClockThemeOptions(nextThemes.length ? nextThemes : fallbackClockThemes);
    });
    return () => { mounted = false; };
  }, []);

  const catalogProducts = useMemo(() => {
    if (!ready) return [];
    const min = priceFrom ? Number(priceFrom) : null;
    const max = priceTo ? Number(priceTo) : null;
    const query = normalizeText(searchQuery);

    const filtered = expandProductVariants(items.filter((product) => {
      if (product.status === 'draft') return false;
      if (activeCategory && product.category !== activeCategory) return false;
      if (activeClockTheme && product.clockTheme !== activeClockTheme) return false;
      if (min !== null && Number(product.price || 0) < min) return false;
      if (max !== null && Number(product.price || 0) > max) return false;
      if (!matchesMaterial(product.material || '', selectedMaterial)) return false;
      if (query) {
        const haystack = normalizeText(`${product.title} ${product.category} ${product.clockTheme ?? ''} ${product.material} ${product.short} ${product.description}`);
        if (!haystack.includes(query)) return false;
      }
      return true;
    }));

    return [...filtered].sort((a, b) => {
      if (sort === 'price-low') return Number(a.price || 0) - Number(b.price || 0);
      if (sort === 'price-high') return Number(b.price || 0) - Number(a.price || 0);
      if (sort === 'new') return Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));
      return Number(Boolean(b.isPopular)) - Number(Boolean(a.isPopular)) || Number(Boolean(b.inStock)) - Number(Boolean(a.inStock));
    });
  }, [items, ready, activeCategory, activeClockTheme, searchQuery, priceFrom, priceTo, selectedMaterial, sort]);

  const totalPages = Math.max(1, Math.ceil(catalogProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const shownProducts = useMemo(
    () => catalogProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [catalogProducts, currentPage]
  );
  const shownFrom = catalogProducts.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const shownTo = Math.min(currentPage * PAGE_SIZE, catalogProducts.length);

  useEffect(() => {
    setPage(1);
  }, [activeCategory, activeClockTheme, searchQuery, priceFrom, priceTo, selectedMaterial, sort]);

  useEffect(() => {
    let mounted = true;
    loadReviewSummaries(shownProducts.map((product) => product.slug))
      .then((summaries) => { if (mounted) setReviewSummaries(summaries); })
      .catch(() => { if (mounted) setReviewSummaries({}); });
    return () => { mounted = false; };
  }, [shownProducts]);

  function resetFilters() {
    setPriceFrom('');
    setPriceTo('');
    setSelectedMaterial('');
    setSort('popular');
  }

  return (
    <>
      <Header />
      <main className="catalogPage">
        <section className="container catalogHero">
          <div className="breadcrumbs"><Link href="/">Главная</Link><span>/</span><span>Каталог</span></div>
          <h1 className="pageTitle">Каталог товаров</h1>
          {searchQuery && <p className="catalogSearchNote">Результаты поиска: <b>{searchQuery}</b></p>}
        </section>

        <section className="container catalogLayout">
          <button type="button" className="mobileFilterToggle" onClick={() => setFiltersOpen((value) => !value)} aria-expanded={filtersOpen}>
            <span>Фильтры</span>
            <b>{filtersOpen ? 'Свернуть' : 'Открыть'}</b>
          </button>
          <aside className={`catalogSidebar ${filtersOpen ? 'catalogSidebar--open' : ''}`} aria-label="Фильтры каталога">
            <div className="mobileFilterHead"><b>Фильтры каталога</b><button type="button" onClick={() => setFiltersOpen(false)}>Закрыть</button></div>
            <div className="filterBox">
              <h3>Категории</h3>
              <nav className="categoryMenu">
                <Link href="/catalog" className={!activeCategory ? 'active' : ''}>Все товары</Link>
                {categoryOptions.map((category) => <Link className={activeCategory === category ? 'active' : ''} href={`/catalog?category=${encodeURIComponent(category)}`} key={category}>{category}</Link>)}
              </nav>
            </div>

            <div className="filterBox filterBox--line">
              <h3>Тематика часов</h3>
              <nav className="categoryMenu categoryMenu--compact">
                <Link className={!activeClockTheme ? 'active' : ''} href={activeCategory ? `/catalog?category=${encodeURIComponent(activeCategory)}` : '/catalog'}>Все тематики</Link>
                {clockThemeOptions.map((theme) => {
                  const href = `/catalog?category=${encodeURIComponent(clockCategory)}&clockTheme=${encodeURIComponent(theme)}`;
                  return <Link className={activeClockTheme === theme ? 'active' : ''} href={href} key={theme}>{theme}</Link>;
                })}
              </nav>
            </div>

            <div className="filterBox filterBox--line">
              <h3>Фильтр</h3>
              <label className="filterLabel">Цена, BYN</label>
              <div className="priceLine"><span /><i /></div>
              <div className="priceInputs">
                <input value={priceFrom} inputMode="numeric" placeholder="0" onChange={(event) => setPriceFrom(event.target.value.replace(/[^0-9]/g, ''))} aria-label="Цена от" />
                <span>до</span>
                <input value={priceTo} inputMode="numeric" placeholder="2000" onChange={(event) => setPriceTo(event.target.value.replace(/[^0-9]/g, ''))} aria-label="Цена до" />
              </div>
              <label className="filterLabel filterLabel--space">Материал</label>
              <div className="checks">
                {materialFilters.map((item) => (
                  <label key={item}>
                    <input type="radio" name="material" checked={selectedMaterial === item} onChange={() => setSelectedMaterial(item)} /> {item}
                  </label>
                ))}
              </div>
              <button className="applyFilter" type="button" onClick={() => setFiltersOpen(false)}>Применить</button>
              <button className="resetFilter" type="button" onClick={resetFilters}>Сбросить</button>
            </div>
          </aside>

          <div className="catalogContent">
            <div className="catalogToolbar">
              <select value={sort} onChange={(event) => setSort(event.target.value as SortValue)} aria-label="Сортировка">
                <option value="popular">По популярности</option>
                <option value="price-low">Сначала дешевле</option>
                <option value="price-high">Сначала дороже</option>
                <option value="new">Новинки</option>
              </select>
              <p>{ready ? `Показано ${shownFrom}–${shownTo} из ${catalogProducts.length}` : 'Загружаем товары...'}</p>
              <div className="viewButtons"><button aria-label="Плитка"><GridDots /></button><button aria-label="Список"><ListLines /></button></div>
            </div>

            <div className="productCatalogGrid">
              {shownProducts.length ? shownProducts.map((product) => {
                const review = reviewSummaries[product.slug];
                return (
                <article className="catalogCard catalogCard--mobileMarket" key={product.slug}>
                  <Link href={`/catalog/${product.slug}`} className="catalogCard__overlay" aria-label={`Открыть ${product.title}`} />
                  <Link href={`/catalog/${product.slug}`} className="catalogCard__image">
                    <Image src={product.image} alt={product.title} fill sizes="(max-width: 760px) 50vw, 25vw" style={{ objectFit: getImageSettings(product, product.image).catalogFit, objectPosition: getImageSettings(product, product.image).catalogPosition }} />
                  </Link>
                  <div className="catalogCard__fav"><FavoriteButton product={product} /></div>
                  <div className="catalogCard__body">
                    {(product.colorName || product.variantName) && <span className="catalogCard__variantBadge" style={{ borderColor: product.colorHex ?? product.variantColorHex ?? undefined }}>{product.colorName || product.variantName}</span>}
                    <Link href={`/catalog/${product.slug}`} className="catalogCard__title">{product.colorName ? `${product.title} — ${product.colorName}` : product.variantName ? `${product.title} — ${product.variantName}` : product.title}</Link>
                    <p>{product.short}</p>{product.clockTheme && <em className="catalogCard__theme">{product.clockTheme}</em>}
                    <div className="catalogCard__rating"><span>★</span>{review ? `${review.average.toFixed(1).replace('.', ',')} · ${review.count} ${makePluralReviews(review.count)}` : 'Пока нет отзывов'}</div>
                    <div className="catalogCard__bottom"><b>от {product.price} BYN</b><AddToCartButton product={product} iconOnly /></div><div className="catalogCard__quick"><QuickOrderButton product={product} label="Купить в 1 клик" compact className="catalogQuickOrderBtn" /></div>
                  </div>
                </article>
              );
              }) : <div className="catalogEmpty"><b>{ready ? 'Товары не найдены' : 'Загружаем товары'}</b><p>{ready ? 'Попробуйте сбросить фильтры или выбрать другую категорию.' : 'Подключаем каталог Bullmet.'}</p></div>}
            </div>

            {totalPages > 1 && (
              <div className="pagination" aria-label="Пагинация каталога">
                <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1}>←</button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).slice(0, 6).map((item) => (
                  <button type="button" className={item === currentPage ? 'active' : ''} onClick={() => setPage(item)} key={item}>{item}</button>
                ))}
                <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage === totalPages}>→</button>
              </div>
            )}
          </div>
        </section>

        <section className="container catalogInfoStrip">
          <div><ToolsIcon /><b>Собственное производство</b><span>Изготавливаем изделия под задачи клиента</span></div>
          <div><SearchIcon /><b>Поможем с выбором</b><span>Подскажем материал, размер и покрытие</span></div>
          <div><TruckIcon /><b>Доставка по Беларуси</b><span>Самовывоз или отправка в ваш город</span></div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function GridDots() {
  return <svg viewBox="0 0 24 24" fill="none"><path d="M5 5h3v3H5V5Zm0 6h3v3H5v-3Zm0 6h3v3H5v-3Zm6-12h3v3h-3V5Zm0 6h3v3h-3v-3Zm0 6h3v3h-3v-3Zm6-12h3v3h-3V5Zm0 6h3v3h-3v-3Zm0 6h3v3h-3v-3Z" fill="currentColor" /></svg>;
}
function ListLines() {
  return <svg viewBox="0 0 24 24" fill="none"><path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="2" strokeLinecap="square" /></svg>;
}
