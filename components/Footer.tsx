import Link from 'next/link';
import { Icon } from './Icon';

export function Footer() {
  return (
    <footer className="footer-exact">
      <div className="home-container footer-grid-exact">
        <div>
          <Link href="/" className="brand-exact footer-brand">
            <span className="brand-mark" />
            <span className="brand-text"><b>BULLMET</b><small>производство металла и дерева</small></span>
          </Link>
          <p>Собственное производство изделий<br/>из металла с элементами дерева с 2017 года</p>
          <div className="socials"><span><Icon name="instagram" /></span><span><Icon name="telegram" /></span><span><Icon name="mail" /></span></div>
        </div>
        <div><h4>КАТАЛОГ</h4><Link href="/catalog">Часы</Link><Link href="/catalog">Садовые качели</Link><Link href="/catalog">Изделия из металла</Link><Link href="/catalog">Изделия из дерева</Link></div>
        <div><h4>УСЛУГИ</h4><Link href="/services">Резка металла</Link><Link href="/services">Резка дерева</Link><Link href="/services">Индивидуальные заказы</Link></div>
        <div><h4>КОМПАНИЯ</h4><Link href="/about">О нас</Link><Link href="/#production">Производство</Link><Link href="/cart">Доставка и оплата</Link><Link href="/contacts">Контакты</Link></div>
        <div className="footer-contacts"><h4>КОНТАКТЫ</h4><p><Icon name="phone" /> +375 29 123-45-67</p><p><Icon name="mail" /> info@bullmet.by</p><p><Icon name="pin" /> г. Минск, ул. Промышленная, 11</p><p><Icon name="clock" /> Пн–Пт: 9:00 — 18:00</p></div>
      </div>
    </footer>
  );
}
