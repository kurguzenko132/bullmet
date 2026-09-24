# Bullmet Store

Next.js-магазин Bullmet с Supabase. Единственный поддерживаемый package manager — pnpm.

## Что внутри

- Главная страница в светлом индустриальном стиле
- Каталог товаров
- Страница товара
- Услуги резки металла и дерева
- О компании
- Контакты
- Корзина
- Админка: главная, редактирование главной страницы, товары, заказы, статистика
- `robots.ts` и `sitemap.ts` для SEO
- `supabase-schema.sql` для таблиц базы данных
- `.env.example` для переменных окружения

## Запуск

```bash
pnpm install --frozen-lockfile
pnpm run dev
```

Открыть:

```bash
http://localhost:3000
http://localhost:3000/admin
http://localhost:3000/studio
```

## Контентная CMS Sanity

Публичный контент постепенно переносится в Sanity; операции магазина (товары, заказы, клиенты и доставка) остаются в Supabase. Studio встроена в приложение и доступна по `/studio`. Настройка входа, datasets, ролей и CORS описана в [docs/SANITY_STUDIO.md](docs/SANITY_STUDIO.md). До SAN-05 публикации в Studio не меняют витрину.

## Подключение Supabase

Подробный порядок установки и обновления приведён в [database/MIGRATIONS.md](database/MIGRATIONS.md).

Коротко для нового проекта:

1. Создать проект Supabase.
2. Выполнить `database/supabase-schema.sql`.
3. Затем последовательно выполнить миграции из раздела «Новый проект» в `database/MIGRATIONS.md`.
4. Скопировать переменные из `.env.example` в `.env.local`.

Файл `supabase-schema.sql` в корне репозитория устарел и несовместим с текущим API. Не применяйте его.

Пример `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
```

## Дальше нужно реализовать

- Реальное чтение товаров из Supabase
- Авторизацию админа
- Загрузку изображений в Supabase Storage
- Создание заказов из корзины
- Telegram-уведомления менеджеру
- Роли: admin / manager / customer
- Реальную аналитику


## Если была ошибка Tailwind/PostCSS

Проект зафиксирован на Tailwind CSS 3.4.17, потому что конфигурация использует классический формат PostCSS:

```js
plugins: {
  tailwindcss: {},
  autoprefixer: {}
}
```

Используйте только `pnpm`; `package-lock.json` не является поддерживаемым lockfile.
