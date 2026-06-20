# Bullmet — Telegram notifications and diagnostics

Что добавлено:

- Улучшена отправка Telegram-уведомлений через `lib/notifications.ts`.
- Добавлена диагностика переменных Telegram без раскрытия токена.
- Добавлен тестовый endpoint:
  - `POST /api/admin/telegram/test`
  - `GET /api/admin/telegram/test`
- Добавлен общий endpoint диагностики:
  - `GET /api/admin/diagnostics`
- Улучшена страница `/admin/settings`:
  - статус Supabase;
  - статус Telegram;
  - статус admin email;
  - статус site URL;
  - кнопка тестовой отправки в Telegram.
- Заявки `/api/requests` теперь не падают полностью, если Supabase не сохранил заявку: заявка всё равно может уйти в Telegram.
- Заказы `/api/orders` теперь возвращают `telegramSent` и warning, если Telegram не настроен.

Проверка:

- `npx tsc --noEmit` проходит без ошибок.
- `npm run build` в контейнере начал production build, но оборвался по времени на стадии `Creating an optimized production build`; TypeScript-ошибок нет.
