'use client';

import { useEffect, useMemo, useState } from 'react';
import { Archive, Check, ChevronRight, Clipboard, Copy, Eye, Gift, LoaderCircle, MoreHorizontal, Percent, Plus, Search, Ticket, Trash2, X } from 'lucide-react';
import type { AdminCoupon, CouponStatus, CouponType, CouponUsage } from '@/lib/adminCoupons';
import { couponCode, couponRuntimeStatus } from '@/lib/adminCoupons';

type Option = { id: string; title: string };
type Props = { initialCoupons: AdminCoupon[]; initialUsages: CouponUsage[]; categories: Option[]; products: Option[] };
type Editor = Omit<AdminCoupon, 'id' | 'created_at' | 'updated_at'> & { id?: string };

const blank = (): Editor => ({
  name: '', code: '', description: '', type: 'percentage', value: 10, max_discount: null,
  status: 'inactive', starts_at: null, ends_at: null, total_usage_limit: null, usage_limit_per_customer: null,
  minimum_order_amount: null, first_order_only: false, new_customers_only: false,
  allow_discounted_products: false, category_ids: [], product_ids: []
});

const statusLabels: Record<string, string> = {
  active: 'Активный', inactive: 'Неактивный', archived: 'В архиве', scheduled: 'Запланирован', expired: 'Истёк'
};
const typeLabels: Record<CouponType, string> = { percentage: 'Процент', fixed: 'Фиксированная сумма', free_shipping: 'Бесплатная доставка' };
const num = (value?: number | null) => new Intl.NumberFormat('ru-RU').format(Number(value || 0));
const dateValue = (value?: string | null) => value ? value.slice(0, 10) : '';

export function AdminCouponsClient({ initialCoupons, initialUsages, categories, products }: Props) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [usages, setUsages] = useState(initialUsages);
  const [selectedId, setSelectedId] = useState(initialCoupons[0]?.id || '');
  const [editing, setEditing] = useState<Editor | null>(initialCoupons[0] || null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [tab, setTab] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [runtimeFilter, setRuntimeFilter] = useState('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { const timer = window.setTimeout(() => setDebouncedQuery(query), 300); return () => window.clearTimeout(timer); }, [query]);
  useEffect(() => {
    const coupon = coupons.find((item) => item.id === selectedId);
    setEditing(coupon || null);
  }, [selectedId, coupons]);

  const usageByCoupon = useMemo(() => usages.reduce<Record<string, CouponUsage[]>>((map, usage) => {
    (map[usage.coupon_id] ||= []).push(usage); return map;
  }, {}), [usages]);
  const now = new Date();
  const filtered = coupons.filter((coupon) => {
    const runtime = couponRuntimeStatus(coupon, now);
    const q = debouncedQuery.trim().toLowerCase();
    const matchesQuery = !q || [coupon.name, coupon.code, coupon.description].some((value) => String(value || '').toLowerCase().includes(q));
    const matchesTab = tab === 'all' || runtime === tab;
    return matchesQuery && matchesTab && (typeFilter === 'all' || coupon.type === typeFilter) && (runtimeFilter === 'all' || runtime === runtimeFilter);
  });
  const activeCount = coupons.filter((item) => couponRuntimeStatus(item, now) === 'active').length;
  const totalDiscounts = usages.reduce((sum, item) => sum + Number(item.discount_amount || 0), 0);
  const selectedCoupon = coupons.find((item) => item.id === selectedId);
  const selectedUsages = selectedCoupon ? usageByCoupon[selectedCoupon.id] || [] : [];

  function notify(text: string) { setMessage(text); window.setTimeout(() => setMessage(''), 3200); }
  function updateEditor(key: keyof Editor, value: unknown) { setEditing((current) => current ? { ...current, [key]: value } : current); }
  async function request(url: string, method: string, body?: unknown) {
    const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось сохранить изменения.');
    return data;
  }
  async function save() {
    if (!editing) return;
    setSaving(true);
    try {
      const payload = { ...editing, code: couponCode(editing.code) };
      const data = editing.id ? await request(`/api/admin/coupons/${editing.id}`, 'PATCH', payload) : await request('/api/admin/coupons', 'POST', payload);
      const coupon = data.coupon as AdminCoupon;
      setCoupons((current) => editing.id ? current.map((item) => item.id === coupon.id ? coupon : item) : [coupon, ...current]);
      setSelectedId(coupon.id);
      setEditing(coupon);
      notify(editing.id ? 'Изменения купона сохранены.' : 'Купон создан.');
    } catch (error) { notify(error instanceof Error ? error.message : 'Не удалось сохранить купон.'); }
    finally { setSaving(false); }
  }
  async function setStatus(ids: string[], status: CouponStatus) {
    if (!ids.length) return;
    setSaving(true);
    try {
      const results = await Promise.all(ids.map((id) => request(`/api/admin/coupons/${id}`, 'PATCH', { status })));
      const changed = results.map((result) => result.coupon as AdminCoupon);
      setCoupons((current) => current.map((item) => changed.find((next) => next.id === item.id) || item));
      setSelected([]);
      notify(status === 'archived' ? 'Купоны перенесены в архив.' : 'Статус купонов обновлён.');
    } catch (error) { notify(error instanceof Error ? error.message : 'Не удалось обновить статусы.'); }
    finally { setSaving(false); }
  }
  async function deleteCoupon() {
    if (!selectedCoupon || !window.confirm(`Удалить купон «${selectedCoupon.name}»?`)) return;
    try {
      await request(`/api/admin/coupons/${selectedCoupon.id}`, 'DELETE');
      setCoupons((current) => current.filter((item) => item.id !== selectedCoupon.id));
      setSelectedId(coupons.find((item) => item.id !== selectedCoupon.id)?.id || '');
      notify('Купон удалён.');
    } catch (error) { notify(error instanceof Error ? error.message : 'Не удалось удалить купон.'); }
  }
  async function duplicateCoupon() {
    if (!selectedCoupon) return;
    const copy = { ...selectedCoupon, id: undefined, name: `${selectedCoupon.name} — копия`, code: `${selectedCoupon.code}-COPY`, status: 'inactive' as CouponStatus };
    setEditing(copy); setSelectedId(''); notify('Создана копия в режиме редактирования. Задайте уникальный код и сохраните.');
  }
  function toggleSelection(id: string) { setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }

  return (
    <main className="coupons-page-v6">
      <section className="coupons-title-v6">
        <div><p>ИНТЕРНЕТ-МАГАЗИН</p><h1>Купоны и скидки</h1><span>Создавайте промокоды, управляйте скидками и отслеживайте их эффективность.</span></div>
        <button className="coupons-primary-v6" onClick={() => { setSelectedId(''); setEditing(blank()); }}><Plus size={19} /> Создать купон</button>
      </section>

      <section className="coupons-kpi-v6">
        <Kpi icon={<Ticket />} label="Всего купонов" value={String(coupons.length)} note={`+${coupons.length ? 1 : 0} за месяц`} />
        <Kpi icon={<Percent />} label="Активные" value={String(activeCount)} note={coupons.length ? `${Math.round(activeCount / coupons.length * 100)}% от всех` : 'Нет активных'} green />
        <Kpi icon={<Check />} label="Использовано" value={String(usages.length)} note="Подтверждённых применений" />
        <Kpi icon={<Gift />} label="Сумма скидок" value={`${num(totalDiscounts)} BYN`} note="За всё время" />
      </section>

      <section className="coupons-layout-v6">
        <div className="coupons-list-v6">
          <div className="coupons-tabs-v6">
            {[['all', `Все (${coupons.length})`], ['active', `Активные (${activeCount})`], ['scheduled', 'Запланированные'], ['inactive', 'Неактивные'], ['archived', 'В архиве']].map(([key, label]) => <button key={key} className={tab === key ? 'is-active' : ''} onClick={() => setTab(key)}>{label}</button>)}
          </div>
          <div className="coupons-filters-v6">
            <label><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по названию, промокоду…" /></label>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="all">Тип скидки</option><option value="percentage">Процент</option><option value="fixed">Сумма</option><option value="free_shipping">Доставка</option></select>
            <select value={runtimeFilter} onChange={(event) => setRuntimeFilter(event.target.value)}><option value="all">Все статусы</option><option value="active">Активные</option><option value="scheduled">Запланированные</option><option value="inactive">Неактивные</option><option value="expired">Истёкшие</option><option value="archived">Архив</option></select>
            {(query || typeFilter !== 'all' || runtimeFilter !== 'all') && <button className="coupons-reset-v6" onClick={() => { setQuery(''); setTypeFilter('all'); setRuntimeFilter('all'); }}>Сбросить</button>}
          </div>
          {selected.length > 0 && <div className="coupons-bulk-v6"><b>Выбрано: {selected.length}</b><button onClick={() => setStatus(selected, 'active')}>Активировать</button><button onClick={() => setStatus(selected, 'inactive')}>Отключить</button><button className="danger" onClick={() => setStatus(selected, 'archived')}>В архив</button></div>}
          <div className="coupons-table-wrap-v6">
            <table className="coupons-table-v6"><thead><tr><th><input aria-label="Выбрать все" type="checkbox" checked={filtered.length > 0 && selected.length === filtered.length} onChange={() => setSelected(selected.length === filtered.length ? [] : filtered.map((item) => item.id))} /></th><th>Название</th><th>Промокод</th><th>Тип скидки</th><th>Значение</th><th>Использовано</th><th>Лимит</th><th>Период действия</th><th>Статус</th><th /></tr></thead>
              <tbody>{filtered.map((coupon) => {
                const runtime = couponRuntimeStatus(coupon, now); const couponUsages = usageByCoupon[coupon.id] || [];
                return <tr key={coupon.id} className={selectedId === coupon.id ? 'is-selected' : ''} onClick={() => setSelectedId(coupon.id)}>
                  <td onClick={(event) => event.stopPropagation()}><input aria-label={`Выбрать ${coupon.name}`} type="checkbox" checked={selected.includes(coupon.id)} onChange={() => toggleSelection(coupon.id)} /></td>
                  <td><b>{coupon.name}</b><small>{coupon.description || 'Без описания'}</small></td>
                  <td><button className="coupon-code-v6" onClick={(event) => { event.stopPropagation(); navigator.clipboard?.writeText(coupon.code); notify('Промокод скопирован.'); }}>{coupon.code}<Copy size={13} /></button></td>
                  <td>{typeLabels[coupon.type]}</td><td><b>{coupon.type === 'percentage' ? `${coupon.value || 0}%` : coupon.type === 'fixed' ? `${num(coupon.value)} BYN` : '—'}</b></td>
                  <td>{couponUsages.length}</td><td>{coupon.total_usage_limit || '—'}</td>
                  <td><small>{coupon.starts_at ? dateValue(coupon.starts_at) : 'Сразу'}<br />{coupon.ends_at ? dateValue(coupon.ends_at) : 'Бессрочно'}</small></td>
                  <td><span className={`coupon-status-v6 ${runtime}`}>{statusLabels[runtime]}</span></td>
                  <td><button aria-label="Открыть" className="coupons-more-v6" onClick={(event) => { event.stopPropagation(); setSelectedId(coupon.id); }}><MoreHorizontal size={19} /></button></td>
                </tr>;
              })}</tbody></table>
            {!filtered.length && <div className="coupons-empty-v6"><Ticket size={28} /><b>Купоны не найдены</b><span>Измените фильтры или создайте новый промокод.</span></div>}
          </div>
        </div>

        <aside className="coupon-editor-v6">
          {editing ? <><div className="coupon-editor-head-v6"><div><p>{editing.id ? 'РЕДАКТИРОВАНИЕ КУПОНА' : 'НОВЫЙ КУПОН'}</p><h2>{editing.name || 'Новый купон'}</h2></div>{editing.id && <button aria-label="Закрыть" onClick={() => setSelectedId('')}><X size={18} /></button>}</div>
          <div className="coupon-editor-tabs-v6"><span>Информация</span><span>Использования ({selectedUsages.length})</span></div>
          <fieldset className="coupon-fields-v6">
            <Field label="Название"><input value={editing.name} onChange={(event) => updateEditor('name', event.target.value)} placeholder="Например, Добро пожаловать" /></Field>
            <Field label="Промокод"><div className="coupon-code-input-v6"><input value={editing.code} onChange={(event) => updateEditor('code', couponCode(event.target.value))} placeholder="WELCOME10" /><Clipboard size={16} /></div></Field>
            <Field label="Тип скидки"><select value={editing.type} onChange={(event) => updateEditor('type', event.target.value as CouponType)}><option value="percentage">Процент</option><option value="fixed">Фиксированная сумма</option><option value="free_shipping">Бесплатная доставка</option></select></Field>
            {editing.type !== 'free_shipping' && <Field label={editing.type === 'percentage' ? 'Размер скидки, %' : 'Размер скидки, BYN'}><input type="number" min="0" max={editing.type === 'percentage' ? 100 : undefined} value={editing.value ?? ''} onChange={(event) => updateEditor('value', event.target.value === '' ? null : Number(event.target.value))} /></Field>}
            {editing.type === 'percentage' && <Field label="Максимальная скидка, BYN"><input type="number" min="0" value={editing.max_discount ?? ''} onChange={(event) => updateEditor('max_discount', event.target.value === '' ? null : Number(event.target.value))} /></Field>}
            <Field label="Статус"><select value={editing.status} onChange={(event) => updateEditor('status', event.target.value as CouponStatus)}><option value="active">Активный</option><option value="inactive">Неактивный</option><option value="archived">Архив</option></select></Field>
            <div className="coupon-field-row-v6"><Field label="Начало"><input type="date" value={dateValue(editing.starts_at)} onChange={(event) => updateEditor('starts_at', event.target.value || null)} /></Field><Field label="Окончание"><input type="date" value={dateValue(editing.ends_at)} onChange={(event) => updateEditor('ends_at', event.target.value || null)} /></Field></div>
            <Field label="Минимальная сумма заказа"><input type="number" min="0" value={editing.minimum_order_amount ?? ''} onChange={(event) => updateEditor('minimum_order_amount', event.target.value === '' ? null : Number(event.target.value))} placeholder="Без ограничения" /></Field>
            <div className="coupon-field-row-v6"><Field label="Общий лимит"><input type="number" min="1" value={editing.total_usage_limit ?? ''} onChange={(event) => updateEditor('total_usage_limit', event.target.value === '' ? null : Number(event.target.value))} placeholder="Без лимита" /></Field><Field label="На клиента"><input type="number" min="1" value={editing.usage_limit_per_customer ?? ''} onChange={(event) => updateEditor('usage_limit_per_customer', event.target.value === '' ? null : Number(event.target.value))} placeholder="Без лимита" /></Field></div>
            <Field label="Описание"><textarea value={editing.description || ''} onChange={(event) => updateEditor('description', event.target.value)} placeholder="Коротко опишите условия купона" /></Field>
            <div className="coupon-checkboxes-v6">
              <CheckField checked={!!editing.first_order_only} onChange={(value) => updateEditor('first_order_only', value)} label="Только для первого заказа" />
              <CheckField checked={!!editing.new_customers_only} onChange={(value) => updateEditor('new_customers_only', value)} label="Только для новых клиентов" />
              <CheckField checked={!!editing.allow_discounted_products} onChange={(value) => updateEditor('allow_discounted_products', value)} label="Применять к товарам со скидкой" />
            </div>
            <MultiSelect label="Ограничить категориями" options={categories} selected={editing.category_ids || []} onChange={(value) => updateEditor('category_ids', value)} />
            <MultiSelect label="Ограничить товарами" options={products} selected={editing.product_ids || []} onChange={(value) => updateEditor('product_ids', value)} />
          </fieldset>
          {editing.id && <div className="coupon-usage-mini-v6"><b>Последние применения</b>{selectedUsages.slice(0, 3).map((usage) => <span key={usage.id}>{usage.customer_name || 'Покупатель'} · −{num(usage.discount_amount)} BYN</span>)}{!selectedUsages.length && <span>Купон ещё не применялся.</span>}</div>}
          <div className="coupon-editor-actions-v6"><button className="coupon-save-v6" disabled={saving} onClick={save}>{saving ? <LoaderCircle className="spin" size={17} /> : <Check size={17} />}{editing.id ? 'Сохранить изменения' : 'Создать купон'}</button>{editing.id && <><button onClick={duplicateCoupon}><Copy size={16} /> Дублировать</button><button className="danger" onClick={deleteCoupon}><Trash2 size={16} /> Удалить</button></>}</div>
          </> : <div className="coupon-empty-editor-v6"><Ticket size={34} /><h2>Выберите купон</h2><p>Или создайте новый, чтобы настроить его условия и запуск.</p><button className="coupons-primary-v6" onClick={() => setEditing(blank())}><Plus size={17} /> Создать купон</button></div>}
        </aside>
      </section>
      {message && <div role="status" className="coupon-toast-v6">{message}</div>}
    </main>
  );
}

function Kpi({ icon, label, value, note, green }: { icon: React.ReactNode; label: string; value: string; note: string; green?: boolean }) {
  return <article className="coupon-kpi-v6"><div className={green ? 'green' : ''}>{icon}</div><span>{label}</span><b>{value}</b><small className={green ? 'green' : ''}>{note}</small></article>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="coupon-field-v6"><span>{label}</span>{children}</label>; }
function CheckField({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) { return <label><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /> <span>{label}</span></label>; }
function MultiSelect({ label, options, selected, onChange }: { label: string; options: Option[]; selected: string[]; onChange: (items: string[]) => void }) {
  return <label className="coupon-multiselect-v6"><span>{label}</span><select multiple value={selected} onChange={(event) => onChange(Array.from(event.target.selectedOptions).map((option) => option.value))}>{options.map((option) => <option key={option.id} value={option.id}>{option.title}</option>)}</select><small>Удерживайте Ctrl / ⌘ для выбора нескольких.</small></label>;
}
