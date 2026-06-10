type TelegramPayload = {
  title: string;
  lines: Array<string | number | null | undefined | false>;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getChatIds() {
  const raw = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHAT_IDS || '';
  return raw.split(',').map((item) => item.trim()).filter(Boolean);
}

export async function notifyTelegram(payload: TelegramPayload) {
  const token = process.env.TELEGRAM_BOT_TOKEN || '';
  const chatIds = getChatIds();
  if (!token || !chatIds.length) return { ok: false, reason: 'Telegram is not configured' };

  const text = [`<b>${escapeHtml(payload.title)}</b>`, ...payload.lines.filter(Boolean).map((line) => escapeHtml(String(line)))].join('\n');

  await Promise.allSettled(chatIds.map((chatId) => fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true })
  })));

  return { ok: true };
}
