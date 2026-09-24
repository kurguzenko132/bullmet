import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabase';
import { notifyTelegram } from '@/lib/notifications';
import { validateCoupon } from '@/lib/couponValidation';
import { getSiteControlSettings, quoteDelivery } from '@/lib/siteControl';

type OrderItem = {
  productId?: string;
  slug?: string;
  quantity?: number;
  size?: string;
};

function cleanText(value: unknown) {
  return String(value || '').trim();
}

function money(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value);
}

function makeOrderId(prefix: string, nextNumber: number) {
  const cleanPrefix = prefix.trim().replace(/[^a-zа-яё0-9_-]/gi, '').slice(0, 20) || 'BM-';
  return `${cleanPrefix}${Math.max(1, Math.floor(nextNumber || 1))}`;
}

function toCents(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : 0;
}

function fromCents(value: number) {
  return value / 100;
}

function validPhone(value: string) {
  return /^[+()\-\s\d]{7,24}$/.test(value) && /\d/.test(value);
}

function validEmail(value: string) {
  return !value || (value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
}

export async function POST(request: NextRequest) {
  try {
    if (Number(request.headers.get('content-length') || 0) > 100_000) return NextResponse.json({ ok: false, message: 'Слишком большой запрос.' }, { status: 413 });
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') return NextResponse.json({ ok: false, message: 'Некорректные данные заказа.' }, { status: 400 });
    const items = Array.isArray(body.items) ? body.items as OrderItem[] : [];
    const requestedItems = items.map((item) => ({
      slug: cleanText(item.slug),
      size: cleanText(item.size),
      quantity: Number(item.quantity)
    }));

    const customer = {
      name: cleanText(body.customer?.name || body.name),
      phone: cleanText(body.customer?.phone || body.phone),
      email: cleanText(body.customer?.email || body.email || body.accountEmail)
    };

    if (!requestedItems.length || requestedItems.length > 50 || requestedItems.some((item) => !item.slug || item.slug.length > 120 || item.size.length > 120 || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 50)) {
      return NextResponse.json({ ok: false, message: 'Проверьте товары и количество в корзине.' }, { status: 400 });
    }
    if (!customer.name || customer.name.length > 120 || !validPhone(customer.phone) || !validEmail(customer.email)) {
      return NextResponse.json({ ok: false, message: 'Укажите корректные имя, телефон и email.' }, { status: 400 });
    }
    if (cleanText(body.comment).length > 2_000 || cleanText(body.deliveryAddress || body.delivery_address).length > 500) return NextResponse.json({ ok: false, message: 'Комментарий или адрес слишком длинный.' }, { status: 400 });
    if (!serverSupabase) return NextResponse.json({ ok: false, message: 'Приём заказов временно недоступен. Корзина сохранена — попробуйте ещё раз позже.' }, { status: 503 });

    const settings = await getSiteControlSettings();
    const accessToken = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
    if (!settings.adminSettings.orders.allowGuestCheckout) {
      if (!accessToken) return NextResponse.json({ ok: false, message: 'Оформление доступно только после входа в аккаунт.' }, { status: 401 });
      const { data: auth, error: authError } = await serverSupabase.auth.getUser(accessToken);
      if (authError || !auth.user) return NextResponse.json({ ok: false, message: 'Войдите в аккаунт, чтобы оформить заказ.' }, { status: 401 });
    }

    const requestedSlugs = Array.from(new Set(requestedItems.map((item) => item.slug)));
    const { data: catalogRows, error: catalogError } = await serverSupabase
      .from('products')
      .select('id,slug,title,price,old_price,image,material,sizes,status,in_stock,category')
      .in('slug', requestedSlugs)
      .eq('status', 'active');
    if (catalogError) {
      console.error('Order catalog lookup error:', catalogError.message);
      return NextResponse.json({ ok: false, message: 'Не удалось проверить состав заказа. Повторите попытку позже.' }, { status: 503 });
    }
    const productsBySlug = new Map((catalogRows || []).map((product: any) => [String(product.slug), product]));
    const normalizedItems = requestedItems.map((item) => {
      const product = productsBySlug.get(item.slug);
      if (!product || product.in_stock === false) return null;
      const sizes = Array.isArray(product.sizes) ? product.sizes.map(String) : [];
      if (item.size && sizes.length && !sizes.includes(item.size)) return null;
      const priceCents = toCents(product.price);
      return {
        productId: String(product.id),
        slug: String(product.slug),
        title: String(product.title),
        price: fromCents(priceCents),
        oldPrice: product.old_price == null ? undefined : fromCents(toCents(product.old_price)),
        categoryId: String(product.category || ''),
        quantity: item.quantity,
        size: item.size,
        material: String(product.material || ''),
        image: String(product.image || ''),
        category: String(product.category || '')
      };
    });
    if (normalizedItems.some((item) => !item)) {
      return NextResponse.json({ ok: false, message: 'Один или несколько товаров больше не доступны. Обновите корзину.' }, { status: 409 });
    }
    const verifiedItems = normalizedItems as Array<NonNullable<typeof normalizedItems[number]>>;

    const subtotal = fromCents(verifiedItems.reduce((sum, item) => sum + toCents(item.price) * item.quantity, 0));
    const couponCheck = body.couponCode
      ? await validateCoupon({ code: body.couponCode, items: verifiedItems, customer, delivery: cleanText(body.delivery) })
      : null;
    if (couponCheck && !couponCheck.ok) return NextResponse.json({ ok: false, message: couponCheck.message }, { status: 400 });
    const deliveryQuote = quoteDelivery(settings, cleanText(body.deliveryMethodId), subtotal);
    if (!deliveryQuote) return NextResponse.json({ ok: false, message: 'Выберите доступный способ получения.' }, { status: 400 });
    const discountAmount = fromCents(toCents(couponCheck?.discount));
    const deliveryPriceBeforeCoupon = fromCents(toCents(deliveryQuote.price));
    const deliveryPrice = couponCheck?.deliveryDiscount ? 0 : deliveryPriceBeforeCoupon;
    const total = fromCents(Math.max(0, toCents(subtotal) - toCents(discountAmount) + toCents(deliveryPrice)));
    const createdAt = new Date().toISOString();
    const orderStatus = settings.adminSettings.orders.autoNewStatus ? 'Новый' : 'Ожидает обработки';
    const orderId = makeOrderId(settings.adminSettings.orders.orderPrefix, settings.adminSettings.orders.nextOrderNumber);
    const order = {
      id: orderId,
      customer,
      delivery: deliveryQuote.method.title,
      delivery_address: cleanText(body.deliveryAddress || body.delivery_address),
      payment_method: cleanText(body.paymentMethod || body.payment_method) || 'При получении',
      source: 'website',
      comment: settings.commerce.deliverySettings.allowComment ? cleanText(body.comment) : '',
      items: verifiedItems,
      subtotal,
      coupon_id: couponCheck?.coupon?.id || null,
      coupon_code: couponCheck?.coupon?.code || null,
      coupon_type: couponCheck?.coupon?.type || null,
      coupon_value: couponCheck?.coupon?.value || null,
      discount_amount: discountAmount,
      delivery_discount: deliveryPriceBeforeCoupon - deliveryPrice,
      total,
      status: orderStatus,
      status_history: [{ status: orderStatus, created_at: createdAt, author: 'Система' }]
    };

    const { data: savedOrder, error } = await serverSupabase
      .from('orders')
      .insert(order)
      .select('id, created_at, delivery, subtotal, discount_amount, delivery_discount, total, status')
      .single();
    if (error) {
      console.error('Order persistence error:', error.message);
      return NextResponse.json({ ok: false, message: 'Не удалось сохранить заказ. Корзина сохранена — попробуйте ещё раз позже.' }, { status: 503 });
    }

    const nextOrderSettings = {
      ...settings,
      adminSettings: {
        ...settings.adminSettings,
        orders: { ...settings.adminSettings.orders, nextOrderNumber: Math.max(1, Math.floor(settings.adminSettings.orders.nextOrderNumber || 1)) + 1 }
      }
    };
    const { error: numberError } = await serverSupabase
      .from('site_settings')
      .upsert({ key: 'site_control', value: nextOrderSettings, updated_at: createdAt }, { onConflict: 'key' });
    if (numberError) console.error('Order number update error:', numberError.message);

    if (couponCheck?.coupon && couponCheck.customerKey) {
      const { error: usageError } = await serverSupabase.from('coupon_usages').insert({
        coupon_id: couponCheck.coupon.id,
        order_id: order.id,
        customer_name: customer.name,
        customer_key: couponCheck.customerKey,
        order_total: subtotal,
        discount_amount: discountAmount
      });
      if (usageError) console.error('Coupon usage save error:', usageError.message);
    }

    const telegramResult = await notifyTelegram({
      title: 'Новый заказ Bullmet',
      lines: [
        `Заказ: ${order.id}`,
        `Клиент: ${customer.name}`,
        `Телефон: ${customer.phone}`,
        customer.email && `Email: ${customer.email}`,
        `Сумма: ${money(total)} BYN`,
        `Товары: ${verifiedItems.map((item) => `${item.title} × ${item.quantity}`).join('; ')}`,
        order.comment && `Комментарий: ${order.comment}`
      ],
      enabled: settings.adminSettings.notifications.telegram && settings.adminSettings.notifications.newOrder
    });

    return NextResponse.json({ ok: true, id: order.id, order: savedOrder, savedToSupabase: true, telegramSent: telegramResult.ok, warning: telegramResult.ok ? undefined : telegramResult.reason });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Не удалось оформить заказ.' }, { status: 500 });
  }
}
