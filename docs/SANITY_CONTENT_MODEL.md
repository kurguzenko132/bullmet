# Bullmet: модель контента Sanity

Статус: проект для `SAN-01` от 22.09.2026.

## Граница систем

Sanity — единственный источник публичного редакционного контента после переключения. Supabase остаётся источником операционных и коммерческих данных. Эти зоны не должны дублировать изменяемые поля друг друга.

| Данные | Владелец | Использование на витрине |
|---|---|---|
| Товар, цена, варианты, наличие, категория и рейтинг | Supabase | Каталог, карточка товара, корзина, checkout |
| Заказы, заявки, клиенты, профили, роли, статусы, промокоды, доставка и уведомления | Supabase | Кабинет и операционная админка |
| Главная, баннеры, FAQ, статичные страницы, публичная навигация и SEO | Sanity | Страницы Next.js |
| Фото товаров, отзывов и вложения заказов | Supabase Storage | Коммерческие и пользовательские сценарии |
| Иллюстрации и изображения редакционных блоков | Sanity CDN | Главная и статичные страницы |

Sanity может содержать только стабильную ссылку `productSlug` или `productId` на товар. В него нельзя переносить цену, наличие, варианты, остатки, данные клиента или статус заказа.

## Документы Sanity

### `siteSettings` (singleton)

Публичные данные общего назначения:

- `siteName`, `tagline`, `logo`, `favicon`;
- `contacts`: телефон, email, адрес, часы работы и публичные социальные ссылки;
- `navigation[]`: `label`, `href`, `location` (`header`, `mobile`, `footer`), `visible`, `order`;
- `defaultSeo`: title, description, Open Graph image, `robotsIndex`;
- `footer`: текст о компании и ссылки.

Не входят: режим обслуживания, валюта, способы доставки/оплаты, настройки заказов и уведомлений. Они остаются операционными настройками Supabase.

### `homePage` (singleton)

Поля страницы:

- `seo` — индивидуальные title, description, canonical, Open Graph и robots;
- `heroSlides[]` — kicker, title, text, image, alt, CTA, `visible`, `order`;
- `blocks[]` — только типы из списка ниже, `visible` и целочисленный `order`.

Разрешённые блоки:

| Тип | Обязательные данные | Ограничения |
|---|---|---|
| `directions` | заголовок, текст, карточки | Карточка содержит `catalogCategorySlug` или href; данные каталога не копируются |
| `promoBanner` | заголовок, текст, изображение, CTA, период публикации | Только редакционный баннер; не заменяет скидку или промокод |
| `collections` | заголовок, карточки с title, description, image, href | Без цены и наличия |
| `production` | eyebrow, заголовок, текст, image, преимущества, CTA | Редакционный блок |
| `products` | заголовок, текст, `productSlugs[]`, CTA | Цена, изображение и доступность подставляются из Supabase |
| `steps` | заголовок, шаги | Иконка только из разрешённого списка |
| `gallery` | заголовок, изображения с alt и подписью | Только Sanity-изображения |
| `faq` | заголовок, текст, items | Вопрос и ответ — plain text/portable text без HTML |
| `reviews` | заголовок, лимит, режим выбора | Сами отзывы читаются из Supabase по ID или правилам выборки |
| `cta` | eyebrow, заголовок, текст, image, CTA и преимущества | Не содержит операционных условий заказа |

Порядок блоков хранится целым числом. Между базовыми разделами зарезервированы целочисленные слоты, чтобы не использовать невалидный дробный CSS `order`.

### `promoBanner`

Отдельный переиспользуемый документ для каталога и карточки товара:

- title, text, image, alt, CTA;
- `placements[]`: `home_top`, `catalog_top`, `product_bottom`;
- `startsAt`, `endsAt`, `visible`, `order`;
- опциональный `productSlug` или `categorySlug` для области действия.

### `faqItem`

Переиспользуемый документ: question, answer, тема, `visible`, `order`. Главная и статичные страницы могут выбирать набор FAQ по ссылкам, а не копировать вопросы.

### `page`

Для статичных страниц, не занятых системными маршрутами:

- `title`, `slug`, `status` (`draft`/`published`), `seo`;
- `blocks[]`: `hero`, `richText`, `featureGrid`, `gallery`, `faq`, `cta`;
- `redirectFrom[]` для старых slug.

Зарезервированные slug: `admin`, `api`, `auth`, `account`, `cabinet`, `lk`, `login`, `forgot-password`, `reset-password`, `cart`, `checkout`, `order-success`, `catalog`, `product`, `services`, `production`, `contacts`, `maintenance`, `robots.txt`, `sitemap.xml`.

## Общие типы полей

- CTA: `label`, внутренний `href` или разрешённый внешний URL, `variant` (`primary`/`secondary`).
- Image: Sanity image asset, обязательный `alt`, опциональная подпись и focal point.
- SEO: title, description, canonical, OG title/description/image, `robotsIndex`, `robotsFollow`.
- Списки: stable `_key`, `visible`, целочисленный `order`; порядок рендерится только после сортировки.
- Portable Text: только для редакционного текста; запрещены произвольные HTML/embed/скрипты.

## Контракт Next.js и fallback

1. Server Component сначала запрашивает опубликованный документ Sanity.
2. При отсутствии конфигурации, документа или обязательного блока используется текущий источник Supabase/default-данные только для этого поля.
3. Черновики доступны исключительно через защищённый Draft Mode; публичный запрос возвращает только `published`.
4. Ссылка Sanity на `productSlug` сверяется с публичным товаром Supabase. Скрытый или удалённый товар не попадает в блок; блок использует безопасный empty state или fallback.
5. Запись контента в Sanity не меняет таблицы Supabase. Запись заказа/товара в Supabase не меняет документы Sanity.

## Роли

- `Sanity Administrator`: схемы, пользователи и публикация.
- `Sanity Editor`: только редакционные документы и медиа Sanity.
- `Supabase admin/manager`: только операционная админка; не получает прав на Studio автоматически.

## Последовательность внедрения

Эта спецификация является входом для `SAN-02` и `SAN-03`. В первом пилоте (`SAN-05`) переносятся только `homePage` и одна статичная `page`; текущие `homepage_control`, `site_control`, banners и site pages не удаляются до отдельной приёмки `SAN-08`.

## Параметры окружения

| Переменная | Локально | Production | Секрет |
|---|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `n7arap96` | `n7arap96` | Нет |
| `NEXT_PUBLIC_SANITY_DATASET` | `development` | `production` | Нет |
| `SANITY_API_VERSION` | `2026-09-22` | `2026-09-22` | Нет |
| `SANITY_API_READ_TOKEN` | не нужен до Draft Mode | добавляется в SAN-04 | Да |

До `SAN-04` сайт использует только публичный Content Lake API и не хранит Sanity-токен.
