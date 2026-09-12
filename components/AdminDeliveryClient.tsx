'use client';

import { useMemo, useState } from 'react';
import { Archive, Bike, Box, ChevronDown, ChevronUp, Clock3, MapPin, MoreHorizontal, Package, Plus, Save, Store, Truck, X } from 'lucide-react';
import type { AdminOrder } from '@/lib/adminCommerce';
import type { DeliveryMethod, SiteControlSettings } from '@/lib/siteControl';

const icons = { store: Store, truck: Truck, package: Package, 'map-pin': MapPin, bike: Bike, box: Box };

function money(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value) + ' BYN';
}

function methodPrice(method: DeliveryMethod) {
  if (method.pricingType === 'free') return 'Бесплатно';
  if (method.pricingType === 'carrier') return 'По тарифам';
  return money(Number(method.price || 0));
}

function methodTime(method: DeliveryMethod) {
  if (method.estimatedMinDays === null || method.estimatedMinDays === undefined) return 'Срок уточняется';
  const end = method.estimatedMaxDays ?? method.estimatedMinDays;
  return method.estimatedMinDays === end ? String(end) + ' раб. день' : String(method.estimatedMinDays) + '–' + String(end) + ' рабочих дня';
}

function emptyMethod(index: number): DeliveryMethod {
  return {
    id: 'delivery_' + Date.now(),
    title: 'Новый способ получения',
    description: 'Укажите условия получения заказа.',
    note: 'Черновик',
    enabled: false,
    archived: false,
    order: index + 1,
    type: 'delivery',
    icon: 'truck',
    pricingType: 'fixed',
    price: 0,
    freeFromAmount: null,
    estimatedMinDays: 1,
    estimatedMaxDays: 3,
    workingDaysOnly: true,
    coverage: 'all_belarus',
    cities: []
  };
}

export function AdminDeliveryClient({ initialSettings, orders }: { initialSettings: SiteControlSettings; orders: AdminOrder[] }) {
  const [settings, setSettings] = useState(initialSettings);
  const [selectedId, setSelectedId] = useState(initialSettings.commerce.deliveryMethods[0]?.id || '');
  const [editing, setEditing] = useState<DeliveryMethod | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const methods = [...settings.commerce.deliveryMethods].sort((a, b) => a.order - b.order);
  const selected = methods.find((method) => method.id === selectedId) || methods[0];
  const activeMethods = methods.filter((method) => method.enabled && !method.archived);
  const usages = useMemo(() => methods.map((method) => ({
    id: method.id,
    total: orders.filter((order) => (order.delivery || '').toLowerCase() === method.title.toLowerCase()).length
  })), [methods, orders]);
  const usageTotal = usages.reduce((sum, usage) => sum + usage.total, 0);

  function replaceMethod(next: DeliveryMethod) {
    setSettings((current) => ({
      ...current,
      commerce: { ...current.commerce, deliveryMethods: current.commerce.deliveryMethods.map((method) => method.id === next.id ? next : method) }
    }));
  }

  function patchMethod(id: string, patch: Partial<DeliveryMethod>) {
    const current = methods.find((method) => method.id === id);
    if (current) replaceMethod({ ...current, ...patch });
  }

  function move(id: string, direction: -1 | 1) {
    const index = methods.findIndex((method) => method.id === id);
    const other = methods[index + direction];
    if (index < 0 || !other) return;
    const first = methods[index];
    patchMethod(first.id, { order: other.order });
    patchMethod(other.id, { order: first.order });
  }

  function create() {
    const method = emptyMethod(methods.length);
    setSettings((current) => ({ ...current, commerce: { ...current.commerce, deliveryMethods: [...current.commerce.deliveryMethods, method] } }));
    setSelectedId(method.id);
    setEditing(method);
  }

  function archive(id: string) {
    const method = methods.find((item) => item.id === id);
    if (!method || !window.confirm('Переместить способ «' + method.title + '» в архив?')) return;
    patchMethod(id, { archived: true, enabled: false });
  }

  async function save() {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/site-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Не удалось сохранить настройки.');
      setSettings(result.settings || settings);
      setMessage('Настройки доставки сохранены и применяются на этапе оформления заказа.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось сохранить настройки.');
    } finally {
      setSaving(false);
    }
  }

  return <div className="delivery-admin-v1">
    <section className="delivery-admin-head-v1">
      <div><h1>Доставка</h1><p>Настройте способы получения заказов, стоимость и условия доставки.</p></div>
      <div><button type="button" className="delivery-primary-v1" onClick={create}><Plus size={18} />Добавить способ</button><button type="button" className="delivery-save-v1" onClick={() => void save()} disabled={saving}><Save size={17} />{saving ? 'Сохраняем…' : 'Сохранить'}</button></div>
    </section>
    {message && <p className="delivery-message-v1">{message}</p>}

    <div className="delivery-admin-layout-v1">
      <div className="delivery-admin-main-v1">
        <section className="delivery-panel-v1">
          <header><div><h2>Способы получения</h2><p>Активные способы показываются покупателям в checkout. Перемещайте их, чтобы задать порядок.</p></div><b>{activeMethods.length} активно</b></header>
          <div className="delivery-methods-v1">
            {methods.map((method) => {
              const Icon = icons[method.icon || 'truck'];
              return <article key={method.id} className={(method.enabled && !method.archived ? 'active ' : '') + (method.archived ? 'archived' : '')}>
                <button type="button" className="delivery-drag-v1" aria-label="Выбрать способ" onClick={() => setSelectedId(method.id)}><Icon size={22} /></button>
                <div className="delivery-method-info-v1" onClick={() => setSelectedId(method.id)} role="button" tabIndex={0}>
                  <div><b>{method.title}</b>{method.enabled && !method.archived ? <em>Активен</em> : <em className="muted">{method.archived ? 'В архиве' : 'Неактивен'}</em>}</div>
                  <span>{method.description || 'Описание для покупателя не заполнено'}</span>
                </div>
                <div className="delivery-method-meta-v1"><span>Стоимость<b>{methodPrice(method)}</b></span><span>Срок<b>{methodTime(method)}</b></span><span>Зона<b>{method.coverage === 'minsk' ? 'Минск' : 'Вся Беларусь'}</b></span></div>
                <label className="delivery-switch-v1"><input type="checkbox" checked={Boolean(method.enabled && !method.archived)} onChange={(event) => patchMethod(method.id, { enabled: event.target.checked, archived: false })}/><i /></label>
                <div className="delivery-order-v1"><button type="button" onClick={() => move(method.id, -1)} aria-label="Выше"><ChevronUp size={15} /></button><b>{method.order}</b><button type="button" onClick={() => move(method.id, 1)} aria-label="Ниже"><ChevronDown size={15} /></button></div>
                <button type="button" className="delivery-more-v1" onClick={() => setEditing(method)} aria-label="Настроить"><MoreHorizontal size={20} /></button>
              </article>;
            })}
          </div>
        </section>

        <section className="delivery-free-v1">
          <header><div><Truck size={21}/><div><h2>Настройки бесплатной доставки</h2><p>Условия применяются автоматически при расчёте заказа.</p></div></div><label className="delivery-switch-v1"><input type="checkbox" checked={settings.commerce.deliverySettings.freeDeliveryEnabled} onChange={(event) => setSettings((current) => ({ ...current, commerce: { ...current.commerce, deliverySettings: { ...current.commerce.deliverySettings, freeDeliveryEnabled: event.target.checked } } }))}/><i /></label></header>
          <div className="delivery-free-form-v1"><label>Бесплатная доставка от суммы<input type="number" min="0" value={settings.commerce.deliverySettings.freeDeliveryFrom} onChange={(event) => setSettings((current) => ({ ...current, commerce: { ...current.commerce, deliverySettings: { ...current.commerce.deliverySettings, freeDeliveryFrom: Number(event.target.value) || 0 } } }))}/><span>BYN</span></label><label>Применять<input value={settings.commerce.deliverySettings.freeDeliveryScope === 'delivery_only' ? 'Только к доставке' : 'Ко всем платным способам'} readOnly /></label></div>
        </section>

        <section className="delivery-bottom-v1">
          <article><header><MapPin size={21}/><div><h2>Адрес самовывоза</h2><p>Используется в checkout и заказах.</p></div></header><p>{settings.contacts.address}</p><p>{settings.contacts.hours}</p></article>
          <article><header><Box size={21}/><div><h2>Дополнительные настройки</h2><p>Информация, которую видит покупатель.</p></div></header>{[
            ['showEstimatedDates', 'Показывать сроки доставки'],
            ['showInstruction', 'Показывать инструкции'],
            ['showPickupAddress', 'Показывать адрес самовывоза'],
            ['allowComment', 'Разрешить комментарий к доставке']
          ].map(([key, label]) => <label key={key} className="delivery-inline-toggle-v1"><span>{label}</span><input type="checkbox" checked={Boolean(settings.commerce.deliverySettings[key as keyof typeof settings.commerce.deliverySettings])} onChange={(event) => setSettings((current) => ({ ...current, commerce: { ...current.commerce, deliverySettings: { ...current.commerce.deliverySettings, [key]: event.target.checked } } }))}/><i /></label>)}</article>
        </section>
      </div>

      <aside className="delivery-aside-v1">
        <section className="delivery-preview-v1"><header><h2>Предпросмотр на сайте</h2><span>Так способы получения увидит покупатель.</span></header><div><h3>Получение заказа</h3>{activeMethods.length ? activeMethods.map((method, index) => <label key={method.id} className={index === 0 ? 'checked' : ''}><input type="radio" checked={index === 0} readOnly/><span><b>{method.title}</b><small>{method.description}</small></span><strong>{methodPrice(method)}</strong></label>) : <p>Нет активных способов получения.</p>}</div></section>
        <section className="delivery-stat-v1"><header><Clock3 size={20}/><div><h2>Статистика</h2><p>Использование способов в реальных заказах.</p></div></header>{methods.filter((method) => !method.archived).map((method) => { const count = usages.find((usage) => usage.id === method.id)?.total || 0; const percent = usageTotal ? Math.round(count / usageTotal * 100) : 0; return <div className="delivery-stat-row-v1" key={method.id}><span><b>{method.title}</b><em>{count} заказов</em></span><i><u style={{ width: percent + '%' }} /></i><small>{percent}%</small></div>; })}</section>
      </aside>
    </div>

    {editing && <div className="delivery-drawer-wrap-v1"><button className="delivery-drawer-backdrop-v1" aria-label="Закрыть" onClick={() => setEditing(null)} /><form className="delivery-drawer-v1" onSubmit={(event) => { event.preventDefault(); replaceMethod(editing); setEditing(null); }}><header><div><p>Настройка способа</p><h2>{editing.title || 'Новый способ'}</h2></div><button type="button" onClick={() => setEditing(null)}><X /></button></header><div className="delivery-edit-grid-v1"><label>Название<input value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })}/></label><label>Тип<select value={editing.type} onChange={(event) => setEditing({ ...editing, type: event.target.value as DeliveryMethod['type'] })}><option value="pickup">Самовывоз</option><option value="delivery">Доставка</option><option value="courier">Курьер</option><option value="pickup_point">Пункт выдачи</option><option value="other">Другое</option></select></label><label className="wide">Описание для покупателя<textarea value={editing.description} onChange={(event) => setEditing({ ...editing, description: event.target.value })}/></label><label>Стоимость<select value={editing.pricingType} onChange={(event) => setEditing({ ...editing, pricingType: event.target.value as DeliveryMethod['pricingType'] })}><option value="free">Бесплатно</option><option value="fixed">Фиксированная</option><option value="carrier">По тарифам</option></select></label><label>Цена, BYN<input type="number" min="0" disabled={editing.pricingType !== 'fixed'} value={editing.price || 0} onChange={(event) => setEditing({ ...editing, price: Number(event.target.value) || 0 })}/></label><label>Минимум дней<input type="number" min="0" value={editing.estimatedMinDays ?? ''} onChange={(event) => setEditing({ ...editing, estimatedMinDays: event.target.value === '' ? null : Number(event.target.value) })}/></label><label>Максимум дней<input type="number" min="0" value={editing.estimatedMaxDays ?? ''} onChange={(event) => setEditing({ ...editing, estimatedMaxDays: event.target.value === '' ? null : Number(event.target.value) })}/></label><label>Зона<select value={editing.coverage} onChange={(event) => setEditing({ ...editing, coverage: event.target.value as DeliveryMethod['coverage'] })}><option value="all_belarus">Вся Беларусь</option><option value="minsk">Минск</option><option value="cities">Выбранные города</option><option value="custom">Индивидуально</option></select></label><label>Бесплатно от, BYN<input type="number" min="0" value={editing.freeFromAmount ?? ''} onChange={(event) => setEditing({ ...editing, freeFromAmount: event.target.value === '' ? null : Number(event.target.value) })}/></label><label className="wide">Инструкция для покупателя<textarea value={editing.customerInstruction || ''} onChange={(event) => setEditing({ ...editing, customerInstruction: event.target.value })}/></label></div><footer><button type="button" className="danger" onClick={() => { archive(editing.id); setEditing(null); }}><Archive size={16}/>В архив</button><button className="delivery-primary-v1">Сохранить способ</button></footer></form></div>}
  </div>;
}
