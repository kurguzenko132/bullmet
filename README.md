# Bullmet Store

Стартовый проект интернет-магазина Bullmet: быстрый SEO-сайт на Next.js + TypeScript + Tailwind CSS с макетом админки и подготовкой под Supabase.

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
npm install
npm run dev
```

Открыть:

```bash
http://localhost:3000
http://localhost:3000/admin
```

## Подключение Supabase

1. Создать проект в Supabase.
2. Открыть SQL Editor.
3. Вставить код из `supabase-schema.sql` и выполнить.
4. Скопировать URL и anon key в `.env.local`.

Пример `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
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

Если до этого уже запускали `npm install` и появилась ошибка про `@tailwindcss/postcss`, выполните:

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```
