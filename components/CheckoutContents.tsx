'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CartItem, cartTotal, readCart, writeCart } from './cart';
import { addAdminOrderAsync, makeOrderId } from './adminBusinessStore';
import { trackBullmetEvent } from '../lib/analytics';

export function CheckoutContents() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [sent, setSent] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [step, setStep] = useState(1);
  const [customerData, setCustomerData] = useState<{ name: string; phone: string; email: string; city: string; delivery: 'Доставка по Беларуси' | 'Самовывоз'; payment: 'После согласования' | 'При получении' | 'По счету'; comment: string }>({
    name: '',
    phone: '',
    email: '',
    city: '',
    delivery: 'Доставка по Беларуси',
    payment: 'После согласования',
    comment: '',
  });
  const total = useMemo(() => cartTotal(items), [items]);

  useEffect(() => {
    setItems(readCart());
  }, []);

  async function submitOrder() {
    const id = makeOrderId();
    await addAdminOrderAsync({
      id,
      createdAt: new Date().toISOString(),
      customer: {
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email,
        city: customerData.city,
      },
      delivery: customerData.delivery,
      comment: [`Оплата: ${customerData.payment}`, customerData.comment].filter(Boolean).join('\n'),
      items,
      total,
      status: 'Новый',
    });
    trackBullmetEvent('checkout_submit', { orderId: id, total, count: items.length });
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
          <p>Заказ принят и сохранен. Менеджер Bullmet свяжется с вами для подтверждения деталей.</p>
          <div className="successOrder__actions">
            <Link className="button button--orange" href="/order-status">Проверить статус</Link>
            <Link className="button button--outline" href="/catalog">Вернуться в каталог</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container checkoutShell">
      <div className="checkoutProgress"><span className={step >= 1 ? 'active' : ''}>1. Контакты</span><i /><span className={step >= 2 ? 'active' : ''}>2. Подтверждение</span></div>
      <div className="checkoutLayout">
      {step === 1 ? (
        <form className="checkoutForm" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
          <h2>Данные покупателя</h2>
          <div className="formGrid">
            <label>Имя<input name="name" required placeholder="Введите имя" value={customerData.name} onChange={(e) => setCustomerData((d) => ({ ...d, name: e.target.value }))} /></label>
            <label>Телефон<input name="phone" required placeholder="+375 29 123-45-67" value={customerData.phone} onChange={(e) => setCustomerData((d) => ({ ...d, phone: e.target.value }))} /></label>
            <label>Email<input name="email" type="email" placeholder="mail@example.com" value={customerData.email} onChange={(e) => setCustomerData((d) => ({ ...d, email: e.target.value }))} /></label>
            <label>Город<input name="city" placeholder="Минск" value={customerData.city} onChange={(e) => setCustomerData((d) => ({ ...d, city: e.target.value }))} /></label>
          </div>
          <h2>Доставка</h2>
          <div className="deliveryOptions">
            <label><input type="radio" name="delivery" value="Доставка по Беларуси" checked={customerData.delivery === 'Доставка по Беларуси'} onChange={() => setCustomerData((d) => ({ ...d, delivery: 'Доставка по Беларуси' }))} /> Доставка по Беларуси</label>
            <label><input type="radio" name="delivery" value="Самовывоз" checked={customerData.delivery === 'Самовывоз'} onChange={() => setCustomerData((d) => ({ ...d, delivery: 'Самовывоз' }))} /> Самовывоз</label>
          </div>
          <h2>Оплата</h2>
          <div className="deliveryOptions">
            {(['После согласования', 'При получении', 'По счету'] as const).map((item) => (
              <label key={item}><input type="radio" name="payment" checked={customerData.payment === item} onChange={() => setCustomerData((d) => ({ ...d, payment: item }))} /> {item}</label>
            ))}
          </div>
          <label className="fullField">Комментарий<textarea name="comment" rows={5} placeholder="Размеры, пожелания, удобное время звонка" value={customerData.comment} onChange={(e) => setCustomerData((d) => ({ ...d, comment: e.target.value }))} /></label>
          <div className="checkoutNav">
            <button className="button button--orange" type="submit" disabled={items.length === 0}>Далее</button>
          </div>
        </form>
      ) : (
        <div className="checkoutConfirmation">
          <div className="checkoutForm">
            <h2>Подтверждение заказа</h2>
            <p><b>Имя:</b> {customerData.name}</p>
            <p><b>Телефон:</b> {customerData.phone}</p>
            {customerData.email && <p><b>Email:</b> {customerData.email}</p>}
            {customerData.city && <p><b>Город:</b> {customerData.city}</p>}
            <p><b>Доставка:</b> {customerData.delivery}</p>
            <p><b>Оплата:</b> {customerData.payment}</p>
            {customerData.comment && <p><b>Комментарий:</b> {customerData.comment}</p>}
            <div className="checkoutNav">
              <button className="button button--outline" type="button" onClick={() => setStep(1)}>Назад</button>
              <button className="button button--orange" type="button" onClick={submitOrder} disabled={items.length === 0}>Оформить заказ</button>
            </div>
          </div>
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
        </div>
      )}
      </div>
    </section>
  );
}
