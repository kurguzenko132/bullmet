'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { syncServerSession } from '@/lib/authSession';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    if (!supabase) {
      setError('Сервис авторизации временно недоступен.');
      return;
    }
    const client = supabase;
    const checkSession = async () => {
      const { data } = await client.auth.getSession();
      if (!active) return;
      if (data.session) setReady(true);
      else setError('Ссылка для установки пароля недействительна или истекла. Запросите новую ссылку.');
    };
    void checkSession();
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      if (active && session) { setReady(true); setError(''); }
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!supabase || !ready) return;
    if (password.length < 6) return setError('Пароль должен содержать минимум 6 символов.');
    if (password !== confirmation) return setError('Пароли не совпадают.');
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      const session = (await supabase.auth.getSession()).data.session;
      if (session?.access_token) await syncServerSession(session.access_token);
      setMessage('Пароль установлен. Теперь вы можете продолжить работу с аккаунтом.');
      setPassword('');
      setConfirmation('');
    } catch {
      setError('Не удалось установить пароль. Возможно, ссылка истекла — запросите новую.');
    } finally {
      setLoading(false);
    }
  }

  return <><Header /><main className="auth-page auth-forgot-page"><div className="auth-forgot-container"><section className="auth-card auth-forgot-card" aria-label="Установка нового пароля"><div className="auth-form-head"><p className="auth-eyebrow">Аккаунт Bullmet</p><h1>Установите новый пароль</h1><p>Эта форма работает для восстановления доступа и первого входа по приглашению.</p></div><form className="auth-form" onSubmit={submit}><label className="auth-field"><span>Новый пароль</span><div className="auth-input-wrap"><LockKeyhole aria-hidden="true" /><input type="password" autoComplete="new-password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required /></div></label><label className="auth-field"><span>Повторите пароль</span><div className="auth-input-wrap"><LockKeyhole aria-hidden="true" /><input type="password" autoComplete="new-password" minLength={6} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required /></div></label>{error && <p className="auth-message auth-message-error">{error}</p>}{message && <p className="auth-message auth-message-success">{message}</p>}<button type="submit" className="auth-submit" disabled={!ready || loading}><span>{loading ? 'Сохраняем...' : 'Сохранить пароль'}</span><ArrowRight aria-hidden="true" /></button><div className="auth-links"><Link href="/forgot-password">Запросить новую ссылку</Link><Link href="/login">Вернуться ко входу</Link></div></form></section></div></main><Footer /></>;
}
