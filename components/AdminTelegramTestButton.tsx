'use client';

import { useState } from 'react';

type TestState = 'idle' | 'loading' | 'success' | 'error';

export function AdminTelegramTestButton() {
  const [state, setState] = useState<TestState>('idle');
  const [message, setMessage] = useState('');

  async function testTelegram() {
    setState('loading');
    setMessage('');

    try {
      const response = await fetch('/api/admin/telegram/test', { method: 'POST' });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || data.result?.reason || 'Тест Telegram не прошел.');
      }

      const sent = data.result?.sent || 0;
      const failed = data.result?.failed || 0;
      setState('success');
      setMessage(`Тестовое сообщение отправлено. Успешно: ${sent}, ошибок: ${failed}.`);
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Не удалось отправить тестовое сообщение.');
    }
  }

  return (
    <div className="admin-telegram-test-box">
      <button type="button" onClick={testTelegram} disabled={state === 'loading'}>
        {state === 'loading' ? 'Проверяем...' : 'Отправить тест в Telegram'}
      </button>
      {message && <p className={state === 'success' ? 'is-success' : 'is-error'}>{message}</p>}
    </div>
  );
}
