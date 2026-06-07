# Bullmet: проверка Supabase на Vercel

Если на Vercel не отображаются товары из базы, почти всегда причина одна из этих:

1. В Vercel не добавлены Environment Variables.
2. После добавления переменных не сделан Redeploy.
3. Таблица `products` в Supabase имеет старую структуру (`image`, `images`, `category`), а код ожидал новую (`image_url`, `product_images`, `categories`). В этой версии исправлено: поддерживаются обе структуры.
4. RLS в Supabase запрещает публичное чтение таблицы `products`.
5. В `products.status` у товаров стоит `draft`, `hidden`, `archived`, `deleted` или `inactive`.

## Какие переменные добавить в Vercel

Project -> Settings -> Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
NEXT_PUBLIC_SUPABASE_PRODUCT_IMAGES_BUCKET=product-images
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

После добавления нажмите Redeploy: Deployments -> три точки у последнего деплоя -> Redeploy.

## Быстрая проверка после деплоя

Откройте:

```text
https://ваш-домен.vercel.app/api/debug/supabase
```

Если `configured: false` — Vercel не видит переменные окружения.
Если `productsTableReadable: false` — проблема с таблицей/RLS.
Если `rawProductsCount: 0` — в подключенной базе нет товаров или подключен не тот Supabase-проект.

## SQL для публичного чтения товаров

В Supabase SQL Editor можно выполнить:

```sql
alter table public.products enable row level security;

drop policy if exists "products_select_public" on public.products;
create policy "products_select_public"
on public.products for select
using (true);
```

Для фото в Storage bucket `product-images` должен быть public, либо должна быть select-policy на `storage.objects`.
