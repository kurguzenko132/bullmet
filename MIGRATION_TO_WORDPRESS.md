# Миграция BULLMET на WordPress + WooCommerce

Дата аудита: 25 сентября 2026.  Этот документ описывает состояние кода в
репозитории. Подключение к production Supabase, Sanity или WordPress не
выполнялось: фактические данные, применённые SQL-миграции и настройки этих
сервисов нужно сверить перед переносом.

## 1. Краткий вывод

Сайт уже является Next.js storefront, но в нём работают три разные системы
данных:

| Зона | Текущий источник | Наблюдение |
| --- | --- | --- |
| Товары, каталог, цены, остатки | Supabase `products` | Карточки UI уже отделены от формата строки БД; источник можно заменить адаптером WooCommerce. |
| Заказы, заявки, купоны, клиенты, отзывы | Supabase | Это функциональная, но самописная коммерческая часть `/admin`. |
| Страницы, меню, SEO, главная и настройки | Supabase `site_settings` / `site_pages` | Встроенная CMS хранит большие JSON-документы. |
| Новый редакционный слой | Sanity Studio (`/studio`) | Частично подключён: схемы и API preview есть, но публичные страницы в основном всё ещё используют Supabase. |
| Рендеринг публичного UI | Next.js 15, React 18, Tailwind CSS | Его следует сохранить и переиспользовать. |

Рекомендуемый целевой источник истины:

```text
WordPress (headless, собственный небольшой плагин Bullmet)
  ├─ Pages + Gutenberg-блоки + SEO + меню
  ├─ медиа и формы заявок
  └─ WooCommerce: товары, категории, цены, склад, купоны, заказы, клиенты
                         │ REST / Store API / защищённые webhooks
                         ▼
Next.js BULLMET
  ├─ WordPress client, WooCommerce client, cache/revalidation
  ├─ registry секций → существующие React-компоненты
  └─ существующий storefront UI
```

На первом этапе ничего из действующего кода, Supabase, Sanity и `/admin` не
удаляется.

## 2. Текущая архитектура BULLMET

### Frontend

- Next.js 15.5.24, TypeScript, React 18, Tailwind CSS.
- Публичные страницы находятся в `app/`: главная, каталог, товар, корзина,
  checkout, услуги, производство, контакты, личный кабинет и др.
- `app/page.tsx` — большая композиция главной из существующих компонентов
  `HomeHeroCarousel`, `HomeProductsClient`, `HomeFaqClient`,
  `HomeCustomOptions`, `HomeReviewsClient` и других.
- `components/ProductCard.tsx`, `components/CatalogClient.tsx` и
  `components/ProductDetailsClient.tsx` — текущий UI магазина, который нужно
  сохранить.
- Страницы принудительно динамические (`force-dynamic`) в ряде маршрутов, что
  убирает преимущества кэшированного SSG/ISR, но гарантирует свежие данные из
  Supabase.

### Публичные динамические страницы

`app/[slug]/page.tsx` получает опубликованную запись из Supabase `site_pages`.
Он уже не требует отдельного `page.tsx` для каждого slug, но поддерживает
только шесть типов секций: `hero`, `text`, `image_text`, `cards`, `faq`,
`cta`. Рендерер реализован цепочкой `if`, а не реестром компонентов.

Статичные маршруты (`/about`, `/contacts`, `/production`, `/services` и т. п.)
существуют параллельно и имеют приоритет над `[slug]`. Это важно учесть при
переносе: WordPress не должен публиковать slug, конфликтующие с системными
маршрутами.

### SEO

- Глобальные SEO-настройки читаются из `site_settings.site_control` в
  `app/layout.tsx`.
- Метаданные каталога, товаров и CMS-страниц формируются сервером.
- `app/sitemap.ts` агрегирует статические страницы, категории каталога,
  `site_pages` и товары; `app/robots.ts` скрывает `/admin` и закрытые разделы.
- При смене slug встроенная CMS записывает редирект в
  `site_page_redirects`, после чего `[slug]` делает permanent redirect.

### Sanity

Sanity не является текущим основным источником публичных страниц, но уже
встроен в проект:

- `/studio` запускает Sanity Studio;
- схемы: `siteSettings`, `homePage`, `page`, `promoBanner`, `faqItem`;
- `lib/sanity.ts` — кэшированный read client;
- `app/api/sanity/revalidate` инвалидирует tag `sanity`;
- `app/api/draft-mode/enable` и `lib/sanityPreview.server.ts` подготавливают
  безопасный Draft Mode через серверный read token.

Это означает, что будущая миграция должна убрать и Sanity-зависимости
согласованно с Supabase CMS, а не только `/admin`.

## 3. Встроенная CMS и реально реализованные функции

Встроенная админка — набор маршрутов `app/admin/*`, клиентских компонентов
`components/Admin*Client.tsx` и защищённых Next.js route handlers
`app/api/admin/*`. Доступ проверяется через Supabase Auth, роль из
`profiles.role` и `lib/serverAuth.ts` / `lib/adminAccess.ts`.

Реализованы UI и API для:

- dashboard, статистики, отчётов и журнала действий;
- товаров, категорий, SEO товара, медиа и баннеров;
- страниц с публикацией/скрытием, slug, SEO, меню и шестью типами секций;
- настройки главной, производства, услуг, каталога, навигации, SEO,
  доставки и оплаты;
- заказов, заявок, покупателей/CRM, купонов и отзывов;
- пользователей, ролей, резервного копирования и диагностики.

Однако это статический аудит кода, а не приёмочное тестирование сервиса.
Часть компонентов явно показывает fallback-сообщения при отключённом
Supabase, а ряд модулей содержит demo-политики SQL. Поэтому перед экспортом
данных нужно подтвердить на реальном окружении: подключённость Supabase,
выполненные миграции, список пользователей и возможность записи для каждой
админ-функции.

## 4. Зависимости от Supabase

### Клиент, сервер и авторизация

- `lib/supabase.ts` создаёт браузерный клиент с
  `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `lib/serverSupabase.ts` создаёт серверный service-role клиент с
  `SUPABASE_SERVICE_ROLE_KEY`.
- `components/AuthForm.tsx`, `AccountClient.tsx`, `AdminTopbar.tsx` используют
  Supabase Auth прямо в браузере.
- `lib/serverAuth.ts` валидирует bearer/cookie session через Supabase Auth REST
  и получает роль из `profiles`.
- `lib/favorites.ts` синхронизирует избранное с `favorites`, а при отсутствии
  сессии использует localStorage.

### Товары и отзывы

`lib/products.ts` читает Supabase `products`, нормализует rich/legacy формат в
`CatalogProduct` и отдаёт его существующему UI. В нём также есть локальный
`localFallbackProducts`, но публичный `getCatalogProducts()` при отсутствии
Supabase возвращает пустой список, а не fallback. Отзывы и рейтинг берутся из
`product_reviews`.

### Операционная часть

Модули `adminCommerce`, `adminPeople`, `adminContent`, `adminCoupons`,
`adminBackup`, `siteControl`, `catalogControl`, `homepageControl`,
`reviewControl`, `productionControl`, `servicesControl`, `sitePages` читают и
пишут Supabase. Поэтому удаление одного SDK без замены этих источников
сломает и публичный сайт, и всю `/admin`.

### Storage

В коде и SQL используются как минимум бакеты `product-images`,
`request-files`, а также отдельный защищённый backup bucket, создаваемый
`lib/adminBackup.ts`. Медиа-библиотека также хранит метаданные в
`media_files`.

## 5. Таблицы и сущности

Ниже перечислены таблицы, обнаруженные в `supabase-schema.sql`, миграциях и
вызовах `.from()`. Наличие конкретной таблицы в production надо подтвердить
через Supabase SQL Editor или CLI перед экспортом.

| Сущность | Назначение и важные поля | Целевое место |
| --- | --- | --- |
| `products` | slug, title, category, clock_theme, material, описание, цены, фото, размеры/specs, статус, SEO, вариации, наличие, цвета | WooCommerce product + product meta/attributes/variations |
| `orders` | customer/items JSON, total, delivery/payment, статусы, заметки, менеджер, coupon snapshot | WooCommerce order + order meta |
| `requests` | Заявки на расчёт/быстрый заказ/контакт/услугу, вложения, менеджер, статусы | WordPress CPT `bullmet_request` либо CRM; не Woo order |
| `profiles` + `auth.users` | Аккаунты Supabase, имя, телефон, роль, статус | WordPress users / Woo customers (план отдельной миграции паролей) |
| `favorites` | Избранные товары пользователя | Woo/WordPress user meta или отдельная WP table; гостевое — localStorage |
| `product_reviews` | Оценка, текст, фото, модерация, ответ администратора | WooCommerce product reviews + meta/медиа |
| `coupons`, `coupon_usages` | Правила и учёт промокодов | WooCommerce coupons + order usage/history |
| `site_pages`, `site_page_redirects` | Страницы, JSON sections, SEO, старый→новый slug | WordPress pages/blocks/meta + Redirection/собственная redirect table |
| `site_settings` | JSON-настройки сайта, главной, каталога, баннеров, услуг и т. д. | WordPress options, меню, block attributes, theme/plugin settings |
| `media_files` + Storage | Файлы, alt, описание, теги, размеры | WordPress Media Library |
| `crm_customers`, `customer_notes` | CRM-контакты и заметки | Woo customers + заказные мета; при сложном CRM — отдельная система |
| `admin_notifications`, `admin_activity_log` | Уведомления и аудит административных действий | Woo/WordPress hooks + audit plugin/собственная таблица, если нужно |

Критическое расхождение: требуемый список часовых категорий содержит 16
пунктов, а константа `clockCatalogCategories` в `lib/products.ts` содержит
только 13 и включает «Христианские», которого нет в новом перечне. При
миграции необходимо утвердить финальный справочник, mapping старых slug и
иерархию категории/атрибуты до первого импорта.

## 6. API routes, которые существуют сейчас

### Административные

`/api/admin/*` покрывает activity, backup, banners, categories, coupons,
customers/notes, diagnostics, export, homepage-control, media, orders,
pages, production-control, products, requests, review-control, reviews,
search, services-control, site-control, stats, telegram test, users. Методы
изменения в основном `POST`, `PATCH`, `DELETE`; авторизация должна проходить
через `serverAuth`.

### Публичные и сервисные

- `GET /api/banners`, `/categories`, `/delivery`, `/homepage-control`,
  `/reviews`, `/services`, `/site-control`, `/products/search`;
- `POST /api/orders`, `/requests`, `/reviews`, `/coupons/validate`;
- `POST /api/auth/session`;
- `GET /api/draft-mode/enable|disable` — Sanity preview;
- `POST /api/sanity/revalidate` — Sanity webhook;
- `GET /api/debug/supabase` — диагностический route, который нельзя оставлять
  доступным в production после миграции.

## 7. Где находятся товары, заказы и авторизация

### Товары и категории

Товарная логика находится в `lib/products.ts`; каталог и карточка используют
её через `app/catalog/page.tsx` и `app/product/[slug]/page.tsx`. Категории и
видимость направлений дополнительно хранятся JSON-объектом
`site_settings.catalog_control`, а не нормализованной таблицей categories.
Именно этот слой определяет «только часы» и скрытие будущих направлений.

### Заказы, корзина и купоны

`app/checkout/page.tsx` использует текущую Supabase session, а
`POST /api/orders` записывает заказ в `orders`. Админские чтение/изменение
заказов находятся в `lib/adminCommerce.ts` и `/api/admin/orders/*`. Купоны
проверяются в `lib/couponValidation.ts` и `/api/coupons/validate`.

### Авторизация

Клиентская регистрация/вход/выход — `components/AuthForm.tsx`; профиль и
история заказов — `components/AccountClient.tsx`; серверная проверка —
`lib/serverAuth.ts`. Это Supabase Auth, а не NextAuth и не WordPress auth.
При переходе следует выбрать WooCommerce customer accounts как единственную
систему аккаунтов или сознательно оставить Supabase только для аккаунтов;
первый вариант проще и лучше соответствует цели убрать Supabase.

## 8. Предлагаемая WordPress-архитектура

### Почему Gutenberg + собственный плагин

Рекомендуется не ставить Elementor и не делать ACF обязательной зависимостью.
Создать один versioned WordPress plugin `bullmet-headless` со следующими
частями:

1. CPT `bullmet_page` (или расширение стандартного `page`) с поддержкой title,
   slug, status, revisions и preview.
2. Набор зарегистрированных Gutenberg-блоков BULLMET: Hero, Categories,
   Products, Popular products, Text, Text + image, Gallery, Benefits, How we
   work, Reviews, FAQ, CTA, Contacts, Map, Video, Production, Request form,
   Banner.
3. У каждого блока — строго типизированные attributes, `enabled` и стабильный
   `id`. Gutenberg уже даёт drag-and-drop, duplicate, remove, порядок,
   revisions и preview; `enabled` скроет блок в Next.js без потери его данных.
4. Custom REST endpoint, который преобразует parsed Gutenberg blocks в
   стабильный контракт BULLMET, а не заставляет Next.js парсить HTML:
   `GET /wp-json/bullmet/v1/pages/{path}` → `{ title, slug, status, seo,
   sections: [{id,type,enabled,order,settings}] }`.
5. Endpoints для navigation и WordPress menu locations, глобальных settings и
   preview. Только plugin знает о внутренностях WordPress/Gutenberg.
6. Webhook на publish/update/menu/product/category, подписанный общим secret,
   в Next.js endpoint revalidation.

Это минимально зависимое решение использует нативный редактор WordPress:
редактор получает именно компонентный page builder, стандартные status,
предпросмотр, порядок, дублирование и ревизии, а frontend не становится темой
WordPress.

Для SEO: использовать WordPress core title/excerpt + зарегистрированные meta
поля `bullmet_seo_title`, `bullmet_seo_description`, `bullmet_og_image`.
Если редакции нужен полноценный SEO-анализ, дополнительно оценить Yoast SEO
или Rank Math; Next.js всё равно должен получать нормализованные поля через
наш endpoint, без привязки к API конкретного SEO-плагина.

### WooCommerce model

- Направления: верхние product categories (`Настенные часы`, будущие мебель,
  услуги и т. п.) со статусом видимости в term meta.
- 16 тем часов: дочерние Woo categories или один глобальный attribute
  `pa_clock_theme`. Рекомендуется дочерняя категория для SEO URL и фильтра,
  плюс attribute для производственных свойств, если потребуется.
- Цена/current sale price, старая цена, SKU, stock, gallery, статус, купоны,
  customers, orders — нативные WooCommerce сущности.
- Размер/цвет: attributes и variations только там, где они действительно
  меняют цену/SKU/остаток; информационные характеристики — attributes/meta.
- `isPopular`, display crop/position и специфичные BULLMET-поля — product meta.
- Будущие направления скрываются term/product visibility и не попадают в
  public Next.js API; код frontend менять не нужно.

### Next.js layer

Добавляются server-only `lib/wordpress/*` и `lib/woocommerce/*`:

- typed clients, schema validation и явные `Result`/ошибки;
- кеш Next.js `fetch` tags: `wp:page:{slug}`, `wp:menu`, `wc:product:{id}`,
  `wc:category:{id}`;
- ISR `revalidate` для опубликованного контента и on-demand revalidation по
  signed webhook;
- server-only Woo credentials; клиенту передаётся только нормализованная
  публичная модель;
- loading/error/not-found boundaries для CMS-маршрутов;
- `PageSectionRenderer` + `sectionRegistry`, в котором type → существующий
  BULLMET React component/adapter. Не использовать большой `switch`.

Draft Mode реализуется через route `api/draft-mode/enable` с одноразовым
подписанным параметром, который выдаёт WP plugin. В draft mode server client
получает WordPress revision/preview по защищённому endpoint, включает
`draftMode()` и рендерит ту же страницу/те же React-компоненты. Секреты никогда
не выходят в браузер.

## 9. Что сохраняем, что переносим, что удаляем после cutover

### Сохранить

- Next.js routes, Header, Footer, визуальные CSS-классы и дизайн карточек;
- Product/Catalog/Cart UI как presentation components;
- SEO-рендеринг Next.js, sitemap, robots, redirects (после смены источника);
- Telegram-уведомления, если бизнес их использует, но вызвать их из Woo hooks
  или server webhook;
- публичные asset-файлы до переноса нужных медиа в WordPress.

### Перенести в WordPress

- `site_pages`, все `site_settings` для редакционного контента, главной,
  баннеров, услуг, производства, навигации и SEO;
- медиа и их alt/description/tags;
- заявки `requests` — в CPT/форму WordPress либо утверждённый CRM;
- redirects после изменения slug;
- контент Sanity, если он уже заполнен/используется на production.

### Перенести в WooCommerce

- `products`, изображения, категории/темы, цены, SEO, наличие, вариации/SKU;
- `orders`, клиенты и адреса, coupons и usage history;
- отзывы, фото отзывов и модерацию;
- избранное — в WordPress user meta при необходимости.

### Удалять только после подтверждённого cutover

- `/admin` и `components/Admin*`, `app/api/admin/*`;
- Supabase clients, auth/session code, Supabase route handlers и SQL migrations;
- `@supabase/supabase-js` и Supabase environment variables;
- Sanity Studio, schemas, preview/revalidate routes, `sanity`/`next-sanity`
  dependencies и Sanity variables;
- локальные fallback/duplicate data control modules, если им соответствует WP
  source.

По текущему коду Supabase не нужен как обязательный компонент после переноса
Woo accounts, заявок и media в WordPress. Решение удалить его принимается
только после параллельной проверки production-данных и сценариев.

## 10. Риски и меры

| Риск | Мера |
| --- | --- |
| Потеря заказов, coupons или customer history | Read-only экспорт с counts/checksums, ID mapping, dry-run импорт, сравнение выборок до переключения. |
| Дубли/неверные URL и SEO-падение | Таблица old URL → canonical URL, 301, staging crawl, sitemap/canonical/robots QA. |
| Отличия формата Woo товара от BULLMET UI | Изолированный Woo adapter и визуальные snapshot/ручные тесты до замены источника. |
| Публикация draft наружу | Preview endpoint только с HMAC/short-lived token, `no-store`, server-only credentials. |
| Расхождение Supabase и Woo во время переноса | Freeze window либо временная однонаправленная синхронизация, однозначный source-of-truth для каждой сущности. |
| Сломанные изображения | Сначала inventory + download/upload map, затем URL rewriting и проверка HTTP 200/alt text. |
| Небезопасные legacy RLS policies | Не считать текущие demo-политики production-ready; прекратить клиентские записи во время cutover. |
| Конфликт WP page slug с маршрутом Next.js | Центральный reserved-route list и проверка в WP plugin при сохранении. |

## 11. Пошаговый план миграции

### Этап 0 — аудит и фиксация (выполнен кодовый аудит)

1. Снять production inventory: таблицы, row counts, размер Storage, Sanity
   documents, активные env variables и URL.
2. Утвердить канонический справочник 16 категорий часов и URL strategy.
3. Составить export mapping и backup; ничего не удалять.

### Этап 1 — WordPress foundation

1. Развернуть staging WordPress и WooCommerce отдельно от production frontend.
2. Создать/версионировать plugin `bullmet-headless` с блоками, REST contract,
   menu endpoint, SEO meta и signed webhook.
3. Настроить roles/capabilities: Editor редактирует контент, Shop manager
   управляет Woo, Administrator управляет плагином.
4. Не включать публичную WordPress theme как storefront.

### Этап 2 — Next.js content adapter (без смены production source)

1. Добавить WP client, Zod/TypeScript schemas, section registry и renderer.
2. Адаптировать существующие UI-компоненты, не менять CSS/design.
3. Добавить `/cms/[...slug]` или feature flag, который показывает WP страницу
   только на staging.
4. Реализовать webhook revalidation и WordPress Draft Mode.

### Этап 3 — Woo adapter и каталог

1. Добавить server-only Woo client и normalized `WooProduct` → существующий
   `CatalogProduct` adapter.
2. Переключить staging catalog/product pages за feature flag.
3. Отдельно реализовать cart/checkout на Woo Store API/Checkout API с
   сохранением текущего frontend UI; не передавать Woo REST secret в браузер.
4. Протестировать категории, фильтры, stock, price/sale price, SKU, variants,
   reviews, coupons и orders.

### Этап 4 — миграция данных

1. Экспортировать Supabase и Sanity в versioned, private staging export.
2. Импортировать сначала media и categories, затем products, attributes,
   variations, reviews, customers, coupons, orders and request records.
3. Выполнить reconciliation: counts, totals, random sample, image links,
   slug/redirect map.
4. Прогнать редактор, preview, SEO, checkout, e-mail/Telegram и accessibility
   smoke tests.

### Этап 5 — controlled cutover

1. В maintenance window заморозить запись в старую `/admin`.
2. Выполнить финальный delta import, backup и verification.
3. Включить WP/Woo source flags в Next.js, 301 redirects и webhooks.
4. Наблюдать ошибки, заказы и webhooks; сохранить возможность rollback до
   подтверждения стабильности.

### Этап 6 — decommission

После согласованного периода стабильной работы удалить Supabase/Sanity CMS,
самописный `/admin`, routes, packages, secrets и documentation. Удаление БД
и Storage — отдельное явное решение после архива и retention period.

## 12. Файлы, предлагаемые к изменению в следующем этапе

Этот этап изменил только данный документ. Следующий, отдельно согласуемый
этап **не должен начинать миграцию данных**, но ориентировочно затронет:

| Файл/путь | Предлагаемое изменение |
| --- | --- |
| `lib/wordpress/*` (новый) | Typed WordPress REST client, schemas, preview, cache tags. |
| `lib/woocommerce/*` (новый) | Server-only Woo API client and product/category adapters. |
| `components/page-sections/*` (новый) | Adapters over existing visual BULLMET components. |
| `components/PageSectionRenderer.tsx` (новый) | Registry-based renderer. |
| `app/[slug]/page.tsx` | Replace Supabase `sitePages` read with feature-gated WP page renderer; retain routes/SEO. |
| `app/page.tsx` | Gradually map existing home sections to CMS data, preserving markup and classes. |
| `app/catalog/page.tsx`, `app/product/[slug]/page.tsx` | Change data source only, via normalized Woo adapters. |
| `app/sitemap.ts`, `app/robots.ts`, `app/layout.tsx` | Use WP/Woo settings and published entities. |
| `app/api/revalidate/route.ts` (new) | Signed WP/Woo on-demand cache invalidation. |
| `app/api/draft-mode/*` | Replace Sanity-specific preview with WordPress preview after staging validation. |
| `docs/*` and `.env.example` (new if absent) | Setup, migration mapping and operational instructions. |

Files intentionally **not** proposed for removal now: `app/admin/**`,
`components/Admin*`, `lib/supabase.ts`, `lib/serverSupabase.ts`,
`lib/sitePages.ts`, `lib/products.ts`, `sanity/**`, `app/studio/**`,
`database/**`.

## 13. Environment variables for the future implementation

Do not add secrets until the next phase starts. Expected server-side variables:

```dotenv
WORDPRESS_API_URL=https://cms.example.com/wp-json
WORDPRESS_PREVIEW_SECRET=<long random secret>
WORDPRESS_WEBHOOK_SECRET=<long random secret>
WOOCOMMERCE_API_URL=https://cms.example.com/wp-json/wc/v3
WOOCOMMERCE_CONSUMER_KEY=<server-only key>
WOOCOMMERCE_CONSUMER_SECRET=<server-only secret>
NEXT_PUBLIC_SITE_URL=https://bullmet.by
```

`WOOCOMMERCE_CONSUMER_SECRET`, `WORDPRESS_PREVIEW_SECRET` and
`WORDPRESS_WEBHOOK_SECRET` must never use a `NEXT_PUBLIC_` prefix. Existing
Supabase and Sanity variables remain until the cutover is accepted.

## 14. Manual setup and verification for this audit

Manual actions now:

1. Read and approve the proposed architecture and category mapping.
2. Provide or create a staging WordPress + WooCommerce instance only after
   approval of the next phase.
3. Export and inventory production data before granting write access to any
   target system.

How to verify this audit locally:

```bash
git status
git diff -- MIGRATION_TO_WORDPRESS.md
pnpm run typecheck
```

Git commands for this stage:

```bash
git status
git add .
git commit -m "docs: add WordPress migration audit"
git push
```
