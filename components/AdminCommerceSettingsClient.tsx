'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, CircleDollarSign, CopyPlus, CreditCard, Eye, EyeOff, Save, ShieldCheck, Ticket, Truck, X } from 'lucide-react';
import type { CommerceOption, CouponRule, SiteControlSettings } from '@/lib/siteControl';

type Mode = 'delivery' | 'payment' | 'coupons';

const copy: Record<Mode, { eyebrow: string; title: string; description: string; icon: typeof Truck; optionsKey?: 'deliveryMethods' | 'paymentMethods' }> = {
  delivery: {
    eyebrow: 'Интернет-магазин',
    title: 'Доставка и получение',
    description: 'Выберите способы получения, которые увидит покупатель на этапе оформления заказа.',
    icon: Truck,
    optionsKey: 'deliveryMethods'
  },
  payment: {
    eyebrow: 'Интернет-магазин',
    title: 'Оплата заказов',
    description: 'Управляйте доступными способами оплаты. Неподключённые методы можно оставить выключенными до запуска.',
    icon: CreditCard,
    optionsKey: 'paymentMethods'
  },
  coupons: {
    eyebrow: 'Маркетинг',
    title: 'Купоны и скидки',
    description: 'Создавайте промокоды, включайте или отключайте акции и контролируйте условия скидок.',
    icon: Ticket
  }
};

function id(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function AdminCommerceSettingsClient({ initialSettings, mode }: { initialSettings: SiteControlSettings; mode: Mode }) {
  const [settings, setSettings] = useState(initialSettings);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const content = copy[mode];
  const Icon = content.icon;
  const options = content.optionsKey ? settings.commerce[content.optionsKey] : [];
  const enabled = useMemo(() => options.filter((item) => item.enabled).length, [options]);
  const activeCoupons = useMemo(() => settings.commerce.couponRules.filter((item) => item.enabled).length, [settings.commerce.couponRules]);

  function updateOption(optionId: string, patch: Partial<CommerceOption>) {
    if (!content.optionsKey) return;
    setSettings((current) => ({
      ...current,
      commerce: {
        ...current.commerce,
        [content.optionsKey!]: current.commerce[content.optionsKey!].map((item) => item.id === optionId ? { ...item, ...patch } : item)
      }
    }));
  }

  function addOption() {
    if (!content.optionsKey) return;
    const item: CommerceOption = {
      id: id(mode), title: 'Новый способ', description: 'Опишите условия для покупателя.', enabled: false, note: 'Черновик', order: options.length + 1
    };
    setSettings((current) => ({ ...current, commerce: { ...current.commerce, [content.optionsKey!]: [...current.commerce[content.optionsKey!], item] } }));
  }

  function removeOption(optionId: string) {
    if (!content.optionsKey || !window.confirm('Удалить этот способ?')) return;
    setSettings((current) => ({ ...current, commerce: { ...current.commerce, [content.optionsKey!]: current.commerce[content.optionsKey!].filter((item) => item.id !== optionId) } }));
  }

  function updateCoupon(couponId: string, patch: Partial<CouponRule>) {
    setSettings((current) => ({ ...current, commerce: { ...current.commerce, couponRules: current.commerce.couponRules.map((item) => item.id === couponId ? { ...item, ...patch } : item) } }));
  }

  function addCoupon() {
    const coupon: CouponRule = { id: id('coupon'), code: 'НОВЫЙ10', type: 'percent', value: 10, enabled: false, note: 'Опишите условие действия промокода' };
    setSettings((current) => ({ ...current, commerce: { ...current.commerce, couponRules: [coupon, ...current.commerce.couponRules] } }));
  }

  function removeCoupon(couponId: string) {
    if (!window.confirm('Удалить этот промокод?')) return;
    setSettings((current) => ({ ...current, commerce: { ...current.commerce, couponRules: current.commerce.couponRules.filter((item) => item.id !== couponId) } }));
  }

  async function save() {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/site-control', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ settings }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Не удалось сохранить изменения.');
      setSettings(result.settings || settings);
      setMessage('Сохранено. Данные доступны в настройках магазина и используются при оформлении заказа.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось сохранить изменения.');
    } finally {
      setSaving(false);
    }
  }

  return <div className="admin-commerce-settings">
    <section className="admin-commerce-settings-hero">
      <div><p>{content.eyebrow}</p><h1><Icon size={28} /> {content.title}</h1><span>{content.description}</span></div>
      <div><Link href="/admin/settings">Общие настройки</Link><button type="button" onClick={save} disabled={saving}><Save size={17} />{saving ? 'Сохраняем…' : 'Сохранить изменения'}</button></div>
    </section>
    {message && <p className="admin-commerce-settings-message">{message}</p>}

    {mode !== 'coupons' ? <>
      <section className="admin-commerce-overview">
        <article><b>{enabled}</b><span>активно на сайте</span></article>
        <article><b>{options.length}</b><span>всего вариантов</span></article>
        <article><ShieldCheck size={23} /><span>покупатель видит только включённые способы</span></article>
      </section>
      <section className="admin-commerce-editor-card">
        <header><div><h2>Доступные варианты</h2><span>Изменения сохраняются отдельно от кода и доступны для самостоятельной настройки.</span></div><button type="button" onClick={addOption}><CopyPlus size={16} />Добавить вариант</button></header>
        <div className="admin-commerce-option-list">
          {options.map((item) => <article key={item.id} className={item.enabled ? 'is-enabled' : ''}>
            <button type="button" className="admin-commerce-visibility" onClick={() => updateOption(item.id, { enabled: !item.enabled })} aria-label={item.enabled ? 'Скрыть вариант' : 'Показать вариант'}>{item.enabled ? <Eye size={18} /> : <EyeOff size={18} />}</button>
            <div className="admin-commerce-option-fields">
              <label>Название<input value={item.title} onChange={(event) => updateOption(item.id, { title: event.target.value })} /></label>
              <label>Порядок<input type="number" min="1" value={item.order} onChange={(event) => updateOption(item.id, { order: Number(event.target.value) || item.order })} /></label>
              <label className="span-2">Описание для покупателя<input value={item.description} onChange={(event) => updateOption(item.id, { description: event.target.value })} /></label>
              <label className="span-2">Внутренняя заметка<input value={item.note} onChange={(event) => updateOption(item.id, { note: event.target.value })} /></label>
            </div>
            <button type="button" className="admin-commerce-delete" onClick={() => removeOption(item.id)} aria-label="Удалить вариант"><X size={17} /></button>
          </article>)}
        </div>
      </section>
    </> : <>
      <section className="admin-commerce-overview">
        <article><b>{activeCoupons}</b><span>активных купонов</span></article>
        <article><b>{settings.commerce.couponRules.length}</b><span>создано правил</span></article>
        <article><CircleDollarSign size={23} /><span>включайте промокод только после проверки маржи</span></article>
      </section>
      <section className="admin-commerce-editor-card">
        <header><div><h2>Промокоды</h2><span>Создайте правило и включите его, когда акция готова к запуску.</span></div><button type="button" onClick={addCoupon}><CopyPlus size={16} />Создать промокод</button></header>
        <div className="admin-coupon-list">
          {settings.commerce.couponRules.length ? settings.commerce.couponRules.map((coupon) => <article key={coupon.id} className={coupon.enabled ? 'is-enabled' : ''}>
            <button type="button" className="admin-commerce-visibility" onClick={() => updateCoupon(coupon.id, { enabled: !coupon.enabled })} aria-label={coupon.enabled ? 'Отключить промокод' : 'Включить промокод'}>{coupon.enabled ? <Check size={18} /> : <EyeOff size={18} />}</button>
            <label>Код<input value={coupon.code} onChange={(event) => updateCoupon(coupon.id, { code: event.target.value.toUpperCase() })} /></label>
            <label>Тип<select value={coupon.type} onChange={(event) => updateCoupon(coupon.id, { type: event.target.value as CouponRule['type'] })}><option value="percent">Процент</option><option value="fixed">Сумма, BYN</option></select></label>
            <label>Размер скидки<input type="number" min="0" value={coupon.value} onChange={(event) => updateCoupon(coupon.id, { value: Number(event.target.value) || 0 })} /></label>
            <label className="admin-coupon-note">Условие<input value={coupon.note} onChange={(event) => updateCoupon(coupon.id, { note: event.target.value })} /></label>
            <button type="button" className="admin-commerce-delete" onClick={() => removeCoupon(coupon.id)} aria-label="Удалить промокод"><X size={17} /></button>
          </article>) : <div className="admin-commerce-empty"><Ticket size={22} /><b>Промокодов пока нет</b><span>Создайте первый код, чтобы подготовить будущую акцию.</span></div>}
        </div>
      </section>
    </>}
  </div>;
}
