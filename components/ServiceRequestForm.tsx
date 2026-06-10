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
    <form className="service-request-form-pro" onSubmit={submit}>
      <h2>Отправьте чертеж или эскиз</h2>
      <p>Прикрепите файл или ссылку на пример — мы рассчитаем стоимость и сроки.</p>
      <div className="service-form-grid">
        <input value={form.name} onChange={(event) => patch('name', event.target.value)} placeholder="Ваше имя" required />
        <input value={form.phone} onChange={(event) => patch('phone', event.target.value)} placeholder="Телефон" required />
      </div>
      <input value={form.email} onChange={(event) => patch('email', event.target.value)} placeholder="Email" />
      <select value={form.service} onChange={(event) => patch('service', event.target.value)}>
        <option>Лазерная резка / гибка металла</option>
        <option>Лазерная резка</option>
        <option>Гибка металла</option>
        <option>Изготовление изделия по эскизу</option>
        <option>Мелкий опт металлопроката</option>
      </select>
      <input value={form.link} onChange={(event) => patch('link', event.target.value)} placeholder="Ссылка на пример товара" />
      <label className="file-drop-pro">
        <input type="file" multiple onChange={(event) => setFiles(event.target.files)} />
        <span>{files?.length ? `Выбрано файлов: ${files.length}` : 'Прикрепить чертеж, фото или эскиз'}</span>
      </label>
      <textarea value={form.text} onChange={(event) => patch('text', event.target.value)} rows={5} placeholder="Что нужно изготовить? Размеры, материал, количество, пожелания" />
      {message && <p className="service-message">{message}</p>}
      <button disabled={loading}>{loading ? 'Отправляем...' : 'Отправить заявку'}</button>
    </form>
  );
}
