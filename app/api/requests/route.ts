import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabase';
import { notifyTelegram } from '@/lib/notifications';

function cleanText(value: unknown) {
  return String(value || '').trim();
}

function makeRequestId(kind: string) {
  const prefix = kind === 'quick_order' ? 'QO' : kind === 'service' ? 'SRV' : kind === 'contact' ? 'MSG' : 'REQ';
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function validPhone(value: string) {
  return /^[+()\-\s\d]{7,24}$/.test(value) && /\d/.test(value);
}

function validEmail(value: string) {
  return !value || (value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
}

async function uploadFiles(files: File[], requestId: string) {
  if (!serverSupabase || !files.length) return [] as string[];
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_REQUEST_FILES_BUCKET || 'request-files';
  const paths: string[] = [];

  for (const file of files) {
    const safeName = file.name.replace(/[^a-zA-Z0-9а-яА-ЯёЁ._-]+/g, '-');
    const path = `${requestId}/${Date.now()}-${safeName}`;
    const arrayBuffer = await file.arrayBuffer();
    const { error } = await serverSupabase.storage.from(bucket).upload(path, Buffer.from(arrayBuffer), {
      upsert: false,
      contentType: file.type || 'application/octet-stream'
    });
    if (!error) paths.push(path);
  }

  return paths;
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let raw: Record<string, unknown> = {};
    let files: File[] = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      raw = Object.fromEntries(formData.entries());
      files = formData.getAll('files').filter((item): item is File => item instanceof File && item.size > 0);
    } else {
      raw = await request.json().catch(() => ({}));
    }

    const kind = cleanText(raw.kind) || 'calculation';
    const id = makeRequestId(kind);
    const customer = {
      name: cleanText(raw.name || raw.customerName),
      phone: cleanText(raw.phone || raw.customerPhone),
      email: cleanText(raw.email || raw.customerEmail)
    };

    if (!['calculation', 'quick_order', 'contact', 'service'].includes(kind) || customer.name.length > 120 || !validPhone(customer.phone) || !validEmail(customer.email)) {
      return NextResponse.json({ ok: false, message: 'Укажите корректные имя, телефон, email и тип заявки.' }, { status: 400 });
    }
    if ([raw.comment, raw.message, raw.sizes, raw.size, raw.type, raw.material, raw.productTitle].some((value) => cleanText(value).length > 2_000)) return NextResponse.json({ ok: false, message: 'Одно из полей заявки слишком длинное.' }, { status: 400 });
    if (raw.quantity != null && raw.quantity !== '' && (!Number.isInteger(Number(raw.quantity)) || Number(raw.quantity) < 1 || Number(raw.quantity) > 50)) return NextResponse.json({ ok: false, message: 'Укажите корректное количество.' }, { status: 400 });
    if (raw.productPrice != null && raw.productPrice !== '' && (!Number.isFinite(Number(raw.productPrice)) || Number(raw.productPrice) < 0 || Number(raw.productPrice) > 10_000_000)) return NextResponse.json({ ok: false, message: 'Укажите корректную цену.' }, { status: 400 });
    if (!serverSupabase) return NextResponse.json({ ok: false, message: 'Приём заявок временно недоступен. Данные формы сохраните и повторите попытку позже.' }, { status: 503 });

    const filePaths = await uploadFiles(files, id);
    const payload = {
      id,
      customer,
      kind,
      contact_method: cleanText(raw.contactMethod),
      type: cleanText(raw.type) || (kind === 'quick_order' ? 'Купить в 1 клик' : kind === 'contact' ? 'Сообщение с сайта' : 'Расчет изделия'),
      material: cleanText(raw.material) || cleanText(raw.productMaterial) || 'Не указан',
      sizes: cleanText(raw.sizes || raw.size),
      comment: cleanText(raw.comment || raw.message),
      product_slug: cleanText(raw.productSlug),
      product_title: cleanText(raw.productTitle),
      product_image: cleanText(raw.productImage),
      product_price: raw.productPrice ? Number(raw.productPrice) : null,
      quantity: raw.quantity ? Number(raw.quantity) : null,
      file_name: files.map((file) => file.name).join(', '),
      file_urls: filePaths,
      status: 'Новая'
    };

    const { error: persistenceError } = await serverSupabase.from('requests').insert(payload);
    if (persistenceError) {
      console.error('Request persistence error:', persistenceError.message);
      return NextResponse.json({ ok: false, message: 'Не удалось сохранить заявку. Повторите попытку позже.' }, { status: 503 });
    }

    const telegramResult = await notifyTelegram({
      title: kind === 'quick_order' ? 'Заявка “Купить в 1 клик”' : kind === 'contact' ? 'Сообщение с сайта Bullmet' : 'Новая заявка на расчет Bullmet',
      lines: [
        `ID: ${id}`,
        `Клиент: ${customer.name}`,
        `Телефон: ${customer.phone}`,
        customer.email && `Email: ${customer.email}`,
        payload.product_title && `Товар: ${payload.product_title}`,
        payload.product_price && `Цена: ${payload.product_price} BYN`,
        payload.sizes && `Размер/вариант: ${payload.sizes}`,
        payload.quantity && `Количество: ${payload.quantity}`,
        payload.comment && `Комментарий: ${payload.comment}`,
        filePaths.length && `Вложений: ${filePaths.length}`,
      ]
    });

    return NextResponse.json({
      ok: true,
      id,
      attachmentsCount: filePaths.length,
      savedToSupabase: true,
      telegramSent: telegramResult.ok,
      warning: telegramResult.ok ? undefined : telegramResult.reason
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Не удалось отправить заявку.' }, { status: 500 });
  }
}
