import { supabase } from './supabase';

export type FavoriteItem = {
  slug: string;
  title: string;
  price: number;
  image?: string;
  short?: string;
  category?: string;
};

const storageKey = 'bullmet_favorites';
const updateEvent = 'bullmet-favorites-updated';

function unique(items: FavoriteItem[]) {
  return items.filter((item, index, all) => Boolean(item.slug) && all.findIndex((candidate) => candidate.slug === item.slug) === index);
}

export function readFavorites(): FavoriteItem[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) || '[]');
    return Array.isArray(parsed)
      ? unique(parsed.map((item) => ({ slug: String(item?.slug || '').trim(), title: String(item?.title || '').trim(), price: Number(item?.price || 0), image: item?.image || '', short: item?.short || '', category: item?.category || '' })).filter((item) => item.slug && item.title))
      : [];
  } catch {
    return [];
  }
}

function saveFavorites(items: FavoriteItem[], notify = true) {
  const next = unique(items);
  try { window.localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
  if (notify) window.dispatchEvent(new Event(updateEvent));
  return next;
}

function normalizeFavorite(item: any): FavoriteItem | null {
  const slug = String(item?.product_slug || item?.slug || '').trim();
  const title = String(item?.title || '').trim();
  return slug && title ? { slug, title, price: Number(item?.price || 0), image: item?.image || '', short: item?.short || '', category: item?.category || '' } : null;
}

export async function hydrateFavorites() {
  const local = readFavorites();
  if (!supabase) return { items: local, error: '' };
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return { items: local, error: '' };

  const result = await supabase.from('favorites').select('product_slug, title, price, image, short, category, created_at').eq('user_id', user.id).order('created_at', { ascending: false });
  if (result.error) return { items: local, error: 'Не удалось синхронизировать избранное.' };
  const server = (result.data || []).map(normalizeFavorite).filter(Boolean) as FavoriteItem[];
  const missing = local.filter((item) => !server.some((candidate) => candidate.slug === item.slug));
  if (missing.length) {
    const inserted = await supabase.from('favorites').insert(missing.map((item) => ({ user_id: user.id, product_slug: item.slug, title: item.title, price: item.price, image: item.image || null, short: item.short || null, category: item.category || null })));
    if (inserted.error) return { items: saveFavorites([...server, ...local], false), error: 'Не удалось сохранить часть избранного в аккаунт.' };
  }
  return { items: saveFavorites([...server, ...local], false), error: '' };
}

export async function toggleFavorite(item: FavoriteItem) {
  const current = readFavorites();
  const exists = current.some((candidate) => candidate.slug === item.slug);
  const items = saveFavorites(exists ? current.filter((candidate) => candidate.slug !== item.slug) : [...current, item]);
  if (!supabase) return { favorite: !exists, items, error: '' };
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return { favorite: !exists, items, error: '' };
  const result = exists
    ? await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_slug', item.slug)
    : await supabase.from('favorites').insert({ user_id: user.id, product_slug: item.slug, title: item.title, price: item.price, image: item.image || null, short: item.short || null, category: item.category || null });
  return { favorite: !exists, items, error: result.error ? 'Не удалось синхронизировать избранное с аккаунтом.' : '' };
}
