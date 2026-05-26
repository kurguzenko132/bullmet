'use client';

import Image from 'next/image';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createReview, loadReviews, summarizeReviews, type ProductReview } from '../lib/reviews';
import { getCurrentSession, type BullmetSession } from '../lib/auth';

export function ProductReviews({ productSlug }: { productSlug: string }) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [session, setSession] = useState<BullmetSession | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const summary = useMemo(() => summarizeReviews(reviews), [reviews]);

  async function refresh() {
    const [nextReviews, nextSession] = await Promise.all([
      loadReviews(productSlug),
      getCurrentSession().catch(() => null),
    ]);
    setReviews(nextReviews);
    setSession(nextSession);
  }

  useEffect(() => {
    refresh().catch(() => undefined);
  }, [productSlug]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  function changeFiles(event: ChangeEvent<HTMLInputElement>) {
    const selected = (Array.from(event.target.files ?? []) as File[])
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, 5);
    setFiles(selected);
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      setStatus('Чтобы оставить отзыв, войдите в аккаунт.');
      return;
    }
    if (!comment.trim()) {
      setStatus('Напишите короткий комментарий к оценке.');
      return;
    }
    setLoading(true);
    setStatus('');
    try {
      await createReview(productSlug, session, rating, comment, files);
      setComment('');
      setRating(5);
      setFiles([]);
      await refresh();
      setStatus(session.source === 'supabase' ? 'Отзыв отправлен на модерацию. После проверки он появится на сайте.' : 'Отзыв сохранен. Спасибо!');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Не удалось сохранить отзыв.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container productReviews" id="reviews">
      <div className="productReviews__head">
        <div>
          <p className="eyebrow">Отзывы покупателей</p>
          <h2>Оценки и отзывы</h2>
        </div>
        <div className="productReviews__summary">
          <strong>{summary ? summary.average.toFixed(1).replace('.', ',') : '—'}</strong>
          <span>{summary ? `${summary.count} ${summary.count === 1 ? 'отзыв' : 'отзывов'}` : 'Отзывов пока нет'}</span>
        </div>
      </div>

      <div className="productReviews__grid">
        <form className="reviewForm" onSubmit={submitReview}>
          <b>Оставить отзыв</b>
          {session ? <p>Вы вошли как {session.email}. Отзыв с фото сначала попадет на модерацию.</p> : <p>Оставлять отзывы и оценки могут только зарегистрированные пользователи.</p>}
          <div className="reviewStars" aria-label="Оценка товара">
            {[1, 2, 3, 4, 5].map((value) => (
              <button type="button" className={value <= rating ? 'active' : ''} onClick={() => setRating(value)} key={value} aria-label={`${value} из 5`}>★</button>
            ))}
          </div>
          <textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Что понравилось? Как выглядит товар вживую?" rows={5} disabled={!session || loading} />
          <label className={`reviewPhotoInput ${!session || loading ? 'disabled' : ''}`}>
            <input type="file" accept="image/*" multiple onChange={changeFiles} disabled={!session || loading} />
            <span>Добавить фото к отзыву</span>
            <small>До 5 изображений</small>
          </label>
          {previews.length > 0 && (
            <div className="reviewPhotoPreview">
              {previews.map((src, index) => <img src={src} alt={`Фото отзыва ${index + 1}`} key={src} />)}
            </div>
          )}
          {session ? <button className="button button--orange" type="submit" disabled={loading}>{loading ? 'Сохраняем...' : 'Отправить отзыв'}</button> : <Link className="button button--outline" href="/login">Войти или зарегистрироваться</Link>}
          {status && <em>{status}</em>}
        </form>

        <div className="reviewsList">
          {reviews.length ? reviews.map((review) => (
            <article className="reviewCard" key={review.id}>
              <div><b>{review.user_name || 'Покупатель'}</b><span>{new Date(review.created_at).toLocaleDateString('ru-RU')}</span></div>
              <strong>{'★'.repeat(review.rating)}<i>{'★'.repeat(5 - review.rating)}</i></strong>
              <p>{review.comment}</p>
              {Boolean(review.photo_urls?.length) && (
                <div className="reviewCard__photos">
                  {review.photo_urls?.map((url, index) => (
                    <a href={url} target="_blank" rel="noreferrer" key={`${url}-${index}`}>
                      <Image src={url} alt={`Фото из отзыва ${index + 1}`} width={160} height={160} />
                    </a>
                  ))}
                </div>
              )}
            </article>
          )) : <div className="reviewsEmpty"><b>Пока нет отзывов</b><p>Первый отзыв сможет оставить зарегистрированный покупатель.</p></div>}
        </div>
      </div>
    </section>
  );
}
