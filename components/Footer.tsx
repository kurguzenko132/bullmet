import Link from 'next/link';
import { Icon } from './Icon';

export function Footer() {
  return (
    <footer className="footer-exact">
      <div className="home-container footer-grid-exact footer-grid-launch">
        <div>
          <Link href="/" className="brand-exact footer-brand">
            <img src="/logo-shield-check.svg" alt="" className="brand-mark" />
            <span className="brand-text"><b>BULLMET</b><small>металл с элементами дерева</small></span>
          </Link>
          <p>Производство металлоизделий Bullmet.<br/>Первый публичный запуск — настенные часы собственного производства.</p>
          <div className="socials"><span><Icon name="instagram" /></span><span><Icon name="telegram" /></span><span><Icon name="mail" /></span></div>
        </div>
        <div><h4>КАТАЛОГ</h4><Link href="/catalog">Настенные часы</Link><Link href="/catalog?category=Классика">Классика</Link><Link href="/catalog?category=Кофе и кухня">Кофе и кухня</Link><Link href="/cart">Корзина</Link></div>
        <div><h4>КОМПАНИЯ</h4><Link href="/about">О компании</Link><Link href="/production">Производство</Link><Link href="/contacts">Контакты</Link></div>
        <div className="footer-contacts">
          <h4>КОНТАКТЫ</h4>
          <p><Icon name="phone" /><span>+375 29 802 70 61</span></p>
          <p><Icon name="pin" /><span>Брестская обл., Ивацевичский р-н, д. Булла, ул. Школьная 10А</span></p>
          <p><Icon name="clock" /><span>ПН–ПТ: 9:00–18:00</span></p>
        </div>
      </div>
    </footer>
  );
}
