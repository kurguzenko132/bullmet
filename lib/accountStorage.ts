type AccountStorageKind = 'cart' | 'favorites' | 'orders' | 'addresses' | 'notifications';

const keys: Record<AccountStorageKind, string> = {
  cart: 'bullmet_cart',
  favorites: 'bullmet_favorites',
  orders: 'bullmet_local_orders',
  addresses: 'bullmet_account_addresses',
  notifications: 'bullmet_account_notifications'
};

export function accountStorageKey(userId: string, kind: AccountStorageKind) {
  return `bullmet_account:${userId}:${kind}`;
}

function readList(key: string): Record<string, unknown>[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object') : [];
  } catch {
    return [];
  }
}

function readStringList(key: string) {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed.map(String).map((item) => item.trim()).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function writeList(key: string, value: Record<string, unknown>[]) {
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function itemKey(kind: 'cart' | 'favorites' | 'orders', item: Record<string, unknown>) {
  if (kind === 'cart') return `${String(item.slug || '')}::${String(item.size || '')}`;
  return String(item.id || item.slug || '');
}

function mergeItems(kind: 'cart' | 'favorites' | 'orders', saved: Record<string, unknown>[], guest: Record<string, unknown>[]) {
  const next = [...saved];
  for (const item of guest) {
    const key = itemKey(kind, item);
    if (!key) continue;
    const index = next.findIndex((current) => itemKey(kind, current) === key);
    if (index < 0) next.push(item);
    else if (kind === 'cart') next[index] = { ...next[index], quantity: Number(next[index].quantity || 0) + Number(item.quantity || 0) };
  }
  return next;
}

export function activateAccountStorage(userId: string) {
  const cart = mergeItems('cart', readList(accountStorageKey(userId, 'cart')), readList(keys.cart));
  const favorites = mergeItems('favorites', readList(accountStorageKey(userId, 'favorites')), readList(keys.favorites));
  const orders = mergeItems('orders', readList(accountStorageKey(userId, 'orders')), readList(keys.orders));
  const savedAddresses = readStringList(accountStorageKey(userId, 'addresses'));
  const legacyAddresses = readStringList(keys.addresses);
  const addresses = Array.from(new Set([...savedAddresses, ...legacyAddresses]));
  const notifications = window.localStorage.getItem(accountStorageKey(userId, 'notifications')) ?? window.localStorage.getItem(keys.notifications) ?? 'true';

  writeList(accountStorageKey(userId, 'cart'), cart);
  writeList(accountStorageKey(userId, 'favorites'), favorites);
  writeList(accountStorageKey(userId, 'orders'), orders);
  try { window.localStorage.setItem(accountStorageKey(userId, 'addresses'), JSON.stringify(addresses)); } catch {}
  try { window.localStorage.setItem(accountStorageKey(userId, 'notifications'), notifications); } catch {}

  writeList(keys.cart, cart);
  writeList(keys.favorites, favorites);
  writeList(keys.orders, orders);
  try {
    window.localStorage.removeItem(keys.addresses);
    window.localStorage.removeItem(keys.notifications);
  } catch {}
}

export function persistAccountStorage(userId: string, clearActive = false) {
  writeList(accountStorageKey(userId, 'cart'), readList(keys.cart));
  writeList(accountStorageKey(userId, 'favorites'), readList(keys.favorites));
  writeList(accountStorageKey(userId, 'orders'), readList(keys.orders));
  if (clearActive) {
    try {
      window.localStorage.removeItem(keys.cart);
      window.localStorage.removeItem(keys.favorites);
      window.localStorage.removeItem(keys.orders);
    } catch {}
  }
}

export function readAccountAddresses(userId: string) {
  return readStringList(accountStorageKey(userId, 'addresses'));
}

export function writeAccountAddresses(userId: string, addresses: string[]) {
  try { window.localStorage.setItem(accountStorageKey(userId, 'addresses'), JSON.stringify(addresses.filter(Boolean))); } catch {}
}

export function readAccountNotifications(userId: string) {
  try { return window.localStorage.getItem(accountStorageKey(userId, 'notifications')) !== 'false'; } catch { return true; }
}

export function writeAccountNotifications(userId: string, enabled: boolean) {
  try { window.localStorage.setItem(accountStorageKey(userId, 'notifications'), String(enabled)); } catch {}
}
