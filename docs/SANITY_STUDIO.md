# Sanity Studio Bullmet

Studio доступна в этом приложении по адресу `/studio` и использует Sanity-проект `n7arap96`.

## Локальный вход

1. Запустите сайт: `pnpm dev`.
2. Откройте `http://localhost:3000/studio`.
3. Войдите тем же способом, которым был создан проект Sanity.
4. Убедитесь, что в Studio отображаются разделы «Настройки сайта», «Главная страница», «Промо-баннер», «Вопрос и ответ» и «Статическая страница».

Studio авторизует пользователей только через Sanity. Она не использует учётные записи, роли или данные Supabase и не даёт доступа к заказам, клиентам, товарам и настройкам доставки.

## Datasets и доступ

- Локальная разработка использует `development`.
- Production должен использовать `production`: задайте `NEXT_PUBLIC_SANITY_DATASET=production` в переменных окружения хостинга.
- Для редактора пригласите пользователя в проект Sanity и назначьте роль Editor. Администратор Sanity управляет схемами, участниками и публикацией.
- Origins `http://localhost:3000`, текущий deployed origin `https://bullmet-sigma.vercel.app` и домены preview добавляются в Sanity Manage → Settings → API settings → CORS origins. Для Studio на этом origin включайте Allow credentials. После подключения `bullmet.by` добавьте и его отдельной записью.

Проверка от 23.09.2026: запрос к Content Lake из `https://bullmet-sigma.vercel.app` получил `200`, `access-control-allow-origin` с этим адресом и `access-control-allow-credentials: true`.

Не создавайте Sanity API token для обычного редактирования: он не нужен. Серверный токен понадобится только для Draft Mode в SAN-04 и никогда не должен получать префикс `NEXT_PUBLIC_`.

## Предпросмотр черновиков (SAN-04)

В Studio добавлен инструмент «Предпросмотр». До пилота SAN-05 он может открыть витрину, но опубликованные и черновые документы ещё не меняют её: чтение контента будет подключено на следующем этапе.

Для реальной проверки preview создайте в Sanity Manage → API → Tokens отдельный токен с минимальной ролью **Viewer**. Сохраните его только в `.env.local` и в Environment Variables Vercel как `SANITY_API_READ_TOKEN`; не отправляйте его в чат и не используйте префикс `NEXT_PUBLIC_`.

Также задайте `NEXT_PUBLIC_SANITY_PREVIEW_URL`: локально — `http://localhost:3000`, в Vercel — `https://bullmet-sigma.vercel.app`. Для инвалидации опубликованного контента позже задайте в Vercel секрет `SANITY_WEBHOOK_SECRET`; endpoint уже подготовлен: `POST /api/sanity/revalidate` с заголовком `Authorization: Bearer <секрет>`.

## Пока не переносим контент

Схемы Studio добавлены, но витрина пока продолжает читать текущие источники данных. Не удаляйте существующие записи Supabase и не ожидайте изменений сайта после публикации в Studio до пилота SAN-05.
