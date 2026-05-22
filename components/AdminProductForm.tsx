'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from './AdminLayout';
import { type AdminProduct, productFromForm, readAdminProducts, saveAdminProductAsync } from './adminProductStore';
import { uploadProductImages } from '../lib/productImages';
import { categories } from './shopData';

const fallbackImages = ['/assets/cat-clock.jpg', '/assets/cat-swing.jpg', '/assets/cat-metal.jpg', '/assets/cat-wood.jpg', '/assets/cat-custom.jpg', '/assets/production.jpg'];

function AdminPreviewImage({ src, alt }: { src: string; alt: string }) {
  if (src.startsWith('blob:') || src.startsWith('data:')) {
    return <img src={src} alt={alt} />;
  }

  return <Image src={src} alt={alt} fill sizes="360px" />;
}

export function AdminProductForm({ slug }: { slug?: string }) {
  const router = useRouter();
  const existing = useMemo(() => slug ? readAdminProducts().find((item) => item.slug === slug) : undefined, [slug]);
  type PhotoItem = { id: string; src: string; file?: File; name?: string };

  const initialPhotos = useMemo(() => {
    const images = [existing?.image, ...(existing?.images ?? [])]
      .filter(Boolean)
      .filter((image, index, array) => array.indexOf(image) === index) as string[];

    return (images.length ? images : [fallbackImages[0]]).map((src, index) => ({
      id: `existing-${index}-${src}`,
      src,
      name: src.split('/').pop() || `Фото ${index + 1}`,
    }));
  }, [existing]);

  const [photos, setPhotos] = useState<PhotoItem[]>(initialPhotos);
  const [uploadError, setUploadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setPhotos(initialPhotos);
  }, [initialPhotos]);

  useEffect(() => {
    return () => {
      photos.forEach((photo) => {
        if (photo.src.startsWith('blob:')) URL.revokeObjectURL(photo.src);
      });
    };
  }, []);

  const currentPreview = photos[0]?.src ?? fallbackImages[0];

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
      return next.length ? next : [{ id: 'fallback-photo', src: fallbackImages[0], name: 'Фото по умолчанию' }];
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
    }));

    setPhotos((items) => {
      const withoutFallback = items.length === 1 && items[0].src === fallbackImages[0] && !existing ? [] : items;
      return [...withoutFallback, ...nextPhotos];
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploadError('');
    setIsSaving(true);

    try {
      const formData = new FormData(event.currentTarget);
      const product = productFromForm(formData, existing);
      const uploadItems = photos.filter((photo) => photo.file);
      const uploadedImages = uploadItems.length
        ? await uploadProductImages(product.slug, uploadItems.map((photo) => photo.file as File))
        : [];
      let uploadIndex = 0;
      const orderedImages = photos
        .map((photo) => {
          if (photo.file) {
            const uploaded = uploadedImages[uploadIndex];
            uploadIndex += 1;
            return uploaded;
          }
          return photo.src;
        })
        .filter((item, index, array): item is string => Boolean(item) && array.indexOf(item) === index);

      product.image = orderedImages[0] ?? product.image;
      product.images = orderedImages.length ? orderedImages : [product.image];

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
            <div className="adminImagePreview"><AdminPreviewImage src={currentPreview} alt="Предпросмотр" /></div>
            <input type="hidden" name="image" value={photos[0]?.src ?? fallbackImages[0]} />
            <input type="hidden" name="images" value={photos.map((photo) => photo.src).join('\n')} />
            <label className="adminUploadBox">Загрузить новые фото
              <input type="file" accept="image/*" multiple onChange={(event) => {
                addPhotoFiles(event.target.files);
                event.currentTarget.value = '';
              }} />
              <span>JPG, PNG, WEBP · можно выбрать несколько. После выбора фото появятся ниже.</span>
            </label>
            <div className="adminPhotoManager">
              <div className="adminPhotoManager__head">
                <b>Фотографии товара</b>
                <span>Первая миниатюра — основное фото в каталоге и карточке товара.</span>
              </div>
              <div className="adminPhotoGrid">
                {photos.map((photo, index) => (
                  <div className="adminPhotoTile" key={photo.id}>
                    <div className="adminPhotoTile__image"><AdminPreviewImage src={photo.src} alt={`Фото товара ${index + 1}`} /></div>
                    <div className="adminPhotoTile__meta">
                      <span>{index === 0 ? 'Основное' : `Фото ${index + 1}`}</span>
                      {photo.file && <em>Новое</em>}
                    </div>
                    <div className="adminPhotoTile__actions">
                      <button type="button" onClick={() => movePhoto(index, -1)} disabled={index === 0}>←</button>
                      <button type="button" onClick={() => movePhoto(index, 1)} disabled={index === photos.length - 1}>→</button>
                      <button type="button" onClick={() => removePhoto(index)}>Удалить</button>
                    </div>
                  </div>
                ))}
              </div>
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
