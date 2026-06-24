'use client';

import { FormEvent, useState } from 'react';

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', text: '' });

  function patch(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'contact', type: 'Сообщение со страницы контактов', name: form.name, phone: form.phone, email: form.email, message: form.text })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось отправить сообщение.');
      setMessage('Сообщение отправлено. Мы свяжемся с вами.');
      setForm({ name: '', phone: '', email: '', text: '' });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось отправить сообщение.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="contact-form-pro contact-form-pro--rich" onSubmit={submit}>
      <div className="contact-form-row-rich">
        <label>
          <span>Ваше имя</span>
          <input value={form.name} onChange={(event) => patch('name', event.target.value)} placeholder="Например, Дмитрий" required />
        </label>
        <label>
          <span>Телефон</span>
          <input value={form.phone} onChange={(event) => patch('phone', event.target.value)} placeholder="+375 29 000-00-00" required />
        </label>
      </div>
      <label>
        <span>Email</span>
        <input value={form.email} onChange={(event) => patch('email', event.target.value)} placeholder="mail@example.com" />
      </label>
      <label>
        <span>Сообщение</span>
        <textarea value={form.text} onChange={(event) => patch('text', event.target.value)} rows={5} placeholder="Напишите, какие часы интересуют, нужный размер, цвет или удобный способ получения" />
      </label>
      {message && <p className="contact-form-message">{message}</p>}
      <button disabled={loading}>{loading ? 'Отправляем...' : 'Отправить сообщение'}</button>
    </form>
  );
}
