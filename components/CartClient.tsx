'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type CartItem = {
  slug: string;
  title: string;
  price: number;
  image: string;
  material?: string;
  size?: string;
  quantity: number;
};

type CheckoutForm = {
  name: string;
  phone: string;
  email: string;
  delivery: string;
  comment: string;
};

function readCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem('bullmet_cart');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function money(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value);
}

export function CartClient() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [form, setForm] = useState<CheckoutForm>({ name: '', phone: '', email: '', delivery: 'Доставка по Беларуси', comment: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [successId, setSuccessId] = useState('');

  useEffect(() => {
    setItems(readCart());
    const onUpdate = () => setItems(readCart());
    window.addEventListener('bullmet-cart-updated', onUpdate);
    window.addEventListener('storage', onUpdate);
    return () => {
      window.removeEventListener('bullmet-cart-updated', onUpdate);
      window.removeEventListener('storage', onUpdate);
    };
  }, []);

  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0), [items]);
  const totalQty = useMemo(() => items.reduce((sum, item) => sum + Number(item.quantity || 1), 0), [items]);

  function patch<K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function save(next: CartItem[]) {
    setItems(next);
    window.localStorage.setItem('bullmet_cart', JSON.stringify(next));
    window.dispatchEvent(new Event('bullmet-cart-updated'));
  }

  function setQty(slug: string, size: string | undefined, quantity: number) {
    save(items.map((item) => item.slug === slug && item.size === size ? { ...item, quantity: Math.max(1, quantity) } : item));
  }

  function remove(slug: string, size: string | undefined) {
    save(items.filter((item) => !(item.slug === slug && item.size === size)));
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setSuccessId('');

    if (!form.name.trim() || !form.phone.trim()) {
      setMessage('Укажите имя и телефон, чтобы мы могли связаться с вами.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer: form, delivery: form.delivery, comment: form.comment, items })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось оформить заказ.');
      window.localStorage.removeItem('bullmet_cart');
      window.dispatchEvent(new Event('bullmet-cart-updated'));
      setItems([]);
      setSuccessId(data.id || '');
      setForm({ name: '', phone: '', email: '', delivery: 'Доставка по Беларуси', comment: '' });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось оформить заказ.');
    } finally {
      setLoading(false);
    }
  }

  if (successId) {
    return (
      <section className="cart-success-card">
        <span>✓</span>
        <h2>Заказ оформлен</h2>
        <p>Номер заказа: <b>{successId}</b>. Мы получили заявку и свяжемся с вами для подтверждения деталей.</p>
        <div>
          <Link href="/catalog">Вернуться в каталог</Link>
          <Link href="/contacts">Связаться с нами</Link>
        </div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="cart-empty-card">
        <h2>Корзина пустая</h2>
        <p>Добавьте товар из каталога или отправьте заявку на индивидуальный расчет.</p>
        <div>
          <Link href="/catalog">Перейти в каталог</Link>
          <Link href="/services">Заказать расчет</Link>
        </div>
      </section>
    );
  }

  return (
    <div className="cart-layout-pro">
      <section className="cart-items-card">
        <div className="cart-items-head">
          <div><h2>Корзина</h2><p>{totalQty} товар(ов) в заказе</p></div>
          <button type="button" onClick={() => save([])}>Очистить</button>
        </div>

        {items.map((item) => (
          <article key={`${item.slug}-${item.size}`} className="cart-row-pro">
            <Link href={`/product/${item.slug}`} className="cart-row-image"><img src={item.image} alt={item.title} /></Link>
            <div className="cart-row-info">
              <Link href={`/product/${item.slug}`}>{item.title}</Link>
              <p>{item.size || item.material || 'Под заказ'}</p>
              {item.material && <span>{item.material}</span>}
            </div>
            <div className="cart-row-price"><b>{money(item.price)} BYN</b><small>за шт.</small></div>
            <div className="cart-row-qty">
              <button type="button" onClick={() => setQty(item.slug, item.size, item.quantity - 1)}>−</button>
              <span>{item.quantity}</span>
              <button type="button" onClick={() => setQty(item.slug, item.size, item.quantity + 1)}>+</button>
            </div>
            <div className="cart-row-total"><b>{money(item.price * item.quantity)} BYN</b><button type="button" onClick={() => remove(item.slug, item.size)}>Удалить</button></div>
          </article>
        ))}
      </section>

      <aside className="checkout-card-pro">
        <h2>Оформление заказа</h2>
        <p>Оставьте контакты — менеджер подтвердит стоимость, сроки и детали изготовления.</p>
        <div className="checkout-total"><span>Итого</span><b>{money(total)} BYN</b></div>
        <form onSubmit={submitOrder}>
          <label>Имя<input value={form.name} onChange={(event) => patch('name', event.target.value)} placeholder="Ваше имя" required /></label>
          <label>Телефон<input value={form.phone} onChange={(event) => patch('phone', event.target.value)} placeholder="+375 ..." required /></label>
          <label>Email<input value={form.email} onChange={(event) => patch('email', event.target.value)} placeholder="email@example.com" /></label>
          <label>Доставка<select value={form.delivery} onChange={(event) => patch('delivery', event.target.value)}><option>Доставка по Беларуси</option><option>Самовывоз</option><option>Обсудить с менеджером</option></select></label>
          <label>Комментарий<textarea value={form.comment} onChange={(event) => patch('comment', event.target.value)} rows={4} placeholder="Цвет, сроки, адрес или пожелания" /></label>
          {message && <p className="checkout-message">{message}</p>}
          <button type="submit" disabled={loading}>{loading ? 'Отправляем...' : 'Оформить заказ'}</button>
        </form>
      </aside>
    </div>
  );
}
