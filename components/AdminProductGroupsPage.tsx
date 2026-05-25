'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { type AdminProduct, makeSlug, saveAdminProductAsync } from './adminProductStore';
import { useAdminProducts } from './useAdminProducts';
import { getImageSettings } from '../lib/imageDisplay';

function groupTitle(groupId: string, products: AdminProduct[]) {
  const master = products.find((item) => item.slug === groupId) ?? products[0];
  return master?.title?.replace(/\s[-—–]\s.+$/, '') || groupId;
}

function uniqueGroupIds(items: AdminProduct[]) {
  return Array.from(new Set(items.map((item) => item.colorGroupId).filter(Boolean) as string[]));
}

export function AdminProductGroupsPage() {
  const { items, ready, error } = useAdminProducts();
  const [search, setSearch] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [colorDrafts, setColorDrafts] = useState<Record<string, string>>({});

  const visibleProducts = useMemo(() => {
    const value = search.toLowerCase().trim();
    if (!value) return items;
    return items.filter((item) => `${item.title} ${item.category} ${item.material} ${item.colorName} ${item.slug}`.toLowerCase().includes(value));
  }, [items, search]);

  const grouped = useMemo(() => {
    return uniqueGroupIds(items).map((id) => {
      const products = items.filter((item) => item.colorGroupId === id || item.slug === id);
      return { id, title: groupTitle(id, products), products };
    }).filter((group) => group.products.length > 0);
  }, [items]);

  function toggleSelected(slug: string) {
    setSelected((current) => current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]);
  }

  async function createGroup() {
    setMessage('');
    if (selected.length < 2) {
      setMessage('Выберите минимум два товара, чтобы создать группу цветов.');
      return;
    }
    setSaving(true);
    try {
      const selectedProducts = items.filter((item) => selected.includes(item.slug));
      const id = makeSlug(groupName || selectedProducts[0]?.title || `group-${Date.now()}`);
      await Promise.all(selectedProducts.map((item, index) => saveAdminProductAsync({
        ...item,
        colorGroupId: id,
        colorName: item.colorName || item.title.replace(groupName, '').replace(/[—–-]/g, '').trim() || `Цвет ${index + 1}`,
        colorHex: item.colorHex || '#111111',
      })));
      setSelected([]);
      setGroupName('');
      setMessage('Группа создана. Карточки останутся отдельными в каталоге, а на странице товара появится переключатель цветов.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Не удалось создать группу.');
    } finally {
      setSaving(false);
    }
  }

  async function saveGroup(groupId: string) {
    setMessage('');
    setSaving(true);
    try {
      const products = items.filter((item) => item.colorGroupId === groupId || item.slug === groupId);
      await Promise.all(products.map((item) => saveAdminProductAsync({
        ...item,
        colorGroupId: groupId,
        colorName: colorDrafts[item.slug] ?? item.colorName ?? item.title,
      })));
      setMessage('Группа сохранена.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Не удалось сохранить группу.');
    } finally {
      setSaving(false);
    }
  }

  async function removeFromGroup(product: AdminProduct) {
    setMessage('');
    setSaving(true);
    try {
      await saveAdminProductAsync({ ...product, colorGroupId: '', colorName: '', colorHex: '#111111' });
      setMessage('Товар удален из группы.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Не удалось удалить товар из группы.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteGroup(groupId: string) {
    if (!window.confirm('Разъединить все товары в этой группе?')) return;
    setSaving(true);
    try {
      const products = items.filter((item) => item.colorGroupId === groupId || item.slug === groupId);
      await Promise.all(products.map((item) => saveAdminProductAsync({ ...item, colorGroupId: '', colorName: '', colorHex: '#111111' })));
      setMessage('Группа разъединена.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Не удалось разъединить группу.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout title="Группы товаров">
      <main className="adminContent adminGroupsPage">
        <div className="adminPageHead">
          <div>
            <p>Контент / Каталог товаров</p>
            <h2>Группы цветов и моделей</h2>
          </div>
          <Link className="adminSecondaryBtn" href="/admin/products">К товарам</Link>
        </div>

        <section className="adminCard adminGroupBuilder">
          <div className="adminGroupBuilder__head">
            <div>
              <h3>Создать группу из готовых карточек</h3>
              <p>Сначала создайте отдельные товары для каждого цвета. Потом выберите их здесь и объедините в одну модель. В каталоге они останутся отдельными карточками, а на странице товара будут переключаться как цвета.</p>
            </div>
            <div className="adminGroupBuilder__actions">
              <input value={groupName} onChange={(event) => setGroupName(event.target.value)} placeholder="Название группы, например: Часы волна" />
              <button className="adminPrimaryBtn" type="button" onClick={createGroup} disabled={saving || selected.length < 2}>{saving ? 'Сохраняем...' : `Объединить (${selected.length})`}</button>
            </div>
          </div>
          <div className="adminSearchField"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Найти товар по названию, категории, материалу или цвету" /></div>
          {message && <p className="adminInlineMessage">{message}</p>}
          {error && <p className="adminUploadError">Не удалось загрузить товары: {error}</p>}
          <div className="adminGroupProductGrid">
            {!ready && <div className="adminEmpty">Загружаем товары...</div>}
            {ready && visibleProducts.map((product) => {
              const settings = getImageSettings(product, product.image);
              return (
                <label className={`adminGroupProductCard ${selected.includes(product.slug) ? 'isSelected' : ''}`} key={product.slug}>
                  <input type="checkbox" checked={selected.includes(product.slug)} onChange={() => toggleSelected(product.slug)} />
                  <span className="adminGroupProductCard__image"><Image src={product.image} alt="" fill sizes="120px" style={{ objectFit: settings.catalogFit, objectPosition: settings.catalogPosition }} /></span>
                  <span className="adminGroupProductCard__body"><b>{product.title}</b><em>{product.colorName || 'цвет не указан'}</em><small>{product.colorGroupId ? `Группа: ${product.colorGroupId}` : 'без группы'}</small></span>
                </label>
              );
            })}
          </div>
        </section>

        <section className="adminGroupsList">
          <div className="adminSectionTitle"><h3>Созданные группы</h3><span>{grouped.length} групп</span></div>
          {grouped.map((group) => (
            <article className="adminCard adminGroupCard" key={group.id}>
              <div className="adminGroupCard__head">
                <div><h4>{group.title}</h4><p>ID группы: {group.id}</p></div>
                <div><button className="adminSecondaryBtn" type="button" onClick={() => saveGroup(group.id)} disabled={saving}>Сохранить группу</button><button className="adminDangerBtn" type="button" onClick={() => deleteGroup(group.id)} disabled={saving}>Разъединить</button></div>
              </div>
              <div className="adminGroupRows">
                {group.products.map((product) => {
                  const settings = getImageSettings(product, product.image);
                  return (
                    <div className="adminGroupRow" key={product.slug}>
                      <div className="adminGroupRow__product"><span><Image src={product.image} alt="" fill sizes="72px" style={{ objectFit: settings.catalogFit, objectPosition: settings.catalogPosition }} /></span><div><b>{product.title}</b><small>{product.slug}</small></div></div>
                      <label>Название цвета<input value={colorDrafts[product.slug] ?? product.colorName ?? ''} onChange={(event) => setColorDrafts((current) => ({ ...current, [product.slug]: event.target.value }))} placeholder="Черный / белый / дуб" /></label>
                      <div className="adminGroupRow__actions"><Link href={`/admin/products/${product.slug}/edit`}>Редактировать</Link><button type="button" onClick={() => removeFromGroup(product)} disabled={saving}>Убрать из группы</button></div>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
          {ready && grouped.length === 0 && <section className="adminCard adminEmpty">Групп пока нет. Выберите несколько товаров выше и нажмите «Объединить».</section>}
        </section>
      </main>
    </AdminLayout>
  );
}
