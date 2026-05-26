import { isSupabaseConfigured, supabase } from './supabaseClient';

export const REQUEST_FILES_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_REQUEST_FILES_BUCKET || 'request-files';

function safeName(name: string) {
  const ext = name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'file';
  const base = name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 42) || 'request-file';
  return `${base}.${ext}`;
}

export async function uploadRequestFiles(requestId: string, files: File[]) {
  const cleanFiles = files
    .filter((file) => file.size > 0)
    .slice(0, 8);

  if (!cleanFiles.length) return [];

  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Файлы заявок можно загружать только после подключения Supabase Storage. Без Supabase заявка сохранится без файлов.');
  }

  const uploadedUrls: string[] = [];

  for (const file of cleanFiles) {
    const filePath = `${requestId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName(file.name)}`;

    const { error } = await supabase.storage
      .from(REQUEST_FILES_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'application/octet-stream',
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from(REQUEST_FILES_BUCKET)
      .getPublicUrl(filePath);

    if (data.publicUrl) uploadedUrls.push(data.publicUrl);
  }

  return uploadedUrls;
}
