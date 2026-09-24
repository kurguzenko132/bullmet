import { AdminReviewsClient } from '@/components/AdminReviewsClient';
import { getAdminReviews } from '@/lib/adminContent';
import { getReviewControlSettings } from '@/lib/reviewControl';
import { isSupabaseConfigured } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Отзывы | Админка Bullmet' };

export default async function AdminReviews() {
  const [reviews, settings] = await Promise.all([getAdminReviews(), getReviewControlSettings()]);
  return <AdminReviewsClient initialReviews={reviews} initialSettings={settings} supabaseConfigured={isSupabaseConfigured()} />;
}
