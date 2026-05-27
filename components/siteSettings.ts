'use client';

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

export type SiteFaqItem = {
  question: string;
  answer: string;
};

export type SiteContentSettings = {
  brandSubtitle: string;
  footerText: string;
  homeHeroTitle: string;
  homeHeroText: string;
  homePrimaryButton: string;
  homeSecondaryButton: string;
  contacts: {
    phone: string;
    phoneHref: string;
    email: string;
    address: string;
    worktime: string;
    telegramUrl: string;
    whatsappUrl: string;
    instagramUrl: string;
  };
  pages: {
    productionTitle: string;
    productionDescription: string;
    servicesTitle: string;
    servicesDescription: string;
    aboutTitle: string;
    aboutDescription: string;
    contactsTitle: string;
    contactsDescription: string;
  };
  faq: SiteFaqItem[];
};

export const HOME_SETTINGS_KEY = 'home';
export const CONTENT_SETTINGS_KEY = 'content';
export const LOCAL_HOME_SETTINGS_KEY = 'bullmet-home-settings';
export const LOCAL_CONTENT_SETTINGS_KEY = 'bullmet-content-settings';

export const defaultHomeSettings: HomeSettings = {
  heroImage: '/assets/hero-machine.jpg',
  categories: [
    { key: 'clock', title: 'Часы собственного производства', image: '/assets/cat-clock.jpg', href: '/catalog?category=Часы собственного производства' },
    { key: 'swing', title: 'Садовые качели', image: '/assets/cat-swing.jpg', href: '/catalog?category=Садовые качели' },
    { key: 'metal', title: 'Резка металла', image: '/assets/cat-metal.jpg', href: '/request?type=metal-cutting' },
    { key: 'wood', title: 'Резка дерева', image: '/assets/cat-wood.jpg', href: '/request?type=wood-cutting' },
    { key: 'custom', title: 'Изделия на заказ', image: '/assets/cat-custom.jpg', href: '/request?type=custom' },
  ],
};

export const defaultSiteContent: SiteContentSettings = {
  brandSubtitle: 'производство металла и дерева',
  footerText: 'Собственное производство изделий из металла и дерева с 2017 года.',
  homeHeroTitle: 'Bullmet — собственное производство изделий из металла и дерева',
  homeHeroText: 'Производим часы, садовые качели, элементы декора, а также выполняем резку металла и дерева под заказ.',
  homePrimaryButton: 'Перейти в каталог',
  homeSecondaryButton: 'Заказать расчет',
  contacts: {
    phone: '+375 29 123-45-67',
    phoneHref: 'tel:+375291234567',
    email: 'info@bullmet.by',
    address: 'г. Минск, ул. Промышленная, 11',
    worktime: 'Пн–Пт: 9:00 — 18:00',
    telegramUrl: '/contacts',
    whatsappUrl: '/contacts',
    instagramUrl: '/contacts',
  },
  pages: {
    productionTitle: 'Собственное производство Bullmet',
    productionDescription: 'Работаем с металлом и деревом, выполняем резку, сборку, покраску и изготовление изделий по индивидуальным размерам.',
    servicesTitle: 'Услуги Bullmet',
    servicesDescription: 'Лазерная резка металла и дерева, изделия на заказ, интерьерный декор, часы и производственные задачи по вашим размерам.',
    aboutTitle: 'О компании Bullmet',
    aboutDescription: 'Bullmet — собственное производство изделий из металла и дерева. Мы делаем практичные и декоративные изделия под готовые задачи и индивидуальные идеи.',
    contactsTitle: 'Свяжитесь с производством',
    contactsDescription: 'Поможем выбрать готовое изделие, рассчитать резку металла или дерева, обсудить часы, качели, декор и индивидуальный заказ по вашей идее.',
  },
  faq: [
    { question: 'Можно ли сделать изделие по фото или эскизу?', answer: 'Да. Отправьте фото, размеры и пожелания — мы оценим возможность изготовления и подготовим расчет.' },
    { question: 'Какие материалы доступны?', answer: 'Работаем с металлом и деревом. Материал подбираем под задачу, внешний вид, прочность и бюджет.' },
    { question: 'Как быстро рассчитывается заказ?', answer: 'Обычно базовый расчет можно подготовить после уточнения размеров, материала, количества и сложности изделия.' },
  ],
};

function normalizeHomeCategoryHref(key: string, href: string): string {
  const value = href.trim();
  if ((key === 'clock' || key === 'swing') && (!value || value === '/catalog')) {
    return key === 'clock' ? '/catalog?category=Часы собственного производства' : '/catalog?category=Садовые качели';
  }
  return value;
}

function cleanText(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function normalizeSettings(value: Partial<HomeSettings> | null | undefined): HomeSettings {
  const incomingCategories = Array.isArray(value?.categories) ? value?.categories ?? [] : [];
  const categories = defaultHomeSettings.categories.map((fallback) => {
    const found = incomingCategories.find((item) => item.key === fallback.key);
    return {
      ...fallback,
      title: found?.title?.trim() || fallback.title,
      href: normalizeHomeCategoryHref(fallback.key, found?.href?.trim() || fallback.href),
      image: found?.image?.trim() || fallback.image,
    };
  });

  return {
    heroImage: value?.heroImage?.trim() || defaultHomeSettings.heroImage,
    categories,
  };
}

export function normalizeSiteContent(value: Partial<SiteContentSettings> | null | undefined): SiteContentSettings {
  const contacts = (value?.contacts ?? {}) as Partial<SiteContentSettings['contacts']>;
  const pages = (value?.pages ?? {}) as Partial<SiteContentSettings['pages']>;
  const faq = Array.isArray(value?.faq)
    ? value.faq
        .map((item) => ({ question: cleanText(item?.question, ''), answer: cleanText(item?.answer, '') }))
        .filter((item) => item.question && item.answer)
        .slice(0, 12)
    : defaultSiteContent.faq;

  return {
    brandSubtitle: cleanText(value?.brandSubtitle, defaultSiteContent.brandSubtitle),
    footerText: cleanText(value?.footerText, defaultSiteContent.footerText),
    homeHeroTitle: cleanText(value?.homeHeroTitle, defaultSiteContent.homeHeroTitle),
    homeHeroText: cleanText(value?.homeHeroText, defaultSiteContent.homeHeroText),
    homePrimaryButton: cleanText(value?.homePrimaryButton, defaultSiteContent.homePrimaryButton),
    homeSecondaryButton: cleanText(value?.homeSecondaryButton, defaultSiteContent.homeSecondaryButton),
    contacts: {
      phone: cleanText(contacts.phone, defaultSiteContent.contacts.phone),
      phoneHref: cleanText(contacts.phoneHref, defaultSiteContent.contacts.phoneHref),
      email: cleanText(contacts.email, defaultSiteContent.contacts.email),
      address: cleanText(contacts.address, defaultSiteContent.contacts.address),
      worktime: cleanText(contacts.worktime, defaultSiteContent.contacts.worktime),
      telegramUrl: cleanText(contacts.telegramUrl, defaultSiteContent.contacts.telegramUrl),
      whatsappUrl: cleanText(contacts.whatsappUrl, defaultSiteContent.contacts.whatsappUrl),
      instagramUrl: cleanText(contacts.instagramUrl, defaultSiteContent.contacts.instagramUrl),
    },
    pages: {
      productionTitle: cleanText(pages.productionTitle, defaultSiteContent.pages.productionTitle),
      productionDescription: cleanText(pages.productionDescription, defaultSiteContent.pages.productionDescription),
      servicesTitle: cleanText(pages.servicesTitle, defaultSiteContent.pages.servicesTitle),
      servicesDescription: cleanText(pages.servicesDescription, defaultSiteContent.pages.servicesDescription),
      aboutTitle: cleanText(pages.aboutTitle, defaultSiteContent.pages.aboutTitle),
      aboutDescription: cleanText(pages.aboutDescription, defaultSiteContent.pages.aboutDescription),
      contactsTitle: cleanText(pages.contactsTitle, defaultSiteContent.pages.contactsTitle),
      contactsDescription: cleanText(pages.contactsDescription, defaultSiteContent.pages.contactsDescription),
    },
    faq: faq.length ? faq : defaultSiteContent.faq,
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

export function readLocalSiteContent(): SiteContentSettings {
  if (typeof window === 'undefined') return defaultSiteContent;

  try {
    const raw = window.localStorage.getItem(LOCAL_CONTENT_SETTINGS_KEY);
    if (!raw) return defaultSiteContent;
    return normalizeSiteContent(JSON.parse(raw));
  } catch {
    return defaultSiteContent;
  }
}

export function writeLocalSiteContent(content: SiteContentSettings) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_CONTENT_SETTINGS_KEY, JSON.stringify(content));
  window.dispatchEvent(new Event('bullmet-content-settings-updated'));
}

export async function readHomeSettingsAsync(): Promise<HomeSettings> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', HOME_SETTINGS_KEY)
        .maybeSingle();

      if (error) throw error;
      if (data?.value) {
        return normalizeSettings(data.value as Partial<HomeSettings>);
      }
    } catch (error) {
      console.warn('Supabase site_settings read failed:', error);
      return defaultHomeSettings;
    }

    return defaultHomeSettings;
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
      if (error) throw error;
    } catch (error) {
      console.warn('Supabase save site_settings fallback to localStorage:', error);
    }
  }

  writeLocalHomeSettings(cleanSettings);
  return cleanSettings;
}

export async function readSiteContentAsync(): Promise<SiteContentSettings> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', CONTENT_SETTINGS_KEY)
        .maybeSingle();

      if (error) throw error;
      if (data?.value) {
        return normalizeSiteContent(data.value as Partial<SiteContentSettings>);
      }
    } catch (error) {
      console.warn('Supabase content settings read failed:', error);
      return defaultSiteContent;
    }

    return defaultSiteContent;
  }

  return readLocalSiteContent();
}

export async function saveSiteContentAsync(content: SiteContentSettings): Promise<SiteContentSettings> {
  const cleanContent = normalizeSiteContent(content);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: CONTENT_SETTINGS_KEY, value: cleanContent }, { onConflict: 'key' });
      if (error) throw error;
    } catch (error) {
      console.warn('Supabase save content settings fallback to localStorage:', error);
    }
  }

  writeLocalSiteContent(cleanContent);
  return cleanContent;
}

export async function uploadHomeImage(file: File, folder: string) {
  const [url] = await uploadProductImages(`site/${folder}`, [file]);
  return url;
}
