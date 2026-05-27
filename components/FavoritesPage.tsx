'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header, Footer } from './HomePage';
import { getCurrentSession, type BullmetSession } from '@/lib/auth';
import { readFavorites, removeFavorite, type FavoriteItem } from '@/lib/favorites';

export function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [session, setSession] = useState<BullmetSession | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadFavorites() {
    const current = await getCurrentSession();
    setSession(current);
    setFavorites(await readFavorites(current));
    setLoading(false);
  }

  useEffect(() => {
    loadFavorites();
    window.addEventListener('bullmet-favorites-updated', loadFavorites);
    window.addEventListener('storage', loadFavorites);
    return () => {
      window.removeEventListener('bullmet-favorites-updated', loadFavorites);
      window.removeEventListener('storage', loadFavorites);
    };
  }, []);

  async function deleteFavorite(slug: string) {
    await removeFavorite(slug, session);
    setFavorites((items) => items.filter((item) => item.slug !== slug));
  }

  return (
    <>
      <Header />
      <main className="favoritesPage">
        <section className="container catalogHero favoritesHero">
          <div className="breadcrumbs"><Link href="/">Главная</Link><span>/</span><span>Избранное</span></div>
          <h1 className="pageTitle">Избранное</h1>
          <p>Сохранённые товары Bullmet. Здесь можно быстро вернуться к понравившимся моделям.</p>
        </section>

        <section className="container favoritesStandalone">
          {loading ? (
            <div className="emptyCart"><h2>Загружаем избранное...</h2></div>
          ) : favorites.length ? (
            <div className="favoriteGrid favoriteGrid--standalone">
              {favorites.map((item) => (
                <article className="favoriteCard" key={item.slug}>
                  <Link href={`/catalog/${item.slug}`} className="favoriteCard__image"><Image src={item.image} alt={item.title} fill sizes="260px" /></Link>
                  <div>
                    <Link href={`/catalog/${item.slug}`}><b>{item.title}</b></Link>
                    <p>{item.short || item.category}</p>
                    <strong>от {Number(item.price || 0).toLocaleString('ru-RU')} BYN</strong>
                    <div className="favoriteCard__actions">
                      <Link href={`/catalog/${item.slug}`}>Открыть товар</Link>
                      <button type="button" onClick={() => deleteFavorite(item.slug)}>Убрать</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="emptyCart">
              <h2>В избранном пока пусто</h2>
              <p>Нажимайте на сердечко в каталоге или карточке товара, чтобы сохранить понравившиеся изделия.</p>
              <Link className="button button--orange" href="/catalog">Перейти в каталог</Link>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
