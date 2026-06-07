import Link from 'next/link';
import { Icon } from './Icon';

export function Header() {
  return (
    <header className="site-header-exact">
      <div className="home-container header-inner-exact">
        <Link href="/" className="brand-exact" aria-label="Bullmet">
          <span className="brand-mark" />
          <span className="brand-text"><b>BULLMET</b><small>производство металла и дерева</small></span>
        </Link>
        <nav className="nav-exact">
          <Link href="/catalog">КАТАЛОГ</Link>
          <Link href="/#production">ПРОИЗВОДСТВО</Link>
          <Link href="/services">УСЛУГИ</Link>
          <Link href="/about">О КОМПАНИИ</Link>
          <Link href="/contacts">КОНТАКТЫ</Link>
        </nav>
        <div className="header-actions-exact">
          <button aria-label="Поиск" className="icon-btn"><Icon name="search" /></button>
          <Link href="/cart" className="cart-mini" aria-label="Корзина"><Icon name="cart" /><span>2</span></Link>
          <Link href="/login" className="login-btn"><Icon name="user" /><span>Войти</span></Link>
          <Link href="/contacts" className="calc-btn">ЗАКАЗАТЬ РАСЧЕТ</Link>
        </div>
      </div>
    </header>
  );
}
