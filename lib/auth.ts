import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export type BullmetRole = 'customer' | 'admin';

export type BullmetSession = {
  id: string;
  email: string;
  role: BullmetRole;
  fullName?: string | null;
  source: 'supabase' | 'demo';
};

const DEMO_ADMIN_EMAIL = 'admin@bullmet.by';
const DEMO_ADMIN_PASSWORD = 'admin123';

function configuredAdminEmails() {
  return [
    DEMO_ADMIN_EMAIL,
    ...(process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  ];
}

export function isConfiguredAdminEmail(email?: string | null) {
  if (!email) return false;
  return configuredAdminEmails().includes(normalizeEmail(email));
}
const DEMO_USER_KEY = 'bullmet-user';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isDemoAdminLogin(email: string, password: string) {
  return normalizeEmail(email) === DEMO_ADMIN_EMAIL && password === DEMO_ADMIN_PASSWORD;
}

export function saveDemoSession(session: BullmetSession) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DEMO_USER_KEY, JSON.stringify({ email: session.email, role: session.role === 'admin' ? 'admin' : 'client' }));
}

export function getDemoSession(): BullmetSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(DEMO_USER_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { email?: string; role?: string };
    if (!data.email) return null;
    return {
      id: `demo-${data.email}`,
      email: data.email,
      role: data.role === 'admin' ? 'admin' : 'customer',
      source: 'demo',
    };
  } catch {
    return null;
  }
}

export function clearDemoSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(DEMO_USER_KEY);
}

async function ensureProfile(user: User, fullName?: string): Promise<BullmetSession> {
  if (!supabase) {
    return { id: user.id, email: user.email || '', role: 'customer', fullName, source: 'demo' };
  }

  const { data: existing } = await supabase
    .from('profiles')
    .select('id,email,full_name,role')
    .eq('id', user.id)
    .maybeSingle();

  if (existing) {
    const forcedAdmin = isConfiguredAdminEmail(existing.email || user.email);
    if (forcedAdmin && existing.role !== 'admin') {
      await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
    }
    return {
      id: user.id,
      email: existing.email || user.email || '',
      fullName: existing.full_name,
      role: existing.role === 'admin' || forcedAdmin ? 'admin' : 'customer',
      source: 'supabase',
    };
  }

  const payload = {
    id: user.id,
    email: user.email || '',
    full_name: fullName || user.user_metadata?.full_name || '',
    role: isConfiguredAdminEmail(user.email) ? 'admin' : 'customer',
  };

  await supabase.from('profiles').insert(payload);

  return {
    id: user.id,
    email: payload.email,
    fullName: payload.full_name,
    role: payload.role as BullmetRole,
    source: 'supabase',
  };
}

export async function getCurrentSession(): Promise<BullmetSession | null> {
  if (supabase && isSupabaseConfigured) {
    const { data } = await supabase.auth.getUser();
    if (data.user) return ensureProfile(data.user);
  }
  return getDemoSession();
}

export async function signInBullmet(email: string, password: string): Promise<BullmetSession> {
  const normalizedEmail = normalizeEmail(email);

  if (supabase && isSupabaseConfigured) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
    if (error || !data.user) {
      throw new Error(error?.message || 'Не удалось войти в аккаунт.');
    }
    clearDemoSession();
    return ensureProfile(data.user);
  }

  if (isDemoAdminLogin(normalizedEmail, password)) {
    const session: BullmetSession = {
      id: 'demo-admin',
      email: normalizedEmail,
      role: 'admin',
      fullName: 'Администратор',
      source: 'demo',
    };
    saveDemoSession(session);
    return session;
  }

  if (normalizedEmail && password.length >= 3) {
    const session: BullmetSession = {
      id: `demo-${normalizedEmail}`,
      email: normalizedEmail,
      role: 'customer',
      source: 'demo',
    };
    saveDemoSession(session);
    return session;
  }

  throw new Error('Введите email и пароль.');
}

export async function signUpBullmet(email: string, password: string, fullName: string): Promise<BullmetSession | null> {
  const normalizedEmail = normalizeEmail(email);

  if (supabase && isSupabaseConfigured) {
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw new Error(error.message);
    if (!data.user) return null;
    clearDemoSession();
    return ensureProfile(data.user, fullName);
  }

  const session: BullmetSession = {
    id: `demo-${normalizedEmail}`,
    email: normalizedEmail,
    role: 'customer',
    fullName,
    source: 'demo',
  };
  saveDemoSession(session);
  return session;
}

export async function signOutBullmet() {
  if (supabase && isSupabaseConfigured) {
    await supabase.auth.signOut();
  }
  clearDemoSession();
}
