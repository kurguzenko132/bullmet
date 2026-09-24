'use client';

export async function syncServerSession(accessToken?: string) {
  const response = await fetch('/api/auth/session', accessToken ? {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken })
  } : { method: 'DELETE' });
  if (!response.ok) throw new Error('Не удалось синхронизировать защищённую сессию.');
}
