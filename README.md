# Bullmet — Next.js интернет-магазин

Проект Bullmet на **Next.js + TypeScript**: главная страница, каталог, карточки товаров, корзина, оформление заказа, заявки на расчет, личный кабинет, избранное, админ-панель, Supabase, загрузка фото и SEO-подготовка.

## Запуск локально

```bash
npm install
npm run dev
```

Открыть: `http://localhost:3000`

## Основные страницы

### Публичные

- `/` — главная
- `/catalog` — каталог
- `/catalog/wall-clock-loft` — карточка товара
- `/request` — заявка на расчет
- `/contacts` — контакты
- `/delivery` — доставка
- `/payment` — оплата
- `/returns` — возврат и обмен
- `/privacy` — политика конфиденциальности

### Пользовательские

- `/cart` — корзина
- `/checkout` — оформление заказа
- `/login` — вход
- `/register` — регистрация
- `/account` — личный кабинет

### Админка

- `/admin` — dashboard
- `/admin/products` — товары
- `/admin/products/new` — добавление товара
- `/admin/orders` — заказы
- `/admin/requests` — заявки на расчет

## Демо-вход в админку

Без Supabase работает демо-вход:

```text
email: admin@bullmet.by
password: admin123
```

## Supabase

В проект добавлено подключение Supabase. Без ключей сайт продолжает работать через `localStorage`.

### Как подключить базу

1. Создай проект в Supabase.
2. Открой Supabase SQL Editor.
3. Выполни файл `database/supabase-schema.sql`.
4. Создай файл `.env.local` на основе `.env.example`:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_PRODUCT_IMAGES_BUCKET=product-images
```

5. Перезапусти проект:

```bash
npm run dev
```

После подключения Supabase:

- товары из админки сохраняются в таблицу `products`;
- фото товаров загружаются в Supabase Storage bucket `product-images`;
- каталог подтягивает товары из Supabase;
- заказы сохраняются в таблицу `orders`;
- заявки сохраняются в таблицу `requests`;
- избранное сохраняется в таблицу `favorites`;
- статусы заказов и заявок обновляются в Supabase.

## Auth / roles

В проект добавлен Supabase Auth.

- обычный пользователь попадает в `/account`;
- администратор с ролью `admin` получает доступ к `/admin`.

Чтобы сделать пользователя админом, выполни в Supabase SQL Editor:

```sql
update public.profiles
set role = 'admin'
where email = 'admin@bullmet.by';
```

## SEO и деплой

Добавлено:

- SEO metadata для основных страниц;
- Open Graph и Twitter metadata;
- `/sitemap.xml`;
- `/robots.txt`;
- noindex для `/admin`, `/account`, `/cart`, `/checkout`, `/login`, `/register`;
- служебные страницы `/privacy`, `/delivery`, `/payment`, `/returns`, `/contacts`.

Перед публикацией замени в `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=https://your-real-domain.com
```

## Деплой на Vercel

1. Загрузи проект на GitHub.
2. Создай проект в Vercel из репозитория.
3. В Vercel → Project Settings → Environment Variables добавь переменные из `.env.local`.
4. Нажми Deploy.
5. После подключения домена добавь сайт в Google Search Console и Яндекс Вебмастер.

## Важно про безопасность

В `database/supabase-schema.sql` стоят demo-политики RLS, чтобы прототип сразу работал. Перед реальным запуском нужно закрыть запись в товары, заказы, заявки и избранное по ролям, чтобы управлять данными мог только администратор или владелец данных.
