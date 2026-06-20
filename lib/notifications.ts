export type TelegramPayload = {
  title: string;
  lines: Array<string | number | null | undefined | false>;
};

type TelegramSendResult = {
  chatId: string;
  ok: boolean;
  status?: number;
  error?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function maskValue(value: string) {
  if (!value) return '';
  if (value.length <= 8) return `${value.slice(0, 2)}***`;
  return `${value.slice(0, 4)}***${value.slice(-4)}`;
}

export function getTelegramChatIds() {
  const raw = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHAT_IDS || '';
  return raw.split(',').map((item) => item.trim()).filter(Boolean);
}

export function getTelegramDiagnostics() {
  const token = process.env.TELEGRAM_BOT_TOKEN || '';
  const chatIds = getTelegramChatIds();

  return {
    configured: Boolean(token && chatIds.length),
    tokenConfigured: Boolean(token),
    chatIdsConfigured: chatIds.length > 0,
    chatIdsCount: chatIds.length,
    maskedToken: token ? maskValue(token) : '',
    maskedChatIds: chatIds.map(maskValue),
    envNames: {
      token: 'TELEGRAM_BOT_TOKEN',
      chatIds: process.env.TELEGRAM_CHAT_ID ? 'TELEGRAM_CHAT_ID' : 'TELEGRAM_CHAT_IDS'
    }
  };
}

function buildTelegramText(payload: TelegramPayload) {
  return [
    `<b>${escapeHtml(payload.title)}</b>`,
    ...payload.lines.filter(Boolean).map((line) => escapeHtml(String(line)))
  ].join('\n');
}

export async function notifyTelegram(payload: TelegramPayload) {
  const token = process.env.TELEGRAM_BOT_TOKEN || '';
  const chatIds = getTelegramChatIds();

  if (!token || !chatIds.length) {
    return {
      ok: false,
      configured: false,
      sent: 0,
      failed: chatIds.length,
      reason: 'Telegram не настроен. Добавьте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_IDS в Vercel Environment Variables.',
      results: [] as TelegramSendResult[]
    };
  }

  const text = buildTelegramText(payload);

  const results = await Promise.all(chatIds.map(async (chatId): Promise<TelegramSendResult> => {
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        return {
          chatId: maskValue(chatId),
          ok: false,
          status: response.status,
          error: body || response.statusText
        };
      }

      return { chatId: maskValue(chatId), ok: true, status: response.status };
    } catch (error) {
      return {
        chatId: maskValue(chatId),
        ok: false,
        error: error instanceof Error ? error.message : 'Не удалось отправить сообщение.'
      };
    }
  }));

  const sent = results.filter((item) => item.ok).length;
  const failed = results.length - sent;

  return {
    ok: sent > 0,
    configured: true,
    sent,
    failed,
    reason: sent > 0 ? undefined : 'Telegram настроен, но сообщение не отправилось ни в один чат.',
    results
  };
}
