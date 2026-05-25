'use client';

import { isSupabaseConfigured, supabase } from './supabaseClient';
import type { BullmetSession } from './auth';

export type ProductReview = {
  id: string;
  product_slug: string;
  user_id?: string | null;
  user_email?: string | null;
  user_name?: string | null;
  rating: number;
  comment: string;
  created_at: string;
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

export function summarizeReviews(reviews: ProductReview[]): ProductReviewSummary | null {
  if (!reviews.length) return null;
  const count = reviews.length;
  const average = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / count;
  return { productSlug: reviews[0].product_slug, average, count };
}

export async function loadReviews(productSlug: string): Promise<ProductReview[]> {
  if (supabase && isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('id,product_slug,user_id,user_email,user_name,rating,comment,created_at')
      .eq('product_slug', productSlug)
      .order('created_at', { ascending: false });

    if (!error && data) return data as ProductReview[];
  }

  return readLocalReviews()
    .filter((review) => review.product_slug === productSlug)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function loadReviewSummaries(productSlugs: string[]): Promise<Record<string, ProductReviewSummary>> {
  const uniqueSlugs = Array.from(new Set(productSlugs.filter(Boolean)));
  if (!uniqueSlugs.length) return {};

  let reviews: ProductReview[] = [];
  if (supabase && isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('product_slug,rating')
      .in('product_slug', uniqueSlugs);

    if (!error && data) reviews = data as ProductReview[];
  }

  if (!reviews.length) {
    reviews = readLocalReviews().filter((review) => uniqueSlugs.includes(review.product_slug));
  }

  return uniqueSlugs.reduce<Record<string, ProductReviewSummary>>((acc, slug) => {
    const list = reviews.filter((review) => review.product_slug === slug);
    const summary = summarizeReviews(list);
    if (summary) acc[slug] = summary;
    return acc;
  }, {});
}

export async function createReview(productSlug: string, session: BullmetSession, rating: number, comment: string) {
  const safeRating = Math.max(1, Math.min(5, Math.round(rating)));
  const payload = {
    product_slug: productSlug,
    user_id: session.source === 'supabase' ? session.id : null,
    user_email: session.email,
    user_name: session.fullName || session.email.split('@')[0] || 'Покупатель',
    rating: safeRating,
    comment: comment.trim(),
  };

  if (supabase && isSupabaseConfigured && session.source === 'supabase') {
    const { error } = await supabase
      .from('product_reviews')
      .upsert(payload, { onConflict: 'product_slug,user_id' });
    if (!error) return;
    throw new Error(error.message || 'Не удалось сохранить отзыв.');
  }

  // Локальный fallback нужен для разработки без Supabase.
  const localReview: ProductReview = {
    id: `local-${Date.now()}`,
    ...payload,
    created_at: new Date().toISOString(),
  };
  const next = [localReview, ...readLocalReviews().filter((review) => !(review.product_slug === productSlug && review.user_email === session.email))];
  writeLocalReviews(next);
}
