import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabase';
import { notifyTelegram } from '@/lib/notifications';

type OrderItem = {
  slug?: string;
  title?: string;
  price?: number;
  quantity?: number;
  size?: string;
  material?: string;
  image?: string;
};

function cleanText(value: unknown) {
  return String(value || '').trim();
}

function money(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value);
}

function makeOrderId() {
  return `BM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items as OrderItem[] : [];
    const normalizedItems = items
      .map((item) => ({
        slug: cleanText(item.slug),
        title: cleanText(item.title),
        price: Number(item.price || 0),
        quantity: Math.max(1, Number(item.quantity || 1)),
        size: cleanText(item.size),
        material: cleanText(item.material),
        image: cleanText(item.image)
      }))
      .filter((item) => item.title && item.price >= 0);

    const customer = {
      name: cleanText(body.customer?.name || body.name),
      phone: cleanText(body.customer?.phone || body.phone),
      email: cleanText(body.customer?.email || body.email || body.accountEmail)
    };

    if (!normalizedItems.length) {
      return NextResponse.json({ ok: false, message: 'Корзина пустая.' }, { status: 400 });
    }
    if (!customer.name || !customer.phone) {
      return NextResponse.json({ ok: false, message: 'Укажите имя и телефон.' }, { status: 400 });
    }

    const total = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = {
      id: makeOrderId(),
      customer,
      delivery: cleanText(body.delivery) || 'Доставка по Беларуси',
      comment: cleanText(body.comment),
      items: normalizedItems,
      total,
      status: 'Новый'
    };

    if (!serverSupabase) {
      await notifyTelegram({
        title: 'Новый заказ Bullmet',
        lines: [
          `Заказ: ${order.id}`,
          `Клиент: ${customer.name}`,
          `Телефон: ${customer.phone}`,
          customer.email && `Email: ${customer.email}`,
          `Сумма: ${money(total)} BYN`,
          `Товары: ${normalizedItems.map((item) => `${item.title} × ${item.quantity}`).join('; ')}`,
          order.comment && `Комментарий: ${order.comment}`
        ]
      });
      return NextResponse.json({ ok: true, id: order.id, warning: 'Supabase не подключен, заказ отправлен только в Telegram.' });
    }

    const { error } = await serverSupabase.from('orders').insert(order);
    if (error) {
      await notifyTelegram({
        title: 'Новый заказ Bullmet — Supabase не сохранил',
        lines: [
          `Заказ: ${order.id}`,
          `Клиент: ${customer.name}`,
          `Телефон: ${customer.phone}`,
          customer.email && `Email: ${customer.email}`,
          `Сумма: ${money(total)} BYN`,
          `Товары: ${normalizedItems.map((item) => `${item.title} × ${item.quantity}`).join('; ')}`,
          `Ошибка Supabase: ${error.message}`,
          order.comment && `Комментарий: ${order.comment}`
        ]
      });
      return NextResponse.json({ ok: true, id: order.id, savedToSupabase: false, warning: `Supabase не сохранил заказ: ${error.message}` });
    }

    const telegramResult = await notifyTelegram({
      title: 'Новый заказ Bullmet',
      lines: [
        `Заказ: ${order.id}`,
        `Клиент: ${customer.name}`,
        `Телефон: ${customer.phone}`,
        customer.email && `Email: ${customer.email}`,
        `Сумма: ${money(total)} BYN`,
        `Товары: ${normalizedItems.map((item) => `${item.title} × ${item.quantity}`).join('; ')}`,
        order.comment && `Комментарий: ${order.comment}`
      ]
    });

    return NextResponse.json({ ok: true, id: order.id, savedToSupabase: true, telegramSent: telegramResult.ok, warning: telegramResult.ok ? undefined : telegramResult.reason });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Не удалось оформить заказ.' }, { status: 500 });
  }
}
