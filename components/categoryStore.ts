'use client';

import { categories as fallbackCategories, clockThemes as fallbackClockThemes } from './shopData';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

export type CatalogCategoryItem = {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  active: boolean;
  order: number;
};

export type ClockThemeItem = {
  id: string;
  name: string;
  active: boolean;
  order: number;
};

export type CatalogSettings = {
  categories: CatalogCategoryItem[];
  clockThemes: ClockThemeItem[];
  updatedAt?: string;
};

const LOCAL_KEY = 'bullmet-catalog-settings';
const SITE_SETTINGS_KEY = 'catalog_settings';

function withTimeout<T>(promise: PromiseLike<T>, ms = 6500, label = 'Операция заняла слишком много времени'): Promise<T> {
  return Promise.race<T>([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => window.setTimeout(() => reject(new Error(label)), ms)),
  ]);
}

export function makeSettingSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[а-яё]/g, (char) => {
      const map: Record<string, string> = {
        а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
      };
      return map[char] ?? char;
    })
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `item-${Date.now()}`;
}

function makeId(prefix: string, name: string, index: number) {
  return `${prefix}-${makeSettingSlug(name)}-${index}`;
}

export const defaultCatalogSettings: CatalogSettings = {
  categories: fallbackCategories.map((name, index) => ({
    id: makeId('category', name, index),
    name,
    slug: makeSettingSlug(name),
    image: '',
    description: '',
    active: true,
    order: index + 1,
  })),
  clockThemes: fallbackClockThemes.map((name, index) => ({
    id: makeId('theme', name, index),
    name,
    active: true,
    order: index + 1,
  })),
};

function normalizeCategory(item: Partial<CatalogCategoryItem>, index: number): CatalogCategoryItem {
  const name = String(item.name || fallbackCategories[index] || 'Новая категория').trim();
  return {
    id: String(item.id || makeId('category', name, index)),
    name,
    slug: String(item.slug || makeSettingSlug(name)),
    image: String(item.image || ''),
    description: String(item.description || ''),
    active: item.active !== false,
    order: Number(item.order || index + 1),
  };
}

function normalizeTheme(item: Partial<ClockThemeItem>, index: number): ClockThemeItem {
  const name = String(item.name || fallbackClockThemes[index] || 'Новая тематика').trim();
  return {
    id: String(item.id || makeId('theme', name, index)),
    name,
    active: item.active !== false,
    order: Number(item.order || index + 1),
  };
}

export function normalizeCatalogSettings(value: unknown): CatalogSettings {
  const raw = value && typeof value === 'object' ? value as Partial<CatalogSettings> : {};
  const sourceCategories = Array.isArray(raw.categories) && raw.categories.length ? raw.categories : defaultCatalogSettings.categories;
  const sourceThemes = Array.isArray(raw.clockThemes) && raw.clockThemes.length ? raw.clockThemes : defaultCatalogSettings.clockThemes;

  return {
    categories: sourceCategories.map(normalizeCategory).sort((a, b) => a.order - b.order),
    clockThemes: sourceThemes.map(normalizeTheme).sort((a, b) => a.order - b.order),
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : undefined,
  };
}

export function readCatalogSettingsLocal(): CatalogSettings {
  if (typeof window === 'undefined') return defaultCatalogSettings;
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    if (!raw) return defaultCatalogSettings;
    return normalizeCatalogSettings(JSON.parse(raw));
  } catch {
    return defaultCatalogSettings;
  }
}

export function writeCatalogSettingsLocal(settings: CatalogSettings) {
  if (typeof window === 'undefined') return;
  const normalized = normalizeCatalogSettings({ ...settings, updatedAt: new Date().toISOString() });
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event('bullmet-catalog-settings-updated'));
}

export async function readCatalogSettingsAsync(): Promise<CatalogSettings> {
  if (isSupabaseConfigured && supabase) {
    try {
      const result = await withTimeout<{ data: { value: unknown } | null; error: { message?: string } | null }>(
        supabase.from('site_settings').select('value').eq('key', SITE_SETTINGS_KEY).maybeSingle() as unknown as PromiseLike<{ data: { value: unknown } | null; error: { message?: string } | null }>,
        6500,
        'Supabase долго не отвечает при загрузке категорий'
      );
      if (result.error) throw result.error;
      if (result.data?.value) return normalizeCatalogSettings(result.data.value);
    } catch (error) {
      console.warn('Catalog settings read failed, local fallback:', error);
    }
  }
  return readCatalogSettingsLocal();
}

export async function saveCatalogSettingsAsync(settings: CatalogSettings): Promise<CatalogSettings> {
  const normalized = normalizeCatalogSettings({ ...settings, updatedAt: new Date().toISOString() });
  writeCatalogSettingsLocal(normalized);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: SITE_SETTINGS_KEY, value: normalized }, { onConflict: 'key' });
      if (error) throw error;
    } catch (error) {
      console.warn('Catalog settings save failed, local copy saved:', error);
    }
  }

  return normalized;
}

export function getActiveCategoryNames(settings: CatalogSettings) {
  return settings.categories
    .filter((item) => item.active)
    .sort((a, b) => a.order - b.order)
    .map((item) => item.name);
}

export function getActiveClockThemeNames(settings: CatalogSettings) {
  return settings.clockThemes
    .filter((item) => item.active)
    .sort((a, b) => a.order - b.order)
    .map((item) => item.name);
}
