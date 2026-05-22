'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { defaultHomeSettings, HomeSettings, readHomeSettingsAsync, readLocalHomeSettings, saveHomeSettingsAsync, uploadHomeImage } from './siteSettings';

export function AdminHomeSettings() {
  const [settings, setSettings] = useState<HomeSettings>(() => readLocalHomeSettings());
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [categoryFiles, setCategoryFiles] = useState<Record<string, File | null>>({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const heroPreview = useMemo(() => heroFile ? URL.createObjectURL(heroFile) : settings.heroImage, [heroFile, settings.heroImage]);
  const categoryPreviews = useMemo(() => {
    const entries = Object.entries(categoryFiles).filter(([, file]) => Boolean(file)) as [string, File][];
    return Object.fromEntries(entries.map(([key, file]) => [key, URL.createObjectURL(file)]));
  }, [categoryFiles]);

  useEffect(() => {
    readHomeSettingsAsync().then(setSettings);
  }, []);

  useEffect(() => () => {
    if (heroPreview.startsWith('blob:')) URL.revokeObjectURL(heroPreview);
    Object.values(categoryPreviews).forEach((url) => { if (url.startsWith('blob:')) URL.revokeObjectURL(url); });
  }, [heroPreview, categoryPreviews]);

  function updateCategory(key: string, field: 'title' | 'href' | 'image', value: string) {
    setSettings((current) => ({
      ...current,
      categories: current.categories.map((item) => item.key === key ? { ...item, [field]: value } : item),
    }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');
    setIsSaving(true);

    try {
      let nextSettings = { ...settings, categories: settings.categories.map((item) => ({ ...item })) };

      if (heroFile) {
        const url = await uploadHomeImage(heroFile, 'hero');
        nextSettings.heroImage = url || nextSettings.heroImage;
      }

      for (const category of nextSettings.categories) {
        const file = categoryFiles[category.key];
        if (file) {
          const url = await uploadHomeImage(file, `category-${category.key}`);
          category.image = url || category.image;
        }
      }

      nextSettings = await saveHomeSettingsAsync(nextSettings);
      setSettings(nextSettings);
      setHeroFile(null);
      setCategoryFiles({});
      setMessage('Главная страница обновлена. Изменения появятся на сайте сразу после обновления страницы.');
    } catch (saveError) {
      console.error(saveError);
      setError(saveError instanceof Error ? saveError.message : 'Не удалось сохранить настройки главной страницы.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AdminLayout title="Главная страница">
      <main className="adminContent adminHomeEditPage">
        <div className="adminPageHead">
          <div><p>Контент / Главная страница</p><h2>Фото главной и категорий</h2></div>
          <button className="adminSecondaryBtn" type="button" onClick={() => setSettings(defaultHomeSettings)}>Вернуть стандартные фото</button>
        </div>

        <form className="adminHomeForm" onSubmit={submit}>
          <section className="adminCard adminHomeHeroEditor">
            <h3>Главный экран</h3>
            <div className="adminHomePreview adminHomePreview--hero">
              <Image src={heroPreview} alt="Главный экран Bullmet" fill sizes="900px" unoptimized={heroPreview.startsWith('blob:')} />
            </div>
            <div className="adminFormGrid adminFormGrid--two">
              <label>Текущий URL фото<input value={settings.heroImage} onChange={(event) => setSettings((current) => ({ ...current, heroImage: event.target.value }))} /></label>
              <label className="adminUploadBox">Загрузить новое фото
                <input type="file" accept="image/*" onChange={(event) => setHeroFile(event.target.files?.[0] ?? null)} />
                <span>{heroFile ? heroFile.name : 'JPG, PNG, WEBP'}</span>
              </label>
            </div>
          </section>

          <section className="adminCard adminHomeCategoriesEditor">
            <h3>Фото категорий на главной</h3>
            <div className="adminCategoryEditorGrid">
              {settings.categories.map((category) => (
                <div className="adminCategoryEditor" key={category.key}>
                  <div className="adminHomePreview"><Image src={categoryPreviews[category.key] || category.image} alt={category.title} fill sizes="280px" unoptimized={Boolean(categoryPreviews[category.key])} /></div>
                  <label>Название<input value={category.title} onChange={(event) => updateCategory(category.key, 'title', event.target.value)} /></label>
                  <label>Ссылка<input value={category.href} onChange={(event) => updateCategory(category.key, 'href', event.target.value)} /></label>
                  <label>URL фото<input value={category.image} onChange={(event) => updateCategory(category.key, 'image', event.target.value)} /></label>
                  <label className="adminUploadBox">Загрузить фото
                    <input type="file" accept="image/*" onChange={(event) => setCategoryFiles((current) => ({ ...current, [category.key]: event.target.files?.[0] ?? null }))} />
                    <span>{categoryFiles[category.key]?.name || 'Выбрать файл'}</span>
                  </label>
                </div>
              ))}
            </div>
          </section>

          {message && <p className="adminSuccessMessage">{message}</p>}
          {error && <p className="adminUploadError">{error}</p>}
          <button className="adminPrimaryBtn adminHomeSave" type="submit" disabled={isSaving}>{isSaving ? 'Сохраняем...' : 'Сохранить изменения'}</button>
        </form>
      </main>
    </AdminLayout>
  );
}
