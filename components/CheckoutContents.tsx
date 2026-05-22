'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CartItem, cartTotal, readCart, writeCart } from './cart';
import { addAdminOrderAsync, makeOrderId } from './adminBusinessStore';

export function CheckoutContents() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [sent, setSent] = useState(false);
  const [orderId, setOrderId] = useState('');
  const total = useMemo(() => cartTotal(items), [items]);

  useEffect(() => {
    setItems(readCart());
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const id = makeOrderId();

    await addAdminOrderAsync({
      id,
      createdAt: new Date().toISOString(),
      customer: {
        name: String(data.get('name') ?? ''),
        phone: String(data.get('phone') ?? ''),
        email: String(data.get('email') ?? ''),
        city: String(data.get('city') ?? ''),
      },
      delivery: String(data.get('delivery') ?? 'Доставка по Беларуси') as 'Доставка по Беларуси' | 'Самовывоз',
      comment: String(data.get('comment') ?? ''),
      items,
      total,
      status: 'Новый',
    });

    setOrderId(id);
    setSent(true);
    writeCart([]);
    setItems([]);
  }

  if (sent) {
    return (
      <section className="container checkoutLayout checkoutLayout--single">
        <div className="successOrder">
          <h2>Заказ #{orderId} оформлен</h2>
          <p>Заказ сохранен в демо-базе сайта. Теперь он доступен в админке в разделе “Заказы”.</p>
          <div className="successOrder__actions">
            <Link className="button button--orange" href="/admin/orders">Открыть заказы в админке</Link>
            <Link className="button button--outline" href="/catalog">Вернуться в каталог</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container checkoutLayout">
      <form className="checkoutForm" onSubmit={handleSubmit}>
        <h2>Данные покупателя</h2>
        <div className="formGrid">
          <label>Имя<input name="name" required placeholder="Введите имя" /></label>
          <label>Телефон<input name="phone" required placeholder="+375 29 123-45-67" /></label>
          <label>Email<input name="email" type="email" placeholder="mail@example.com" /></label>
          <label>Город<input name="city" placeholder="Минск" /></label>
        </div>

        <h2>Доставка</h2>
        <div className="deliveryOptions">
          <label><input type="radio" name="delivery" value="Доставка по Беларуси" defaultChecked /> Доставка по Беларуси</label>
          <label><input type="radio" name="delivery" value="Самовывоз" /> Самовывоз</label>
        </div>

        <label className="fullField">Комментарий<textarea name="comment" rows={5} placeholder="Размеры, пожелания, удобное время звонка" /></label>
        <button className="button button--orange" type="submit" disabled={items.length === 0}>Оформить заказ</button>
      </form>

      <aside className="checkoutSummary">
        <h2>Ваш заказ</h2>
        {items.length === 0 ? <p>Корзина пустая.</p> : items.map((item) => (
          <div className="checkoutItem" key={`${item.slug}-${item.size ?? 'default'}`}>
            <div className="checkoutItem__image"><Image src={item.image} alt={item.title} fill sizes="64px" /></div>
            <div><b>{item.title}</b><span>{item.quantity} × {item.price} BYN</span></div>
          </div>
        ))}
        <div className="checkoutTotal"><span>Итого</span><b>{total} BYN</b></div>
        <p className="checkoutNote">После отправки менеджер свяжется с вами для подтверждения цены, доставки и сроков изготовления.</p>
      </aside>
    </section>
  );
}
