export function getReadableError(error: unknown, context = 'Операция не выполнена') {
  const raw = extractErrorText(error);
  const lower = raw.toLowerCase();

  if (!raw) return `${context}. Неизвестная ошибка.`;

  if (lower.includes('failed to fetch') || lower.includes('network') || lower.includes('fetch')) {
    return `${context}. Не удалось подключиться к Supabase. Проверь интернет, NEXT_PUBLIC_SUPABASE_URL и доступность проекта Supabase.`;
  }

  if (lower.includes('jwt') || lower.includes('invalid api key') || lower.includes('apikey') || lower.includes('anon key')) {
    return `${context}. Неверный Supabase anon key. Проверь NEXT_PUBLIC_SUPABASE_ANON_KEY в Vercel Environment Variables.`;
  }

  if (lower.includes('bucket not found') || lower.includes('the resource was not found') || lower.includes('not found') && lower.includes('bucket')) {
    return `${context}. Bucket для фото не найден. Выполни SQL из database/supabase-schema.sql или создай Storage bucket product-images.`;
  }

  if (lower.includes('row-level security') || lower.includes('rls') || lower.includes('violates row-level security')) {
    return `${context}. Supabase запретил запись из-за RLS-политик. Заново выполни database/supabase-schema.sql в Supabase SQL Editor.`;
  }

  if (lower.includes('permission denied') || lower.includes('not authorized') || lower.includes('unauthorized') || lower.includes('forbidden')) {
    return `${context}. Нет прав на запись. Проверь RLS-политики Supabase и роль пользователя admin.`;
  }

  if (lower.includes('relation') && lower.includes('does not exist')) {
    return `${context}. В Supabase не создана нужная таблица. Выполни SQL из database/supabase-schema.sql.`;
  }

  if (lower.includes('duplicate key') || lower.includes('already exists')) {
    return `${context}. Объект уже существует. Попробуй другое имя или обнови страницу.`;
  }

  if (lower.includes('payload too large') || lower.includes('too large') || lower.includes('maximum')) {
    return `${context}. Файл слишком большой. Попробуй изображение меньшего размера.`;
  }

  return `${context}. Причина: ${raw}`;
}

export function extractErrorText(error: unknown) {
  if (!error) return '';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;

  if (typeof error === 'object') {
    const anyError = error as Record<string, unknown>;
    const parts = [
      anyError.message,
      anyError.error_description,
      anyError.details,
      anyError.hint,
      anyError.code,
      anyError.statusCode,
    ]
      .filter(Boolean)
      .map(String);

    if (parts.length) return parts.join(' | ');

    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }

  return String(error);
}
