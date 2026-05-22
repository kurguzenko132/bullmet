'use client';

import { getReadableError } from '../lib/errorMessages';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { uploadProductImages } from '../lib/productImages';

export type HomeCategorySetting = {
  key: string;
  title: string;
  href: string;
  image: string;
};

export type HomeSettings = {
  heroImage: string;
  categories: HomeCategorySetting[];
};

export const HOME_SETTINGS_KEY = 'home';
export const LOCAL_HOME_SETTINGS_KEY = 'bullmet-home-settings';

export const defaultHomeSettings: HomeSettings = {
  heroImage: '/assets/hero-machine.jpg',
  categories: [
    { key: 'clock', title: 'Часы собственного производства', image: '/assets/cat-clock.jpg', href: '/catalog' },
    { key: 'swing', title: 'Садовые качели', image: '/assets/cat-swing.jpg', href: '/catalog' },
    { key: 'metal', title: 'Резка металла', image: '/assets/cat-metal.jpg', href: '/request?type=metal-cutting' },
    { key: 'wood', title: 'Резка дерева', image: '/assets/cat-wood.jpg', href: '/request?type=wood-cutting' },
    { key: 'custom', title: 'Изделия на заказ', image: '/assets/cat-custom.jpg', href: '/request?type=custom' },
  ],
};

function normalizeSettings(value: Partial<HomeSettings> | null | undefined): HomeSettings {
  const incomingCategories = Array.isArray(value?.categories) ? value?.categories ?? [] : [];
  const categories = defaultHomeSettings.categories.map((fallback) => {
    const found = incomingCategories.find((item) => item.key === fallback.key);
    return {
      ...fallback,
      title: found?.title?.trim() || fallback.title,
      href: found?.href?.trim() || fallback.href,
      image: found?.image?.trim() || fallback.image,
    };
  });

  return {
    heroImage: value?.heroImage?.trim() || defaultHomeSettings.heroImage,
    categories,
  };
}

export function readLocalHomeSettings(): HomeSettings {
  if (typeof window === 'undefined') return defaultHomeSettings;

  try {
    const raw = window.localStorage.getItem(LOCAL_HOME_SETTINGS_KEY);
    if (!raw) return defaultHomeSettings;
    return normalizeSettings(JSON.parse(raw));
  } catch {
    return defaultHomeSettings;
  }
}

export function writeLocalHomeSettings(settings: HomeSettings) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_HOME_SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event('bullmet-home-settings-updated'));
}

export async function readHomeSettingsAsync(): Promise<HomeSettings> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', HOME_SETTINGS_KEY)
        .maybeSingle();

      if (error) throw new Error(getReadableError(error, 'Не удалось прочитать настройки главной страницы из Supabase'));
      if (data?.value) {
        const settings = normalizeSettings(data.value as Partial<HomeSettings>);
        writeLocalHomeSettings(settings);
        return settings;
      }
    } catch (error) {
      console.warn('Supabase site_settings fallback to localStorage:', error);
    }
  }

  return readLocalHomeSettings();
}

export async function saveHomeSettingsAsync(settings: HomeSettings): Promise<HomeSettings> {
  const cleanSettings = normalizeSettings(settings);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: HOME_SETTINGS_KEY, value: cleanSettings }, { onConflict: 'key' });
      if (error) {
        throw new Error(getReadableError(error, 'Не удалось сохранить настройки главной страницы в Supabase'));
      }
    } catch (error) {
      throw new Error(getReadableError(error, 'Не удалось сохранить настройки главной страницы'));
    }
  }

  writeLocalHomeSettings(cleanSettings);
  return cleanSettings;
}

export async function uploadHomeImage(file: File, folder: string) {
  const [url] = await uploadProductImages(`site/${folder}`, [file]);
  return url;
}
