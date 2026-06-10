'use client';

import { FormEvent, useState } from 'react';

export function ServiceRequestForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', link: '', text: '', service: 'Лазерная резка / гибка металла' });

  function patch(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set('kind', 'service');
      formData.set('type', form.service);
      formData.set('name', form.name);
      formData.set('phone', form.phone);
      formData.set('email', form.email);
      formData.set('comment', [form.text, form.link ? `Ссылка на пример: ${form.link}` : ''].filter(Boolean).join('\n'));
      formData.set('material', 'По заявке');
      Array.from(files || []).forEach((file) => formData.append('files', file));

      const response = await fetch('/api/requests', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось отправить заявку.');
      setMessage(`Заявка отправлена${data.id ? `: ${data.id}` : ''}. Мы свяжемся с вами для расчета.`);
      setForm({ name: '', phone: '', email: '', link: '', text: '', service: 'Лазерная резка / гибка металла' });
      setFiles(null);
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось отправить заявку.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="service-request-form-v2" onSubmit={submit}>
      <div className="service-form-head-v2">
        <h2>Заявка на расчет</h2>
        <p>Заполните контакты и опишите задачу. Файл можно прикрепить сразу или отправить позже.</p>
      </div>

      <div className="service-form-grid-v2">
        <label>
          <span>Имя</span>
          <input value={form.name} onChange={(event) => patch('name', event.target.value)} placeholder="Например, Даниил" required />
        </label>
        <label>
          <span>Телефон</span>
          <input value={form.phone} onChange={(event) => patch('phone', event.target.value)} placeholder="+375 ..." required />
        </label>
      </div>

      <label>
        <span>Что нужно рассчитать</span>
        <select value={form.service} onChange={(event) => patch('service', event.target.value)}>
          <option>Лазерная резка / гибка металла</option>
          <option>Лазерная резка</option>
          <option>Гибка металла</option>
          <option>Изготовление изделия по эскизу</option>
          <option>Мелкий опт металлопроката</option>
        </select>
      </label>

      <div className="service-form-grid-v2">
        <label>
          <span>Email</span>
          <input value={form.email} onChange={(event) => patch('email', event.target.value)} placeholder="Email, если удобно" />
        </label>
        <label>
          <span>Ссылка на пример</span>
          <input value={form.link} onChange={(event) => patch('link', event.target.value)} placeholder="Ссылка на товар / фото" />
        </label>
      </div>

      <label>
        <span>Описание задачи</span>
        <textarea value={form.text} onChange={(event) => patch('text', event.target.value)} rows={5} placeholder="Что нужно изготовить? Размеры, материал, количество, пожелания" />
      </label>

      <label className="file-drop-v2">
        <input type="file" multiple onChange={(event) => setFiles(event.target.files)} />
        <b>{files?.length ? `Выбрано файлов: ${files.length}` : 'Прикрепить файл'}</b>
        <span>чертеж, фото, эскиз или ТЗ</span>
      </label>

      {message && <p className="service-message-v2">{message}</p>}
      <button type="submit" disabled={loading}>{loading ? 'Отправляем...' : 'Отправить заявку'}</button>
    </form>
  );
}
