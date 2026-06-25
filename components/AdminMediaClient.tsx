'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import { Copy, Eye, RefreshCw, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { AdminMediaFile } from '@/lib/adminContent';

type Filter = 'all' | 'products' | 'reviews' | 'banners' | 'uploaded' | 'site';

export function AdminMediaClient({ initialFiles, supabaseConfigured }: { initialFiles: AdminMediaFile[]; supabaseConfigured: boolean }) {
  const [files, setFiles] = useState(initialFiles);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState('');

  const filtered = useMemo(() => {
    const clean = query.trim().toLowerCase();
    return files.filter((file) => {
      const byFolder = filter === 'all' || file.folder === filter || file.source === filter;
      const haystack = [file.url, file.title, file.folder, file.source, file.used_in].filter(Boolean).join(' ').toLowerCase();
      return byFolder && (!clean || haystack.includes(clean));
    });
  }, [files, query, filter]);

  const stats = useMemo(() => ({
    all: files.length,
    products: files.filter((file) => file.folder === 'products').length,
    reviews: files.filter((file) => file.folder === 'reviews').length,
    banners: files.filter((file) => file.folder === 'banners').length,
    uploaded: files.filter((file) => file.folder === 'uploaded').length
  }), [files]);

  async function refreshMedia() {
    setMessage('');
    try {
      const response = await fetch('/api/admin/media', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось обновить медиа.');
      setFiles(Array.isArray(data.files) ? data.files : []);
      setMessage('Медиафайлы обновлены.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось обновить медиа.');
    }
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setMessage('Ссылка скопирована.');
    } catch {
      setMessage(url);
    }
  }

  async function uploadFiles(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files || []);
    if (!selected.length) return;

    if (!supabase) {
      setMessage('Supabase не подключен. Загрузка недоступна.');
      return;
    }

    setUploading(true);
    setMessage('');

    const bucket = process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_IMAGES_BUCKET || 'product-images';
    const uploaded: AdminMediaFile[] = [];

    for (const file of selected) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-');
      const path = `admin-media/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });

      if (error) {
        setMessage(error.message);
        continue;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      if (data.publicUrl) {
        uploaded.push({
          id: data.publicUrl,
          url: data.publicUrl,
          title: file.name,
          folder: 'uploaded',
          source: 'admin upload',
          used_in: 'manual',
          size: file.size,
          created_at: new Date().toISOString()
        });
      }
    }

    setFiles((current) => [...uploaded, ...current]);
    setUploading(false);
    setMessage(uploaded.length ? `Загружено файлов: ${uploaded.length}` : 'Файлы не загрузились. Проверь Storage policies.');
    event.target.value = '';
  }

  return (
    <div className="admin-media-page">
      <div className="admin-page-head">
        <div>
          <p>Медиацентр</p>
          <h1>Медиафайлы сайта</h1>
          <span>Фото товаров, отзывов, баннеров и загруженные файлы для дальнейшего использования на сайте.</span>
        </div>
        <div className="admin-head-actions">
          <label className="admin-media-upload-button">
            <Upload size={17} />
            {uploading ? 'Загрузка...' : 'Загрузить фото'}
            <input type="file" accept="image/*" multiple onChange={uploadFiles} disabled={uploading} />
          </label>
          <button type="button" onClick={refreshMedia}><RefreshCw size={17} /> Обновить</button>
        </div>
      </div>

      {!supabaseConfigured && <div className="admin-message">Supabase не подключен: загрузка и список из базы могут быть недоступны.</div>}
      {message && <div className="admin-message">{message}</div>}

      <section className="admin-media-stats">
        <article><b>{stats.all}</b><span>всего файлов</span></article>
        <article><b>{stats.products}</b><span>товары</span></article>
        <article><b>{stats.reviews}</b><span>отзывы</span></article>
        <article><b>{stats.banners}</b><span>баннеры</span></article>
        <article><b>{stats.uploaded}</b><span>загружено вручную</span></article>
      </section>

      <div className="admin-commerce-toolbar">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по ссылке, названию или месту использования" />
        <div>
          {(['all', 'products', 'reviews', 'banners', 'uploaded'] as Filter[]).map((item) => (
            <button key={item} type="button" className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>
              {item === 'all' ? 'Все' : item}
            </button>
          ))}
        </div>
      </div>

      <section className="admin-media-library-grid">
        {filtered.map((file) => (
          <article key={file.url}>
            <button type="button" className="admin-media-thumb" onClick={() => setLightbox(file.url)}>
              <img src={file.url} alt={file.title || ''} />
              <Eye size={18} />
            </button>
            <div>
              <b>{file.title || 'media'}</b>
              <span>{file.folder} · {file.source}</span>
              {file.used_in && <small>{file.used_in}</small>}
            </div>
            <div className="admin-media-actions">
              <button type="button" onClick={() => copyUrl(file.url)}><Copy size={16} /> Скопировать</button>
              <a href={file.url} target="_blank" rel="noreferrer">Открыть ↗</a>
            </div>
          </article>
        ))}
      </section>

      {!filtered.length && (
        <section className="admin-empty-commerce">
          <h2>Медиафайлы не найдены</h2>
          <p>Измените фильтр или загрузите изображения через кнопку сверху.</p>
        </section>
      )}

      {lightbox && (
        <div className="admin-review-lightbox" onClick={() => setLightbox('')}>
          <button type="button" aria-label="Закрыть">×</button>
          <img src={lightbox} alt="" />
        </div>
      )}
    </div>
  );
}
