'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { readAdminProductsAsync, type AdminProduct } from './adminProductStore';
import { deleteReview, loadAllReviews, updateReviewStatus, type ProductReview, type ProductReviewStatus } from '../lib/reviews';

const statusLabels: Record<ProductReviewStatus, string> = {
  pending: 'На модерации',
  published: 'Опубликован',
  hidden: 'Скрыт',
};

const statuses: Array<'all' | ProductReviewStatus> = ['all', 'pending', 'published', 'hidden'];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | ProductReviewStatus>('all');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadAllReviews(), readAdminProductsAsync()])
      .then(([nextReviews, nextProducts]) => {
        setReviews(nextReviews);
        setProducts(nextProducts);
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : 'Не удалось загрузить отзывы.'))
      .finally(() => setLoading(false));
  }, []);

  const productBySlug = useMemo(() => {
    return products.reduce<Record<string, AdminProduct>>((acc, product) => {
      acc[product.slug] = product;
      return acc;
    }, {});
  }, [products]);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return reviews.filter((review) => {
      const product = productBySlug[review.product_slug];
      const haystack = `${review.product_slug} ${product?.title || ''} ${review.user_name || ''} ${review.user_email || ''} ${review.comment}`.toLowerCase();
      const matchesSearch = !search || haystack.includes(search);
      const matchesStatus = status === 'all' || (review.status || 'published') === status;
      return matchesSearch && matchesStatus;
    });
  }, [reviews, productBySlug, query, status]);

  const pendingCount = reviews.filter((review) => review.status === 'pending').length;
  const publishedCount = reviews.filter((review) => (review.status || 'published') === 'published').length;
  const withPhotosCount = reviews.filter((review) => review.photo_urls?.length).length;

  async function changeStatus(id: string, nextStatus: ProductReviewStatus) {
    setMessage('');
    try {
      setReviews(await updateReviewStatus(id, nextStatus));
      setMessage(nextStatus === 'published' ? 'Отзыв опубликован.' : nextStatus === 'hidden' ? 'Отзыв скрыт.' : 'Отзыв отправлен на модерацию.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось изменить статус.');
    }
  }

  async function removeReview(id: string) {
    if (!window.confirm('Удалить этот отзыв?')) return;
    setMessage('');
    try {
      setReviews(await deleteReview(id));
      setMessage('Отзыв удален.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось удалить отзыв.');
    }
  }

  return (
    <AdminLayout title="Отзывы">
      <main className="adminContent">
        <div className="adminPageHead">
          <div>
            <p>Модерация отзывов и фото покупателей</p>
            <h2>Отзывы покупателей</h2>
          </div>
          <Link className="adminSecondaryBtn" href="/catalog">Открыть каталог</Link>
        </div>

        <div className="adminMiniStats">
          <div className="adminPanel"><span>Всего отзывов</span><b>{reviews.length}</b></div>
          <div className="adminPanel"><span>На модерации</span><b>{pendingCount}</b></div>
          <div className="adminPanel"><span>Опубликовано</span><b>{publishedCount}</b></div>
          <div className="adminPanel"><span>С фото</span><b>{withPhotosCount}</b></div>
        </div>

        <div className="adminPanel adminOrdersToolbar">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по товару, клиенту, тексту отзыва" />
          <select value={status} onChange={(event) => setStatus(event.target.value as 'all' | ProductReviewStatus)}>
            {statuses.map((item) => <option key={item} value={item}>{item === 'all' ? 'Все статусы' : statusLabels[item]}</option>)}
          </select>
          <span>{filtered.length} отзывов</span>
        </div>

        {message && <div className="adminNotice">{message}</div>}

        <div className="adminReviewsList">
          {loading ? <div className="adminPanel adminEmpty">Загружаем отзывы...</div> : null}
          {!loading && filtered.length === 0 ? <div className="adminPanel adminEmpty">Отзывы не найдены.</div> : null}
          {filtered.map((review) => {
            const product = productBySlug[review.product_slug];
            const reviewStatus = (review.status || 'published') as ProductReviewStatus;
            return (
              <article className="adminPanel adminReviewCard" key={review.id}>
                <div className="adminReviewCard__main">
                  <div className="adminReviewCard__top">
                    <div>
                      <span className={`adminReviewStatus adminReviewStatus--${reviewStatus}`}>{statusLabels[reviewStatus]}</span>
                      <h3>{product?.title || review.product_slug}</h3>
                      <p>{review.user_name || 'Покупатель'} · {review.user_email || 'email не указан'} · {formatDate(review.created_at)}</p>
                    </div>
                    <strong>{'★'.repeat(review.rating)}<i>{'★'.repeat(5 - review.rating)}</i></strong>
                  </div>
                  <p className="adminReviewText">{review.comment}</p>
                  {Boolean(review.photo_urls?.length) && (
                    <div className="adminReviewPhotos">
                      {review.photo_urls?.map((url, index) => (
                        <a href={url} target="_blank" rel="noreferrer" key={`${url}-${index}`}>
                          <Image src={url} alt={`Фото отзыва ${index + 1}`} width={150} height={150} />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <div className="adminReviewActions">
                  {product && <Link className="adminSecondaryBtn" href={`/catalog/${product.slug}`}>Товар</Link>}
                  <button className="adminPrimaryBtn" type="button" onClick={() => changeStatus(review.id, 'published')}>Опубликовать</button>
                  <button className="adminSecondaryBtn" type="button" onClick={() => changeStatus(review.id, 'hidden')}>Скрыть</button>
                  <button className="adminDangerBtn" type="button" onClick={() => removeReview(review.id)}>Удалить</button>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </AdminLayout>
  );
}
