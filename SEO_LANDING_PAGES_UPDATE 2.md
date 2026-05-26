# SEO landing pages update

Добавлены посадочные SEO-страницы для основных направлений Bullmet.

## Новые страницы

### Часы

- `/chasy-na-zakaz`
- `/nastennye-chasy-iz-dereva`
- `/nastennye-chasy-iz-metalla`
- `/chasy-dlya-bani`
- `/chasy-dlya-kuhni`
- `/chasy-dlya-barbershopa`
- `/chasy-dlya-rybalki`

### Услуги и производство

- `/lazernaya-rezka-metalla`
- `/lazernaya-rezka-dereva`
- `/izdeliya-na-zakaz`
- `/metallicheskie-izdeliya-na-zakaz`
- `/dekor-iz-metalla`

## Что есть на каждой странице

- SEO title и description.
- Canonical URL.
- Hero-блок.
- Описание направления.
- Преимущества.
- Подборка товаров из каталога по теме.
- Быстрый заказ.
- Блок материалов и вариантов исполнения.
- Этапы работы.
- FAQ.
- JSON-LD разметка FAQ и хлебных крошек.
- Похожие направления.
- CTA на заявку.

## Sitemap

`app/sitemap.ts` обновлен:

- добавлены все новые SEO-страницы;
- товары из статического каталога добавляются как раньше;
- если Supabase настроен, sitemap дополнительно подтягивает опубликованные товары из таблицы `products`.

## SQL

SQL выполнять не нужно. Это только страницы, стили и sitemap.
