# Bullmet — Vercel build fix: /order-success

Исправлена ошибка сборки Vercel:

`useSearchParams() should be wrapped in a suspense boundary at page "/order-success"`

Что изменено:

- В `app/order-success/page.tsx` добавлен импорт `Suspense` из React.
- Клиентский компонент `OrderSuccessClient`, который использует `useSearchParams`, теперь обернут в `<Suspense>`.
- `npm run build` локально прошел успешно.

Причина ошибки:

Next.js 14 требует Suspense boundary вокруг клиентского компонента с `useSearchParams()` при prerender/static generation.
