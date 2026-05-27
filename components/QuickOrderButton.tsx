'use client';

import Image from 'next/image';
import { FormEvent, MouseEvent, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Product } from './shopData';
import { addAdminRequestAsync, makeRequestId } from './adminBusinessStore';
import { trackBullmetEvent } from '../lib/analytics';

type QuickOrderButtonProps = {
  product: Product;
  quantity?: number;
  size?: string;
  className?: string;
  label?: string;
  compact?: boolean;
};

const contactMethods = ['Позвонить', 'WhatsApp', 'Telegram', 'Email'];

export function QuickOrderButton({ product, quantity = 1, size, className, label = 'Купить в 1 клик', compact }: QuickOrderButtonProps) {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState(quantity);
  const [contactMethod, setContactMethod] = useState(contactMethods[0]);
  const [sending, setSending] = useState(false);
  const [sentId, setSentId] = useState('');
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setQty(quantity);
  }, [quantity]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function openModal(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setError('');
    setSentId('');
    setOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const id = makeRequestId('Q');
    setSending(true);
    setError('');

    try {
      await addAdminRequestAsync({
        id,
        createdAt: new Date().toISOString(),
        kind: 'quick_order',
        contactMethod,
        customer: {
          name: String(data.get('name') ?? '').trim(),
          phone: String(data.get('phone') ?? '').trim(),
          email: String(data.get('email') ?? '').trim(),
          city: String(data.get('city') ?? '').trim(),
        },
        type: 'Быстрый заказ',
        material: product.material || 'Не указан',
        sizes: String(data.get('size') ?? size ?? '').trim(),
        comment: String(data.get('comment') ?? '').trim() || 'Клиент хочет купить товар в 1 клик.',
        productSlug: product.slug,
        productTitle: product.title,
        productImage: product.image,
        productPrice: product.price,
        quantity: qty,
        status: 'Новая',
      });
      trackBullmetEvent('quick_order_submit', { slug: product.slug, title: product.title, quantity: qty });
      setSentId(id);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось отправить быстрый заказ.');
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button className={className ?? 'button button--ghost'} type="button" onClick={openModal}>
        {label}
      </button>

      {mounted && open && createPortal((
        <div className="quickOrderOverlay" role="dialog" aria-modal="true" aria-label="Купить в один клик" onClick={() => setOpen(false)}>
          <div className="quickOrderModal" onClick={(event) => event.stopPropagation()}>
            <button className="quickOrderClose" type="button" onClick={() => setOpen(false)} aria-label="Закрыть">×</button>

            {sentId ? (
              <div className="quickOrderSuccess">
                <span>✓</span>
                <h3>Заявка отправлена</h3>
                <p>Номер быстрого заказа: <b>{sentId}</b>. Мы свяжемся с клиентом и уточним детали.</p>
                <button className="button button--orange" type="button" onClick={() => setOpen(false)}>Готово</button>
              </div>
            ) : (
              <>
                <div className="quickOrderHead">
                  <div className="quickOrderProductImage">
                    <Image src={product.image} alt={product.title} fill sizes="96px" />
                  </div>
                  <div>
                    <p>{compact ? 'Быстрый заказ' : 'Купить в один клик'}</p>
                    <h3>{product.title}</h3>
                    <b>от {product.price} BYN</b>
                  </div>
                </div>

                <form className="quickOrderForm" onSubmit={submit}>
                  <div className="quickOrderGrid">
                    <label>
                      <span>Имя *</span>
                      <input name="name" required placeholder="Ваше имя" />
                    </label>
                    <label>
                      <span>Телефон *</span>
                      <input name="phone" required type="tel" placeholder="+375 29 000-00-00" />
                    </label>
                  </div>

                  <div className="quickOrderGrid quickOrderGrid--three">
                    <label>
                      <span>Количество</span>
                      <div className="quickOrderQty">
                        <button type="button" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                        <strong>{qty}</strong>
                        <button type="button" onClick={() => setQty(qty + 1)}>+</button>
                      </div>
                    </label>
                    <label>
                      <span>Размер / вариант</span>
                      <input name="size" defaultValue={size ?? product.sizes?.[0] ?? ''} placeholder="Например, 60 см" />
                    </label>
                    <label>
                      <span>Город</span>
                      <input name="city" placeholder="Минск" />
                    </label>
                  </div>

                  <label>
                    <span>Как связаться</span>
                    <select value={contactMethod} onChange={(event) => setContactMethod(event.target.value)}>
                      {contactMethods.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>

                  <label>
                    <span>Email</span>
                    <input name="email" type="email" placeholder="mail@example.com" />
                  </label>

                  <label>
                    <span>Комментарий</span>
                    <textarea name="comment" placeholder="Например: хочу уточнить наличие, цвет, доставку или размер." />
                  </label>

                  {error && <div className="quickOrderError">{error}</div>}

                  <div className="quickOrderActions">
                    <button className="button button--orange" type="submit" disabled={sending}>{sending ? 'Отправляем...' : 'Отправить быстрый заказ'}</button>
                    <p>Заявка попадет в админку в раздел “Заявки”.</p>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      ), document.body)}
    </>
  );
}
