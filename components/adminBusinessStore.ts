'use client';

import type { CartItem } from './cart';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { createOrderNotification, createRequestNotification } from '../lib/adminNotifications';

export type AdminOrderStatus =
  | 'Новый'
  | 'В обработке'
  | 'Ожидает оплаты'
  | 'Оплачен'
  | 'Изготавливается'
  | 'Готов к выдаче'
  | 'Доставляется'
  | 'Завершен'
  | 'Отменен';

export type AdminRequestStatus =
  | 'Новая'
  | 'В работе'
  | 'Ожидает клиента'
  | 'Расчет отправлен'
  | 'Заказ принят'
  | 'Изготавливается'
  | 'Готово'
  | 'Закрыта'
  | 'Отменена';

export type AdminRequestKind = 'calculation' | 'quick_order' | 'contact' | 'service';

export type AdminCustomer = {
  name: string;
  phone: string;
  email?: string;
  city?: string;
};

export type AdminOrder = {
  id: string;
  createdAt: string;
  customer: AdminCustomer;
  delivery: 'Доставка по Беларуси' | 'Самовывоз';
  comment?: string;
  adminNote?: string;
  items: CartItem[];
  total: number;
  status: AdminOrderStatus;
};

export type AdminRequest = {
  id: string;
  createdAt: string;
  customer: AdminCustomer;
  kind?: AdminRequestKind;
  contactMethod?: string;
  type: string;
  material: string;
  sizes?: string;
  comment: string;
  adminNote?: string;
  productSlug?: string;
  productTitle?: string;
  productImage?: string;
  productPrice?: number;
  quantity?: number;
  fileName?: string;
  fileUrls?: string[];
  status: AdminRequestStatus;
};

export const ORDER_STATUSES: AdminOrderStatus[] = ['Новый', 'В обработке', 'Ожидает оплаты', 'Оплачен', 'Изготавливается', 'Готов к выдаче', 'Доставляется', 'Завершен', 'Отменен'];
export const REQUEST_STATUSES: AdminRequestStatus[] = ['Новая', 'В работе', 'Ожидает клиента', 'Расчет отправлен', 'Заказ принят', 'Изготавливается', 'Готово', 'Закрыта', 'Отменена'];

export const ORDERS_STORAGE_KEY = 'bullmet-admin-orders';
export const REQUESTS_STORAGE_KEY = 'bullmet-admin-requests';

const demoOrders: AdminOrder[] = [];
const demoRequests: AdminRequest[] = [];

function readList<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function readStoredList<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mergeById<T extends { id: string }>(primary: T[], secondary: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of secondary) map.set(item.id, item);
  for (const item of primary) map.set(item.id, item);
  return Array.from(map.values()).sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}

function writeList<T>(key: string, items: T[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(items));
  window.dispatchEvent(new Event(`${key}-updated`));
}

function normalizeOrderStatus(status: string | null | undefined): AdminOrderStatus {
  if (ORDER_STATUSES.includes(status as AdminOrderStatus)) return status as AdminOrderStatus;
  return 'Новый';
}

function normalizeRequestStatus(status: string | null | undefined): AdminRequestStatus {
  if (REQUEST_STATUSES.includes(status as AdminRequestStatus)) return status as AdminRequestStatus;
  return 'Новая';
}

function orderFromDb(row: any): AdminOrder {
  return {
    id: row.id,
    createdAt: row.created_at,
    customer: row.customer ?? { name: '', phone: '' },
    delivery: row.delivery ?? 'Доставка по Беларуси',
    comment: row.comment ?? '',
    adminNote: row.admin_note ?? '',
    items: Array.isArray(row.items) ? row.items : [],
    total: Number(row.total ?? 0),
    status: normalizeOrderStatus(row.status),
  };
}

function orderToDb(order: AdminOrder) {
  return {
    id: order.id,
    created_at: order.createdAt,
    customer: order.customer,
    delivery: order.delivery,
    comment: order.comment ?? '',
    admin_note: order.adminNote ?? '',
    items: order.items,
    total: order.total,
    status: order.status,
  };
}

function orderPatchToDb(patch: Partial<AdminOrder>) {
  const payload: Record<string, unknown> = {};
  if (patch.status !== undefined) payload.status = patch.status;
  if (patch.adminNote !== undefined) payload.admin_note = patch.adminNote;
  if (patch.comment !== undefined) payload.comment = patch.comment;
  if (patch.customer !== undefined) payload.customer = patch.customer;
  if (patch.delivery !== undefined) payload.delivery = patch.delivery;
  if (patch.items !== undefined) payload.items = patch.items;
  if (patch.total !== undefined) payload.total = patch.total;
  return payload;
}

function requestFromDb(row: any): AdminRequest {
  return {
    id: row.id,
    createdAt: row.created_at,
    customer: row.customer ?? { name: '', phone: '' },
    kind: row.kind ?? 'calculation',
    contactMethod: row.contact_method ?? undefined,
    type: row.type,
    material: row.material,
    sizes: row.sizes ?? '',
    comment: row.comment ?? '',
    adminNote: row.admin_note ?? '',
    productSlug: row.product_slug ?? undefined,
    productTitle: row.product_title ?? undefined,
    productImage: row.product_image ?? undefined,
    productPrice: row.product_price == null ? undefined : Number(row.product_price),
    quantity: row.quantity == null ? undefined : Number(row.quantity),
    fileName: row.file_name ?? undefined,
    fileUrls: Array.isArray(row.file_urls) ? row.file_urls : [],
    status: normalizeRequestStatus(row.status),
  };
}

function requestToDb(request: AdminRequest) {
  return {
    id: request.id,
    created_at: request.createdAt,
    customer: request.customer,
    kind: request.kind ?? 'calculation',
    contact_method: request.contactMethod ?? null,
    type: request.type,
    material: request.material,
    sizes: request.sizes ?? '',
    comment: request.comment,
    admin_note: request.adminNote ?? '',
    product_slug: request.productSlug ?? null,
    product_title: request.productTitle ?? null,
    product_image: request.productImage ?? null,
    product_price: request.productPrice ?? null,
    quantity: request.quantity ?? null,
    file_name: request.fileName ?? null,
    file_urls: request.fileUrls ?? [],
    status: request.status,
  };
}

function requestPatchToDb(patch: Partial<AdminRequest>) {
  const payload: Record<string, unknown> = {};
  if (patch.status !== undefined) payload.status = patch.status;
  if (patch.adminNote !== undefined) payload.admin_note = patch.adminNote;
  if (patch.comment !== undefined) payload.comment = patch.comment;
  if (patch.customer !== undefined) payload.customer = patch.customer;
  if (patch.kind !== undefined) payload.kind = patch.kind;
  if (patch.contactMethod !== undefined) payload.contact_method = patch.contactMethod;
  if (patch.type !== undefined) payload.type = patch.type;
  if (patch.material !== undefined) payload.material = patch.material;
  if (patch.sizes !== undefined) payload.sizes = patch.sizes;
  if (patch.productSlug !== undefined) payload.product_slug = patch.productSlug;
  if (patch.productTitle !== undefined) payload.product_title = patch.productTitle;
  if (patch.productImage !== undefined) payload.product_image = patch.productImage;
  if (patch.productPrice !== undefined) payload.product_price = patch.productPrice;
  if (patch.quantity !== undefined) payload.quantity = patch.quantity;
  if (patch.fileName !== undefined) payload.file_name = patch.fileName;
  if (patch.fileUrls !== undefined) payload.file_urls = patch.fileUrls;
  return payload;
}

export function readAdminOrders() {
  return readList<AdminOrder>(ORDERS_STORAGE_KEY, demoOrders).map((order) => ({ ...order, status: normalizeOrderStatus(order.status), adminNote: order.adminNote ?? '' }));
}

export async function readAdminOrdersAsync() {
  const localOrders = readStoredList<AdminOrder>(ORDERS_STORAGE_KEY).map((order) => ({ ...order, status: normalizeOrderStatus(order.status), adminNote: order.adminNote ?? '' }));
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      const dbOrders = Array.isArray(data) ? data.map(orderFromDb) : [];
      const merged = mergeById(dbOrders, localOrders);
      writeAdminOrders(merged);
      return merged;
    } catch (error) {
      console.warn('Supabase orders fallback to localStorage:', error);
      return localOrders;
    }
  }
  return localOrders;
}

export function writeAdminOrders(items: AdminOrder[]) {
  writeList(ORDERS_STORAGE_KEY, items);
}

export function addAdminOrder(order: AdminOrder) {
  const orders = readStoredList<AdminOrder>(ORDERS_STORAGE_KEY).filter((item) => item.id !== order.id);
  writeAdminOrders([{ ...order, adminNote: order.adminNote ?? '' }, ...orders]);
}

export async function addAdminOrderAsync(order: AdminOrder) {
  addAdminOrder(order);
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('orders').upsert(orderToDb(order), { onConflict: 'id' });
      if (error) throw error;
    } catch (error) {
      console.warn('Supabase add order fallback to localStorage:', error);
    }
  }
  await createOrderNotification(order);
}

export function updateAdminOrder(id: string, patch: Partial<AdminOrder>) {
  const orders = readAdminOrders().map((order) => order.id === id ? { ...order, ...patch } : order);
  writeAdminOrders(orders);
  return orders;
}

export async function updateAdminOrderAsync(id: string, patch: Partial<AdminOrder>) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('orders').update(orderPatchToDb(patch)).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.warn('Supabase update order fallback to localStorage:', error);
    }
  }
  return updateAdminOrder(id, patch);
}

export function updateAdminOrderStatus(id: string, status: AdminOrderStatus) {
  return updateAdminOrder(id, { status });
}

export async function updateAdminOrderStatusAsync(id: string, status: AdminOrderStatus) {
  return updateAdminOrderAsync(id, { status });
}

export function readAdminRequests() {
  return readList<AdminRequest>(REQUESTS_STORAGE_KEY, demoRequests).map((request) => ({ ...request, status: normalizeRequestStatus(request.status), adminNote: request.adminNote ?? '' }));
}

export async function readAdminRequestsAsync() {
  const localRequests = readStoredList<AdminRequest>(REQUESTS_STORAGE_KEY).map((request) => ({ ...request, status: normalizeRequestStatus(request.status), adminNote: request.adminNote ?? '' }));
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('requests').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      const dbRequests = Array.isArray(data) ? data.map(requestFromDb) : [];
      const merged = mergeById(dbRequests, localRequests);
      writeAdminRequests(merged);
      return merged;
    } catch (error) {
      console.warn('Supabase requests fallback to localStorage:', error);
      return localRequests;
    }
  }
  return localRequests;
}

export function writeAdminRequests(items: AdminRequest[]) {
  writeList(REQUESTS_STORAGE_KEY, items);
}

export function addAdminRequest(request: AdminRequest) {
  const requests = readStoredList<AdminRequest>(REQUESTS_STORAGE_KEY).filter((item) => item.id !== request.id);
  writeAdminRequests([{ ...request, adminNote: request.adminNote ?? '' }, ...requests]);
}

export async function addAdminRequestAsync(request: AdminRequest) {
  addAdminRequest(request);
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('requests').upsert(requestToDb(request), { onConflict: 'id' });
      if (error) throw error;
    } catch (error) {
      console.warn('Supabase add request fallback to localStorage:', error);
    }
  }
  await createRequestNotification(request);
}

export function updateAdminRequest(id: string, patch: Partial<AdminRequest>) {
  const requests = readAdminRequests().map((request) => request.id === id ? { ...request, ...patch } : request);
  writeAdminRequests(requests);
  return requests;
}

export async function updateAdminRequestAsync(id: string, patch: Partial<AdminRequest>) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('requests').update(requestPatchToDb(patch)).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.warn('Supabase update request fallback to localStorage:', error);
    }
  }
  return updateAdminRequest(id, patch);
}

export function updateAdminRequestStatus(id: string, status: AdminRequestStatus) {
  return updateAdminRequest(id, { status });
}

export async function updateAdminRequestStatusAsync(id: string, status: AdminRequestStatus) {
  return updateAdminRequestAsync(id, { status });
}

export function makeOrderId() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function makeRequestId(prefix = 'R') {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
}

export function getRequestKindLabel(kind?: AdminRequestKind) {
  if (kind === 'quick_order') return 'Быстрый заказ';
  if (kind === 'contact') return 'Контактная форма';
  if (kind === 'service') return 'Заявка по услуге';
  return 'Расчет';
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(new Date(value));
}
