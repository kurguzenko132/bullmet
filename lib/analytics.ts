export type BullmetAnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

export function trackBullmetEvent(event: string, payload: BullmetAnalyticsPayload = {}) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('bullmet-analytics-event', { detail: { event, payload, at: new Date().toISOString() } }));
  const dataLayer = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
  if (Array.isArray(dataLayer)) dataLayer.push({ event, ...payload });
}
