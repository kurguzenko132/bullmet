# Как безопасно обновить проект Bullmet на GitHub и Vercel

## Что исправлено в этой версии

- В админке больше не подсвечиваются оранжевым несуществующие пункты меню.
- В левом меню админки оставлены только реальные рабочие разделы: главная, настройки главной, каталог товаров, заказы и заявки.
- На главной странице блок «Популярные товары» теперь берет товары из админки/Supabase.
- Если все товары удалены в админке, на главной и в каталоге больше не показываются демо-товары.
- Если открыть удаленный товар по старой ссылке, появится аккуратная страница «Товар не найден».
- В проект добавлен `.gitignore`, чтобы не отправлять в GitHub `node_modules`, `.next`, `.env.local`, `.vercel` и `package-lock.json`.
- В `package.json` добавлено `"packageManager": "pnpm@9.15.4"`.

## Как обновить текущий репозиторий

Распакуй этот архив. Потом открой терминал и перейди в папку проекта, которая подключена к GitHub:

```bash
cd путь/к/твоему/репозиторию/bullmet
```

Скопируй файлы из распакованной папки поверх текущего проекта. На Mac удобнее всего через Finder: выделить все содержимое распакованной папки и перенести в папку репозитория с заменой файлов.

После этого выполни:

```bash
git status
```

Если в Git попали лишние файлы, убери их из индекса:

```bash
git rm -r --cached node_modules .next .vercel 2>/dev/null || true
git rm --cached .env.local package-lock.json 2>/dev/null || true
```

Потом:

```bash
git add .
git commit -m "Fix admin menu and product data source"
git push
```

## Настройки Vercel

В Vercel открой:

`Project → Settings → Build & Development Settings`

Поставь:

```text
Install Command: pnpm install
Build Command: pnpm build
Output Directory: .next
```

В `Environment Variables` должны быть:

```env
NEXT_PUBLIC_SUPABASE_URL=твоя_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=твой_anon_key
NEXT_PUBLIC_SUPABASE_PRODUCT_IMAGES_BUCKET=product-images
NEXT_PUBLIC_SITE_URL=https://твой-домен-или-vercel-url
NEXT_PUBLIC_ADMIN_EMAILS=admin@bullmet.by
```

После push нажми `Redeploy`.

## Если Vercel снова запускает npm install

Проверь, что в настройках Vercel явно стоит:

```text
Install Command: pnpm install
```

И что в GitHub нет `package-lock.json`.

Если `package-lock.json` уже был закоммичен, выполни:

```bash
git rm --cached package-lock.json
rm -f package-lock.json
git add .
git commit -m "Remove npm lockfile"
git push
```

## После деплоя

Открой сайт и проверь:

- `/admin` — в меню должен быть только набор рабочих разделов.
- `/admin/products` — добавь/удали товар.
- `/` — блок «Популярные товары» должен показывать только реальные товары из админки.
- `/catalog` — если товары удалены, каталог должен быть пустым, без демо-карточек.
