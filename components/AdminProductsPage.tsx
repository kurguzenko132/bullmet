'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { deleteAdminProductAsync, makeSlug, makeUniqueProductSlug, saveAdminProductAsync, type AdminProduct } from './adminProductStore';
import { useAdminProducts } from './useAdminProducts';
import { categories as fallbackCategories, clockCategory } from './shopData';
import { getActiveCategoryNames, getActiveClockThemeNames, readCatalogSettingsAsync } from './categoryStore';
import { EditIcon, PlusIcon, TrashIcon } from './AdminLayout';

const importExample = `Название\tКатегория\tТематика часов\tЦена\tСтарая цена\tМатериал\tКраткое описание\tОписание\tРазмеры\tХарактеристики\tСтатус\tВ наличии\tНовинка\tПопулярный\tФото
Часы Рыбалка\tЧасы собственного производства\tРыбалка\t120\t150\tДерево\tНастенные часы\tОписание товара\t40 см, 60 см\tМатериал: дерево; Механизм: бесшумный\tactive\tда\tнет\tда\t/assets/cat-clock.jpg`;

type ParsedImportRow = Record<string, string>;

function splitTableLine(line: string, delimiter: string) {
  const result: string[] = [];
  let current = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"') {
      if (quoted && next === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === delimiter && !quoted) {
      result.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  result.push(current.trim());
  return result;
}

function detectDelimiter(text: string) {
  const firstLine = text.split(/\r?\n/).find(Boolean) || '';
  if (firstLine.includes('\t')) return '\t';
  if (firstLine.includes(';')) return ';';
  return ',';
}

function normalizeHeader(value: string) {
  const key = value.trim().toLowerCase();
  const map: Record<string, string> = {
    'название': 'title',
    'товар': 'title',
    'title': 'title',
    'категория': 'category',
    'category': 'category',
    'тематика': 'clockTheme',
    'тематика часов': 'clockTheme',
    'clocktheme': 'clockTheme',
    'цена': 'price',
    'price': 'price',
    'старая цена': 'oldPrice',
    'oldprice': 'oldPrice',
    'материал': 'material',
    'material': 'material',
    'краткое описание': 'short',
    'short': 'short',
    'описание': 'description',
    'description': 'description',
    'размеры': 'sizes',
    'sizes': 'sizes',
    'характеристики': 'specs',
    'specs': 'specs',
    'статус': 'status',
    'status': 'status',
    'в наличии': 'inStock',
    'instock': 'inStock',
    'новинка': 'isNew',
    'isnew': 'isNew',
    'популярный': 'isPopular',
    'хит': 'isPopular',
    'ispopular': 'isPopular',
    'фото': 'image',
    'image': 'image',
    'images': 'image',
  };
  return map[key] || key;
}

function toBool(value: string, fallback = false) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return fallback;
  return ['1', 'true', 'yes', 'y', 'да', 'дa', 'есть', 'on', '+'].includes(normalized);
}

function parseList(value: string) {
  const source = value.trim();
  if (!source) return [];
  const delimiter = /[;|\n]/.test(source) ? /[;|\n]/ : /,/;
  return source
    .split(delimiter)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseImportText(text: string): ParsedImportRow[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return [];
  const delimiter = detectDelimiter(text);
  const rows = lines.map((line) => splitTableLine(line, delimiter));
  const first = rows[0].map(normalizeHeader);
  const hasHeader = first.includes('title') || first.includes('category') || first.includes('price');
  const headers = hasHeader ? first : ['title', 'category', 'clockTheme', 'price', 'oldPrice', 'material', 'short', 'description', 'sizes', 'specs', 'status', 'inStock', 'isNew', 'isPopular', 'image'];
  const body = hasHeader ? rows.slice(1) : rows;

  return body.map((cells) => headers.reduce<ParsedImportRow>((acc, header, index) => {
    acc[header] = cells[index] || '';
    return acc;
  }, {})).filter((row) => row.title);
}

function productFromImportRow(row: ParsedImportRow, fallbackCategory: string): AdminProduct {
  const title = row.title?.trim() || 'Новый товар Bullmet';
  const category = row.category?.trim() || fallbackCategory || 'Изделия на заказ';
  const imageList = parseList(row.image || '').length ? parseList(row.image || '') : ['/assets/cat-clock.jpg'];
  const price = Number(String(row.price || '0').replace(',', '.')) || 0;
  const oldPrice = Number(String(row.oldPrice || '').replace(',', '.')) || 0;

  return {
    slug: makeSlug(title),
    title,
    category,
    clockTheme: category === clockCategory ? (row.clockTheme?.trim() || '') : '',
    material: row.material?.trim() || 'Металл + дерево',
    short: row.short?.trim() || row.material?.trim() || 'Изделие Bullmet',
    description: row.description?.trim() || 'Описание товара Bullmet.',
    price,
    oldPrice: oldPrice > 0 ? oldPrice : undefined,
    image: imageList[0],
    images: imageList,
    sizes: parseList(row.sizes || '').length ? parseList(row.sizes || '') : ['Индивидуально'],
    specs: parseList(row.specs || '').length ? parseList(row.specs || '') : ['Материал по согласованию', 'Размер под проект', 'Контроль качества'],
    status: row.status?.trim().toLowerCase() === 'draft' || row.status?.trim().toLowerCase() === 'черновик' ? 'draft' : 'active',
    isPopular: toBool(row.isPopular || ''),
    isNew: toBool(row.isNew || ''),
    inStock: toBool(row.inStock || '', true),
    catalogImageFit: 'cover',
    catalogImagePosition: 'center center',
    productImageFit: 'contain',
    productImagePosition: 'center center',
    imageSettings: {},
    variants: [],
    colorGroupId: '',
    colorName: '',
    colorHex: '#111111',
  };
}

export function AdminProductsPage() {
  const { items, ready, error } = useAdminProducts();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Все категории');
  const [categoryOptions, setCategoryOptions] = useState<string[]>(fallbackCategories);
  const [clockThemeOptions, setClockThemeOptions] = useState<string[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkTheme, setBulkTheme] = useState('');
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkFlag, setBulkFlag] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    readCatalogSettingsAsync().then((settings) => {
      if (!mounted) return;
      const nextCategories = getActiveCategoryNames(settings);
      const nextThemes = getActiveClockThemeNames(settings);
      setCategoryOptions(nextCategories.length ? nextCategories : fallbackCategories);
      setClockThemeOptions(nextThemes);
    });
    return () => { mounted = false; };
  }, []);

  const allCategoryOptions = useMemo(() => {
    const list = [...categoryOptions];
    items.forEach((item) => { if (item.category && !list.includes(item.category)) list.push(item.category); });
    return list;
  }, [categoryOptions, items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const byQuery = !query || `${item.title} ${item.category} ${item.clockTheme ?? ''} ${item.material}`.toLowerCase().includes(query.toLowerCase());
      const byCategory = category === 'Все категории' || item.category === category;
      return byQuery && byCategory;
    });
  }, [items, query, category]);

  const visibleSlugs = useMemo(() => filtered.map((item) => item.slug), [filtered]);
  const allVisibleSelected = visibleSlugs.length > 0 && visibleSlugs.every((slug) => selectedSlugs.includes(slug));

  function toggleSlug(slug: string) {
    setSelectedSlugs((current) => current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]);
  }

  function toggleVisible() {
    setSelectedSlugs((current) => {
      if (allVisibleSelected) return current.filter((slug) => !visibleSlugs.includes(slug));
      return Array.from(new Set([...current, ...visibleSlugs]));
    });
  }

  async function remove(slug: string) {
    if (window.confirm('Удалить товар? Если Supabase подключен, товар удалится из базы.')) {
      await deleteAdminProductAsync(slug);
      setSelectedSlugs((current) => current.filter((item) => item !== slug));
    }
  }

  async function applyBulkChanges() {
    const selectedProducts = items.filter((item) => selectedSlugs.includes(item.slug));
    if (!selectedProducts.length) return;
    setBusy(true);
    setNotice('');
    try {
      for (const product of selectedProducts) {
        const next: AdminProduct = { ...product };
        if (bulkCategory) next.category = bulkCategory;
        if (bulkTheme) next.clockTheme = bulkTheme === '__clear' ? '' : bulkTheme;
        if (bulkStatus) next.status = bulkStatus as 'active' | 'draft';
        if (bulkFlag === 'popular-on') next.isPopular = true;
        if (bulkFlag === 'popular-off') next.isPopular = false;
        if (bulkFlag === 'new-on') next.isNew = true;
        if (bulkFlag === 'new-off') next.isNew = false;
        if (bulkFlag === 'stock-on') next.inStock = true;
        if (bulkFlag === 'stock-off') next.inStock = false;
        await saveAdminProductAsync(next);
      }
      setNotice(`Обновлено товаров: ${selectedProducts.length}`);
      setSelectedSlugs([]);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Не удалось применить массовые изменения');
    } finally {
      setBusy(false);
    }
  }

  async function importProducts() {
    const rows = parseImportText(importText);
    if (!rows.length) {
      setNotice('Не удалось найти строки товаров. Проверь заголовки или вставь пример.');
      return;
    }
    setBusy(true);
    setNotice('');
    try {
      let count = 0;
      for (const row of rows) {
        const product = productFromImportRow(row, allCategoryOptions[0] || 'Изделия на заказ');
        product.slug = await makeUniqueProductSlug(product.slug);
        await saveAdminProductAsync(product);
        count += 1;
      }
      setNotice(`Импортировано товаров: ${count}. Одинаковые названия получили уникальные slug.`);
      setImportText('');
      setImportOpen(false);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Не удалось импортировать товары');
    } finally {
      setBusy(false);
    }
  }

  async function readImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setImportText(text);
    setImportOpen(true);
    event.currentTarget.value = '';
  }

  return (
    <AdminLayout title="Каталог товаров">
      <main className="adminContent adminProductsPage">
        <div className="adminPageHead">
          <div>
            <p>Контент / Каталог товаров</p>
            <h2>Товары Bullmet</h2>
          </div>
          <div className="adminPageActions">
            <Link className="adminSecondaryBtn" href="/admin/categories">Категории</Link>
            <button className="adminSecondaryBtn" type="button" onClick={() => setImportOpen((value) => !value)}>Импорт Excel/CSV</button>
            <Link className="adminPrimaryBtn" href="/admin/products/new"><PlusIcon />Добавить товар</Link>
          </div>
        </div>

        {notice && <section className="adminUploadError adminUploadError--success">{notice}</section>}

        {importOpen && (
          <section className="adminCard adminImportPanel">
            <div className="adminImportPanel__head">
              <div>
                <h3>Импорт товаров из Excel</h3>
                <p>Скопируй таблицу из Excel и вставь сюда, либо загрузи CSV-файл. XLSX без конвертации не нужен: Excel умеет сохранять таблицу как CSV.</p>
              </div>
              <label className="adminSecondaryBtn">Загрузить CSV<input type="file" accept=".csv,.txt" onChange={readImportFile} hidden /></label>
            </div>
            <textarea value={importText} onChange={(event) => setImportText(event.target.value)} rows={10} placeholder={importExample} />
            <div className="adminImportHelp">
              <span>Поддерживаемые колонки: Название, Категория, Тематика часов, Цена, Старая цена, Материал, Краткое описание, Описание, Размеры, Характеристики, Статус, В наличии, Новинка, Популярный, Фото.</span>
              <button type="button" onClick={() => setImportText(importExample)}>Вставить пример</button>
            </div>
            <div className="adminPageActions">
              <button className="adminSecondaryBtn" type="button" onClick={() => setImportOpen(false)}>Закрыть</button>
              <button className="adminPrimaryBtn" type="button" onClick={importProducts} disabled={busy}>{busy ? 'Импортируем...' : 'Импортировать товары'}</button>
            </div>
          </section>
        )}

        <section className="adminCard adminProductsToolbar">
          <div className="adminSearchField"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по названию, категории или материалу" /></div>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option>Все категории</option>
            {allCategoryOptions.map((item) => <option key={item}>{item}</option>)}
          </select>
          <div className="adminProductsCounter">{ready ? `${filtered.length} товаров` : 'Загрузка...'}</div>
        </section>

        {selectedSlugs.length > 0 && (
          <section className="adminCard adminBulkPanel">
            <div className="adminBulkPanel__title"><b>Выбрано товаров: {selectedSlugs.length}</b><button type="button" onClick={() => setSelectedSlugs([])}>Снять выбор</button></div>
            <div className="adminBulkControls">
              <select value={bulkCategory} onChange={(event) => setBulkCategory(event.target.value)}>
                <option value="">Категорию не менять</option>
                {allCategoryOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <select value={bulkTheme} onChange={(event) => setBulkTheme(event.target.value)}>
                <option value="">Тематику не менять</option>
                <option value="__clear">Очистить тематику</option>
                {clockThemeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <select value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value)}>
                <option value="">Статус не менять</option>
                <option value="active">Активен</option>
                <option value="draft">Черновик</option>
              </select>
              <select value={bulkFlag} onChange={(event) => setBulkFlag(event.target.value)}>
                <option value="">Бейджи не менять</option>
                <option value="popular-on">Сделать популярными</option>
                <option value="popular-off">Убрать популярность</option>
                <option value="new-on">Сделать новинками</option>
                <option value="new-off">Убрать новинку</option>
                <option value="stock-on">Поставить в наличии</option>
                <option value="stock-off">Убрать из наличия</option>
              </select>
              <button className="adminPrimaryBtn" type="button" onClick={applyBulkChanges} disabled={busy}>{busy ? 'Применяем...' : 'Применить'}</button>
            </div>
          </section>
        )}

        {error && <section className="adminUploadError">Не удалось загрузить товары: {error}</section>}

        <section className="adminCard adminProductsTable">
          <div className="adminProductsHeader adminProductsHeader--selectable">
            <span><input type="checkbox" checked={allVisibleSelected} onChange={toggleVisible} aria-label="Выбрать все" /></span><span>Товар</span><span>Категория</span><span>Цена</span><span>Статус</span><span>Действия</span>
          </div>
          {filtered.map((product) => (
            <div className="adminProductsRow adminProductsRow--selectable" key={product.slug}>
              <label className="adminProductSelect"><input type="checkbox" checked={selectedSlugs.includes(product.slug)} onChange={() => toggleSlug(product.slug)} aria-label={`Выбрать ${product.title}`} /></label>
              <div className="adminProductMain">
                <Image src={product.image} alt="" width={62} height={62} />
                <div><b>{product.title}</b><small>{product.material}</small>{product.colorName ? <span className="adminVariantCount">Цвет: {product.colorName}</span> : null}{product.colorGroupId ? <span className="adminVariantCount">Группа: {product.colorGroupId}</span> : null}<em>{product.slug}</em></div>
              </div>
              <span>{product.category}{product.clockTheme ? <small className="adminCategorySub">{product.clockTheme}</small> : null}</span>
              <strong>{product.price} BYN {product.oldPrice && <small>{product.oldPrice} BYN</small>}</strong>
              <div className="adminProductFlags">
                <i className={product.status === 'draft' ? 'draft' : 'active'}>{product.status === 'draft' ? 'Черновик' : 'Активен'}</i>
                {product.inStock && <i>В наличии</i>}
                {product.isPopular && <i>Популярный</i>}
                {product.isNew && <i>Новинка</i>}
              </div>
              <div className="adminProductActions">
                <Link href={`/catalog/${product.slug}`} title="Открыть товар">Сайт</Link>
                <Link href={`/admin/products/${product.slug}/edit`} title="Редактировать"><EditIcon /></Link>
                <button type="button" onClick={() => remove(product.slug)} title="Удалить"><TrashIcon /></button>
              </div>
            </div>
          ))}
          {!ready && <div className="adminEmpty">Загружаем товары из Supabase...</div>}
          {ready && filtered.length === 0 && <div className="adminEmpty">Товары не найдены</div>}
        </section>
      </main>
    </AdminLayout>
  );
}
