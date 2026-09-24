import { createHash, randomUUID } from 'crypto';
import { getAdminOrders, getAdminRequests } from './adminCommerce';
import { getAdminMediaFiles, getAdminReviews, getBannerControlSettings } from './adminContent';
import { getAdminActivityLog, getAdminProfiles } from './adminPeople';
import { getCatalogControlSettings, visibleCatalogCategories } from './catalogControl';
import { getAdminCatalogProducts } from './products';
import { getHomepageControlSettings } from './homepageControl';
import { getSiteControlSettings, visibleDirections } from './siteControl';
import { getAdminSitePages } from './sitePages';
import { isSupabaseConfigured, serverSupabase } from './serverSupabase';

export const backupSettingsKey = 'backup_settings';
export const backupRecordsKey = 'backup_records';
export const backupBucket = 'bullmet-backups';

export type BackupOverview = { configured: boolean; products: number; orders: number; requests: number; reviews: number; users: number; activity: number; settings: number; pages: number; visibleCategories: number; visibleDirections: number; generatedAt: string };
export type ExportType = 'all' | 'products' | 'orders' | 'requests' | 'reviews' | 'users' | 'activity' | 'settings' | 'categories' | 'banners' | 'pages';
export type BackupKind = 'full' | 'database' | 'media';
export type BackupTrigger = 'automatic' | 'manual' | 'pre_restore';
export type BackupStatus = 'creating' | 'ready' | 'error' | 'restoring' | 'deleting';
export type BackupRecord = { id: string; kind: BackupKind; trigger: BackupTrigger; status: BackupStatus; createdAt: string; completedAt?: string; sizeBytes?: number; checksum?: string; includesDatabase: boolean; includesStorage: boolean; comment?: string; createdBy: string; storagePath?: string; protected?: boolean; expiresAt?: string; errorMessage?: string; metadata?: Record<string, unknown> };
export type BackupSettings = { enabled: boolean; frequency: 'daily' | 'weekly'; time: string; retentionCount: number };
export type BackupDashboard = { overview: BackupOverview; records: BackupRecord[]; settings: BackupSettings; serviceReady: boolean; storageReady: boolean; schedulerReady: boolean; generatedAt: string };

const defaultSettings: BackupSettings = { enabled: false, frequency: 'daily', time: '03:00', retentionCount: 14 };
const exportTypes: ExportType[] = ['all', 'products', 'orders', 'requests', 'reviews', 'users', 'activity', 'settings', 'categories', 'banners', 'pages'];

function safeRecord(value: unknown): Record<string, unknown> { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function parseSettings(value: unknown): BackupSettings { const source = safeRecord(value); return { enabled: typeof source.enabled === 'boolean' ? source.enabled : defaultSettings.enabled, frequency: source.frequency === 'weekly' ? 'weekly' : 'daily', time: typeof source.time === 'string' && /^\d{2}:\d{2}$/.test(source.time) ? source.time : defaultSettings.time, retentionCount: Math.min(90, Math.max(7, Number(source.retentionCount) || defaultSettings.retentionCount)) }; }
function parseRecord(value: unknown): BackupRecord | null { const item = safeRecord(value); if (!item.id || !item.createdAt || !['full', 'database', 'media'].includes(String(item.kind))) return null; return { id: String(item.id), kind: item.kind as BackupKind, trigger: ['automatic', 'manual', 'pre_restore'].includes(String(item.trigger)) ? item.trigger as BackupTrigger : 'manual', status: ['creating', 'ready', 'error', 'restoring', 'deleting'].includes(String(item.status)) ? item.status as BackupStatus : 'error', createdAt: String(item.createdAt), completedAt: typeof item.completedAt === 'string' ? item.completedAt : undefined, sizeBytes: Number(item.sizeBytes) || undefined, checksum: typeof item.checksum === 'string' ? item.checksum : undefined, includesDatabase: Boolean(item.includesDatabase), includesStorage: Boolean(item.includesStorage), comment: typeof item.comment === 'string' ? item.comment : undefined, createdBy: typeof item.createdBy === 'string' ? item.createdBy : 'Система', storagePath: typeof item.storagePath === 'string' ? item.storagePath : undefined, protected: Boolean(item.protected), expiresAt: typeof item.expiresAt === 'string' ? item.expiresAt : undefined, errorMessage: typeof item.errorMessage === 'string' ? item.errorMessage : undefined, metadata: safeRecord(item.metadata) }; }
function dateWithRetention(count: number) { const date = new Date(); date.setDate(date.getDate() + count); return date.toISOString(); }

export function hasBackupServiceRole() { return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && serverSupabase); }

async function readSetting<T>(key: string, fallback: T): Promise<T> { if (!serverSupabase) return fallback; const { data } = await serverSupabase.from('site_settings').select('value').eq('key', key).maybeSingle(); return data?.value == null ? fallback : data.value as T; }
async function writeSetting(key: string, value: unknown) { if (!serverSupabase) throw new Error('Supabase не подключён.'); const { error } = await serverSupabase.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' }); if (error) throw new Error('Не удалось сохранить настройки резервного копирования.'); }

export async function getSettingsCount() { if (!serverSupabase) return 0; const { count } = await serverSupabase.from('site_settings').select('*', { count: 'exact', head: true }); return count || 0; }

export async function getBackupOverview(): Promise<BackupOverview> {
  const [products, orders, requests, reviews, users, activity, site, catalog, settings, pages] = await Promise.all([getAdminCatalogProducts(), getAdminOrders(), getAdminRequests(), getAdminReviews(), getAdminProfiles(), getAdminActivityLog(), getSiteControlSettings(), getCatalogControlSettings(), getSettingsCount(), getAdminSitePages()]);
  return { configured: isSupabaseConfigured(), products: products.length, orders: orders.length, requests: requests.length, reviews: reviews.length, users: users.length, activity: activity.length, settings, pages: pages.length, visibleCategories: visibleCatalogCategories(catalog).length, visibleDirections: visibleDirections(site).length, generatedAt: new Date().toISOString() };
}

export async function getBackupDashboard(): Promise<BackupDashboard> {
  const [overview, rawSettings, rawRecords] = await Promise.all([getBackupOverview(), readSetting<unknown>(backupSettingsKey, defaultSettings), readSetting<unknown>(backupRecordsKey, [])]);
  const records = (Array.isArray(rawRecords) ? rawRecords : []).map(parseRecord).filter((value): value is BackupRecord => Boolean(value)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const serviceReady = hasBackupServiceRole();
  return { overview, records, settings: parseSettings(rawSettings), serviceReady, storageReady: serviceReady, schedulerReady: false, generatedAt: new Date().toISOString() };
}

export async function getExportData(type: ExportType) {
  const [products, orders, requests, reviews, users, activity, site, homepage, catalog, banners, pages] = await Promise.all([getAdminCatalogProducts(), getAdminOrders(), getAdminRequests(), getAdminReviews(), getAdminProfiles(), getAdminActivityLog(), getSiteControlSettings(), getHomepageControlSettings(), getCatalogControlSettings(), getBannerControlSettings(), getAdminSitePages()]);
  const settings = { site, homepage, catalog, banners };
  if (type === 'products') return products; if (type === 'orders') return orders; if (type === 'requests') return requests; if (type === 'reviews') return reviews; if (type === 'users') return users; if (type === 'activity') return activity; if (type === 'settings') return settings; if (type === 'categories') return catalog.categories; if (type === 'banners') return banners.banners; if (type === 'pages') return pages;
  return { generatedAt: new Date().toISOString(), products, orders, requests, reviews, users, activity, pages, settings };
}

async function getSnapshot(kind: BackupKind) {
  if (!serverSupabase) throw new Error('Supabase не подключён.');
  if (kind === 'media') return { generatedAt: new Date().toISOString(), storage: await getStorageSnapshot() };
  if (kind === 'database') return { generatedAt: new Date().toISOString(), database: await getDatabaseSnapshot() };
  return { generatedAt: new Date().toISOString(), database: await getDatabaseSnapshot(), storage: await getStorageSnapshot() };
}

const backupTables = [
  'products', 'orders', 'requests', 'product_reviews', 'profiles', 'site_settings',
  'admin_activity_log', 'crm_customers', 'customer_notes', 'coupons', 'coupon_usages',
  'favorites', 'media_files', 'site_pages', 'site_page_redirects'
];

async function getDatabaseSnapshot() {
  if (!serverSupabase) throw new Error('Supabase не подключён.');
  const entries = await Promise.all(backupTables.map(async (table) => {
    return [table, await readAllRows(table)] as const;
  }));
  return Object.fromEntries(entries);
}

async function readAllRows(table: string) {
  if (!serverSupabase) throw new Error('Supabase не подключён.');
  const rows: unknown[] = [];
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await serverSupabase.from(table).select('*').range(offset, offset + pageSize - 1);
    if (error) throw new Error(`Не удалось включить таблицу ${table} в резервную копию: ${error.message}`);
    rows.push(...(data || []));
    if ((data || []).length < pageSize) return rows;
  }
}

type StorageBackupFile = { bucket: string; path: string; contentType: string; sizeBytes: number; dataBase64: string };

async function listStorageFiles(bucket: string, prefix = ''): Promise<StorageBackupFile[]> {
  if (!serverSupabase) throw new Error('Supabase не подключён.');
  const entries: Array<{ id?: string | null; name: string; metadata?: { mimetype?: string; size?: number } | null }> = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await serverSupabase.storage.from(bucket).list(prefix, { limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } });
    if (error) throw new Error(`Не удалось прочитать Storage bucket ${bucket}.`);
    entries.push(...((data || []) as typeof entries));
    if ((data || []).length < 1000) break;
  }

  const files: StorageBackupFile[] = [];
  for (const item of entries) {
    const path = prefix ? `${prefix}/${item.name}` : item.name;
    if (!item.id) {
      files.push(...await listStorageFiles(bucket, path));
      continue;
    }
    const { data: blob, error: downloadError } = await serverSupabase.storage.from(bucket).download(path);
    if (downloadError || !blob) throw new Error(`Не удалось включить файл ${bucket}/${path} в резервную копию.`);
    const bytes = Buffer.from(await blob.arrayBuffer());
    files.push({
      bucket,
      path,
      contentType: item.metadata?.mimetype || blob.type || 'application/octet-stream',
      sizeBytes: bytes.byteLength,
      dataBase64: bytes.toString('base64')
    });
  }
  return files;
}

async function getStorageSnapshot() {
  if (!serverSupabase) throw new Error('Supabase не подключён.');
  const { data: buckets, error } = await serverSupabase.storage.listBuckets();
  if (error) throw new Error('Не удалось получить список Storage bucket для резервной копии.');
  const sourceBuckets = (buckets || []).map((bucket) => bucket.name).filter((name) => name !== backupBucket);
  const files = (await Promise.all(sourceBuckets.map((bucket) => listStorageFiles(bucket)))).flat();
  return {
    buckets: sourceBuckets,
    files,
    filesCount: files.length,
    sizeBytes: files.reduce((total, file) => total + file.sizeBytes, 0)
  };
}

async function persistRecords(records: BackupRecord[]) { await writeSetting(backupRecordsKey, records); }
async function logBackup(action: string, record?: BackupRecord, payload: Record<string, unknown> = {}) { if (!serverSupabase) return; await serverSupabase.from('admin_activity_log').insert({ action, entity: 'backup', entity_id: record?.id || null, payload: { backupAt: record?.createdAt, type: record?.kind, ...payload } }).then(() => null); }
async function ensureBucket() { if (!serverSupabase) throw new Error('Supabase не подключён.'); const { data: buckets, error } = await serverSupabase.storage.listBuckets(); if (error) throw new Error('Хранилище резервных копий недоступно.'); if (!(buckets || []).some((bucket) => bucket.name === backupBucket)) { const created = await serverSupabase.storage.createBucket(backupBucket, { public: false, fileSizeLimit: '500MB' }); if (created.error) throw new Error('Не удалось подготовить закрытое хранилище резервных копий.'); } }

export async function createBackup(input: { kind: BackupKind; comment?: string; createdBy?: string }) {
  if (!hasBackupServiceRole()) throw new Error('Для создания резервных копий добавьте SUPABASE_SERVICE_ROLE_KEY. Сервис не имитирует архивы без защищённого хранилища.');
  const dashboard = await getBackupDashboard();
  if (dashboard.records.some((record) => record.status === 'creating' || record.status === 'restoring')) throw new Error('Создание или восстановление резервной копии уже выполняется.');
  const id = randomUUID(); const createdAt = new Date().toISOString();
  let record: BackupRecord = { id, kind: input.kind, trigger: 'manual', status: 'creating', createdAt, includesDatabase: input.kind !== 'media', includesStorage: input.kind !== 'database', comment: input.comment?.trim() || undefined, createdBy: input.createdBy || 'Администратор', expiresAt: dateWithRetention(dashboard.settings.retentionCount), metadata: { version: 2, app: 'Bullmet', storageManifest: input.kind !== 'database', authIncluded: false } };
  let records = [record, ...dashboard.records]; await persistRecords(records); await logBackup('backup_create', record);
  try {
    await ensureBucket(); const snapshot = await getSnapshot(input.kind); const archive = JSON.stringify({ manifest: { version: 2, createdAt, kind: input.kind, includesDatabase: record.includesDatabase, includesStorage: record.includesStorage, authIncluded: false }, snapshot }); const bytes = Buffer.from(archive, 'utf8'); const checksum = createHash('sha256').update(bytes).digest('hex'); const storagePath = `${id}.json`;
    const upload = await serverSupabase!.storage.from(backupBucket).upload(storagePath, bytes, { contentType: 'application/json', upsert: false }); if (upload.error) throw new Error('Не удалось сохранить архив в закрытом хранилище.');
    record = { ...record, status: 'ready', completedAt: new Date().toISOString(), sizeBytes: bytes.byteLength, checksum, storagePath, metadata: { ...record.metadata, snapshotVerified: true } }; records = records.map((item) => item.id === id ? record : item);
    const automatic = records.filter((item) => item.trigger === 'automatic' && !item.protected).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); const stale = automatic.slice(dashboard.settings.retentionCount); for (const item of stale) { if (item.storagePath) await serverSupabase!.storage.from(backupBucket).remove([item.storagePath]); records = records.filter((candidate) => candidate.id !== item.id); }
    await persistRecords(records); await logBackup('backup_complete', record); return record;
  } catch (error) { record = { ...record, status: 'error', errorMessage: 'Ошибка при создании защищённого снимка данных.' }; await persistRecords(records.map((item) => item.id === id ? record : item)); await logBackup('backup_failed', record); throw error; }
}

export async function updateBackupSettings(input: Partial<BackupSettings>) { const current = parseSettings(await readSetting<unknown>(backupSettingsKey, defaultSettings)); const next = parseSettings({ ...current, ...input }); await writeSetting(backupSettingsKey, next); await logBackup('backup_settings_update', undefined, { settings: next }); return next; }
export async function updateBackupRecord(id: string, patch: Pick<BackupRecord, 'protected'>) { const dashboard = await getBackupDashboard(); const record = dashboard.records.find((item) => item.id === id); if (!record) throw new Error('Резервная копия не найдена.'); const next = { ...record, protected: Boolean(patch.protected) }; await persistRecords(dashboard.records.map((item) => item.id === id ? next : item)); await logBackup(next.protected ? 'backup_protect' : 'backup_unprotect', next); return next; }
export async function deleteBackup(id: string) { const dashboard = await getBackupDashboard(); const record = dashboard.records.find((item) => item.id === id); if (!record) throw new Error('Резервная копия не найдена.'); if (record.status === 'restoring') throw new Error('Копия используется для восстановления.'); if (record.storagePath && serverSupabase) { const result = await serverSupabase.storage.from(backupBucket).remove([record.storagePath]); if (result.error) throw new Error('Не удалось удалить архив из защищённого хранилища.'); } await persistRecords(dashboard.records.filter((item) => item.id !== id)); await logBackup('backup_delete', record); }
export async function createBackupDownloadUrl(id: string) { if (!hasBackupServiceRole() || !serverSupabase) throw new Error('Защищённое скачивание пока не настроено.'); const dashboard = await getBackupDashboard(); const record = dashboard.records.find((item) => item.id === id); if (!record?.storagePath || record.status !== 'ready') throw new Error('Эта копия недоступна для скачивания.'); const signed = await serverSupabase.storage.from(backupBucket).createSignedUrl(record.storagePath, 600, { download: `bullmet-backup-${record.createdAt.slice(0, 10)}.json` }); if (signed.error || !signed.data?.signedUrl) throw new Error('Не удалось подготовить временную ссылку на скачивание.'); await logBackup('backup_download', record, { severity: 'important' }); return signed.data.signedUrl; }

function flattenValue(value: unknown): string { if (value == null) return ''; if (typeof value === 'object') { try { return JSON.stringify(value); } catch { return String(value); } } return String(value); }
export function toCsv(data: unknown) { const rows = Array.isArray(data) ? data : [data]; const normalized: Record<string, unknown>[] = rows.map((row) => row && typeof row === 'object' ? row as Record<string, unknown> : { value: row }); const headers = Array.from(new Set(normalized.flatMap((row) => Object.keys(row)))); const escape = (value: unknown) => `"${flattenValue(value).replace(/"/g, '""')}"`; return [headers.map(escape).join(','), ...normalized.map((row) => headers.map((header) => escape(row[header])).join(','))].join('\n'); }
export function isExportType(value: string): value is ExportType { return exportTypes.includes(value as ExportType); }
