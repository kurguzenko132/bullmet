import { serverSupabase } from './serverSupabase';

export type PublicReview = {
  id: string;
  product_slug: string;
  user_name?: string | null;
  rating: number;
  comment: string;
  photo_urls?: string[] | null;
  admin_reply?: string | null;
  admin_reply_at?: string | null;
  verified_purchase?: boolean;
  show_on_homepage?: boolean;
  created_at?: string | null;
};

const publicFields = 'id, product_slug, user_name, rating, comment, photo_urls, admin_reply, admin_reply_at, verified_purchase, show_on_homepage, created_at';

export async function getPublishedReviews(productSlug?: string): Promise<PublicReview[]> {
  if (!serverSupabase) return [];

  let query = serverSupabase
    .from('product_reviews')
    .select(publicFields)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(productSlug ? 100 : 300);

  if (productSlug) query = query.eq('product_slug', productSlug);
  const { data, error } = await query;
  if (error) {
    console.error('Public reviews load error:', error.message);
    return [];
  }

  return (data || []) as PublicReview[];
}
