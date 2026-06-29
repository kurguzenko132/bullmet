'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Icon } from './Icon';

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

function readRememberedEmail() {
  try {
    return String(window.localStorage.getItem('bullmet_account_last_email') || '').trim().toLowerCase();
  } catch {
    return '';
  }
}

function persistLocalOrder(order: Record<string, unknown>) {
  try {
    window.sessionStorage.setItem('bullmet_last_order', JSON.stringify(order));
    window.localStorage.setItem('bullmet_last_order', JSON.stringify(order));

    const rawHistory = window.localStorage.getItem('bullmet_local_orders');
    const parsedHistory = rawHistory ? JSON.parse(rawHistory) : [];
    const history = Array.isArray(parsedHistory) ? parsedHistory : [];
    const next = [order, ...history.filter((item) => item?.id !== order.id)].slice(0, 20);
    window.localStorage.setItem('bullmet_local_orders', JSON.stringify(next));
    window.dispatchEvent(new Event('bullmet-orders-updated'));
  } catch {}
}

function money(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value);
}

function shortTitle(value: string) {
  return value.length > 62 ? `${value.slice(0, 62)}...` : value;
}

export function CartClient() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [form, setForm] = useState<CheckoutForm>({ name: '', phone: '', email: '', delivery: 'Доставка по Беларуси', comment: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formTouched, setFormTouched] = useState(false);

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

  useEffect(() => {
    async function fillUserData() {
      if (formTouched) return;

      const rememberedEmail = readRememberedEmail();
      if (rememberedEmail) {
        setForm((current) => ({ ...current, email: current.email || rememberedEmail }));
      }

      if (!supabase) return;

      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        if (!session?.user) return;

        const email = session.user.email || rememberedEmail;
        let fullName = '';
        let phone = '';

        const profileWithPhone = await supabase.from('profiles').select('full_name, phone').eq('id', session.user.id).maybeSingle();
        const profile = profileWithPhone.error
          ? await supabase.from('profiles').select('full_name').eq('id', session.user.id).maybeSingle()
          : profileWithPhone;

        if (!profile.error && profile.data) {
          fullName = String(profile.data.full_name || '');
          phone = String((profile.data as { phone?: string | null }).phone || '');
        }

        setForm((current) => ({
          ...current,
          name: current.name || fullName,
          phone: current.phone || phone,
          email: current.email || email
        }));
      } catch {
        // Корзина не должна ломаться, если профиль временно не подтянулся.
      }
    }

    fillUserData();
  }, [formTouched]);

  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0), [items]);
  const totalQty = useMemo(() => items.reduce((sum, item) => sum + Number(item.quantity || 1), 0), [items]);
  const hasCustomItems = useMemo(() => items.some((item) => String(item.size || '').toLowerCase().includes('под заказ')), [items]);

  function patch<K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) {
    setFormTouched(true);
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

    if (!items.length) {
      setMessage('Корзина пустая. Добавьте товар перед оформлением заказа.');
      return;
    }

    if (!form.name.trim() || !form.phone.trim()) {
      setMessage('Укажите имя и телефон, чтобы мы могли связаться с вами.');
      return;
    }

    setLoading(true);
    try {
      const cleanCustomer = {
        ...form,
        email: form.email || readRememberedEmail()
      };
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer: cleanCustomer, delivery: form.delivery, comment: form.comment, items, accountEmail: cleanCustomer.email })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось оформить заказ.');

      const orderId = data.id || '';
      persistLocalOrder({
        id: orderId,
        created_at: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        total,
        totalQty,
        delivery: form.delivery,
        customer: cleanCustomer,
        items,
        status: 'Новый',
        savedToSupabase: data.savedToSupabase !== false,
        warning: data.warning || ''
      });
      window.localStorage.removeItem('bullmet_cart');
      window.dispatchEvent(new Event('bullmet-cart-updated'));
      setItems([]);
      router.push(`/order-success?id=${encodeURIComponent(orderId)}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось оформить заказ.');
    } finally {
      setLoading(false);
    }
  }

  if (!items.length) {
    return (
      <section className="cart-empty-card cart-empty-card--stage2">
        <div className="cart-empty-icon"><Icon name="cart" /></div>
        <h2>Корзина пустая</h2>
        <p>Добавьте настенные часы из каталога и оформите заказ.</p>
        <div>
          <Link href="/catalog">Перейти в каталог</Link>
          <Link href="/contacts">Связаться</Link>
        </div>
      </section>
    );
  }

  return (
    <div className="cart-layout-pro cart-layout-pro--stage2">
      <section className="cart-items-card cart-items-card--stage2">
        <div className="cart-items-head cart-items-head--stage2">
          <div>
            <p className="section-kicker">Корзина</p>
            <h2>Ваш заказ</h2>
            <span>{totalQty} товар(ов) · {money(total)} BYN</span>
          </div>
          <button type="button" onClick={() => save([])}>Очистить</button>
        </div>

        <div className="cart-rows-stage2">
          {items.map((item) => (
            <article key={`${item.slug}-${item.size}`} className="cart-row-pro cart-row-pro--stage2">
              <Link href={`/product/${item.slug}`} className="cart-row-image cart-row-image--stage2"><img src={item.image} alt={item.title} /></Link>
              <div className="cart-row-info cart-row-info--stage2">
                <Link href={`/product/${item.slug}`}>{shortTitle(item.title)}</Link>
                <p>{item.size || item.material || 'Под заказ'}</p>
                {item.material && <span>{item.material}</span>}
              </div>
              <div className="cart-row-price cart-row-price--stage2"><b>{money(item.price)} BYN</b><small>за шт.</small></div>
              <div className="cart-row-qty cart-row-qty--stage2">
                <button type="button" onClick={() => setQty(item.slug, item.size, item.quantity - 1)} aria-label="Уменьшить количество">−</button>
                <span>{item.quantity}</span>
                <button type="button" onClick={() => setQty(item.slug, item.size, item.quantity + 1)} aria-label="Увеличить количество">+</button>
              </div>
              <div className="cart-row-total cart-row-total--stage2"><b>{money(item.price * item.quantity)} BYN</b><button type="button" onClick={() => remove(item.slug, item.size)}>Удалить</button></div>
            </article>
          ))}
        </div>

        <div className="cart-upsell-stage2">
          <Icon name="custom" />
          <div>
            <b>{hasCustomItems ? 'Заказ требует уточнения' : 'Можно уточнить размер и цвет'}</b>
            <p>{hasCustomItems ? 'Менеджер свяжется, уточнит материал, размеры, цвет и точную стоимость.' : 'Если нужен другой размер или цвет — укажите это в комментарии к заказу.'}</p>
          </div>
          <Link href="/contacts">Связаться</Link>
        </div>
      </section>

      <aside className="checkout-card-pro checkout-card-pro--stage2">
        <div className="checkout-sticky-stage2">
          <h2>Оформление</h2>
          <p>Оставьте контакты — мы подтвердим стоимость, сроки и детали изготовления.</p>

          <div className="checkout-total checkout-total--stage2">
            <div><span>Товары</span><b>{totalQty}</b></div>
            <div><span>Доставка</span><b>уточним</b></div>
            <div><span>Итого</span><strong>{money(total)} BYN</strong></div>
          </div>

          <form onSubmit={submitOrder}>
            <label>Имя<input value={form.name} onChange={(event) => patch('name', event.target.value)} placeholder="Ваше имя" required /></label>
            <label>Телефон<input value={form.phone} onChange={(event) => patch('phone', event.target.value)} placeholder="+375 ..." required /></label>
            <label>Email<input value={form.email} onChange={(event) => patch('email', event.target.value)} placeholder="email@example.com" /></label>
            <label>Способ получения<select value={form.delivery} onChange={(event) => patch('delivery', event.target.value)}><option>Доставка по Беларуси</option><option>Самовывоз</option><option>Обсудить с менеджером</option></select></label>
            <label>Комментарий<textarea value={form.comment} onChange={(event) => patch('comment', event.target.value)} rows={4} placeholder="Цвет, сроки, адрес или пожелания" /></label>
            {message && <p className="checkout-message">{message}</p>}
            <button type="submit" disabled={loading}>{loading ? 'Оформляем...' : 'Оформить заказ'}</button>
          </form>

          <div className="checkout-safe-stage2">
            <span>После отправки заказ попадёт в админку, менеджер свяжется с вами для подтверждения.</span>
            <span>Оплата и доставка подтверждаются менеджером.</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
