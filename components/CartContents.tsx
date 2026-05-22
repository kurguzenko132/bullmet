'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CartItem, cartCount, cartTotal, readCart, writeCart } from './cart';

export function CartContents() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readCart());
  }, []);

  const total = useMemo(() => cartTotal(items), [items]);
  const count = useMemo(() => cartCount(items), [items]);

  function updateItems(nextItems: CartItem[]) {
    setItems(nextItems);
    writeCart(nextItems);
  }

  function changeQty(index: number, quantity: number) {
    const next = items.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: Math.max(1, quantity) } : item);
    updateItems(next);
  }

  function removeItem(index: number) {
    updateItems(items.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <section className="container cartLayout">
      <div className="cartList">
        {items.length === 0 ? (
          <div className="emptyCart">
            <h2>Корзина пока пустая</h2>
            <p>Перейдите в каталог и добавьте товары, которые хотите заказать.</p>
            <Link className="button button--orange" href="/catalog">Перейти в каталог</Link>
          </div>
        ) : items.map((item, index) => (
          <article className="cartItem" key={`${item.slug}-${item.size ?? 'default'}`}>
            <Link className="cartItem__image" href={`/catalog/${item.slug}`}>
              <Image src={item.image} alt={item.title} fill sizes="150px" />
            </Link>
            <div className="cartItem__info">
              <Link href={`/catalog/${item.slug}`}>{item.title}</Link>
              <p>{item.size ? `Размер: ${item.size}` : 'Стандартная комплектация'}</p>
              <b>от {item.price} BYN</b>
            </div>
            <div className="cartItem__qty">
              <button type="button" onClick={() => changeQty(index, item.quantity - 1)}>−</button>
              <span>{item.quantity}</span>
              <button type="button" onClick={() => changeQty(index, item.quantity + 1)}>+</button>
            </div>
            <strong>{item.price * item.quantity} BYN</strong>
            <button className="cartItem__remove" type="button" onClick={() => removeItem(index)}>Удалить</button>
          </article>
        ))}
      </div>

      <aside className="cartSummary">
        <h2>Итого</h2>
        <div><span>Товары</span><b>{count}</b></div>
        <div><span>Сумма</span><b>{total} BYN</b></div>
        <p>Стоимость доставки и финальные условия заказа уточнит менеджер Bullmet.</p>
        <Link className="button button--orange" href={items.length === 0 ? '/catalog' : '/checkout'}>
          {items.length === 0 ? 'В каталог' : 'Оформить заказ'}
        </Link>
      </aside>
    </section>
  );
}
