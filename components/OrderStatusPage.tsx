'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Header, Footer } from './HomePage';
import { AdminOrder, formatDateTime, readAdminOrdersAsync } from './adminBusinessStore';

export function OrderStatusPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    readAdminOrdersAsync().then(setOrders);
  }, []);

  const found = useMemo(() => {
    const id = orderId.trim().replace(/^#/, '').toLowerCase();
    const cleanPhone = phone.replace(/\D/g, '');
    if (!id || !cleanPhone) return null;
    return orders.find((order) => order.id.toLowerCase() === id && order.customer.phone.replace(/\D/g, '').endsWith(cleanPhone.slice(-7))) ?? null;
  }, [orders, orderId, phone]);

  return (
    <>
      <Header />
      <main className="orderStatusPage">
        <section className="container catalogHero">
          <div className="breadcrumbs"><Link href="/">Главная</Link><span>/</span><span>Статус заказа</span></div>
          <h1 className="pageTitle">Проверить статус заказа</h1>
          <p className="orderStatusLead">Введите номер заказа и телефон, указанный при оформлении. Статус подтянется из админки.</p>
        </section>

        <section className="container orderStatusLayout">
          <form className="orderStatusForm" onSubmit={(event) => { event.preventDefault(); setSearched(true); }}>
            <label>Номер заказа<input value={orderId} onChange={(event) => setOrderId(event.target.value)} placeholder="Например: BLM-12345" required /></label>
            <label>Телефон<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+375 29 000-00-00" required /></label>
            <button className="button button--orange" type="submit">Проверить</button>
          </form>

          <div className="orderStatusResult">
            {!searched ? (
              <div><b>Мы покажем:</b><p>статус заказа, дату оформления, состав и комментарий менеджера.</p></div>
            ) : found ? (
              <article>
                <span>Заказ #{found.id}</span>
                <h2>{found.status}</h2>
                <p>Создан: {formatDateTime(found.createdAt)}</p>
                <p>Клиент: {found.customer.name}</p>
                <p>Сумма: {found.total} BYN</p>
                <div className="orderStatusItems">
                  {found.items.map((item) => <p key={`${item.slug}-${item.size ?? 'default'}`}>{item.title} × {item.quantity}</p>)}
                </div>
                {found.adminNote && <div className="orderStatusNote"><b>Комментарий менеджера</b><p>{found.adminNote}</p></div>}
              </article>
            ) : (
              <div><b>Заказ не найден</b><p>Проверьте номер заказа и телефон. Если заказ оформлен недавно, напишите нам через форму заявки.</p><Link href="/request">Связаться с Bullmet</Link></div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
