import Link from 'next/link';
import { getSiteControlSettings, visibleDirections, visibleNavigation } from '@/lib/siteControl';
import { Icon } from './Icon';

export async function Footer() {
  const settings = await getSiteControlSettings();
  const directions = visibleDirections(settings);
  const rawFooterLinks = visibleNavigation(settings, 'footer').filter((item) => item.href !== '/about');
  const footerLinks = rawFooterLinks.some((item) => item.href === '/services')
    ? rawFooterLinks
    : [{ href: '/services', label: 'Услуги' }, ...rawFooterLinks];
  const companyLinks = [
    { href: '/services', label: 'Услуги' },
    { href: '/production', label: 'Производство' },
    { href: '/contacts', label: 'Контакты' }
  ];

  return (
    <footer className="footer-exact">
      <div className="home-container footer-grid-exact footer-grid-launch">
        <div>
          <Link href="/" className="brand-exact footer-brand">
            <img src="/logo-shield-check.svg" alt="" className="brand-mark" />
            <span className="brand-text"><b>{settings.general.logoText}</b><small>{settings.general.tagline}</small></span>
          </Link>
          <p>Настенные часы и изделия из металла с элементами дерева собственного производства Bullmet.</p>
          <div className="socials"><span><Icon name="instagram" /></span><span><Icon name="telegram" /></span><span><Icon name="mail" /></span></div>
        </div>
        <div>
          <h4>КАТАЛОГ</h4>
          {(directions.length ? directions : settings.directions.filter((item) => item.key === 'clocks')).slice(0, 5).map((item) => (
            <Link href={item.href} key={item.key}>{item.title}</Link>
          ))}
          <Link href="/cart">Корзина</Link>
        </div>
        <div>
          <h4>ИНФОРМАЦИЯ</h4>
          {(footerLinks.length ? footerLinks : companyLinks).slice(0, 6).map((item) => (
            <Link href={item.href} key={`${item.href}-${item.label}`}>{item.label}</Link>
          ))}
        </div>
        <div className="footer-contacts">
          <h4>КОНТАКТЫ</h4>
          <p><Icon name="phone" /><span>{settings.contacts.phone}</span></p>
          {settings.contacts.email && <p><Icon name="mail" /><span>{settings.contacts.email}</span></p>}
          <p><Icon name="pin" /><span>{settings.contacts.address}</span></p>
          <p><Icon name="clock" /><span>{settings.contacts.hours}</span></p>
        </div>
      </div>
    </footer>
  );
}
