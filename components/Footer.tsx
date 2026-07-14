import Link from 'next/link';
import { getSiteControlSettings, visibleDirections, visibleNavigation } from '@/lib/siteControl';
import { Icon } from './Icon';

export async function Footer() {
  const settings = await getSiteControlSettings();
  const directions = visibleDirections(settings);
  const rawFooterLinks = visibleNavigation(settings, 'footer').filter((item) => item.href !== '/about');
  const companyLinks = rawFooterLinks.length ? rawFooterLinks.slice(0, 4) : [
    { href: '/production', label: 'Производство' },
    { href: '/contacts', label: 'Контакты' }
  ];
  const catalogLinks = (directions.length ? directions : settings.directions.filter((item) => item.key === 'clocks')).slice(0, 4);

  return (
    <footer className="footer-exact">
      <div className="footer-container">
        <div className="footer-grid-exact footer-grid-launch">
        <div className="footer-brand-column">
          <Link href="/" className="brand-exact footer-brand">
            <img src="/logo-shield-check.svg" alt="" className="brand-mark" />
            <span className="brand-text"><b>{settings.general.logoText}</b><small>{settings.general.tagline}</small></span>
          </Link>
          <p className="footer-description">Собственное производство изделий из металла и дерева с 2017 года</p>
          <div className="socials footer-socials"><span aria-label="Instagram"><Icon name="instagram" /></span><span aria-label="Telegram"><Icon name="telegram" /></span><span aria-label="Email"><Icon name="mail" /></span></div>
        </div>
        <nav className="footer-column" aria-label="Каталог">
          <h4>КАТАЛОГ</h4>
          {catalogLinks.map((item) => (
            <Link href={item.href} key={item.key}>{item.title}</Link>
          ))}
        </nav>
        <nav className="footer-column" aria-label="Услуги">
          <h4>УСЛУГИ</h4>
          <Link href="/services#laser">Резка металла</Link>
          <Link href="/services#wood">Резка дерева</Link>
          <Link href="/contacts">Изделия на заказ</Link>
        </nav>
        <nav className="footer-column" aria-label="Компания">
          <h4>КОМПАНИЯ</h4>
          {companyLinks.map((item) => (
            <Link href={item.href} key={`${item.href}-${item.label}`}>{item.label}</Link>
          ))}
        </nav>
        <div className="footer-contacts footer-contacts-column">
          <h4>КОНТАКТЫ</h4>
          <p><Icon name="phone" /><span>{settings.contacts.phone}</span></p>
          {settings.contacts.email && <p><Icon name="mail" /><span>{settings.contacts.email}</span></p>}
          <p><Icon name="pin" /><span>{settings.contacts.address}</span></p>
          <p><Icon name="clock" /><span>{settings.contacts.hours}</span></p>
        </div>
        </div>
      </div>
    </footer>
  );
}
