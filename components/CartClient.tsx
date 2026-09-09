'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Factory, Heart, MessageCircle, Minus, Plus, ShieldCheck, ShoppingCart, Trash2 } from 'lucide-react';
import { Icon } from './Icon';
import type { CatalogProduct } from '@/lib/products';

type CartItem = {
  productId?: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  material?: string;
  size?: string;
  color?: string;
  quantity: number;
};

function keyOf(item: Pick<CartItem, 'slug' | 'size'>) {
  return `${item.slug}::${item.size || ''}`;
}

function readCart(): CartItem[] {
  try {
    const value = JSON.parse(window.localStorage.getItem('bullmet_cart') || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function money(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value);
}

export function CartClient({ recommendations }: { recommendations: CatalogProduct[] }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    const sync = () => {
      const next = readCart();
      setItems(next);
      setSelected(new Set(next.map(keyOf)));
    };
    sync();
    window.addEventListener('bullmet-cart-updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('bullmet-cart-updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const selectedItems = useMemo(() => items.filter((item) => selected.has(keyOf(item))), [items, selected]);
  const total = useMemo(() => selectedItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0), [selectedItems]);
  const totalQty = useMemo(() => selectedItems.reduce((sum, item) => sum + Number(item.quantity || 1), 0), [selectedItems]);
  const allSelected = items.length > 0 && selected.size === items.length;

  function save(next: CartItem[]) {
    setItems(next);
    setSelected((current) => new Set([...current].filter((key) => next.some((item) => keyOf(item) === key))));
    window.localStorage.setItem('bullmet_cart', JSON.stringify(next));
    window.dispatchEvent(new Event('bullmet-cart-updated'));
  }

  function toggle(item: CartItem) {
    const key = keyOf(item);
    setSelected((current) => {
      const next = new Set(current);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(items.map(keyOf)));
  }

  function setQty(item: CartItem, quantity: number) {
    save(items.map((current) => keyOf(current) === keyOf(item) ? { ...current, quantity: Math.max(1, quantity) } : current));
  }

  function remove(item: CartItem) {
    if (typeof window !== 'undefined' && !window.confirm(`Удалить «${item.title}» из корзины?`)) return;
    save(items.filter((current) => keyOf(current) !== keyOf(item)));
  }

  function removeSelected() {
    if (!selected.size) return;
    if (typeof window !== 'undefined' && !window.confirm('Удалить выбранные товары из корзины?')) return;
    save(items.filter((item) => !selected.has(keyOf(item))));
  }

  function addRecommendation(product: CatalogProduct) {
    const current = readCart();
    const existing = current.find((item) => item.slug === product.slug);
    const next = existing
      ? current.map((item) => item.slug === product.slug ? { ...item, quantity: item.quantity + 1 } : item)
      : [...current, { productId: product.id, slug: product.slug, title: product.title, price: product.price, image: product.image, material: product.material, size: product.sizes[0], color: product.colorName, quantity: 1 }];
    save(next);
    setSelected(new Set(next.map(keyOf)));
  }

  const recommendationItems = recommendations.filter((product) => !items.some((item) => item.slug === product.slug)).slice(0, 4);

  if (!items.length) {
    return <>
      <section className="cart-empty-v3">
        <ShoppingCart aria-hidden="true" />
        <h2>Корзина пока пустая</h2>
        <p>Добавьте понравившиеся часы из каталога.</p>
        <Link href="/catalog">Перейти в каталог</Link>
      </section>
      <CartRecommendations products={recommendationItems} onAdd={addRecommendation} />
    </>;
  }

  return <>
    <div className="cart-layout-v3">
      <section className="cart-items-v3">
        <div className="cart-select-all-v3">
          <label><input type="checkbox" checked={allSelected} onChange={toggleAll} /><span>Выбрать все ({items.length})</span></label>
          <button type="button" onClick={removeSelected} disabled={!selected.size}><Trash2 aria-hidden="true" />Удалить выбранные</button>
        </div>
        <div className="cart-items-list-v3">
          {items.map((item) => {
            const isSelected = selected.has(keyOf(item));
            const madeToOrder = String(item.size || '').toLowerCase().includes('под заказ');
            return <article className="cart-item-v3" key={keyOf(item)}>
              <label className="cart-item-check-v3"><input type="checkbox" checked={isSelected} onChange={() => toggle(item)} aria-label={`Выбрать ${item.title}`} /><span /></label>
              <Link href={`/product/${item.slug}`} className="cart-item-image-v3"><img src={item.image} alt={item.title} /></Link>
              <div className="cart-item-info-v3">
                <Link href={`/product/${item.slug}`}>{item.title}</Link>
                <span>Артикул: {item.slug.toUpperCase()}</span>
                <p>{item.size && <>Размер: {item.size}</>}{item.size && (item.color || item.material) && ' · '}{item.color ? <>Цвет: {item.color}</> : item.material ? <>Материал: {item.material}</> : null}</p>
              </div>
              <span className={madeToOrder ? 'cart-status-v3 cart-status-v3--order' : 'cart-status-v3'}>{madeToOrder ? 'Изготовим за 5–7 дней' : 'В наличии'}</span>
              <b className="cart-item-price-v3">{money(item.price * item.quantity)} BYN</b>
              <div className="cart-quantity-v3"><button type="button" onClick={() => setQty(item, item.quantity - 1)} disabled={item.quantity <= 1} aria-label="Уменьшить количество"><Minus /></button><span>{item.quantity}</span><button type="button" onClick={() => setQty(item, item.quantity + 1)} aria-label="Увеличить количество"><Plus /></button></div>
              <button type="button" className="cart-remove-v3" onClick={() => remove(item)} aria-label={`Удалить ${item.title}`}><Trash2 /></button>
            </article>;
          })}
        </div>
      </section>

      <aside className="cart-summary-v3">
        <div className="cart-summary-sticky-v3">
          <h2>Итого</h2>
          <div className="cart-summary-lines-v3"><div><span>Товары ({totalQty})</span><b>{money(total)} BYN</b></div><div><span>Доставка</span><span>Способ получения уточняется</span></div></div>
          <div className="cart-summary-total-v3"><span>Итого</span><strong>{money(total)} BYN</strong></div>
          <Link href={selected.size ? '/checkout' : '#'} className={!selected.size ? 'is-disabled' : ''} onClick={(event) => { if (!selected.size) event.preventDefault(); }}>Оформить заказ <span>→</span></Link>
          <Link href="/catalog" className="cart-continue-v3">Продолжить покупки</Link>
          <ul className="cart-summary-benefits-v3"><li><ShieldCheck /><div><b>Надёжное оформление</b><span>Ваши данные защищены</span></div></li><li><MessageCircle /><div><b>Уточним детали</b><span>Свяжемся после оформления</span></div></li><li><Factory /><div><b>Собственное производство</b><span>Согласуем сроки изготовления</span></div></li></ul>
        </div>
      </aside>
    </div>
    <CartRecommendations products={recommendationItems} onAdd={addRecommendation} />
    <div className="cart-mobile-checkout-v3"><span>Итого: <b>{money(total)} BYN</b></span><Link href={selected.size ? '/checkout' : '#'} className={!selected.size ? 'is-disabled' : ''}>Оформить</Link></div>
  </>;
}

function CartRecommendations({ products, onAdd }: { products: CatalogProduct[]; onAdd: (product: CatalogProduct) => void }) {
  if (!products.length) return null;
  return <section className="cart-recommendations-v3">
    <div className="cart-recommendations-content-v3">
      <div>
        <div className="cart-section-title-v3">
          <div><h2>Возможно, вам понравится</h2></div>
          <Link href="/catalog">Перейти в каталог <span>→</span></Link>
        </div>
        <div className="catalog-grid-market cart-recommendation-grid-v3">
          {products.map((product) => <article className="catalog-card-market" key={product.slug}>
            <button className="cart-heart-v3" type="button" aria-label={`Добавить ${product.title} в избранное`}><Heart /></button>
            <Link href={`/product/${product.slug}`} className="catalog-card-image-market" aria-label={`Открыть товар: ${product.title}`}>
              <img src={product.image} alt={product.title} />
            </Link>
            <div className="catalog-card-body-market">
              <h3>{product.title}</h3>
              <div className="catalog-card-bottom-market">
                <b>{money(product.price)} BYN</b>
                <button type="button" aria-label={`Добавить в корзину: ${product.title}`} onClick={() => onAdd(product)}>В корзину</button>
              </div>
            </div>
          </article>)}
        </div>
      </div>
      <aside className="cart-custom-promo-v3">
        <div><h3>Индивидуальные<br />часы под ваш<br />интерьер</h3><p>Реализуем ваши идеи<br />из металла и дерева.</p><Link href="/contacts">Оставить заявку <span>→</span></Link></div>
      </aside>
    </div>
  </section>;
}
