'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Instagram } from 'lucide-react';
import { Icon } from './Icon';
import { Container } from './layout/Container';

type FooterSettings = {
  general: { logoText: string; tagline: string };
  contacts: { phone: string; email?: string; address: string; hours: string; telegram?: string; instagram?: string };
  directions: Array<{ key: string; title: string; href: string; visible: boolean; order: number }>;
  navigation: Array<{ href: string; label: string; location: string; visible: boolean; order: number }>;
};

const defaultSettings: FooterSettings = {
  general: { logoText: 'BULLMET', tagline: 'металл с элементами дерева' },
  contacts: { phone: '+375 29 802 70 61', email: 'info@bullmet.by', address: 'Брестская обл., Ивацевичский р-н, д. Булла, ул. Школьная 10А', hours: 'ПН–ПТ: 9:00–18:00', telegram: '', instagram: '' },
  directions: [{ key: 'clocks', title: 'Настенные часы', href: '/catalog', visible: true, order: 1 }],
  navigation: []
};

export function Footer() {
  const [settings, setSettings] = useState<FooterSettings>(defaultSettings);

  useEffect(() => {
    let active = true;
    fetch('/api/site-control')
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (active && data?.settings) setSettings(data.settings); })
      .catch(() => null);
    return () => { active = false; };
  }, []);

  const rawFooterLinks = useMemo(() => settings.navigation.filter((item) => item.location === 'footer' && item.visible).sort((a, b) => a.order - b.order), [settings.navigation]);
  const companyLinks = rawFooterLinks.length ? rawFooterLinks.slice(0, 4) : [
    { href: '/production', label: 'Производство' },
    { href: '/contacts', label: 'Контакты' }
  ];
  const phoneHref = `tel:${settings.contacts.phone.replace(/[^+\d]/g, '')}`;
  const telegramHref = String(settings.contacts.telegram || '').trim();
  const instagramHref = String(settings.contacts.instagram || '').trim();

  return (
    <footer className="footer-exact">
      <Container className="footer-container">
        <div className="footer-grid-exact footer-grid-launch">
        <div className="footer-brand-column">
          <Link href="/" className="brand-exact footer-brand">
            <img src="/bullmet-logo-mark.png" alt="" className="brand-mark brand-mark--bullmet" />
            <span className="brand-text"><b>{settings.general.logoText}</b><small>{settings.general.tagline}</small></span>
          </Link>
          <p className="footer-description">Собственное производство изделий из металла и дерева с 2017 года</p>
          <div className="socials footer-socials">
            {instagramHref
              ? <a href={instagramHref} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram /></a>
              : <span aria-label="Instagram"><Instagram /></span>}
            {telegramHref && <a href={telegramHref} target="_blank" rel="noreferrer" aria-label="Telegram"><Icon name="telegram" /></a>}
            {settings.contacts.email && <a href={`mailto:${settings.contacts.email}`} aria-label="Email"><MailLogo /></a>}
          </div>
        </div>
        <nav className="footer-column" aria-label="Каталог">
          <h4>КАТАЛОГ</h4>
          <Link href="/catalog">Настенные часы</Link>
          <Link href="/catalog">Все товары</Link>
        </nav>
        <nav className="footer-column" aria-label="Компания">
          <h4>КОМПАНИЯ</h4>
          {companyLinks.map((item) => (
            <Link href={item.href} key={`${item.href}-${item.label}`}>{item.label}</Link>
          ))}
        </nav>
        <div className="footer-contacts footer-contacts-column">
          <h4>КОНТАКТЫ</h4>
          <p><Icon name="phone" /><a href={phoneHref}>{settings.contacts.phone}</a></p>
          {settings.contacts.email && <p><Icon name="mail" /><a href={`mailto:${settings.contacts.email}`}>{settings.contacts.email}</a></p>}
          <p><Icon name="pin" /><span>{settings.contacts.address}</span></p>
          <p><Icon name="clock" /><span>{settings.contacts.hours}</span></p>
        </div>
        </div>
        <div className="footer-bottom"><span>© Bullmet 2026</span><span>Собственное производство изделий из металла с элементами дерева.</span></div>
      </Container>
    </footer>
  );
}

function MailLogo() {
  return <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M3.5 6.5A2.5 2.5 0 0 1 6 4h12a2.5 2.5 0 0 1 2.5 2.5v11A2.5 2.5 0 0 1 18 20H6a2.5 2.5 0 0 1-2.5-2.5v-11Zm2.1-.5L12 11.05 18.4 6H5.6Zm13.4 1.58-6.38 5.03a1 1 0 0 1-1.24 0L5 7.58v9.92c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V7.58Z" />
  </svg>;
}
