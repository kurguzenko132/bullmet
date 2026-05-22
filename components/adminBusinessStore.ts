import type { CartItem } from './cart';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

export type AdminOrderStatus = 'Новый' | 'В обработке' | 'Оплачен' | 'Доставляется' | 'Завершен' | 'Отменен';
export type AdminRequestStatus = 'Новая' | 'В работе' | 'Расчет отправлен' | 'Заказ принят' | 'Закрыта';

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
  items: CartItem[];
  total: number;
  status: AdminOrderStatus;
};

export type AdminRequest = {
  id: string;
  createdAt: string;
  customer: AdminCustomer;
  type: string;
  material: string;
  sizes?: string;
  comment: string;
  productSlug?: string;
  productTitle?: string;
  fileName?: string;
  status: AdminRequestStatus;
};

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

function orderFromDb(row: any): AdminOrder {
  return {
    id: row.id,
    createdAt: row.created_at,
    customer: row.customer ?? { name: '', phone: '' },
    delivery: row.delivery ?? 'Доставка по Беларуси',
    comment: row.comment ?? '',
    items: Array.isArray(row.items) ? row.items : [],
    total: Number(row.total ?? 0),
    status: row.status ?? 'Новый',
  };
}

function orderToDb(order: AdminOrder) {
  return {
    id: order.id,
    created_at: order.createdAt,
    customer: order.customer,
    delivery: order.delivery,
    comment: order.comment ?? '',
    items: order.items,
    total: order.total,
    status: order.status,
  };
}

function requestFromDb(row: any): AdminRequest {
  return {
    id: row.id,
    createdAt: row.created_at,
    customer: row.customer ?? { name: '', phone: '' },
    type: row.type,
    material: row.material,
    sizes: row.sizes ?? '',
    comment: row.comment ?? '',
    productSlug: row.product_slug ?? undefined,
    productTitle: row.product_title ?? undefined,
    fileName: row.file_name ?? undefined,
    status: row.status ?? 'Новая',
  };
}

function requestToDb(request: AdminRequest) {
  return {
    id: request.id,
    created_at: request.createdAt,
    customer: request.customer,
    type: request.type,
    material: request.material,
    sizes: request.sizes ?? '',
    comment: request.comment,
    product_slug: request.productSlug ?? null,
    product_title: request.productTitle ?? null,
    file_name: request.fileName ?? null,
    status: request.status,
  };
}

export function readAdminOrders() {
  return readList<AdminOrder>(ORDERS_STORAGE_KEY, demoOrders);
}

export async function readAdminOrdersAsync() {
  const localOrders = readStoredList<AdminOrder>(ORDERS_STORAGE_KEY);
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
  writeAdminOrders([order, ...orders]);
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
}

export function updateAdminOrderStatus(id: string, status: AdminOrderStatus) {
  const orders = readAdminOrders().map((order) => order.id === id ? { ...order, status } : order);
  writeAdminOrders(orders);
  return orders;
}

export async function updateAdminOrderStatusAsync(id: string, status: AdminOrderStatus) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('orders').update({ status }).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.warn('Supabase update order fallback to localStorage:', error);
    }
  }
  return updateAdminOrderStatus(id, status);
}

export function readAdminRequests() {
  return readList<AdminRequest>(REQUESTS_STORAGE_KEY, demoRequests);
}

export async function readAdminRequestsAsync() {
  const localRequests = readStoredList<AdminRequest>(REQUESTS_STORAGE_KEY);
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
  writeAdminRequests([request, ...requests]);
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
}

export function updateAdminRequestStatus(id: string, status: AdminRequestStatus) {
  const requests = readAdminRequests().map((request) => request.id === id ? { ...request, status } : request);
  writeAdminRequests(requests);
  return requests;
}

export async function updateAdminRequestStatusAsync(id: string, status: AdminRequestStatus) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('requests').update({ status }).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.warn('Supabase update request fallback to localStorage:', error);
    }
  }
  return updateAdminRequestStatus(id, status);
}

export function makeOrderId() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function makeRequestId() {
  return `R-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(new Date(value));
}
