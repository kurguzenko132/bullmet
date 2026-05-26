'use client';

import { isSupabaseConfigured, supabase } from './supabaseClient';

export type AdminNotificationType = 'order' | 'request' | 'review' | 'system';
export type AdminNotificationStatus = 'unread' | 'read';

export type AdminNotification = {
  id: string;
  type: AdminNotificationType;
  title: string;
  body: string;
  href: string;
  status: AdminNotificationStatus;
  payload?: Record<string, unknown> | null;
  createdAt: string;
  readAt?: string | null;
};

export type TelegramEventPayload = {
  type: AdminNotificationType | 'test';
  title: string;
  body: string;
  href?: string;
  payload?: Record<string, unknown> | null;
};

const LOCAL_NOTIFICATIONS_KEY = 'bullmet-admin-notifications';
const NOTIFICATIONS_UPDATED_EVENT = 'bullmet-admin-notifications-updated';

function makeId(prefix = 'N') {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
}

function readLocalNotifications(): AdminNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_NOTIFICATIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeNotification) : [];
  } catch {
    return [];
  }
}

function writeLocalNotifications(items: AdminNotification[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
}

function normalizeNotification(row: Partial<AdminNotification> & Record<string, any>): AdminNotification {
  return {
    id: String(row.id || makeId()),
    type: (row.type as AdminNotificationType) || 'system',
    title: String(row.title || 'Уведомление'),
    body: String(row.body || ''),
    href: String(row.href || '/admin'),
    status: row.status === 'read' ? 'read' : 'unread',
    payload: row.payload && typeof row.payload === 'object' ? row.payload : null,
    createdAt: String(row.createdAt || row.created_at || new Date().toISOString()),
    readAt: row.readAt || row.read_at || null,
  };
}

function notificationToDb(notification: AdminNotification) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    href: notification.href,
    status: notification.status,
    payload: notification.payload ?? {},
    created_at: notification.createdAt,
    read_at: notification.readAt ?? null,
  };
}

function sortNotifications(items: AdminNotification[]) {
  return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function subscribeAdminNotifications(callback: () => void) {
  if (typeof window === 'undefined') return () => undefined;
  const handler = () => callback();
  window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

export async function readAdminNotificationsAsync(limit = 80): Promise<AdminNotification[]> {
  const localItems = readLocalNotifications();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('id,type,title,body,href,status,payload,created_at,read_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      const dbItems = Array.isArray(data) ? data.map((row) => normalizeNotification(row as any)) : [];
      const merged = new Map<string, AdminNotification>();
      localItems.forEach((item) => merged.set(item.id, item));
      dbItems.forEach((item) => merged.set(item.id, item));
      const next = sortNotifications(Array.from(merged.values())).slice(0, limit);
      writeLocalNotifications(next);
      return next;
    } catch (error) {
      console.warn('Admin notifications fallback to localStorage:', error);
    }
  }

  return sortNotifications(localItems).slice(0, limit);
}

export async function createAdminNotification(input: Omit<AdminNotification, 'id' | 'status' | 'createdAt' | 'readAt'> & { id?: string }) {
  const notification: AdminNotification = {
    id: input.id || makeId('N'),
    type: input.type,
    title: input.title,
    body: input.body,
    href: input.href,
    payload: input.payload ?? null,
    status: 'unread',
    createdAt: new Date().toISOString(),
    readAt: null,
  };

  const localNext = sortNotifications([notification, ...readLocalNotifications().filter((item) => item.id !== notification.id)]).slice(0, 120);
  writeLocalNotifications(localNext);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .upsert(notificationToDb(notification), { onConflict: 'id' });
      if (error) throw error;
    } catch (error) {
      console.warn('Supabase admin_notifications insert failed:', error);
    }
  }

  await sendTelegramNotification({
    type: notification.type,
    title: notification.title,
    body: notification.body,
    href: notification.href,
    payload: notification.payload,
  });

  return notification;
}

export async function markAdminNotificationReadAsync(id: string) {
  const readAt = new Date().toISOString();
  const localNext = readLocalNotifications().map((item) => item.id === id ? { ...item, status: 'read' as const, readAt } : item);
  writeLocalNotifications(localNext);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ status: 'read', read_at: readAt })
        .eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.warn('Supabase admin_notifications mark read failed:', error);
    }
  }

  return sortNotifications(localNext);
}

export async function markAllAdminNotificationsReadAsync() {
  const readAt = new Date().toISOString();
  const localNext = readLocalNotifications().map((item) => ({ ...item, status: 'read' as const, readAt: item.readAt ?? readAt }));
  writeLocalNotifications(localNext);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ status: 'read', read_at: readAt })
        .eq('status', 'unread');
      if (error) throw error;
    } catch (error) {
      console.warn('Supabase admin_notifications mark all read failed:', error);
    }
  }

  return sortNotifications(localNext);
}

export async function sendTelegramNotification(payload: TelegramEventPayload) {
  if (typeof window === 'undefined') return;

  try {
    await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.warn('Telegram notification request failed:', error);
  }
}

export async function createOrderNotification(order: {
  id: string;
  total?: number;
  customer?: { name?: string; phone?: string; email?: string };
  items?: Array<{ title?: string; quantity?: number }>;
}) {
  try {
    const firstItem = order.items?.[0]?.title || 'Товары из корзины';
    const itemsCount = order.items?.reduce((sum, item) => sum + Number(item.quantity || 1), 0) || order.items?.length || 0;
    return await createAdminNotification({
      type: 'order',
      title: `Новый заказ #${order.id}`,
      body: `${order.customer?.name || order.customer?.phone || 'Клиент'} · ${firstItem}${itemsCount ? ` · ${itemsCount} шт.` : ''}${order.total ? ` · ${order.total} BYN` : ''}`,
      href: '/admin/orders',
      payload: { orderId: order.id, total: order.total, customer: order.customer },
    });
  } catch (error) {
    console.warn('Order notification failed:', error);
    return null;
  }
}

export async function createRequestNotification(request: {
  id: string;
  kind?: string;
  type?: string;
  productTitle?: string;
  customer?: { name?: string; phone?: string; email?: string };
}) {
  try {
    const isQuickOrder = request.kind === 'quick_order';
    return await createAdminNotification({
      type: 'request',
      title: isQuickOrder ? `Быстрый заказ ${request.id}` : `Новая заявка ${request.id}`,
      body: `${request.customer?.name || request.customer?.phone || 'Клиент'} · ${request.productTitle || request.type || 'Расчет'}`,
      href: '/admin/requests',
      payload: { requestId: request.id, kind: request.kind, type: request.type, customer: request.customer },
    });
  } catch (error) {
    console.warn('Request notification failed:', error);
    return null;
  }
}

export async function createReviewNotification(review: {
  product_slug: string;
  user_name?: string | null;
  user_email?: string | null;
  rating?: number;
}) {
  try {
    return await createAdminNotification({
      type: 'review',
      title: 'Новый отзыв на модерации',
      body: `${review.user_name || review.user_email || 'Покупатель'} · ${review.rating || 5}/5 · ${review.product_slug}`,
      href: '/admin/reviews',
      payload: { productSlug: review.product_slug, userEmail: review.user_email, rating: review.rating },
    });
  } catch (error) {
    console.warn('Review notification failed:', error);
    return null;
  }
}
