'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { deleteAdminProductAsync } from './adminProductStore';
import { useAdminProducts } from './useAdminProducts';
import { categories } from './shopData';
import { EditIcon, PlusIcon, TrashIcon } from './AdminLayout';

export function AdminProductsPage() {
  const { items, ready, error } = useAdminProducts();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Все категории');

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const byQuery = !query || `${item.title} ${item.category} ${item.clockTheme ?? ''} ${item.material}`.toLowerCase().includes(query.toLowerCase());
      const byCategory = category === 'Все категории' || item.category === category;
      return byQuery && byCategory;
    });
  }, [items, query, category]);

  async function remove(slug: string) {
    if (window.confirm('Удалить товар? Если Supabase подключен, товар удалится из базы.')) {
      await deleteAdminProductAsync(slug);
    }
  }

  return (
    <AdminLayout title="Каталог товаров">
      <main className="adminContent adminProductsPage">
        <div className="adminPageHead">
          <div>
            <p>Контент / Каталог товаров</p>
            <h2>Товары Bullmet</h2>
          </div>
          <Link className="adminPrimaryBtn" href="/admin/products/new"><PlusIcon />Добавить товар</Link>
        </div>

        <section className="adminCard adminProductsToolbar">
          <div className="adminSearchField"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по названию, категории или материалу" /></div>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option>Все категории</option>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
          <div className="adminProductsCounter">{ready ? `${filtered.length} товаров` : 'Загрузка...'}</div>
        </section>

        {error && <section className="adminUploadError">Не удалось загрузить товары: {error}</section>}

        <section className="adminCard adminProductsTable">
          <div className="adminProductsHeader">
            <span>Товар</span><span>Категория</span><span>Цена</span><span>Статус</span><span>Действия</span>
          </div>
          {filtered.map((product) => (
            <div className="adminProductsRow" key={product.slug}>
              <div className="adminProductMain">
                <Image src={product.image} alt="" width={62} height={62} />
                <div><b>{product.title}</b><small>{product.material}</small>{product.colorName ? <span className="adminVariantCount">Цвет: {product.colorName}</span> : null}{product.colorGroupId ? <span className="adminVariantCount">Группа: {product.colorGroupId}</span> : null}<em>{product.slug}</em></div>
              </div>
              <span>{product.category}{product.clockTheme ? <small className="adminCategorySub">{product.clockTheme}</small> : null}</span>
              <strong>{product.price} BYN {product.oldPrice && <small>{product.oldPrice} BYN</small>}</strong>
              <div className="adminProductFlags">
                <i className={product.status === 'draft' ? 'draft' : 'active'}>{product.status === 'draft' ? 'Черновик' : 'Активен'}</i>
                {product.inStock && <i>В наличии</i>}
                {product.isPopular && <i>Популярный</i>}
              </div>
              <div className="adminProductActions">
                <Link href={`/catalog/${product.slug}`} title="Открыть товар">Сайт</Link>
                <Link href={`/admin/products/${product.slug}/edit`} title="Редактировать"><EditIcon /></Link>
                <button type="button" onClick={() => remove(product.slug)} title="Удалить"><TrashIcon /></button>
              </div>
            </div>
          ))}
          {!ready && <div className="adminEmpty">Загружаем товары из Supabase...</div>}
          {ready && filtered.length === 0 && <div className="adminEmpty">Товары не найдены</div>}
        </section>
      </main>
    </AdminLayout>
  );
}
