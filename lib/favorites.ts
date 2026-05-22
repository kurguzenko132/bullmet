import type { Product } from '@/components/shopData';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import type { BullmetSession } from './auth';

const FAVORITES_KEY = 'bullmet-favorites';

export type FavoriteItem = Pick<Product, 'slug' | 'title' | 'price' | 'image' | 'short' | 'category'> & {
  addedAt: string;
};

function readLocalMap(): Record<string, FavoriteItem> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(FAVORITES_KEY) || '{}') as Record<string, FavoriteItem>;
  } catch {
    return {};
  }
}

function writeLocalMap(map: Record<string, FavoriteItem>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(map));
  window.dispatchEvent(new Event('bullmet-favorites-updated'));
}

export function productToFavorite(product: Product): FavoriteItem {
  return {
    slug: product.slug,
    title: product.title,
    price: product.price,
    image: product.image,
    short: product.short,
    category: product.category,
    addedAt: new Date().toISOString(),
  };
}

export async function readFavorites(session?: BullmetSession | null): Promise<FavoriteItem[]> {
  if (isSupabaseConfigured && supabase && session?.source === 'supabase') {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('product_slug,title,price,image,short,category,created_at')
        .eq('user_id', session.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((row: any) => ({
        slug: row.product_slug,
        title: row.title,
        price: Number(row.price || 0),
        image: row.image,
        short: row.short || '',
        category: row.category || '',
        addedAt: row.created_at,
      }));
    } catch (error) {
      console.warn('Supabase favorites fallback to localStorage:', error);
    }
  }
  return Object.values(readLocalMap()).sort((a, b) => b.addedAt.localeCompare(a.addedAt));
}

export async function isFavorite(slug: string, session?: BullmetSession | null): Promise<boolean> {
  if (isSupabaseConfigured && supabase && session?.source === 'supabase') {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', session.id)
        .eq('product_slug', slug)
        .maybeSingle();
      if (error) throw error;
      return Boolean(data);
    } catch (error) {
      console.warn('Supabase favorite check fallback:', error);
    }
  }
  return Boolean(readLocalMap()[slug]);
}

export async function toggleFavorite(product: Product, session?: BullmetSession | null): Promise<boolean> {
  const item = productToFavorite(product);

  if (isSupabaseConfigured && supabase && session?.source === 'supabase') {
    try {
      const active = await isFavorite(product.slug, session);
      if (active) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', session.id)
          .eq('product_slug', product.slug);
        if (error) throw error;
        return false;
      }

      const { error } = await supabase.from('favorites').upsert({
        user_id: session.id,
        product_slug: product.slug,
        title: item.title,
        price: item.price,
        image: item.image,
        short: item.short,
        category: item.category,
      }, { onConflict: 'user_id,product_slug' });
      if (error) throw error;
      return true;
    } catch (error) {
      console.warn('Supabase toggle favorite fallback:', error);
    }
  }

  const map = readLocalMap();
  if (map[product.slug]) {
    delete map[product.slug];
    writeLocalMap(map);
    return false;
  }
  map[product.slug] = item;
  writeLocalMap(map);
  return true;
}

export async function removeFavorite(slug: string, session?: BullmetSession | null) {
  if (isSupabaseConfigured && supabase && session?.source === 'supabase') {
    try {
      const { error } = await supabase.from('favorites').delete().eq('user_id', session.id).eq('product_slug', slug);
      if (error) throw error;
    } catch (error) {
      console.warn('Supabase remove favorite fallback:', error);
    }
  }
  const map = readLocalMap();
  delete map[slug];
  writeLocalMap(map);
}
