'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Bell, ExternalLink, LogOut, Menu, Search, UserRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAdminAccess } from './AdminAccessContext';

export function AdminTopbar() {
  const { profile, roleLabel } = useAdminAccess();
  const [email, setEmail] = useState(profile.email || 'admin@bullmet.by');

  useEffect(() => {
    let active = true;

    async function loadUser() {
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      const nextEmail = data.session?.user?.email;
      if (active && nextEmail) setEmail(nextEmail);
    }

    void loadUser();

    const { data } = supabase?.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) setEmail(session.user.email);
    }) || { data: null };

    return () => {
      active = false;
      data?.subscription?.unsubscribe();
    };
  }, [profile.email]);

  async function signOut() {
    try {
      window.localStorage.removeItem('bullmet_account_last_email');
      window.localStorage.removeItem('bullmet_account_last_login_at');
      await supabase?.auth.signOut();
    } finally {
      window.location.assign('/login?next=/admin');
    }
  }

  return (
    <header className="admin-topbar-redesign">
      <div className="admin-topbar-left">
        <button type="button" aria-label="Открыть меню"><Menu size={20} /></button>
        <div>
          <span>Панель управления</span>
          <b>Главная</b>
        </div>
      </div>

      <label className="admin-topbar-search">
        <Search size={17} />
        <input placeholder="Поиск по заказам, товарам, клиентам..." />
      </label>

      <div className="admin-topbar-actions">
        <Link href="/" target="_blank">Перейти на сайт <ExternalLink size={15} /></Link>
        <button type="button" className="admin-topbar-bell" aria-label="Уведомления"><Bell size={18} /><i>3</i></button>
        <div className="admin-topbar-user">
          <span><UserRound size={18} /></span>
          <div><b>{roleLabel}</b><small>{email}</small></div>
        </div>
        <button type="button" className="admin-topbar-logout" onClick={signOut} aria-label="Выйти"><LogOut size={18} /></button>
      </div>
    </header>
  );
}
