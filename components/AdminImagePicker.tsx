'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import { Check, ImagePlus, RefreshCw, Search, Upload, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { AdminMediaFile } from '@/lib/adminContent';

type MediaFilter = 'all' | 'products' | 'reviews' | 'banners' | 'uploaded' | 'site';

const mediaFilters: Array<{ value: MediaFilter; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'products', label: 'Товары' },
  { value: 'banners', label: 'Баннеры' },
  { value: 'uploaded', label: 'Загруженные' },
  { value: 'site', label: 'Сайт' },
  { value: 'reviews', label: 'Отзывы' }
];

type AdminImagePickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  altValue?: string;
  onAltChange?: (value: string) => void;
  hint?: string;
};

export function AdminImagePicker({ label, value, onChange, altValue, onAltChange, hint }: AdminImagePickerProps) {
  const [files, setFiles] = useState<AdminMediaFile[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<MediaFilter>('all');
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  const filteredFiles = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    return files.filter((file) => {
      const matchesFolder = filter === 'all' || file.folder === filter || file.source === filter;
      const haystack = [file.title, file.url, file.folder, file.source, file.used_in].filter(Boolean).join(' ').toLowerCase();
      return matchesFolder && (!cleanQuery || haystack.includes(cleanQuery));
    });
  }, [files, filter, query]);

  async function loadMedia(force = false) {
    if (loaded && !force) return;
    setMessage('');

    try {
      const response = await fetch('/api/admin/media', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось загрузить медиатеку.');
      setFiles(Array.isArray(data.files) ? data.files : []);
      setLoaded(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось загрузить медиатеку.');
    }
  }

  function openLibrary() {
    setOpen(true);
    void loadMedia();
  }

  async function uploadFiles(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    if (!supabase) {
      setMessage('Supabase не подключен. Загрузка недоступна.');
      event.target.value = '';
      return;
    }

    setUploading(true);
    setMessage('');

    const bucket = process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_IMAGES_BUCKET || 'product-images';
    const uploadedFiles: AdminMediaFile[] = [];

    for (const file of selectedFiles) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-');
      const path = `admin-media/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });

      if (error) {
        setMessage(error.message);
        continue;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      if (data.publicUrl) {
        uploadedFiles.push({
          id: data.publicUrl,
          url: data.publicUrl,
          title: file.name,
          folder: 'uploaded',
          source: 'admin upload',
          used_in: 'editor',
          size: file.size,
          created_at: new Date().toISOString()
        });
      }
    }

    setUploading(false);
    event.target.value = '';

    if (!uploadedFiles.length) {
      setMessage('Файлы не загрузились. Проверь Storage policies.');
      return;
    }

    setFiles((current) => [...uploadedFiles, ...current]);
    setLoaded(true);
    onChange(uploadedFiles[0].url);
    setMessage(`Загружено файлов: ${uploadedFiles.length}. Первое изображение выбрано.`);
  }

  return (
    <div className="admin-image-picker">
      <div className="admin-image-picker-head">
        <span>{label}</span>
        {hint && <small>{hint}</small>}
      </div>

      <div className="admin-image-picker-current">
        <button type="button" className={value ? 'has-image' : ''} onClick={openLibrary}>
          {value ? <img src={value} alt={altValue || label} /> : <ImagePlus size={28} />}
        </button>
        <div>
          <b>{value ? value.split('/').pop() || 'Изображение выбрано' : 'Изображение не выбрано'}</b>
          <span>{value || 'Выберите из медиатеки или загрузите файл'}</span>
          <div>
            <button type="button" onClick={openLibrary}><ImagePlus size={16} /> Выбрать</button>
            {value && <button type="button" onClick={() => onChange('')}><X size={16} /> Убрать</button>}
          </div>
        </div>
      </div>

      {onAltChange && (
        <label className="admin-image-picker-alt">
          Alt-текст
          <input value={altValue || ''} onChange={(event) => onAltChange(event.target.value)} placeholder="Короткое описание изображения" />
        </label>
      )}

      {open && (
        <div className="admin-image-picker-modal" role="dialog" aria-modal="true">
          <button type="button" className="admin-image-picker-backdrop" aria-label="Закрыть медиатеку" onClick={() => setOpen(false)} />
          <section className="admin-image-picker-dialog">
            <div className="admin-image-picker-dialog-head">
              <div>
                <p>Медиатека</p>
                <h2>Выберите изображение</h2>
              </div>
              <button type="button" aria-label="Закрыть" onClick={() => setOpen(false)}><X size={20} /></button>
            </div>

            <div className="admin-image-picker-toolbar">
              <label>
                <Search size={16} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по названию или месту использования" />
              </label>
              <button type="button" onClick={() => loadMedia(true)}><RefreshCw size={16} /> Обновить</button>
              <label className="admin-image-picker-upload">
                <Upload size={16} />
                {uploading ? 'Загрузка...' : 'Загрузить'}
                <input type="file" accept="image/*" multiple onChange={uploadFiles} disabled={uploading} />
              </label>
            </div>

            <div className="admin-image-picker-filters">
              {mediaFilters.map((item) => (
                <button key={item.value} type="button" className={filter === item.value ? 'is-active' : ''} onClick={() => setFilter(item.value)}>
                  {item.label}
                </button>
              ))}
            </div>

            {message && <div className="admin-image-picker-message">{message}</div>}

            <div className="admin-image-picker-grid">
              {filteredFiles.map((file) => (
                <button
                  key={file.url}
                  type="button"
                  className={value === file.url ? 'is-selected' : ''}
                  onClick={() => {
                    onChange(file.url);
                    setOpen(false);
                  }}
                >
                  <img src={file.url} alt={file.title || ''} />
                  {value === file.url && <Check size={18} />}
                  <b>{file.title || 'media'}</b>
                  <span>{file.folder || 'site'} · {file.used_in || file.source || 'без привязки'}</span>
                </button>
              ))}
            </div>

            {!filteredFiles.length && (
              <div className="admin-image-picker-empty">
                <ImagePlus size={30} />
                <b>Изображения не найдены</b>
                <span>Загрузите файл или измените фильтр.</span>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
