import { serverSupabase } from './serverSupabase';

const revisionKey = '__revision';

export type VersionedSettings<T> = T & { __revision?: string };

export function withSiteSettingsRevision<T>(settings: T, revision?: string | null): VersionedSettings<T> {
  return { ...settings, ...(revision ? { [revisionKey]: revision } : {}) } as VersionedSettings<T>;
}

export function getSiteSettingsRevision(value: unknown): string | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const revision = (value as Record<string, unknown>)[revisionKey];
  return typeof revision === 'string' && revision ? revision : undefined;
}

export type SaveSiteSettingsResult =
  | { ok: true; revision: string }
  | { ok: false; conflict: true }
  | { ok: false; conflict: false; message: string };

export async function saveSiteSettings(key: string, value: unknown, revision?: string): Promise<SaveSiteSettingsResult> {
  if (!serverSupabase) return { ok: false, conflict: false, message: 'Supabase не подключен.' };

  const updatedAt = new Date().toISOString();

  if (revision) {
    const { data, error } = await serverSupabase
      .from('site_settings')
      .update({ value, updated_at: updatedAt })
      .eq('key', key)
      .eq('updated_at', revision)
      .select('updated_at')
      .maybeSingle();

    if (error) return { ok: false, conflict: false, message: error.message };
    if (!data?.updated_at) return { ok: false, conflict: true };
    return { ok: true, revision: data.updated_at };
  }

  const { data: current, error: currentError } = await serverSupabase
    .from('site_settings')
    .select('updated_at')
    .eq('key', key)
    .maybeSingle();
  if (currentError) return { ok: false, conflict: false, message: currentError.message };
  if (current) return { ok: false, conflict: true };

  const { data, error } = await serverSupabase
    .from('site_settings')
    .insert({ key, value, updated_at: updatedAt })
    .select('updated_at')
    .single();

  if (error?.code === '23505') return { ok: false, conflict: true };
  if (error) return { ok: false, conflict: false, message: error.message };
  return { ok: true, revision: data.updated_at };
}

export function siteSettingsConflictResponse() {
  const message = 'Настройки уже изменены в другой вкладке или другим сотрудником. Обновите страницу и повторите изменения.';
  return { ok: false, message, error: message };
}
