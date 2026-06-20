import { NextResponse } from 'next/server';
import { notifyTelegram, getTelegramDiagnostics } from '@/lib/notifications';

export async function POST() {
  const diagnostics = getTelegramDiagnostics();

  if (!diagnostics.configured) {
    return NextResponse.json({
      ok: false,
      diagnostics,
      message: 'Telegram не настроен. Добавьте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_IDS в Vercel.'
    }, { status: 400 });
  }

  const result = await notifyTelegram({
    title: 'Тест уведомлений Bullmet',
    lines: [
      'Telegram подключен правильно.',
      `Время проверки: ${new Date().toLocaleString('ru-RU')}`,
      'Если вы видите это сообщение, заказы и заявки смогут приходить в Telegram.'
    ]
  });

  return NextResponse.json({ ok: result.ok, diagnostics, result });
}

export async function GET() {
  return NextResponse.json({ ok: true, diagnostics: getTelegramDiagnostics() });
}
