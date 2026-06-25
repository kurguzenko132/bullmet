'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Image as ImageIcon, Star, Trash2 } from 'lucide-react';
import type { AdminReview } from '@/lib/adminContent';
import { formatDate } from '@/lib/adminCommerce';

type Filter = 'all' | 'published' | 'hidden' | 'pending';

function statusLabel(status?: string) {
  if (status === 'hidden') return 'Скрыт';
  if (status === 'pending') return 'На проверке';
  return 'Опубликован';
}

function statusClass(status?: string) {
  if (status === 'hidden') return 'is-hidden';
  if (status === 'pending') return 'is-pending';
  return 'is-published';
}

function Stars({ value }: { value: number }) {
  return <span className="admin-review-stars">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={15} fill={index < value ? 'currentColor' : 'none'} />)}</span>;
}

export function AdminReviewsClient({ initialReviews, supabaseConfigured }: { initialReviews: AdminReview[]; supabaseConfigured: boolean }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState(initialReviews[0]?.id || '');
  const [message, setMessage] = useState('');
  const [lightbox, setLightbox] = useState('');

  const filtered = useMemo(() => {
    const clean = query.trim().toLowerCase();
    return reviews.filter((review) => {
      const byStatus = filter === 'all' || review.status === filter;
      const haystack = [review.product_slug, review.user_name, review.user_email, review.comment, review.status].filter(Boolean).join(' ').toLowerCase();
      return byStatus && (!clean || haystack.includes(clean));
    });
  }, [reviews, filter, query]);

  const active = reviews.find((review) => review.id === activeId) || filtered[0] || reviews[0];
  const published = reviews.filter((review) => review.status === 'published').length;
  const hidden = reviews.filter((review) => review.status === 'hidden').length;
  const pending = reviews.filter((review) => review.status === 'pending').length;
  const photos = reviews.reduce((sum, review) => sum + (review.photo_urls?.length || 0), 0);
  const avg = reviews.length ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length : 0;

  async function refreshReviews() {
    setMessage('');
    try {
      const response = await fetch('/api/admin/reviews', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось обновить отзывы.');
      const next = Array.isArray(data.reviews) ? data.reviews as AdminReview[] : [];
      setReviews(next);
      setActiveId((current) => next.some((review) => review.id === current) ? current : next[0]?.id || '');
      setMessage('Отзывы обновлены.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось обновить отзывы.');
    }
  }

  async function updateReview(id: string, patch: Partial<Pick<AdminReview, 'status' | 'comment'>>) {
    setMessage('');
    const previous = reviews;
    setReviews((current) => current.map((review) => review.id === id ? { ...review, ...patch } : review));

    try {
      const response = await fetch(`/api/admin/reviews/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось обновить отзыв.');
      setMessage('Отзыв обновлён.');
    } catch (error) {
      setReviews(previous);
      setMessage(error instanceof Error ? error.message : 'Не удалось обновить отзыв.');
    }
  }

  async function deleteReview(id: string) {
    if (!confirm('Удалить отзыв полностью?')) return;
    setMessage('');

    try {
      const response = await fetch(`/api/admin/reviews/${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось удалить отзыв.');
      setReviews((current) => current.filter((review) => review.id !== id));
      setActiveId((current) => current === id ? '' : current);
      setMessage('Отзыв удалён.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось удалить отзыв.');
    }
  }

  return (
    <div className="admin-reviews-page">
      <div className="admin-page-head">
        <div>
          <p>Отзывы</p>
          <h1>Отзывы покупателей</h1>
          <span>Отзывы публикуются сразу, но здесь их можно скрыть, вернуть, удалить и открыть фото.</span>
        </div>
        <div className="admin-head-actions">
          <button type="button" onClick={refreshReviews}>Обновить</button>
          <Link href="/catalog" target="_blank">Открыть каталог ↗</Link>
        </div>
      </div>

      <section className="admin-reviews-stats">
        <article><b>{reviews.length}</b><span>всего отзывов</span></article>
        <article><b>{published}</b><span>опубликовано</span></article>
        <article><b>{hidden}</b><span>скрыто</span></article>
        <article><b>{pending}</b><span>на проверке</span></article>
        <article><b>{photos}</b><span>фото</span></article>
        <article><b>{avg.toFixed(1)}</b><span>средняя оценка</span></article>
      </section>

      <div className="admin-commerce-toolbar">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по товару, имени, email или тексту отзыва" />
        <div>
          {(['all', 'published', 'hidden', 'pending'] as Filter[]).map((item) => (
            <button key={item} type="button" className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>
              {item === 'all' ? 'Все' : statusLabel(item)}
            </button>
          ))}
        </div>
      </div>

      {message && <div className="admin-message">{message}</div>}

      {!supabaseConfigured && <div className="admin-message">Supabase не подключен: отзывы не загрузятся из базы.</div>}

      {!filtered.length ? (
        <section className="admin-empty-commerce">
          <h2>Отзывы не найдены</h2>
          <p>Измените фильтр или оставьте тестовый отзыв на карточке товара.</p>
        </section>
      ) : (
        <section className="admin-reviews-layout">
          <div className="admin-reviews-list">
            {filtered.map((review) => (
              <button key={review.id} type="button" className={active?.id === review.id ? 'is-active' : ''} onClick={() => setActiveId(review.id)}>
                <div>
                  <b>{review.user_name || review.user_email || 'Покупатель'}</b>
                  <em className={statusClass(review.status)}>{statusLabel(review.status)}</em>
                </div>
                <Stars value={Number(review.rating || 0)} />
                <span>{review.comment || 'Без текста'}</span>
                <small>{review.product_slug} · {formatDate(review.created_at)}</small>
              </button>
            ))}
          </div>

          {active && (
            <article className="admin-review-detail">
              <div className="admin-commerce-detail-head">
                <div>
                  <p>Отзыв</p>
                  <h2>{active.user_name || active.user_email || 'Покупатель'}</h2>
                  <span>{formatDate(active.created_at)} · {active.product_slug}</span>
                </div>
                <select value={active.status || 'published'} onChange={(event) => updateReview(active.id, { status: event.target.value })}>
                  <option value="published">Опубликован</option>
                  <option value="hidden">Скрыт</option>
                  <option value="pending">На проверке</option>
                </select>
              </div>

              <div className="admin-review-score">
                <Stars value={Number(active.rating || 0)} />
                <b>{active.rating}/5</b>
                <Link href={`/product/${active.product_slug}`} target="_blank">Открыть товар ↗</Link>
              </div>

              <label className="admin-note-field">
                Текст отзыва
                <textarea defaultValue={active.comment || ''} rows={5} onBlur={(event) => updateReview(active.id, { comment: event.target.value })} />
              </label>

              {!!active.photo_urls?.length && (
                <div className="admin-review-photos">
                  <h3>Фото отзыва</h3>
                  <div>
                    {active.photo_urls.map((url) => (
                      <button key={url} type="button" onClick={() => setLightbox(url)}>
                        <img src={url} alt="" />
                        <ImageIcon size={18} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="admin-review-actions">
                <button type="button" onClick={() => updateReview(active.id, { status: active.status === 'hidden' ? 'published' : 'hidden' })}>
                  {active.status === 'hidden' ? <Eye size={17} /> : <EyeOff size={17} />}
                  {active.status === 'hidden' ? 'Опубликовать' : 'Скрыть'}
                </button>
                <button type="button" onClick={() => deleteReview(active.id)}><Trash2 size={17} />Удалить</button>
              </div>
            </article>
          )}
        </section>
      )}

      {lightbox && (
        <div className="admin-review-lightbox" onClick={() => setLightbox('')}>
          <button type="button" aria-label="Закрыть">×</button>
          <img src={lightbox} alt="" />
        </div>
      )}
    </div>
  );
}
