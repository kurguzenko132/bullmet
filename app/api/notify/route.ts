import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type NotifyPayload = {
  type?: 'order' | 'request' | 'review' | 'system' | 'test';
  title?: string;
  body?: string;
  href?: string;
  payload?: Record<string, unknown> | null;
};

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}` || '').replace(/\/$/, '');
}

function safeText(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 1200) : fallback;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function iconForType(type: NotifyPayload['type']) {
  if (type === 'order') return '🛒';
  if (type === 'request') return '📩';
  if (type === 'review') return '⭐';
  if (type === 'test') return '✅';
  return '🔔';
}

function absoluteAdminUrl(href?: string) {
  const base = siteUrl();
  const cleanHref = safeText(href, '/admin');
  if (!base) return '';
  if (cleanHref.startsWith('http')) return cleanHref;
  return `${base}${cleanHref.startsWith('/') ? cleanHref : `/${cleanHref}`}`;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    telegramConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
    hasBotToken: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    hasChatId: Boolean(process.env.TELEGRAM_CHAT_ID),
    hasSiteUrl: Boolean(siteUrl()),
  });
}

export async function POST(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  let payload: NotifyPayload = {};
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  if (!token || !chatId) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'Telegram env variables are not configured.' });
  }

  const type = payload.type || 'system';
  const title = safeText(payload.title, 'Новое уведомление Bullmet');
  const body = safeText(payload.body);
  const url = absoluteAdminUrl(payload.href || '/admin');

  const text = [
    `${iconForType(type)} <b>${escapeHtml(title)}</b>`,
    escapeHtml(body),
    url ? `\n<a href="${url}">Открыть в админке</a>` : '',
  ].filter(Boolean).join('\n');

  const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_markup: url ? {
        inline_keyboard: [[{ text: 'Открыть в админке', url }]],
      } : undefined,
    }),
  });

  if (!telegramResponse.ok) {
    const errorText = await telegramResponse.text();
    return NextResponse.json({ ok: false, error: errorText }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
