# Telegram notifications and admin notification center

Добавлено:

- центр уведомлений `/admin/notifications`;
- реальный колокольчик в админке вместо статичного числа;
- уведомления о новых заказах, быстрых заказах, заявках и отзывах на модерации;
- сохранение уведомлений в Supabase `admin_notifications`;
- локальный fallback через `localStorage`, если Supabase временно недоступен;
- API route `/api/notify` для Telegram;
- тестовая отправка уведомления из админки.

## Переменные Vercel

Добавь в Vercel → Project Settings → Environment Variables:

```text
TELEGRAM_BOT_TOKEN=токен_бота
TELEGRAM_CHAT_ID=id_чата
NEXT_PUBLIC_SITE_URL=https://твой-домен
```

`TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` не должны начинаться с `NEXT_PUBLIC_`.

## Supabase

После обновления выполни `database/supabase-schema.sql`. Он добавит таблицу `admin_notifications`.

## Проверка

1. Открой `/admin/notifications`.
2. Нажми “Отправить тест”.
3. Если переменные заполнены правильно, сообщение придет в Telegram.
4. Создай тестовую заявку или быстрый заказ — в колокольчике появится новое уведомление.
