'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock3, DatabaseBackup, Download, FileJson, HardDrive, Info, LoaderCircle, LockKeyhole, RefreshCw, ShieldCheck, Table, Trash2 } from 'lucide-react';
import type { BackupDashboard, BackupKind, BackupRecord, ExportType } from '@/lib/adminBackup';

type Props = { initialDashboard: BackupDashboard };

const exports: Array<{ type: ExportType; title: string; description: string; csv?: boolean }> = [
  { type: 'all', title: 'Все данные', description: 'Товары, заказы, заявки, пользователи, CMS и настройки.', csv: false },
  { type: 'products', title: 'Товары', description: 'Карточки каталога, цены и состояния.', csv: true },
  { type: 'orders', title: 'Заказы', description: 'Заказы, позиции и текущие статусы.', csv: true },
  { type: 'requests', title: 'Заявки', description: 'Обращения с сайта и расчёты.', csv: true },
  { type: 'settings', title: 'Настройки CMS', description: 'Главная, баннеры, категории и параметры сайта.' },
  { type: 'pages', title: 'Страницы', description: 'Страницы, созданные через CMS.', csv: true }
];

const kindLabels: Record<BackupKind, string> = { full: 'Полная копия', database: 'Только данные', media: 'Только Storage' };
const statusLabels: Record<BackupRecord['status'], string> = { creating: 'Создаётся', ready: 'Готова', error: 'Ошибка', restoring: 'Восстановление', deleting: 'Удаляется' };

function date(value?: string) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}
function bytes(value?: number) {
  if (!value) return '—';
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} КБ`;
  return `${(value / 1024 / 1024).toFixed(2)} МБ`;
}

export function AdminBackupClient({ initialDashboard }: Props) {
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [selectedId, setSelectedId] = useState<string | null>(initialDashboard.records[0]?.id || null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [kind, setKind] = useState<BackupKind>('full');
  const [comment, setComment] = useState('');

  const selected = useMemo(() => dashboard.records.find((record) => record.id === selectedId) || dashboard.records[0], [dashboard.records, selectedId]);
  const lastReady = dashboard.records.find((record) => record.status === 'ready');
  const totalSize = dashboard.records.reduce((sum, record) => sum + (record.sizeBytes || 0), 0);

  async function request(body?: Record<string, unknown>) {
    const response = await fetch('/api/admin/backup', body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.message || 'Операция не выполнена.');
    return data;
  }
  async function refresh() {
    setBusy(true); setMessage('');
    try { const data = await request(); setDashboard(data.dashboard); setMessage('Данные резервного копирования обновлены.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Не удалось обновить данные.'); }
    finally { setBusy(false); }
  }
  async function create() {
    setBusy(true); setMessage('');
    try { const data = await request({ action: 'create', kind, comment }); setCreating(false); setComment(''); setSelectedId(data.record.id); await refresh(); setMessage(data.message); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Не удалось создать копию.'); setBusy(false); }
  }
  async function update(action: 'delete' | 'protect', body: Record<string, unknown>) {
    setBusy(true); setMessage('');
    try { const data = await request({ action, ...body }); setMessage(data.message); await refresh(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Операция не выполнена.'); setBusy(false); }
  }
  async function download(id: string) {
    setBusy(true); setMessage('');
    try { const data = await request({ action: 'download', id }); window.location.assign(data.signedUrl); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Скачивание недоступно.'); }
    finally { setBusy(false); }
  }
  return <div className="admin-backup-v3">
    <header className="admin-backup-v3__head">
      <div><p>Настройки / Защита данных</p><h1>Резервное копирование</h1><span>Защита данных Bullmet: ручные снимки, контроль хранения и экспорт данных для аналитики.</span></div>
      <div className="admin-backup-v3__head-actions"><button onClick={refresh} disabled={busy}><RefreshCw size={17} className={busy ? 'is-spinning' : ''} /> Обновить</button><button className="is-primary" onClick={() => setCreating(true)} disabled={!dashboard.serviceReady || busy}><DatabaseBackup size={17} /> Создать резервную копию</button></div>
    </header>

    {message && <div className="admin-backup-v3__message">{message}</div>}
    {!dashboard.serviceReady && <div className="admin-backup-v3__warning"><AlertTriangle size={18} /><span><b>Защищённое хранилище не подключено.</b> Для создания настоящих архивов задайте <code>SUPABASE_SERVICE_ROLE_KEY</code>. Кнопки не создают фиктивные копии.</span></div>}

    <section className="admin-backup-v3__metrics">
      <article><DatabaseBackup /><span>Последняя копия</span><b>{lastReady ? date(lastReady.completedAt || lastReady.createdAt) : 'Копий ещё нет'}</b><small>{lastReady ? kindLabels[lastReady.kind] : 'Создайте первый снимок'}</small></article>
      <article><Clock3 /><span>Следующая копия</span><b>Не запланирована</b><small>Автоматическое расписание не реализовано</small></article>
      <article><HardDrive /><span>Хранилище копий</span><b>{bytes(totalSize)}</b><small>{dashboard.records.length} записей в архиве</small></article>
      <article><ShieldCheck /><span>Состояние системы</span><b>{dashboard.serviceReady ? 'Готово' : 'Требуется настройка'}</b><small>{dashboard.storageReady ? 'Закрытое Storage доступно' : 'Проверка хранилища недоступна'}</small></article>
    </section>

    <section className="admin-backup-v3__grid">
      <article className="admin-backup-v3__card admin-backup-v3__history"><div className="admin-backup-v3__card-head"><div><h2>Резервные копии</h2><p>Фактические снимки создаются только в закрытом хранилище.</p></div><span>{dashboard.records.length} всего</span></div>
        <div className="admin-backup-v3__table" role="table"><div className="admin-backup-v3__table-head" role="row"><span>Дата и время</span><span>Тип</span><span>Состав</span><span>Размер</span><span>Статус</span><span /></div>{dashboard.records.length ? dashboard.records.map((record) => <button className={selected?.id === record.id ? 'is-selected' : ''} onClick={() => setSelectedId(record.id)} key={record.id} role="row"><span>{date(record.createdAt)}<small>{record.trigger === 'automatic' ? 'Автоматическая' : 'Ручная'}</small></span><span>{kindLabels[record.kind]}</span><span>{record.includesDatabase ? 'Данные' : 'Медиа'}{record.includesStorage ? ' + Storage' : ' + реестр'}</span><span>{bytes(record.sizeBytes)}</span><span><i className={`status-${record.status}`}>{statusLabels[record.status]}</i></span><span>›</span></button>) : <div className="admin-backup-v3__empty">Архив пуст. После создания здесь появятся готовые снимки и их контрольные суммы.</div>}</div>
      </article>

      <aside className="admin-backup-v3__side"><article className="admin-backup-v3__card admin-backup-v3__detail"><div className="admin-backup-v3__card-head"><h2>Сведения о копии</h2>{selected && <span>{selected.protected ? <LockKeyhole size={17} /> : <DatabaseBackup size={17} />}</span>}</div>{selected ? <><h3>{kindLabels[selected.kind]}</h3><p>{date(selected.createdAt)} · {selected.createdBy}</p><dl><div><dt>Статус</dt><dd>{statusLabels[selected.status]}</dd></div><div><dt>Размер</dt><dd>{bytes(selected.sizeBytes)}</dd></div><div><dt>Контрольная сумма</dt><dd>{selected.checksum ? `${selected.checksum.slice(0, 12)}…` : 'Будет создана после завершения'}</dd></div><div><dt>Состав</dt><dd>{selected.includesDatabase ? 'Данные сайта' : 'Только Storage'}{selected.includesStorage ? ' + физические файлы Storage' : ''}</dd></div></dl>{selected.comment && <p className="admin-backup-v3__comment">{selected.comment}</p>}<div className="admin-backup-v3__detail-actions"><button onClick={() => download(selected.id)} disabled={busy || selected.status !== 'ready'}><Download size={15} /> Скачать</button><button onClick={() => update('protect', { id: selected.id, protected: !selected.protected })} disabled={busy}>{selected.protected ? 'Снять защиту' : 'Защитить'}</button><button className="is-danger" onClick={() => window.confirm('Удалить резервную копию без возможности восстановления?') && update('delete', { id: selected.id })} disabled={busy}><Trash2 size={15} /> Удалить</button></div></> : <p>Выберите копию из истории.</p>}</article>
        <article className="admin-backup-v3__restore"><Info size={18} /><div><b>Восстановление пока недоступно</b><p>Проект не содержит процедуры восстановления и не выдаёт архив за проверенный план disaster recovery. Перед включением этой функции нужен отдельный тестовый прогон в изолированном Supabase-проекте.</p></div></article></aside>
    </section>

    <section className="admin-backup-v3__lower-grid"><article className="admin-backup-v3__card admin-backup-v3__settings"><div className="admin-backup-v3__card-head"><div><h2>Автоматическое резервное копирование</h2><p>Расписание и очистка по retention пока не реализованы. Создавайте ручной снимок перед важными изменениями.</p></div></div><p className="admin-backup-v3__muted">Параметры частоты, времени и retention намеренно отключены, чтобы интерфейс не создавал ложное ожидание автоматических копий.</p></article>
      <article className="admin-backup-v3__card admin-backup-v3__health"><h2>Проверка готовности</h2><ul><li className={dashboard.overview.configured ? 'ok' : ''}>{dashboard.overview.configured ? <CheckCircle2 /> : <AlertTriangle />} Подключение к базе данных</li><li className={dashboard.serviceReady ? 'ok' : ''}>{dashboard.serviceReady ? <CheckCircle2 /> : <AlertTriangle />} Сервисный ключ для закрытых архивов</li><li className={dashboard.schedulerReady ? 'ok' : ''}>{dashboard.schedulerReady ? <CheckCircle2 /> : <AlertTriangle />} Планировщик автоматических копий</li><li className={lastReady ? 'ok' : ''}>{lastReady ? <CheckCircle2 /> : <AlertTriangle />} Есть хотя бы один готовый снимок</li></ul></article></section>

    <section className="admin-backup-v3__card admin-backup-v3__exports"><div className="admin-backup-v3__card-head"><div><p>Выгрузка данных</p><h2>Экспорт для отчётов и переноса</h2></div><span>Экспорт не заменяет резервную копию.</span></div><div className="admin-backup-v3__export-grid">{exports.map((item) => <article key={item.type}><FileJson size={20} /><h3>{item.title}</h3><p>{item.description}</p><div><a href={`/api/admin/export?type=${item.type}&format=json`}><FileJson size={14} /> JSON</a>{item.csv && <a href={`/api/admin/export?type=${item.type}&format=csv`}><Table size={14} /> CSV</a>}</div></article>)}</div></section>

    {creating && <div className="admin-backup-v3__modal-backdrop"><form className="admin-backup-v3__modal" onSubmit={(event) => { event.preventDefault(); create(); }}><button type="button" className="admin-backup-v3__modal-close" onClick={() => setCreating(false)}>×</button><p>Защищённый снимок</p><h2>Создать резервную копию</h2><span>Архив сохраняется в закрытом Supabase Storage и получает контрольную сумму. Восстановление этим проектом пока не поддерживается.</span><fieldset>{(['full', 'database', 'media'] as BackupKind[]).map((item) => <label key={item}><input type="radio" checked={kind === item} onChange={() => setKind(item)} /><b>{kindLabels[item]}</b><small>{item === 'full' ? 'Данные сайта и физические файлы Storage' : item === 'database' ? 'Только данные сайта' : 'Только физические файлы Storage'}</small></label>)}</fieldset><label>Комментарий<textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Например: перед массовым обновлением каталога" /></label><div><button type="button" onClick={() => setCreating(false)}>Отмена</button><button className="is-primary" disabled={busy}>{busy ? <LoaderCircle className="is-spinning" size={17} /> : <DatabaseBackup size={17} />} Создать копию</button></div></form></div>}
  </div>;
}
