'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Icon } from './Icon';

type LastOrder = {
  id?: string;
  total?: number;
  totalQty?: number;
  delivery?: string;
  createdAt?: string;
  customer?: { name?: string; phone?: string; email?: string };
  items?: { title: string; quantity?: number; price?: number; image?: string; slug?: string }[];
};

function money(value: number) {
  return new Intl.NumberFormat('ru-RU').format(Number(value || 0));
}

function dateLabel(value?: string) {
  if (!value) return 'только что';
  try {
    return new Date(value).toLocaleString('ru-RU', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'только что';
  }
}

export function OrderSuccessClient() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id') || '';
  const [order, setOrder] = useState<LastOrder | null>(null);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem('bullmet_last_order');
      const parsed = raw ? JSON.parse(raw) : null;
      setOrder(parsed && typeof parsed === 'object' ? parsed : null);
    } catch {
      setOrder(null);
    }
  }, []);

  const orderId = useMemo(() => queryId || order?.id || 'BM-заказ', [queryId, order?.id]);
  const items = order?.items || [];

  return (
    <section className="order-success-shell-stage2">
      <div className="order-success-main-stage2">
        <div className="order-success-check-stage2"><Icon name="shield" /></div>
        <p className="section-kicker">Заказ оформлен</p>
        <h1>Спасибо, мы получили ваш заказ</h1>
        <p>Номер заказа: <b>{orderId}</b>. Менеджер Bullmet свяжется с вами, подтвердит детали, сроки и способ получения.</p>
        <div className="order-success-actions-stage2">
          <Link href="/account">Перейти в личный кабинет</Link>
          <Link href="/catalog">Вернуться в каталог</Link>
        </div>
      </div>

      <aside className="order-success-summary-stage2">
        <h2>Что дальше?</h2>
        <div className="order-success-steps-stage2">
          <article><b>01</b><span>Проверим заказ и наличие</span></article>
          <article><b>02</b><span>Свяжемся для подтверждения</span></article>
          <article><b>03</b><span>Согласуем доставку или самовывоз</span></article>
        </div>

        <div className="order-success-info-stage2">
          <div><span>Дата</span><b>{dateLabel(order?.createdAt)}</b></div>
          <div><span>Получение</span><b>{order?.delivery || 'уточним с менеджером'}</b></div>
          <div><span>Товаров</span><b>{order?.totalQty || items.length || '—'}</b></div>
          <div><span>Сумма</span><b>{order?.total ? `${money(order.total)} BYN` : 'уточняется'}</b></div>
        </div>

        {items.length > 0 && (
          <div className="order-success-items-stage2">
            {items.slice(0, 4).map((item, index) => (
              <div key={`${item.slug || item.title}-${index}`}>
                {item.image && <img src={item.image} alt="" />}
                <span>{item.title} × {item.quantity || 1}</span>
                <b>{money(Number(item.price || 0))} BYN</b>
              </div>
            ))}
          </div>
        )}
      </aside>
    </section>
  );
}
