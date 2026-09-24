import { serverSupabase } from './serverSupabase';
import { withSiteSettingsRevision } from './siteSettingsConcurrency';

export type ReviewControlSettings = {
  autoPublish: boolean;
  allowPhotos: boolean;
  allowGuest: boolean;
  productRating: boolean;
  productCount: boolean;
  homepage: boolean;
};

export const reviewControlKey = 'review_control';

export const defaultReviewControl: ReviewControlSettings = {
  autoPublish: true,
  allowPhotos: true,
  allowGuest: false,
  productRating: true,
  productCount: true,
  homepage: true
};

function asObject(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function mergeReviewControl(value: unknown): ReviewControlSettings {
  const incoming = asObject(value);
  return Object.fromEntries(
    Object.entries(defaultReviewControl).map(([key, fallback]) => [key, typeof incoming[key] === 'boolean' ? incoming[key] : fallback])
  ) as ReviewControlSettings;
}

export async function getReviewControlSettings(): Promise<ReviewControlSettings> {
  if (!serverSupabase) return defaultReviewControl;

  const { data, error } = await serverSupabase
    .from('site_settings')
    .select('value, updated_at')
    .eq('key', reviewControlKey)
    .maybeSingle();

  return error || !data?.value ? defaultReviewControl : withSiteSettingsRevision(mergeReviewControl(data.value), data.updated_at);
}
