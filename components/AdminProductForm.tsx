'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from './AdminLayout';
import { type AdminProduct, productFromForm, readAdminProducts, saveAdminProductAsync } from './adminProductStore';
import { uploadProductImages } from '../lib/productImages';
import { categories } from './shopData';

const fallbackImages = ['/assets/cat-clock.jpg', '/assets/cat-swing.jpg', '/assets/cat-metal.jpg', '/assets/cat-wood.jpg', '/assets/cat-custom.jpg', '/assets/production.jpg'];

export function AdminProductForm({ slug }: { slug?: string }) {
  const router = useRouter();
  const existing = useMemo(() => slug ? readAdminProducts().find((item) => item.slug === slug) : undefined, [slug]);
  const [preview, setPreview] = useState(existing?.image ?? fallbackImages[0]);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploadError('');
    setIsSaving(true);

    try {
      const formData = new FormData(event.currentTarget);
      const product = productFromForm(formData, existing);

      if (files.length) {
        const uploadedImages = await uploadProductImages(product.slug, files);
        const nextImages = [
          ...uploadedImages,
          product.image,
          ...(product.images ?? []),
        ].filter((item, index, array) => Boolean(item) && array.indexOf(item) === index);

        product.image = uploadedImages[0] ?? product.image;
        product.images = nextImages;
      }

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
            <div className="adminImagePreview"><Image src={preview} alt="Предпросмотр" fill sizes="360px" /></div>
            <label>Основное фото<select name="image" value={preview} onChange={(event) => setPreview(event.target.value)}>{[preview, ...fallbackImages, ...(existing?.images ?? [])].filter((image, index, array) => image && array.indexOf(image) === index).map((image) => <option value={image} key={image}>{image}</option>)}</select></label>
            <label className="adminUploadBox">Загрузить новые фото
              <input type="file" accept="image/*" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []))} />
              <span>{files.length ? `Выбрано файлов: ${files.length}` : 'JPG, PNG, WEBP · можно выбрать несколько'}</span>
            </label>
            {files.length > 0 && <div className="adminUploadList">{files.map((file) => <span key={`${file.name}-${file.size}`}>{file.name}</span>)}</div>}
            <label>Дополнительные фото<textarea name="images" rows={6} defaultValue={(existing?.images ?? fallbackImages.slice(1, 4)).filter((image) => image !== preview).join('\n')} placeholder="Можно вставить URL картинок вручную, каждая с новой строки" /></label>
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
