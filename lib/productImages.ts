import { isSupabaseConfigured, supabase } from './supabaseClient';

export const PRODUCT_IMAGES_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_IMAGES_BUCKET || 'product-images';

function safeName(name: string) {
  const ext = name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const base = name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 42) || 'image';
  return `${base}.${ext}`;
}

export async function uploadProductImages(slug: string, files: File[]) {
  const cleanFiles = files.filter((file) => file.size > 0 && file.type.startsWith('image/'));
  if (!cleanFiles.length) return [];

  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase Storage не подключен. Добавь ключи в .env.local и создай bucket product-images.');
  }

  const uploadedUrls: string[] = [];

  for (const file of cleanFiles) {
    const filePath = `${slug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName(file.name)}`;

    const { error } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/jpeg',
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .getPublicUrl(filePath);

    if (data.publicUrl) uploadedUrls.push(data.publicUrl);
  }

  return uploadedUrls;
}
