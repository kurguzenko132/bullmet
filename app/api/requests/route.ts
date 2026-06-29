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

async function uploadFiles(files: File[], requestId: string) {
  if (!serverSupabase || !files.length) return [] as string[];
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_REQUEST_FILES_BUCKET || 'request-files';
  const urls: string[] = [];

  for (const file of files) {
    const safeName = file.name.replace(/[^a-zA-Z0-9а-яА-ЯёЁ._-]+/g, '-');
    const path = `${requestId}/${Date.now()}-${safeName}`;
    const arrayBuffer = await file.arrayBuffer();
    const { error } = await serverSupabase.storage.from(bucket).upload(path, Buffer.from(arrayBuffer), {
      upsert: true,
      contentType: file.type || 'application/octet-stream'
    });
    if (!error) {
      const { data } = serverSupabase.storage.from(bucket).getPublicUrl(path);
      if (data.publicUrl) urls.push(data.publicUrl);
    }
  }

  return urls;
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
      raw = await request.json();
    }

    const kind = cleanText(raw.kind) || 'calculation';
    const id = makeRequestId(kind);
    const customer = {
      name: cleanText(raw.name || raw.customerName),
      phone: cleanText(raw.phone || raw.customerPhone),
      email: cleanText(raw.email || raw.customerEmail)
    };

    if (!customer.name || !customer.phone) {
      return NextResponse.json({ ok: false, message: 'Укажите имя и телефон.' }, { status: 400 });
    }

    const fileUrls = await uploadFiles(files, id);
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
      file_urls: fileUrls,
      status: 'Новая'
    };

    let savedToSupabase = false;
    let supabaseWarning = '';

    if (serverSupabase) {
      const { error } = await serverSupabase.from('requests').insert(payload);
      if (error) {
        supabaseWarning = `Supabase не сохранил заявку: ${error.message}`;
      } else {
        savedToSupabase = true;
      }
    } else {
      supabaseWarning = 'Supabase не подключен, заявка не сохранена в базе. Проверьте уведомления в настройках.';
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
        fileUrls.length && `Файлы: ${fileUrls.join(', ')}`,
        supabaseWarning && `Внимание: ${supabaseWarning}`
      ]
    });

    return NextResponse.json({
      ok: true,
      id,
      fileUrls,
      savedToSupabase,
      telegramSent: telegramResult.ok,
      warning: supabaseWarning || (telegramResult.ok ? undefined : telegramResult.reason)
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Не удалось отправить заявку.' }, { status: 500 });
  }
}
