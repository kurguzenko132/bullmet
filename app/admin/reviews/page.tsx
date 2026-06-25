import { AdminReviewsClient } from '@/components/AdminReviewsClient';
import { getAdminReviews } from '@/lib/adminContent';
import { isSupabaseConfigured } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Отзывы | Админка Bullmet' };

export default async function AdminReviews() {
  const reviews = await getAdminReviews();
  return <AdminReviewsClient initialReviews={reviews} supabaseConfigured={isSupabaseConfigured()} />;
}
