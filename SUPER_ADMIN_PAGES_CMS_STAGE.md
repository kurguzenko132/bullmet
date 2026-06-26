# Bullmet — этап 12: супер-админка и CMS-страницы

Что добавлено:
- Реальный CMS-раздел `/admin/pages`.
- Новый файл `lib/sitePages.ts`.
- Новый компонент `components/AdminPagesClient.tsx`.
- Новые API:
  - `/api/admin/pages`
  - `/api/admin/pages/[id]`
- Новая публичная динамическая страница:
  - `app/[slug]/page.tsx`
- Можно создавать страницы без кода:
  - название;
  - slug;
  - статус: published/draft/hidden;
  - SEO title;
  - SEO description;
  - OG image;
  - краткое описание;
  - порядок сортировки.
- Добавлен конструктор блоков:
  - hero;
  - text;
  - image_text;
  - cards;
  - faq;
  - cta.
- Для карточек и FAQ можно добавлять/удалять пункты.
- Можно менять порядок блоков.
- CMS-страницы добавлены в sitemap.xml.
- Экспорт и аудит теперь знают про CMS-страницы.
- Действия пишутся в `admin_activity_log`.
- Добавлен SQL-файл `database/super-admin-pages-cms.sql`.
- Проверка `npx tsc --noEmit` прошла успешно.

Важно:
- Для существующей базы выполнить `database/super-admin-pages-cms.sql`.
- Зарезервированные slug нельзя использовать: admin, api, catalog, cart, contacts, login, product, services, production, about, account.
- Страница появляется публично только после статуса `published`.
