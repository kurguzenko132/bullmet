'use client';

import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { CatalogProduct, ImageDisplaySettings } from '@/lib/products';

type ProductForm = {
  id?: string;
  title: string;
  slug: string;
  category: string;
  clock_theme: string;
  material: string;
  short: string;
  description: string;
  price: string;
  old_price: string;
  status: 'active' | 'draft';
  in_stock: boolean;
  is_popular: boolean;
  is_new: boolean;
  sizes: string;
  specs: string;
  images: string[];
  color_group_id: string;
  color_name: string;
  color_hex: string;
  catalog_image_fit: 'cover' | 'contain';
  product_image_fit: 'cover' | 'contain';
  catalog_image_position: string;
  product_image_position: string;
  image_settings: Record<string, ImageDisplaySettings>;
};

const defaultImageSetting: Required<ImageDisplaySettings> = {
  catalogFit: 'cover',
  catalogX: 50,
  catalogY: 50,
  catalogZoom: 1,
  productFit: 'contain',
  productX: 50,
  productY: 50,
  productZoom: 1
};

const emptyForm: ProductForm = {
  title: '',
  slug: '',
  category: 'Настенные часы',
  clock_theme: '',
  material: 'Металл с элементами дерева',
  short: '',
  description: '',
  price: '',
  old_price: '',
  status: 'active',
  in_stock: true,
  is_popular: false,
  is_new: false,
  sizes: '40 см, 60 см, 80 см',
  specs: 'Размер: под заказ\nМатериал: металл с элементами дерева\nПокрытие: порошковая покраска\nИзготовление: Bullmet',
  images: [],
  color_group_id: '',
  color_name: '',
  color_hex: '#111111',
  catalog_image_fit: 'cover',
  product_image_fit: 'contain',
  catalog_image_position: 'center center',
  product_image_position: 'center center',
  image_settings: {}
};

function slugify(value: string) {
  const map: Record<string, string> = { а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya' };
  return value.toLowerCase().split('').map((char) => map[char] ?? char).join('').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

function csv(value: string) {
  return value.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean);
}

function parseImageSettings(value: unknown): Record<string, ImageDisplaySettings> {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) return value as Record<string, ImageDisplaySettings>;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, ImageDisplaySettings>;
    } catch {}
  }
  return {};
}

function normalizeSetting(value?: ImageDisplaySettings): Required<ImageDisplaySettings> {
  return {
    ...defaultImageSetting,
    ...(value || {}),
    catalogFit: value?.catalogFit === 'contain' ? 'contain' : 'cover',
    productFit: value?.productFit === 'cover' ? 'cover' : 'contain',
    catalogX: Number.isFinite(Number(value?.catalogX)) ? Number(value?.catalogX) : 50,
    catalogY: Number.isFinite(Number(value?.catalogY)) ? Number(value?.catalogY) : 50,
    productX: Number.isFinite(Number(value?.productX)) ? Number(value?.productX) : 50,
    productY: Number.isFinite(Number(value?.productY)) ? Number(value?.productY) : 50,
    catalogZoom: Number.isFinite(Number(value?.catalogZoom)) ? Number(value?.catalogZoom) : 1,
    productZoom: Number.isFinite(Number(value?.productZoom)) ? Number(value?.productZoom) : 1
  };
}

function styleFromSettings(settings: Required<ImageDisplaySettings>, scope: 'catalog' | 'product') {
  const fit = scope === 'catalog' ? settings.catalogFit : settings.productFit;
  const x = scope === 'catalog' ? settings.catalogX : settings.productX;
  const y = scope === 'catalog' ? settings.catalogY : settings.productY;
  const zoom = scope === 'catalog' ? settings.catalogZoom : settings.productZoom;
  return {
    objectFit: fit,
    objectPosition: `${x}% ${y}%`,
    transform: `scale(${zoom})`
  } as const;
}

function productToForm(product: CatalogProduct): ProductForm {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    category: product.category || 'Настенные часы',
    clock_theme: product.clockTheme || '',
    material: product.material || 'Металл с элементами дерева',
    short: product.short || '',
    description: product.description || '',
    price: String(product.price || ''),
    old_price: product.oldPrice ? String(product.oldPrice) : '',
    status: product.status === 'draft' ? 'draft' : 'active',
    in_stock: product.inStock !== false,
    is_popular: Boolean(product.isPopular),
    is_new: Boolean(product.isNew),
    sizes: (product.sizes || []).join(', '),
    specs: (product.specs || []).join('\n'),
    images: product.images?.length ? product.images : [product.image].filter(Boolean),
    color_group_id: product.colorGroupId || '',
    color_name: product.colorName || '',
    color_hex: product.colorHex || '#111111',
    catalog_image_fit: product.catalogImageFit || 'cover',
    product_image_fit: product.productImageFit || 'contain',
    catalog_image_position: product.catalogImagePosition || 'center center',
    product_image_position: product.productImagePosition || 'center center',
    image_settings: product.imageSettings || {}
  };
}

export function AdminProductsClient({ initialProducts }: { initialProducts: CatalogProduct[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const activeImage = selectedImage || form.images[0] || '';
  const activeSettings = normalizeSetting(activeImage ? form.image_settings[activeImage] : form.image_settings.__global);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return products;
    return products.filter((product) => [product.title, product.slug, product.category, product.colorGroupId].join(' ').toLowerCase().includes(q));
  }, [products, query]);

  const sameGroup = useMemo(() => {
    if (!form.color_group_id) return [];
    return products.filter((product) => product.colorGroupId === form.color_group_id);
  }, [products, form.color_group_id]);

  function patch<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function patchImages(nextImages: string[]) {
    patch('images', nextImages);
    if (!nextImages.includes(selectedImage)) setSelectedImage(nextImages[0] || '');
  }

  function patchActiveImageSetting(partial: Partial<ImageDisplaySettings>) {
    const key = activeImage || '__global';
    setForm((current) => ({
      ...current,
      image_settings: {
        ...current.image_settings,
        [key]: { ...normalizeSetting(current.image_settings[key]), ...partial }
      }
    }));
  }

  function applySettingsToAllImages() {
    const current = normalizeSetting(activeImage ? form.image_settings[activeImage] : form.image_settings.__global);
    const next = { ...form.image_settings };
    form.images.forEach((image) => { next[image] = current; });
    patch('image_settings', next);
    setMessage('Настройки кадрирования применены ко всем фото товара.');
  }

  function resetActiveImageSettings() {
    const key = activeImage || '__global';
    setForm((current) => {
      const next = { ...current.image_settings };
      delete next[key];
      return { ...current, image_settings: next };
    });
  }

  function startNew() {
    setForm({ ...emptyForm, color_group_id: `group-${Date.now()}` });
    setSelectedImage('');
    setMessage('Создана пустая карточка. Заполните данные и нажмите “Сохранить товар”.');
  }

  function edit(product: CatalogProduct) {
    const next = productToForm(product);
    setForm(next);
    setSelectedImage(next.images[0] || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function duplicate(product: CatalogProduct) {
    const next = productToForm(product);
    const title = `${next.title} копия`;
    setForm({ ...next, id: undefined, title, slug: slugify(title), color_name: next.color_name ? `${next.color_name} копия` : '' });
    setSelectedImage(next.images[0] || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function reload() {
    if (!supabase) return;
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) {
      const next = data.map((row: any) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        category: row.category,
        clockTheme: row.clock_theme,
        material: row.material,
        short: row.short,
        description: row.description,
        price: Number(row.price || 0),
        oldPrice: row.old_price ? Number(row.old_price) : undefined,
        image: row.image || row.images?.[0] || '/assets/prod-clock-loft.jpg',
        images: Array.isArray(row.images) && row.images.length ? row.images : [row.image].filter(Boolean),
        sizes: Array.isArray(row.sizes) ? row.sizes : [],
        specs: Array.isArray(row.specs) ? row.specs : [],
        status: row.status,
        inStock: row.in_stock !== false,
        isPopular: Boolean(row.is_popular),
        isNew: Boolean(row.is_new),
        catalogImageFit: row.catalog_image_fit || 'cover',
        productImageFit: row.product_image_fit || 'contain',
        catalogImagePosition: row.catalog_image_position || 'center center',
        productImagePosition: row.product_image_position || 'center center',
        imageSettings: parseImageSettings(row.image_settings),
        colorGroupId: row.color_group_id,
        colorName: row.color_name,
        colorHex: row.color_hex
      })) as CatalogProduct[];
      setProducts(next);
    }
  }

  async function uploadImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    if (!supabase) {
      setMessage('Supabase не подключен. Загрузка фото недоступна.');
      return;
    }
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-');
      const path = `${form.slug || slugify(form.title) || 'product'}/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage.from(process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_IMAGES_BUCKET || 'product-images').upload(path, file, { upsert: true });
      if (error) {
        setMessage(error.message);
        continue;
      }
      const { data } = supabase.storage.from(process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_IMAGES_BUCKET || 'product-images').getPublicUrl(path);
      if (data.publicUrl) uploaded.push(data.publicUrl);
    }
    const nextImages = [...form.images, ...uploaded];
    patchImages(nextImages);
    if (!selectedImage && nextImages[0]) setSelectedImage(nextImages[0]);
    setUploading(false);
    setMessage(uploaded.length ? `Загружено фото: ${uploaded.length}` : 'Фото не загрузились. Проверь политики Storage.');
  }

  function onImageDrop(event: DragEvent<HTMLElement>, dropIndex: number) {
    event.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) return;
    const next = [...form.images];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(dropIndex, 0, moved);
    patchImages(next);
    setDragIndex(null);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    if (!supabase) {
      setMessage('Supabase не подключен. Добавь переменные окружения.');
      return;
    }
    setLoading(true);
    const normalizedSlug = form.slug || slugify(form.title);
    const images = form.images.map((item) => item.trim()).filter(Boolean);
    const mainSettings = images[0] ? normalizeSetting(form.image_settings[images[0]]) : defaultImageSetting;
    const payload = {
      slug: normalizedSlug,
      title: form.title.trim(),
      category: form.category.trim(),
      clock_theme: form.clock_theme.trim() || null,
      material: form.material.trim(),
      short: form.short.trim(),
      description: form.description.trim(),
      price: Number(form.price || 0),
      old_price: form.old_price ? Number(form.old_price) : null,
      image: images[0] || '/assets/prod-clock-loft.jpg',
      images,
      sizes: csv(form.sizes),
      specs: csv(form.specs),
      status: form.status,
      in_stock: form.in_stock,
      is_popular: form.is_popular,
      is_new: form.is_new,
      catalog_image_fit: mainSettings.catalogFit || form.catalog_image_fit,
      product_image_fit: mainSettings.productFit || form.product_image_fit,
      catalog_image_position: `${mainSettings.catalogX}% ${mainSettings.catalogY}%`,
      product_image_position: `${mainSettings.productX}% ${mainSettings.productY}%`,
      image_settings: form.image_settings,
      color_group_id: form.color_group_id.trim() || null,
      color_name: form.color_name.trim() || null,
      color_hex: form.color_hex || null
    };
    const request = form.id
      ? supabase.from('products').update(payload).eq('id', form.id)
      : supabase.from('products').insert(payload).select('id').single();
    const { error, data } = await request as any;
    setLoading(false);
    if (error) {
      setMessage(error.message.includes('image_settings') ? `${error.message}. Выполни SQL-миграцию из database/product-image-settings-migration.sql.` : error.message);
      return;
    }
    if (data?.id) setForm((current) => ({ ...current, id: data.id, slug: normalizedSlug }));
    setMessage('Товар сохранен. Фото, кадрирование, цветовые варианты и характеристики обновлены.');
    await reload();
  }

  async function remove(product: CatalogProduct) {
    if (!supabase || !product.id) return;
    if (!confirm(`Удалить товар “${product.title}”?`)) return;
    const { error } = await supabase.from('products').delete().eq('id', product.id);
    if (error) setMessage(error.message);
    else {
      setMessage('Товар удален.');
      await reload();
    }
  }

  useEffect(() => {
    if (!form.slug && form.title) patch('slug', slugify(form.title));
  }, [form.title]);

  useEffect(() => {
    if (!selectedImage && form.images[0]) setSelectedImage(form.images[0]);
  }, [form.images, selectedImage]);

  return (
    <div className="admin-products-pro admin-products-pro--premium">
      <div className="admin-page-head admin-page-head--premium">
        <div>
          <p>Интернет-магазин</p>
          <h1>Товары, фото и варианты</h1>
          <span>Управляйте товарами, группами цвета, кадрированием, порядком фото и отображением в каталоге/карточке.</span>
        </div>
        <div className="admin-head-actions">
          <button type="button" onClick={startNew}>Добавить товар</button>
          <button type="button" onClick={reload}>Обновить из базы</button>
        </div>
      </div>

      {message && <div className="admin-message">{message}</div>}

      <section className="admin-product-editor admin-product-editor--premium">
        <form onSubmit={save} className="admin-product-form admin-product-form--premium">
          <div className="admin-card-title"><h2>{form.id ? 'Редактирование товара' : 'Новый товар'}</h2><span>{form.id ? `ID: ${form.id}` : 'Сохранится в Supabase products'}</span></div>
          <div className="admin-form-grid">
            <label>Название<input value={form.title} onChange={(e) => patch('title', e.target.value)} required /></label>
            <label>Slug<input value={form.slug} onChange={(e) => patch('slug', slugify(e.target.value))} required /></label>
            <label>Категория<input value={form.category} onChange={(e) => patch('category', e.target.value)} /></label>
            <label>Тема часов<input value={form.clock_theme} onChange={(e) => patch('clock_theme', e.target.value)} placeholder="Авто-мир / Классика / Спорт" /></label>
            <label>Цена<input value={form.price} onChange={(e) => patch('price', e.target.value)} inputMode="decimal" /></label>
            <label>Старая цена<input value={form.old_price} onChange={(e) => patch('old_price', e.target.value)} inputMode="decimal" /></label>
            <label>Материал<input value={form.material} onChange={(e) => patch('material', e.target.value)} /></label>
            <label>Статус<select value={form.status} onChange={(e) => patch('status', e.target.value as ProductForm['status'])}><option value="active">Активен</option><option value="draft">Черновик</option></select></label>
            <label className="admin-wide">Краткое описание<textarea value={form.short} onChange={(e) => patch('short', e.target.value)} rows={2} /></label>
            <label className="admin-wide">Полное описание<textarea value={form.description} onChange={(e) => patch('description', e.target.value)} rows={4} /></label>
            <label>Размеры / варианты<input value={form.sizes} onChange={(e) => patch('sizes', e.target.value)} /></label>
            <label>Характеристики<textarea value={form.specs} onChange={(e) => patch('specs', e.target.value)} rows={4} /></label>
          </div>
          <div className="admin-checks">
            <label><input type="checkbox" checked={form.in_stock} onChange={(e) => patch('in_stock', e.target.checked)} /> В наличии / под заказ</label>
            <label><input type="checkbox" checked={form.is_popular} onChange={(e) => patch('is_popular', e.target.checked)} /> Популярное</label>
            <label><input type="checkbox" checked={form.is_new} onChange={(e) => patch('is_new', e.target.checked)} /> Новинка</label>
          </div>

          <div className="admin-color-box">
            <h3>Группа цвета / варианты одной модели</h3>
            <div className="admin-form-grid three">
              <label>Color group ID<input value={form.color_group_id} onChange={(e) => patch('color_group_id', e.target.value)} placeholder="clock-volna" /></label>
              <label>Название цвета<input value={form.color_name} onChange={(e) => patch('color_name', e.target.value)} placeholder="Черный / Белый / Серый" /></label>
              <label>Цвет<input type="color" value={form.color_hex} onChange={(e) => patch('color_hex', e.target.value)} /></label>
            </div>
            <p>Все товары с одинаковым <b>color_group_id</b> автоматически станут переключателями цвета на странице карточки товара.</p>
            {!!sameGroup.length && (
              <div className="admin-variant-pills">
                {sameGroup.map((item) => (
                  <Link href={`/product/${item.slug}`} key={item.slug} target="_blank">
                    <img src={item.image} alt={item.colorName || item.title} />
                    <span>{item.colorName || item.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="admin-image-manager admin-image-manager--premium">
            <div className="admin-card-title"><h2>Фотографии товара</h2><span>Перетаскивайте фото мышкой. Первое фото — главное.</span></div>
            <input type="file" multiple accept="image/*" onChange={uploadImages} />
            {uploading && <p>Загружаю фото...</p>}
            <textarea value={form.images.join('\n')} onChange={(e) => patchImages(e.target.value.split('\n').map((x) => x.trim()).filter(Boolean))} rows={4} placeholder="Можно вставить ссылки вручную, каждая с новой строки" />
            <div className="admin-image-grid admin-image-grid--sortable">
              {form.images.map((image, index) => {
                const settings = normalizeSetting(form.image_settings[image]);
                return (
                  <article
                    key={`${image}-${index}`}
                    draggable
                    onDragStart={() => setDragIndex(index)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => onImageDrop(event, index)}
                    onClick={() => setSelectedImage(image)}
                    className={`${selectedImage === image ? 'is-selected' : ''} ${dragIndex === index ? 'is-dragging' : ''}`}
                  >
                    <div className="sortable-image-preview"><img src={image} alt="" style={styleFromSettings(settings, 'catalog')} /></div>
                    <div><b>{index === 0 ? 'Главное фото' : `Фото ${index + 1}`}</b><span>{image}</span></div>
                    <div className="admin-image-actions"><button type="button" onClick={(event) => { event.stopPropagation(); patchImages(form.images.filter((_, i) => i !== index)); }}>×</button></div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="admin-crop-studio">
            <div className="admin-card-title">
              <h2>Кадрирование фото</h2>
              <span>Выберите фото выше и настройте отображение отдельно для каталога и карточки товара.</span>
            </div>
            {activeImage ? (
              <div className="crop-studio-grid">
                <div className="crop-previews">
                  <div>
                    <b>Каталог</b>
                    <div className="crop-preview crop-preview--catalog"><img src={activeImage} alt="Превью каталога" style={styleFromSettings(activeSettings, 'catalog')} /></div>
                  </div>
                  <div>
                    <b>Карточка товара</b>
                    <div className="crop-preview crop-preview--product"><img src={activeImage} alt="Превью карточки" style={styleFromSettings(activeSettings, 'product')} /></div>
                  </div>
                </div>

                <div className="crop-controls">
                  <h3>Каталог</h3>
                  <label>Режим<select value={activeSettings.catalogFit} onChange={(e) => patchActiveImageSetting({ catalogFit: e.target.value as 'cover' | 'contain' })}><option value="cover">Заполнить карточку</option><option value="contain">Показать целиком</option></select></label>
                  <label>Увеличение: {activeSettings.catalogZoom.toFixed(2)}×<input type="range" min="1" max="2.5" step="0.01" value={activeSettings.catalogZoom} onChange={(e) => patchActiveImageSetting({ catalogZoom: Number(e.target.value) })} /></label>
                  <label>Позиция X: {activeSettings.catalogX}%<input type="range" min="0" max="100" value={activeSettings.catalogX} onChange={(e) => patchActiveImageSetting({ catalogX: Number(e.target.value) })} /></label>
                  <label>Позиция Y: {activeSettings.catalogY}%<input type="range" min="0" max="100" value={activeSettings.catalogY} onChange={(e) => patchActiveImageSetting({ catalogY: Number(e.target.value) })} /></label>

                  <h3>Карточка товара</h3>
                  <label>Режим<select value={activeSettings.productFit} onChange={(e) => patchActiveImageSetting({ productFit: e.target.value as 'cover' | 'contain' })}><option value="contain">Показать целиком</option><option value="cover">Заполнить блок</option></select></label>
                  <label>Увеличение: {activeSettings.productZoom.toFixed(2)}×<input type="range" min="1" max="2.5" step="0.01" value={activeSettings.productZoom} onChange={(e) => patchActiveImageSetting({ productZoom: Number(e.target.value) })} /></label>
                  <label>Позиция X: {activeSettings.productX}%<input type="range" min="0" max="100" value={activeSettings.productX} onChange={(e) => patchActiveImageSetting({ productX: Number(e.target.value) })} /></label>
                  <label>Позиция Y: {activeSettings.productY}%<input type="range" min="0" max="100" value={activeSettings.productY} onChange={(e) => patchActiveImageSetting({ productY: Number(e.target.value) })} /></label>

                  <div className="crop-actions">
                    <button type="button" onClick={applySettingsToAllImages}>Применить ко всем фото</button>
                    <button type="button" onClick={resetActiveImageSettings}>Сбросить выбранное фото</button>
                  </div>
                </div>
              </div>
            ) : <p className="empty-crop">Добавьте или выберите фото, чтобы открыть кадрирование.</p>}
          </div>

          <div className="admin-form-actions"><button type="submit" disabled={loading}>{loading ? 'Сохраняю...' : 'Сохранить товар'}</button><button type="button" onClick={startNew}>Очистить форму</button></div>
        </form>

        <aside className="admin-product-preview admin-product-preview--premium">
          <h2>Превью карточки</h2>
          <div className="preview-card"><img src={form.images[0] || '/assets/prod-clock-loft.jpg'} alt="" style={form.images[0] ? styleFromSettings(normalizeSetting(form.image_settings[form.images[0]]), 'catalog') : undefined} /><div><p>{form.category}</p><h3>{form.title || 'Название товара'}</h3><span>{form.short || form.material}</span><b>от {form.price || 0} BYN</b></div></div>
          <h2>Товары в базе</h2>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск по товарам" />
          <div className="admin-products-list admin-products-list--premium">
            {filtered.map((product) => (
              <article key={product.slug} className={form.id === product.id ? 'is-active' : ''}>
                <img src={product.image} alt="" />
                <div><b>{product.title}</b><span>{product.category} · {product.price} BYN</span>{product.colorGroupId && <small>Группа: {product.colorGroupId}</small>}</div>
                <button type="button" onClick={() => edit(product)}>✎</button>
                <button type="button" onClick={() => duplicate(product)}>⧉</button>
                <button type="button" onClick={() => remove(product)}>×</button>
              </article>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
