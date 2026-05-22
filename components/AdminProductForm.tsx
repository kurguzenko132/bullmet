'use client';

import Image from 'next/image';
import Link from 'next/link';
import { DragEvent, FormEvent, PointerEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from './AdminLayout';
import { type AdminProduct, productFromForm, readAdminProducts, saveAdminProductAsync } from './adminProductStore';
import { uploadProductImages } from '../lib/productImages';
import { categories, slugifyVariant, type ProductVariant } from './shopData';
import { clampPercent, getImageSettings, imagePosition, normalizeImageDisplaySettings, type ImageDisplaySettings, type ImageFit } from '../lib/imageDisplay';

const fallbackImage = '/assets/cat-clock.jpg';

type PhotoItem = {
  id: string;
  src: string;
  file?: File;
  name?: string;
  settings: Required<ImageDisplaySettings>;
};

type CropTarget = 'catalog' | 'product';

type VariantDraft = {
  id: string;
  name: string;
  colorHex: string;
  photos: PhotoItem[];
};

function AdminPreviewImage({ src, alt, fit = 'cover', position = '50% 50%' }: { src: string; alt: string; fit?: ImageFit; position?: string }) {
  const style = { objectFit: fit, objectPosition: position } as const;
  if (src.startsWith('blob:') || src.startsWith('data:')) return <img src={src} alt={alt} style={style} draggable={false} />;
  return <Image src={src} alt={alt} fill sizes="360px" style={style} draggable={false} />;
}

function makePhotoId(src: string, index: number) {
  return `photo-${index}-${src}`.replace(/[^a-zA-Z0-9_-]/g, '-');
}

function buildInitialPhotos(product?: AdminProduct): PhotoItem[] {
  const images = [product?.image, ...(product?.images ?? [])]
    .filter(Boolean)
    .filter((image, index, array) => array.indexOf(image) === index) as string[];

  const safeImages = images.length ? images : [fallbackImage];

  return safeImages.map((src, index) => {
    const settingsFromProduct = getImageSettings(product ?? {}, src).raw;
    return {
      id: makePhotoId(src, index),
      src,
      name: src.split('/').pop() || `Фото ${index + 1}`,
      settings: settingsFromProduct,
    };
  });
}


function buildInitialVariants(product?: AdminProduct): VariantDraft[] {
  const source = product?.variants?.length ? product.variants : [];
  return source.map((variant, index) => ({
    id: variant.id || `variant-${index}-${variant.slug}`,
    name: variant.name || `Цвет ${index + 1}`,
    colorHex: variant.colorHex || '#111111',
    photos: (variant.images?.length ? variant.images : [variant.image]).filter(Boolean).map((src, photoIndex) => ({
      id: makePhotoId(`${variant.id}-${src}`, photoIndex),
      src,
      name: src.split('/').pop() || `Фото ${photoIndex + 1}`,
      settings: normalizeImageDisplaySettings(variant.imageSettings?.[src] ?? {}),
    })),
  }));
}

function reorderPhotos(items: PhotoItem[], fromId: string, toId: string) {
  if (fromId === toId) return items;
  const fromIndex = items.findIndex((item) => item.id === fromId);
  const toIndex = items.findIndex((item) => item.id === toId);
  if (fromIndex < 0 || toIndex < 0) return items;
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function AdminProductForm({ slug }: { slug?: string }) {
  const router = useRouter();
  const existing = useMemo(() => slug ? readAdminProducts().find((item) => item.slug === slug) : undefined, [slug]);
  const initialPhotos = useMemo(() => buildInitialPhotos(existing), [existing]);

  const [photos, setPhotos] = useState<PhotoItem[]>(initialPhotos);
  const [variants, setVariants] = useState<VariantDraft[]>(() => buildInitialVariants(existing));
  const [selectedPhotoId, setSelectedPhotoId] = useState(initialPhotos[0]?.id ?? '');
  const [uploadError, setUploadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [draggedPhotoId, setDraggedPhotoId] = useState<string | null>(null);
  const [dragOverPhotoId, setDragOverPhotoId] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<CropTarget>('catalog');
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);

  useEffect(() => {
    setPhotos(initialPhotos);
    setSelectedPhotoId(initialPhotos[0]?.id ?? '');
    setVariants(buildInitialVariants(existing));
  }, [initialPhotos, existing]);

  useEffect(() => {
    return () => {
      photos.forEach((photo) => {
        if (photo.src.startsWith('blob:')) URL.revokeObjectURL(photo.src);
      });
    };
  }, []);

  const selectedPhoto = photos.find((photo) => photo.id === selectedPhotoId) ?? photos[0];
  const currentPreview = selectedPhoto?.src ?? photos[0]?.src ?? fallbackImage;
  const selectedSettings = selectedPhoto?.settings ?? normalizeImageDisplaySettings({});

  function updatePhotoSettings(photoId: string, patch: Partial<ImageDisplaySettings>) {
    setPhotos((items) => items.map((photo) => photo.id === photoId ? { ...photo, settings: normalizeImageDisplaySettings({ ...photo.settings, ...patch }) } : photo));
  }

  function movePhoto(index: number, direction: -1 | 1) {
    setPhotos((items) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= items.length) return items;
      const next = [...items];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  function removePhoto(index: number) {
    setPhotos((items) => {
      const removed = items[index];
      if (removed?.src.startsWith('blob:')) URL.revokeObjectURL(removed.src);
      const next = items.filter((_, itemIndex) => itemIndex !== index);
      if (!next.length) return [{ id: 'fallback-photo', src: fallbackImage, name: 'Фото по умолчанию', settings: normalizeImageDisplaySettings({}) }];
      if (removed?.id === selectedPhotoId) setSelectedPhotoId(next[0].id);
      return next;
    });
  }

  function addPhotoFiles(fileList: FileList | null) {
    setUploadError('');
    const nextFiles = Array.from(fileList ?? []);
    if (!nextFiles.length) return;

    const nextPhotos = nextFiles.map((file) => ({
      id: `new-${Date.now()}-${file.name}-${file.size}-${Math.random().toString(16).slice(2)}`,
      src: URL.createObjectURL(file),
      file,
      name: file.name,
      settings: normalizeImageDisplaySettings({}),
    }));

    setPhotos((items) => {
      const withoutFallback = items.length === 1 && items[0].src === fallbackImage && !existing ? [] : items;
      const merged = [...withoutFallback, ...nextPhotos];
      if (!selectedPhotoId || !withoutFallback.length) setSelectedPhotoId(merged[0]?.id ?? '');
      return merged;
    });
  }

  function handleDragStart(event: DragEvent<HTMLDivElement>, photoId: string) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', photoId);
    setDraggedPhotoId(photoId);
    setDragOverPhotoId(photoId);
  }

  function handleDragEnter(targetId: string) {
    if (!draggedPhotoId || draggedPhotoId === targetId) return;
    setPhotos((items) => reorderPhotos(items, draggedPhotoId, targetId));
    setDragOverPhotoId(targetId);
  }

  function handleManualReorder(targetId: string) {
    if (!draggedPhotoId || draggedPhotoId === targetId) return;
    setPhotos((items) => reorderPhotos(items, draggedPhotoId, targetId));
    setDragOverPhotoId(targetId);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>, targetId: string) {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData('text/plain') || draggedPhotoId;
    if (!sourceId) return;
    setPhotos((items) => reorderPhotos(items, sourceId, targetId));
    setDraggedPhotoId(null);
    setDragOverPhotoId(null);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>, photoId: string) {
    const target = event.target as HTMLElement;
    if (target.closest('button')) return;
    setDraggedPhotoId(photoId);
    setDragOverPhotoId(photoId);
    setSelectedPhotoId(photoId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!draggedPhotoId) return;
    if (event.pointerType === 'mouse' && event.buttons !== 1) return;
    event.preventDefault();
    const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
    const tile = element?.closest<HTMLElement>('[data-photo-id]');
    const targetId = tile?.dataset.photoId;
    if (targetId) handleManualReorder(targetId);
  }

  function handlePointerUp() {
    setDraggedPhotoId(null);
    setDragOverPhotoId(null);
  }

  function setCropFromPointer(event: PointerEvent<HTMLDivElement>) {
    if (!selectedPhoto) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = clampPercent(((event.clientX - rect.left) / rect.width) * 100);
    const y = clampPercent(((event.clientY - rect.top) / rect.height) * 100);
    updatePhotoSettings(selectedPhoto.id, cropTarget === 'catalog' ? { catalogX: x, catalogY: y } : { productX: x, productY: y });
  }


  function addVariant() {
    setVariants((items) => [...items, { id: `variant-${Date.now()}-${Math.random().toString(16).slice(2)}`, name: `Цвет ${items.length + 1}`, colorHex: '#111111', photos: [] }]);
  }

  function updateVariant(id: string, patch: Partial<Omit<VariantDraft, 'photos'>>) {
    setVariants((items) => items.map((variant) => variant.id === id ? { ...variant, ...patch } : variant));
  }

  function removeVariant(id: string) {
    setVariants((items) => items.filter((variant) => variant.id !== id));
  }

  function addVariantFiles(id: string, fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (!files.length) return;
    const nextPhotos = files.map((file) => ({
      id: `variant-photo-${Date.now()}-${file.name}-${Math.random().toString(16).slice(2)}`,
      src: URL.createObjectURL(file),
      file,
      name: file.name,
      settings: normalizeImageDisplaySettings({}),
    }));
    setVariants((items) => items.map((variant) => variant.id === id ? { ...variant, photos: [...variant.photos, ...nextPhotos] } : variant));
  }

  function moveVariantPhoto(variantId: string, index: number, direction: -1 | 1) {
    setVariants((items) => items.map((variant) => {
      if (variant.id !== variantId) return variant;
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= variant.photos.length) return variant;
      const photosNext = [...variant.photos];
      [photosNext[index], photosNext[nextIndex]] = [photosNext[nextIndex], photosNext[index]];
      return { ...variant, photos: photosNext };
    }));
  }

  function removeVariantPhoto(variantId: string, index: number) {
    setVariants((items) => items.map((variant) => variant.id === variantId ? { ...variant, photos: variant.photos.filter((_, photoIndex) => photoIndex !== index) } : variant));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploadError('');
    setIsSaving(true);

    try {
      const formData = new FormData(event.currentTarget);
      const product = productFromForm(formData, existing);
      const uploadItems = photos.filter((photo) => photo.file);
      const uploadedImages = uploadItems.length ? await uploadProductImages(product.slug, uploadItems.map((photo) => photo.file as File)) : [];
      let uploadIndex = 0;
      const imageSettings: Record<string, ImageDisplaySettings> = {};
      const orderedImages = photos
        .map((photo) => {
          const url = photo.file ? uploadedImages[uploadIndex++] : photo.src;
          if (url) imageSettings[url] = photo.settings;
          return url;
        })
        .filter((item, index, array): item is string => Boolean(item) && array.indexOf(item) === index);

      product.image = orderedImages[0] ?? product.image;
      product.images = orderedImages.length ? orderedImages : [product.image];
      product.imageSettings = imageSettings;
      const firstSettings = normalizeImageDisplaySettings(imageSettings[product.image]);
      product.catalogImageFit = firstSettings.catalogFit;
      product.catalogImagePosition = imagePosition(firstSettings.catalogX, firstSettings.catalogY);
      product.productImageFit = firstSettings.productFit;
      product.productImagePosition = imagePosition(firstSettings.productX, firstSettings.productY);

      const savedVariants: ProductVariant[] = [];
      for (const variant of variants) {
        const name = variant.name.trim();
        if (!name) continue;
        const files = variant.photos.filter((photo) => photo.file).map((photo) => photo.file as File);
        const uploaded = files.length ? await uploadProductImages(`${product.slug}/${slugifyVariant(name)}`, files) : [];
        let uploadedIndex = 0;
        const variantSettings: Record<string, ImageDisplaySettings> = {};
        const variantImages = variant.photos
          .map((photo) => {
            const url = photo.file ? uploaded[uploadedIndex++] : photo.src;
            if (url) variantSettings[url] = photo.settings;
            return url;
          })
          .filter((item, index, array): item is string => Boolean(item) && array.indexOf(item) === index);
        if (!variantImages.length) continue;
        const firstVariantSettings = normalizeImageDisplaySettings(variantSettings[variantImages[0]]);
        savedVariants.push({
          id: variant.id,
          name,
          slug: slugifyVariant(name),
          colorHex: variant.colorHex || '#111111',
          image: variantImages[0],
          images: variantImages,
          imageSettings: variantSettings,
          catalogImageFit: firstVariantSettings.catalogFit,
          catalogImagePosition: imagePosition(firstVariantSettings.catalogX, firstVariantSettings.catalogY),
          productImageFit: firstVariantSettings.productFit,
          productImagePosition: imagePosition(firstVariantSettings.productX, firstVariantSettings.productY),
        });
      }
      product.variants = savedVariants;

      await saveAdminProductAsync(product);
      router.push('/admin/products');
    } catch (error) {
      console.error(error);
      setUploadError(error instanceof Error ? error.message : 'Не удалось сохранить фото товара.');
    } finally {
      setIsSaving(false);
    }
  }

  const title = existing ? 'Редактировать товар' : 'Добавить товар';
  const catalogPosition = imagePosition(selectedSettings.catalogX, selectedSettings.catalogY);
  const productPosition = imagePosition(selectedSettings.productX, selectedSettings.productY);
  const activeFit = cropTarget === 'catalog' ? selectedSettings.catalogFit : selectedSettings.productFit;
  const activePosition = cropTarget === 'catalog' ? catalogPosition : productPosition;

  return (
    <AdminLayout title={title}>
      <main className="adminContent adminProductEditPage">
        <div className="adminPageHead">
          <div><p>Контент / Каталог товаров</p><h2>{title}</h2></div>
          <Link className="adminSecondaryBtn" href="/admin/products">Назад к товарам</Link>
        </div>

        <form className="adminProductForm" onSubmit={submit}>
          <section className="adminCard adminProductFormMain">
            <h3>Основная информация</h3>
            <div className="adminFormGrid">
              <label>Название товара<input name="title" defaultValue={existing?.title} required placeholder="Настенные часы Loft" /></label>
              <label>Категория<select name="category" defaultValue={existing?.category ?? categories[0]}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label>Цена, BYN<input name="price" type="number" min="0" defaultValue={existing?.price ?? 120} /></label>
              <label>Старая цена, BYN<input name="oldPrice" type="number" min="0" defaultValue={existing?.oldPrice ?? ''} placeholder="Для псевдо-скидки" /></label>
              <label>Материал<input name="material" defaultValue={existing?.material ?? 'Металл + дерево'} /></label>
              <label>Краткое описание<input name="short" defaultValue={existing?.short ?? 'Металл · дерево'} /></label>
            </div>
            <label className="adminFullLabel">Описание<textarea name="description" rows={5} defaultValue={existing?.description ?? 'Описание товара Bullmet.'} /></label>
            <div className="adminFormGrid adminFormGrid--two">
              <label>Размеры через запятую<input name="sizes" defaultValue={(existing?.sizes ?? ['40 см', '60 см', '80 см']).join(', ')} /></label>
              <label>Статус<select name="status" defaultValue={existing?.status ?? 'active'}><option value="active">Активен</option><option value="draft">Черновик</option></select></label>
            </div>
            <label className="adminFullLabel">Характеристики, каждая с новой строки<textarea name="specs" rows={5} defaultValue={(existing?.specs ?? ['Материал: металл, дерево', 'Покрытие: порошковая покраска', 'Крепление в комплекте']).join('\n')} /></label>
          </section>

          <aside className="adminCard adminProductMedia">
            <h3>Фото товара</h3>
            <div className="adminImagePreview"><AdminPreviewImage src={photos[0]?.src ?? fallbackImage} alt="Главное фото" fit={photos[0]?.settings.catalogFit} position={imagePosition(photos[0]?.settings.catalogX, photos[0]?.settings.catalogY)} /></div>
            <input type="hidden" name="image" value={photos[0]?.src ?? fallbackImage} />
            <input type="hidden" name="images" value={photos.map((photo) => photo.src).join('\n')} />

            <label className="adminUploadBox">Загрузить новые фото
              <input type="file" accept="image/*" multiple onChange={(event) => { addPhotoFiles(event.target.files); event.currentTarget.value = ''; }} />
              <span>JPG, PNG, WEBP · можно выбрать несколько.</span>
            </label>

            <div className="adminPhotoManager">
              <div className="adminPhotoManager__head">
                <b>Фотографии товара</b>
                <span>Перетаскивай миниатюры мышкой или пальцем. Первая миниатюра — основное фото.</span>
              </div>
              <div className="adminPhotoGrid" onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}>
                {photos.map((photo, index) => {
                  const position = imagePosition(photo.settings.catalogX, photo.settings.catalogY);
                  return (
                    <div
                      className={`adminPhotoTile ${selectedPhotoId === photo.id ? 'isSelected' : ''} ${draggedPhotoId === photo.id ? 'isDragging' : ''} ${dragOverPhotoId === photo.id && draggedPhotoId !== photo.id ? 'isDragOver' : ''}`}
                      key={photo.id}
                      data-photo-id={photo.id}
                      draggable
                      onClick={() => setSelectedPhotoId(photo.id)}
                      onDragStart={(event) => handleDragStart(event, photo.id)}
                      onDragOver={(event) => { event.preventDefault(); setDragOverPhotoId(photo.id); }}
                      onDragEnter={() => handleDragEnter(photo.id)}
                      onDrop={(event) => handleDrop(event, photo.id)}
                      onDragEnd={() => { setDraggedPhotoId(null); setDragOverPhotoId(null); }}
                      onPointerDown={(event) => { handlePointerDown(event, photo.id); event.currentTarget.setPointerCapture?.(event.pointerId); }}
                    >
                      <div className="adminPhotoTile__image"><AdminPreviewImage src={photo.src} alt={`Фото товара ${index + 1}`} fit={photo.settings.catalogFit} position={position} /></div>
                      <div className="adminPhotoTile__meta"><span>{index === 0 ? 'Основное' : `Фото ${index + 1}`}</span>{photo.file && <em>Новое</em>}</div>
                      <div className="adminPhotoTile__actions">
                        <button type="button" onClick={() => movePhoto(index, -1)} disabled={index === 0}>←</button>
                        <button type="button" onClick={() => movePhoto(index, 1)} disabled={index === photos.length - 1}>→</button>
                        <button type="button" onClick={() => removePhoto(index)}>Удалить</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedPhoto && (
              <div className="adminImageTuning adminImageTuning--compact">
                <h4>Настройка выбранного фото</h4>
                <p>Выбрано: <b>{selectedPhoto.name || 'Фото товара'}</b>. Порядок и кадр сохраняются отдельно для каждой фотографии.</p>
                <div className="adminSelectedPreviewGrid">
                  <div className="adminSelectedPreview"><AdminPreviewImage src={currentPreview} alt="В каталоге" fit={selectedSettings.catalogFit} position={catalogPosition} /><span>Каталог</span></div>
                  <div className="adminSelectedPreview adminSelectedPreview--product"><AdminPreviewImage src={currentPreview} alt="В карточке" fit={selectedSettings.productFit} position={productPosition} /><span>Страница товара</span></div>
                </div>
                <button className="adminPrimaryBtn adminCropOpenBtn" type="button" onClick={() => setCropModalOpen(true)}>Настроить кадр</button>
              </div>
            )}

            {selectedPhoto && cropModalOpen && (
              <div className="adminCropModal" role="dialog" aria-modal="true">
                <div className="adminCropModal__overlay" onClick={() => setCropModalOpen(false)} />
                <div className="adminCropModal__panel">
                  <div className="adminCropModal__head">
                    <div>
                      <h3>Настройка фото</h3>
                      <p>{selectedPhoto.name || 'Фото товара'}</p>
                    </div>
                    <button type="button" onClick={() => setCropModalOpen(false)}>×</button>
                  </div>
                  <div className="adminCropTabs">
                    <button type="button" className={cropTarget === 'catalog' ? 'active' : ''} onClick={() => setCropTarget('catalog')}>Карточка каталога</button>
                    <button type="button" className={cropTarget === 'product' ? 'active' : ''} onClick={() => setCropTarget('product')}>Страница товара</button>
                  </div>
                  <div className="adminCropWorkbench adminCropWorkbench--modal">
                    <div className={`adminCropPreview ${cropTarget === 'product' ? 'adminCropPreview--product' : ''}`}
                      onPointerDown={(event) => { setIsDraggingCrop(true); setCropFromPointer(event); event.currentTarget.setPointerCapture?.(event.pointerId); }}
                      onPointerMove={(event) => { if (isDraggingCrop) setCropFromPointer(event); }}
                      onPointerUp={() => setIsDraggingCrop(false)}
                      onPointerCancel={() => setIsDraggingCrop(false)}
                    >
                      <AdminPreviewImage src={currentPreview} alt="Настройка кадра" fit={activeFit} position={activePosition} />
                      <span className="adminCropPoint" style={{ left: `${cropTarget === 'catalog' ? selectedSettings.catalogX : selectedSettings.productX}%`, top: `${cropTarget === 'catalog' ? selectedSettings.catalogY : selectedSettings.productY}%` }} />
                    </div>
                    <div className="adminCropControls">
                      <label>Масштаб
                        <select value={cropTarget === 'catalog' ? selectedSettings.catalogFit : selectedSettings.productFit} onChange={(event) => updatePhotoSettings(selectedPhoto.id, cropTarget === 'catalog' ? { catalogFit: event.target.value as ImageFit } : { productFit: event.target.value as ImageFit })}>
                          <option value="cover">Заполнить область</option>
                          <option value="contain">Показать целиком</option>
                        </select>
                      </label>
                      <label>Положение по горизонтали
                        <input type="range" min="0" max="100" value={cropTarget === 'catalog' ? selectedSettings.catalogX : selectedSettings.productX} onChange={(event) => updatePhotoSettings(selectedPhoto.id, cropTarget === 'catalog' ? { catalogX: Number(event.target.value) } : { productX: Number(event.target.value) })} />
                      </label>
                      <label>Положение по вертикали
                        <input type="range" min="0" max="100" value={cropTarget === 'catalog' ? selectedSettings.catalogY : selectedSettings.productY} onChange={(event) => updatePhotoSettings(selectedPhoto.id, cropTarget === 'catalog' ? { catalogY: Number(event.target.value) } : { productY: Number(event.target.value) })} />
                      </label>
                      <small>Двигай оранжевую точку на большом превью мышкой или пальцем. Справа сразу видно, какое положение сохранится.</small>
                      <div className="adminCropLivePair">
                        <div><AdminPreviewImage src={currentPreview} alt="Каталог" fit={selectedSettings.catalogFit} position={catalogPosition} /><span>Каталог</span></div>
                        <div><AdminPreviewImage src={currentPreview} alt="Карточка" fit={selectedSettings.productFit} position={productPosition} /><span>Карточка</span></div>
                      </div>
                    </div>
                  </div>
                  <div className="adminCropModal__foot">
                    <button className="adminSecondaryBtn" type="button" onClick={() => setCropModalOpen(false)}>Готово</button>
                  </div>
                </div>
              </div>
            )}


            <div className="adminVariantManager">
              <div className="adminPhotoManager__head">
                <b>Расцветки товара</b>
                <span>Каждая расцветка появится в каталоге отдельной карточкой. На странице товара покупатель сможет переключать цвет, и фотографии будут меняться.</span>
              </div>
              {variants.map((variant, variantIndex) => (
                <div className="adminVariantCard" key={variant.id}>
                  <div className="adminVariantCard__top">
                    <label>Название цвета<input value={variant.name} onChange={(event) => updateVariant(variant.id, { name: event.target.value })} placeholder="Черный / белый / дерево" /></label>
                    <label>Цвет маркера<input type="color" value={variant.colorHex} onChange={(event) => updateVariant(variant.id, { colorHex: event.target.value })} /></label>
                    <button type="button" className="adminSecondaryBtn" onClick={() => removeVariant(variant.id)}>Удалить цвет</button>
                  </div>
                  <label className="adminUploadBox adminUploadBox--small">Загрузить фото цвета
                    <input type="file" accept="image/*" multiple onChange={(event) => { addVariantFiles(variant.id, event.target.files); event.currentTarget.value = ''; }} />
                    <span>Можно выбрать несколько фото для этой расцветки.</span>
                  </label>
                  <div className="adminVariantPhotos">
                    {variant.photos.length ? variant.photos.map((photo, photoIndex) => (
                      <div className="adminVariantPhotoTile" key={photo.id}>
                        <div><AdminPreviewImage src={photo.src} alt={`${variant.name} ${photoIndex + 1}`} fit={photo.settings.catalogFit} position={imagePosition(photo.settings.catalogX, photo.settings.catalogY)} /></div>
                        <span>{photoIndex === 0 ? 'Главное' : `Фото ${photoIndex + 1}`}</span>
                        <p>
                          <button type="button" onClick={() => moveVariantPhoto(variant.id, photoIndex, -1)} disabled={photoIndex === 0}>←</button>
                          <button type="button" onClick={() => moveVariantPhoto(variant.id, photoIndex, 1)} disabled={photoIndex === variant.photos.length - 1}>→</button>
                          <button type="button" onClick={() => removeVariantPhoto(variant.id, photoIndex)}>×</button>
                        </p>
                      </div>
                    )) : <em>Фото для этого цвета пока не загружены.</em>}
                  </div>
                </div>
              ))}
              <button className="adminPrimaryBtn" type="button" onClick={addVariant}>Добавить расцветку</button>
            </div>

            {uploadError && <p className="adminUploadError">{uploadError}</p>}
            <div className="adminCheckList">
              <label><input name="inStock" type="checkbox" defaultChecked={existing?.inStock ?? true} /> В наличии</label>
              <label><input name="isPopular" type="checkbox" defaultChecked={existing?.isPopular ?? false} /> Популярный товар</label>
              <label><input name="isNew" type="checkbox" defaultChecked={existing?.isNew ?? false} /> Новинка</label>
            </div>
            <button className="adminPrimaryBtn adminProductSave" type="submit" disabled={isSaving}>{isSaving ? 'Сохраняем...' : 'Сохранить товар'}</button>
          </aside>
        </form>
      </main>
    </AdminLayout>
  );
}
