'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { defaultAdminPath, isStaffRole, normalizeAdminRole } from '@/lib/adminAccess';

type Mode = 'login' | 'register';

function getAdminEmails() {
  return [
    process.env.NEXT_PUBLIC_ADMIN_EMAIL,
    process.env.NEXT_PUBLIC_ADMIN_EMAILS
  ]
    .filter(Boolean)
    .flatMap((value) => String(value).split(','))
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}



async function getUserAdminRole(userId?: string, email?: string) {
  const cleanEmail = String(email || '').toLowerCase();
  const adminEmails = getAdminEmails();

  if (!supabase || !userId) {
    return adminEmails.includes(cleanEmail) ? 'admin' : 'customer';
  }

  try {
    const { data } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', userId)
      .maybeSingle();

    if (data?.status === 'blocked') return 'customer';
    const profileRole = normalizeAdminRole(data?.role);
    return adminEmails.includes(cleanEmail) && profileRole === 'customer' ? 'admin' : profileRole;
  } catch {
    return adminEmails.includes(cleanEmail) ? 'admin' : 'customer';
  }
}

function getReadableAuthError(error: unknown, mode: Mode, adminLogin: boolean) {
  const raw = error instanceof Error ? error.message : String(error || '');
  const lower = raw.toLowerCase();

  if (lower.includes('invalid login credentials')) {
    return adminLogin
      ? 'Неверный email или пароль. Проверьте введённые данные и попробуйте ещё раз.'
      : 'Неверный email или пароль. Если аккаунта ещё нет, сначала нажмите «Регистрация» и создайте личный кабинет.';
  }

  if (lower.includes('email not confirmed') || lower.includes('confirm')) {
    return 'Email ещё не подтверждён. Откройте письмо от Supabase и подтвердите почту, затем войдите снова.';
  }

  if (lower.includes('user already registered') || lower.includes('already registered')) {
    return 'Аккаунт с таким email уже существует. Переключитесь на «Вход» и введите пароль.';
  }

  if (lower.includes('password should be') || lower.includes('password')) {
    return mode === 'register'
      ? 'Пароль слишком короткий или не подходит. Используйте минимум 6 символов.'
      : 'Проверьте пароль и попробуйте ещё раз.';
  }

  return mode === 'login' ? 'Не удалось выполнить вход. Проверьте данные и попробуйте ещё раз.' : 'Не удалось создать аккаунт. Попробуйте ещё раз немного позже.';
}

function isInvalidCredentialsError(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error || '');
  return raw.toLowerCase().includes('invalid login credentials');
}

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '', confirmPassword: '' });
  const [showCreateHint, setShowCreateHint] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const hasExplicitNext = searchParams.has('next');

  const nextUrl = useMemo(() => {
    const rawValue = searchParams.get('next') || '/account';
    let value = rawValue.trim();

    try {
      value = decodeURIComponent(value);
    } catch {}

    if (!value.startsWith('/') || value.startsWith('//')) return '/account';

    const cleanValue = value.split('#')[0].split('?')[0].replace(/\/$/, '') || '/account';

    if (cleanValue === '/profile' || cleanValue === '/cabinet' || cleanValue === '/lk') return '/account';
    if (cleanValue.startsWith('/account')) return '/account';
    if (cleanValue.startsWith('/admin')) return cleanValue;
    if (cleanValue.startsWith('/cart')) return '/cart';
    if (cleanValue.startsWith('/order-success')) return value;

    return '/account';
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setFieldErrors({ email: '', password: '', confirmPassword: '' });
    setMessage('');
    setShowCreateHint(false);

    if (!supabase) {
      setError('Сервис авторизации временно недоступен. Попробуйте ещё раз немного позже.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const nextFieldErrors = {
      email: !/^\S+@\S+\.\S+$/.test(cleanEmail) ? 'Введите корректный email' : '',
      password: password.length < 6 ? 'Пароль должен содержать минимум 6 символов' : '',
      confirmPassword: mode === 'register' && password !== confirmPassword ? 'Пароли не совпадают' : ''
    };
    if (nextFieldErrors.email || nextFieldErrors.password || nextFieldErrors.confirmPassword) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}${nextUrl}` : undefined
          }
        });

        if (signUpError) throw signUpError;

        if (signUpData.user) {
          await supabase.from('profiles').upsert({ id: signUpData.user.id, email: cleanEmail, full_name: '' });
        }

        setMessage('Аккаунт создан. Если включено подтверждение email, подтвердите почту и затем войдите. Если подтверждение отключено — можно сразу попробовать войти.');
        setMode('login');
        setLoading(false);
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (signInError) throw signInError;

      try {
        window.localStorage.setItem('bullmet_account_last_email', cleanEmail);
        window.localStorage.setItem('bullmet_account_last_login_at', String(Date.now()));
        window.dispatchEvent(new Event('bullmet-auth-updated'));
      } catch {}

      const userEmail = data.user?.email?.toLowerCase() || cleanEmail;
      const userRole = await getUserAdminRole(data.user?.id, userEmail);
      const hasAdminAccess = isStaffRole(userRole);

      if (nextUrl.startsWith('/admin') && !hasAdminAccess) {
        await supabase.auth.signOut();
        setError('У этой учётной записи нет доступа к запрошенной странице.');
        setLoading(false);
        return;
      }

      const targetUrl = (!hasExplicitNext && hasAdminAccess) ? defaultAdminPath(userRole) : (nextUrl || '/account');
      router.replace(targetUrl);
      router.refresh();

      // Жесткий переход нужен, чтобы Supabase-сессия точно успела сохраниться
      // и нужная страница открылась без повторного ввода пароля.
      window.setTimeout(() => {
        window.location.href = targetUrl;
      }, 100);
    } catch (err) {
      const adminLogin = nextUrl.startsWith('/admin');
      setError(getReadableAuthError(err, mode, adminLogin));
      setShowCreateHint(mode === 'login' && !adminLogin && isInvalidCredentialsError(err));
      setLoading(false);
    }
  }

  return (
    <section className="auth-card auth-card--polished" aria-label="Форма входа и регистрации">
      <div className="auth-mode-cards">
        <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => { setMode('login'); setError(''); setMessage(''); setFieldErrors({ email: '', password: '', confirmPassword: '' }); setShowCreateHint(false); }}>
          <b>Вход</b>
        </button>
        <button className={mode === 'register' ? 'active' : ''} type="button" onClick={() => { setMode('register'); setError(''); setMessage(''); setFieldErrors({ email: '', password: '', confirmPassword: '' }); setShowCreateHint(false); }}>
          <b>Регистрация</b>
        </button>
      </div>

      <div className="auth-form-head">
        <h2>{mode === 'login' ? 'Войти в аккаунт' : 'Создать аккаунт'}</h2>
        <p>{mode === 'login' ? 'Введите email и пароль, указанные при регистрации.' : 'Аккаунт пригодится для заказов, избранного и быстрого оформления.'}</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span>Email</span>
          <div className="auth-input-wrap"><Mail aria-hidden="true" /><input type="email" placeholder="example@email.com" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={!!fieldErrors.email} required /></div>
          {fieldErrors.email && <small>{fieldErrors.email}</small>}
        </label>
        <label className="auth-field">
          <span className="auth-field-label">Пароль{mode === 'login' && <Link href="/forgot-password">Забыли пароль?</Link>}</span>
          <div className="auth-input-wrap"><LockKeyhole aria-hidden="true" /><input type={showPassword ? 'text' : 'password'} placeholder={mode === 'login' ? 'Введите пароль' : 'Минимум 6 символов'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={!!fieldErrors.password} minLength={6} required /><button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}>{showPassword ? <EyeOff /> : <Eye />}</button></div>
          {fieldErrors.password && <small>{fieldErrors.password}</small>}
        </label>
        {mode === 'register' && (
          <label className="auth-field">
            <span>Повторите пароль</span>
            <div className="auth-input-wrap"><LockKeyhole aria-hidden="true" /><input type={showConfirmPassword ? 'text' : 'password'} placeholder="Повторите пароль" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} aria-invalid={!!fieldErrors.confirmPassword} minLength={6} required /><button type="button" onClick={() => setShowConfirmPassword((current) => !current)} aria-label={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}>{showConfirmPassword ? <EyeOff /> : <Eye />}</button></div>
            {fieldErrors.confirmPassword && <small>{fieldErrors.confirmPassword}</small>}
          </label>
        )}

        {error && <p className="auth-message auth-message-error">{error}</p>}
        {showCreateHint && (
          <button
            className="auth-inline-action"
            type="button"
            onClick={() => { setMode('register'); setError(''); setMessage(''); setShowCreateHint(false); }}
          >
            Создать аккаунт с этим email
          </button>
        )}
        {message && <p className="auth-message auth-message-success">{message}</p>}

        <button type="submit" className="auth-submit" disabled={loading}>
          <span>{loading ? (mode === 'login' ? 'Входим...' : 'Создаём аккаунт...') : mode === 'login' ? 'Войти' : 'Создать аккаунт'}</span><ArrowRight aria-hidden="true" />
        </button>

        <div className="auth-links">
          <Link href="/contacts">Нужна помощь?</Link>
          <Link href="/catalog">Вернуться в каталог</Link>
        </div>
      </form>
    </section>
  );
}
