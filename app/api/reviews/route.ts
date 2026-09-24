import { NextRequest, NextResponse } from 'next/server';
import { getPublishedReviews } from '@/lib/publicReviews';
import { getReviewControlSettings } from '@/lib/reviewControl';
import { getAuthenticatedUser } from '@/lib/serverAuth';
import { serverSupabase } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';

const text = (value: unknown, max: number) => String(value || '').trim().slice(0, max);
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function GET(request: NextRequest) {
  const slug = text(new URL(request.url).searchParams.get('product'), 160);
  if (!slug) return NextResponse.json({ ok: false, message: 'Не указан товар.' }, { status: 400 });
  return NextResponse.json({ ok: true, reviews: await getPublishedReviews(slug) });
}

export async function POST(request: NextRequest) {
  if (!serverSupabase) return NextResponse.json({ ok: false, message: 'Отзывы временно недоступны.' }, { status: 503 });

  const body = await request.json().catch(() => null);
  const settings = await getReviewControlSettings();
  const user = await getAuthenticatedUser(request);
  const productSlug = text(body?.productSlug, 160);
  const comment = text(body?.comment, 1_000);
  const rating = Number(body?.rating);

  if (!productSlug || !Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length < 10) {
    return NextResponse.json({ ok: false, message: 'Проверьте товар, оценку и текст отзыва.' }, { status: 400 });
  }

  const guestName = text(body?.guestName, 80);
  const guestEmail = text(body?.guestEmail, 254).toLowerCase();
  if (!user && !settings.allowGuest) return NextResponse.json({ ok: false, message: 'Чтобы оставить отзыв, войдите в аккаунт.' }, { status: 401 });
  if (!user && (guestName.length < 2 || !isEmail(guestEmail))) {
    return NextResponse.json({ ok: false, message: 'Укажите имя и корректный email.' }, { status: 400 });
  }

  const photoUrls = settings.allowPhotos && Array.isArray(body?.photoUrls)
    ? body.photoUrls.map((item: unknown) => text(item, 2_000)).filter((item: string) => /^https?:\/\//.test(item)).slice(0, 5)
    : [];
  const insert = {
    product_slug: productSlug,
    user_id: user?.id || null,
    user_email: user?.email || guestEmail || null,
    user_name: user?.email?.split('@')[0] || guestName || 'Покупатель',
    rating,
    comment,
    photo_urls: photoUrls,
    status: settings.autoPublish ? 'published' : 'pending',
    source: 'website'
  };

  const { data, error } = await serverSupabase.from('product_reviews').insert(insert)
    .select('id, product_slug, user_name, rating, comment, photo_urls, admin_reply, admin_reply_at, verified_purchase, created_at, status')
    .single();
  if (error) return NextResponse.json({ ok: false, message: 'Не удалось сохранить отзыв.' }, { status: 500 });

  return NextResponse.json({ ok: true, review: data, published: data.status === 'published' });
}
