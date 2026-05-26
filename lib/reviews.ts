'use client';

import { isSupabaseConfigured, supabase } from './supabaseClient';
import { createReviewNotification } from './adminNotifications';
import { PRODUCT_IMAGES_BUCKET } from './productImages';
import type { BullmetSession } from './auth';

export type ProductReviewStatus = 'pending' | 'published' | 'hidden';

export type ProductReview = {
  id: string;
  product_slug: string;
  user_id?: string | null;
  user_email?: string | null;
  user_name?: string | null;
  rating: number;
  comment: string;
  photo_urls?: string[] | null;
  status?: ProductReviewStatus | null;
  created_at: string;
  updated_at?: string | null;
};

export type ProductReviewSummary = {
  productSlug: string;
  average: number;
  count: number;
};

const REVIEWS_KEY = 'bullmet-product-reviews';

function readLocalReviews(): ProductReview[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(REVIEWS_KEY);
    return raw ? JSON.parse(raw) as ProductReview[] : [];
  } catch {
    return [];
  }
}

function writeLocalReviews(reviews: ProductReview[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
}

function safeReviewFileName(name: string) {
  const ext = name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const base = name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 38) || 'review';
  return `${base}.${ext}`;
}

async function uploadReviewPhotos(productSlug: string, files: File[]) {
  const cleanFiles = files
    .filter((file) => file.size > 0 && file.type.startsWith('image/'))
    .slice(0, 5);

  if (!cleanFiles.length) return [];

  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Фото отзывов можно загружать только после подключения Supabase Storage.');
  }

  const uploadedUrls: string[] = [];

  for (const file of cleanFiles) {
    const filePath = `reviews/${productSlug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeReviewFileName(file.name)}`;

    const { error } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/jpeg',
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .getPublicUrl(filePath);

    if (data.publicUrl) uploadedUrls.push(data.publicUrl);
  }

  return uploadedUrls;
}

function normalizeReview(row: Partial<ProductReview>): ProductReview {
  return {
    id: row.id || `local-${Date.now()}`,
    product_slug: row.product_slug || '',
    user_id: row.user_id ?? null,
    user_email: row.user_email ?? null,
    user_name: row.user_name ?? null,
    rating: Number(row.rating || 5),
    comment: row.comment || '',
    photo_urls: Array.isArray(row.photo_urls) ? row.photo_urls : [],
    status: (row.status as ProductReviewStatus) || 'published',
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at ?? null,
  };
}

export function summarizeReviews(reviews: ProductReview[]): ProductReviewSummary | null {
  const visibleReviews = reviews.filter((review) => (review.status || 'published') === 'published');
  if (!visibleReviews.length) return null;
  const count = visibleReviews.length;
  const average = visibleReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / count;
  return { productSlug: visibleReviews[0].product_slug, average, count };
}

export async function loadReviews(productSlug: string): Promise<ProductReview[]> {
  if (supabase && isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('id,product_slug,user_id,user_email,user_name,rating,comment,photo_urls,status,created_at,updated_at')
      .eq('product_slug', productSlug)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (!error && data) return data.map((row) => normalizeReview(row as ProductReview));
  }

  return readLocalReviews()
    .map(normalizeReview)
    .filter((review) => review.product_slug === productSlug && (review.status || 'published') === 'published')
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function loadReviewSummaries(productSlugs: string[]): Promise<Record<string, ProductReviewSummary>> {
  const uniqueSlugs = Array.from(new Set(productSlugs.filter(Boolean)));
  if (!uniqueSlugs.length) return {};

  let reviews: ProductReview[] = [];
  if (supabase && isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('product_slug,rating,status')
      .in('product_slug', uniqueSlugs)
      .eq('status', 'published');

    if (!error && data) reviews = data.map((row) => normalizeReview(row as ProductReview));
  }

  if (!reviews.length) {
    reviews = readLocalReviews()
      .map(normalizeReview)
      .filter((review) => uniqueSlugs.includes(review.product_slug) && (review.status || 'published') === 'published');
  }

  return uniqueSlugs.reduce<Record<string, ProductReviewSummary>>((acc, slug) => {
    const list = reviews.filter((review) => review.product_slug === slug);
    const summary = summarizeReviews(list);
    if (summary) acc[slug] = summary;
    return acc;
  }, {});
}

export async function createReview(productSlug: string, session: BullmetSession, rating: number, comment: string, files: File[] = []) {
  const safeRating = Math.max(1, Math.min(5, Math.round(rating)));
  const photoUrls = await uploadReviewPhotos(productSlug, files);
  const payload = {
    product_slug: productSlug,
    user_id: session.source === 'supabase' ? session.id : null,
    user_email: session.email,
    user_name: session.fullName || session.email.split('@')[0] || 'Покупатель',
    rating: safeRating,
    comment: comment.trim(),
    photo_urls: photoUrls,
    status: 'pending' as ProductReviewStatus,
  };

  if (supabase && isSupabaseConfigured && session.source === 'supabase') {
    const { error } = await supabase
      .from('product_reviews')
      .upsert(payload, { onConflict: 'product_slug,user_id' });
    if (!error) {
      await createReviewNotification(payload);
      return;
    }
    throw new Error(error.message || 'Не удалось сохранить отзыв.');
  }

  // Локальный fallback нужен для разработки без Supabase.
  const localReview: ProductReview = {
    id: `local-${Date.now()}`,
    ...payload,
    status: 'published',
    created_at: new Date().toISOString(),
  };
  const next = [localReview, ...readLocalReviews().filter((review) => !(review.product_slug === productSlug && review.user_email === session.email))];
  writeLocalReviews(next);
  await createReviewNotification(localReview);
}

export async function loadAllReviews(): Promise<ProductReview[]> {
  if (supabase && isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('id,product_slug,user_id,user_email,user_name,rating,comment,photo_urls,status,created_at,updated_at')
      .order('created_at', { ascending: false });

    if (!error && data) return data.map((row) => normalizeReview(row as ProductReview));
    if (error) throw new Error(error.message || 'Не удалось загрузить отзывы.');
  }

  return readLocalReviews().map(normalizeReview).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function updateReviewStatus(id: string, status: ProductReviewStatus): Promise<ProductReview[]> {
  if (supabase && isSupabaseConfigured && !id.startsWith('local-')) {
    const { error } = await supabase
      .from('product_reviews')
      .update({ status })
      .eq('id', id);

    if (error) throw new Error(error.message || 'Не удалось обновить статус отзыва.');
    return loadAllReviews();
  }

  const next = readLocalReviews().map((review) => review.id === id ? { ...review, status } : review);
  writeLocalReviews(next);
  return next.map(normalizeReview).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function deleteReview(id: string): Promise<ProductReview[]> {
  if (supabase && isSupabaseConfigured && !id.startsWith('local-')) {
    const { error } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message || 'Не удалось удалить отзыв.');
    return loadAllReviews();
  }

  const next = readLocalReviews().filter((review) => review.id !== id);
  writeLocalReviews(next);
  return next.map(normalizeReview).sort((a, b) => b.created_at.localeCompare(a.created_at));
}
