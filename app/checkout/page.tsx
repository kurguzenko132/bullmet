'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

type CartItem = { slug: string; title: string; price: number; image: string; size?: string; quantity: number };
type FormState = { name: string; phone: string; email: string; delivery: string; comment: string };
type DeliveryOption = { id: string; title: string; enabled: boolean; order: number };

function readCart(): CartItem[] {
  try { const value = JSON.parse(window.localStorage.getItem('bullmet_cart') || '[]'); return Array.isArray(value) ? value : []; } catch { return []; }
}
function money(value: number) { return new Intl.NumberFormat('ru-RU').format(value); }

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [form, setForm] = useState<FormState>({ name: '', phone: '', email: '', delivery: 'Доставка по Беларуси', comment: '' });
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const finalTotal = Math.max(0, total - Number(coupon?.discount || 0));

  useEffect(() => {
    setItems(readCart());
    try { const saved = JSON.parse(localStorage.getItem('bullmet_coupon') || 'null'); if (saved?.code) setCoupon({ code: String(saved.code), discount: Number(saved.discount || 0) }); } catch {}
    try { setForm((current) => ({ ...current, email: current.email || String(localStorage.getItem('bullmet_account_last_email') || '') })); } catch {}

    let active = true;
    fetch('/api/admin/site-control', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        const options = Array.isArray(data?.settings?.commerce?.deliveryMethods)
          ? data.settings.commerce.deliveryMethods.filter((item: DeliveryOption) => item?.enabled).sort((a: DeliveryOption, b: DeliveryOption) => a.order - b.order)
          : [];
        if (!active || !options.length) return;
        setDeliveryOptions(options);
        setForm((current) => options.some((item: DeliveryOption) => item.title === current.delivery) ? current : { ...current, delivery: options[0].title });
      })
      .catch(() => null);
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length) return;
    setLoading(true); setMessage('');
    try {
      const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer: form, delivery: form.delivery, comment: form.comment, items, couponCode: coupon?.code, accountEmail: form.email }) });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось оформить заказ.');
      localStorage.setItem('bullmet_last_order', JSON.stringify({ id: data.id, total: finalTotal, items, customer: form, delivery: form.delivery, createdAt: new Date().toISOString() }));
      localStorage.removeItem('bullmet_cart');
      localStorage.removeItem('bullmet_coupon');
      window.dispatchEvent(new Event('bullmet-cart-updated'));
      window.location.href = `/order-success?id=${encodeURIComponent(data.id || '')}`;
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Не удалось оформить заказ.'); } finally { setLoading(false); }
  }

  return <><Header /><main className="checkout-page-v3"><div className="checkout-shell-v3"><nav><Link href="/">Главная</Link><span>›</span><Link href="/cart">Корзина</Link><span>›</span><span>Оформление</span></nav>{items.length ? <div className="checkout-layout-v3"><form className="checkout-form-v3" onSubmit={submit}><p>Оформление заказа</p><h1>Контакты и получение</h1><span>Оставьте данные — свяжемся, чтобы уточнить способ получения.</span><div className="checkout-fields-v3"><label>Ваше имя<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Как к вам обращаться?" /></label><label>Телефон<input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+375 (...) ___-__-__" /></label><label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="example@email.com" /></label><label>Способ получения<select value={form.delivery} onChange={(event) => setForm({ ...form, delivery: event.target.value })}>{(deliveryOptions.length ? deliveryOptions : [{ id: 'default_delivery', title: 'Доставка по Беларуси' }, { id: 'default_pickup', title: 'Самовывоз' }, { id: 'default_call', title: 'Уточнить при звонке' }]).map((option) => <option key={option.id}>{option.title}</option>)}</select></label><label className="checkout-comment-v3">Комментарий<textarea value={form.comment} onChange={(event) => setForm({ ...form, comment: event.target.value })} placeholder="Адрес, удобное время для звонка или пожелания" /></label></div>{message && <b className="checkout-error-v3">{message}</b>}<button disabled={loading} type="submit">{loading ? 'Оформляем...' : 'Оформить заказ'} <ArrowRight /></button></form><aside className="checkout-order-v3"><h2>Ваш заказ</h2>{items.map((item) => <div key={`${item.slug}-${item.size || ''}`}><img src={item.image} alt="" /><span><b>{item.title}</b><small>{item.quantity} шт.</small></span><strong>{money(item.price * item.quantity)} BYN</strong></div>)}{coupon && <section className="checkout-discount-v4"><span>Скидка {coupon.code}</span><b>−{money(coupon.discount)} BYN</b></section>}<section><span>Итого</span><b>{money(finalTotal)} BYN</b></section><p><CheckCircle2 /> Детали доставки уточним после оформления.</p></aside></div> : <section className="checkout-empty-v3"><h1>Корзина пока пустая</h1><p>Добавьте товары перед оформлением заказа.</p><Link href="/catalog">Перейти в каталог</Link></section>}</div></main><Footer /></>;
}
